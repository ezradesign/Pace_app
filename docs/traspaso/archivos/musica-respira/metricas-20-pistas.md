# Respira · candidate tracks · measured metrics

Analyser: `medidor/medir.py` (validated on the synthetic bench `sinteticos/expected.json`: 352/352 hard
expectations incl. 1 relaxed with reason, 20/20 soft/optional, 24/24 extra checks; report in
`salida/validacion_final.txt`). Full per-track fields: `analisis/metricas.json`. Table built by
`medidor/resumen.py --reasons`. Verdicts are family-blind (e.g. rule_flat fails a deliberate Balance
tide; read the env tide column and the flat reason for it).

| track | dur s | body dBFS | <200 % | 200-2k % | >2k % | A-loss | VMR 1-4k / 2-8k | worst VMR | rise50 30ms | ons/min | pulse | range | swell | drift/min | env P/r/depth | cen P/r/depth | cycles r≥0.3 | root | harmony | tune¢440 (grid res) | f0 @440 | mel/min | harm/min | ev/min | loop D | L/R corr | mono dB | perc | aud | hf | flat | loop | key | mono | mel | ev | voc |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v1-balance10_elevenlabs | 240 | -33.7 | 42.6 | 57.4 | 0.00 | 9.3 | 58.8 / 63.0 | 7.5@315 | 4.8 | 2.0 | 0.00 | 1.7 | -0.7 | +0.09 | – | 10.07/0.14/6Hz | – | Fa | minor m0.65/M0.00 | -1 (440 -0.7) | Fa3 -3¢ | 6.3 | 0.00 | 0.00 | 0.57 | 0.95 | -0.1 | P | W | P | P | P | **F** | P | W | P | P |
| v1-balance12_minimax | 156 | -19.1 | 71.3 | 27.7 | 1.00 | 8.3 | 21.8 / 25.1 | 7.3@500 | 30.3 | 72.0 | 0.76 | 21.1 | -8.9 | +6.66 | 4.81/0.62/9.7dB | 2.40/0.59/374Hz | 12(c0.38) 24(e0.44) | Do | open_fifth m0.00/M0.23 | +2 (440 +1.9) | Sol2 +4¢ | 0.4 | 19.06 | 10.90 | 5.52 (27×4.8s; free 4.70) | 0.47 | -1.3 | **F** | **F** | P | **F** | **F** | **F** | P | **F** | **F** | **F** |
| v1-energia_lyria | 129 | -15.6 | 43.8 | 55.9 | 0.28 | 7.2 | 20.1 / 30.0 | 5.2@315 | 18.0 | 36.8 | 0.46 | 10.1 | -7.6 | +0.81 | 8.00/0.60/9.9dB | 8.00/0.41/165Hz | 8(e0.60) 16(e0.51) 24(e0.54) | Do | open_fifth m0.33/M0.01 | +0 (440 +0.5) | Do3 -0¢ | 3.3 | 9.90 | 16.51 | 1.08 | 0.45 | -1.4 | **F** | P | P | **F** | P | **F** | P | **F** | **F** | W |
| v1-equilibrio_elevenlabs | 240 | -30.3 | 84.4 | 15.6 | 0.00 | 13.1 | 40.7 / 47.9 | 10.8@315 | 5.0 | 1.0 | 0.00 | 9.2 | +2.2 | -0.07 | – | 10.62/0.23/12Hz | – | La | major m0.01/M0.75 | -38 (432 -6.5) | La2 -32¢ | 3.1 | 0.78 | 3.65 | 0.51 | 0.80 | -0.5 | W | **F** | P | **F** | P | **F** | P | W | **F** | P |
| v1-pranayama_minimax | 142 | -20.1 | 40.9 | 58.8 | 0.37 | 5.2 | 17.2 / 28.7 | 4.5@630 | 38.1 | 151.8 | 0.64 | 9.9 | -4.9 | -0.26 | 10.61/0.51/6.6dB | 5.31/0.39/300Hz | – | Fa | open_fifth m0.09/M0.00 | +2 (440 +1.8) | Fa4 +3¢ | 0.9 | 12.76 | 14.53 | 2.55 | 0.70 | -0.7 | **F** | P | P | **F** | W | **F** | P | **F** | **F** | W |
| v1-pranayama_minimax_v2 | 153 | -18.6 | 17.6 | 78.8 | 3.55 | 4.4 | 14.7 / 19.0 | 2.1@315 | 19.1 | 168.0 | 0.90 | 8.5 | -5.2 | +1.51 | 8.51/0.51/7.0dB | 8.50/0.47/375Hz | 8(e0.35) | Re | open_fifth m0.33/M0.01 | -1 (440 -0.7) | Re3 -2¢ | 23.7 | 19.32 | 20.52 | 2.55 | 0.50 | -1.2 | **F** | P | P | **F** | W | **F** | P | **F** | **F** | W |
| v1-relajacion_lyria | 178 | -15.1 | 74.5 | 24.8 | 0.65 | 9.4 | 19.9 / 26.3 | 8.8@500 | 20.7 | 68.9 | 0.79 | 9.3 | -1.6 | +3.17 | 3.98/0.88/4.0dB | 4.01/0.86/478Hz | 2(c0.66) 4(e0.88) 8(e0.86) 10(c0.57) 12(e0.84) 16(e0.82) 20(e0.80) 24(e0.79) 28(e0.78) | La | major m0.21/M0.46 | +1 (440 +0.9) | Si1 -49¢ | 9.2 | 15.01 | 13.65 | 7.91 (40×4.0s; free 6.82) | 0.69 | -0.7 | **F** | **F** | P | **F** | **F** | **F** | P | **F** | **F** | W |
| v2-balance-10_elevenlabs | 240 | -16.8 | 49.8 | 49.9 | 0.31 | 8.2 | 21.5 / 29.4 | 1.2@315 | 1.7 | 0.8 | 0.00 | 5.9 | +3.3 | -0.04 | 19.55/0.24/1.9dB | 20.01/0.37/51Hz | 20(c0.37) | Mi | major m0.25/M0.39 | +1 (440 +0.8) | Mi2 +0¢ | 13.9 | 0.26 | 4.63 | 1.25 | 0.85 | -0.3 | P | W | P | W | P | **F** | P | **F** | **F** | P |
| v2-balance-10_lyria | 180 | -14.5 | 30.8 | 68.9 | 0.23 | 6.8 | 19.5 / 30.8 | 5.8@315 | 23.2 | 10.6 | 0.03 | 8.8 | -4.3 | -0.60 | 15.98/0.56/6.8dB | 16.02/0.30/100Hz | 4(e0.33) 8(e0.39) 12(e0.31) 16(e0.56) 20(e0.34) 24(e0.37) 28(e0.46) | Re | minor m0.55/M0.14 | +1 (440 +0.8) | Fa3 -1¢ | 11.0 | 14.73 | 19.87 | 1.92 | 0.85 | -0.3 | **F** | P | P | **F** | W | **F** | P | **F** | **F** | W |
| v2-balance-10_minimax | 207 | -26.1 | 86.7 | 8.9 | 4.41 | 10.3 | 17.4 / 17.9 | 9.3@3150 | 15.4 | 110.0 | 0.84 | 12.4 | -5.4 | +3.31 | 24.71/0.06/2.2dB | 1.21/0.82/142Hz | 2(c0.68) 19(c0.42) | Re# | open_fifth m0.04/M0.25 | +2 (440 +2.3) | Re2 +10¢ | 1.2 | 16.93 | 0.29 | 12.32 (138×1.2s; free 12.24) | 0.33 | -1.8 | **F** | **F** | P | **F** | **F** | **F** | P | **F** | P | **F** |
| v2-balance-12_elevenlabs | 240 | -15.3 | 40.9 | 58.6 | 0.44 | 7.7 | 18.4 / 27.9 | 0.7@315 | 4.5 | 3.1 | 0.00 | 4.3 | +1.3 | +0.08 | 7.99/0.75/4.2dB | 8.00/0.86/75Hz | 8(c0.86) 16(c0.85) 24(c0.87) | Re | open_fifth m0.02/M0.09 | +0 (440 +0.5) | Re4 -0¢ | 11.8 | 0.00 | 1.54 | 0.94 (26×8.0s; free 0.64) | 0.97 | -0.1 | W | P | P | W | P | **F** | P | **F** | W | P |
| v2-balance-12_minimax | 86 | -23.4 | 49.4 | 38.2 | 12.32 | 4.8 | 11.6 / 13.6 | 3.6@500 | 24.7 | 64.5 | 0.05 | 12.9 | +5.6 | +3.80 | 2.10/0.20/3.2dB | 12.10/0.16/713Hz | – | La# | open_fifth m0.01/M0.01 | -1 (440 -0.9) | La#2 +1¢ | 2.1 | 9.12 | 16.15 | 2.20 | 0.72 | -0.7 | **F** | W | **F** | **F** | W | **F** | P | **F** | **F** | W |
| v2-balance-12_mureka | 164 | -16.3 | 64.5 | 35.5 | 0.04 | 9.7 | 28.3 / 38.0 | 7.8@315 | 37.7 | 162.7 | 0.65 | 13.3 | -10.5 | -1.34 | 23.66/0.36/9.8dB | 2.79/0.45/102Hz | – | Re | major m0.00/M0.43 | +2 (440 +1.7) | Sol2 +4¢ | 18.4 | 19.91 | 18.04 | 1.88 | 0.86 | -0.3 | **F** | **F** | P | **F** | W | **F** | P | **F** | **F** | W |
| v2-energia_elevenlabs | 240 | -15.7 | 61.0 | 38.4 | 0.59 | 8.0 | 18.1 / 26.6 | 3.6@315 | 4.3 | 0.3 | 0.00 | 3.9 | -1.7 | +0.44 | 8.00/0.33/2.2dB | 16.05/0.14/38Hz | 8(e0.33) 16(e0.36) | Sol | open_fifth m0.00/M0.02 | -0 (440 -0.2) | Sol2 -1¢ | 5.7 | 0.00 | 2.83 | 1.36 | 0.78 | -0.5 | P | **F** | P | W | P | P | P | W | W | P |
| v2-energia_minimax | 209 | -20.2 | 69.3 | 28.8 | 1.91 | 7.9 | 17.6 / 22.3 | 7.8@500 | 40.4 | 101.7 | 0.61 | 18.5 | -9.2 | -0.95 | 5.33/0.69/17.1dB | 10.71/0.28/779Hz | 16(e0.62) | Do | major m0.01/M0.54 | -0 (440 -0.4) | Do2 +0¢ | 13.5 | 16.75 | 21.54 | 3.86 (29×5.3s; free 2.84) | 0.68 | -0.8 | **F** | **F** | P | **F** | **F** | **F** | P | **F** | **F** | W |
| v2-equilibrio_elevenlabs | 240 | -16.2 | 33.8 | 66.0 | 0.21 | 6.4 | 19.0 / 31.1 | 3.8@400 | 1.9 | 0.0 | 0.00 | 3.6 | -2.4 | +0.44 | 21.35/0.08/0.9dB | 23.07/0.02/16Hz | – | Re | open_fifth m0.08/M0.24 | +4 (440 +4.3) | Re2 +5¢ | 20.1 | 1.75 | 1.25 | 3.13 | 0.96 | -0.1 | P | P | P | W | **F** | **F** | P | **F** | W | P |
| v2-equilibrio_mureka | 179 | -14.6 | 65.8 | 34.0 | 0.11 | 9.5 | 25.1 / 33.8 | 7.7@315 | 15.7 | 167.8 | 0.81 | 8.1 | -6.0 | -0.03 | 8.14/0.50/2.7dB | 15.86/0.47/156Hz | 4(e0.44) 8(e0.50) 12(e0.32) 16(e0.52) 20(e0.42) 24(e0.53) 28(e0.40) | Re | major m0.00/M0.40 | +2 (440 +2.3) | Re2 +5¢ | 17.3 | 14.85 | 17.28 | 1.90 | 0.83 | -0.4 | **F** | **F** | P | **F** | W | **F** | P | **F** | **F** | W |
| v2-relajacion_elevenlabs | 240 | -24.6 | 86.6 | 13.4 | 0.03 | 12.3 | 30.5 / 39.1 | 11.4@400 | 8.0 | 0.5 | 0.00 | 12.5 | -7.2 | +0.50 | 6.45/0.46/3.0dB | 26.86/0.13/23Hz | – | Sol | open_fifth m0.00/M0.01 | -0 (440 -0.1) | Sol2 -2¢ | 5.7 | 0.52 | 4.66 | 1.26 | 0.56 | -1.1 | W | **F** | P | **F** | P | P | P | W | **F** | W |
| v2-relajacion_lyria | 181 | -14.8 | 89.9 | 10.0 | 0.12 | 13.0 | 25.5 / 33.5 | 13.1@315 | 34.1 | 140.1 | 0.79 | 16.8 | -7.8 | +0.75 | 12.12/0.87/9.2dB | 12.11/0.84/164Hz | 12(e0.87) 24(e0.82) | Mi | open_fifth m0.12/M0.17 | -3 (440 -2.9) | Fa3 -1¢ | 13.2 | 16.92 | 15.91 | 2.38 (11×12.1s; free 1.05) | 0.78 | -0.5 | **F** | **F** | P | **F** | W | **F** | P | **F** | **F** | W |
| v2-relajacion_mureka | 183 | -15.2 | 79.1 | 20.9 | 0.04 | 11.2 | 27.3 / 38.1 | 10.0@500 | 37.0 | 175.8 | 0.84 | 15.8 | -15.5 | -1.61 | 23.70/0.62/14.0dB | 11.95/0.47/262Hz | 12(c0.34) | Sol | open_fifth m0.23/M0.01 | +1 (440 +0.8) | Re#2 -3¢ | 12.0 | 17.94 | 13.96 | 2.94 (6×23.7s; free 2.94) | 0.93 | -0.2 | **F** | **F** | P | **F** | W | P | P | **F** | **F** | W |

Legend: body dBFS = body RMS (app levels this to -36). <200 / 200-2k / >2k = % of power. A-loss = unweighted minus A-weighted dB. VMR = voice-to-music dB at app level (1-4 kHz / 2-8 kHz; worst 1/3-octave band @Hz). rise50 30ms = largest 50 ms rise of the 30 ms RMS envelope (dB; the one rule_percussion uses). pulse = onset-autocorrelation r (0.25-2 s) × audibility (0 when the onset-flux ripple is under 1 dB, full at 2 dB). range = p95-p5 of 1 s RMS; swell = largest 3 s vs 30 s median; drift dB/min. env / cen P/r/depth = dominant period s / ACF r / peak-to-peak depth of the level (dB) / centroid (Hz) tide. cycles = exercise cycles where r AT that lag ≥ 0.3 and an ACF peak with prominence ≥ 0.1 sits within ±0.25 s (e = level, c = centroid). harmony m/M = presence (0-1) of the minor / major third against the root/fifth within an octave. tune¢440 = tuning offset vs A=440; grid = nearer acceptable grid (440: post-production shifts -31.8¢; 432: already at the app tuning, do not shift) and the residual from it. f0 = strongest 60-500 Hz peak of the long-term spectrum. mel/min = melody changes; harm/min = chord changes; ev/min = novelty events (liftered: a slow filter tide is not an event); loop D = best loop mismatch dB, with (k×P; free D) when a clear tide forces whole tide cycles (free = best D ignoring the tide). mono dB = level of the mono sum vs the channels (negative = loss; -3 = uncorrelated, << -3 = cancellation). Verdicts P/W/F: percussion, audible, hf, flat, loop, key G, mono, melody, events, vocals.

**Warn / fail reasons**
- v1-balance10_elevenlabs · aud · warn: a_weighting_loss_db=9.3 >= 9.0
- v1-balance10_elevenlabs · key · fail: root=Fa (Sol scores 0.17 of it), harmony minor
- v1-balance10_elevenlabs · mel · warn: melody_score=6.3 > 3.0
- v1-balance12_minimax · perc · fail: max_rise_db_50ms_smooth=30.3 > 10.0; onsets_per_min=72.0 > 12.0; pulse_strength=0.76 > 0.5 with onsets
- v1-balance12_minimax · aud · fail: pct_200_2k=27.7 < 35.0; pct_below_200=71.3 >= 60.0
- v1-balance12_minimax · flat · fail: |st_range_db|=21.09 > 6.0; |max_swell_db|=8.86 > 4.0; |drift_db_per_min|=6.66 > 1.5 (level tide 4.81 s: range without it 19.7 dB)
- v1-balance12_minimax · loop · fail: best_loop_dist_db=5.52 > 3.0
- v1-balance12_minimax · key · fail: root=Do (Sol scores 0.58 of it), harmony open_fifth
- v1-balance12_minimax · mel · fail: harmonic_changes_per_min=19.06 > 2.0
- v1-balance12_minimax · ev · fail: novelty_events_per_min=10.90 > 3.0
- v1-balance12_minimax · voc · fail: vocal_like: mod_index 0.405, ratio -1.8 dB
- v1-energia_lyria · perc · fail: max_rise_db_50ms_smooth=18.0 > 10.0; onsets_per_min=36.8 > 12.0
- v1-energia_lyria · flat · fail: |st_range_db|=10.13 > 6.0; |max_swell_db|=7.65 > 4.0 (level tide 8.00 s: range without it 7.0 dB)
- v1-energia_lyria · key · fail: root=Do (Sol scores 0.29 of it), harmony open_fifth
- v1-energia_lyria · mel · fail: harmonic_changes_per_min=9.90 > 2.0
- v1-energia_lyria · ev · fail: novelty_events_per_min=16.51 > 3.0
- v1-energia_lyria · voc · warn: syllabic_mod_index=0.190 near 0.12
- v1-equilibrio_elevenlabs · perc · warn: hf_transients_per_min=38.8 > 3.0
- v1-equilibrio_elevenlabs · aud · fail: pct_200_2k=15.6 < 35.0; pct_below_200=84.4 >= 60.0; a_weighting_loss_db=13.1 >= 11.0
- v1-equilibrio_elevenlabs · flat · fail: |st_range_db|=9.18 > 6.0
- v1-equilibrio_elevenlabs · key · fail: root=La (Sol scores 0.00 of it), harmony major
- v1-equilibrio_elevenlabs · mel · warn: melody_score=3.1 > 3.0; harmonic_changes_per_min=0.78 > 0.5
- v1-equilibrio_elevenlabs · ev · fail: novelty_events_per_min=3.65 > 3.0
- v1-pranayama_minimax · perc · fail: max_rise_db_50ms_smooth=38.1 > 10.0; onsets_per_min=151.8 > 12.0; pulse_strength=0.64 > 0.5 with onsets
- v1-pranayama_minimax · flat · fail: |st_range_db|=9.94 > 6.0; |max_swell_db|=4.90 > 4.0 (level tide 10.61 s: range without it 10.0 dB)
- v1-pranayama_minimax · loop · warn: best_loop_dist_db=2.55 > 1.5
- v1-pranayama_minimax · key · fail: root=Fa (Sol scores 0.07 of it), harmony open_fifth
- v1-pranayama_minimax · mel · fail: harmonic_changes_per_min=12.76 > 2.0
- v1-pranayama_minimax · ev · fail: novelty_events_per_min=14.53 > 3.0
- v1-pranayama_minimax · voc · warn: syllabic_mod_index=0.466 near 0.12
- v1-pranayama_minimax_v2 · perc · fail: max_rise_db_50ms_smooth=19.1 > 10.0; onsets_per_min=168.0 > 12.0; pulse_strength=0.90 > 0.5 with onsets
- v1-pranayama_minimax_v2 · flat · fail: |st_range_db|=8.52 > 6.0; |max_swell_db|=5.20 > 4.0; |drift_db_per_min|=1.51 > 1.5 (level tide 8.51 s: range without it 7.5 dB)
- v1-pranayama_minimax_v2 · loop · warn: best_loop_dist_db=2.55 > 1.5
- v1-pranayama_minimax_v2 · key · fail: root=Re (Sol scores 0.72 of it), harmony open_fifth
- v1-pranayama_minimax_v2 · mel · fail: melody_score=23.7 > 10.0; harmonic_changes_per_min=19.32 > 2.0
- v1-pranayama_minimax_v2 · ev · fail: novelty_events_per_min=20.52 > 3.0
- v1-pranayama_minimax_v2 · voc · warn: syllabic_mod_index=0.249 near 0.12
- v1-relajacion_lyria · perc · fail: max_rise_db_50ms_smooth=20.7 > 10.0; onsets_per_min=68.9 > 12.0; pulse_strength=0.79 > 0.5 with onsets
- v1-relajacion_lyria · aud · fail: pct_200_2k=24.8 < 35.0; pct_below_200=74.5 >= 60.0
- v1-relajacion_lyria · flat · fail: |st_range_db|=9.35 > 6.0; |drift_db_per_min|=3.17 > 1.5 (level tide 3.98 s: range without it 8.3 dB)
- v1-relajacion_lyria · loop · fail: best_loop_dist_db=7.91 > 3.0
- v1-relajacion_lyria · key · fail: root=La (Sol scores 0.11 of it), harmony major
- v1-relajacion_lyria · mel · fail: harmonic_changes_per_min=15.01 > 2.0
- v1-relajacion_lyria · ev · fail: novelty_events_per_min=13.65 > 3.0
- v1-relajacion_lyria · voc · warn: syllabic_mod_index=0.183 near 0.12
- v2-balance-10_elevenlabs · aud · warn: pct_200_2k=49.9 < 50.0; pct_below_200=49.8 >= 45.0
- v2-balance-10_elevenlabs · flat · warn: |st_range_db|=5.90 > 3.0; |max_swell_db|=3.26 > 2.5
- v2-balance-10_elevenlabs · key · fail: root=Mi (Sol scores 0.61 of it), harmony major
- v2-balance-10_elevenlabs · mel · fail: melody_score=13.9 > 10.0
- v2-balance-10_elevenlabs · ev · fail: novelty_events_per_min=4.63 > 3.0
- v2-balance-10_lyria · perc · fail: max_rise_db_50ms_smooth=23.2 > 10.0
- v2-balance-10_lyria · flat · fail: |st_range_db|=8.78 > 6.0; |max_swell_db|=4.26 > 4.0 (level tide 15.98 s: range without it 7.3 dB)
- v2-balance-10_lyria · loop · warn: best_loop_dist_db=1.92 > 1.5
- v2-balance-10_lyria · key · fail: root=Re (Sol scores 0.53 of it), harmony minor
- v2-balance-10_lyria · mel · fail: melody_score=11.0 > 10.0; harmonic_changes_per_min=14.73 > 2.0
- v2-balance-10_lyria · ev · fail: novelty_events_per_min=19.87 > 3.0
- v2-balance-10_lyria · voc · warn: syllabic_mod_index=0.123 near 0.12
- v2-balance-10_minimax · perc · fail: max_rise_db_50ms_smooth=15.4 > 10.0; onsets_per_min=110.0 > 12.0; pulse_strength=0.84 > 0.5 with onsets
- v2-balance-10_minimax · aud · fail: pct_200_2k=8.9 < 35.0; pct_below_200=86.7 >= 60.0
- v2-balance-10_minimax · flat · fail: |st_range_db|=12.41 > 6.0; |max_swell_db|=5.44 > 4.0; |drift_db_per_min|=3.31 > 1.5
- v2-balance-10_minimax · loop · fail: best_loop_dist_db=12.32 > 3.0
- v2-balance-10_minimax · key · fail: root=Re# (Sol scores 0.75 of it), harmony open_fifth
- v2-balance-10_minimax · mel · fail: harmonic_changes_per_min=16.93 > 2.0
- v2-balance-10_minimax · voc · fail: vocal_like: mod_index 0.407, ratio 4.9 dB
- v2-balance-12_elevenlabs · perc · warn: onsets_per_min=3.1 > 3.0; hf_transients_per_min=3.6 > 3.0
- v2-balance-12_elevenlabs · flat · warn: |st_range_db|=4.34 > 3.0 (level tide 7.99 s: range without it 1.6 dB)
- v2-balance-12_elevenlabs · key · fail: root=Re (Sol scores 0.51 of it), harmony open_fifth
- v2-balance-12_elevenlabs · mel · fail: melody_score=11.8 > 10.0
- v2-balance-12_elevenlabs · ev · warn: novelty_events_per_min=1.54 > 1.0
- v2-balance-12_minimax · perc · fail: max_rise_db_50ms_smooth=24.7 > 10.0; onsets_per_min=64.5 > 12.0
- v2-balance-12_minimax · aud · warn: pct_200_2k=38.2 < 50.0; pct_below_200=49.4 >= 45.0
- v2-balance-12_minimax · hf · fail: pct_above_2k=12.32 > 10.0
- v2-balance-12_minimax · flat · fail: |st_range_db|=12.89 > 6.0; |max_swell_db|=5.63 > 4.0; |drift_db_per_min|=3.80 > 1.5
- v2-balance-12_minimax · loop · warn: best_loop_dist_db=2.20 > 1.5
- v2-balance-12_minimax · key · fail: root=La# (Sol scores 0.22 of it), harmony open_fifth
- v2-balance-12_minimax · mel · fail: harmonic_changes_per_min=9.12 > 2.0
- v2-balance-12_minimax · ev · fail: novelty_events_per_min=16.15 > 3.0
- v2-balance-12_minimax · voc · warn: syllabic_mod_index=0.437 near 0.12
- v2-balance-12_mureka · perc · fail: max_rise_db_50ms_smooth=37.7 > 10.0; onsets_per_min=162.7 > 12.0; pulse_strength=0.65 > 0.5 with onsets
- v2-balance-12_mureka · aud · fail: pct_below_200=64.5 >= 60.0
- v2-balance-12_mureka · flat · fail: |st_range_db|=13.25 > 6.0; |max_swell_db|=10.53 > 4.0 (level tide 23.66 s: range without it 11.6 dB)
- v2-balance-12_mureka · loop · warn: best_loop_dist_db=1.88 > 1.5
- v2-balance-12_mureka · key · fail: root=Re (Sol scores 0.67 of it), harmony major
- v2-balance-12_mureka · mel · fail: melody_score=18.4 > 10.0; harmonic_changes_per_min=19.91 > 2.0
- v2-balance-12_mureka · ev · fail: novelty_events_per_min=18.04 > 3.0
- v2-balance-12_mureka · voc · warn: syllabic_mod_index=0.256 near 0.12
- v2-energia_elevenlabs · aud · fail: pct_below_200=61.0 >= 60.0
- v2-energia_elevenlabs · flat · warn: |st_range_db|=3.95 > 3.0 (level tide 8.00 s: range without it 3.8 dB)
- v2-energia_elevenlabs · mel · warn: melody_score=5.7 > 3.0
- v2-energia_elevenlabs · ev · warn: novelty_events_per_min=2.83 > 1.0
- v2-energia_minimax · perc · fail: max_rise_db_50ms_smooth=40.4 > 10.0; onsets_per_min=101.7 > 12.0; pulse_strength=0.61 > 0.5 with onsets
- v2-energia_minimax · aud · fail: pct_200_2k=28.8 < 35.0; pct_below_200=69.3 >= 60.0
- v2-energia_minimax · flat · fail: |st_range_db|=18.48 > 6.0; |max_swell_db|=9.17 > 4.0 (level tide 5.33 s: range without it 13.1 dB)
- v2-energia_minimax · loop · fail: best_loop_dist_db=3.86 > 3.0
- v2-energia_minimax · key · fail: root=Do (Sol scores 0.73 of it), harmony major
- v2-energia_minimax · mel · fail: melody_score=13.5 > 10.0; harmonic_changes_per_min=16.75 > 2.0
- v2-energia_minimax · ev · fail: novelty_events_per_min=21.54 > 3.0
- v2-energia_minimax · voc · warn: syllabic_mod_index=0.366 near 0.12
- v2-equilibrio_elevenlabs · flat · warn: |st_range_db|=3.58 > 3.0
- v2-equilibrio_elevenlabs · loop · fail: best_loop_dist_db=3.13 > 3.0
- v2-equilibrio_elevenlabs · key · fail: root=Re (Sol scores 0.52 of it), harmony open_fifth
- v2-equilibrio_elevenlabs · mel · fail: melody_score=20.1 > 10.0
- v2-equilibrio_elevenlabs · ev · warn: novelty_events_per_min=1.25 > 1.0
- v2-equilibrio_mureka · perc · fail: max_rise_db_50ms_smooth=15.7 > 10.0; onsets_per_min=167.8 > 12.0; pulse_strength=0.81 > 0.5 with onsets
- v2-equilibrio_mureka · aud · fail: pct_200_2k=34.0 < 35.0; pct_below_200=65.8 >= 60.0
- v2-equilibrio_mureka · flat · fail: |st_range_db|=8.13 > 6.0; |max_swell_db|=6.01 > 4.0 (level tide 8.14 s: range without it 8.4 dB)
- v2-equilibrio_mureka · loop · warn: best_loop_dist_db=1.90 > 1.5
- v2-equilibrio_mureka · key · fail: root=Re (Sol scores 0.83 of it), harmony major
- v2-equilibrio_mureka · mel · fail: melody_score=17.3 > 10.0; harmonic_changes_per_min=14.85 > 2.0
- v2-equilibrio_mureka · ev · fail: novelty_events_per_min=17.28 > 3.0
- v2-equilibrio_mureka · voc · warn: syllabic_mod_index=0.282 near 0.12
- v2-relajacion_elevenlabs · perc · warn: max_rise_db_50ms_smooth=8.0 > 6.0
- v2-relajacion_elevenlabs · aud · fail: pct_200_2k=13.4 < 35.0; pct_below_200=86.6 >= 60.0; a_weighting_loss_db=12.3 >= 11.0
- v2-relajacion_elevenlabs · flat · fail: |st_range_db|=12.53 > 6.0; |max_swell_db|=7.21 > 4.0 (level tide 6.45 s: range without it 12.0 dB)
- v2-relajacion_elevenlabs · mel · warn: melody_score=5.7 > 3.0; harmonic_changes_per_min=0.52 > 0.5
- v2-relajacion_elevenlabs · ev · fail: novelty_events_per_min=4.66 > 3.0
- v2-relajacion_elevenlabs · voc · warn: syllabic_mod_index=0.091 near 0.12
- v2-relajacion_lyria · perc · fail: max_rise_db_50ms_smooth=34.1 > 10.0; onsets_per_min=140.1 > 12.0; pulse_strength=0.79 > 0.5 with onsets
- v2-relajacion_lyria · aud · fail: pct_200_2k=10.0 < 35.0; pct_below_200=89.9 >= 60.0; a_weighting_loss_db=13.0 >= 11.0
- v2-relajacion_lyria · flat · fail: |st_range_db|=16.85 > 6.0; |max_swell_db|=7.75 > 4.0 (level tide 12.12 s: range without it 16.1 dB)
- v2-relajacion_lyria · loop · warn: best_loop_dist_db=2.38 > 1.5
- v2-relajacion_lyria · key · fail: root=Mi (Sol scores 0.25 of it), harmony open_fifth
- v2-relajacion_lyria · mel · fail: melody_score=13.2 > 10.0; harmonic_changes_per_min=16.92 > 2.0
- v2-relajacion_lyria · ev · fail: novelty_events_per_min=15.91 > 3.0
- v2-relajacion_lyria · voc · warn: syllabic_mod_index=0.301 near 0.12
- v2-relajacion_mureka · perc · fail: max_rise_db_50ms_smooth=37.0 > 10.0; onsets_per_min=175.8 > 12.0; pulse_strength=0.84 > 0.5 with onsets
- v2-relajacion_mureka · aud · fail: pct_200_2k=20.9 < 35.0; pct_below_200=79.1 >= 60.0; a_weighting_loss_db=11.2 >= 11.0
- v2-relajacion_mureka · flat · fail: |st_range_db|=15.80 > 6.0; |max_swell_db|=15.54 > 4.0; |drift_db_per_min|=1.61 > 1.5 (level tide 23.70 s: range without it 14.0 dB)
- v2-relajacion_mureka · loop · warn: best_loop_dist_db=2.94 > 1.5
- v2-relajacion_mureka · mel · fail: melody_score=12.0 > 10.0; harmonic_changes_per_min=17.94 > 2.0
- v2-relajacion_mureka · ev · fail: novelty_events_per_min=13.96 > 3.0
- v2-relajacion_mureka · voc · warn: syllabic_mod_index=0.292 near 0.12
