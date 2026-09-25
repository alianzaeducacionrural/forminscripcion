const API_URL = import.meta.env.VITE_API_URL;

// Apps Script puede tardar unos segundos; pasado este tiempo se corta y se avisa
// (el envío es idempotente: reintentar no duplica).
const TIEMPO_MAX_MS = 60000;

function exigirUrl() {
  if (!API_URL) {
    throw new Error('Falta configurar VITE_API_URL (URL del Web App de Apps Script).');
  }
}

/** fetch con tiempo límite y errores en español, sin detalles técnicos para el usuario. */
async function pedir(url, opciones = {}) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAX_MS);
  try {
    const res = await fetch(url, { ...opciones, signal: controlador.signal });
    let cuerpo;
    try {
      cuerpo = await res.json();
    } catch {
      throw new Error('El servidor respondió algo inesperado. Intente de nuevo en unos minutos.');
    }
    if (!cuerpo.success) throw new Error(cuerpo.error || 'Error desconocido');
    return cuerpo;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('La conexión tardó demasiado. Puede volver a intentarlo: si su envío ya llegó, no se duplicará.');
    }
    if (err instanceof TypeError) {
      throw new Error('No hay conexión con el servidor. Revise su internet e intente de nuevo: lo que escribió sigue aquí y no se duplicará.');
    }
    throw err;
  } finally {
    clearTimeout(temporizador);
  }
}

async function get(action, params = {}) {
  exigirUrl();
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const cuerpo = await pedir(url);
  return cuerpo.data;
}

async function post(action, payload = {}) {
  exigirUrl();
  // CORS workaround: 'text/plain' evita el preflight OPTIONS que los Web
  // Apps de Apps Script no pueden responder correctamente. GAS parsea el
  // body como JSON de todas formas, sin importar el Content-Type declarado.
  return pedir(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
}

export function listInstituciones() {
  return get('listInstituciones');
}

export function submitMatriz1(payload) {
  return post('submitMatriz1', payload);
}

export function submitMatriz2(payload) {
  return post('submitMatriz2', payload);
}

export function getMatriz1() {
  return get('getMatriz1');
}

export function getMatriz2() {
  return get('getMatriz2');
}
