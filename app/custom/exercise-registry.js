/* PACE · Registro interno de ejercicios (F7 · s93 · v0.38.0)
   Base de datos curada que alimenta el constructor de rutinas premium.
   NO es una biblioteca navegable: la unidad gateable sigue siendo la
   sesión (decisión s85). Unión deduplicada a mano de los steps de
   MOVE_ROUTINES + EXTRA_ROUTINES a fecha v0.37.0, con cue neutro (sin
   contexto de serie) y dur por defecto en segundos.

   `name` es el ES canónico e IDÉNTICO a la key de glifo
   (app/glyphs/exercise-glyphs.jsx); los ejercicios sin glifo aprobado
   renderizan DefaultGlyph (cola D-4, sin cambios). El EN vive en
   app/i18n/content/custom.js con keys `custom.ex.<name>.{name,cue}` y
   `custom.cat.<key>.label` para los grupos.

   Curación s93: 'Dead hang · opcional' (antes 'Dead hang (si puedes)', renombrado B1.2) queda fuera (duplica Hang
   pasivo). Al crecer los catálogos en F8+, añadir aquí a mano los
   pasos nuevos que merezcan entrar al constructor. */

const EXERCISE_REGISTRY = {
  empuje: {
    label: 'Empuje y tracción',
    items: [
      { name: 'Flexiones inclinadas', dur: 40, cue: 'Contra el escritorio, codos cerca del cuerpo.' },
      { name: 'Pica en escritorio', dur: 40, cue: 'Cadera arriba, cabeza entre los brazos.' },
      { name: 'Fondos en silla', dur: 40, cue: 'Baja con control, codos atrás.' },
      { name: 'Hang pasivo', dur: 30, cue: 'Cuelga relajado. Respira.' },
      { name: 'Hang activo', dur: 30, cue: 'Hombros abajo y atrás, codos rectos.' },
    ]
  },
  piernas: {
    label: 'Piernas',
    items: [
      { name: 'Sentadilla a silla', dur: 40, cue: 'Baja hasta rozar la silla, sube sin impulso.' },
      { name: 'Wall sit', dur: 45, cue: 'Espalda en pared, rodillas a 90°.' },
      { name: 'Sentadilla búlgara', dur: 45, cue: 'Empeine sobre la silla, baja vertical.' },
      { name: 'ATG split squat', dur: 50, cue: 'Zancada profunda. Rodilla por delante del pie.' },
      { name: 'Sissy squat', dur: 40, cue: 'Apoyado. Rodillas adelante, talones arriba.' },
      { name: 'Nordics', dur: 40, cue: 'Asistidos si hace falta. Bajada controlada.' },
      { name: 'Tibialis raise', dur: 40, cue: 'Contra pared, levanta los pies.' },
      { name: 'Calf raises', dur: 30, cue: 'Sube y baja con control.' },
      { name: 'Puente con marcha', dur: 45, cue: 'Activación de glúteo profundo.' },
    ]
  },
  core: {
    label: 'Core y espalda',
    items: [
      { name: 'Plancha', dur: 40, cue: 'Antebrazos, cuerpo en línea. Aprieta glúteos.' },
      { name: 'Plancha lateral', dur: 40, cue: 'Cadera alta, cuerpo en línea.' },
      { name: 'Hollow hold', dur: 30, cue: 'Lumbar al suelo, piernas y hombros arriba.' },
      { name: 'Seated hollow', dur: 30, cue: 'Eleva piernas, apoya la baja espalda.' },
      { name: 'Superman', dur: 40, cue: 'Boca abajo: eleva pecho y brazos, lento.' },
      { name: 'Scapular squeeze', dur: 30, cue: 'Junta omóplatos, 2 segundos cada vez.' },
      { name: 'Band pull-apart', dur: 40, cue: 'Sin banda: brazos cruzados + abre con tensión.' },
      { name: 'Apretar glúteos', dur: 30, cue: 'Apretones firmes, 2 segundos cada uno.' },
    ]
  },
  cuello: {
    label: 'Cuello y hombros',
    items: [
      { name: 'Chin tucks', dur: 30, cue: 'Desliza la barbilla recta hacia atrás; la nuca se alarga.' },
      { name: 'Cuello y trapecios', dur: 40, cue: 'Oreja al hombro, suave.' },
      { name: 'Inclinación lateral', dur: 40, cue: 'Oreja al hombro, cada lado.' },
      { name: 'Rotación lenta', dur: 40, cue: 'Mira sobre el hombro, sin forzar.' },
      { name: 'Escalenos', dur: 40, cue: 'Mano bajo el glúteo, inclina la cabeza al lado opuesto.' },
      { name: 'Shrug + round', dur: 20, cue: 'Hombros arriba, luego relaja.' },
      { name: 'Círculos de hombro', dur: 45, cue: 'Círculos lentos y amplios, brazo estirado.' },
      { name: 'Scapular wall slides', dur: 45, cue: 'Espalda en pared, sube los brazos.' },
      { name: 'External rotation', dur: 40, cue: 'Codo a 90°, rota hacia fuera.' },
      { name: 'Apertura de pecho', dur: 40, cue: 'Manos tras la nuca, abre codos, mira al techo.' },
      { name: 'Chest opener', dur: 30, cue: 'Brazos atrás, expande el pecho.' },
    ]
  },
  columna: {
    label: 'Columna',
    items: [
      { name: 'Rotación torácica', dur: 40, cue: 'Sentado: manos cruzadas, rota el tronco despacio.' },
      { name: 'Thoracic extension', dur: 40, cue: 'Arquea sobre la silla.' },
      { name: 'Gato-camello', dur: 45, cue: 'A cuatro patas: arquea y redondea, vértebra a vértebra.' },
      { name: 'Onda espinal', dur: 45, cue: 'De pie: ola desde la pelvis hasta la cabeza, lenta.' },
      { name: 'Puente torácico', dur: 45, cue: 'Desde sentado, eleva cadera y abre el pecho al techo.' },
      { name: 'Rodar hacia abajo', dur: 45, cue: 'De pie, baja vértebra a vértebra hasta colgar.' },
      { name: 'Seated twist', dur: 30, cue: 'Rota hacia el respaldo, suave.' },
      { name: 'Rib pull + respiración', dur: 40, cue: 'Movimiento de gato/vaca con respiración.' },
    ]
  },
  caderas: {
    label: 'Caderas',
    items: [
      { name: 'Flexor de cadera', dur: 45, cue: 'Rodilla al suelo, empuja la pelvis adelante.' },
      { name: 'Couch stretch', dur: 60, cue: 'Empeine contra pared o silla, rodilla al fondo.' },
      { name: '90/90', dur: 60, cue: 'Rota entre lados despacio.' },
      { name: 'Pigeon', dur: 50, cue: 'Tibia adelante, peso adelante.' },
      { name: 'Rana', dur: 60, cue: 'Rodillas anchas, empuja la cadera atrás. Mece suave.' },
      { name: 'Cossack squat', dur: 50, cue: 'Peso a un lado, la otra pierna estirada.' },
      { name: "World's greatest stretch", dur: 60, cue: 'Zancada + mano al suelo + rotación.' },
    ]
  },
  suelo: {
    label: 'Suelo y cadena posterior',
    items: [
      { name: 'Squat profundo', dur: 50, cue: 'Talones abajo, codos dentro de las rodillas.' },
      { name: 'Deep squat hold', dur: 50, cue: 'Talones abajo, relaja al fondo.' },
      { name: 'Crawling', dur: 45, cue: 'Contralateral, lento.' },
      { name: 'Ground sitting transitions', dur: 60, cue: 'Siéntate al suelo y levántate sin manos.' },
      { name: 'Elephant walk', dur: 50, cue: 'Camina tocando el suelo, piernas estiradas.' },
      { name: 'Pliegue adelante', dur: 50, cue: 'Pies juntos, cuelga el tronco. Rodillas suaves.' },
      { name: 'Isquio a una pierna', dur: 50, cue: 'Talón apoyado delante, cadera atrás.' },
    ]
  },
  manos: {
    label: 'Muñecas, tobillos y pausas',
    items: [
      { name: 'Wrist circles', dur: 20, cue: 'Círculos en cada sentido, muñecas sueltas.' },
      { name: 'Wrist stretch', dur: 30, cue: 'Flexión y extensión, suave.' },
      { name: 'Palmas al suelo', dur: 40, cue: 'Palmas sobre la mesa, dedos hacia ti.' },
      { name: 'Rezo invertido', dur: 40, cue: 'Dorsos de las manos juntos frente al pecho.' },
      { name: 'Squeeze fist', dur: 20, cue: 'Aprieta fuerte, suelta.' },
      { name: 'Finger extension', dur: 20, cue: 'Abre los dedos al máximo.' },
      { name: 'Ankle circles', dur: 20, cue: 'Bajo la mesa, cada sentido.' },
      { name: 'Deep breaths', dur: 20, cue: '3 inhalaciones completas.' },
      { name: 'Reset respiración', dur: 30, cue: 'Inhalaciones profundas para cerrar.' },
      { name: 'Descanso', dur: 20, cue: 'Respira. Suelta.' },
    ]
  },
};

/* Lookup por nombre canónico ES (misma convención que las keys de glifo). */
function getExerciseDef(name) {
  for (const group of Object.values(EXERCISE_REGISTRY)) {
    const found = group.items.find(e => e.name === name);
    if (found) return found;
  }
  return null;
}

window.EXERCISE_REGISTRY = EXERCISE_REGISTRY;
window.getExerciseDef = getExerciseDef;
