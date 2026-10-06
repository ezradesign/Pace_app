"""Prepara una pista como sonaría en la app: Sol a 432, mono, bucle sin costura, 64 kbps.

Uso: python3 -I procesar.py ENTRADA SALIDA.mp3 INICIO_S FIN_S [CROSSFADE_S] [ESTIRA] [SEMITONOS] [GRAVE_DB]

- Baja 31,77 cents con rubberband (afinación de la app, La = 432) sin cambiar el tempo.
- SEMITONOS (opcional) transpone además, para una pista que no está en Sol.
- GRAVE_DB (opcional, negativo) baja los graves por debajo de 180 Hz, para que se oiga en un altavoz.
- ESTIRA (opcional, p. ej. 1.012) cambia la duración sin tocar la altura, para que una
  marea caiga exacta en 10,000 o 12,000 s.
- Corta [INICIO, FIN] y cierra el bucle con un fundido cruzado de igual potencia: la cola
  se mezcla con la cabeza, así que al repetir no hay salto ni bajón.
"""
import subprocess
import sys

import numpy as np

SR = 44100


def decodifica(ruta, filtros):
    cmd = ['ffmpeg', '-v', 'error', '-i', ruta, '-af', filtros, '-ac', '1', '-ar', str(SR),
           '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, dtype=np.float32).copy()


def main():
    entrada, salida = sys.argv[1], sys.argv[2]
    ini, fin = float(sys.argv[3]), float(sys.argv[4])
    xf = float(sys.argv[5]) if len(sys.argv) > 5 else 3.0
    estira = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
    semitonos = float(sys.argv[7]) if len(sys.argv) > 7 else 0.0
    grave_db = float(sys.argv[8]) if len(sys.argv) > 8 else 0.0
    # drones: sin detector de transitorios y ventana larga, o el desplazamiento inventa ataques
    filtros = 'rubberband=pitch=%.6f:tempo=%.6f:transients=smooth:detector=soft:window=long:pitchq=quality' % (432 / 440 * 2 ** (semitonos / 12), 1 / estira)
    if grave_db:
        filtros += ',lowshelf=f=180:g=%.1f' % grave_db
    x = decodifica(entrada, filtros)
    a, b = int(ini * estira * SR), int(fin * estira * SR)
    s = x[a:min(b, len(x))]
    c = int(xf * SR)
    if len(s) < 3 * c:
        sys.exit('tramo demasiado corto para el fundido')
    t = np.linspace(0, np.pi / 2, c, dtype=np.float32)
    y = s[c:].copy()
    y[-c:] = s[-c:] * np.cos(t) + s[:c] * np.sin(t)
    # todas las bases salen al mismo nivel (-20 dBFS de RMS), así la ganancia de la app es la
    # misma para todas (0,158 deja el cuerpo en -36 dBFS, el nivel del drone de la app)
    y *= 10 ** ((-20 - 20 * np.log10(max(float(np.sqrt(np.mean(y ** 2))), 1e-9))) / 20)
    pico = float(np.max(np.abs(y)))
    if pico > 0.98:
        y *= 0.98 / pico
    enc = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                          '-c:a', 'libmp3lame', '-b:a', '64k', salida], input=y.astype(np.float32).tobytes())
    if enc.returncode:
        sys.exit('ffmpeg no pudo codificar')
    rms = float(np.sqrt(np.mean(y ** 2)))
    print('%s %.1f s rms %.2f dBFS' % (salida, len(y) / SR, 20 * np.log10(max(rms, 1e-9))))


if __name__ == '__main__':
    main()
