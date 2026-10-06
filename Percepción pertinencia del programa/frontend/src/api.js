const API_URL = import.meta.env.VITE_API_URL

// Apps Script puede tardar unos segundos; pasado este tiempo se corta y se avisa
// (el envío es idempotente por idEnvio: reintentar no duplica).
const TIEMPO_MAX_MS = 60000

export async function enviarEncuesta(payload) {
  if (!API_URL) throw new Error('Falta configurar VITE_API_URL (URL del Web App de Apps Script).')
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAX_MS)
  try {
    // 'text/plain' evita el preflight OPTIONS que los Web Apps de Apps Script no responden.
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'submitEncuesta', ...payload }),
      signal: controlador.signal,
    })
    let cuerpo
    try {
      cuerpo = await res.json()
    } catch {
      throw new Error('El servidor respondió algo inesperado. Intenta de nuevo en unos minutos.')
    }
    if (!cuerpo.success) throw new Error(cuerpo.error || 'Error desconocido')
    return cuerpo
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('La conexión tardó demasiado. Puedes intentarlo de nuevo: si tu envío ya llegó, no se duplicará.')
    }
    if (err instanceof TypeError) {
      throw new Error('No hay conexión con el servidor. Revisa tu internet e intenta de nuevo: tus respuestas siguen aquí.')
    }
    throw err
  } finally {
    clearTimeout(temporizador)
  }
}
