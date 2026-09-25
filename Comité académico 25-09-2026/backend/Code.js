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
 *   POST { action: "submitMatriz1", idEnvio (opcional), institucion, nombre,
 *          filas: [{ categoria, categoriaOtra (obligatoria si categoria = "Otra"), accion, dirigidaA, comoSeDesarrolla, aliados,
 *                    periodicidad, recursos, resultado }] }
 *   POST { action: "submitMatriz2", idEnvio (opcional), institucion, nombre,
 *          filas: [{ aspecto, personalizado, situacion, accionMejora,
 *                    responsable, apoyo, tiempo, evidencia }] }
 *
 * Modelo de datos: cada envío es un conjunto de filas (una por acción en la
 * Matriz 1, una por aspecto en la Matriz 2) que comparten `id_envio` y
 * `timestamp`. `institucion` y `nombre` (quien diligencia) son TEXTO LIBRE:
 * participan también representantes de entidades que no son universidades.
 * Una persona puede volver a enviar para corregir: los envíos anteriores NO se
 * borran (quedan como historial en la Sheet); el panel toma como vigente el
 * `id_envio` más reciente de cada pareja institución + nombre.
 *
 * Idempotencia: el frontend manda un `idEnvio` (UUID) por intento de envío. Si
 * ese id ya existe en la Sheet, el backend responde éxito SIN volver a escribir,
 * así un doble clic o un reintento tras un corte de red no duplica filas.
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
var MAX_CARACTERES_CORTO = 200;

// Solo SUGERENCIAS para el campo Institución (el frontend las ofrece como
// autocompletado; el campo acepta cualquier texto). Duplicado en
// frontend/src/data/catalogos.js (INSTITUCIONES_SUGERIDAS).
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
  'timestamp', 'id_envio', 'institucion', 'nombre', 'orden', 'categoria',
  'accion', 'dirigida_a', 'como_se_desarrollaria', 'aliados', 'periodicidad', 'recursos', 'resultado_esperado',
  'categoria_otra'
];

var MATRIZ2_HEADERS = [
  'timestamp', 'id_envio', 'institucion', 'nombre', 'orden', 'personalizado', 'aspecto',
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
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_MATRIZ1, MATRIZ1_HEADERS) });
    }

    if (action === 'getMatriz2') {
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_MATRIZ2, MATRIZ2_HEADERS) });
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
  var quien = validarIdentificacion_(body, errors);
  var idEnvio = validarIdEnvio_(body.idEnvio, errors);
  var filas = validarListaFilas_(body.filas, errors);

  filas.forEach(function (fila, i) {
    var nombre = 'Acción ' + (i + 1);
    validarTextos_(fila, MATRIZ1_CAMPOS, nombre, errors);
    var categoria = fila.categoria ? String(fila.categoria) : '';
    if (categoria && MATRIZ1_CATEGORIAS.indexOf(categoria) === -1) {
      errors.push(nombre + ': categoría no reconocida: ' + categoria);
    }
    // "Otra" exige decir cuál; con cualquier otra categoría el texto libre se ignora.
    var otra = limpiarTexto_(fila.categoriaOtra);
    if (categoria === 'Otra') {
      if (!otra) errors.push(nombre + ': categoriaOtra es requerida cuando la categoría es "Otra"');
      else if (otra.length > MAX_CARACTERES_CORTO) errors.push(nombre + ': categoriaOtra supera ' + MAX_CARACTERES_CORTO + ' caracteres');
    }
  });

  if (errors.length > 0) throw new Error(errors.join('; '));

  var datos = filas.map(function (fila) {
    var categoria = fila.categoria ? String(fila.categoria) : '';
    var categoriaOtra = categoria === 'Otra' ? limpiarTexto_(fila.categoriaOtra) : '';
    // 'categoria_otra' va al final de la fila (columna agregada después: no mueve las anteriores).
    return [categoria].concat(textos_(fila, MATRIZ1_CAMPOS), [categoriaOtra]);
  });

  // 'categoria' es la 6.ª columna: desde ahí todo es texto plano.
  return guardarEnvio_(SHEET_MATRIZ1, MATRIZ1_HEADERS, quien, datos, 6, idEnvio);
}

function submitMatriz2_(body) {
  var errors = [];
  var quien = validarIdentificacion_(body, errors);
  var idEnvio = validarIdEnvio_(body.idEnvio, errors);
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

  // 'personalizado' (col. 6) es booleano; el texto plano empieza en 'aspecto' (col. 7).
  return guardarEnvio_(SHEET_MATRIZ2, MATRIZ2_HEADERS, quien, datos, 7, idEnvio);
}

/**
 * Escribe todas las filas de un envío de una sola vez, bajo bloqueo, para que
 * dos envíos simultáneos no intercalen sus filas. Se les pone formato "texto
 * plano" al id, institución y nombre (columnas 2-4) y a las columnas de texto
 * libre (desde `colTextoDesde`, 1-based) antes de escribir, para que ningún
 * valor que empiece con "=" o "+" se ejecute como fórmula en la Sheet.
 *
 * Si `idEnvio` ya existe en la Sheet, no escribe nada y devuelve ese mismo id
 * (el envío ya se había guardado: doble clic o reintento). La comprobación va
 * dentro del bloqueo, así dos peticiones simultáneas con el mismo id tampoco
 * duplican.
 */
function guardarEnvio_(sheetName, headers, quien, filasDatos, colTextoDesde, idEnvio) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_(sheetName, headers);
    if (idEnvio && existeEnvio_(sheet, idEnvio)) return idEnvio;

    var id = idEnvio || Utilities.getUuid();
    var timestamp = new Date();
    var numColumnas = headers.length;
    var filas = filasDatos.map(function (datos, i) {
      return [timestamp, id, quien.institucion, quien.nombre, i + 1].concat(datos);
    });

    var primeraFila = sheet.getLastRow() + 1;
    sheet.getRange(primeraFila, 2, filas.length, 3).setNumberFormat('@');
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

function existeEnvio_(sheet, idEnvio) {
  var ultimaFila = sheet.getLastRow();
  if (ultimaFila <= 1) return false;
  var ids = sheet.getRange(2, 2, ultimaFila - 1, 1).getValues();
  return ids.some(function (fila) { return String(fila[0]) === idEnvio; });
}

// ---------------------------------------------------------------------------
// Validación (funciones puras, sin librería externa)
// ---------------------------------------------------------------------------

/** Institución y nombre son texto libre (no hay catálogo cerrado). Devuelve los valores limpios. */
function validarIdentificacion_(body, errors) {
  var institucion = limpiarTexto_(body.institucion);
  var nombre = limpiarTexto_(body.nombre);
  if (!institucion) errors.push('institucion es requerida');
  else if (institucion.length > MAX_CARACTERES_CORTO) errors.push('institucion supera ' + MAX_CARACTERES_CORTO + ' caracteres');
  if (!nombre) errors.push('nombre es requerido');
  else if (nombre.length > MAX_CARACTERES_CORTO) errors.push('nombre supera ' + MAX_CARACTERES_CORTO + ' caracteres');
  return { institucion: institucion, nombre: nombre };
}

/** `idEnvio` es opcional; si viene debe ser un identificador simple (letras, dígitos y guiones). */
function validarIdEnvio_(idEnvio, errors) {
  if (idEnvio === undefined || idEnvio === null || idEnvio === '') return '';
  var id = String(idEnvio);
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) {
    errors.push('idEnvio no es válido');
    return '';
  }
  return id;
}

/** Recorta y colapsa espacios internos: "  Univ.   de   Caldas " -> "Univ. de Caldas". */
function limpiarTexto_(valor) {
  return String(valor === undefined || valor === null ? '' : valor).trim().replace(/\s+/g, ' ');
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

function leerFilas_(sheetName, headersEsperados) {
  var sheet = getSheet_(sheetName, headersEsperados);
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

/**
 * `headers` (opcional) es el encabezado esperado del tab. Casos:
 *  - Igual: no hace nada.
 *  - El actual es un PREFIJO del esperado (se agregaron columnas al final, aunque
 *    ya haya datos): agrega solo los encabezados que faltan; los datos no se tocan
 *    y las filas viejas quedan con esas columnas vacías.
 *  - Distinto y sin filas de datos: se reescribe solo, para no obligar a volver
 *    a ejecutar setup() a mano.
 *  - Distinto y con datos: falla con un mensaje claro en vez de desalinear columnas.
 */
function getSheet_(name, headers) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('No existe el tab "' + name + '". Ejecuta setup() primero.');
  if (headers) {
    var ancho = Math.min(sheet.getLastColumn(), headers.length);
    var actuales = sheet.getLastRow() >= 1 && ancho > 0 ? sheet.getRange(1, 1, 1, ancho).getValues()[0] : [];
    var esPrefijo = actuales.length > 0 && actuales.every(function (h, i) { return h === headers[i]; });
    var completo = esPrefijo && actuales.length === headers.length && sheet.getLastColumn() === headers.length;

    if (!completo) {
      if (esPrefijo && sheet.getLastColumn() <= headers.length) {
        // Columnas nuevas al final: completar el encabezado, sin tocar los datos.
        sheet.getRange(1, actuales.length + 1, 1, headers.length - actuales.length)
          .setValues([headers.slice(actuales.length)]);
      } else if (sheet.getLastRow() > 1) {
        throw new Error('El tab "' + name + '" tiene datos con encabezados antiguos. Migra las columnas o ejecuta setup() (borra los datos).');
      } else {
        sheet.clear();
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.setFrozenRows(1);
      }
    }
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
