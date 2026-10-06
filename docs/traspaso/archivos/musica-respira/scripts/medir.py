#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PACE · Respira · medir.py — measures background-music candidates against the brief.

USAGE
    python3 -I medir.py OUT.json AUDIO [AUDIO ...]        (an AUDIO may be a directory)
    options:  --voice-dir DIR   the six cue recordings (default /home/claude/Pace_app/app/breathe/voz)
              --jobs N          worker processes (default min(4, cpus))

OUTPUT  OUT.json = {"meta": {analysis_sr, app_target_body_rms_dbfs, cents_440_to_432, target_cycles_s,
        voice_dir, voice_files[{file, speech_frames, speech_rms_dbfs}], thresholds, elapsed_s},
        "tracks": [one object per file, fields below]}. A file that fails to decode or analyse gets
        {file, path, error, traceback} instead, and the batch carries on.
        resumen.py turns OUT.json into a markdown table.

Audio files are treated as untrusted data: they are only ever passed to ffmpeg/ffprobe as
absolute-path arguments (no shell), never imported or executed. Run with `python3 -I`.

SIGNALS
    stereo_native  ffmpeg decode at the file's own rate, 2 channels (a mono file is duplicated by
                   us, not by ffmpeg, whose mono->stereo upmix is -3 dB). Used for: sample peak,
                   mono compatibility, band percentages (so the >8 kHz band is complete), body RMS.
    mono_native    (L+R)/2 of stereo_native: what the MONO 64 kbps deliverable will contain.
    mono22         ffmpeg decode at 22050 Hz, then (L+R)/2: the analysis signal for everything
                   else (envelopes, STFT, chroma, onsets, novelty, loop search). Nyquist 11.025 kHz.
    body           the track minus its leading/trailing fades: the span between the first and last
                   10 ms frame whose RMS is within 12 dB of the median 10 ms RMS (as the repo's s177
                   bench). Every "inside the track" metric is measured in the body, so a fade-in
                   does not read as a +150 dB attack (s177's first bug).
    STFT           Hann 2048 (92.9 ms) / hop 441 (20 ms) on mono22 body. log-mel: 48 HTK bands
                   40 Hz-10.5 kHz, "soft-floored" dB: 10*log10(1 + P/Pref), Pref = 60 dB below
                   the 99th-percentile band power, so bands far below the music (codec hiss)
                   contribute ~0 instead of noisy dB swings.

FIELDS — one JSON object per file, grouped as below. WHY each matters for the brief's rules.
 format
    duration_s, channels, sample_rate, bitrate_kbps, codec, size_bytes — provenance.
    size_at_64kbps_mono_mb   MiB (2^20, as s177) the track would weigh as the MONO 64 kbps
                             deliverable: the app ships it, so length costs bytes.
 levels
    peak_dbfs        sample peak of the stereo file.          rms_dbfs  RMS of mono_native, whole file.
    body_rms_dbfs    RMS of mono_native inside the body: the app levels music by RMS (s177 decision),
                     so this sets the gain the app will apply.
    body_start_s, body_end_s, body_duration_s   where the body is.
    crest_db         peak/RMS of the mono body: high crest = transient material (rule 1).
    integrated_lufs, loudness_range_lu   ffmpeg ebur128 on the file as-is. LRA is the
                     standard "how much does loudness move" figure (rule 4).
 spectrum (long-term average, Hann ~93 ms frames, Welch 50 % overlap, mono_native body)
    band_pct{<100,100-200,200-500,500-1k,1k-2k,2k-4k,4k-8k,>8k}   % of power per band.
    pct_below_200    energy that a laptop/phone speaker does not reproduce (s177: 82.6 % = inaudible).
    pct_200_2k       rule 2: "most energy between 200 Hz and 2 kHz".
    pct_above_2k     rule 3: the consonants of the voice cue live there.
    a_weighting_loss_db  unweighted minus A-weighted level of the same spectrum: a proxy for
                     how much quieter it sounds than its RMS says (s177: 12.7 dB inaudible, 7.4 ok).
    spectral_centroid_hz  mean per-frame centroid (mono22, so capped at 11 kHz): brightness.
 voice  (competition with the PACE voice cue)
    The six cue files are decoded, speech frames kept (frame energy within 30 dB of the file's
    loudest frame), their mean power spectra averaged, each at its own level (app plays them at
    gain 1). The music's long-term body spectrum (same STFT, mono22) is scaled by the app gain, so
    both spectra share window and resolution. VMR = level of the voice WHILE IT SPEAKS over the
    music's average level at the app gain.
    app_gain, app_gain_db     gain that brings body RMS to the app target of -36 dBFS.
    vmr_bands_db{160..8000}   voice-to-music ratio per 1/3 octave band (nominal centres).
    vmr_200_1k_db             power-summed VMR over 200-1000 Hz (vowel body).
    vmr_1k_4k_db              power-summed VMR over 1-4 kHz (consonants: intelligibility).
    vmr_2k_8k_db              power-summed VMR over 2-8 kHz (fricatives, the /ks/ of "exhala"). 1-4 kHz is
                              dominated by its 1-2.5 kHz bands: a hiss 12 dB under the pad, high-passed at
                              3 kHz, took the 4-8 kHz bands from ~90 to ~15 dB and moved vmr_1k_4k by 0.07.
    worst_band_hz, worst_band_vmr_db   the band where the voice is closest to being masked.
 attacks  (rule 1: an attack is confused with the phase-change cue)
    onset strength   half-wave-rectified log-mel spectral flux (rise over 40 ms), per frame the mean
                     of the largest ONSET_TOP_FRAC (1/6) of the band rises: a plain mean over 48 bands
                     dilutes a single note (3-6 bands rising 15 dB read ~1.5 dB, under stationary
                     noise's own peaks); the top sixth keeps a note ~2x above noise, a hit is broadband.
    onsets_per_min   peaks of the onset strength inside the body above
                     max(ONSET_MIN_FLUX_DB, local median(3 s) + ONSET_K * robust sigma), robust sigma
                     = 1.4826 * global MAD; ONSET_K = 5 means 5 robust sigmas over the local baseline.
                     Peaks >= 150 ms apart.  n_onsets, onset_times_s (first 20, file time),
                     onset_flux_median_db / _sigma_db / _max_db (context for the threshold).
    max_rise_db_50ms, max_rise_at_s  largest rise of the 10 ms RMS envelope over 50 ms inside the
                     body (s177's "ataque"), skipping the first and last RISE_EDGE_S of the body:
                     the body starts at a frame 12 dB under the median, so its first 50 ms would
                     report the file's own start as an attack (the loop is cut elsewhere anyway).
    max_rise_db_50ms_smooth, max_rise_smooth_at_s  the same on a 30 ms RMS window (10 ms hop). A
                     10 ms window is shorter than one period below 100 Hz, so a static low chord's
                     beating ripples it by 8-9 dB with no attack at all (measured on synthetic
                     chords); the 30 ms one reads ~1-2 dB there and still ~9-18 dB on real hits.
                     rule_percussion uses the smooth one.
    hf_transients_per_min  same detector on the mel bands above 2 kHz only (clicks, breath, hats).
 flatness (rule 4)
    st_range_db      p95 - p5 of the 1 s RMS (dB) in the body (percentiles so one click cannot set it).
    drift_db_per_min slope of a linear fit of the 1 s RMS dB: a slow crescendo/decrescendo.
    max_swell_db, max_swell_at_s   largest |3 s RMS - running 30 s median| (signed): a swell/drop.
    st_range_detided_db, tide_period_s   when the level envelope has a periodicity (r >= PERIODIC_R):
                     the range after subtracting the envelope folded at that period. A deliberate
                     Balance tide moves the three numbers above; this says whether the track is flat
                     APART from its tide (synthetic +-3 dB 10 s tide: 5.9 dB raw, 0.6 dB detided).
 fades (rule 5 context; post-production cuts loop points, so fades are informative only)
    fade_in_db, fade_out_db   first/last 1 s RMS of the file minus body RMS (very negative = fade).
    lead_silence_s, tail_silence_s   time before the 10 ms envelope first/last exceeds -50 dBFS.
 periodicity (tides)  {envelope, centroid}
    envelope = 100 ms RMS in dB, body only; centroid = spectral centroid per 100 ms (catches a
    filter-only tide that does not move the level). Both detrended: linear detrend, then a zero-phase
    high-pass at 1/60 Hz (|H|^2 of a 2nd-order Butterworth) applied in the DCT domain (keeps periods
    <= 30 s, removes slow drift that would inflate r). Not sosfiltfilt: its short padding left
    start-up transients that ADDED a slow bump (static pad: r = 0.46 at 2 s). Not a moving average:
    its edges biased a 10 s tide to 10.02 s.
    Autocorrelation is Pearson-normalised PER LAG (each lag correlates only the overlapping parts,
    with their own means/variances) for lags 1-30 s at 0.1 s resolution.
    top_peaks       up to 3 local maxima [period_s, r, prominence] with prominence >= PERIOD_MIN_PROM
                    (a smooth envelope's ACF decays from lag 0 with wiggles that are maxima at high r
                    but not periods), parabolic-refined, by r.
    r_at_targets    {cycle_s: r at exactly that lag} for the exercise cycles 2..28 s (signed: a
                    tide of period 2c reads ~-1 at c). Not a window max, which inflated near misses.
    prom_at_targets {cycle_s: prominence of the best ACF local max within +-0.25 s, 0 if none}: a
                    high r with ~0 prominence is decay from lag 0, not a cycle.
    acf_period_s    the shortest ACF peak with r >= 0.85 * best peak (avoids picking 2P), refined by
                    parabolic interpolation and by its multiples k*P within 30 s (weighted k*r).
    dominant_period_s  final estimate: peak of the Hann-windowed DFT of the whole series within
                    +-2 % of acf_period_s (other periodic components pull the ACF peak, not the DFT
                    bin; a synthetic exact 10 s tide reads 10.000 s). dominant_r = ACF r there.
    dominant_depth  peak-to-peak of the track folded at that period (dB for envelope, Hz for
                    centroid): how deep the tide is.
    period_quarters_s, r_quarters, period_stability_s   the same period searched (+-25 %) in each
                    quarter of the body; std of the quarter periods. A real tide is stable.
    WHY: Balance may carry ONE tide of exactly 10 or 12 s; any other periodicity fights the breath.
 pulse
    pulse_r         max Pearson r of the onset-strength (minus its 1 s moving average) autocorrelation
                    at an interior local maximum between 0.25 and 2 s (0 if none): how REGULAR.
    pulse_bpm, pulse_period_s   where it is. Equilibrio/Pranayama must have no pulse.
    pulse_flux_rms_db  RMS of that high-passed onset strength: how LOUD the pulsation is. A static
                    chord's partial beating is perfectly periodic (r up to 0.98) yet ~0.05-0.7 dB;
                    note/hit pulses measure >= 1.6 dB.
    pulse_strength  pulse_r x audibility, audibility ramping 0 -> 1 as the flux RMS goes from
                    PULSE_MIN_FLUX_DB to PULSE_FULL_FLUX_DB. A depth-blind r called a static
                    synthetic pad (0.05 dB of flux ripple) a 0.5 pulse and a static minor chord 0.95.
 tonality (rule 6)
    1 s Hann frames, hop 0.5 s, zero-padded to 32768 (0.67 Hz bins), mono22 body.
    "whitened" log magnitude W = dB - median(dB over +-15 bins): height above the local spectral
    floor, so tonal peaks count and noise does not.
    peaks           local maxima 40-2000 Hz with W >= 10 dB, within 50 dB of the frame max, not a
                    window sidelobe (>= max within +-4 Hz - 25 dB), parabolic-refined; kept only if
                    PERSISTENT (a peak within 25 cents in the previous or next frame: frames overlap by
                    half, so a note shows twice and a noise peak rarely does).
    note peaks      persistent peaks that are NOT a harmonic: a peak within FOLD_TOL_CENTS (15) of
                    k*f (k = 2..FOLD_MAX_K = 16) of a lower peak at most 3 dB weaker is a partial.
                    WHY: log weighting makes partials 3, 5, 7, 11, 13 of ONE drone read as a fifth,
                    a major third, a flat 7th, C# and D#; harmony and tuning are judged on notes.
    tuning_offset_cents   circular mean (weight = W, capped 40) of the note peaks >= 80 Hz modulo
                    100 cents vs A=440 (harmonics 5, 7, 11 sit -14, -31, -49 cents off the grid and
                    biased it by -6 cents before). Synthetic: 440 -> -0.01, 432 -> -31.75.
    tuning_offset_vs_432_cents   the same vs the A=432 grid (= offset_440 + 31.77, wrapped).
    tuning_grid, tuning_residual_cents   the nearer of the two acceptable grids ('440': post-production
                    shifts it -31.77 cents; '432': already at the app's tuning, do NOT shift) and the
                    offset from it. rule_key_G judges the residual: a G at 432 is the target, not a
                    32-cent error (every synthetic 432 pad used to warn).
    tuning_concentration  resultant length R (0..1): how much the peaks agree on one grid (tonal
                    tracks ~0.7-1.0, noise ~0.1).  n_peaks, n_persistent_peaks, n_note_peaks.
    chroma          (raw, as specified) 12 pitch classes Do..Si, normalised to max 1, bins 60-2000 Hz,
                    weight max(0, W - 6 dB), on the 440 grid shifted by tuning_offset_cents.
    chroma_fundamental  the same from note peaks >= 60 Hz (weight max(0, W - 6)).
    root_name, root_pc  argmax over r of a fifths-aware template on chroma_fundamental (raw chroma if
                    it is empty, see root_source): score(r) = c[r] + 0.5*c[r+7] + 0.2*max(c[r+3], c[r+4]).
                    root_name_raw = the same template on the raw chroma (partials skew it: a C major
                    triad of harmonic tones reads Mi raw, Do fundamental).
    root_confidence (best-second)/best score; runner_up_name; sol_score_rel = score(Sol)/best.
    note_presence   12 values: per 1 s frame, the loudest note peak of each pitch class relative to
                    the loudest root/fifth note peak within +-1 octave of it (register-local: a bass
                    root 10-20 dB over the pad must not hide the pad's third), amplitude ratio capped
                    at 1, averaged over frames that have a root or fifth. WHY: chroma_fundamental's weights saturate (W capped at 40 dB), so it
                    counts octave doublings: a third at the root's level beside a root voiced in three
                    octaves read 0.33, and synthetic Gm and G major both came out open_fifth.
    fifth_strength, minor_third_strength, major_third_strength  note_presence at root+7/+3/+4.
                    count_interval_strengths: the same on chroma_fundamental; raw_interval_strengths:
                    on the raw chroma (both context only).
    harmony_class   from note_presence: cluster (>= 6 pcs >= 0.5) | minor (m3 >= 0.35 and >= 1.5*M3)
                    | major (mirror) | ambiguous (both thirds, or another pc >= 0.5, or no notes) |
                    open_fifth (no third: root with fifth and/or octaves only — includes a bare root
                    drone).
    f0_hz, f0_note_432{name,octave,cents,exact_hz}, f0_note_440{...}   strongest peak 60-500 Hz of the
                    long-term spectrum (power mean of 131072-pt = 5.9 s Hann windows, hop half, whole
                    body), parabolic. s177 used ONE window at the centre, which on an evolving pad can
                    land where the fifth beats the root (v1-equilibrio: Mi3 there, La2 long-term).
    f0_window_agreement  fraction of those windows whose own strongest peak is within 50 cents of f0.
 harmony_motion (no melody, no chord progression)
    chroma_change_rate  mean cosine distance between consecutive 0.5 s raw chroma frames.
    harmonic_change_times_s, n_harmonic_segments, harmonic_changes_per_min   changepoints where the
                    cosine distance between the summed NOTE chroma of the 2 s before and the 2 s after
                    exceeds HARM_CHANGE_DIST (peaks >= 2 s apart; each side needs >= HARM_MIN_PEAKS
                    note peaks). segments = changepoints + 1. Note chroma because partials blur a
                    change: Gm <-> Eb every 8 s read 0 changes on raw chroma, 7/min on notes.
    melody_score    changes per minute of the dominant NOTE pitch class in 300-2000 Hz, root and
                    fifth excluded, counted between consecutive frames where it is salient (>= 0.5 of
                    the band max and >= 10 % of the band's p95), the new pc beats the previous one
                    in the current frame by MEL_SWITCH_RATIO AND has grown by that ratio and by
                    MEL_ENTRY_DB since the previous frame (weights are dB above the local floor, so
                    that is a 6 dB entry: two sustained chord tones trading places by a few dB are
                    not a melody).  n_melody_changes, melody_salient_frac.
 events (no isolated note events, no texture changes)
    novelty: 0.2 s log-mel blocks, LEVEL-NORMALISED (each block over its own total power: a pure
    level move — an amplitude tide, a swell — belongs to flatness/periodicity, not here) and
    LIFTERED (the NOVELTY_LIFTER = 6 lowest DCT coefficients across the 48 bands removed: the broad
    envelope, so a slow filter opening is a tide, not an event; a 10 s 750-3000 Hz sweep read 11
    events/min without it, 0 with it, while chimes and chord changes keep 90-100 % of their peak);
    self-similarity S = exp(-d^2 / (2*3^2)), d = RMS dB distance; Gaussian checkerboard kernel 4 s
    (2 s per side); novelty = 2 * v'Sv / (sum|v|)^2 in [-1, 1] (1 = a perfect cut). Events = peaks
    >= 2 s apart above the ABSOLUTE threshold NOVELTY_MIN. Not adaptive on purpose: in a track full
    of events the median/MAD rises with them and hides them (the shipping track measured 0 events
    with median + 5*MAD). S is in absolute dB terms, so a static texture sits near 0 (a 1.5 dB RMS
    change gives ~0.12, 3 dB ~0.39).
    novelty_events_per_min, n_novelty_events, novelty_event_times_s / _values (first 20),
    novelty_threshold, novelty_max, novelty_median, novelty_p90, novelty_robust_sigma (context: a
    track that changes continuously has median ~0.1-0.2 and saturates at ~15-20 events/min, i.e. one
    per kernel half-width; a static pad sits ~0.01-0.05).
 loop (rule 5)
    seam_similarity     cosine of the soft-floored log-mel of the first vs last 2 s of the body.
    seam_spectral_dist_db  std over bands of their dB difference (shape mismatch, level removed).
    seam_level_db       level of last 2 s minus first 2 s.
    best_loop_*         search start in [body_start, +30 s], end in [body_end - 40 s, body_end] at
                    0.1 s steps; compare the 1 s windows centred on start and end: distance
                    D = sqrt(shape_std_dB^2 + level_dB^2); best_loop_dist_db = min D,
                    best_loop_score = max(0, 1 - D/6) (1 = identical, 0 = >= 6 dB apart),
                    best_loop_chroma_sim = cosine of the raw chroma frames at both points.
    loop_tide_period_s, loop_tide_source, loop_tide_kept, loop_tide_cycles   when the envelope or
                    centroid has a clear tide (dominant_r >= LOOP_TIDE_MIN_R, prominent ACF peak, >= 3
                    periods in the body, depth >= 1 dB or >= 5 % of the mean centroid), only loops of a whole number of tide periods (within
                    max(0.1 s, LOOP_TIDE_TOL = 1 % of P): a 6 % depth error at most) are searched:
                    any other length plays one wrong-length tide cycle per loop (a 12 s tide looped
                    at 40 s joined a rising slope to a falling one). kept = False: none existed.
    best_loop_free_dist_db  the best D with no tide constraint: the difference is what keeping the
                    tide whole costs in seam match.
 vocals (no vocals/lyrics; heuristic)
    syllabic_ratio_db   mean modulation power density 2-8 Hz / 0.1-2 Hz of the 300-3400 Hz band's
                    10 ms envelope (normalised to its mean).  syllabic_mod_index  RMS of the 2-8 Hz
                    component of that normalised envelope (speech ~0.5; band noise ~0.06).
    vocal_like      mod_index >= VOC_MOD_INDEX and ratio >= VOC_RATIO_DB.
 mono (rule 7)
    lr_correlation  Pearson L/R in the body.   mono_sum_loss_db  RMS((L+R)/2) vs mean RMS(L,R):
                    0 dB identical channels, -3 dB uncorrelated, << -3 dB phase cancellation.
    mono_loss_bands_db{<200,200-2k,>2k}  the same per band (phase tricks are often band-limited).
 rules  {rule_*: {verdict: pass|warn|fail, reason}}  — thresholds in THRESHOLDS below:
    rule_percussion  (rise = max_rise_db_50ms_smooth; pulse = pulse_strength, already depth-weighted)
                     fail: rise > PERC_FAIL_RISE_DB or onsets/min > PERC_FAIL_ONSETS
                     or (pulse > PERC_FAIL_PULSE and onsets/min > PERC_WARN_ONSETS);
                     warn: rise > PERC_WARN_RISE_DB or onsets/min > PERC_WARN_ONSETS or
                     hf/min > PERC_WARN_HF or pulse > PERC_WARN_PULSE.
    rule_audible     fail: 200-2k < AUD_FAIL_200_2K % or <200 >= AUD_FAIL_BELOW200 % or
                     A-loss >= AUD_FAIL_AW_DB; warn: 200-2k < AUD_PASS_200_2K or <200 >= AUD_WARN_BELOW200
                     or A-loss >= AUD_WARN_AW_DB.
    rule_hf          fail: >2k > HF_FAIL_PCT or VMR 1-4k or 2-8k < HF_FAIL_VMR; warn: >2k > HF_WARN_PCT
                     or VMR 1-4k or 2-8k < HF_WARN_VMR.
    rule_flat        fail: range > FLAT_FAIL_RANGE or |swell| > FLAT_FAIL_SWELL or |drift| > FLAT_FAIL_DRIFT;
                     warn: the FLAT_WARN_* equivalents. Family-blind: when a level tide exists the
                     reason appends its period and the detided range, so Balance can be judged on it.
    rule_loop        fail: best loop D > LOOP_FAIL_DIST or body < LOOP_MIN_BODY_S; warn: D > LOOP_WARN_DIST
                     or no loop of whole tide cycles exists. Fades alone do not fail it: the brief says
                     post-production cuts the loop points, so what matters is that good ones exist
                     (fade_in_db / fade_out_db report them).
    rule_key_G       pass: root Sol, |tuning_residual_cents| <= KEY_WARN_TUNING (on the 440 OR the 432
                     grid), harmony not cluster (an 'ambiguous' third or a passing tone does not move
                     the tonal centre; root_confidence covers an unclear centre);
                     warn: root Sol with tuning/cluster doubts or root confidence < KEY_MIN_CONF, or
                     root not Sol but Sol's score within KEY_RUNNERUP_MARGIN of the best, or weak
                     tonality (tuning_concentration < KEY_MIN_CONC); fail otherwise.
    rule_mono        fail: any mono loss (total or band) < MONO_FAIL_DB (rho < -0.5);
                     warn: < MONO_WARN_DB (net anti-phase, rho < -0.1) or lr_correlation <
                     MONO_WARN_CORR (-0.1). Not "< 0": uncorrelated stereo (rho ~ 0, synthetic s18 read
                     -0.016) loses a uniform 3 dB that RMS levelling of the mono file absorbs; it does
                     not cancel anything.
    rule_no_melody   fail: melody > MEL_FAIL_PER_MIN or harmonic changes/min > HARM_FAIL_PER_MIN;
                     warn: melody > MEL_WARN_PER_MIN or harmonic changes/min > HARM_WARN_PER_MIN.
    rule_no_events   fail: novelty events/min > EV_FAIL_PER_MIN; warn: > EV_WARN_PER_MIN.
    rule_no_vocals   (extra) fail: vocal_like; warn: mod_index >= 0.75 * VOC_MOD_INDEX.
 timing_s  wall time spent on the file.

THRESHOLDS are principled defaults, not tuned on the candidates; a synthetic ground-truth pass
validates them. They are written into OUT.json (meta.thresholds) so every verdict is reproducible.
"""

import argparse
import json
import math
import multiprocessing
import os
import re
import subprocess
import sys
import time
import traceback
from concurrent.futures import ProcessPoolExecutor

import numpy as np
from scipy import fft as sfft, ndimage, signal

# ───────────────────────────── constants ─────────────────────────────
SR = 22050
VOICE_DIR_DEFAULT = '/home/claude/Pace_app/app/breathe/voz'
AUDIO_EXT = ('.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus')
NOTE_NAMES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']
PC_SOL = 7
APP_TARGET_BODY_RMS_DBFS = -36.0
TARGET_CYCLES_S = [2, 4, 8, 10, 12, 16, 19, 20, 24, 28]
CENTS_440_TO_432 = 1200.0 * math.log2(440.0 / 432.0)  # 31.77: the post-production shift

N_FFT = 2048          # 92.9 ms at 22050
HOP = 441             # 20 ms exactly
FRAME_S = HOP / SR
N_MELS = 48
MEL_FMIN, MEL_FMAX = 40.0, 10500.0
SOFT_FLOOR_DB = 60.0  # log-mel soft floor below the 99th-percentile band power
BODY_DROP_DB = 12.0   # body = within 12 dB of the median 10 ms envelope (s177)
SILENCE_DBFS = -50.0
ENV_FLOOR_DB = -120.0

BANDS = [('<100', 0, 100), ('100-200', 100, 200), ('200-500', 200, 500), ('500-1k', 500, 1000),
         ('1k-2k', 1000, 2000), ('2k-4k', 2000, 4000), ('4k-8k', 4000, 8000), ('>8k', 8000, 1e9)]
THIRD_OCT_NOMINAL = [160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150,
                     4000, 5000, 6300, 8000]   # k = -8..9 in fc = 1000 * 2^(k/3)

THRESHOLDS = {
    # detectors
    'ONSET_K': 5.0, 'ONSET_MIN_FLUX_DB': 3.0, 'ONSET_TOP_FRAC': 1.0 / 6.0, 'ONSET_LAG_FRAMES': 2,
    'ONSET_MIN_GAP_S': 0.15,
    'ONSET_LOCAL_MEDIAN_S': 3.0,
    'NOVELTY_MIN': 0.15, 'NOVELTY_SIGMA_DB': 3.0, 'NOVELTY_LIFTER': 6, 'NOVELTY_KERNEL_S': 4.0, 'RISE_EDGE_S': 1.0,
    'HARM_CHANGE_DIST': 0.15, 'DOMINANT_REL': 0.85, 'PERIODIC_R': 0.3, 'PERIOD_MIN_PROM': 0.1,
    'FOLD_MAX_K': 16, 'FOLD_TOL_CENTS': 15.0, 'PERSIST_TOL_CENTS': 25.0, 'MEL_SWITCH_RATIO': 1.5, 'MEL_ENTRY_DB': 6.0,
    'PULSE_MIN_FLUX_DB': 1.0, 'PULSE_FULL_FLUX_DB': 2.0, 'KEY_MIN_CONC': 0.2, 'HARM_MIN_PEAKS': 4,
    'VOC_MOD_INDEX': 0.12, 'VOC_RATIO_DB': -3.0,
    # rule_percussion
    'PERC_FAIL_RISE_DB': 10.0, 'PERC_WARN_RISE_DB': 6.0,
    'PERC_FAIL_ONSETS': 12.0, 'PERC_WARN_ONSETS': 3.0, 'PERC_WARN_HF': 3.0,
    'PERC_FAIL_PULSE': 0.5, 'PERC_WARN_PULSE': 0.35,
    # rule_audible
    'AUD_PASS_200_2K': 50.0, 'AUD_FAIL_200_2K': 35.0, 'AUD_WARN_BELOW200': 45.0,
    'AUD_FAIL_BELOW200': 60.0, 'AUD_WARN_AW_DB': 9.0, 'AUD_FAIL_AW_DB': 11.0,
    # rule_hf
    'HF_WARN_PCT': 5.0, 'HF_FAIL_PCT': 10.0, 'HF_WARN_VMR': 10.0, 'HF_FAIL_VMR': 3.0,
    # rule_flat
    'FLAT_WARN_RANGE': 3.0, 'FLAT_FAIL_RANGE': 6.0, 'FLAT_WARN_SWELL': 2.5, 'FLAT_FAIL_SWELL': 4.0,
    'FLAT_WARN_DRIFT': 0.5, 'FLAT_FAIL_DRIFT': 1.5,
    # rule_loop
    'LOOP_WARN_DIST': 1.5, 'LOOP_FAIL_DIST': 3.0, 'LOOP_MIN_BODY_S': 30.0, 'LOOP_TIDE_MIN_R': 0.6,
    'LOOP_TIDE_TOL': 0.01, 'LOOP_TIDE_MIN_DEPTH_DB': 1.0, 'LOOP_TIDE_MIN_CEN_FRAC': 0.05,
    # rule_key_G
    'KEY_WARN_TUNING': 15.0, 'KEY_MIN_CONF': 0.1, 'KEY_RUNNERUP_MARGIN': 0.1,
    # rule_mono  (10*log10((1+rho)/2): rho=-0.1 -> -3.47 dB, rho=-0.5 -> -6.0 dB)
    'MONO_WARN_DB': -3.5, 'MONO_FAIL_DB': -6.0, 'MONO_WARN_CORR': -0.1,
    # rule_no_melody
    'MEL_WARN_PER_MIN': 3.0, 'MEL_FAIL_PER_MIN': 10.0,
    'HARM_WARN_PER_MIN': 0.5, 'HARM_FAIL_PER_MIN': 2.0,
    # rule_no_events
    'EV_WARN_PER_MIN': 1.0, 'EV_FAIL_PER_MIN': 3.0,
}
T = THRESHOLDS


# ───────────────────────────── small helpers ─────────────────────────────
def db_amp(a):
    return 20.0 * np.log10(np.maximum(a, 1e-10))


def db_pow(p):
    return 10.0 * np.log10(np.maximum(p, 1e-20))


def fnum(v, nd=4):
    """float or None (JSON-safe)."""
    if v is None:
        return None
    v = float(v)
    if not math.isfinite(v):
        return None
    return round(v, nd)


def clean(o):
    """Recursively make an object JSON-safe: numpy -> python, nan/inf -> None."""
    if isinstance(o, dict):
        return {str(k): clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [clean(v) for v in o]
    if isinstance(o, np.ndarray):
        return [clean(v) for v in o.tolist()]
    if isinstance(o, (np.bool_, bool)):
        return bool(o)
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (float, np.floating)):
        return fnum(o)
    return o


def frame_rms(x, sr, dur):
    """RMS on an exact time grid (dur seconds; boundaries rounded, so 10 ms at 22050 averages 220.5)."""
    step = sr * dur
    nfr = int(len(x) // step)
    if nfr < 1:
        return np.zeros(0), np.zeros(1, dtype=np.int64)
    edges = np.round(np.arange(nfr + 1) * step).astype(np.int64)
    cs = np.concatenate([[0.0], np.cumsum(np.asarray(x, dtype=np.float64) ** 2)])
    e = (cs[edges[1:]] - cs[edges[:-1]]) / np.diff(edges)
    return np.sqrt(np.maximum(e, 0.0)), edges


def rms(x):
    x = np.asarray(x, dtype=np.float64)
    return float(np.sqrt(np.mean(x * x))) if len(x) else 0.0


def parabolic(y, i):
    """Sub-sample peak position/height from three points."""
    if i <= 0 or i >= len(y) - 1:
        return float(i), float(y[i])
    a, b, c = float(y[i - 1]), float(y[i]), float(y[i + 1])
    den = a - 2.0 * b + c
    if den == 0:
        return float(i), b
    d = max(-0.5, min(0.5, 0.5 * (a - c) / den))
    return i + d, b - 0.25 * (a - c) * d


def acf_pearson(x, max_lag, min_overlap):
    """Autocorrelation normalised PER LAG: Pearson r between x[:n-L] and x[L:], L = 0..max_lag."""
    x = np.asarray(x, dtype=np.float64)
    n = len(x)
    top = min(max_lag, n - min_overlap)
    if top < 1:
        return np.arange(0), np.zeros(0)
    lags = np.arange(0, top + 1)
    nfft = 1 << int(math.ceil(math.log2(2 * n)))
    X = np.fft.rfft(x, nfft)
    ac = np.fft.irfft(X * np.conj(X), nfft)[:n]
    cs = np.concatenate([[0.0], np.cumsum(x)])
    cs2 = np.concatenate([[0.0], np.cumsum(x * x)])
    m = n - lags
    sx, sy = cs[m], cs[n] - cs[lags]
    sxx, syy = cs2[m], cs2[n] - cs2[lags]
    cov = ac[lags] - sx * sy / m
    vx = sxx - sx * sx / m
    vy = syy - sy * sy / m
    r = cov / np.sqrt(np.maximum(vx * vy, 1e-30))
    return lags, np.clip(r, -1.0, 1.0)


def highpass_detrend(y, dt, win_s=60.0):
    """Linear detrend, then a zero-phase high-pass at 1/win_s Hz with the magnitude of a forward-
    backward 2nd-order Butterworth (|H|^2), applied in the DCT-II domain: removes slow drift that
    would inflate r at every lag, keeps periods <= 30 s (-0.5 dB at 30 s).
    Why the DCT and not sosfiltfilt: sosfiltfilt pads only ~9 samples, while this filter's impulse
    response lasts ~40 s (400 samples at 0.1 s), so its start-up transients ADDED a slow bump at both
    ends of the series (a static synthetic pad went from 0.26 to 0.35 dB std and read r = 0.46 at
    2 s). The DCT's even extension has no start-up transient. Not a moving average either: its
    reflected edges biased a 10 s tide to 10.02 s."""
    y = signal.detrend(np.asarray(y, dtype=np.float64), type='linear')
    n = len(y)
    if n < 8:
        return y
    c = sfft.dct(y, type=2, norm='ortho')
    x = (np.arange(n) / (2.0 * n * dt)) * win_s          # frequency of each DCT basis over the cutoff
    c *= x ** 4 / (1.0 + x ** 4)
    return sfft.idct(c, type=2, norm='ortho')


def note_of(f, base):
    """Nearest equal-tempered note on a grid with A4 = base (s177 notaMasCercana)."""
    if not f or f <= 0:
        return None
    s = round(12.0 * math.log2(f / base))
    exact = base * 2.0 ** (s / 12.0)
    midi = 69 + s
    return {'name': NOTE_NAMES[midi % 12], 'octave': midi // 12 - 1,
            'cents': 1200.0 * math.log2(f / exact), 'exact_hz': exact}


def wrap_cents(c):
    return ((c + 50.0) % 100.0) - 50.0


def cosine(a, b):
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na == 0 or nb == 0:
        return None
    return float(np.dot(a, b) / (na * nb))


def mel_filterbank(sr, n_fft, n_mels, fmin, fmax):
    hz2mel = lambda f: 2595.0 * np.log10(1.0 + f / 700.0)
    mel2hz = lambda m: 700.0 * (10.0 ** (m / 2595.0) - 1.0)
    fpts = mel2hz(np.linspace(hz2mel(fmin), hz2mel(fmax), n_mels + 2))
    freqs = np.arange(n_fft // 2 + 1) * sr / n_fft
    fb = np.zeros((n_mels, len(freqs)), dtype=np.float32)
    for m in range(n_mels):
        lo, c, hi = fpts[m], fpts[m + 1], fpts[m + 2]
        fb[m] = np.maximum(0.0, np.minimum((freqs - lo) / (c - lo), (hi - freqs) / (hi - c)))
    return fb, fpts[1:-1]


MEL_FB, MEL_CENTRES = mel_filterbank(SR, N_FFT, N_MELS, MEL_FMIN, MEL_FMAX)
STFT_FREQS = np.arange(N_FFT // 2 + 1) * SR / N_FFT


def a_weight_db(f):
    f = np.asarray(f, dtype=np.float64)
    f2 = f * f
    ra = (12194.0 ** 2 * f2 * f2) / ((f2 + 20.6 ** 2) * np.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2))
                                      * (f2 + 12194.0 ** 2))
    return 20.0 * np.log10(np.maximum(ra, 1e-20)) + 2.0


# ───────────────────────────── decoding ─────────────────────────────
def run(cmd, timeout=600):
    return subprocess.run(cmd, capture_output=True, timeout=timeout, stdin=subprocess.DEVNULL)


def probe(path):
    p = run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries',
             'stream=codec_name,channels,sample_rate,bit_rate:format=duration,bit_rate,size',
             '-of', 'json', path], timeout=60)
    if p.returncode != 0:
        raise RuntimeError('ffprobe failed: ' + p.stderr.decode(errors='replace')[-300:])
    j = json.loads(p.stdout.decode(errors='replace'))
    if not j.get('streams'):
        raise RuntimeError('no audio stream')
    st, fm = j['streams'][0], j.get('format', {})
    br = st.get('bit_rate') or fm.get('bit_rate')
    return {'codec': st.get('codec_name'), 'channels': int(st.get('channels', 0)),
            'sample_rate': int(st.get('sample_rate', 0)),
            'bitrate_kbps': float(br) / 1000.0 if br else None,
            'size_bytes': int(fm['size']) if fm.get('size') else os.path.getsize(path)}


def decode(path, channels, sr=None):
    """float32 (n, 2). Mono files are duplicated here: ffmpeg's own mono->stereo upmix is -3 dB."""
    cmd = ['ffmpeg', '-nostdin', '-hide_banner', '-v', 'error', '-i', path, '-map', '0:a:0', '-vn']
    out_ch = 1 if channels == 1 else 2
    if channels != out_ch or channels > 2:
        cmd += ['-ac', str(out_ch)]
    if sr:
        cmd += ['-ar', str(sr)]
    cmd += ['-f', 'f32le', '-acodec', 'pcm_f32le', 'pipe:1']
    p = run(cmd)
    if p.returncode != 0:
        raise RuntimeError('ffmpeg decode failed: ' + p.stderr.decode(errors='replace')[-300:])
    x = np.frombuffer(p.stdout, dtype='<f4').reshape(-1, out_ch)
    if out_ch == 1:
        x = np.repeat(x, 2, axis=1)
    return x


def ebur128(path):
    p = run(['ffmpeg', '-nostdin', '-hide_banner', '-nostats', '-i', path, '-map', '0:a:0',
             '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'])
    err = p.stderr.decode(errors='replace')
    tail = err[err.rfind('Summary:'):] if 'Summary:' in err else ''
    i = re.findall(r'I:\s+(-?inf|-?\d+(?:\.\d+)?)\s+LUFS', tail)
    lra = re.findall(r'LRA:\s+(-?\d+(?:\.\d+)?)\s+LU', tail)
    to_f = lambda s: None if 'inf' in s else float(s)
    return (to_f(i[0]) if i else None), (float(lra[0]) if lra else None)


# ───────────────────────────── spectral front-end ─────────────────────────────
def stft_power(x, n_fft=N_FFT, hop=HOP):
    x = np.asarray(x, dtype=np.float32)
    if len(x) < n_fft:
        x = np.pad(x, (0, n_fft - len(x)))
    win = signal.windows.hann(n_fft, sym=False).astype(np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(x, n_fft)[::hop]
    out = np.empty((frames.shape[0], n_fft // 2 + 1), dtype=np.float32)
    for s in range(0, frames.shape[0], 1024):
        sp = np.fft.rfft(frames[s:s + 1024] * win, axis=1)
        out[s:s + 1024] = sp.real ** 2 + sp.imag ** 2
    times = (np.arange(frames.shape[0]) * hop + n_fft / 2.0) / SR
    return out, times


def soft_log(P, pref):
    return 10.0 * np.log10(1.0 + P / pref)


def welch_mono(x, sr):
    nper = int(round(0.0929 * sr))
    nper = min(nper, len(x))
    f, P = signal.welch(x, fs=sr, window='hann', nperseg=nper, noverlap=nper // 2,
                        detrend=False, scaling='spectrum')
    return f, P


# ───────────────────────────── voice reference ─────────────────────────────
def voice_reference(voice_dir):
    files = sorted(os.path.join(voice_dir, f) for f in os.listdir(voice_dir)
                   if f.lower().endswith(AUDIO_EXT))
    if not files:
        raise RuntimeError('no voice files in ' + voice_dir)
    specs, info = [], []
    for f in files:
        pr = probe(f)
        x = decode(f, pr['channels'], SR).mean(axis=1)
        P, _ = stft_power(x)
        e = P.sum(axis=1)
        speech = db_pow(e) >= db_pow(e.max()) - 30.0
        spec = P[speech].mean(axis=0).astype(np.float64)
        specs.append(spec)
        # speech-frame RMS in dBFS, from the Hann-windowed frame energy (Parseval, window power)
        win = signal.windows.hann(N_FFT, sym=False)
        # one-sided |X|^2 holds half of N*sum((x*w)^2), hence the factor 2
        ms = (2.0 * P[speech].sum(axis=1) / (N_FFT * np.sum(win ** 2))).mean()
        info.append({'file': os.path.basename(f), 'speech_frames': int(speech.sum()),
                     'speech_rms_dbfs': float(db_pow(ms))})
    return {'spectrum': np.mean(specs, axis=0), 'files': info}


# ───────────────────────────── analysis blocks ─────────────────────────────
def find_body(mono22):
    env, edges = frame_rms(mono22, SR, 0.01)
    if len(env) == 0:
        raise RuntimeError('file too short')
    floor = np.median(env) * 10 ** (-BODY_DROP_DB / 20.0)
    idx = np.nonzero(env >= floor)[0]
    ini, fin = (int(idx[0]), int(idx[-1])) if len(idx) else (0, len(env) - 1)
    return env, edges, ini, fin


def topk_mean(dL):
    """Onset strength per frame: mean of the largest ONSET_TOP_FRAC of the band rises. A plain mean
    over 48 bands dilutes a single note (3-6 bands rising 15 dB read ~1.5 dB, below stationary
    noise's own peaks); the top sixth keeps a note onset ~2x above noise and a hit is broadband."""
    if dL.shape[1] == 0:
        return np.zeros(dL.shape[0])
    k = max(1, int(round(T['ONSET_TOP_FRAC'] * dL.shape[1])))
    return np.partition(dL, dL.shape[1] - k, axis=1)[:, -k:].mean(axis=1)


def onset_detect(flux, k, min_abs, min_gap_s, local_s):
    if len(flux) < 5:
        return np.zeros(0, dtype=int), np.zeros_like(flux)
    size = int(round(local_s / FRAME_S)) | 1
    base = ndimage.median_filter(flux, size=size, mode='nearest')
    mad = 1.4826 * np.median(np.abs(flux - np.median(flux)))
    thr = np.maximum(base + k * mad, min_abs)
    pk, _ = signal.find_peaks(flux, height=thr, distance=max(1, int(round(min_gap_s / FRAME_S))))
    return pk, thr


def refine_period_dft(series, dt, p0, span=0.02, npts=1001):
    """Final period: peak of the Hann-windowed DFT magnitude of the whole series on a fine grid
    within +-2 % of the ACF estimate, parabolic-refined (the ACF estimate if the peak is at the edge). The ACF peak is pulled by every other
    periodic component (e.g. a 3 s beat shifts a 10 s tide by ~0.02 s); the DFT bin of the tide
    is not, which matters when "exactly 10 s" is the requirement."""
    x = np.asarray(series, dtype=np.float64)
    x = (x - x.mean()) * signal.windows.hann(len(x), sym=False)
    fr = np.linspace(1.0 / (p0 * (1 + span)), 1.0 / (p0 * (1 - span)), npts)
    tt = np.arange(len(x)) * dt
    mag = np.empty(npts)
    for s in range(0, npts, 256):
        ph = np.exp(-2j * np.pi * np.outer(fr[s:s + 256], tt))
        mag[s:s + 256] = np.abs(ph @ x)
    i = int(np.argmax(mag))
    if i == 0 or i == npts - 1:
        return p0
    k, _ = parabolic(np.log(np.maximum(mag, 1e-30)), i)
    return 1.0 / np.interp(k, np.arange(npts), fr)


def periodicity(series, dt):
    """Tide detector on a detrended series sampled every dt seconds."""
    out = {'top_peaks': [], 'r_at_targets': {str(c): None for c in TARGET_CYCLES_S},
           'prom_at_targets': {str(c): None for c in TARGET_CYCLES_S},
           'dominant_period_s': None, 'dominant_r': None, 'acf_period_s': None, 'dominant_depth': None,
           'period_quarters_s': [], 'r_quarters': [], 'period_stability_s': None}
    n = len(series)
    min_lag, max_lag = int(round(1.0 / dt)), int(round(30.0 / dt))
    lags, r = acf_pearson(series, max_lag, min_overlap=int(round(5.0 / dt)))
    if len(lags) <= min_lag + 2:
        return out
    allpk, _ = signal.find_peaks(r)
    allprom = signal.peak_prominences(r, allpk)[0] if len(allpk) else np.zeros(0)
    for c in TARGET_CYCLES_S:
        # r AT the cycle's lag, not the max within +-0.25 s: the window max let a 14 s tide read
        # cos(2pi*12.25/14) = 0.71 at 12 s, and "matches a cycle" must mean exactly that cycle
        li = int(round(c / dt))
        if li < len(r):
            out['r_at_targets'][str(c)] = float(r[li])
            near = np.abs(allpk * dt - c) <= 0.25 + 1e-9
            out['prom_at_targets'][str(c)] = float(allprom[near].max()) if near.any() else 0.0
    # only PROMINENT local maxima are periods: a smooth envelope's ACF decays from lag 0 with
    # tiny wiggles that are local maxima at high r but not periodicities
    keep = (allpk >= min_lag) & (allpk < len(r) - 1) & (allprom >= T['PERIOD_MIN_PROM'])
    pk, pprom = allpk[keep], allprom[keep]
    if len(pk) == 0:
        return out
    ref = [parabolic(r, int(p)) for p in pk]
    order = sorted(range(len(pk)), key=lambda i: -ref[i][1])
    out['top_peaks'] = [[ref[i][0] * dt, ref[i][1], float(pprom[i])] for i in order[:3]]
    rmax = ref[order[0]][1]
    if rmax <= 0:
        return out
    cand = [i for i in range(len(pk)) if ref[i][1] >= T['DOMINANT_REL'] * rmax]
    i0 = min(cand, key=lambda i: pk[i])
    p0, r0 = ref[i0]
    # refine with the multiples k*P still inside the lag range
    ests, wts = [p0], [r0]
    for k in range(2, int((len(r) - 2) // max(p0, 1e-9)) + 1):
        lo, hi = int(math.floor(k * p0 - 0.15 * p0)), int(math.ceil(k * p0 + 0.15 * p0))
        lo, hi = max(lo, 1), min(hi, len(r) - 2)
        if hi <= lo:
            break
        j = lo + int(np.argmax(r[lo:hi + 1]))
        if j == lo or j == hi:
            continue
        pj, rj = parabolic(r, j)
        if rj >= 0.5 * r0:
            ests.append(pj / k)
            wts.append(k * rj)
    P_acf = float(np.average(ests, weights=wts)) * dt
    P = refine_period_dft(series, dt, P_acf)
    out['dominant_period_s'], out['dominant_r'], out['acf_period_s'] = P, float(r0), P_acf
    # depth: fold the series at P
    ph = ((np.arange(n) * dt) % P) / P
    b = np.minimum((ph * 20).astype(int), 19)
    cnt = np.bincount(b, minlength=20)
    prof = np.bincount(b, weights=series, minlength=20) / np.maximum(cnt, 1)
    out['dominant_depth'] = float(prof.max() - prof.min())
    # stability: the same period searched in each quarter
    q = n // 4
    per, rq = [], []
    for s in range(4):
        seg = series[s * q:(s + 1) * q]
        hi_lag = int(math.ceil(1.25 * P / dt)) + 1
        if hi_lag > len(seg) // 2:
            continue
        lq, rr = acf_pearson(seg, hi_lag, min_overlap=len(seg) // 2)
        lo = max(1, int(math.floor(0.75 * P / dt)))
        if len(rr) <= lo + 2:
            continue
        j = lo + int(np.argmax(rr[lo:]))
        pj, rj = parabolic(rr, j)
        per.append(pj * dt)
        rq.append(rj)
    out['period_quarters_s'], out['r_quarters'] = per, rq
    if len(per) >= 2:
        out['period_stability_s'] = float(np.std(per))
    return out


def spectral_peaks(S, W, fmax_db, band, df):
    """Spectral peaks per frame: local maxima >= 10 dB above the local floor (W), within 50 dB of
    the frame max, and not a window sidelobe (>= the max within +-6 bins, ~4 Hz, minus 25 dB).
    Position and level refined by a parabola on the dB spectrum."""
    mx = ndimage.maximum_filter1d(S, size=13, axis=1, mode='nearest')
    c = S[:, 1:-1]
    core = (c > S[:, :-2]) & (c >= S[:, 2:]) & (W[:, 1:-1] >= 10.0) \
        & (c >= fmax_db[:, None] - 50.0) & (c >= mx[:, 1:-1] - 25.0) & band[None, 1:-1]
    ti, ki = np.nonzero(core)
    ki = ki + 1
    a, b, cc = (S[ti, ki - 1].astype(np.float64), S[ti, ki].astype(np.float64),
                S[ti, ki + 1].astype(np.float64))
    den = a - 2 * b + cc
    d = np.clip(np.where(den != 0, 0.5 * (a - cc) / np.where(den != 0, den, 1), 0.0), -0.5, 0.5)
    return ti, (ki + d) * df, b - 0.25 * (a - cc) * d, np.minimum(W[ti, ki].astype(np.float64), 40.0)


def persistent(ti, pf, nf):
    """True for peaks with a peak within PERSIST_TOL_CENTS in the previous or next frame. Frames
    overlap by half, so a note (>= ~0.5 s) shows in two of them while a noise peak rarely does."""
    lc = 1200.0 * np.log2(np.maximum(pf, 1e-6))
    starts = np.searchsorted(ti, np.arange(nf + 1))
    ok = np.zeros(len(pf), dtype=bool)
    for fr in range(nf):
        s0, s1 = starts[fr], starts[fr + 1]
        if s1 == s0:
            continue
        cur = lc[s0:s1]
        hit = np.zeros(s1 - s0, dtype=bool)
        for nb in (fr - 1, fr + 1):
            if nb < 0 or nb >= nf or starts[nb + 1] == starts[nb]:
                continue
            other = np.sort(lc[starts[nb]:starts[nb + 1]])
            j = np.searchsorted(other, cur)
            near = np.minimum(np.abs(cur - other[np.clip(j - 1, 0, len(other) - 1)]),
                              np.abs(cur - other[np.clip(j, 0, len(other) - 1)]))
            hit |= near <= T['PERSIST_TOL_CENTS']
        ok[s0:s1] = hit
    return ok


def fold_harmonics(ti, pf, plev, nf):
    """keep[i] = False when peak i lies within FOLD_TOL_CENTS of k*f (k = 2..FOLD_MAX_K) of a lower
    peak in the same frame that is at most 3 dB weaker: it is a partial, not a note."""
    keep = np.ones(len(pf), dtype=bool)
    starts = np.searchsorted(ti, np.arange(nf + 1))
    for fr in range(nf):
        s0, s1 = starts[fr], starts[fr + 1]
        if s1 - s0 < 2:
            continue
        f_, l_ = pf[s0:s1], plev[s0:s1]
        ratio = f_[:, None] / f_[None, :]              # [j, i] = f_j / f_i
        kk = np.round(ratio)
        dev = 1200.0 * np.log2(ratio / np.maximum(kk, 1.0))
        harm = (kk >= 2) & (kk <= T['FOLD_MAX_K']) & (np.abs(dev) <= T['FOLD_TOL_CENTS']) \
            & (l_[None, :] >= l_[:, None] - 3.0)
        keep[s0:s1] = ~harm.any(axis=1)
    return keep


def root_by_template(c):
    """score(r) = c[r] + 0.5*c[r+7] + 0.2*max(c[r+3], c[r+4]); returns (root, conf, order, score)."""
    score = np.array([c[r] + 0.5 * c[(r + 7) % 12] + 0.2 * max(c[(r + 3) % 12], c[(r + 4) % 12])
                      for r in range(12)])
    order = np.argsort(-score)
    if score[order[0]] <= 0:
        return None, 0.0, order, score
    return int(order[0]), float((score[order[0]] - score[order[1]]) / score[order[0]]), order, score


def note_presence(ti, pf, plev, ppc, nf, root):
    """12 values in 0..1: per frame, each pitch class's loudest note peak relative to the loudest
    root/fifth note peak within +-1 octave of it (the whole frame's loudest root/fifth if none is
    that close), as an amplitude ratio capped at 1; averaged over frames that have a root or fifth.
    Register-local because real mixes put the root in a bass 10-20 dB above the pad: against the
    bass, a pad's third would read absent. Returns (presence, n_frames_used)."""
    core = (ppc == root) | (ppc == (root + 7) % 12)
    lf = np.log2(np.maximum(pf, 1e-6))
    starts = np.searchsorted(ti, np.arange(nf + 1))
    acc, n = np.zeros(12), 0
    for fr in range(nf):
        a, b = starts[fr], starts[fr + 1]
        c = core[a:b]
        if b == a or not c.any():
            continue
        L, F, pc = plev[a:b], lf[a:b], ppc[a:b]
        Lc, Fc = L[c], F[c]
        near = np.abs(F[:, None] - Fc[None, :]) <= 1.0                       # peaks x core peaks
        ref = np.where(near.any(axis=1), np.where(near, Lc[None, :], -np.inf).max(axis=1), Lc.max())
        rel = np.minimum(1.0, 10.0 ** ((L - ref) / 20.0))
        fr_p = np.zeros(12)
        np.maximum.at(fr_p, pc, rel)
        acc += fr_p
        n += 1
    return (acc / n if n else acc), n


def tonality_block(body22, t0):
    """Chroma, tuning, root, harmony, melody, harmonic motion. Returns (tonality, motion, chroma_info)."""
    win_n, hop, nfft = SR, SR // 2, 32768
    if len(body22) < win_n * 2:
        return None, None, None
    df = SR / nfft
    kmax = int(2100 / df) + 2
    frames = np.lib.stride_tricks.sliding_window_view(np.asarray(body22, np.float32), win_n)[::hop]
    nf = frames.shape[0]
    win = signal.windows.hann(win_n, sym=False).astype(np.float32)
    S = np.empty((nf, kmax), dtype=np.float32)
    for s in range(0, nf, 64):
        sp = np.fft.rfft(frames[s:s + 64] * win, nfft, axis=1)[:, :kmax]
        S[s:s + 64] = db_amp(np.abs(sp))
    freqs = np.arange(kmax) * df
    W = S - ndimage.median_filter(S, size=(1, 31), mode='nearest')
    band40 = (freqs >= 40) & (freqs <= 2000)
    fmax_db = S[:, band40].max(axis=1)

    ti, pf, plev, pw = spectral_peaks(S, W, fmax_db, band40, df)
    n_raw_peaks = int(len(pf))
    pers = persistent(ti, pf, nf)
    ti, pf, plev, pw = ti[pers], pf[pers], plev[pers], pw[pers]
    keep = fold_harmonics(ti, pf, plev, nf)

    # tuning: circular mean (mod 100 cents vs A=440) of the NOTE peaks (harmonics 5, 7, 11... of a
    # harmonic tone sit -14, -31, -49 cents off the grid and would bias it); all peaks as fallback
    tsel = keep & (pf >= 80.0)
    if tsel.sum() < 5:
        tsel = pf >= 80.0
    if tsel.sum() >= 5:
        cents = 1200.0 * np.log2(pf[tsel] / 440.0)
        z = np.sum(pw[tsel] * np.exp(2j * np.pi * cents / 100.0))
        offset = float(np.angle(z) * 100.0 / (2 * np.pi))
        conc = float(np.abs(z) / np.sum(pw[tsel]))
    else:
        offset, conc = 0.0, 0.0

    def pc_of(f):
        return (np.round(12.0 * np.log2(f / 440.0) - offset / 100.0).astype(int) + 9) % 12

    # raw chroma: whitened log-magnitude bins on the tuning-corrected 440 grid
    sel = (freqs >= 60.0) & (freqs <= 2000.0)
    pcs = pc_of(freqs[sel])
    Wc = np.maximum(0.0, W[:, sel] - 6.0) * (S[:, sel] >= fmax_db[:, None] - 60.0)
    C = np.zeros((nf, 12))
    for p in range(12):
        C[:, p] = Wc[:, pcs == p].sum(axis=1)
    chroma = C.sum(axis=0)
    chroma_n = chroma / chroma.max() if chroma.max() > 0 else chroma

    # fundamental chroma: note peaks only (harmonics folded away), per frame
    ppc = pc_of(np.maximum(pf, 1e-6)) if len(pf) else np.zeros(0, dtype=int)
    wpk = np.maximum(0.0, pw - 6.0)
    Cf_fr, Cfb_fr = np.zeros((nf, 12)), np.zeros((nf, 12))
    s60 = keep & (pf >= 60.0)
    np.add.at(Cf_fr, (ti[s60], ppc[s60]), wpk[s60])
    s300 = keep & (pf >= 300.0)
    np.add.at(Cfb_fr, (ti[s300], ppc[s300]), wpk[s300])
    Cf = Cf_fr.sum(axis=0)
    cf_n = Cf / Cf.max() if Cf.max() > 0 else Cf

    # root: template on the fundamental chroma (the raw one is skewed by partials), raw as fallback
    root, conf, order, score = root_by_template(cf_n)
    root_src = 'fundamental'
    if root is None:
        root, conf, order, score = root_by_template(chroma_n)
        root_src = 'raw'
    root_raw = root_by_template(chroma_n)[0]

    def strengths(v, r):
        base = v[r] if v[r] > 0 else (v.max() if v.max() > 0 else 1.0)
        return (float(v[(r + 7) % 12] / base), float(v[(r + 3) % 12] / base), float(v[(r + 4) % 12] / base))

    # harmony from note_presence, not chroma_fundamental: its weights saturate (W capped at 40 dB),
    # so it counts octave doublings, and a third at the root's level beside a root voiced in three
    # octaves read 0.33 (synthetic Gm and G major both came out open_fifth). Presence asks the
    # harmonic question: does that note sound, and how loud against its neighbours.
    presence = np.zeros(12)
    harmony = 'ambiguous'
    fifth = m3 = M3 = None
    raw_str = count_str = None
    n_valid = 0
    if root is not None:
        presence, n_valid = note_presence(ti[s60], pf[s60], plev[s60], ppc[s60], nf, root)
        fifth, m3, M3 = (float(presence[(root + 7) % 12]), float(presence[(root + 3) % 12]),
                         float(presence[(root + 4) % 12]))
        raw_str = dict(zip(['fifth', 'minor_third', 'major_third'], strengths(chroma_n, root)))
        count_str = dict(zip(['fifth', 'minor_third', 'major_third'], strengths(cf_n, root)))
        others = [presence[p] for p in range(12) if p not in (root, (root + 7) % 12, (root + 3) % 12, (root + 4) % 12)]
        if n_valid == 0:
            harmony = 'ambiguous'
        elif (presence >= 0.5).sum() >= 6:
            harmony = 'cluster'
        elif m3 >= 0.35 and m3 >= 1.5 * M3:
            harmony = 'minor'
        elif M3 >= 0.35 and M3 >= 1.5 * m3:
            harmony = 'major'
        elif max(m3, M3) >= 0.35 or max(others) >= 0.5:
            harmony = 'ambiguous'
        else:
            harmony = 'open_fifth'

    # f0: strongest 60-500 Hz peak of the LONG-TERM spectrum (power mean of 131072-point Hann windows,
    # hop half, over the whole body), parabolic. s177 took ONE window at the centre; on an evolving pad
    # that is a lottery: v1-equilibrio's centre window is one of 2 in 76 where the fifth (Mi3) beats
    # the root (La2), so it read Mi3 while s177 (another centre) and the long-term spectrum read La2.
    NL = 131072 if len(body22) >= 131072 else 1 << int(math.floor(math.log2(len(body22))))
    wl = signal.windows.hann(NL, sym=False)
    k0, k1 = int(math.ceil(60 * NL / SR)), int(math.floor(500 * NL / SR))
    acc, picks = None, []
    for p0 in range(0, len(body22) - NL + 1, NL // 2):
        mag = np.abs(np.fft.rfft(np.asarray(body22[p0:p0 + NL], dtype=np.float64) * wl))
        acc = mag ** 2 if acc is None else acc + mag ** 2
        picks.append((k0 + int(np.argmax(mag[k0:k1 + 1]))) * SR / NL)
    mag = np.sqrt(acc / len(picks))
    kp = k0 + int(np.argmax(mag[k0:k1 + 1]))
    kf, _ = parabolic(np.log(np.maximum(mag, 1e-12)), kp)
    f0 = kf * SR / NL
    f0_agree = float(np.mean([abs(1200.0 * math.log2(q / f0)) <= 50.0 for q in picks])) if f0 > 0 else None

    has = root is not None
    tonality = {
        'tuning_offset_cents': offset,
        'tuning_offset_vs_432_cents': wrap_cents(offset + CENTS_440_TO_432),
        'tuning_grid': '440' if abs(wrap_cents(offset)) <= abs(wrap_cents(offset + CENTS_440_TO_432)) else '432',
        'tuning_residual_cents': min(wrap_cents(offset), wrap_cents(offset + CENTS_440_TO_432), key=abs),
        'tuning_concentration': conc, 'n_tuning_peaks': int(tsel.sum()),
        'n_note_peaks': int(keep.sum()), 'n_persistent_peaks': int(len(pf)), 'n_peaks': n_raw_peaks,
        'root_pc': root, 'root_name': NOTE_NAMES[root] if has else None, 'root_source': root_src if has else None,
        'root_confidence': conf, 'runner_up_name': NOTE_NAMES[int(order[1])] if has else None,
        'sol_score_rel': float(score[PC_SOL] / score[order[0]]) if has else None,
        'root_name_raw': NOTE_NAMES[root_raw] if root_raw is not None else None,
        'chroma': chroma_n, 'chroma_fundamental': cf_n,
        'fifth_strength': fifth, 'minor_third_strength': m3, 'major_third_strength': M3,
        'raw_interval_strengths': raw_str, 'count_interval_strengths': count_str, 'note_presence': presence,
        'harmony_class': harmony,
        'f0_hz': f0, 'f0_window_agreement': f0_agree, 'f0_note_432': note_of(f0, 432.0), 'f0_note_440': note_of(f0, 440.0),
    }

    # ── harmonic motion (raw chroma frames) & melody (note peaks 300-2000 Hz) ──
    centres = t0 + np.arange(nf) * 0.5 + 0.5
    body_min = len(body22) / SR / 60.0
    nrm = np.linalg.norm(C, axis=1)
    ok = nrm > 0
    Cn = np.where(ok[:, None], C / np.where(ok, nrm, 1.0)[:, None], 0.0)
    both = ok[1:] & ok[:-1]
    dist = 1.0 - np.sum(Cn[1:] * Cn[:-1], axis=1)
    change_rate = float(dist[both].mean()) if both.any() else None

    dcp = np.zeros(nf)
    npk = np.bincount(ti[keep], minlength=nf) if len(ti) else np.zeros(nf, dtype=int)
    for t in range(4, nf - 3):                     # on NOTE chroma: partials blur chord changes
        if npk[t - 4:t].sum() < T['HARM_MIN_PEAKS'] or npk[t:t + 4].sum() < T['HARM_MIN_PEAKS']:
            continue                               # too few notes on a side to call a change
        cs_ = cosine(Cf_fr[t - 4:t].sum(axis=0), Cf_fr[t:t + 4].sum(axis=0))
        dcp[t] = 1.0 - cs_ if cs_ is not None else 0.0
    cp, _ = signal.find_peaks(dcp, height=T['HARM_CHANGE_DIST'], distance=4)
    cp_times = [float(t0 + t * 0.5 + 0.25) for t in cp]

    mel_score, sal_frac, n_changes = None, None, None
    if root is not None:
        vmax = Cfb_fr.max(axis=1)
        ex = Cfb_fr.copy()
        ex[:, [root, (root + 7) % 12]] = 0.0
        dpc, dv = ex.argmax(axis=1), ex.max(axis=1)
        pos = vmax[vmax > 0]
        ref95 = np.percentile(pos, 95) if len(pos) else 0.0
        sal = (dv > 0) & (dv >= 0.5 * vmax) & (dv >= 0.1 * ref95)
        idx = np.arange(1, nf)
        # a melody step = the new pitch class ENTERS (grew >= ratio since the previous frame) AND now
        # beats the previous one by the ratio; two chord tones trading places by a few dB are neither
        beats_prev = dv[1:] >= T['MEL_SWITCH_RATIO'] * ex[idx, dpc[:-1]]
        before = ex[idx - 1, dpc[1:]]
        entered = (dv[1:] >= T['MEL_SWITCH_RATIO'] * before) & (dv[1:] - before >= T['MEL_ENTRY_DB'])
        switch = beats_prev & entered
        n_changes = int(np.sum(sal[1:] & sal[:-1] & (dpc[1:] != dpc[:-1]) & switch))
        mel_score = n_changes / body_min if body_min > 0 else None
        sal_frac = float(sal.mean())

    motion = {'chroma_change_rate': change_rate, 'n_harmonic_segments': int(len(cp) + 1),
              'harmonic_changes_per_min': len(cp) / body_min if body_min > 0 else None,
              'harmonic_change_times_s': cp_times[:20],
              'melody_score': mel_score, 'n_melody_changes': n_changes, 'melody_salient_frac': sal_frac}
    return tonality, motion, (Cn, centres)


def novelty_block(Pm, pref, t0):
    blk = 10                                     # 0.2 s blocks
    nb = Pm.shape[0] // blk
    h = int(round(T['NOVELTY_KERNEL_S'] / 2 / (blk * FRAME_S)))
    res = {'novelty_events_per_min': None, 'n_novelty_events': None, 'novelty_event_times_s': [],
           'novelty_event_values': [], 'novelty_threshold': None, 'novelty_max': None}
    if nb < 2 * h + 4:
        return res
    # level-normalised: each block's mel spectrum over its own total power, so a pure level move
    # (a Balance amplitude tide, a swell: those belong to flatness/periodicity) is not an event
    B = Pm[:nb * blk].reshape(nb, blk, -1).mean(axis=1).astype(np.float64)
    Rl = B / np.maximum(B.sum(axis=1, keepdims=True), 1e-30)
    pref_rel = 10 ** ((np.percentile(db_pow(Rl), 99) - SOFT_FLOOR_DB) / 10.0)
    F = soft_log(Rl, pref_rel)
    # lifter: drop the NOVELTY_LIFTER lowest DCT coefficients across the 48 bands, i.e. the broad
    # spectral envelope (tilt, a filter's knee). Events are changes of WHICH notes/partials sound; a
    # slow filter opening is a tide (centroid periodicity, flatness). Without it a 10 s filter sweep
    # (750-3000 Hz) scored 0.34-0.44, as high as a chord change, and read 11 events/min.
    if T['NOVELTY_LIFTER'] > 0:
        Fc = sfft.dct(F, type=2, norm='ortho', axis=1)
        Fc[:, :T['NOVELTY_LIFTER']] = 0.0
        F = sfft.idct(Fc, type=2, norm='ortho', axis=1)
    sq = np.sum(F * F, axis=1)
    D2 = np.maximum(sq[:, None] + sq[None, :] - 2.0 * F @ F.T, 0.0) / F.shape[1]
    S = np.exp(-D2 / (2.0 * T['NOVELTY_SIGMA_DB'] ** 2))
    off = np.arange(-h, h) + 0.5
    g = np.exp(-0.5 * (off / (0.5 * h)) ** 2)
    v = np.sign(off) * g
    norm = np.sum(np.abs(v)) ** 2
    nov = np.zeros(nb)
    for t in range(h, nb - h + 1):
        Wd = S[t - h:t + h, t - h:t + h]
        nov[t] = 2.0 * (v @ Wd @ v) / norm
    valid = nov[h:nb - h + 1]
    mad = 1.4826 * np.median(np.abs(valid - np.median(valid)))
    thr = T['NOVELTY_MIN']
    pk, _ = signal.find_peaks(nov, height=thr, distance=h)
    times = t0 + pk * blk * FRAME_S + N_FFT / 2.0 / SR     # kernel centre = start of block pk
    body_min = Pm.shape[0] * FRAME_S / 60.0
    res.update({'novelty_events_per_min': len(pk) / body_min, 'n_novelty_events': int(len(pk)),
                'novelty_event_times_s': times[:20].tolist(), 'novelty_event_values': nov[pk][:20].tolist(),
                'novelty_threshold': thr, 'novelty_max': float(valid.max()),
                'novelty_median': float(np.median(valid)), 'novelty_p90': float(np.percentile(valid, 90)),
                'novelty_robust_sigma': float(mad)})
    return res


def strong_tide(per, body_len, cen_mean=None):
    """(period_s, which) of the clearest tide (envelope or centroid) with dominant_r >= LOOP_TIDE_MIN_R,
    a prominent ACF peak, at least 3 periods in the body (two chimes 25 s apart are not a tide) and an
    audible depth (envelope >= LOOP_TIDE_MIN_DEPTH_DB peak-to-peak, centroid >= LOOP_TIDE_MIN_CEN_FRAC of
    the mean centroid: a 0.1 dB partial beating is periodic but nobody hears it), else (None, None)."""
    best = (None, None, 0.0)
    for which in ('envelope', 'centroid'):
        pe = (per or {}).get(which) or {}
        P, r, dep = pe.get('dominant_period_s'), pe.get('dominant_r'), pe.get('dominant_depth') or 0.0
        deep = dep >= (T['LOOP_TIDE_MIN_DEPTH_DB'] if which == 'envelope'
                       else T['LOOP_TIDE_MIN_CEN_FRAC'] * (cen_mean or float('inf')))
        if P and r is not None and r >= T['LOOP_TIDE_MIN_R'] and r > best[2] and 3.0 * P <= body_len and deep \
                and any(abs(pk[0] - P) <= 0.05 * P and pk[2] >= T['PERIOD_MIN_PROM'] for pk in pe.get('top_peaks', [])):
            best = (P, which, r)
    return best[0], best[1]


def loop_block(Pm, pref, t0, chroma_info, per=None, cen_mean=None):
    blk = 5                                      # 0.1 s blocks
    nq = Pm.shape[0] // blk
    res = {k: None for k in ('seam_similarity', 'seam_spectral_dist_db', 'seam_level_db', 'best_loop_start_s',
                             'best_loop_end_s', 'best_loop_len_s', 'best_loop_score', 'best_loop_dist_db',
                             'best_loop_chroma_sim', 'loop_tide_period_s', 'loop_tide_source', 'loop_tide_cycles',
                             'loop_tide_kept', 'best_loop_free_dist_db')}
    if nq < 60:
        return res
    Q = Pm[:nq * blk].reshape(nq, blk, -1).mean(axis=1).astype(np.float64)
    off = N_FFT / 2.0 / SR
    # seam: first vs last 2 s of the body
    a, b = Q[:20].mean(axis=0), Q[-20:].mean(axis=0)
    la, lb = soft_log(a, pref), soft_log(b, pref)
    res['seam_similarity'] = cosine(la, lb)
    res['seam_spectral_dist_db'] = float(np.std(lb - la))
    res['seam_level_db'] = float(db_pow(b.sum()) - db_pow(a.sum()))
    # 1 s windows centred on every block
    cs = np.concatenate([np.zeros((1, Q.shape[1])), np.cumsum(Q, axis=0)])
    centres = np.arange(5, nq - 5 + 1)
    Wp = (cs[centres + 5] - cs[centres - 5]) / 10.0
    Wl = soft_log(Wp, pref)
    Wlev = db_pow(Wp.sum(axis=1))
    tc = centres * 0.1                          # seconds from body start (block grid)
    body_len = nq * 0.1
    s_idx = np.nonzero(tc <= 30.0)[0]
    e_idx = np.nonzero(tc >= body_len - 40.0)[0]
    if len(s_idx) == 0 or len(e_idx) == 0:
        return res
    diff = Wl[e_idx][None, :, :] - Wl[s_idx][:, None, :]
    shape = diff.std(axis=2)
    lev = Wlev[e_idx][None, :] - Wlev[s_idx][:, None]
    Dm = np.sqrt(shape ** 2 + lev ** 2)
    min_len = min(20.0, 0.5 * body_len)
    Ln = tc[e_idx][None, :] - tc[s_idx][:, None]
    Dm[Ln < min_len] = np.inf
    # a track with a clear tide must loop on a whole number of tide periods: a 1 s window match at
    # 0.9 s and 40.9 s on a 12 s tide (3.33 cycles) joins a rising slope to a falling one and plays
    # one 4 s "cycle" per loop. Keep only lengths within LOOP_TIDE_TOL of k*P when any exist.
    free = float(np.min(Dm))
    res['best_loop_free_dist_db'] = free if np.isfinite(free) else None
    Ptide, src = strong_tide(per, body_len, cen_mean)
    if Ptide:
        cyc = Ln / Ptide
        tol = max(0.1, T['LOOP_TIDE_TOL'] * Ptide)          # the block grid is 0.1 s
        ok_t = (np.abs(cyc - np.round(cyc)) * Ptide <= tol) & (np.round(cyc) >= 1)
        res['loop_tide_period_s'], res['loop_tide_source'] = Ptide, src
        if np.isfinite(Dm[ok_t]).any():
            Dm = np.where(ok_t, Dm, np.inf)
            res['loop_tide_kept'] = True
        else:
            res['loop_tide_kept'] = False
    i, j = np.unravel_index(np.argmin(Dm), Dm.shape)
    if not np.isfinite(Dm[i, j]):
        return res
    ts, te = t0 + tc[s_idx[i]] + off, t0 + tc[e_idx[j]] + off
    res.update({'best_loop_start_s': ts, 'best_loop_end_s': te, 'best_loop_len_s': te - ts,
                'best_loop_dist_db': float(Dm[i, j]), 'best_loop_score': max(0.0, 1.0 - float(Dm[i, j]) / 6.0)})
    if Ptide:
        res['loop_tide_cycles'] = (te - ts) / Ptide
    if chroma_info is not None:
        Cn, cc = chroma_info
        ci, cj = int(np.argmin(np.abs(cc - ts))), int(np.argmin(np.abs(cc - te)))
        res['best_loop_chroma_sim'] = cosine(Cn[ci], Cn[cj])
    return res


def vocals_block(body22):
    res = {'syllabic_ratio_db': None, 'syllabic_mod_index': None, 'vocal_like': None}
    if len(body22) < SR * 10:
        return res
    sos = signal.butter(4, [300, 3400], btype='bandpass', fs=SR, output='sos')
    y = signal.sosfilt(sos, np.asarray(body22, dtype=np.float64))
    env, _ = frame_rms(y, SR, 0.01)
    m = env.mean()
    if m <= 0:
        return res
    e = env / m - 1.0
    f, P = signal.welch(e, fs=100.0, nperseg=min(1024, len(e)), detrend='constant')
    slow = P[(f >= 0.1) & (f < 2.0)].mean()
    syl = P[(f >= 2.0) & (f <= 8.0)].mean()
    ratio = float(db_pow(syl) - db_pow(slow))
    sos2 = signal.butter(2, [2.0, 8.0], btype='bandpass', fs=100.0, output='sos')
    mi = float(np.std(signal.sosfiltfilt(sos2, e)))
    res.update({'syllabic_ratio_db': ratio, 'syllabic_mod_index': mi,
                'vocal_like': bool(mi >= T['VOC_MOD_INDEX'] and ratio >= T['VOC_RATIO_DB'])})
    return res


# ───────────────────────────── rules ─────────────────────────────
def verdict(fails, warns, ok_reason, note=None):
    if fails:
        out = {'verdict': 'fail', 'reason': '; '.join(fails)}
    elif warns:
        out = {'verdict': 'warn', 'reason': '; '.join(warns)}
    else:
        out = {'verdict': 'pass', 'reason': ok_reason}
    if note:
        out['reason'] += ' ' + note
    return out


def g(v, nd=1):
    return 'n/a' if v is None else ('%.' + str(nd) + 'f') % v


def rules_block(m):
    R = {}
    at, sp, vo, fl, lp, to, mo, hm, ev, vc, pu = (m['attacks'], m['spectrum'], m['voice'], m['flatness'],
                                                   m['loop'], m['tonality'], m['mono'], m['harmony_motion'],
                                                   m['events'], m['vocals'], m['pulse'])
    # 1 percussion
    rise, ons, hf = at['max_rise_db_50ms_smooth'], at['onsets_per_min'], at['hf_transients_per_min']
    pfl = pu.get('pulse_flux_rms_db') or 0.0
    pul = pu['pulse_strength'] or 0.0           # depth-weighted: an inaudible pulse reads ~0
    f, w = [], []
    if rise > T['PERC_FAIL_RISE_DB']: f.append('max_rise_db_50ms_smooth=%s > %s' % (g(rise), T['PERC_FAIL_RISE_DB']))
    elif rise > T['PERC_WARN_RISE_DB']: w.append('max_rise_db_50ms_smooth=%s > %s' % (g(rise), T['PERC_WARN_RISE_DB']))
    if ons > T['PERC_FAIL_ONSETS']: f.append('onsets_per_min=%s > %s' % (g(ons), T['PERC_FAIL_ONSETS']))
    elif ons > T['PERC_WARN_ONSETS']: w.append('onsets_per_min=%s > %s' % (g(ons), T['PERC_WARN_ONSETS']))
    if hf > T['PERC_WARN_HF']: w.append('hf_transients_per_min=%s > %s' % (g(hf), T['PERC_WARN_HF']))
    if pul > T['PERC_FAIL_PULSE'] and ons > T['PERC_WARN_ONSETS']:
        f.append('pulse_strength=%s > %s with onsets' % (g(pul, 2), T['PERC_FAIL_PULSE']))
    elif pul > T['PERC_WARN_PULSE']: w.append('pulse_strength=%s > %s (flux %s dB)' % (g(pul, 2), T['PERC_WARN_PULSE'], g(pfl, 2)))
    R['rule_percussion'] = verdict(f, w, 'rise(30ms) %s dB, %s onsets/min, %s hf/min, pulse %s (r %s, flux %s dB)'
                                   % (g(rise), g(ons), g(hf), g(pul, 2), g(pu.get('pulse_r'), 2), g(pfl, 2)))
    # 2 audible
    b200, mid, aw = sp['pct_below_200'], sp['pct_200_2k'], sp['a_weighting_loss_db']
    f, w = [], []
    if mid < T['AUD_FAIL_200_2K']: f.append('pct_200_2k=%s < %s' % (g(mid), T['AUD_FAIL_200_2K']))
    elif mid < T['AUD_PASS_200_2K']: w.append('pct_200_2k=%s < %s' % (g(mid), T['AUD_PASS_200_2K']))
    if b200 >= T['AUD_FAIL_BELOW200']: f.append('pct_below_200=%s >= %s' % (g(b200), T['AUD_FAIL_BELOW200']))
    elif b200 >= T['AUD_WARN_BELOW200']: w.append('pct_below_200=%s >= %s' % (g(b200), T['AUD_WARN_BELOW200']))
    if aw >= T['AUD_FAIL_AW_DB']: f.append('a_weighting_loss_db=%s >= %s' % (g(aw), T['AUD_FAIL_AW_DB']))
    elif aw >= T['AUD_WARN_AW_DB']: w.append('a_weighting_loss_db=%s >= %s' % (g(aw), T['AUD_WARN_AW_DB']))
    R['rule_audible'] = verdict(f, w, '200-2k %s %%, <200 %s %%, A-loss %s dB' % (g(mid), g(b200), g(aw)))
    # 3 hf
    hfp = sp['pct_above_2k']
    f, w = [], []
    if hfp > T['HF_FAIL_PCT']: f.append('pct_above_2k=%s > %s' % (g(hfp, 2), T['HF_FAIL_PCT']))
    elif hfp > T['HF_WARN_PCT']: w.append('pct_above_2k=%s > %s' % (g(hfp, 2), T['HF_WARN_PCT']))
    for name in ('vmr_1k_4k_db', 'vmr_2k_8k_db'):
        vmr = vo.get(name)
        if vmr is None:
            continue
        if vmr < T['HF_FAIL_VMR']: f.append('%s=%s < %s' % (name, g(vmr), T['HF_FAIL_VMR']))
        elif vmr < T['HF_WARN_VMR']: w.append('%s=%s < %s' % (name, g(vmr), T['HF_WARN_VMR']))
    R['rule_hf'] = verdict(f, w, '>2k %s %%, VMR 1-4k %s dB, 2-8k %s dB' % (g(hfp, 2), g(vo['vmr_1k_4k_db']), g(vo.get('vmr_2k_8k_db'))))
    # 4 flat
    rg, sw, dr = fl['st_range_db'], fl['max_swell_db'], fl['drift_db_per_min']
    f, w = [], []
    for name, val, kf, kw in (('st_range_db', rg, 'FLAT_FAIL_RANGE', 'FLAT_WARN_RANGE'),
                              ('max_swell_db', sw, 'FLAT_FAIL_SWELL', 'FLAT_WARN_SWELL'),
                              ('drift_db_per_min', dr, 'FLAT_FAIL_DRIFT', 'FLAT_WARN_DRIFT')):
        if val is None:
            continue
        if abs(val) > T[kf]: f.append('|%s|=%s > %s' % (name, g(abs(val), 2), T[kf]))
        elif abs(val) > T[kw]: w.append('|%s|=%s > %s' % (name, g(abs(val), 2), T[kw]))
    note = ('(level tide %s s: range without it %s dB)' % (g(fl['tide_period_s'], 2), g(fl['st_range_detided_db']))
            if fl.get('tide_period_s') else None)
    R['rule_flat'] = verdict(f, w, 'range %s dB, swell %s dB, drift %s dB/min' % (g(rg), g(sw), g(dr, 2)), note)
    # 5 loop
    dist, bd = lp['best_loop_dist_db'], m['levels']['body_duration_s']
    f, w = [], []
    if bd < T['LOOP_MIN_BODY_S']: f.append('body_duration_s=%s < %s' % (g(bd), T['LOOP_MIN_BODY_S']))
    if dist is None: f.append('no loop candidate')
    elif dist > T['LOOP_FAIL_DIST']: f.append('best_loop_dist_db=%s > %s' % (g(dist, 2), T['LOOP_FAIL_DIST']))
    elif dist > T['LOOP_WARN_DIST']: w.append('best_loop_dist_db=%s > %s' % (g(dist, 2), T['LOOP_WARN_DIST']))
    if lp.get('loop_tide_kept') is False:
        w.append('no loop of whole %s s tide cycles: the loop breaks the tide' % g(lp['loop_tide_period_s'], 2))
    tide_note = (' (%s whole cycles of the %s s %s tide)' % (g(lp['loop_tide_cycles'], 2), g(lp['loop_tide_period_s'], 2), lp['loop_tide_source'])
                 if lp.get('loop_tide_kept') else '')
    R['rule_loop'] = verdict(f, w, 'best loop %s-%s s, D %s dB%s' % (g(lp['best_loop_start_s']), g(lp['best_loop_end_s']), g(dist, 2), tide_note))
    # 6 key G
    f, w = [], []
    if to is None or to['root_name'] is None:
        f.append('no tonal content measured')
    else:
        rn, tun, hc, conf = to['root_name'], to['tuning_offset_cents'], to['harmony_class'], to['root_confidence']
        res, grid = to['tuning_residual_cents'], to['tuning_grid']
        if to['tuning_concentration'] < T['KEY_MIN_CONC']:
            w.append('weak tonality: tuning_concentration=%s < %s' % (g(to['tuning_concentration'], 2), T['KEY_MIN_CONC']))
        if rn == 'Sol':
            if abs(res) > T['KEY_WARN_TUNING']:
                w.append('off both grids: %+.1f c vs 440, nearest %s grid by %+.1f c > %s'
                         % (tun, grid, res, T['KEY_WARN_TUNING']))
            if hc == 'cluster': w.append('harmony_class=cluster')
            if conf < T['KEY_MIN_CONF']: w.append('root_confidence=%s < %s (runner-up %s)' % (g(conf, 2), T['KEY_MIN_CONF'], to['runner_up_name']))
        elif to['sol_score_rel'] is not None and to['sol_score_rel'] >= 1.0 - T['KEY_RUNNERUP_MARGIN']:
            w.append('root=%s but Sol scores %s of it' % (rn, g(to['sol_score_rel'], 2)))
        else:
            f.append('root=%s (Sol scores %s of it), harmony %s' % (rn, g(to['sol_score_rel'], 2), hc))
        ok = 'root %s %s, tuning %+.1f c vs 440 (%s grid, %+.1f c), f0 %s Hz' % (rn, hc, tun, grid, res, g(to['f0_hz'], 2))
    R['rule_key_G'] = verdict(f, w, ok if not f and not w else '')
    # 7 mono
    f, w = [], []
    losses = [('mono_sum_loss_db', mo['mono_sum_loss_db'])] + [('loss' + k, v) for k, v in mo['mono_loss_bands_db'].items()]
    for name, val in losses:
        if val is None:
            continue
        if val < T['MONO_FAIL_DB']: f.append('%s=%s < %s' % (name, g(val), T['MONO_FAIL_DB']))
        elif val < T['MONO_WARN_DB']: w.append('%s=%s < %s' % (name, g(val), T['MONO_WARN_DB']))
    if mo['lr_correlation'] is not None and mo['lr_correlation'] < T['MONO_WARN_CORR']:
        w.append('lr_correlation=%s < %s' % (g(mo['lr_correlation'], 2), T['MONO_WARN_CORR']))
    R['rule_mono'] = verdict(f, w, 'corr %s, loss %s dB' % (g(mo['lr_correlation'], 2), g(mo['mono_sum_loss_db'], 2)))
    # 8 melody / progression
    f, w = [], []
    ms, hcpm = (hm or {}).get('melody_score'), (hm or {}).get('harmonic_changes_per_min')
    if ms is not None:
        if ms > T['MEL_FAIL_PER_MIN']: f.append('melody_score=%s > %s' % (g(ms), T['MEL_FAIL_PER_MIN']))
        elif ms > T['MEL_WARN_PER_MIN']: w.append('melody_score=%s > %s' % (g(ms), T['MEL_WARN_PER_MIN']))
    if hcpm is not None:
        if hcpm > T['HARM_FAIL_PER_MIN']: f.append('harmonic_changes_per_min=%s > %s' % (g(hcpm, 2), T['HARM_FAIL_PER_MIN']))
        elif hcpm > T['HARM_WARN_PER_MIN']: w.append('harmonic_changes_per_min=%s > %s' % (g(hcpm, 2), T['HARM_WARN_PER_MIN']))
    R['rule_no_melody'] = verdict(f, w, 'melody %s/min, harmonic changes %s/min' % (g(ms), g(hcpm, 2)))
    # 9 events
    f, w = [], []
    epm = ev['novelty_events_per_min']
    if epm is not None:
        if epm > T['EV_FAIL_PER_MIN']: f.append('novelty_events_per_min=%s > %s' % (g(epm, 2), T['EV_FAIL_PER_MIN']))
        elif epm > T['EV_WARN_PER_MIN']: w.append('novelty_events_per_min=%s > %s' % (g(epm, 2), T['EV_WARN_PER_MIN']))
    R['rule_no_events'] = verdict(f, w, '%s novelty events/min' % g(epm, 2))
    # extra: vocals
    f, w = [], []
    if vc['vocal_like']:
        f.append('vocal_like: mod_index %s, ratio %s dB' % (g(vc['syllabic_mod_index'], 3), g(vc['syllabic_ratio_db'])))
    elif vc['syllabic_mod_index'] is not None and vc['syllabic_mod_index'] >= 0.75 * T['VOC_MOD_INDEX']:
        w.append('syllabic_mod_index=%s near %s' % (g(vc['syllabic_mod_index'], 3), T['VOC_MOD_INDEX']))
    R['rule_no_vocals'] = verdict(f, w, 'mod_index %s, ratio %s dB' % (g(vc['syllabic_mod_index'], 3), g(vc['syllabic_ratio_db'])))
    return R


# ───────────────────────────── per-file analysis ─────────────────────────────
def analyse(path, voice_spec):
    t_start = time.time()
    path = os.path.abspath(path)
    pr = probe(path)
    st = decode(path, pr['channels'])                       # native rate, (n, 2)
    sr_n = pr['sample_rate']
    m22 = decode(path, pr['channels'], SR).mean(axis=1)     # (L+R)/2 at 22050
    dur = len(st) / sr_n
    mono_n = st.mean(axis=1)

    # ── body ──
    env, edges, ini, fin = find_body(m22)
    b0, b1 = int(edges[ini]), int(edges[fin + 1])
    t0, t1 = b0 / SR, b1 / SR
    body = m22[b0:b1]
    n0, n1 = int(round(t0 * sr_n)), int(round(t1 * sr_n))
    body_n = mono_n[n0:n1]
    st_body = st[n0:n1]
    body_min = (t1 - t0) / 60.0
    env_db = np.maximum(db_amp(env), ENV_FLOOR_DB)

    # ── format & levels ──
    i_lufs, lra = ebur128(path)
    body_rms = rms(body_n)
    levels = {'peak_dbfs': float(db_amp(np.abs(st).max())), 'rms_dbfs': float(db_amp(rms(mono_n))),
              'body_rms_dbfs': float(db_amp(body_rms)), 'body_start_s': t0, 'body_end_s': t1,
              'body_duration_s': t1 - t0,
              'crest_db': float(db_amp(np.abs(body_n).max()) - db_amp(body_rms)),
              'integrated_lufs': i_lufs, 'loudness_range_lu': lra}
    fmt = {'duration_s': dur, 'channels': pr['channels'], 'sample_rate': sr_n,
           'bitrate_kbps': pr['bitrate_kbps'] if pr['bitrate_kbps'] else pr['size_bytes'] * 8 / dur / 1000.0,
           'codec': pr['codec'], 'size_bytes': pr['size_bytes'],
           'size_at_64kbps_mono_mb': 64000.0 * dur / 8.0 / 1048576.0}

    # ── long-term spectrum (native mono body) ──
    fw, Pw = welch_mono(body_n, sr_n)
    pos = fw > 0
    tot = max(float(Pw[pos].sum()), 1e-30)
    band_pct = {name: float(100.0 * Pw[(fw >= lo) & (fw < hi) & pos].sum() / tot) for name, lo, hi in BANDS}
    aw = float(db_pow(tot) - db_pow(np.sum(Pw[pos] * 10 ** (a_weight_db(fw[pos]) / 10.0))))
    spectrum = {'band_pct': band_pct,
                'pct_below_200': band_pct['<100'] + band_pct['100-200'],
                'pct_200_2k': band_pct['200-500'] + band_pct['500-1k'] + band_pct['1k-2k'],
                'pct_above_2k': band_pct['2k-4k'] + band_pct['4k-8k'] + band_pct['>8k'],
                'a_weighting_loss_db': aw}

    # ── mono22 STFT, mel ──
    P, _ = stft_power(body)
    e = P.sum(axis=1)
    cen = (P @ STFT_FREQS) / np.maximum(e, 1e-20)
    spectrum['spectral_centroid_hz'] = float(cen[e > 0].mean()) if (e > 0).any() else None
    Pm = P @ MEL_FB.T                                        # (frames, 48) band power
    top = np.percentile(db_pow(Pm), 99)
    pref = 10 ** ((top - SOFT_FLOOR_DB) / 10.0)
    L = soft_log(Pm, pref)

    # ── voice competition ──
    music_spec = P.mean(axis=0).astype(np.float64)
    gain = 10 ** ((APP_TARGET_BODY_RMS_DBFS - db_amp(body_rms)) / 20.0)
    ms_app = music_spec * gain * gain

    def band_sum(spec, lo, hi):
        return spec[(STFT_FREQS >= lo) & (STFT_FREQS < hi)].sum()

    vmr_bands = {}
    for k, nom in zip(range(-8, 10), THIRD_OCT_NOMINAL):
        fc = 1000.0 * 2 ** (k / 3.0)
        lo, hi = fc * 2 ** (-1 / 6.0), fc * 2 ** (1 / 6.0)
        vmr_bands[str(nom)] = float(db_pow(band_sum(voice_spec, lo, hi)) - db_pow(band_sum(ms_app, lo, hi)))
    worst = min(vmr_bands, key=vmr_bands.get)
    voice = {'app_gain': float(gain), 'app_gain_db': float(db_amp(gain)),
             'vmr_200_1k_db': float(db_pow(band_sum(voice_spec, 200, 1000)) - db_pow(band_sum(ms_app, 200, 1000))),
             'vmr_1k_4k_db': float(db_pow(band_sum(voice_spec, 1000, 4000)) - db_pow(band_sum(ms_app, 1000, 4000))),
             'vmr_2k_8k_db': float(db_pow(band_sum(voice_spec, 2000, 8000)) - db_pow(band_sum(ms_app, 2000, 8000))),
             'worst_band_hz': int(worst), 'worst_band_vmr_db': vmr_bands[worst], 'vmr_bands_db': vmr_bands}

    # ── attacks ──
    lag = T['ONSET_LAG_FRAMES']
    dL = np.maximum(0.0, L[lag:] - L[:-lag])
    hfb = MEL_CENTRES > 2000.0
    flux = np.concatenate([np.zeros(lag), topk_mean(dL)])
    flux_hf = np.concatenate([np.zeros(lag), topk_mean(dL[:, hfb])])
    pk, _ = onset_detect(flux, T['ONSET_K'], T['ONSET_MIN_FLUX_DB'], T['ONSET_MIN_GAP_S'], T['ONSET_LOCAL_MEDIAN_S'])
    pkh, _ = onset_detect(flux_hf, T['ONSET_K'], T['ONSET_MIN_FLUX_DB'], T['ONSET_MIN_GAP_S'], T['ONSET_LOCAL_MEDIAN_S'])
    fmed = float(np.median(flux))
    fsig = float(1.4826 * np.median(np.abs(flux - fmed)))
    edge = int(round(T['RISE_EDGE_S'] / 0.01))
    e_lo, e_hi = ini + edge, fin + 1 - edge
    if e_hi - e_lo <= 10:                                    # very short body: no guard
        e_lo, e_hi = ini, fin + 1
    benv = env_db[e_lo:e_hi]
    rises = benv[5:] - benv[:-5] if len(benv) > 5 else np.zeros(1)
    ir = int(np.argmax(rises))
    # the same on a 30 ms RMS window (10 ms hop): a 10 ms window is shorter than one period below
    # 100 Hz, so a low chord's beating ripples it by several dB with no attack at all
    env30 = np.maximum(db_pow(ndimage.uniform_filter1d(env ** 2, size=3, mode='nearest')), ENV_FLOOR_DB)
    b30 = env30[e_lo:e_hi]
    rises30 = b30[5:] - b30[:-5] if len(b30) > 5 else np.zeros(1)
    ir30 = int(np.argmax(rises30))
    attacks = {'onsets_per_min': len(pk) / body_min, 'n_onsets': int(len(pk)),
               'onset_times_s': (t0 + pk[:20] * FRAME_S + N_FFT / 2.0 / SR).tolist(),
               'max_rise_db_50ms': float(rises[ir]), 'max_rise_at_s': (e_lo + ir + 5) * 0.01,
               'max_rise_db_50ms_smooth': float(rises30[ir30]), 'max_rise_smooth_at_s': (e_lo + ir30 + 5) * 0.01,
               'hf_transients_per_min': len(pkh) / body_min, 'n_hf_transients': int(len(pkh)),
               'onset_flux_median_db': fmed, 'onset_flux_sigma_db': fsig,
               'onset_flux_max_db': float(flux.max()) if len(flux) else None}

    # ── flatness ──
    r1, _ = frame_rms(body, SR, 1.0)
    flat = {'st_range_db': None, 'drift_db_per_min': None, 'max_swell_db': None, 'max_swell_at_s': None,
            'st_range_detided_db': None, 'tide_period_s': None}
    if len(r1) >= 3:
        d1 = db_amp(r1)
        flat['st_range_db'] = float(np.percentile(d1, 95) - np.percentile(d1, 5))
        flat['drift_db_per_min'] = float(np.polyfit(np.arange(len(d1)), d1, 1)[0] * 60.0)
        e1 = r1 ** 2
        e3 = ndimage.uniform_filter1d(e1, size=3, mode='nearest')
        d3 = db_pow(e3)
        med = ndimage.median_filter(d3, size=31, mode='nearest') if len(d3) >= 31 \
            else np.full_like(d3, np.median(d3))
        dev = d3 - med
        j = int(np.argmax(np.abs(dev)))
        flat['max_swell_db'] = float(dev[j])
        flat['max_swell_at_s'] = t0 + j + 0.5

    # ── fades ──
    head = rms(mono_n[:min(sr_n, len(mono_n))])
    tail = rms(mono_n[-min(sr_n, len(mono_n)):])
    above = np.nonzero(db_amp(env) > SILENCE_DBFS)[0]
    fades = {'fade_in_db': float(db_amp(head) - db_amp(body_rms)), 'fade_out_db': float(db_amp(tail) - db_amp(body_rms)),
             'lead_silence_s': float(above[0] * 0.01) if len(above) else dur,
             'tail_silence_s': float((len(env) - 1 - above[-1]) * 0.01 + (len(m22) - edges[-1]) / SR) if len(above) else dur}

    # ── periodicity ──
    r100, _ = frame_rms(body, SR, 0.1)
    per = {'envelope': None, 'centroid': None}
    if len(r100) >= 100:
        per['envelope'] = periodicity(highpass_detrend(np.maximum(db_amp(r100), ENV_FLOOR_DB), 0.1), 0.1)
        n5 = (P.shape[0] // 5) * 5
        P5 = P[:n5].reshape(-1, 5, P.shape[1]).sum(axis=1)
        c5 = (P5 @ STFT_FREQS) / np.maximum(P5.sum(axis=1), 1e-20)
        per['centroid'] = periodicity(highpass_detrend(c5, 0.1), 0.1)
        # flatness with the level tide removed: is the track flat APART from its tide?
        pe = per['envelope']
        if pe['dominant_period_s'] and pe['dominant_r'] is not None and pe['dominant_r'] >= T['PERIODIC_R']:
            Pt = pe['dominant_period_s']
            e100 = np.maximum(db_amp(r100), ENV_FLOOR_DB)
            ph = np.minimum((((np.arange(len(e100)) * 0.1) % Pt) / Pt * 20).astype(int), 19)
            prof = np.bincount(ph, weights=e100 - e100.mean(), minlength=20) / np.maximum(np.bincount(ph, minlength=20), 1)
            res = e100 - prof[ph]
            m10 = len(res) // 10
            if m10 >= 3:
                r1dt = db_pow(np.mean(10 ** (res[:m10 * 10].reshape(m10, 10) / 10.0), axis=1))
                flat['st_range_detided_db'] = float(np.percentile(r1dt, 95) - np.percentile(r1dt, 5))
                flat['tide_period_s'] = Pt

    # ── pulse ──
    fl_hp = flux - ndimage.uniform_filter1d(flux, size=51, mode='reflect')
    pfx = float(np.sqrt(np.mean(fl_hp ** 2)))
    pulse = {'pulse_strength': 0.0, 'pulse_r': 0.0, 'pulse_bpm': None, 'pulse_period_s': None,
             'pulse_flux_rms_db': pfx}
    lags, r = acf_pearson(fl_hp, 100, min_overlap=200)
    if len(r) > 13:
        pk2, _ = signal.find_peaks(r)
        pk2 = pk2[(pk2 >= 12) & (pk2 <= 100) & (pk2 < len(r) - 1)]
        if len(pk2):
            best = pk2[np.argmax(r[pk2])]
            lp_, rv = parabolic(r, int(best))
            aud = min(1.0, max(0.0, (pfx - T['PULSE_MIN_FLUX_DB']) / (T['PULSE_FULL_FLUX_DB'] - T['PULSE_MIN_FLUX_DB'])))
            pulse.update({'pulse_r': float(rv), 'pulse_strength': float(max(0.0, rv) * aud),
                          'pulse_bpm': 60.0 / (lp_ * FRAME_S), 'pulse_period_s': lp_ * FRAME_S})

    # ── tonality, motion ──
    tonality, motion, chroma_info = tonality_block(body, t0)

    events = novelty_block(Pm, pref, t0)
    loop = loop_block(Pm, pref, t0, chroma_info, per, spectrum.get('spectral_centroid_hz'))
    vocals = vocals_block(body)

    # ── mono ──
    Lc, Rc = st_body[:, 0].astype(np.float64), st_body[:, 1].astype(np.float64)
    if np.std(Lc) > 0 and np.std(Rc) > 0:
        corr = float(np.corrcoef(Lc, Rc)[0, 1])
    else:
        corr = 1.0 if np.allclose(Lc, Rc) else 0.0
    mloss = float(db_amp(rms(body_n)) - db_amp(0.5 * (rms(Lc) + rms(Rc))))
    _, PL = welch_mono(Lc, sr_n)
    _, PR = welch_mono(Rc, sr_n)
    mb = {}
    for name, lo, hi in (('<200', 0, 200), ('200-2k', 200, 2000), ('>2k', 2000, 1e9)):
        s = (fw >= lo) & (fw < hi) & pos
        ref = 0.5 * (PL[s].sum() + PR[s].sum())
        mb[name] = float(db_pow(Pw[s].sum()) - db_pow(ref)) if ref > 1e-20 else None
    mono = {'lr_correlation': corr, 'mono_sum_loss_db': mloss, 'mono_loss_bands_db': mb}

    m = {'file': os.path.basename(path), 'path': path, 'format': fmt, 'levels': levels, 'spectrum': spectrum,
         'voice': voice, 'attacks': attacks, 'flatness': flat, 'fades': fades, 'periodicity': per,
         'pulse': pulse, 'tonality': tonality, 'harmony_motion': motion, 'events': events, 'loop': loop,
         'vocals': vocals, 'mono': mono}
    m['rules'] = rules_block(m)
    m['timing_s'] = time.time() - t_start
    return m


def _worker(args):
    path, voice_spec = args
    try:
        return clean(analyse(path, voice_spec))
    except Exception as exc:  # one bad file must not sink the batch
        return {'file': os.path.basename(path), 'path': os.path.abspath(path),
                'error': '%s: %s' % (type(exc).__name__, exc), 'traceback': traceback.format_exc()[-2000:]}


def collect(inputs):
    files = []
    for a in inputs:
        if os.path.isdir(a):
            files += sorted(os.path.join(a, f) for f in os.listdir(a)
                            if f.lower().endswith(AUDIO_EXT) and os.path.isfile(os.path.join(a, f)))
        elif os.path.isfile(a):
            files.append(a)
        else:
            print('skip (not found): ' + a, file=sys.stderr)
    return [os.path.abspath(f) for f in files]


def main():
    ap = argparse.ArgumentParser(description='PACE Respira background-music analyser')
    ap.add_argument('out')
    ap.add_argument('audio', nargs='+')
    ap.add_argument('--voice-dir', default=VOICE_DIR_DEFAULT)
    ap.add_argument('--jobs', type=int, default=min(4, os.cpu_count() or 1))
    a = ap.parse_args()
    files = collect(a.audio)
    if not files:
        sys.exit('no audio files')
    vref = voice_reference(a.voice_dir)
    t = time.time()
    jobs = [(f, vref['spectrum']) for f in files]
    if a.jobs > 1 and len(files) > 1:
        ctx = multiprocessing.get_context('fork')
        with ProcessPoolExecutor(max_workers=a.jobs, mp_context=ctx) as ex:
            results = list(ex.map(_worker, jobs))
    else:
        results = [_worker(j) for j in jobs]
    out = {'meta': {'tool': 'medir.py', 'analysis_sr': SR, 'app_target_body_rms_dbfs': APP_TARGET_BODY_RMS_DBFS,
                    'cents_440_to_432': CENTS_440_TO_432, 'target_cycles_s': TARGET_CYCLES_S,
                    'voice_dir': os.path.abspath(a.voice_dir), 'voice_files': vref['files'],
                    'thresholds': THRESHOLDS, 'elapsed_s': time.time() - t},
           'tracks': results}
    with open(a.out, 'w', encoding='utf-8') as fh:
        json.dump(clean(out), fh, ensure_ascii=False, indent=1, allow_nan=False)
    for r in results:
        if 'error' in r:
            print('ERROR %s: %s' % (r['file'], r['error']), file=sys.stderr)
        else:
            v = ' '.join('%s=%s' % (k.replace('rule_', ''), x['verdict'][0].upper()) for k, x in r['rules'].items())
            print('%-36s %5.1fs  %s' % (r['file'], r['timing_s'], v))
    print('wrote %s (%d tracks, %.1f s)' % (a.out, len(results), time.time() - t))


if __name__ == '__main__':
    main()
