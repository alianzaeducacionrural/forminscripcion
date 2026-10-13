const API_URL = import.meta.env.VITE_API_URL

// Apps Script puede tardar unos segundos; pasado este tiempo se corta y se avisa
// (el envío es idempotente por idEnvio: reintentar no duplica).
const TIEMPO_MAX_MS = 90000

async function post(payload) {
  if (!API_URL) throw new Error('Falta configurar VITE_API_URL (URL del Web App de Apps Script).')
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAX_MS)
  try {
    // 'text/plain' evita el preflight OPTIONS que los Web Apps de Apps Script no responden.
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
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
      throw new Error('La conexión tardó demasiado. Intenta de nuevo: si ya llegó, no se duplicará.')
    }
    if (err instanceof TypeError) {
      throw new Error('No hay conexión con el servidor. Revisa la señal e intenta de nuevo: lo escrito sigue aquí.')
    }
    throw err
  } finally {
    clearTimeout(temporizador)
  }
}

export const enviarVisita = (payload) => post({ action: 'submitVisita', ...payload })
export const subirEvidencia = (payload) => post({ action: 'subirEvidencia', ...payload })

/** Formulario: { [institución]: { numero, fecha, nivel, respuestas, hallazgos } } del último acompañamiento. */
export async function getContexto() {
  if (!API_URL) throw new Error('Falta configurar VITE_API_URL.')
  const url = new URL(API_URL)
  url.searchParams.set('action', 'getContexto')
  const cuerpo = await fetch(url).then((r) => r.json())
  if (!cuerpo?.success) throw new Error(cuerpo?.error || 'No se pudo cargar el contexto.')
  return cuerpo.data
}

/** Panel admin: { visitas, hallazgos } con las claves de los encabezados de la hoja. */
export async function getVisitas() {
  if (!API_URL) throw new Error('Falta configurar VITE_API_URL (URL del Web App de Apps Script).')
  const url = new URL(API_URL)
  url.searchParams.set('action', 'getVisitas')
  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error('No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.')
  }
  const cuerpo = await res.json().catch(() => null)
  if (!cuerpo?.success) throw new Error(cuerpo?.error || 'No se pudieron cargar las visitas.')
  return cuerpo.data
}

/** Reduce una imagen a ~1600px JPEG y devuelve base64 (sin prefijo). PDFs y HEIC pasan tal cual. */
export async function prepararArchivo(archivo) {
  let blob = archivo
  let mimeType = archivo.type
  if (mimeType.startsWith('image/') && mimeType !== 'image/heic') {
    try {
      const bmp = await createImageBitmap(archivo)
      const escala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(bmp.width * escala)
      lienzo.height = Math.round(bmp.height * escala)
      lienzo.getContext('2d').drawImage(bmp, 0, 0, lienzo.width, lienzo.height)
      blob = await new Promise((ok) => lienzo.toBlob(ok, 'image/jpeg', 0.82))
      mimeType = 'image/jpeg'
    } catch {
      // Si el navegador no puede decodificarla, se sube tal cual.
    }
  }
  const base64 = await new Promise((ok, fallo) => {
    const lector = new FileReader()
    lector.onload = () => ok(String(lector.result).split(',')[1])
    lector.onerror = () => fallo(new Error('No se pudo leer el archivo.'))
    lector.readAsDataURL(blob)
  })
  return { base64, mimeType, tamano: blob.size }
}
