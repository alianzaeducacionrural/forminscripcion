const API_URL = import.meta.env.VITE_API_URL;

function exigirUrl() {
  if (!API_URL) {
    throw new Error('Falta configurar VITE_API_URL (URL del Web App de Apps Script).');
  }
}

async function get(action, params = {}) {
  exigirUrl();
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url);
  const body = await res.json();
  if (!body.success) throw new Error(body.error || 'Error desconocido');
  return body.data;
}

async function post(action, payload = {}) {
  exigirUrl();
  // CORS workaround: 'text/plain' evita el preflight OPTIONS que los Web
  // Apps de Apps Script no pueden responder correctamente. GAS parsea el
  // body como JSON de todas formas, sin importar el Content-Type declarado.
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  const body = await res.json();
  if (!body.success) throw new Error(body.error || 'Error desconocido');
  return body;
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
