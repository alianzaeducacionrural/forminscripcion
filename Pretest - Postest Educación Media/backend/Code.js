/**
 * Backend API — Pretest / Postest
 * Estrategias metodológicas activas y uso pedagógico de evidencias
 * (Iniciativa La Universidad en el Campo / Comunidades de Cambio)
 * Google Apps Script (Web App), bound a una Google Sheet, gestionado con clasp.
 *
 * Endpoints:
 *   GET  ?action=listInstituciones
 *   GET  ?action=getPretestPorInstitucion&institucion=...
 *   GET  ?action=getPretest    (uso del panel admin)
 *   GET  ?action=getPostest    (uso del panel admin)
 *   POST { action: "submitPretest",  institucion, nombreDocente, areas: [],
 *          p1, p2, p3, p4Elementos: [], p4Otro,
 *          p5Competencia, p5Estrategia, p5Evidencia }
 *   POST { action: "submitPostest", institucion, nombreDocente, areas: [],
 *          q1, q2, q3Estrategias: [], q3Otra, q3Aplicaria,
 *          q4Elementos: [],
 *          q5Aprendizaje, q5Estrategia, q5Evidencia, q5Seguimiento }
 *
 * No es calificativo para el docente: la alineación con la práctica
 * pedagógica recomendada (columnas *_alineado) se calcula aquí y solo se usa
 * en el panel admin — nunca se expone al formulario público ni se muestra
 * como nota o resultado correcto/incorrecto al docente.
 *
 * Sin protección por clave: el panel admin se protege únicamente por ser
 * un enlace no listado (nadie lo conoce salvo quien lo comparta).
 *
 * Este script está BOUND a su Google Sheet (creado con
 * `clasp create-script --type sheets`), así que usa
 * SpreadsheetApp.getActiveSpreadsheet() — no requiere SPREADSHEET_ID en
 * Script Properties.
 *
 * Configuración requerida antes de compartir los enlaces:
 *   1. Ejecutar una vez la función setup() manualmente desde el editor
 *      para crear los tabs Instituciones/Pretest/Postest con sus
 *      encabezados y sembrar el catálogo de instituciones.
 *   2. Desplegar como Web App (`clasp create-deployment`).
 *   3. Antes de compartir los enlaces, ejecutar limpiarRegistrosDePrueba().
 */

var SHEET_INSTITUCIONES = 'Instituciones';
var SHEET_PRETEST = 'Pretest';
var SHEET_POSTEST = 'Postest';

var INSTITUCIONES_SEED = [
  ['IE01', 'Adolfo Hoyos Ocampo'],
  ['IE02', 'Giovanni Montini'],
  ['IE03', 'Granada'],
  ['IE04', 'José Antonio Galán'],
  ['IE05', 'La Cabaña'],
  ['IE06', 'La Linda'],
  ['IE07', 'La Trinidad'],
  ['IE08', 'La Violeta'],
  ['IE09', 'Maltería'],
  ['IE10', 'María Goretti'],
  ['IE11', 'Miguel Antonio Caro'],
  ['IE12', 'Rafael Pombo'],
  ['IE13', 'San Peregrino'],
  ['IE14', 'Seráfico San Antonio de Padua']
];

var AREAS_VALIDAS = [
  'Matemáticas',
  'Lenguaje',
  'Sociales',
  'Ciencias Naturales',
  'Líder La Universidad en el Campo'
];

var OPCIONES_VALIDAS = ['a', 'b', 'c', 'd'];

var PRETEST_P4_ELEMENTOS = [
  'Competencia o aprendizaje que requiere fortalecimiento',
  'Nivel de desempeño de los estudiantes',
  'Características y contexto de los estudiantes',
  'Evidencias disponibles sobre el aprendizaje',
  'Estrategias pedagógicas que actualmente utiliza',
  'Recursos disponibles en la institución',
  'Posibilidades de articulación con otros docentes o con la universidad'
];
var PRETEST_P4_OTRO = 'Otro';

var POSTEST_Q3_ESTRATEGIAS = [
  'Aprendizaje basado en proyectos',
  'Aprendizaje basado en problemas',
  'Trabajo colaborativo',
  'Aprendizaje basado en retos',
  'Estudio de casos',
  'Investigación en el aula',
  'Aula invertida',
  'Gamificación'
];
var POSTEST_Q3_OTRA = 'Otra';

var POSTEST_Q4_ELEMENTOS = [
  'Competencia o aprendizaje que se requiere fortalecer',
  'Nivel de desempeño de los estudiantes',
  'Características y contexto de los estudiantes',
  'Evidencias de aprendizaje disponibles',
  'Estrategias pedagógicas previamente implementadas',
  'Recursos y posibilidades de articulación con otros actores',
  'Únicamente los contenidos establecidos en la planeación'
];
var POSTEST_Q4_DESALINEADO = 'Únicamente los contenidos establecidos en la planeación';

// Clave de respuestas alineadas con la práctica pedagógica recomendada.
// Vive únicamente aquí, en el backend — nunca en el bundle del frontend.
var PRETEST_ANSWER_KEY = { p1: 'b', p2: 'c', p3: 'b' };
var POSTEST_ANSWER_KEY = { q1: 'b', q2: 'c' };

var PRETEST_HEADERS = [
  'timestamp', 'id_registro', 'institucion', 'nombre_docente', 'areas',
  'p1_opcion', 'p1_alineado', 'p2_opcion', 'p2_alineado', 'p3_opcion', 'p3_alineado',
  'p4_elementos', 'p4_otro', 'p5_competencia', 'p5_estrategia', 'p5_evidencia'
];

var POSTEST_HEADERS = [
  'timestamp', 'id_registro', 'institucion', 'nombre_docente', 'areas',
  'q1_opcion', 'q1_alineado', 'q2_opcion', 'q2_alineado',
  'q3_estrategias', 'q3_otra', 'q3_aplicaria', 'q4_elementos', 'q4_alineado',
  'q5_aprendizaje', 'q5_estrategia', 'q5_evidencia', 'q5_seguimiento'
];

var COLUMNAS_MULTIVALOR = { areas: true, p4_elementos: true, q3_estrategias: true, q4_elementos: true };

var CONECTORES_MINUSCULA = ['de', 'del', 'la', 'las', 'los', 'y'];

// ---------------------------------------------------------------------------
// Setup (ejecutar manualmente una sola vez desde el editor de Apps Script)
// ---------------------------------------------------------------------------

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var instituciones = ss.getSheetByName(SHEET_INSTITUCIONES) || ss.insertSheet(SHEET_INSTITUCIONES);
  instituciones.clear();
  instituciones.getRange(1, 1, 1, 2).setValues([['id_institucion', 'nombre_institucion']]);
  instituciones.getRange(2, 1, INSTITUCIONES_SEED.length, 2).setValues(INSTITUCIONES_SEED);
  instituciones.setFrozenRows(1);

  var pretest = ss.getSheetByName(SHEET_PRETEST) || ss.insertSheet(SHEET_PRETEST);
  pretest.clear();
  pretest.getRange(1, 1, 1, PRETEST_HEADERS.length).setValues([PRETEST_HEADERS]);
  pretest.setFrozenRows(1);

  var postest = ss.getSheetByName(SHEET_POSTEST) || ss.insertSheet(SHEET_POSTEST);
  postest.clear();
  postest.getRange(1, 1, 1, POSTEST_HEADERS.length).setValues([POSTEST_HEADERS]);
  postest.setFrozenRows(1);

  var porDefecto = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1') || ss.getSheetByName('Hoja1');
  if (porDefecto && ss.getSheets().length > 3) {
    ss.deleteSheet(porDefecto);
  }

  Logger.log('Setup completo. Tabs creados: ' + SHEET_INSTITUCIONES + ', ' + SHEET_PRETEST + ', ' + SHEET_POSTEST);
}

/**
 * Borra TODAS las filas de datos de Pretest y Postest (deja los encabezados).
 * Ejecutar manualmente una sola vez desde el editor, antes de compartir los
 * enlaces reales, para limpiar los registros de prueba.
 */
function limpiarRegistrosDePrueba() {
  [SHEET_PRETEST, SHEET_POSTEST].forEach(function (nombre) {
    var sheet = getSheet_(nombre);
    var ultimaFila = sheet.getLastRow();
    if (ultimaFila <= 1) {
      Logger.log('No hay filas de datos para borrar en ' + nombre + '.');
      return;
    }
    sheet.deleteRows(2, ultimaFila - 1);
    Logger.log('Se borraron ' + (ultimaFila - 1) + ' filas de ' + nombre + '.');
  });
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

function doGet(e) {
  var action = e.parameter.action;

  try {
    if (action === 'listInstituciones') {
      return jsonResponse_({ success: true, data: listInstituciones_() });
    }

    if (action === 'getPretest') {
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_PRETEST) });
    }

    if (action === 'getPostest') {
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_POSTEST) });
    }

    if (action === 'getPretestPorInstitucion') {
      return jsonResponse_({ success: true, data: getPretestPorInstitucion_(e.parameter.institucion) });
    }

    return jsonResponse_({ success: false, error: 'Acción no reconocida: ' + action });
  } catch (err) {
    return jsonResponse_({ success: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'submitPretest') {
      var idPretest = submitPretest_(body);
      return jsonResponse_({ success: true, id: idPretest });
    }

    if (action === 'submitPostest') {
      var idPostest = submitPostest_(body);
      return jsonResponse_({ success: true, id: idPostest });
    }

    return jsonResponse_({ success: false, error: 'Acción no reconocida: ' + action });
  } catch (err) {
    return jsonResponse_({ success: false, error: String(err) });
  }
}

// ---------------------------------------------------------------------------
// listInstituciones / getPretestPorInstitucion
// ---------------------------------------------------------------------------

function listInstituciones_() {
  var sheet = getSheet_(SHEET_INSTITUCIONES);
  var values = sheet.getDataRange().getValues();
  var rows = values.slice(1).filter(function (row) { return row[0]; });
  return rows.map(function (row) {
    return { id: row[0], nombre: row[1] };
  });
}

/**
 * Filtra en el servidor por institución (a diferencia de getPretest/getPostest,
 * que devuelven todo y se usan solo desde el panel admin). Esta acción la
 * llama el formulario público de postest sin autenticación, así que exponer
 * el roster completo de las 14 instituciones sería un riesgo de datos
 * personales innecesario.
 */
function getPretestPorInstitucion_(institucion) {
  if (!institucion) throw new Error('institucion es requerida');
  var docentes = leerFilas_(SHEET_PRETEST);
  return docentes
    .filter(function (d) { return d.institucion === institucion; })
    .map(function (d) { return { nombre_docente: d.nombre_docente, areas: d.areas }; });
}

// ---------------------------------------------------------------------------
// submitPretest / submitPostest
// ---------------------------------------------------------------------------

function submitPretest_(body) {
  var errors = [];
  var nombresInstituciones = INSTITUCIONES_SEED.map(function (row) { return row[1]; });

  if (!body.institucion) {
    errors.push('institucion es requerida');
  } else if (nombresInstituciones.indexOf(body.institucion) === -1) {
    errors.push('institucion no reconocida: ' + body.institucion);
  }

  if (!body.nombreDocente || !String(body.nombreDocente).trim()) {
    errors.push('nombreDocente es requerido');
  }

  var areas = body.areas || [];
  validarAreas_(areas, errors, 'areas');

  validarOpcion_(body.p1, 'p1', errors);
  validarOpcion_(body.p2, 'p2', errors);
  validarOpcion_(body.p3, 'p3', errors);

  var p4Elementos = body.p4Elementos || [];
  validarChecklist_(p4Elementos, PRETEST_P4_ELEMENTOS, PRETEST_P4_OTRO, body.p4Otro, errors, 'p4Elementos');

  var nombreNormalizado = normalizarNombrePropio_(body.nombreDocente);
  if (nombreNormalizado && body.institucion && existeRegistro_(SHEET_PRETEST, body.institucion, nombreNormalizado)) {
    errors.push('Ya existe un registro de pretest para "' + nombreNormalizado + '" en "' + body.institucion + '"');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  var id = Utilities.getUuid();
  var timestamp = new Date();

  var fila = [
    timestamp,
    id,
    body.institucion,
    nombreNormalizado,
    areas.join('; '),
    body.p1, PRETEST_ANSWER_KEY.p1 === body.p1,
    body.p2, PRETEST_ANSWER_KEY.p2 === body.p2,
    body.p3, PRETEST_ANSWER_KEY.p3 === body.p3,
    p4Elementos.join('; '),
    p4Elementos.indexOf(PRETEST_P4_OTRO) !== -1 ? String(body.p4Otro || '').trim() : '',
    String(body.p5Competencia || '').trim(),
    String(body.p5Estrategia || '').trim(),
    String(body.p5Evidencia || '').trim()
  ];

  var sheet = getSheet_(SHEET_PRETEST);
  var primeraFila = sheet.getLastRow() + 1;
  sheet.getRange(primeraFila, 1, 1, PRETEST_HEADERS.length).setValues([fila]);

  return id;
}

function submitPostest_(body) {
  var errors = [];
  var nombresInstituciones = INSTITUCIONES_SEED.map(function (row) { return row[1]; });

  if (!body.institucion) {
    errors.push('institucion es requerida');
  } else if (nombresInstituciones.indexOf(body.institucion) === -1) {
    errors.push('institucion no reconocida: ' + body.institucion);
  }

  if (!body.nombreDocente || !String(body.nombreDocente).trim()) {
    errors.push('nombreDocente es requerido');
  }

  var areas = body.areas || [];
  validarAreas_(areas, errors, 'areas');

  validarOpcion_(body.q1, 'q1', errors);
  validarOpcion_(body.q2, 'q2', errors);

  var q3Estrategias = body.q3Estrategias || [];
  validarChecklist_(q3Estrategias, POSTEST_Q3_ESTRATEGIAS, POSTEST_Q3_OTRA, body.q3Otra, errors, 'q3Estrategias');

  var q4Elementos = body.q4Elementos || [];
  validarChecklist_(q4Elementos, POSTEST_Q4_ELEMENTOS, null, null, errors, 'q4Elementos');

  var nombreNormalizado = normalizarNombrePropio_(body.nombreDocente);
  if (nombreNormalizado && body.institucion && existeRegistro_(SHEET_POSTEST, body.institucion, nombreNormalizado)) {
    errors.push('Ya existe un registro de postest para "' + nombreNormalizado + '" en "' + body.institucion + '"');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  var id = Utilities.getUuid();
  var timestamp = new Date();
  var q4Alineado = !(q4Elementos.length === 1 && q4Elementos[0] === POSTEST_Q4_DESALINEADO);

  var fila = [
    timestamp,
    id,
    body.institucion,
    nombreNormalizado,
    areas.join('; '),
    body.q1, POSTEST_ANSWER_KEY.q1 === body.q1,
    body.q2, POSTEST_ANSWER_KEY.q2 === body.q2,
    q3Estrategias.join('; '),
    q3Estrategias.indexOf(POSTEST_Q3_OTRA) !== -1 ? String(body.q3Otra || '').trim() : '',
    String(body.q3Aplicaria || '').trim(),
    q4Elementos.join('; '),
    q4Alineado,
    String(body.q5Aprendizaje || '').trim(),
    String(body.q5Estrategia || '').trim(),
    String(body.q5Evidencia || '').trim(),
    String(body.q5Seguimiento || '').trim()
  ];

  var sheet = getSheet_(SHEET_POSTEST);
  var primeraFila = sheet.getLastRow() + 1;
  sheet.getRange(primeraFila, 1, 1, POSTEST_HEADERS.length).setValues([fila]);

  return id;
}

// ---------------------------------------------------------------------------
// Validación (funciones puras, sin librería externa)
// ---------------------------------------------------------------------------

function validarOpcion_(valor, nombre, errors) {
  if (OPCIONES_VALIDAS.indexOf(valor) === -1) {
    errors.push(nombre + ' debe ser una de las opciones a, b, c, d');
  }
}

function validarAreas_(areas, errors, prefijo) {
  if (!areas.length) {
    errors.push(prefijo + ' debe tener al menos un área');
    return;
  }
  var vistas = {};
  areas.forEach(function (area) {
    if (AREAS_VALIDAS.indexOf(area) === -1) {
      errors.push(prefijo + ' contiene un área no reconocida: ' + area);
    }
    if (vistas[area]) errors.push(prefijo + ' tiene "' + area + '" repetida');
    vistas[area] = true;
  });
}

/**
 * sentinelOtro/textoOtro son opcionales: pasar null en ambos para un
 * checklist sin opción de texto libre (ej. postest q4).
 */
function validarChecklist_(seleccion, catalogo, sentinelOtro, textoOtro, errors, prefijo) {
  if (!seleccion.length) {
    errors.push(prefijo + ' debe tener al menos una opción marcada');
    return;
  }
  var validos = sentinelOtro ? catalogo.concat([sentinelOtro]) : catalogo;
  var vistos = {};
  seleccion.forEach(function (opcion) {
    if (validos.indexOf(opcion) === -1) {
      errors.push(prefijo + ' contiene una opción no reconocida: ' + opcion);
    }
    if (vistos[opcion]) errors.push(prefijo + ' tiene "' + opcion + '" repetida');
    vistos[opcion] = true;
  });
  if (sentinelOtro && seleccion.indexOf(sentinelOtro) !== -1 && (!textoOtro || !String(textoOtro).trim())) {
    errors.push(prefijo + ': debe especificar el texto de "' + sentinelOtro + '"');
  }
}

// ---------------------------------------------------------------------------
// Normalización de nombre y detección de duplicados
// ---------------------------------------------------------------------------

/** "juan pérez gómez" -> "Juan Pérez Gómez" (conectores como "de"/"del" quedan en minúscula salvo al inicio). */
function normalizarNombrePropio_(nombre) {
  var limpio = String(nombre || '').trim().replace(/\s+/g, ' ');
  if (!limpio) return '';
  var palabras = limpio.toLowerCase().split(' ');
  return palabras.map(function (palabra, i) {
    if (i > 0 && CONECTORES_MINUSCULA.indexOf(palabra) !== -1) return palabra;
    return palabra.charAt(0).toUpperCase() + palabra.slice(1);
  }).join(' ');
}

function normalizarClave_(valor) {
  return String(valor || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Compara institución+nombre insensible a mayúsculas/espacios, sin eliminar tildes. */
function existeRegistro_(sheetName, institucion, nombreNormalizado) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idxInstitucion = headers.indexOf('institucion');
  var idxNombre = headers.indexOf('nombre_docente');
  var claveNueva = normalizarClave_(institucion) + '|' + normalizarClave_(nombreNormalizado);

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[idxNombre]) continue;
    var claveExistente = normalizarClave_(row[idxInstitucion]) + '|' + normalizarClave_(row[idxNombre]);
    if (claveExistente === claveNueva) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Lectura genérica (usada por getPretest/getPostest/getPretestPorInstitucion)
// ---------------------------------------------------------------------------

function leerFilas_(sheetName) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idxIdRegistro = headers.indexOf('id_registro');
  var rows = values.slice(1).filter(function (row) { return row[idxIdRegistro]; });

  return rows.map(function (row) {
    var obj = {};
    headers.forEach(function (header, i) {
      var val = row[i];
      if (header === 'timestamp' && val instanceof Date) {
        obj[header] = val.toISOString();
      } else if (COLUMNAS_MULTIVALOR[header]) {
        obj[header] = val ? String(val).split(';').map(function (a) { return a.trim(); }).filter(Boolean) : [];
      } else {
        obj[header] = val;
      }
    });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('No existe el tab "' + name + '". Ejecuta setup() primero.');
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
