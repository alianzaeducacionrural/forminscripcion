/**
 * Backend API — Comité Académico 25-09-2026 (La Universidad en el Campo)
 * Matriz 1: Internacionalización · Matriz 2: Fortalecimiento de la
 * implementación del modelo por los docentes universitarios.
 * Google Apps Script (Web App), bound a una Google Sheet, gestionado con clasp.
 *
 * Endpoints:
 *   GET  ?action=listInstituciones
 *   GET  ?action=getMatriz1            (uso del panel admin)
 *   GET  ?action=getMatriz2            (uso del panel admin)
 *   POST { action: "submitMatriz1", institucion,
 *          filas: [{ categoria, accion, dirigidaA, comoSeDesarrolla, aliados,
 *                    periodicidad, recursos, resultado }] }
 *   POST { action: "submitMatriz2", institucion,
 *          filas: [{ aspecto, personalizado, situacion, accionMejora,
 *                    responsable, apoyo, tiempo, evidencia }] }
 *
 * Modelo de datos: cada envío es un conjunto de filas (una por acción en la
 * Matriz 1, una por aspecto en la Matriz 2) que comparten `id_envio` y
 * `timestamp`. Una institución puede volver a enviar para corregir: los envíos
 * anteriores NO se borran (quedan como historial en la Sheet); el panel toma
 * como vigente el `id_envio` más reciente de cada institución.
 *
 * Sin protección por clave: el panel admin se protege únicamente por ser un
 * enlace no listado, igual que en los demás formularios de la organización.
 *
 * Este script está BOUND a su Google Sheet (creado con
 * `clasp create-script --type sheets`), así que usa
 * SpreadsheetApp.getActiveSpreadsheet() — no requiere SPREADSHEET_ID.
 *
 * Configuración requerida antes de compartir los enlaces:
 *   1. Ejecutar una vez setup() manualmente desde el editor (crea los tabs
 *      Instituciones/Matriz1/Matriz2 con encabezados y siembra el catálogo).
 *   2. Desplegar como Web App (`clasp create-deployment`).
 *   3. Antes de compartir los enlaces, ejecutar limpiarRegistrosDePrueba().
 */

var SHEET_INSTITUCIONES = 'Instituciones';
var SHEET_MATRIZ1 = 'Matriz1';
var SHEET_MATRIZ2 = 'Matriz2';

var MAX_FILAS = 60;
var MAX_CARACTERES = 2000;

// Duplicado a propósito en frontend/src/data/catalogos.js (INSTITUCIONES).
var INSTITUCIONES_SEED = [
  ['IES01', 'IES CINOC'],
  ['IES02', 'Universidad Autónoma de Manizales'],
  ['IES03', 'Universidad Católica de Manizales'],
  ['IES04', 'Universidad de Caldas'],
  ['IES05', 'Universidad de Manizales']
];

var MATRIZ1_CATEGORIAS = [
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
  'Otra'
];

var MATRIZ2_ASPECTOS_FIJOS = [
  'Uso de guías con la estructura de Escuela Nueva',
  'Trabajo en equipo: roles',
  'Mediación actividades de conjunto'
];

// Campos de texto obligatorios de cada fila, en el orden de las columnas de la Sheet.
var MATRIZ1_CAMPOS = ['accion', 'dirigidaA', 'comoSeDesarrolla', 'aliados', 'periodicidad', 'recursos', 'resultado'];
var MATRIZ2_CAMPOS = ['situacion', 'accionMejora', 'responsable', 'apoyo', 'tiempo', 'evidencia'];

var MATRIZ1_HEADERS = [
  'timestamp', 'id_envio', 'institucion', 'orden', 'categoria',
  'accion', 'dirigida_a', 'como_se_desarrollaria', 'aliados', 'periodicidad', 'recursos', 'resultado_esperado'
];

var MATRIZ2_HEADERS = [
  'timestamp', 'id_envio', 'institucion', 'orden', 'personalizado', 'aspecto',
  'situacion', 'accion_mejora', 'responsable', 'apoyo', 'tiempo', 'evidencia'
];

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

  var matriz1 = ss.getSheetByName(SHEET_MATRIZ1) || ss.insertSheet(SHEET_MATRIZ1);
  matriz1.clear();
  matriz1.getRange(1, 1, 1, MATRIZ1_HEADERS.length).setValues([MATRIZ1_HEADERS]);
  matriz1.setFrozenRows(1);

  var matriz2 = ss.getSheetByName(SHEET_MATRIZ2) || ss.insertSheet(SHEET_MATRIZ2);
  matriz2.clear();
  matriz2.getRange(1, 1, 1, MATRIZ2_HEADERS.length).setValues([MATRIZ2_HEADERS]);
  matriz2.setFrozenRows(1);

  var porDefecto = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1') || ss.getSheetByName('Hoja1');
  if (porDefecto && ss.getSheets().length > 3) {
    ss.deleteSheet(porDefecto);
  }

  Logger.log('Setup completo. Tabs creados: ' + SHEET_INSTITUCIONES + ', ' + SHEET_MATRIZ1 + ', ' + SHEET_MATRIZ2);
}

/**
 * Borra TODAS las filas de datos de Matriz1 y Matriz2 (deja los encabezados).
 * Ejecutar manualmente una sola vez desde el editor, antes de compartir los
 * enlaces reales, para limpiar los registros de prueba.
 */
function limpiarRegistrosDePrueba() {
  [SHEET_MATRIZ1, SHEET_MATRIZ2].forEach(function (nombre) {
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

    if (action === 'getMatriz1') {
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_MATRIZ1) });
    }

    if (action === 'getMatriz2') {
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_MATRIZ2) });
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

    if (action === 'submitMatriz1') {
      return jsonResponse_({ success: true, id: submitMatriz1_(body) });
    }

    if (action === 'submitMatriz2') {
      return jsonResponse_({ success: true, id: submitMatriz2_(body) });
    }

    return jsonResponse_({ success: false, error: 'Acción no reconocida: ' + action });
  } catch (err) {
    return jsonResponse_({ success: false, error: String(err) });
  }
}

// ---------------------------------------------------------------------------
// listInstituciones
// ---------------------------------------------------------------------------

function listInstituciones_() {
  var sheet = getSheet_(SHEET_INSTITUCIONES);
  var values = sheet.getDataRange().getValues();
  var rows = values.slice(1).filter(function (row) { return row[0]; });
  return rows.map(function (row) {
    return { id: row[0], nombre: row[1] };
  });
}

// ---------------------------------------------------------------------------
// submitMatriz1 / submitMatriz2
// ---------------------------------------------------------------------------

function submitMatriz1_(body) {
  var errors = [];
  validarInstitucion_(body.institucion, errors);
  var filas = validarListaFilas_(body.filas, errors);

  filas.forEach(function (fila, i) {
    var nombre = 'Acción ' + (i + 1);
    validarTextos_(fila, MATRIZ1_CAMPOS, nombre, errors);
    var categoria = fila.categoria ? String(fila.categoria) : '';
    if (categoria && MATRIZ1_CATEGORIAS.indexOf(categoria) === -1) {
      errors.push(nombre + ': categoría no reconocida: ' + categoria);
    }
  });

  if (errors.length > 0) throw new Error(errors.join('; '));

  var datos = filas.map(function (fila) {
    return [fila.categoria ? String(fila.categoria) : ''].concat(textos_(fila, MATRIZ1_CAMPOS));
  });

  // 'categoria' es la 5.ª columna: desde ahí todo es texto plano.
  return guardarEnvio_(SHEET_MATRIZ1, MATRIZ1_HEADERS.length, body.institucion, datos, 5);
}

function submitMatriz2_(body) {
  var errors = [];
  validarInstitucion_(body.institucion, errors);
  var filas = validarListaFilas_(body.filas, errors);

  var aspectosVistos = {};
  filas.forEach(function (fila, i) {
    var aspecto = String(fila.aspecto || '').trim();
    var nombre = 'Fila ' + (i + 1) + (aspecto ? ' (' + aspecto + ')' : '');

    if (!aspecto) {
      errors.push(nombre + ': aspecto es requerido');
    } else {
      if (aspecto.length > 200) errors.push(nombre + ': aspecto supera 200 caracteres');
      var clave = normalizarClave_(aspecto);
      if (aspectosVistos[clave]) errors.push('El aspecto "' + aspecto + '" está repetido');
      aspectosVistos[clave] = true;
    }
    validarTextos_(fila, MATRIZ2_CAMPOS, nombre, errors);
  });

  // Los 3 aspectos de la matriz original deben venir siempre, una vez cada uno.
  MATRIZ2_ASPECTOS_FIJOS.forEach(function (fijo) {
    if (!aspectosVistos[normalizarClave_(fijo)]) errors.push('Falta el aspecto: ' + fijo);
  });

  if (errors.length > 0) throw new Error(errors.join('; '));

  var fijos = MATRIZ2_ASPECTOS_FIJOS.map(normalizarClave_);
  var datos = filas.map(function (fila) {
    var aspecto = String(fila.aspecto).trim();
    var personalizado = fijos.indexOf(normalizarClave_(aspecto)) === -1;
    return [personalizado, aspecto].concat(textos_(fila, MATRIZ2_CAMPOS));
  });

  // 'personalizado' (col. 5) es booleano; el texto plano empieza en 'aspecto' (col. 6).
  return guardarEnvio_(SHEET_MATRIZ2, MATRIZ2_HEADERS.length, body.institucion, datos, 6);
}

/**
 * Escribe todas las filas de un envío de una sola vez, bajo bloqueo, para que
 * dos envíos simultáneos no intercalen sus filas. `colTextoDesde` (1-based) es
 * la primera columna de texto libre: se le pone formato "texto plano" antes de
 * escribir para que ningún valor que empiece con "=" o "+" se ejecute como
 * fórmula en la Sheet.
 */
function guardarEnvio_(sheetName, numColumnas, institucion, filasDatos, colTextoDesde) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var id = Utilities.getUuid();
    var timestamp = new Date();
    var filas = filasDatos.map(function (datos, i) {
      return [timestamp, id, institucion, i + 1].concat(datos);
    });

    var sheet = getSheet_(sheetName);
    var primeraFila = sheet.getLastRow() + 1;
    sheet
      .getRange(primeraFila, colTextoDesde, filas.length, numColumnas - colTextoDesde + 1)
      .setNumberFormat('@');
    sheet.getRange(primeraFila, 1, filas.length, numColumnas).setValues(filas);
    SpreadsheetApp.flush();
    return id;
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Validación (funciones puras, sin librería externa)
// ---------------------------------------------------------------------------

function validarInstitucion_(institucion, errors) {
  var nombres = INSTITUCIONES_SEED.map(function (row) { return row[1]; });
  if (!institucion) {
    errors.push('institucion es requerida');
  } else if (nombres.indexOf(institucion) === -1) {
    errors.push('institucion no reconocida: ' + institucion);
  }
}

function validarListaFilas_(filas, errors) {
  if (!Array.isArray(filas) || filas.length === 0) {
    errors.push('filas debe tener al menos una fila');
    return [];
  }
  if (filas.length > MAX_FILAS) {
    errors.push('filas no puede tener más de ' + MAX_FILAS + ' filas');
    return [];
  }
  return filas.map(function (fila) { return fila && typeof fila === 'object' ? fila : {}; });
}

function validarTextos_(fila, campos, nombreFila, errors) {
  campos.forEach(function (campo) {
    var valor = fila[campo];
    if (valor === undefined || valor === null || !String(valor).trim()) {
      errors.push(nombreFila + ': ' + campo + ' es requerido');
    } else if (String(valor).length > MAX_CARACTERES) {
      errors.push(nombreFila + ': ' + campo + ' supera ' + MAX_CARACTERES + ' caracteres');
    }
  });
}

function textos_(fila, campos) {
  return campos.map(function (campo) { return String(fila[campo]).trim(); });
}

function normalizarClave_(valor) {
  return String(valor || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// Lectura genérica (usada por getMatriz1/getMatriz2)
// ---------------------------------------------------------------------------

function leerFilas_(sheetName) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idxIdEnvio = headers.indexOf('id_envio');
  var rows = values.slice(1).filter(function (row) { return row[idxIdEnvio]; });

  return rows.map(function (row) {
    var obj = {};
    headers.forEach(function (header, i) {
      var val = row[i];
      if (header === 'timestamp' && val instanceof Date) {
        obj[header] = val.toISOString();
      } else if (header === 'orden') {
        obj[header] = Number(val);
      } else if (header === 'personalizado') {
        obj[header] = val === true || String(val).toUpperCase() === 'TRUE';
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
