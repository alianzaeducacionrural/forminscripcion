import { INSTITUCIONES } from '../data/catalogos.js'
import { CRITERIOS } from '../data/checklist.js'

const PESO = { SI: 1, PARCIAL: 0.5, NO: 0 }

export const hoyISO = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** "nombre | url" por línea → [{ nombre, url }]. */
function parseArchivos(texto) {
  return String(texto || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.lastIndexOf(' | ')
      return i === -1 ? { nombre: 'Archivo', url: l } : { nombre: l.slice(0, i), url: l.slice(i + 3) }
    })
}

/** Fila de la hoja "Visitas" → visita con respuestas/evidencias/archivos por criterio. */
function normalizarVisita(fila) {
  const respuestas = {}
  const evidencias = {}
  const archivos = {}
  for (const c of CRITERIOS) {
    respuestas[c.clave] = fila[c.clave] || ''
    evidencias[c.clave] = fila[`${c.clave}_evidencia`] || ''
    archivos[c.clave] = parseArchivos(fila[`${c.clave}_archivos`])
  }
  return {
    id: fila.id_envio,
    timestamp: fila.timestamp,
    acompanante: fila.acompanante,
    institucion: fila.institucion,
    fecha: String(fila.fecha_visita || '').slice(0, 10),
    numero: Number(fila.numero_visita) || 1,
    nivel: fila.nivel_apropiacion,
    respuestas,
    evidencias,
    archivos,
  }
}

const orden = (a, b) =>
  b.fecha.localeCompare(a.fecha) || b.numero - a.numero || String(b.timestamp).localeCompare(String(a.timestamp))

/** Avance 0–100: Sí = 1, Parcial = 0,5, No = 0; "No aplica" no cuenta. */
export function indice(respuestas) {
  const vals = Object.values(respuestas).filter((r) => r in PESO)
  return vals.length ? Math.round((vals.reduce((s, r) => s + PESO[r], 0) / vals.length) * 100) : null
}

export function construirModelo(datos) {
  const visitas = (datos?.visitas || []).map(normalizarVisita).sort(orden)
  const hoy = hoyISO()
  const hallazgos = (datos?.hallazgos || []).map((h) => ({
    id: h.id_envio,
    institucion: h.institucion,
    fechaVisita: String(h.fecha_visita || '').slice(0, 10),
    hallazgo: h.hallazgo,
    accion: h.accion,
    responsable: h.responsable,
    fecha: String(h.fecha_verificacion || '').slice(0, 10),
    vencido: !!h.fecha_verificacion && String(h.fecha_verificacion).slice(0, 10) < hoy,
  }))
  const porIE = INSTITUCIONES.map((nombre) => {
    const suyas = visitas.filter((v) => v.institucion === nombre)
    const ultima = suyas[0] || null
    return {
      nombre,
      visitas: suyas,
      ultima,
      indice: ultima ? indice(ultima.respuestas) : null,
      hallazgos: hallazgos.filter((h) => h.institucion === nombre),
    }
  })
  // Distribución por criterio sobre la última visita de cada IE.
  const porCriterio = CRITERIOS.map((c) => {
    const cuenta = { SI: 0, PARCIAL: 0, NO: 0, NA: 0 }
    for (const ie of porIE) if (ie.ultima && ie.ultima.respuestas[c.clave]) cuenta[ie.ultima.respuestas[c.clave]] += 1
    return { ...c, cuenta, total: Object.values(cuenta).reduce((a, b) => a + b, 0) }
  })
  return { visitas, hallazgos, porIE, porCriterio }
}
