/**
 * Backend API — Inscripción de docentes
 * Capacitación en Metodologías Activas (Manizales / CEPE)
 * Google Apps Script (Web App), bound a una Google Sheet, gestionado con clasp.
 *
 * Endpoints:
 *   GET  ?action=listInstituciones
 *   POST { action: "submitInscripcion", institucion, docentes: [{nombre, telefono, areas: []}] }
 *   GET  ?action=getDocentes
 *   GET  ?action=getResumen
 *
 * Sin protección por clave: el panel admin se protege únicamente por ser
 * un enlace no listado (nadie lo conoce salvo quien lo comparta).
 *
 * Este script está BOUND a su Google Sheet (creado con
 * `clasp create-script --type sheets`), así que usa
 * SpreadsheetApp.getActiveSpreadsheet() — no requiere SPREADSHEET_ID en
 * Script Properties.
 *
 * Configuración requerida antes de compartir el enlace del formulario:
 *   1. Ejecutar una vez la función setup() manualmente desde el editor
 *      (o `clasp run setup`) para crear los tabs Instituciones y Docentes
 *      con sus encabezados y sembrar el catálogo de instituciones.
 *   2. Desplegar como Web App (`clasp create-deployment`).
 *   3. Antes de compartir el enlace, ejecutar limpiarRegistrosDePrueba().
 */

var SHEET_INSTITUCIONES = 'Instituciones';
var SHEET_DOCENTES = 'Docentes';

var INSTITUCIONES_SEED = [
  ['IE01', 'Giovanni Montini'],
  ['IE02', 'Granada'],
  ['IE03', 'José Antonio Galán'],
  ['IE04', 'La Cabaña'],
  ['IE05', 'La Linda'],
  ['IE06', 'La Trinidad'],
  ['IE07', 'La Violeta'],
  ['IE08', 'Maltería'],
  ['IE09', 'María Goretti'],
  ['IE10', 'Miguel Antonio Caro'],
  ['IE11', 'Rafael Pombo'],
  ['IE12', 'San Peregrino'],
  ['IE13', 'Seráfico San Antonio de Padua']
];

var AREAS_VALIDAS = [
  'Matemáticas',
  'Lenguaje',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Docente líder La Universidad en el Campo'
];

var DOCENTES_HEADERS = [
  'timestamp', 'id_registro', 'institucion', 'nombre_docente', 'telefono', 'areas', 'num_areas'
];

// ---------------------------------------------------------------------------
// Setup (ejecutar manualmente una sola vez: editor de Apps Script o `clasp run setup`)
// ---------------------------------------------------------------------------

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var instituciones = ss.getSheetByName(SHEET_INSTITUCIONES) || ss.insertSheet(SHEET_INSTITUCIONES);
  instituciones.clear();
  instituciones.getRange(1, 1, 1, 2).setValues([['id_institucion', 'nombre_institucion']]);
  instituciones.getRange(2, 1, INSTITUCIONES_SEED.length, 2).setValues(INSTITUCIONES_SEED);
  instituciones.setFrozenRows(1);

  var docentes = ss.getSheetByName(SHEET_DOCENTES) || ss.insertSheet(SHEET_DOCENTES);
  docentes.clear();
  docentes.getRange(1, 1, 1, DOCENTES_HEADERS.length).setValues([DOCENTES_HEADERS]);
  docentes.setFrozenRows(1);

  // Elimina la hoja "Hoja 1" / "Sheet1" por defecto si quedó vacía y sin usar.
  var porDefecto = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1') || ss.getSheetByName('Hoja1');
  if (porDefecto && ss.getSheets().length > 2) {
    ss.deleteSheet(porDefecto);
  }

  Logger.log('Setup completo. Tabs creados: ' + SHEET_INSTITUCIONES + ', ' + SHEET_DOCENTES);
}

/**
 * Borra TODAS las filas de datos de Docentes (deja los encabezados).
 * Ejecutar manualmente una sola vez desde el editor (o `clasp run
 * limpiarRegistrosDePrueba`), antes de compartir el enlace del formulario,
 * para limpiar los registros de prueba.
 */
function limpiarRegistrosDePrueba() {
  var sheet = getSheet_(SHEET_DOCENTES);
  var ultimaFila = sheet.getLastRow();
  if (ultimaFila <= 1) {
    Logger.log('No hay filas de datos para borrar.');
    return;
  }
  sheet.deleteRows(2, ultimaFila - 1);
  Logger.log('Se borraron ' + (ultimaFila - 1) + ' filas. Docentes quedó limpio.');
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

    if (action === 'getDocentes') {
      return jsonResponse_({ success: true, data: getDocentesRaw_() });
    }

    if (action === 'getResumen') {
      return jsonResponse_({ success: true, data: getResumen_() });
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

    if (action === 'submitInscripcion') {
      var id = submitInscripcion_(body);
      return jsonResponse_({ success: true, id: id });
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
// submitInscripcion
// ---------------------------------------------------------------------------

function submitInscripcion_(body) {
  var errors = [];
  var nombresInstituciones = INSTITUCIONES_SEED.map(function (row) { return row[1]; });

  if (!body.institucion) {
    errors.push('institucion es requerida');
  } else if (nombresInstituciones.indexOf(body.institucion) === -1) {
    errors.push('institucion no reconocida: ' + body.institucion);
  }

  var docentes = body.docentes || [];
  if (!docentes.length) {
    errors.push('debe incluir al menos un docente');
  }

  docentes.forEach(function (docente, i) {
    var prefijo = 'docentes[' + i + ']';

    if (!docente.nombre || !String(docente.nombre).trim()) {
      errors.push(prefijo + '.nombre es requerido');
    }

    var digitos = String(docente.telefono || '').replace(/\D/g, '');
    if (digitos.length < 7 || digitos.length > 10) {
      errors.push(prefijo + '.telefono debe tener entre 7 y 10 dígitos');
    }

    var areas = docente.areas || [];
    if (!areas.length) {
      errors.push(prefijo + '.areas debe tener al menos un área');
    } else {
      var vistas = {};
      areas.forEach(function (area) {
        if (AREAS_VALIDAS.indexOf(area) === -1) {
          errors.push(prefijo + '.areas contiene un área no reconocida: ' + area);
        }
        if (vistas[area]) {
          errors.push(prefijo + '.areas tiene "' + area + '" repetida');
        }
        vistas[area] = true;
      });
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  var id = Utilities.getUuid();
  var timestamp = new Date();

  var filas = docentes.map(function (docente) {
    var digitos = String(docente.telefono).replace(/\D/g, '');
    var areas = docente.areas;
    return [
      timestamp,
      id,
      body.institucion,
      String(docente.nombre).trim(),
      digitos,
      areas.join('; '),
      areas.length
    ];
  });

  var sheet = getSheet_(SHEET_DOCENTES);
  var primeraFila = sheet.getLastRow() + 1;
  sheet.getRange(primeraFila, 1, filas.length, DOCENTES_HEADERS.length).setValues(filas);

  return id;
}

// ---------------------------------------------------------------------------
// getDocentes / getResumen
// ---------------------------------------------------------------------------

function getDocentesRaw_() {
  var sheet = getSheet_(SHEET_DOCENTES);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var rows = values.slice(1).filter(function (row) { return row[1]; }); // id_registro no vacío

  return rows.map(function (row) {
    var obj = {};
    headers.forEach(function (header, i) {
      var val = row[i];
      if (header === 'timestamp' && val instanceof Date) {
        obj[header] = val.toISOString();
      } else if (header === 'areas') {
        obj[header] = val ? String(val).split(';').map(function (a) { return a.trim(); }).filter(Boolean) : [];
      } else {
        obj[header] = val;
      }
    });
    return obj;
  });
}

function getResumen_() {
  var docentes = getDocentesRaw_();
  var nombresInstituciones = INSTITUCIONES_SEED.map(function (row) { return row[1]; });

  var porInstitucion = {};
  nombresInstituciones.forEach(function (nombre) { porInstitucion[nombre] = 0; });
  docentes.forEach(function (d) {
    if (porInstitucion[d.institucion] === undefined) porInstitucion[d.institucion] = 0;
    porInstitucion[d.institucion]++;
  });

  var institucionesRegistradas = nombresInstituciones.filter(function (nombre) {
    return porInstitucion[nombre] > 0;
  });
  var institucionesFaltantes = nombresInstituciones.filter(function (nombre) {
    return porInstitucion[nombre] === 0;
  });

  var porArea = {};
  AREAS_VALIDAS.forEach(function (area) { porArea[area] = 0; });
  var totalAsignacionesArea = 0;
  var docentesMultiArea = 0;
  docentes.forEach(function (d) {
    (d.areas || []).forEach(function (area) {
      if (porArea[area] === undefined) porArea[area] = 0;
      porArea[area]++;
      totalAsignacionesArea++;
    });
    if ((d.areas || []).length > 1) docentesMultiArea++;
  });

  return {
    total_docentes: docentes.length,
    total_instituciones: nombresInstituciones.length,
    instituciones_registradas: institucionesRegistradas,
    instituciones_faltantes: institucionesFaltantes,
    docentes_por_institucion: porInstitucion,
    docentes_por_area: porArea,
    total_asignaciones_area: totalAsignacionesArea,
    docentes_multi_area: docentesMultiArea
  };
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
