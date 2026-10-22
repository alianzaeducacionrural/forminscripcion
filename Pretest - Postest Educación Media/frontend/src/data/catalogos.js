// Catálogos y contenido de preguntas. Deben mantenerse en sincronía manualmente
// con las constantes equivalentes en ../../backend/Code.js (INSTITUCIONES_SEED,
// AREAS_VALIDAS, PRETEST_P4_ELEMENTOS, POSTEST_Q3_ESTRATEGIAS, POSTEST_Q4_ELEMENTOS)
// — no hay una fuente única compartida entre frontend y backend.
//
// La clave de respuestas alineadas NO vive aquí ni en ningún archivo del
// frontend: solo existe en el backend, para que nunca sea visible desde el
// bundle público (ver PRODUCT.md / DESIGN.md).

export const INSTITUCIONES = [
  'Adolfo Hoyos Ocampo',
  'Giovanni Montini',
  'Granada',
  'José Antonio Galán',
  'La Cabaña',
  'La Linda',
  'La Trinidad',
  'La Violeta',
  'Maltería',
  'María Goretti',
  'Miguel Antonio Caro',
  'Rafael Pombo',
  'San Peregrino',
  'Seráfico San Antonio de Padua',
];

export const AREAS = [
  'Matemáticas',
  'Lenguaje',
  'Sociales',
  'Ciencias Naturales',
  'Líder La Universidad en el Campo',
];

export const AREAS_COLOR = {
  'Matemáticas': 'indigo',
  'Lenguaje': 'violeta',
  'Sociales': 'ambar',
  'Ciencias Naturales': 'verde',
  'Líder La Universidad en el Campo': 'rosa',
};

export const AREAS_ABREVIADAS = {
  'Matemáticas': 'Matemáticas',
  'Lenguaje': 'Lenguaje',
  'Sociales': 'Sociales',
  'Ciencias Naturales': 'C. Naturales',
  'Líder La Universidad en el Campo': 'Líder UC',
};

// ---------------------------------------------------------------------------
// Pretest
// ---------------------------------------------------------------------------

export const PRETEST_PREGUNTAS = {
  p1: {
    texto: 'Cuando analizo los resultados de una evaluación por competencias, ¿qué información considero más relevante para orientar mi práctica pedagógica?',
    opciones: {
      a: 'Únicamente el porcentaje general de estudiantes aprobados.',
      b: 'Las competencias y aprendizajes consolidados y aquellos que requieren fortalecimiento.',
      c: 'La cantidad de estudiantes que presentaron la evaluación.',
      d: 'El resultado promedio de la institución.',
    },
  },
  p2: {
    texto: 'Un grupo de estudiantes presenta dificultades en una competencia específica. ¿Cuál sería la actuación pedagógica más pertinente?',
    opciones: {
      a: 'Continuar con la planeación establecida y reforzar el tema al finalizar el periodo.',
      b: 'Repetir las actividades desarrolladas inicialmente.',
      c: 'Analizar la evidencia, identificar el aprendizaje que requiere fortalecimiento y ajustar o implementar una estrategia pedagógica pertinente.',
      d: 'Aplicar nuevamente la prueba sin modificar la estrategia de enseñanza.',
    },
  },
  p3: {
    texto: '¿Cuál de las siguientes opciones representa mejor el uso de una estrategia metodológica activa?',
    opciones: {
      a: 'El docente explica el contenido y el estudiante responde preguntas de manera individual.',
      b: 'El docente plantea una situación, problema, proyecto o reto y promueve la participación activa de los estudiantes en la construcción de soluciones y aprendizajes.',
      c: 'El estudiante desarrolla una guía siguiendo instrucciones previamente establecidas.',
      d: 'El docente utiliza recursos digitales para presentar los contenidos.',
    },
  },
};

export const PRETEST_P4_TEXTO = 'Frente a un aprendizaje priorizado a partir del análisis de resultados, ¿cuáles elementos tendría en cuenta para seleccionar una estrategia pedagógica? Puedo marcar varias.';

export const PRETEST_P4_ELEMENTOS = [
  'Competencia o aprendizaje que requiere fortalecimiento',
  'Nivel de desempeño de los estudiantes',
  'Características y contexto de los estudiantes',
  'Evidencias disponibles sobre el aprendizaje',
  'Estrategias pedagógicas que actualmente utiliza',
  'Recursos disponibles en la institución',
  'Posibilidades de articulación con otros docentes o con la universidad',
];

export const PRETEST_P4_OTRO = 'Otro';

export const PRETEST_P5_TEXTO = 'Describo brevemente una estrategia metodológica activa que haya utilizado o utilizaría para fortalecer una competencia o aprendizaje identificado como prioritario.';

// ---------------------------------------------------------------------------
// Postest
// ---------------------------------------------------------------------------

export const POSTEST_PROPOSITO = 'Valorar los aprendizajes alcanzados durante el taller y la capacidad de los docentes para utilizar estrategias metodológicas activas a partir del análisis de evidencias de aprendizaje.';

export const POSTEST_PREGUNTAS = {
  q1: {
    texto: 'Después del taller, ¿cuál considero que es el principal propósito de implementar estrategias metodológicas activas?',
    opciones: {
      a: 'Transmitir mayor cantidad de contenidos en menor tiempo.',
      b: 'Favorecer la participación del estudiante y promover la construcción de aprendizajes mediante experiencias, problemas, proyectos o situaciones contextualizadas.',
      c: 'Sustituir la orientación del docente por actividades autónomas.',
      d: 'Aumentar la cantidad de actividades realizadas durante la clase.',
    },
  },
  q2: {
    texto: 'Un docente identifica, a partir de los resultados de una evaluación, que sus estudiantes presentan dificultades en una competencia específica. ¿Cuál sería la actuación pedagógica más pertinente?',
    opciones: {
      a: 'Continuar con la planeación establecida para evitar retrasos en los contenidos.',
      b: 'Repetir la explicación del tema utilizando la misma estrategia pedagógica.',
      c: 'Analizar la evidencia, identificar el aprendizaje que requiere fortalecimiento y seleccionar o ajustar una estrategia metodológica acorde con la necesidad identificada.',
      d: 'Aplicar nuevamente la misma evaluación hasta obtener mejores resultados.',
    },
  },
};

export const POSTEST_Q3_TEXTO = 'Selecciono las estrategias metodológicas activas que considero pertinentes para responder a necesidades de aprendizaje identificadas en mis estudiantes:';

export const POSTEST_Q3_ESTRATEGIAS = [
  'Aprendizaje basado en proyectos',
  'Aprendizaje basado en problemas',
  'Trabajo colaborativo',
  'Aprendizaje basado en retos',
  'Estudio de casos',
  'Investigación en el aula',
  'Aula invertida',
  'Gamificación',
];

export const POSTEST_Q3_OTRA = 'Otra';

export const POSTEST_Q3_APLICARIA_TEXTO = '¿Cuál de estas estrategias implementaría para fortalecer un aprendizaje identificado como prioritario y por qué?';

export const POSTEST_Q4_TEXTO = 'A partir de los resultados de aprendizaje analizados durante el taller, ¿qué elementos debería considerar al diseñar una estrategia metodológica activa? Selecciono los que considere pertinentes.';

export const POSTEST_Q4_ELEMENTOS = [
  'Competencia o aprendizaje que se requiere fortalecer',
  'Nivel de desempeño de los estudiantes',
  'Características y contexto de los estudiantes',
  'Evidencias de aprendizaje disponibles',
  'Estrategias pedagógicas previamente implementadas',
  'Recursos y posibilidades de articulación con otros actores',
  'Únicamente los contenidos establecidos en la planeación',
];

export const POSTEST_Q5_TEXTO = 'Aplicación a mi práctica. A partir de lo trabajado durante el taller, describo una acción concreta que implementaré en mi práctica pedagógica para fortalecer un aprendizaje o competencia identificada como prioritaria.';
