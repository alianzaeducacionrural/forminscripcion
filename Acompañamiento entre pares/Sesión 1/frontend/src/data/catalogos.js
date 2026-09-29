// Lista cerrada: las instituciones educativas rurales de Manizales que
// acompaña el programa. El campo Institución es un <select> con estas
// opciones únicamente (no texto libre). Duplicada en backend/Code.js
// (INSTITUCIONES_SEED), que además valida que el envío traiga una de estas.
export const INSTITUCIONES_MANIZALES = [
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

export const MAX_CORTO = 200;
export const MAX_CARACTERES = 2000;
export const MAX_ACCIONES = 20;

// Los 4 componentes de la gestión escolar, en el orden fijo de la herramienta
// original en papel. Cada herramienta trae siempre una fila por componente:
// no se agregan ni se quitan filas.
export const COMPONENTES = ['Administrativo', 'Curricular', 'Capacitación', 'Comunitario'];

// Valoración semáforo de "Mi capital de experiencia": qué tan dominado tiene
// el rector cada componente. Los colores importan — reproducen el semáforo
// de la hoja original.
export const VALORACIONES = [
  {
    valor: 'domina',
    color: 'verde',
    etiquetaCorta: 'Lo domino',
    etiqueta: 'Lo domino y puedo acompañar a otro.',
  },
  {
    valor: 'fortaleciendo',
    color: 'amarillo',
    etiquetaCorta: 'Lo estoy fortaleciendo',
    etiqueta: 'Lo hago, pero todavía estoy fortaleciendo la práctica.',
  },
  {
    valor: 'aprender',
    color: 'azul',
    etiquetaCorta: 'Quiero aprender',
    etiqueta: 'Quiero aprender de otros.',
  },
];

export function valoracionPorValor(valor) {
  return VALORACIONES.find((v) => v.valor === valor) || null;
}

// Textos oficiales transcritos de las dos herramientas en papel del Comité de
// Cafeteros de Caldas — no se parafrasean.
export const HERRAMIENTA_EXPERIMENTADOS = {
  id: 'experimentados',
  tema: 'ambar',
  titulo: 'Mi capital de experiencia',
  subtitulo: 'Herramienta para rectores con experiencia',
  pregunta:
    'Identifique, por cada componente de la gestión escolar: fortaleza + evidencia + posibilidad de transferencia.',
  conValoracion: true,
  campos: [
    { clave: 'queSabeHacer', columna: 'que_sabe_hacer', etiqueta: '¿Qué sé hacer?' },
    { clave: 'queExperiencia', columna: 'que_experiencia_tengo', etiqueta: '¿Qué experiencia tengo?' },
    { clave: 'queEvidencia', columna: 'que_evidencia_puedo_mostrar', etiqueta: '¿Qué evidencia puedo mostrar?' },
    { clave: 'queEnsenar', columna: 'que_podria_ensenar', etiqueta: '¿Qué podría enseñar a otro rector?' },
  ],
};

export const HERRAMIENTA_NUEVOS = {
  id: 'nuevos',
  tema: 'turquesa',
  titulo: 'Mi mapa de necesidades para acompañar la trayectoria',
  subtitulo: 'Herramienta para rectores nuevos',
  pregunta:
    '¿Qué situación concreta de mi institución quisiera resolver durante este proceso de acompañamiento?',
  conValoracion: false,
  campos: [
    { clave: 'situacion', columna: 'situacion_que_necesito_fortalecer', etiqueta: 'Situación que necesito fortalecer' },
    { clave: 'queAprender', columna: 'que_necesito_aprender', etiqueta: '¿Qué necesito aprender?' },
    {
      clave: 'tipoApoyo',
      columna: 'tipo_de_apoyo',
      etiqueta: '¿Qué tipo de apoyo necesito?',
      ayuda: 'Orientación / ejemplo / herramienta / acompañamiento',
    },
  ],
};

// "Mi primer reto de acompañamiento": lo diligencia la dupla junta (rector
// con experiencia + rector nuevo), no cada uno por separado. Al menos 1
// acción es obligatoria; se pueden agregar más. Al guardar, se envía un PDF
// con el plan completo a los correos de ambos.
export const HERRAMIENTA_PLAN_ACCION = {
  id: 'plan-accion',
  tema: 'violeta',
  titulo: 'Mi primer reto de acompañamiento',
  subtitulo: 'Microplan de acompañamiento entre pares',
  pregunta:
    'Cada dupla define un reto concreto, una acción de acompañamiento, responsable, fecha y evidencia de avance. Cierre con compromiso.',
  etiquetaFila: 'Acción',
  botonAgregar: 'Agregar otra acción',
  campos: [
    { clave: 'reto', columna: 'reto', etiqueta: 'Reto concreto' },
    { clave: 'accion', columna: 'accion', etiqueta: 'Acción de acompañamiento' },
    { clave: 'responsable', columna: 'responsable', etiqueta: 'Responsable' },
    { clave: 'fecha', columna: 'fecha', etiqueta: 'Fecha', tipo: 'fecha' },
    { clave: 'evidencia', columna: 'evidencia', etiqueta: 'Evidencia de avance' },
  ],
};
