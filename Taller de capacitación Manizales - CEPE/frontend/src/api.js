const API_URL = import.meta.env.VITE_API_URL;

async function get(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url.toString());
  const body = await res.json();
  if (!body.success) throw new Error(body.error || 'Error desconocido');
  return body.data;
}

async function post(action, payload) {
  // Content-Type text/plain evita el preflight CORS que Apps Script no
  // soporta; el cuerpo sigue siendo JSON.stringify normal.
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

export function submitInscripcion(payload) {
  return post('submitInscripcion', payload);
}

export function getDocentes() {
  return get('getDocentes');
}

export function getResumen() {
  return get('getResumen');
}
