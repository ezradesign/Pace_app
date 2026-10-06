"""Hace que un drone ya preparado (mono, en Sol a 432, en bucle) respire al ritmo de un ejercicio.

Uso: python3 -I envolvente.py DRONE.mp3 SALIDA.mp3 EJERCICIO [MINUTOS] [PROFUNDIDAD_DB]

La envolvente sigue las fases del ejercicio tal como las define getSequence() en la app:
sube al inhalar, se queda quieta al sostener y baja al exhalar. Mueve a la vez el volumen
(PROFUNDIDAD_DB, 3 dB por defecto) y el brillo: mezcla el drone con una copia oscurecida
por un paso-bajo, así que al inhalar «se abre» y al exhalar «se cierra». Las curvas son de
coseno alzado, sin aristas: nada que suene a ataque encima de la voz.

La salida dura un número ENTERO de ciclos, para que al repetirse siga en fase con la
respiración siempre que la app la arranque en el primer «inhala».
"""
import subprocess
import sys

import numpy as np
from scipy.signal import butter, sosfiltfilt

SR = 44100

# (fase, segundos) por ejercicio, copiado de getSequence() en app/breathe/BreatheVisual.jsx.
# 'i' sube, 's' sostiene donde esté, 'e' baja.
EJERCICIOS = {
    'diafragmatica': [('i', 4), ('e', 4)],
    'box4': [('i', 4), ('s', 4), ('e', 4), ('s', 4)],
    'box6': [('i', 6), ('s', 6), ('e', 6), ('s', 6)],
    'co2': [('i', 4), ('e', 6), ('s', 10)],
    'coherente55': [('i', 5), ('e', 5)],
    'coherente66': [('i', 6), ('e', 6)],
    '478': [('i', 4), ('s', 7), ('e', 8)],
    'suspiro': [('i2', 2), ('i', 1), ('e', 5)],
    'exhala46': [('i', 4), ('e', 6)],
    'yin': [('i', 3), ('e', 5), ('s', 2)],
    'ujjayi': [('i', 5), ('e', 5)],
    'bhramari': [('i', 4), ('e', 8)],
    'nadi': [('i', 4), ('s', 2), ('e', 4), ('i', 4), ('s', 2), ('e', 4)],
    'kumbhaka': [('i', 4), ('s', 16), ('e', 8)],
}


def curva(fases):
    """Valor 0..1 muestra a muestra para UN ciclo. 0 = cerrado (pulmón vacío), 1 = abierto."""
    trozos, v = [], 0.0
    for tipo, seg in fases:
        n = int(round(seg * SR))
        x = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n, endpoint=False))  # 0 -> 1 suave
        if tipo == 'i':
            trozos.append(v + (1.0 - v) * x)
            v = 1.0
        elif tipo == 'i2':  # primera inhalación del suspiro: llega al 80 %
            trozos.append(v + (0.8 - v) * x)
            v = 0.8
        elif tipo == 'e':
            trozos.append(v * (1 - x))
            v = 0.0
        else:
            trozos.append(np.full(n, v))
    return np.concatenate(trozos).astype(np.float32)


def decodifica(ruta, filtros=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', ruta]
    if filtros:
        cmd += ['-af', filtros]
    cmd += ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, dtype=np.float32).copy()


def aplana(x, ventana_s=1.5, tope_db=6.0):
    """Quita las oscilaciones lentas de volumen que ya traiga el drone (respiraciones propias
    de la IA, batidos entre parciales): si no, se mezclan con la envolvente y el ciclo deja
    de ser exacto. Iguala el RMS de ventana deslizante al RMS global, con un tope."""
    n = int(ventana_s * SR)
    c = np.concatenate(([0.0], np.cumsum(x.astype(np.float64) ** 2)))
    i = np.arange(len(x))
    a, b = np.clip(i - n // 2, 0, len(x)), np.clip(i + n // 2, 0, len(x))
    pot = (c[b] - c[a]) / np.maximum(b - a, 1)
    obj = np.mean(x.astype(np.float64) ** 2)
    g = np.sqrt(obj / np.maximum(pot, 1e-12))
    lim = 10 ** (tope_db / 20)
    return (x * np.clip(g, 1 / lim, lim)).astype(np.float32)


def main():
    drone, salida, ejercicio = sys.argv[1], sys.argv[2], sys.argv[3]
    minutos = float(sys.argv[4]) if len(sys.argv) > 4 else 4.0
    prof_db = float(sys.argv[5]) if len(sys.argv) > 5 else 3.0
    fases = EJERCICIOS[ejercicio]
    ciclo = curva(fases)
    n_ciclos = max(1, int(round(minutos * 60 * SR / len(ciclo))))
    m = np.tile(ciclo, n_ciclos)
    claro = decodifica(drone)
    # paso-bajo de FASE CERO: la copia oscura queda en fase con la clara y al mezclarlas no
    # se cancelan (con un filtro normal la mezcla a medias hundía el nivel y la marea crecía)
    oscuro = sosfiltfilt(butter(2, 500, 'low', fs=SR, output='sos'), claro).astype(np.float32)
    # el drone ya hace bucle limpio: se repite hasta cubrir los ciclos
    reps = int(np.ceil(len(m) / len(claro)))
    claro = np.tile(claro, reps)[:len(m)]
    oscuro = np.tile(oscuro, reps)[:len(m)]
    claro, oscuro = aplana(claro), aplana(oscuro)
    # el oscuro pierde nivel al filtrar: se iguala por RMS para que el brillo no mueva el volumen
    oscuro *= np.sqrt(np.mean(claro ** 2) / max(np.mean(oscuro ** 2), 1e-12))
    mezcla = m * claro + (1 - m) * oscuro
    gan = 10 ** ((m - 1) * prof_db / 20)
    y = mezcla * gan
    pico = float(np.max(np.abs(y)))
    if pico > 0.98:
        y *= 0.98 / pico
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                    '-c:a', 'libmp3lame', '-b:a', '64k', salida], input=y.astype(np.float32).tobytes(), check=True)
    print('%s: %d ciclos de %.2f s = %.1f s' % (salida, n_ciclos, len(ciclo) / SR, len(m) / SR))


if __name__ == '__main__':
    main()
