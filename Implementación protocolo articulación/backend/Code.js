/**
 * Backend API — Lista de chequeo de uso y apropiación institucional (Protocolo de
 * Articulación de la Educación Media con la Posmedia) · Manizales.
 * Google Apps Script (Web App) BOUND a una Google Sheet, gestionado con clasp.
 *
 * Endpoints:
 *   GET  ?action=ping
 *   GET  ?action=getVisitas      (panel admin: { visitas: [...], hallazgos: [...] })
 *   POST { action: "subirEvidencia", idEnvio, institucion, fechaVisita, criterio: 'c01'..'c14',
 *          nombre, mimeType, base64 }                         → { success, url, nombre }
 *   POST { action: "submitVisita", idEnvio (UUID, opcional), acompanante (= padrino, de PADRINOS), institucion,
 *          fechaVisita 'YYYY-MM-DD',   (numero_visita lo calcula el servidor)
 *          criterios: { c01: { respuesta: 'SI'|'PARCIAL'|'NO'|'NA', evidencia, archivos: [{nombre,url}] } },
 *          hallazgos: [{ hallazgo, accion, responsable, fecha }],
 *          nivel: 'Consolidado'|'En desarrollo'|'Inicial'|'No evidenciado' }
 *
 * Modelo: hoja "Visitas" (una fila por visita) y hoja "Hallazgos" (una fila por hallazgo).
 * Las evidencias se guardan en Drive, PRIVADAS, en "Evidencias/<institución>/<fecha> · <id>"
 * junto a esta Sheet. Quien abra el panel solo podrá abrirlas si tiene acceso a esa carpeta.
 * Idempotencia: si `idEnvio` ya existe, responde éxito SIN volver a escribir.
 * Las hojas se crean solas en la primera petición (ensureSetup).
 * Sin protección por clave, igual que los demás formularios de la organización.
 *
 * El catálogo de instituciones está DUPLICADOS en frontend/src/data/catalogos.js (INSTITUCIONES, PADRINOS):
 * si cambian, actualizar ambos y `clasp push`.
 */

var SHEET_VISITAS = 'Visitas';
var SHEET_HALLAZGOS = 'Hallazgos';
var CARPETA_EVIDENCIAS = 'Evidencias';
var MAX_TEXTO = 2000;
var MAX_TEXTO_CORTO = 200;
var MAX_HALLAZGOS = 30;
var MAX_ARCHIVOS_POR_CRITERIO = 8;
var MAX_BYTES_ARCHIVO = 8 * 1024 * 1024;
var NUM_CRITERIOS = 14;

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

var PADRINOS = [
  'Alejandro Osorio Loaiza',
  'Alexander de Jesús Ossa Calvo',
  'Anderson González Gutiérrez',
  'Claudia Patricia Herrera Tellez',
  'Cristian Hely Florez Rodríguez',
  'David Steven Betancourth Gaitán',
  'Federico Castillón Salazar',
  'Jhon Jairo Franco Arenas',
  'Jonathan Gerardo Orozco Herrera',
  'José Daniel García Echeverry',
  'Juan Gabriel Alzate Gallego',
  'Juan Pablo Bedoya Cañon',
  'Julian Nieto Soto',
  'Libardo Andrés Acosta Hurtado',
  'Lucelly Giraldo Sierra',
  'Luis Gabriel Suárez Giraldo',
  'Santiago Ramírez García',
  'Yeison Suárez Suárez',
  'Yohan Sebastián Molano Muñoz'
];

var RESPUESTAS = ['SI', 'PARCIAL', 'NO', 'NA'];
var NIVELES = ['Consolidado', 'En desarrollo', 'Inicial', 'No evidenciado'];
var MIMES = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic',
  'application/pdf': 'pdf'
};

function clave(i) {
  return 'c' + (i < 10 ? '0' : '') + i;
}

function headersVisitas() {
  var h = ['timestamp', 'id_envio', 'acompanante', 'institucion', 'fecha_visita', 'numero_visita'];
  var i;
  for (i = 1; i <= NUM_CRITERIOS; i++) h.push(clave(i));
  for (i = 1; i <= NUM_CRITERIOS; i++) h.push(clave(i) + '_evidencia');
  for (i = 1; i <= NUM_CRITERIOS; i++) h.push(clave(i) + '_archivos');
  h.push('nivel_apropiacion');
  return h;
}

var HEADERS_HALLAZGOS = ['timestamp', 'id_envio', 'institucion', 'fecha_visita',
  'hallazgo', 'accion', 'responsable', 'fecha_verificacion'];

// ---------------------------------------------------------------------------
// Infraestructura
// ---------------------------------------------------------------------------

function ensureHoja(ss, nombre, headers) {
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
    hoja.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  // Migración aditiva: agrega al final los encabezados que falten.
  var actuales = hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), 1)).getValues()[0];
  var faltan = [];
  for (var k = actuales.length; k < headers.length; k++) {
    if (!actuales[k]) faltan.push(headers[k]);
  }
  if (faltan.length) {
    hoja.getRange(1, actuales.length + 1, 1, faltan.length).setValues([faltan]).setFontWeight('bold');
  }
  return hoja;
}

function ensureSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var visitas = ensureHoja(ss, SHEET_VISITAS, headersVisitas());
  var hallazgos = ensureHoja(ss, SHEET_HALLAZGOS, HEADERS_HALLAZGOS);
  var inicial = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (inicial && ss.getSheets().length > 2) ss.deleteSheet(inicial);
  return { visitas: visitas, hallazgos: hallazgos };
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
  if (action === 'getVisitas') return getVisitas();
  return fail('Acción no válida.');
}

function leerHoja(hoja, headers) {
  var ultima = hoja.getLastRow();
  var filas = [];
  if (ultima <= 1) return filas;
  var valores = hoja.getRange(2, 1, ultima - 1, headers.length).getValues();
  for (var r = 0; r < valores.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var v = valores[r][c];
      obj[headers[c]] = v instanceof Date ? v.toISOString() : v;
    }
    filas.push(obj);
  }
  return filas;
}

function getVisitas() {
  var hojas = ensureSetup();
  return json({
    success: true,
    data: {
      visitas: leerHoja(hojas.visitas, headersVisitas()),
      hallazgos: leerHoja(hojas.hallazgos, HEADERS_HALLAZGOS)
    }
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
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
    if (body.action === 'submitVisita') return submitVisita(body);
    if (body.action === 'subirEvidencia') return subirEvidencia(body);
    return fail('Acción no válida.');
  } catch (err) {
    return fail('No se pudo guardar. Intenta de nuevo.');
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

function texto(valor, max) {
  return String(valor == null ? '' : valor).replace(/^\s+|\s+$/g, '').slice(0, max);
}

function incluye(lista, valor) {
  return lista.indexOf(valor) !== -1;
}

function fechaValida(f) {
  return /^\d{4}-\d{2}-\d{2}$/.test(f) && !isNaN(new Date(f + 'T12:00:00').getTime());
}

function idValido(id) {
  return /^[A-Za-z0-9-]{8,64}$/.test(id);
}

function limpiarNombre(n) {
  return texto(n, 120).replace(/[\\\/|\r\n\t]/g, '_');
}

// ---------------------------------------------------------------------------
// Evidencias (Drive, privadas)
// ---------------------------------------------------------------------------

function subcarpeta(padre, nombre) {
  var it = padre.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : padre.createFolder(nombre);
}

function subirEvidencia(b) {
  var institucion = texto(b.institucion, MAX_TEXTO_CORTO);
  if (!incluye(INSTITUCIONES, institucion)) return fail('Selecciona una institución válida antes de adjuntar.');
  var fecha = texto(b.fechaVisita, 10);
  if (!fechaValida(fecha)) return fail('Fecha de visita no válida.');
  var idEnvio = texto(b.idEnvio, 64);
  if (!idValido(idEnvio)) return fail('Identificador de envío no válido.');
  var criterio = texto(b.criterio, 3);
  if (!/^c(0[1-9]|1[0-4])$/.test(criterio)) return fail('Criterio no válido.');
  var mime = texto(b.mimeType, 60);
  if (!MIMES[mime]) return fail('Solo se admiten fotos (JPG, PNG, WEBP, HEIC) o PDF.');
  var base64 = String(b.base64 || '');
  // Tamaño decodificado ≈ 3/4 de la cadena base64.
  if (!base64 || base64.length * 0.75 > MAX_BYTES_ARCHIVO) return fail('El archivo supera 8 MB.');

  var bytes = Utilities.base64Decode(base64);
  if (bytes.length > MAX_BYTES_ARCHIVO) return fail('El archivo supera 8 MB.');

  var base = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents();
  var padre = base.hasNext() ? base.next() : DriveApp.getRootFolder();
  var carpeta = subcarpeta(subcarpeta(subcarpeta(padre, CARPETA_EVIDENCIAS), institucion),
    fecha + ' · ' + idEnvio.slice(0, 8));

  var nombre = limpiarNombre(b.nombre) || ('evidencia.' + MIMES[mime]);
  var archivo = carpeta.createFile(Utilities.newBlob(bytes, mime, criterio + ' - ' + nombre));
  return json({ success: true, url: archivo.getUrl(), nombre: nombre });
}

// ---------------------------------------------------------------------------
// Guardado de la visita
// ---------------------------------------------------------------------------

function submitVisita(b) {
  var acompanante = texto(b.acompanante, MAX_TEXTO_CORTO);
  if (!incluye(PADRINOS, acompanante)) return fail('Selecciona el padrino.');
  var institucion = texto(b.institucion, MAX_TEXTO_CORTO);
  if (!incluye(INSTITUCIONES, institucion)) return fail('Selecciona una institución válida.');
  var fecha = texto(b.fechaVisita, 10);
  if (!fechaValida(fecha)) return fail('Escribe una fecha de visita válida.');

  var criterios = b.criterios || {};
  var respuestas = [];
  var evidencias = [];
  var archivos = [];
  for (var i = 1; i <= NUM_CRITERIOS; i++) {
    var c = criterios[clave(i)] || {};
    var r = texto(c.respuesta, 10);
    if (!incluye(RESPUESTAS, r)) return fail('Responde los 14 criterios (puedes usar "No aplica").');
    respuestas.push(r);
    evidencias.push(texto(c.evidencia, MAX_TEXTO));
    var lista = Object.prototype.toString.call(c.archivos) === '[object Array]' ? c.archivos : [];
    var lineas = [];
    for (var a = 0; a < lista.length && a < MAX_ARCHIVOS_POR_CRITERIO; a++) {
      var url = texto(lista[a] && lista[a].url, 300);
      if (url.indexOf('https://drive.google.com/') !== 0) return fail('Enlace de evidencia no válido.');
      lineas.push(limpiarNombre(lista[a].nombre) + ' | ' + url);
    }
    archivos.push(lineas.join('\n'));
  }

  var nivel = texto(b.nivel, MAX_TEXTO_CORTO);
  if (!incluye(NIVELES, nivel)) return fail('Selecciona el nivel de apropiación.');

  var entrada = Object.prototype.toString.call(b.hallazgos) === '[object Array]' ? b.hallazgos : [];
  if (entrada.length > MAX_HALLAZGOS) return fail('Demasiados hallazgos.');
  var hallazgos = [];
  for (var h = 0; h < entrada.length; h++) {
    var x = entrada[h] || {};
    var fila = [texto(x.hallazgo, MAX_TEXTO), texto(x.accion, MAX_TEXTO), texto(x.responsable, MAX_TEXTO_CORTO),
      texto(x.fecha, 10)];
    if (!fila[0] && !fila[1] && !fila[2] && !fila[3]) continue; // fila vacía
    if (!fila[0] || !fila[1]) return fail('Cada hallazgo necesita el hallazgo y la acción de mejora.');
    if (fila[3] && !fechaValida(fila[3])) return fail('Fecha de verificación no válida.');
    hallazgos.push(fila);
  }

  var hojas = ensureSetup();
  var idEnvio = texto(b.idEnvio, 64);
  if (!idValido(idEnvio)) idEnvio = Utilities.getUuid();

  // Idempotencia: ya recibido => éxito sin duplicar.
  var ultima = hojas.visitas.getLastRow();
  if (ultima > 1) {
    var ids = hojas.visitas.getRange(2, 2, ultima - 1, 1).getValues();
    for (var r2 = 0; r2 < ids.length; r2++) {
      if (ids[r2][0] === idEnvio) return json({ success: true, duplicado: true });
    }
  }

  // Número de visita: consecutivo por institución (lo calcula el servidor; ya no se pregunta).
  var numeroVisita = 1;
  if (ultima > 1) {
    var insts = hojas.visitas.getRange(2, 4, ultima - 1, 1).getValues();
    for (var r3 = 0; r3 < insts.length; r3++) if (insts[r3][0] === institucion) numeroVisita++;
  }

  var ahora = new Date();
  var registro = [ahora, idEnvio, acompanante, institucion, fecha, numeroVisita]
    .concat(respuestas).concat(evidencias).concat(archivos).concat([nivel]);
  var filaV = hojas.visitas.getLastRow() + 1;
  // Formato "texto plano": ningún valor que empiece con "=" o "+" se ejecuta como fórmula.
  hojas.visitas.getRange(filaV, 3, 1, registro.length - 2).setNumberFormat('@');
  hojas.visitas.getRange(filaV, 1, 1, registro.length).setValues([registro]);

  if (hallazgos.length) {
    var filasH = hallazgos.map(function (f) {
      return [ahora, idEnvio, institucion, fecha].concat(f);
    });
    var filaH = hojas.hallazgos.getLastRow() + 1;
    hojas.hallazgos.getRange(filaH, 3, filasH.length, HEADERS_HALLAZGOS.length - 2).setNumberFormat('@');
    hojas.hallazgos.getRange(filaH, 1, filasH.length, HEADERS_HALLAZGOS.length).setValues(filasH);
  }
  return json({ success: true });
}

/**
 * Ejecutar UNA vez desde el editor tras `clasp push`: fuerza el diálogo de permisos
 * (Hojas + Drive) antes de publicar el Web App.
 */
function probarPermisos() {
  ensureSetup();
  var padre = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents();
  Logger.log('Permisos OK. Carpeta de evidencias en: ' + (padre.hasNext() ? padre.next().getName() : 'raíz de Drive'));
}
