import { BLOQUES, ESCALA, FACTORES, PROYECCIONES, VALORACION_GLOBAL } from '../data/encuesta.js'

const esNumero = (v) => typeof v === 'number' && v >= 1 && v <= 5

/** Distribución 1..5 + N/A de una afirmación, y su promedio (N/A no cuenta). */
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

export function resumenBloques(filas) {
  return BLOQUES.map((b) => {
    const items = b.items.map((item) => ({ ...item, ...resumenItem(filas, item.clave) }))
    const validos = items.filter((i) => i.promedio != null)
    const promedio = validos.length ? validos.reduce((s, i) => s + i.promedio, 0) / validos.length : null
    return { ...b, items, promedio }
  })
}

export function promedioGeneral(bloques) {
  const todos = bloques.flatMap((b) => b.items).filter((i) => i.promedio != null)
  return todos.length ? todos.reduce((s, i) => s + i.promedio, 0) / todos.length : null
}

export function distribucionGlobal(filas) {
  return VALORACION_GLOBAL.map((v) => ({
    ...v,
    total: filas.filter((f) => f.valoracion_global === v.valor).length,
  }))
}

export function conteoFactores(filas) {
  const base = Object.fromEntries(FACTORES.map((f) => [f, 0]))
  for (const f of filas) {
    for (const x of String(f.factores || '').split('; ').filter(Boolean)) {
      if (x in base) base[x] += 1
    }
  }
  return Object.entries(base)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
}

export function conteoProyeccion(filas) {
  return PROYECCIONES.map((nombre) => ({
    nombre,
    total: filas.filter((f) => f.proyeccion === nombre).length,
  })).sort((a, b) => b.total - a.total)
}

/** Agrupa por una columna y devuelve cantidad y promedio general de cada grupo. */
export function agrupar(filas, campo) {
  const grupos = new Map()
  for (const f of filas) {
    const nombre = f[campo] || '—'
    if (!grupos.has(nombre)) grupos.set(nombre, [])
    grupos.get(nombre).push(f)
  }
  return [...grupos.entries()]
    .map(([nombre, g]) => ({ nombre, total: g.length, promedio: promedioGeneral(resumenBloques(g)) }))
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
  a.download = `respuestas-encuesta-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
