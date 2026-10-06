/**
 * Backend API — Encuesta de valoración del Programa Técnico Profesional (CEPE)
 * La Universidad en el Campo · Iniciativa Comunidades de Cambio.
 * Google Apps Script (Web App) BOUND a una Google Sheet (carpeta de Drive
 * "Percepción pertinencia del programa"), gestionado con clasp.
 *
 * Endpoints:
 *   GET  ?action=ping
 *   GET  ?action=getRespuestas   (uso del panel admin: todas las filas como objetos con las claves de los encabezados)
 *   POST { action: "submitEncuesta", idEnvio (UUID, opcional), universidad,
 *          universidadOtra, programa, institucion (el municipio se guarda fijo: Manizales),
 *          respuestas: { p01..p26: 1-5 | 'N/A' },
 *          valoracionGlobal: 'Muy bajo'|'Bajo'|'Medio'|'Alto'|'Muy alto',
 *          fortaleza, dificultad, cambiaria, mantener, apoyo,   (texto libre, opcionales)
 *          factores: [..máx. 3..], factorOtro, proyeccion, proyeccionOtra }
 *
 * Modelo: una fila por encuesta en la hoja "Respuestas". Es anónima (no se pide nombre).
 * Idempotencia: si `idEnvio` ya existe, responde éxito SIN volver a escribir.
 * La hoja se crea sola en la primera petición (ensureSetup), no hace falta ejecutar nada.
 * Sin protección por clave, igual que los demás formularios de la organización.
 *
 * Los catálogos (universidad→programas, instituciones de Manizales) están DUPLICADOS en
 * frontend/src/data/catalogos.js: si cambian, actualizar ambos y `clasp push`.
 */

var SHEET_RESPUESTAS = 'Respuestas';
var MAX_TEXTO = 2000;
var MAX_TEXTO_CORTO = 200;
var MAX_FACTORES = 3;
var OTRA = 'Otra';

// Exclusiones pedidas: IES CINOC; Microcredenciales de la Católica; Universidad de
// Manizales solo con programas en modalidad combinada.
var PROGRAMAS_POR_UNIVERSIDAD = {
  'Universidad Autónoma de Manizales': [
    'Técnico Profesional en Control Industrial',
    'Técnico Profesional en Mantenimiento Mecánico',
    'Técnico Profesional en Programación de Computadores'
  ],
  'Universidad Católica de Manizales': [
    'Técnico Profesional en Análisis de Alimentos',
    'Técnico Profesional en Internet de las Cosas',
    'Técnico Profesional en Operación de Empresas Turísticas',
    'Técnico Profesional en Procesamiento Agroindustrial',
    'Tecnólogo Profesional en Operación de Empresas Turísticas'
  ],
  'Universidad de Caldas': [
    'Técnico Profesional en Formulación e Implementación de Proyectos Agropecuarios',
    'Técnico Profesional en Producción Agrícola',
    'Técnico Profesional en Producción Cafetera',
    'Técnico Profesional en Saneamiento Ambiental',
    'Tecnólogo Profesional en Gestión Ambiental'
  ],
  'Universidad de Manizales': [
    'Técnico Profesional en Archivística (modalidad combinada)',
    'Técnico Profesional en Atención al Cliente (modalidad combinada)',
    'Técnico Profesional en Configuración de Servicios para Comercio Electrónico (modalidad combinada)',
    'Técnico Profesional en Gestión Comercial del Sector Agropecuario (modalidad combinada)'
  ]
};

var MUNICIPIO = 'Manizales';

var INSTITUCIONES = [
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
  'San Peregrino',
  'Seráfico San Antonio de Padua'
];

var NUM_PREGUNTAS = 26;
var VALORACION_GLOBAL = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto'];

var FACTORES = [
  'Dificultades académicas', 'Falta de tiempo', 'Transporte/desplazamiento', 'Conectividad',
  'Costos asociados al estudio', 'Horarios', 'Metodologías de enseñanza', 'Comunicación con docentes',
  'Comunicación con la universidad', 'Falta de acompañamiento', 'Situaciones familiares',
  'Necesidad de trabajar', 'Falta de motivación',
  'No encuentro relación entre el programa y mi proyecto de vida', 'Ninguna', 'Otra'
];

var PROYECCIONES = [
  'Continuar estudios universitarios', 'Continuar otra formación técnica o tecnológica',
  'Buscar empleo', 'Emprender', 'Trabajar y continuar estudiando', 'Aún no lo tengo definido', 'Otra'
];

function clavePregunta(i) {
  return 'p' + (i < 10 ? '0' : '') + i;
}

function headers() {
  var h = ['timestamp', 'id_envio', 'universidad', 'universidad_otra', 'programa', 'municipio', 'institucion'];
  for (var i = 1; i <= NUM_PREGUNTAS; i++) h.push(clavePregunta(i));
  return h.concat(['valoracion_global', 'fortaleza', 'dificultad', 'cambiaria', 'mantener', 'apoyo',
    'factores', 'factor_otro', 'proyeccion', 'proyeccion_otra']);
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

function submitEncuesta(b) {
  var universidad = texto(b.universidad, MAX_TEXTO_CORTO);
  var universidadOtra = '';
  var programa = texto(b.programa, MAX_TEXTO_CORTO);

  if (universidad === OTRA) {
    universidadOtra = texto(b.universidadOtra, MAX_TEXTO_CORTO);
    if (!universidadOtra) return fail('Escribe el nombre de la universidad.');
    if (!programa) return fail('Escribe el nombre del programa.');
  } else {
    var programas = PROGRAMAS_POR_UNIVERSIDAD[universidad];
    if (!programas) return fail('Selecciona una universidad válida.');
    if (!incluye(programas, programa)) return fail('Selecciona un programa válido para la universidad.');
  }

  var municipio = MUNICIPIO;
  var institucion = texto(b.institucion, MAX_TEXTO_CORTO);
  if (!incluye(INSTITUCIONES, institucion)) return fail('Selecciona una institución válida.');

  var respuestas = b.respuestas || {};
  var fila = [];
  for (var i = 1; i <= NUM_PREGUNTAS; i++) {
    var v = respuestas[clavePregunta(i)];
    if (v === 'NA' || v === 'N/A') {
      v = 'N/A';
    } else {
      v = Number(v);
      if (!(v >= 1 && v <= 5 && v % 1 === 0)) return fail('Responde todas las afirmaciones (puedes usar N/A).');
    }
    fila.push(v);
  }

  var valoracionGlobal = texto(b.valoracionGlobal, MAX_TEXTO_CORTO);
  if (!incluye(VALORACION_GLOBAL, valoracionGlobal)) return fail('Selecciona una valoración global.');

  var factores = Object.prototype.toString.call(b.factores) === '[object Array]' ? b.factores : [];
  var vistos = {};
  var factoresLimpios = [];
  for (var f = 0; f < factores.length; f++) {
    var fac = texto(factores[f], MAX_TEXTO_CORTO);
    if (!incluye(FACTORES, fac)) return fail('Situación no válida.');
    if (!vistos[fac]) {
      vistos[fac] = true;
      factoresLimpios.push(fac);
    }
  }
  if (factoresLimpios.length === 0) return fail('Selecciona al menos una situación (o "Ninguna").');
  if (factoresLimpios.length > MAX_FACTORES) return fail('Selecciona máximo tres situaciones.');
  if (incluye(factoresLimpios, 'Ninguna') && factoresLimpios.length > 1) {
    return fail('"Ninguna" no se puede combinar con otras opciones.');
  }
  var factorOtro = '';
  if (incluye(factoresLimpios, 'Otra')) {
    factorOtro = texto(b.factorOtro, MAX_TEXTO_CORTO);
    if (!factorOtro) return fail('Cuéntanos cuál es la otra situación.');
  }

  var proyeccion = texto(b.proyeccion, MAX_TEXTO_CORTO);
  if (!incluye(PROYECCIONES, proyeccion)) return fail('Selecciona qué esperas hacer al finalizar.');
  var proyeccionOtra = '';
  if (proyeccion === 'Otra') {
    proyeccionOtra = texto(b.proyeccionOtra, MAX_TEXTO_CORTO);
    if (!proyeccionOtra) return fail('Cuéntanos qué esperas hacer.');
  }

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

  var registro = [new Date(), idEnvio, universidad, universidadOtra, programa, municipio, institucion]
    .concat(fila)
    .concat([
      valoracionGlobal,
      texto(b.fortaleza, MAX_TEXTO), texto(b.dificultad, MAX_TEXTO), texto(b.cambiaria, MAX_TEXTO),
      texto(b.mantener, MAX_TEXTO), texto(b.apoyo, MAX_TEXTO),
      factoresLimpios.join('; '), factorOtro, proyeccion, proyeccionOtra
    ]);
  hoja.getRange(hoja.getLastRow() + 1, 1, 1, registro.length).setValues([registro]);
  return json({ success: true });
}
