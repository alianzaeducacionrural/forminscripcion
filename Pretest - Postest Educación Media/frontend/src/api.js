const API_URL = import.meta.env.VITE_API_URL;

async function get(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url);
  const body = await res.json();
  if (!body.success) throw new Error(body.error || 'Error desconocido');
  return body.data;
}

async function post(action, payload = {}) {
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

export function getPretestPorInstitucion(institucion) {
  return get('getPretestPorInstitucion', { institucion });
}

export function submitPretest(payload) {
  return post('submitPretest', payload);
}

export function submitPostest(payload) {
  return post('submitPostest', payload);
}

export function getPretest() {
  return get('getPretest');
}

export function getPostest() {
  return get('getPostest');
}
