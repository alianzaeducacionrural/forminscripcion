// Contenido oficial del instrumento (no parafrasear). Las claves (p01.., a01.., etc.) son las
// mismas columnas de la hoja y la validación de backend/Code.js: si cambian, actualizar ambos.

export const OBJETIVO =
  'Valorar la percepción de pertinencia de los talleres de formación, el nivel de apropiación de los aprendizajes relacionados con las estrategias del Modelo Escuela Nueva, la atención a la diversidad y el empresarismo, así como su incorporación o proyección de uso en las prácticas pedagógicas de los docentes universitarios vinculados a La Universidad en el Campo.'

export const POBLACION = 'Docentes participantes en los talleres de formación.'

export const OTRA = 'Otra'

export const TIEMPOS = ['Menos de un año', 'Entre 1 y 3 años', 'Más de 3 años']

export const TALLERES = ['Estrategias pedagógicas del Modelo Escuela Nueva', 'Atención a la diversidad', 'Empresarismo']

export const ESCALA = [
  { valor: 1, texto: 'Totalmente en desacuerdo', emoji: '😠' },
  { valor: 2, texto: 'En desacuerdo', emoji: '🙁' },
  { valor: 3, texto: 'Ni de acuerdo ni en desacuerdo', emoji: '😐' },
  { valor: 4, texto: 'De acuerdo', emoji: '🙂' },
  { valor: 5, texto: 'Totalmente de acuerdo', emoji: '🤩' },
]
export const NA = { valor: 'N/A', texto: 'No aplica o no cuenta con elementos para valorar' }

export const INSTRUCCION_PERTINENCIA =
  'Marque una sola respuesta por afirmación, de acuerdo con su experiencia en el proceso formativo.'

export const PERTINENCIA = [
  { clave: 'p01', texto: 'Los contenidos abordados respondieron a necesidades reales de mi práctica docente.' },
  { clave: 'p02', texto: 'Las estrategias presentadas son pertinentes para el contexto de los estudiantes de La Universidad en el Campo.' },
  { clave: 'p03', texto: 'Los ejemplos y actividades desarrollados facilitaron la comprensión de los contenidos.' },
  { clave: 'p04', texto: 'La formación aportó herramientas aplicables a la planeación y orientación de mis clases.' },
  { clave: 'p05', texto: 'Los talleres permitieron identificar alternativas para mejorar la participación y el aprendizaje de los estudiantes.' },
]

export const INSTRUCCION_APROPIACION =
  'Valore qué tan preparado se siente para utilizar los aprendizajes de cada componente en sus clases universitarias.'

export const NIVELES = [
  { valor: 1, texto: 'No lo comprendo suficientemente para aplicarlo.', corto: 'No lo comprendo suficientemente', emoji: '😕' },
  { valor: 2, texto: 'Tengo una comprensión inicial y requiero acompañamiento.', corto: 'Comprensión inicial; requiero acompañamiento', emoji: '🙁' },
  { valor: 3, texto: 'Lo comprendo y podría aplicarlo con algunos apoyos.', corto: 'Puedo aplicarlo con apoyo', emoji: '😐' },
  { valor: 4, texto: 'Me siento preparado para aplicarlo autónomamente.', corto: 'Puedo aplicarlo autónomamente', emoji: '🙂' },
  { valor: 5, texto: 'Puedo aplicarlo, adaptarlo al contexto y compartir experiencias con otros docentes.', corto: 'Puedo aplicarlo, adaptarlo y compartirlo', emoji: '🤩' },
]
export const NA_NIVEL = {
  valor: 'N/A',
  texto: 'No participé en este componente o no tengo elementos para valorarlo.',
  corto: 'No aplica / Sin elementos para valorar',
}

export const APROPIACION = [
  {
    clave: 'a01',
    titulo: 'A. Estrategias del Modelo Escuela Nueva',
    texto: 'Planear actividades que promuevan aprendizaje activo, autonomía, trabajo colaborativo, uso de guías de interaprendizaje y evaluación formativa.',
  },
  {
    clave: 'a02',
    titulo: 'B. Atención a la diversidad',
    texto: 'Reconocer diferencias en ritmos, necesidades y condiciones de aprendizaje, y ajustar las estrategias didácticas, los recursos y las formas de participación.',
  },
  {
    clave: 'a03',
    titulo: 'C. Empresarismo',
    texto: 'Integrar problemas del contexto, identificación de oportunidades, formulación de planes de negocio y desarrollo de competencias emprendedoras en las actividades académicas.',
  },
]

export const ESTADOS_APLICACION = [
  'Ya los apliqué y puedo describir una experiencia concreta.',
  'Estoy incorporándolos en la planeación o desarrollo de mis clases.',
  'Aún no los he aplicado, pero identifico cómo hacerlo.',
  'Todavía no identifico una forma concreta de incorporarlos.',
  'No tengo actualmente asignación de clases en el programa.',
]

// Listas de selección múltiple. `ninguna` es la opción que no se combina con las demás.
export const ESTRATEGIAS = {
  ninguna: 'Ninguna por el momento',
  opciones: [
    'Guías de interaprendizaje y actividades contextualizadas',
    'Aprendizaje activo y resolución de problemas',
    'Trabajo colaborativo entre estudiantes',
    'Ajustes didácticos para atender distintos ritmos y necesidades',
    'Evaluación formativa y retroalimentación',
    'Proyectos pedagógicos productivos, modelo y planes de negocio.',
    'Análisis de necesidades y oportunidades del entorno',
    'Ninguna por el momento',
  ],
}

export const DIFICULTADES = {
  ninguna: 'No identifico dificultades relevantes',
  opciones: [
    'Tiempo disponible para planear y adaptar las actividades',
    'Tamaño o heterogeneidad del grupo',
    'Disponibilidad de recursos y materiales didácticos',
    'Necesidad de mayor claridad o profundización metodológica',
    'Dificultad para articular las estrategias con los contenidos del programa académico',
    'Conectividad o condiciones del contexto',
    'No identifico dificultades relevantes',
    'Otra',
  ],
}

export const EVIDENCIAS = {
  ninguna: 'Aún no cuento con evidencias de aplicación',
  opciones: [
    'Planeación de clase ajustada',
    'Guía, taller o material didáctico elaborado o adaptado',
    'Actividad o proyecto desarrollado por estudiantes',
    'Instrumento de evaluación o retroalimentación',
    'Fotografías o registro de la actividad, con las autorizaciones correspondientes',
    'Reflexión escrita sobre la experiencia y sus resultados',
    'Aún no cuento con evidencias de aplicación',
  ],
}

export const APOYOS = {
  ninguna: 'No requiero apoyo adicional por ahora',
  opciones: [
    'Acompañamiento pedagógico a la planeación',
    'Ejemplos de aplicación en módulos universitarios',
    'Materiales y guías adaptadas al programa académico',
    'Espacios de intercambio de experiencias entre docentes',
    'Orientación para evaluar los aprendizajes de los estudiantes',
    'Seguimiento posterior a la formación',
    'No requiero apoyo adicional por ahora',
  ],
}

export const PERTINENCIA_GLOBAL = [
  { valor: 1, texto: 'Nada pertinente', emoji: '😞' },
  { valor: 2, texto: 'Poco pertinente', emoji: '🙁' },
  { valor: 3, texto: 'Moderadamente pertinente', emoji: '😐' },
  { valor: 4, texto: 'Pertinente', emoji: '😄' },
  { valor: 5, texto: 'Muy pertinente', emoji: '🤩' },
]

export const ABIERTAS = [
  { clave: 'aporte', texto: '¿Cuál considera que es el principal aporte de los talleres a su práctica docente?' },
  { clave: 'ajustar', texto: '¿Qué aspecto de la formación debería fortalecerse o ajustarse?' },
]
