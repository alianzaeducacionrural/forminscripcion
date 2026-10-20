/**
 * Backend API — Prueba de salida · Formación de docentes universitarios (Taller 3)
 * La Universidad en el Campo · Iniciativa Comunidades de Cambio.
 * Google Apps Script (Web App) BOUND a una Google Sheet (carpeta de Drive del proyecto),
 * gestionado con clasp.
 *
 * Endpoints:
 *   GET  ?action=ping
 *   GET  ?action=getRespuestas   (panel admin: todas las filas como objetos con las claves de los encabezados)
 *   POST { action: "submitEncuesta", idEnvio (UUID, opcional), nombre, municipio, universidad, universidadOtra,
 *          programa, tiempo, talleres: [..],
 *          respuestas: { p01..p05, a01..a03: 1-5 | 'N/A' },
 *          estado, estrategias: [..], dificultades: [..], dificultadOtra, evidencias: [..],
 *          pertinenciaGlobal: 1-5, aporte, ajustar (texto libre, opcionales), apoyos: [..] }
 *
 * Modelo: una fila por formulario en la hoja "Respuestas"; las listas se guardan unidas con "; ".
 * Idempotencia: si `idEnvio` ya existe, responde éxito SIN volver a escribir.
 * La hoja se crea sola en la primera petición (ensureSetup).
 * Sin protección por clave, igual que los demás formularios de la organización.
 *
 * Las opciones cerradas están DUPLICADAS en frontend/src/data/{encuesta,catalogos}.js:
 * si cambian, actualizar ambos y `clasp push`.
 */

var SHEET_RESPUESTAS = 'Respuestas';
var MAX_TEXTO = 2000;
var MAX_TEXTO_CORTO = 200;
var OTRA = 'Otra';

var PROGRAMAS_POR_UNIVERSIDAD = {
  "Universidad Autónoma de Manizales": [
    "Técnico Profesional en Control Industrial",
    "Técnico Profesional en Mantenimiento Mecánico",
    "Técnico Profesional en Programación de Computadores"
  ],
  "Universidad Católica de Manizales": [
    "Técnico Profesional en Análisis de Alimentos",
    "Técnico Profesional en Internet de las Cosas",
    "Técnico Profesional en Operación de Empresas Turísticas",
    "Técnico Profesional en Procesamiento Agroindustrial",
    "Tecnólogo Profesional en Operación de Empresas Turísticas"
  ],
  "Universidad de Caldas": [
    "Técnico Profesional en Formulación e Implementación de Proyectos Agropecuarios",
    "Técnico Profesional en Producción Agrícola",
    "Técnico Profesional en Producción Cafetera",
    "Técnico Profesional en Saneamiento Ambiental",
    "Tecnólogo Profesional en Gestión Ambiental"
  ],
  "Universidad de Manizales": [
    "Técnico Profesional en Archivística (modalidad combinada)",
    "Técnico Profesional en Atención al Cliente (modalidad combinada)",
    "Técnico Profesional en Configuración de Servicios para Comercio Electrónico (modalidad combinada)",
    "Técnico Profesional en Gestión Comercial del Sector Agropecuario (modalidad combinada)"
  ]
};

var MUNICIPIOS = [
  "Aguadas",
  "Anserma",
  "Aranzazu",
  "Belalcázar",
  "Chinchiná",
  "Filadelfia",
  "La Dorada",
  "La Merced",
  "Manizales",
  "Manzanares",
  "Marmato",
  "Marquetalia",
  "Marulanda",
  "Neira",
  "Norcasia",
  "Pácora",
  "Palestina",
  "Pensilvania",
  "Riosucio",
  "Risaralda",
  "Salamina",
  "Samaná",
  "San José",
  "Supía",
  "Victoria",
  "Villamaría",
  "Viterbo"
];

var TIEMPOS = [
  "Menos de un año",
  "Entre 1 y 3 años",
  "Más de 3 años"
];
var TALLERES = [
  "Estrategias pedagógicas del Modelo Escuela Nueva",
  "Atención a la diversidad",
  "Empresarismo"
];
var ESTADOS_APLICACION = [
  "Ya los apliqué y puedo describir una experiencia concreta.",
  "Estoy incorporándolos en la planeación o desarrollo de mis clases.",
  "Aún no los he aplicado, pero identifico cómo hacerlo.",
  "Todavía no identifico una forma concreta de incorporarlos.",
  "No tengo actualmente asignación de clases en el programa."
];

// Listas de selección múltiple; `ninguna` no se puede combinar con otras opciones.
var ESTRATEGIAS = { ninguna: 'Ninguna por el momento', opciones: [
  "Guías de interaprendizaje y actividades contextualizadas",
  "Aprendizaje activo y resolución de problemas",
  "Trabajo colaborativo entre estudiantes",
  "Ajustes didácticos para atender distintos ritmos y necesidades",
  "Evaluación formativa y retroalimentación",
  "Proyectos pedagógicos productivos, modelo y planes de negocio.",
  "Análisis de necesidades y oportunidades del entorno",
  "Ninguna por el momento"
] };
var DIFICULTADES = { ninguna: 'No identifico dificultades relevantes', opciones: [
  "Tiempo disponible para planear y adaptar las actividades",
  "Tamaño o heterogeneidad del grupo",
  "Disponibilidad de recursos y materiales didácticos",
  "Necesidad de mayor claridad o profundización metodológica",
  "Dificultad para articular las estrategias con los contenidos del programa académico",
  "Conectividad o condiciones del contexto",
  "No identifico dificultades relevantes",
  "Otra"
] };
var EVIDENCIAS = { ninguna: 'Aún no cuento con evidencias de aplicación', opciones: [
  "Planeación de clase ajustada",
  "Guía, taller o material didáctico elaborado o adaptado",
  "Actividad o proyecto desarrollado por estudiantes",
  "Instrumento de evaluación o retroalimentación",
  "Fotografías o registro de la actividad, con las autorizaciones correspondientes",
  "Reflexión escrita sobre la experiencia y sus resultados",
  "Aún no cuento con evidencias de aplicación"
] };
var APOYOS = { ninguna: 'No requiero apoyo adicional por ahora', opciones: [
  "Acompañamiento pedagógico a la planeación",
  "Ejemplos de aplicación en módulos universitarios",
  "Materiales y guías adaptadas al programa académico",
  "Espacios de intercambio de experiencias entre docentes",
  "Orientación para evaluar los aprendizajes de los estudiantes",
  "Seguimiento posterior a la formación",
  "No requiero apoyo adicional por ahora"
] };

var CLAVES_ESCALA = ['p01', 'p02', 'p03', 'p04', 'p05', 'a01', 'a02', 'a03'];

function headers() {
  return ['timestamp', 'id_envio', 'nombre', 'municipio', 'universidad', 'universidad_otra', 'programa', 'tiempo', 'talleres']
    .concat(CLAVES_ESCALA)
    .concat(['estado_aplicacion', 'estrategias', 'dificultades', 'dificultad_otra', 'evidencias',
      'pertinencia_global', 'aporte', 'ajustar', 'apoyos']);
}

// ---------------------------------------------------------------------------
// Infraestructura
// ---------------------------------------------------------------------------

function ensureSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(SHEET_RESPUESTAS);
  if (!hoja) {
    hoja = ss.insertSheet(SHEET_RESPUESTAS);
    var h = headers();
    hoja.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold');
    hoja.setFrozenRows(1);
    var inicial = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
    if (inicial && ss.getSheets().length > 1) ss.deleteSheet(inicial);
  }
  return hoja;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail(mensaje) {
  return json({ success: false, error: mensaje });
}

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'ping') return json({ success: true, data: 'ok' });
  if (action === 'getRespuestas') return getRespuestas();
  return fail('Acción no válida.');
}

function getRespuestas() {
  var hoja = ensureSetup();
  var ultima = hoja.getLastRow();
  var h = headers();
  var filas = [];
  if (ultima > 1) {
    var valores = hoja.getRange(2, 1, ultima - 1, h.length).getValues();
    for (var r = 0; r < valores.length; r++) {
      var obj = {};
      for (var c = 0; c < h.length; c++) {
        var v = valores[r][c];
        obj[h[c]] = v instanceof Date ? v.toISOString() : v;
      }
      filas.push(obj);
    }
  }
  return json({ success: true, data: filas });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return fail('El servidor está ocupado. Intenta de nuevo en unos segundos.');
  }
  try {
    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return fail('Solicitud inválida.');
    }
    if (body.action !== 'submitEncuesta') return fail('Acción no válida.');
    return submitEncuesta(body);
  } catch (err) {
    return fail('No se pudo guardar. Intenta de nuevo.');
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Validación y guardado
// ---------------------------------------------------------------------------

function texto(valor, max) {
  return String(valor == null ? '' : valor).replace(/^\s+|\s+$/g, '').slice(0, max);
}

function incluye(lista, valor) {
  return lista.indexOf(valor) !== -1;
}

/**
 * Valida una selección múltiple. Devuelve { lista: [..] } o { error: '...' }.
 * `ninguna` (si la lista la define) no se combina con otras opciones.
 */
function seleccion(valores, def, mensaje) {
  var arr = Object.prototype.toString.call(valores) === '[object Array]' ? valores : [];
  var vistos = {};
  var limpios = [];
  for (var i = 0; i < arr.length; i++) {
    var o = texto(arr[i], MAX_TEXTO_CORTO);
    if (!incluye(def.opciones, o)) return { error: 'Opción no válida.' };
    if (!vistos[o]) {
      vistos[o] = true;
      limpios.push(o);
    }
  }
  if (!limpios.length) return { error: mensaje };
  if (def.ninguna && incluye(limpios, def.ninguna) && limpios.length > 1) {
    return { error: '"' + def.ninguna + '" no se puede combinar con otras opciones.' };
  }
  return { lista: limpios };
}

function submitEncuesta(b) {
  var nombre = texto(b.nombre, MAX_TEXTO_CORTO);
  if (nombre.length < 3) return fail('Escribe tu nombre completo.');

  var municipio = texto(b.municipio, MAX_TEXTO_CORTO);
  if (!incluye(MUNICIPIOS, municipio)) return fail('Selecciona un municipio válido.');

  var universidad = texto(b.universidad, MAX_TEXTO_CORTO);
  var universidadOtra = '';
  var programa = texto(b.programa, MAX_TEXTO_CORTO);
  if (universidad === OTRA) {
    universidadOtra = texto(b.universidadOtra, MAX_TEXTO_CORTO);
    if (!universidadOtra) return fail('Escribe el nombre de la institución o universidad.');
    if (!programa) return fail('Escribe el programa académico.');
  } else {
    var programas = PROGRAMAS_POR_UNIVERSIDAD[universidad];
    if (!programas) return fail('Selecciona una institución o universidad válida.');
    if (!incluye(programas, programa)) return fail('Selecciona un programa válido para la institución.');
  }

  var tiempo = texto(b.tiempo, MAX_TEXTO_CORTO);
  if (!incluye(TIEMPOS, tiempo)) return fail('Selecciona el tiempo de vinculación al programa.');

  var talleres = seleccion(b.talleres, { opciones: TALLERES }, 'Selecciona al menos un taller.');
  if (talleres.error) return fail(talleres.error);

  var respuestas = b.respuestas || {};
  var escala = [];
  for (var i = 0; i < CLAVES_ESCALA.length; i++) {
    var v = respuestas[CLAVES_ESCALA[i]];
    if (v === 'NA' || v === 'N/A') {
      v = 'N/A';
    } else {
      v = Number(v);
      if (!(v >= 1 && v <= 5 && v % 1 === 0)) return fail('Responde todas las afirmaciones (puedes usar N/A).');
    }
    escala.push(v);
  }

  var estado = texto(b.estado, MAX_TEXTO_CORTO);
  if (!incluye(ESTADOS_APLICACION, estado)) return fail('Selecciona el estado de aplicación de los aprendizajes.');

  var estrategias = seleccion(b.estrategias, ESTRATEGIAS, 'Selecciona al menos una estrategia.');
  if (estrategias.error) return fail(estrategias.error);

  var dificultades = seleccion(b.dificultades, DIFICULTADES, 'Selecciona al menos una dificultad.');
  if (dificultades.error) return fail(dificultades.error);
  var dificultadOtra = '';
  if (incluye(dificultades.lista, OTRA)) {
    dificultadOtra = texto(b.dificultadOtra, MAX_TEXTO_CORTO);
    if (!dificultadOtra) return fail('Cuéntanos cuál es la otra dificultad.');
  }

  var evidencias = seleccion(b.evidencias, EVIDENCIAS, 'Selecciona al menos una evidencia.');
  if (evidencias.error) return fail(evidencias.error);

  var pertinenciaGlobal = Number(b.pertinenciaGlobal);
  if (!(pertinenciaGlobal >= 1 && pertinenciaGlobal <= 5 && pertinenciaGlobal % 1 === 0)) {
    return fail('Selecciona qué tan pertinente considera la formación.');
  }

  var apoyos = seleccion(b.apoyos, APOYOS, 'Selecciona al menos un apoyo.');
  if (apoyos.error) return fail(apoyos.error);

  var hoja = ensureSetup();
  var idEnvio = texto(b.idEnvio, 64) || Utilities.getUuid();

  // Idempotencia: ya recibido => éxito sin duplicar.
  var ultima = hoja.getLastRow();
  if (ultima > 1) {
    var ids = hoja.getRange(2, 2, ultima - 1, 1).getValues();
    for (var r = 0; r < ids.length; r++) {
      if (ids[r][0] === idEnvio) return json({ success: true, duplicado: true });
    }
  }

  var registro = [new Date(), idEnvio, nombre, municipio, universidad, universidadOtra, programa, tiempo, talleres.lista.join('; ')]
    .concat(escala)
    .concat([
      estado, estrategias.lista.join('; '), dificultades.lista.join('; '), dificultadOtra, evidencias.lista.join('; '),
      pertinenciaGlobal, texto(b.aporte, MAX_TEXTO), texto(b.ajustar, MAX_TEXTO), apoyos.lista.join('; ')
    ]);
  hoja.getRange(hoja.getLastRow() + 1, 1, 1, registro.length).setValues([registro]);
  return json({ success: true });
}
