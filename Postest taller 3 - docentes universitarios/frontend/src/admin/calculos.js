import { APROPIACION, ESCALA, PERTINENCIA } from '../data/encuesta.js'

const esNumero = (v) => typeof v === 'number' && v >= 1 && v <= 5

/** Distribución 1..5 + N/A de una pregunta de escala, y su promedio (N/A no cuenta). */
export function resumenItem(filas, clave) {
  const conteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, na: 0 }
  let suma = 0
  let n = 0
  for (const f of filas) {
    const v = f[clave]
    if (esNumero(v)) {
      conteo[v] += 1
      suma += v
      n += 1
    } else if (v === 'N/A') {
      conteo.na += 1
    }
  }
  return { conteo, n, promedio: n ? suma / n : null }
}

export const resumenItems = (filas, items) => items.map((it) => ({ ...it, ...resumenItem(filas, it.clave) }))

/** Promedio de los promedios de cada pregunta que tenga al menos una respuesta numérica. */
export function promedioDe(resumenes) {
  const validos = resumenes.filter((r) => r.promedio != null)
  return validos.length ? validos.reduce((s, r) => s + r.promedio, 0) / validos.length : null
}

export const promedioPertinencia = (filas) => promedioDe(resumenItems(filas, PERTINENCIA))
export const promedioApropiacion = (filas) => promedioDe(resumenItems(filas, APROPIACION))

/** Cuenta cuántas filas marcaron cada opción de una columna de selección múltiple (unida con "; "). */
export function conteoLista(filas, columna, opciones) {
  const base = Object.fromEntries(opciones.map((o) => [o, 0]))
  for (const f of filas) {
    for (const x of String(f[columna] || '').split('; ').filter(Boolean)) {
      if (x in base) base[x] += 1
    }
  }
  return Object.entries(base)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
}

/** Cuenta filas por valor exacto de una columna, en el orden de `opciones`. */
export const conteoUnico = (filas, columna, opciones) =>
  opciones.map((nombre) => ({ nombre, total: filas.filter((f) => f[columna] === nombre).length }))

/** Agrupa por una columna y devuelve cantidad y promedio de pertinencia de cada grupo. */
export function agrupar(filas, campo) {
  const grupos = new Map()
  for (const f of filas) {
    const nombre = f[campo] || '—'
    if (!grupos.has(nombre)) grupos.set(nombre, [])
    grupos.get(nombre).push(f)
  }
  return [...grupos.entries()]
    .map(([nombre, g]) => ({ nombre, total: g.length, promedio: promedioPertinencia(g) }))
    .sort((a, b) => b.total - a.total)
}

export function universidadDe(f) {
  return f.universidad === 'Otra' ? `Otra: ${f.universidad_otra}` : f.universidad
}

export const COLOR_ESCALA = Object.fromEntries(ESCALA.map((e, i) => [e.valor, `var(--c${i + 1})`]))

export function descargarCSV(filas) {
  if (!filas.length) return
  const cols = Object.keys(filas[0])
  const celda = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
  const csv = [cols.join(','), ...filas.map((f) => cols.map((c) => celda(f[c])).join(','))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `prueba-salida-docentes-universitarios-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
