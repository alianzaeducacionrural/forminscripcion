// Catálogo cerrado de IES. Duplicado a propósito en backend/Code.js
// (INSTITUCIONES_SEED): si cambia, se actualizan los dos y se hace `clasp push`.
export const INSTITUCIONES = [
  'IES CINOC',
  'Universidad Autónoma de Manizales',
  'Universidad Católica de Manizales',
  'Universidad de Caldas',
  'Universidad de Manizales',
];

// Textos oficiales de las matrices transcritos de los documentos del Comité
// Académico — no se parafrasean.
export const MATRIZ_1 = {
  id: 'matriz1',
  tema: 'indigo',
  titulo: 'Matriz 1. Internacionalización',
  subtitulo: 'Propuestas de las IES para La Universidad en el Campo',
  pregunta:
    '¿Qué acciones concretas puede desarrollar nuestra institución de educación superior para incorporar una dimensión de internacionalización en La Universidad en el Campo, ampliando las oportunidades de aprendizaje, interacción y proyección de los estudiantes?',
  categoriasTitulo: 'Algunas categorías que pueden orientar la discusión',
  categorias: [
    'Intercambios académicos virtuales',
    'Conferencias o encuentros con invitados internacionales',
    'Proyectos colaborativos con estudiantes de otros países',
    'Internacionalización del currículo',
    'Fortalecimiento de competencias en segunda lengua',
    'Acceso a recursos académicos internacionales',
    'Movilidad virtual o presencial',
    'Investigación y proyectos colaborativos',
    'Experiencias interculturales',
    'Participación en redes académicas internacionales',
  ],
  producto:
    'una propuesta concreta por universidad, priorizando aquellas acciones que sean viables, sostenibles y pertinentes para el contexto de los estudiantes de La Universidad en el Campo.',
  etiquetaFila: 'Acción',
  botonAgregar: 'Agregar otra acción',
  filasFijas: [],
  // Las columnas de la matriz, en orden. `clave` es el nombre que viaja al backend
  // en el envío; `columna` es el encabezado con el que vuelve al leer la Sheet.
  campos: [
    { clave: 'accion', columna: 'accion', etiqueta: 'Acción de internacionalización propuesta' },
    { clave: 'dirigidaA', columna: 'dirigida_a', etiqueta: '¿A quién está dirigida?' },
    { clave: 'comoSeDesarrolla', columna: 'como_se_desarrollaria', etiqueta: '¿Cómo se desarrollaría?' },
    { clave: 'aliados', columna: 'aliados', etiqueta: 'Aliados requeridos' },
    { clave: 'periodicidad', columna: 'periodicidad', etiqueta: 'Periodicidad / fecha posible' },
    { clave: 'recursos', columna: 'recursos', etiqueta: 'Recursos requeridos' },
    { clave: 'resultado', columna: 'resultado_esperado', etiqueta: 'Resultado esperado' },
  ],
};

export const MATRIZ_2 = {
  id: 'matriz2',
  tema: 'verde',
  titulo: 'Matriz 2. Fortalecimiento de la implementación del modelo por los docentes universitarios',
  subtitulo: 'Modelo de Educación Rural con Escuela Nueva',
  pregunta:
    '¿Qué podemos hacer para fortalecer la apropiación y aplicación efectiva de las estrategias del modelo de Educación Rural con Escuela Nueva por parte de los docentes universitarios que participan en La Universidad en el Campo?',
  categoriasTitulo: null,
  categorias: [],
  producto: null,
  etiquetaFila: 'Aspecto',
  botonAgregar: 'Agregar otro aspecto a fortalecer',
  filasFijas: [
    'Uso de guías con la estructura de Escuela Nueva',
    'Trabajo en equipo: roles',
    'Mediación actividades de conjunto',
  ],
  campos: [
    { clave: 'situacion', columna: 'situacion', etiqueta: 'Situación identificada / evidencia' },
    { clave: 'accionMejora', columna: 'accion_mejora', etiqueta: 'Acción de mejora propuesta' },
    { clave: 'responsable', columna: 'responsable', etiqueta: 'Responsable' },
    { clave: 'apoyo', columna: 'apoyo', etiqueta: 'Apoyo requerido' },
    { clave: 'tiempo', columna: 'tiempo', etiqueta: 'Tiempo de implementación' },
    { clave: 'evidencia', columna: 'evidencia', etiqueta: 'Evidencia de cumplimiento' },
  ],
};

export const MAX_CARACTERES = 2000;
