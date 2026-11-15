# PACE · scripts/voz-cuerpo-muestra.ps1 — tomas DE MUESTRA para la voz de Mueve y Estira
# ======================================================================================
# Mientras no estén las voces de Ez, la voz de Windows graba las mismas cuatro tomas que pide
# docs/proposals/voz-cuerpo-15nov/PROMPTS_VOZ_CUERPO.md, para probar el guion y la app. Son DE MUESTRA:
# no van a `main` ni a una versión publicada (la voz de Windows no es la de PACE).
#   powershell -File scripts/voz-cuerpo-muestra.ps1 "<carpeta de salida>"
# y luego: node scripts/voz-cuerpo-tomas.js "<carpeta de salida>"
param([string]$Salida = "$env:TEMP\pace-tomas-muestra")
Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force $Salida | Out-Null
$tomas = @{
  'numeros' = @('Uno','Dos','Tres','Cuatro','Cinco','Seis','Siete','Ocho','Nueve','Diez','Once','Doce','Trece','Catorce','Quince',
                'Dieciséis','Diecisiete','Dieciocho','Diecinueve','Veinte','Veintiuno','Veintidós','Veintitrés','Veinticuatro','Veinticinco')
  'cuenta'  = @('Tres','Dos','Uno')
  'avisos'  = @('Colócate','Siguiente','Ya','Último paso')
  'lados'   = @('Izquierda','Derecha','Cambia de lado','Descansa')
}
# «sulafat» (la voz clara) con Helena; «bradford» se deja sin muestra: así se ve que sin sus archivos suena el cuenco.
$formato = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($toma in $tomas.Keys) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $s.SelectVoice('Microsoft Helena Desktop')
  $s.Rate = 0
  $s.SetOutputToWaveFile((Join-Path $Salida "sulafat-es-$toma.wav"), $formato)
  $ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-ES">'
  foreach ($linea in $tomas[$toma]) { $ssml += "$linea<break time=`"500ms`"/>" }
  $ssml += '</speak>'
  $s.SpeakSsml($ssml)
  $s.Dispose()
}
Get-ChildItem $Salida | ForEach-Object { $_.Name + ' ' + $_.Length }
