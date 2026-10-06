// Contenido oficial de la encuesta (no parafrasear). Las afirmaciones se identifican
// como p01..p26, igual que las columnas de la hoja y la validación del backend.

export const PROPOSITO =
  'Recopilar la percepción y experiencia de los estudiantes frente al programa técnico profesional que cursan, con el fin de identificar fortalezas, oportunidades de mejora y factores que favorecen su aprendizaje, permanencia y continuidad en la trayectoria hacia la educación superior.'

export const INSTRUCCION =
  'Tu opinión es importante. Esta encuesta busca conocer tu experiencia real como estudiante de La Universidad en el Campo. No hay respuestas correctas o incorrectas. Responde con sinceridad pensando en tu experiencia durante el programa.'

export const ESCALA = [
  { valor: 1, texto: 'Totalmente en desacuerdo', emoji: '😠' },
  { valor: 2, texto: 'En desacuerdo', emoji: '🙁' },
  { valor: 3, texto: 'Ni de acuerdo ni en desacuerdo', emoji: '😐' },
  { valor: 4, texto: 'De acuerdo', emoji: '🙂' },
  { valor: 5, texto: 'Totalmente de acuerdo', emoji: '🤩' },
]

export const NA = { valor: 'N/A', texto: 'No aplica / No tengo información' }

export const BLOQUES_LIKERT = [
  {
    id: 'pertinencia',
    titulo: 'Pertinencia del programa',
    emoji: '🎯',
    items: [
      'El programa responde a mis intereses y expectativas de formación.',
      'Los contenidos del programa son pertinentes para mi contexto y territorio.',
      'Lo que aprendo tiene relación con situaciones reales de mi entorno.',
      'El programa aporta a mi proyecto de vida.',
      'Considero que la formación recibida puede ser útil para mi futuro laboral o profesional.',
      'El programa me permite conocer oportunidades de continuidad en la educación superior.',
    ],
  },
  {
    id: 'aprendizaje',
    titulo: 'Experiencia de aprendizaje',
    emoji: '📚',
    items: [
      'Las actividades de aprendizaje favorecen mi participación activa.',
      'Los docentes utilizan diferentes estrategias para facilitar el aprendizaje.',
      'Las actividades me permiten aplicar lo aprendido a situaciones reales.',
      'Recibo retroalimentación que me ayuda a mejorar mi aprendizaje.',
      'Las actividades y evaluaciones corresponden con lo que se espera que aprenda.',
      'Los recursos y materiales utilizados son suficientes para desarrollar las actividades.',
    ],
  },
  {
    id: 'articulacion',
    titulo: 'Articulación entre educación media y educación superior',
    emoji: '🌉',
    items: [
      'Comprendo cómo mi formación en educación media se relaciona con el programa técnico profesional.',
      'Reconozco aprendizajes adquiridos en el colegio que son útiles para mi formación técnica profesional.',
      'La articulación entre el colegio y la universidad facilita mi transición hacia la educación superior.',
      'Existe comunicación adecuada entre la institución educativa y la universidad.',
      'Conozco las posibilidades de continuar mi formación después de finalizar el programa técnico profesional.',
    ],
  },
  {
    id: 'acompanamiento',
    titulo: 'Acompañamiento y bienestar',
    emoji: '🤝',
    items: [
      'Sé a quién acudir cuando tengo dificultades académicas.',
      'Recibo acompañamiento cuando tengo dificultades para continuar con mis estudios.',
      'La universidad facilita espacios o estrategias para apoyar mi bienestar.',
      'Me siento acompañado(a) durante mi proceso de formación.',
    ],
  },
  {
    id: 'motivacion',
    titulo: 'Motivación y permanencia',
    emoji: '🔥',
    items: [
      'Me siento motivado(a) para continuar en el programa.',
      'Considero que lo que estoy estudiando vale la pena para mi futuro.',
      'Las condiciones del programa favorecen mi permanencia.',
      'Recomendaría a otros jóvenes de mi territorio participar en La Universidad en el Campo.',
      'Tengo intención de continuar mi trayectoria educativa después de finalizar este programa.',
    ],
  },
]

// Aplana los bloques asignando la clave p01..p26 a cada afirmación.
let contador = 0
export const BLOQUES = BLOQUES_LIKERT.map((bloque) => ({
  ...bloque,
  items: bloque.items.map((texto) => {
    contador += 1
    return { clave: `p${String(contador).padStart(2, '0')}`, texto }
  }),
}))

export const VALORACION_GLOBAL = [
  { valor: 'Muy bajo', emoji: '😞' },
  { valor: 'Bajo', emoji: '🙁' },
  { valor: 'Medio', emoji: '😐' },
  { valor: 'Alto', emoji: '😄' },
  { valor: 'Muy alto', emoji: '🤩' },
]

export const PREGUNTAS_ABIERTAS = [
  { clave: 'fortaleza', texto: '¿Cuál consideras que es la principal fortaleza del programa?' },
  { clave: 'dificultad', texto: '¿Cuál es la principal dificultad o aspecto que debería mejorarse?' },
  { clave: 'cambiaria', texto: 'Si pudieras cambiar una cosa del programa, ¿qué cambiarías y por qué?' },
  {
    clave: 'mantener',
    texto: '¿Qué debería mantenerse porque aporta significativamente a tu experiencia como estudiante?',
  },
  {
    clave: 'apoyo',
    texto:
      '¿Qué apoyo adicional necesitarías de la universidad, institución educativa o La Universidad en el Campo para continuar con éxito tu trayectoria educativa?',
  },
]

export const MAX_FACTORES = 3

export const FACTORES = [
  'Dificultades académicas',
  'Falta de tiempo',
  'Transporte/desplazamiento',
  'Conectividad',
  'Costos asociados al estudio',
  'Horarios',
  'Metodologías de enseñanza',
  'Comunicación con docentes',
  'Comunicación con la universidad',
  'Falta de acompañamiento',
  'Situaciones familiares',
  'Necesidad de trabajar',
  'Falta de motivación',
  'No encuentro relación entre el programa y mi proyecto de vida',
  'Ninguna',
  'Otra',
]

export const PROYECCIONES = [
  'Continuar estudios universitarios',
  'Continuar otra formación técnica o tecnológica',
  'Buscar empleo',
  'Emprender',
  'Trabajar y continuar estudiando',
  'Aún no lo tengo definido',
  'Otra',
]

export const OTRA = 'Otra'
