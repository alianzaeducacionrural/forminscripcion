// Catálogo cerrado de instituciones educativas y áreas del conocimiento.
// Debe mantenerse en espejo con INSTITUCIONES_SEED / AREAS_VALIDAS en
// backend/Code.js — si esta lista cambia, esa también debe cambiar.

export const INSTITUCIONES = [
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
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Docente líder La Universidad en el Campo',
];

// Abreviaturas cortas para chips/etiquetas donde el espacio es angosto
// (tabla del admin, resumen colapsado de una fila de docente).
export const AREAS_ABREVIADAS = {
  Matemáticas: 'Mat',
  Lenguaje: 'Leng',
  'Ciencias Naturales': 'C. Nat',
  'Ciencias Sociales': 'C. Soc',
  'Docente líder La Universidad en el Campo': 'Líder UC',
};

// Cada área tiene su propio color de identidad — se usa en los chips
// seleccionables del formulario, en las etiquetas de la tabla del admin y
// en el desglose "por área" del panel. Codificar por color ayuda a
// reconocer un área de un vistazo, no es decoración suelta.
export const AREAS_COLOR = {
  Matemáticas: 'indigo',
  Lenguaje: 'violeta',
  'Ciencias Naturales': 'verde',
  'Ciencias Sociales': 'ambar',
  'Docente líder La Universidad en el Campo': 'rosa',
};
