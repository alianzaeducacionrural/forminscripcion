/**
 * Backend API — Acompañamiento entre Pares, Sesión 1 (rectores)
 * Tres herramientas: "Mi capital de experiencia" (rectores con experiencia,
 * con valoración semáforo), "Mi mapa de necesidades" (rectores nuevos), y
 * "Mi primer reto de acompañamiento" (microplan de la dupla, con envío de
 * PDF por correo a ambos).
 * Google Apps Script (Web App), bound a una Google Sheet, gestionado con clasp.
 *
 * Endpoints:
 *   GET  ?action=listInstituciones
 *   GET  ?action=getExperimentados      (uso del panel admin)
 *   GET  ?action=getNuevos              (uso del panel admin)
 *   GET  ?action=getPlanAccion          (uso del panel admin)
 *   POST { action: "submitExperimentados", idEnvio (opcional), institucion, nombre,
 *          filas: [{ componente, queSabeHacer, queExperiencia, queEvidencia, queEnsenar, valoracion }] }
 *   POST { action: "submitNuevos", idEnvio (opcional), institucion, nombre,
 *          filas: [{ componente, situacion, queAprender, tipoApoyo }] }
 *   POST { action: "submitPlanAccion", idEnvio (opcional),
 *          institucionExperimentado, nombreExperimentado, correoExperimentado,
 *          institucionNuevo, nombreNuevo, correoNuevo, compromiso,
 *          acciones: [{ reto, accion, responsable, fecha, evidencia }, ...] }
 *          (al menos 1 acción; se pueden agregar más)
 *
 * Modelo de datos (Experimentados/Nuevos): cada envío es un conjunto de
 * EXACTAMENTE 4 filas (una por componente: Administrativo, Curricular,
 * Capacitación, Comunitario), que comparten `id_envio` y `timestamp`.
 * `institucion` y `nombre` (quien diligencia) son TEXTO LIBRE. Una persona
 * puede volver a enviar para corregir: los envíos anteriores NO se borran
 * (quedan como historial en la Sheet); el panel toma como vigente el
 * `id_envio` más reciente de cada pareja institución + nombre.
 *
 * Modelo de datos (PlanAccion): cada envío es un conjunto de 1 o más filas
 * (una por acción de acompañamiento que la dupla haya agregado), que
 * comparten `id_envio`, `timestamp` y los datos de identificación de la
 * dupla y el compromiso de cierre (repetidos en cada fila, igual que
 * institución/nombre en Experimentados/Nuevos). Al guardar exitosamente (por
 * primera vez, no en un reintento), se genera un PDF con el plan completo y
 * se envía por correo a ambos integrantes de la dupla.
 *
 * Idempotencia: el frontend manda un `idEnvio` (UUID) por intento de envío. Si
 * ese id ya existe en la Sheet, el backend responde éxito SIN volver a escribir
 * ni reenviar el correo, así un doble clic o un reintento tras un corte de red
 * no duplica filas ni reenvía el PDF.
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
 *      Instituciones/Experimentados/Nuevos/PlanAccion con encabezados y
 *      siembra el catálogo). Esa misma ejecución autoriza los permisos de
 *      Gmail/Docs/Drive que necesita el envío del PDF — si el proyecto ya
 *      estaba desplegado antes de agregar PlanAccion, hay que volver a
 *      correr setup() una vez para conceder esos permisos nuevos.
 *   2. Desplegar como Web App (`clasp create-deployment` o, si ya existe el
 *      deployment, `clasp deploy -i <deploymentId>`).
 *   3. Antes de compartir los enlaces, ejecutar limpiarRegistrosDePrueba().
 */

var SHEET_INSTITUCIONES = 'Instituciones';
var SHEET_EXPERIMENTADOS = 'Experimentados';
var SHEET_NUEVOS = 'Nuevos';
var SHEET_PLAN_ACCION = 'PlanAccion';

var MAX_CARACTERES = 2000;
var MAX_CARACTERES_CORTO = 200;
var MAX_ACCIONES = 20;

// Solo SUGERENCIAS para el campo Institución (el frontend las ofrece como
// lista cerrada — el frontend usa un <select> con estos mismos nombres
// (frontend/src/data/catalogos.js, INSTITUCIONES_MANIZALES), y aquí se valida
// que el envío traiga una de estas (ver validarIdentificacion_).
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

// Los 4 componentes de la gestión escolar, en el orden fijo de la herramienta
// original en papel. Cada envío trae exactamente una fila por componente.
var COMPONENTES = ['Administrativo', 'Curricular', 'Capacitación', 'Comunitario'];

var VALORACIONES_VALIDAS = ['domina', 'fortaleciendo', 'aprender'];

// Campos de texto obligatorios de cada fila, en el orden de las columnas de la Sheet.
var EXPERIMENTADOS_CAMPOS = ['queSabeHacer', 'queExperiencia', 'queEvidencia', 'queEnsenar'];
var NUEVOS_CAMPOS = ['situacion', 'queAprender', 'tipoApoyo'];

var EXPERIMENTADOS_HEADERS = [
  'timestamp', 'id_envio', 'institucion', 'nombre', 'orden', 'componente',
  'que_sabe_hacer', 'que_experiencia_tengo', 'que_evidencia_puedo_mostrar', 'que_podria_ensenar',
  'valoracion'
];

var NUEVOS_HEADERS = [
  'timestamp', 'id_envio', 'institucion', 'nombre', 'orden', 'componente',
  'situacion_que_necesito_fortalecer', 'que_necesito_aprender', 'tipo_de_apoyo'
];

// Una fila por acción de acompañamiento (al menos 1, se pueden agregar más).
// La identificación de la dupla y el compromiso de cierre se repiten en cada
// fila del mismo envío (igual que institución/nombre en Experimentados/Nuevos).
var PLAN_ACCION_CAMPOS = ['reto', 'accion', 'responsable', 'fecha', 'evidencia'];

var PLAN_ACCION_HEADERS = [
  'timestamp', 'id_envio',
  'institucion_experimentado', 'nombre_experimentado', 'correo_experimentado',
  'institucion_nuevo', 'nombre_nuevo', 'correo_nuevo',
  'orden', 'reto', 'accion', 'responsable', 'fecha', 'evidencia', 'compromiso'
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

  var experimentados = ss.getSheetByName(SHEET_EXPERIMENTADOS) || ss.insertSheet(SHEET_EXPERIMENTADOS);
  experimentados.clear();
  experimentados.getRange(1, 1, 1, EXPERIMENTADOS_HEADERS.length).setValues([EXPERIMENTADOS_HEADERS]);
  experimentados.setFrozenRows(1);

  var nuevos = ss.getSheetByName(SHEET_NUEVOS) || ss.insertSheet(SHEET_NUEVOS);
  nuevos.clear();
  nuevos.getRange(1, 1, 1, NUEVOS_HEADERS.length).setValues([NUEVOS_HEADERS]);
  nuevos.setFrozenRows(1);

  var planAccion = ss.getSheetByName(SHEET_PLAN_ACCION) || ss.insertSheet(SHEET_PLAN_ACCION);
  planAccion.clear();
  planAccion.getRange(1, 1, 1, PLAN_ACCION_HEADERS.length).setValues([PLAN_ACCION_HEADERS]);
  planAccion.setFrozenRows(1);

  var porDefecto = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1') || ss.getSheetByName('Hoja1');
  if (porDefecto && ss.getSheets().length > 4) {
    ss.deleteSheet(porDefecto);
  }

  Logger.log(
    'Setup completo. Tabs creados: ' + SHEET_INSTITUCIONES + ', ' + SHEET_EXPERIMENTADOS + ', ' +
    SHEET_NUEVOS + ', ' + SHEET_PLAN_ACCION
  );
}

/**
 * Borra TODAS las filas de datos de Experimentados y Nuevos (deja los
 * encabezados). Ejecutar manualmente una sola vez desde el editor, antes de
 * compartir los enlaces reales, para limpiar los registros de prueba.
 */
function limpiarRegistrosDePrueba() {
  [SHEET_EXPERIMENTADOS, SHEET_NUEVOS, SHEET_PLAN_ACCION].forEach(function (nombre) {
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

    if (action === 'getExperimentados') {
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_EXPERIMENTADOS, EXPERIMENTADOS_HEADERS) });
    }

    if (action === 'getNuevos') {
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_NUEVOS, NUEVOS_HEADERS) });
    }

    if (action === 'getPlanAccion') {
      return jsonResponse_({ success: true, data: leerFilas_(SHEET_PLAN_ACCION, PLAN_ACCION_HEADERS) });
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

    if (action === 'submitExperimentados') {
      return jsonResponse_({ success: true, id: submitExperimentados_(body) });
    }

    if (action === 'submitNuevos') {
      return jsonResponse_({ success: true, id: submitNuevos_(body) });
    }

    if (action === 'submitPlanAccion') {
      return jsonResponse_(submitPlanAccion_(body));
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
// submitExperimentados / submitNuevos
// ---------------------------------------------------------------------------

function submitExperimentados_(body) {
  var errors = [];
  var quien = validarIdentificacion_(body, errors);
  var idEnvio = validarIdEnvio_(body.idEnvio, errors);
  var filas = validarFilasPorComponente_(body.filas, errors);

  filas.forEach(function (fila) {
    var nombreFila = fila.componente || '(componente desconocido)';
    validarTextos_(fila, EXPERIMENTADOS_CAMPOS, nombreFila, errors);
    var valoracion = fila.valoracion ? String(fila.valoracion) : '';
    if (!valoracion) {
      errors.push(nombreFila + ': valoracion es requerida');
    } else if (VALORACIONES_VALIDAS.indexOf(valoracion) === -1) {
      errors.push(nombreFila + ': valoracion no reconocida: ' + valoracion);
    }
  });

  if (errors.length > 0) throw new Error(errors.join('; '));

  var datos = filas.map(function (fila) {
    return [fila.componente].concat(textos_(fila, EXPERIMENTADOS_CAMPOS), [String(fila.valoracion)]);
  });

  // 'componente' es la 6.ª columna: desde ahí todo es texto plano.
  return guardarEnvio_(SHEET_EXPERIMENTADOS, EXPERIMENTADOS_HEADERS, quien, datos, 6, idEnvio);
}

function submitNuevos_(body) {
  var errors = [];
  var quien = validarIdentificacion_(body, errors);
  var idEnvio = validarIdEnvio_(body.idEnvio, errors);
  var filas = validarFilasPorComponente_(body.filas, errors);

  filas.forEach(function (fila) {
    var nombreFila = fila.componente || '(componente desconocido)';
    validarTextos_(fila, NUEVOS_CAMPOS, nombreFila, errors);
  });

  if (errors.length > 0) throw new Error(errors.join('; '));

  var datos = filas.map(function (fila) {
    return [fila.componente].concat(textos_(fila, NUEVOS_CAMPOS));
  });

  // 'componente' es la 6.ª columna: desde ahí todo es texto plano.
  return guardarEnvio_(SHEET_NUEVOS, NUEVOS_HEADERS, quien, datos, 6, idEnvio);
}

// ---------------------------------------------------------------------------
// submitPlanAccion — microplan de la dupla, con envío de PDF por correo
// ---------------------------------------------------------------------------

function submitPlanAccion_(body) {
  var errors = [];
  var dupla = validarDupla_(body, errors);
  var idEnvio = validarIdEnvio_(body.idEnvio, errors);
  var acciones = validarListaAcciones_(body.acciones, errors);
  var compromiso = limpiarTexto_(body.compromiso);

  if (!compromiso) errors.push('compromiso es requerido');
  else if (compromiso.length > MAX_CARACTERES) errors.push('compromiso supera ' + MAX_CARACTERES + ' caracteres');

  acciones.forEach(function (accion, i) {
    validarTextos_(accion, PLAN_ACCION_CAMPOS, 'Acción ' + (i + 1), errors);
  });

  if (errors.length > 0) throw new Error(errors.join('; '));

  var datos = acciones.map(function (accion) {
    return textos_(accion, PLAN_ACCION_CAMPOS).concat([compromiso]);
  });

  var resultado = guardarPlanAccion_(dupla, datos, idEnvio);

  var correoEnviado = false;
  if (resultado.esNuevo) {
    try {
      enviarPlanPorCorreo_(dupla, acciones, compromiso);
      correoEnviado = true;
    } catch (err) {
      // El plan ya quedó guardado en la Sheet aunque el correo falle (cuota de
      // Gmail agotada, error de Docs/Drive, etc.) — se avisa al frontend para
      // que le diga a la dupla que contacte a coordinación, en vez de fallar
      // todo el envío y arriesgar un reintento que sí duplicaría el correo.
      Logger.log('No se pudo enviar el PDF del plan ' + resultado.id + ': ' + err);
    }
  }

  return { success: true, id: resultado.id, correoEnviado: correoEnviado };
}

/** Identificación de los dos integrantes de la dupla; institución de cada
 * uno validada contra la lista cerrada, correos validados por formato. */
function validarDupla_(body, errors) {
  var experimentado = validarPersona_(body, 'Experimentado', errors);
  var nuevo = validarPersona_(body, 'Nuevo', errors);
  return {
    institucionExperimentado: experimentado.institucion,
    nombreExperimentado: experimentado.nombre,
    correoExperimentado: experimentado.correo,
    institucionNuevo: nuevo.institucion,
    nombreNuevo: nuevo.nombre,
    correoNuevo: nuevo.correo,
  };
}

function validarPersona_(body, sufijo, errors) {
  var etiqueta = 'Rector' + (sufijo === 'Nuevo' ? ' nuevo' : ' con experiencia');
  var institucion = limpiarTexto_(body['institucion' + sufijo]);
  var nombre = limpiarTexto_(body['nombre' + sufijo]);
  var correo = limpiarTexto_(body['correo' + sufijo]).toLowerCase();

  if (!institucion) errors.push(etiqueta + ': institución es requerida');
  else if (!institucionValida_(institucion)) errors.push(etiqueta + ': institución no reconocida: ' + institucion);

  if (!nombre) errors.push(etiqueta + ': nombre es requerido');
  else if (nombre.length > MAX_CARACTERES_CORTO) errors.push(etiqueta + ': nombre supera ' + MAX_CARACTERES_CORTO + ' caracteres');

  if (!correo) errors.push(etiqueta + ': correo es requerido');
  else if (!correoValido_(correo)) errors.push(etiqueta + ': correo no válido: ' + correo);
  else if (correo.length > MAX_CARACTERES_CORTO) errors.push(etiqueta + ': correo supera ' + MAX_CARACTERES_CORTO + ' caracteres');

  return { institucion: institucion, nombre: nombre, correo: correo };
}

function correoValido_(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

/** Al menos 1 acción, como máximo MAX_ACCIONES. */
function validarListaAcciones_(acciones, errors) {
  if (!Array.isArray(acciones) || acciones.length === 0) {
    errors.push('acciones debe tener al menos una acción');
    return [];
  }
  if (acciones.length > MAX_ACCIONES) {
    errors.push('acciones no puede tener más de ' + MAX_ACCIONES + ' acciones');
    return [];
  }
  return acciones.map(function (accion) { return accion && typeof accion === 'object' ? accion : {}; });
}

/**
 * Igual que guardarEnvio_, pero para PlanAccion: la identificación de la
 * dupla (6 campos) y el compromiso se repiten en cada fila (una por acción).
 * Devuelve { id, esNuevo } — `esNuevo` es false si el idEnvio ya existía
 * (para no reenviar el correo en un reintento o doble clic).
 */
function guardarPlanAccion_(dupla, filasDatos, idEnvio) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_(SHEET_PLAN_ACCION, PLAN_ACCION_HEADERS);
    if (idEnvio && existeEnvio_(sheet, idEnvio)) return { id: idEnvio, esNuevo: false };

    var id = idEnvio || Utilities.getUuid();
    var timestamp = new Date();
    var numColumnas = PLAN_ACCION_HEADERS.length;
    var filas = filasDatos.map(function (datos, i) {
      return [
        timestamp, id,
        dupla.institucionExperimentado, dupla.nombreExperimentado, dupla.correoExperimentado,
        dupla.institucionNuevo, dupla.nombreNuevo, dupla.correoNuevo,
        i + 1,
      ].concat(datos);
    });

    var primeraFila = sheet.getLastRow() + 1;
    // Columnas 2-8 (id + los 6 campos de la dupla) y desde la 10 (reto en
    // adelante) como texto plano, para que ningún valor que empiece con "="
    // o "+" se ejecute como fórmula en la Sheet.
    sheet.getRange(primeraFila, 2, filas.length, 7).setNumberFormat('@');
    sheet.getRange(primeraFila, 10, filas.length, numColumnas - 9).setNumberFormat('@');
    sheet.getRange(primeraFila, 1, filas.length, numColumnas).setValues(filas);
    SpreadsheetApp.flush();
    return { id: id, esNuevo: true };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Genera un PDF con el plan completo (identificación de la dupla, todas las
 * acciones y el compromiso de cierre) y lo envía por correo a ambos
 * integrantes. El documento de Google Docs se crea solo como paso
 * intermedio para exportar el PDF, y se manda a la papelera apenas se envía
 * el correo — no queda como archivo suelto en Drive.
 */
function enviarPlanPorCorreo_(dupla, acciones, compromiso) {
  var nombreDoc = 'Plan de acompañamiento — ' + dupla.nombreExperimentado + ' y ' + dupla.nombreNuevo;
  var doc = DocumentApp.create(nombreDoc);
  var body = doc.getBody();

  body.appendParagraph('Acompañamiento entre Pares · Sesión 1').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph('Mi primer reto de acompañamiento').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Microplan de acompañamiento entre pares').setItalic(true);

  body.appendParagraph('Dupla').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendTable([
    ['', 'Nombre', 'Correo', 'Institución'],
    ['Rector con experiencia', dupla.nombreExperimentado, dupla.correoExperimentado, dupla.institucionExperimentado],
    ['Rector nuevo', dupla.nombreNuevo, dupla.correoNuevo, dupla.institucionNuevo],
  ]);

  body.appendParagraph('Plan de acción').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  var filasTabla = [['#', 'Reto concreto', 'Acción de acompañamiento', 'Responsable', 'Fecha', 'Evidencia de avance']];
  acciones.forEach(function (accion, i) {
    filasTabla.push([
      String(i + 1),
      String(accion.reto).trim(),
      String(accion.accion).trim(),
      String(accion.responsable).trim(),
      String(accion.fecha).trim(),
      String(accion.evidencia).trim(),
    ]);
  });
  body.appendTable(filasTabla);

  body.appendParagraph('Compromiso de cierre').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(compromiso);

  doc.saveAndClose();
  var pdf = DriveApp.getFileById(doc.getId()).getAs(MimeType.PDF);
  pdf.setName(nombreDoc + '.pdf');

  try {
    MailApp.sendEmail({
      to: dupla.correoExperimentado + ',' + dupla.correoNuevo,
      subject: 'Su plan de acompañamiento entre pares — Sesión 1',
      body:
        'Hola ' + dupla.nombreExperimentado + ' y ' + dupla.nombreNuevo + ',\n\n' +
        'Adjunto el plan de acompañamiento que definieron en la Sesión 1 de Acompañamiento entre Pares. ' +
        '¡Éxitos con el reto!\n\nAcompañamiento entre Pares',
      attachments: [pdf],
      name: 'Acompañamiento entre Pares',
    });
  } finally {
    DriveApp.getFileById(doc.getId()).setTrashed(true);
  }
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
  else if (!institucionValida_(institucion)) errors.push('institucion no reconocida: ' + institucion);
  if (!nombre) errors.push('nombre es requerido');
  else if (nombre.length > MAX_CARACTERES_CORTO) errors.push('nombre supera ' + MAX_CARACTERES_CORTO + ' caracteres');
  return { institucion: institucion, nombre: nombre };
}

/** La institución es una lista cerrada (INSTITUCIONES_SEED): el frontend la
 * ofrece como <select>, y aquí se valida por si acaso, sin distinguir tildes
 * ni mayúsculas. */
function institucionValida_(institucion) {
  var clave = normalizarClave_(institucion);
  return INSTITUCIONES_SEED.some(function (fila) { return normalizarClave_(fila[1]) === clave; });
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

/**
 * Exige exactamente una fila por cada componente fijo, en cualquier orden de
 * llegada (se reordena aquí según COMPONENTES), sin filas de más ni de menos.
 */
function validarFilasPorComponente_(filas, errors) {
  if (!Array.isArray(filas)) {
    errors.push('filas debe ser una lista');
    return [];
  }

  var porComponente = {};
  filas.forEach(function (fila) {
    if (!fila || typeof fila !== 'object') return;
    var clave = normalizarClave_(fila.componente);
    if (clave) porComponente[clave] = fila;
  });

  var faltantes = COMPONENTES.filter(function (c) { return !porComponente[normalizarClave_(c)]; });
  if (faltantes.length > 0) errors.push('Faltan componentes: ' + faltantes.join(', '));

  if (filas.length !== COMPONENTES.length) {
    errors.push('Se esperaban exactamente ' + COMPONENTES.length + ' filas (una por componente)');
  }

  return COMPONENTES.map(function (componente) {
    var fila = porComponente[normalizarClave_(componente)] || {};
    return Object.assign({}, fila, { componente: componente });
  });
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
  return campos.map(function (campo) { return String(fila[campo] === undefined || fila[campo] === null ? '' : fila[campo]).trim(); });
}

function normalizarClave_(valor) {
  return String(valor || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// Lectura genérica (usada por getExperimentados/getNuevos)
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
