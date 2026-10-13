import { useEffect, useMemo, useRef, useState } from 'react'
import { enviarVisita, prepararArchivo, subirEvidencia } from './api.js'
import Puente from './components/Puente.jsx'
import { INSTITUCIONES } from './data/catalogos.js'
import {
  CRITERIOS,
  HALLAZGO,
  MAX_ARCHIVOS_POR_CRITERIO,
  NIVELES,
  RESPUESTAS,
  SUBTITULO,
  TITULO,
} from './data/checklist.js'
import logo1 from './assets/logo-1-evidencia-potencial.png'
import logo2 from './assets/logo-2-comite-cafeteros.png'
import logo3 from './assets/logo-3-alcaldia-manizales.png'

const CLAVE_BORRADOR = 'protocolo-articulacion-borrador'
const PASO_HALLAZGOS = CRITERIOS.length + 1
const PASO_CIERRE = CRITERIOS.length + 2
const ULTIMO = PASO_CIERRE
const MAX_BYTES = 8 * 1024 * 1024
const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']

const hoy = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const nuevoHallazgo = () => ({ id: crypto.randomUUID(), hallazgo: '', accion: '', responsable: '', fecha: '' })

const inicial = () => ({
  acompanante: '',
  institucion: '',
  fechaVisita: hoy(),
  numeroVisita: '1',
  criterios: Object.fromEntries(CRITERIOS.map((c) => [c.clave, { respuesta: '', evidencia: '', archivos: [] }])),
  hallazgos: [],
  nivel: '',
})

function leerBorrador() {
  try {
    const crudo = localStorage.getItem(CLAVE_BORRADOR)
    if (crudo) {
      const { datos, paso, idEnvio } = JSON.parse(crudo)
      const base = inicial()
      return {
        datos: { ...base, ...datos, criterios: { ...base.criterios, ...datos.criterios } },
        paso: Math.min(paso ?? 0, ULTIMO),
        idEnvio: idEnvio || crypto.randomUUID(),
      }
    }
  } catch {
    // Borrador ilegible: se empieza de cero.
  }
  return { datos: inicial(), paso: 0, idEnvio: crypto.randomUUID() }
}

function validar(paso, d) {
  const e = {}
  if (paso === 0) {
    if (d.acompanante.trim().length < 3) e.acompanante = 'Escribe el nombre del acompañante.'
    if (!d.institucion) e.institucion = 'Elige la institución educativa.'
    if (!d.fechaVisita) e.fechaVisita = 'Indica la fecha de la visita.'
    const n = Number(d.numeroVisita)
    if (!(n >= 1 && n <= 50 && Number.isInteger(n))) e.numeroVisita = 'Escribe un número de visita (1, 2, 3…).'
  } else if (paso >= 1 && paso <= CRITERIOS.length) {
    if (!d.criterios[CRITERIOS[paso - 1].clave].respuesta) e.respuesta = 'Elige una opción para tender esta tabla del puente.'
  } else if (paso === PASO_HALLAZGOS) {
    d.hallazgos.forEach((h) => {
      const vacio = !h.hallazgo.trim() && !h.accion.trim() && !h.responsable.trim() && !h.fecha
      if (!vacio && (!h.hallazgo.trim() || !h.accion.trim())) {
        e[h.id] = 'Cada hallazgo necesita el hallazgo y la acción de mejora (o bórralo).'
      }
    })
  } else if (paso === PASO_CIERRE) {
    if (!d.nivel) e.nivel = 'Elige el nivel de apropiación de la institución.'
  }
  return e
}

function Campo({ id, etiqueta, ayuda, error, children }) {
  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {ayuda && <span className="ayuda">{ayuda}</span>}
      {children}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  )
}

function IconoRespuesta({ valor }) {
  return (
    <svg className="resp__icono" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="2" y="6" width="24" height="16" rx="3" />
      {valor === 'SI' && <rect x="2" y="6" width="24" height="16" rx="3" fill="currentColor" style={{ fill: 'var(--si)' }} />}
      {valor === 'PARCIAL' && <rect x="2" y="14" width="24" height="8" rx="2" style={{ fill: 'var(--parcial)', stroke: 'none' }} />}
      {valor === 'NO' && <path d="M9 10l10 8M19 10l-10 8" style={{ stroke: 'var(--no)', strokeWidth: 2 }} />}
      {valor === 'NA' && <path d="M9 14h10" style={{ stroke: 'var(--na)', strokeWidth: 2 }} />}
    </svg>
  )
}

export default function App() {
  const [{ datos: d0, paso: p0, idEnvio: id0 }] = useState(leerBorrador)
  const [datos, setDatos] = useState(d0)
  const [paso, setPaso] = useState(p0)
  const [idEnvio, setIdEnvio] = useState(id0)
  const [errores, setErrores] = useState({})
  const [subidas, setSubidas] = useState({}) // { c01: [{ id, nombre, estado: 'subiendo'|'error', error, archivo }] }
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviado, setEnviado] = useState(null)
  const inicioRef = useRef(null)

  useEffect(() => {
    if (enviado) return
    try {
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ datos, paso, idEnvio }))
    } catch {
      // Sin almacenamiento local (modo privado): el formulario sigue funcionando.
    }
  }, [datos, paso, idEnvio, enviado])

  useEffect(() => {
    inicioRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [paso, enviado])

  const respuestas = useMemo(
    () => Object.fromEntries(CRITERIOS.map((c) => [c.clave, datos.criterios[c.clave].respuesta])),
    [datos.criterios],
  )
  const respondidos = CRITERIOS.filter((c) => respuestas[c.clave]).length
  const subiendo = Object.values(subidas).some((l) => l.some((s) => s.estado === 'subiendo'))
  const criterioActual = paso >= 1 && paso <= CRITERIOS.length ? CRITERIOS[paso - 1] : null

  const cambiar = (campo, valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }))
    setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  const cambiarCriterio = (clave, campo, valor) => {
    setDatos((d) => ({ ...d, criterios: { ...d.criterios, [clave]: { ...d.criterios[clave], [campo]: valor } } }))
    setErrores((e) => ({ ...e, respuesta: undefined }))
  }

  const cambiarHallazgo = (id, campo, valor) => {
    setDatos((d) => ({ ...d, hallazgos: d.hallazgos.map((h) => (h.id === id ? { ...h, [campo]: valor } : h)) }))
    setErrores((e) => ({ ...e, [id]: undefined }))
  }

  const ir = (nuevo) => {
    setErrores({})
    setErrorEnvio('')
    setPaso(nuevo)
  }

  const siguiente = () => {
    const e = validar(paso, datos)
    if (Object.values(e).some(Boolean)) {
      setErrores(e)
      return
    }
    ir(paso + 1)
  }

  const irACriterio = (clave) => {
    // Desde el puente solo se salta una vez identificada la visita.
    if (paso === 0 && Object.values(validar(0, datos)).some(Boolean)) {
      setErrores(validar(0, datos))
      return
    }
    ir(CRITERIOS.findIndex((c) => c.clave === clave) + 1)
  }

  // ----- Evidencias: se suben al elegirlas -----
  const quitarSubida = (clave, id) =>
    setSubidas((s) => ({ ...s, [clave]: (s[clave] || []).filter((x) => x.id !== id) }))

  const subirUno = async (clave, entrada) => {
    setSubidas((s) => ({
      ...s,
      [clave]: (s[clave] || []).map((x) => (x.id === entrada.id ? { ...x, estado: 'subiendo', error: '' } : x)),
    }))
    try {
      const { base64, mimeType, tamano } = await prepararArchivo(entrada.archivo)
      if (tamano > MAX_BYTES) throw new Error('El archivo supera 8 MB.')
      const r = await subirEvidencia({
        idEnvio,
        institucion: datos.institucion,
        fechaVisita: datos.fechaVisita,
        criterio: clave,
        nombre: entrada.nombre,
        mimeType,
        base64,
      })
      setDatos((d) => ({
        ...d,
        criterios: {
          ...d.criterios,
          [clave]: { ...d.criterios[clave], archivos: [...d.criterios[clave].archivos, { nombre: r.nombre, url: r.url }] },
        },
      }))
      quitarSubida(clave, entrada.id)
    } catch (err) {
      setSubidas((s) => ({
        ...s,
        [clave]: (s[clave] || []).map((x) => (x.id === entrada.id ? { ...x, estado: 'error', error: err.message } : x)),
      }))
    }
  }

  const adjuntar = (clave, lista) => {
    const actuales = datos.criterios[clave].archivos.length + (subidas[clave] || []).length
    const nuevos = []
    for (const archivo of Array.from(lista).slice(0, Math.max(0, MAX_ARCHIVOS_POR_CRITERIO - actuales))) {
      const base = { id: crypto.randomUUID(), nombre: archivo.name, archivo }
      if (!TIPOS_OK.includes(archivo.type)) nuevos.push({ ...base, estado: 'error', error: 'Solo fotos (JPG, PNG, WEBP, HEIC) o PDF.' })
      else nuevos.push({ ...base, estado: 'subiendo' })
    }
    if (!nuevos.length) return
    setSubidas((s) => ({ ...s, [clave]: [...(s[clave] || []), ...nuevos] }))
    nuevos.filter((n) => n.estado === 'subiendo').forEach((n) => subirUno(clave, n))
  }

  const quitarArchivo = (clave, url) =>
    setDatos((d) => ({
      ...d,
      criterios: { ...d.criterios, [clave]: { ...d.criterios[clave], archivos: d.criterios[clave].archivos.filter((a) => a.url !== url) } },
    }))

  const enviar = async () => {
    const e = validar(paso, datos)
    if (Object.values(e).some(Boolean)) {
      setErrores(e)
      return
    }
    setEnviando(true)
    setErrorEnvio('')
    try {
      await enviarVisita({
        idEnvio,
        acompanante: datos.acompanante.trim(),
        institucion: datos.institucion,
        fechaVisita: datos.fechaVisita,
        numeroVisita: Number(datos.numeroVisita),
        criterios: Object.fromEntries(
          CRITERIOS.map((c) => {
            const { respuesta, evidencia, archivos } = datos.criterios[c.clave]
            return [c.clave, { respuesta, evidencia: evidencia.trim(), archivos }]
          }),
        ),
        hallazgos: datos.hallazgos
          .filter((h) => h.hallazgo.trim() || h.accion.trim() || h.responsable.trim() || h.fecha)
          .map(({ hallazgo, accion, responsable, fecha }) => ({ hallazgo, accion, responsable, fecha })),
        nivel: datos.nivel,
      })
      localStorage.removeItem(CLAVE_BORRADOR)
      setEnviado({ datos, respuestas })
    } catch (err) {
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const otraVisita = () => {
    setDatos(inicial())
    setIdEnvio(crypto.randomUUID())
    setSubidas({})
    setErrores({})
    setEnviado(null)
    setPaso(0)
  }

  // ----- Pantalla final -----
  if (enviado) {
    return (
      <div className="app">
        <main className="hoja" style={{ marginTop: 24 }}>
          <p className="mono">Visita registrada</p>
          <h1 ref={inicioRef} tabIndex={-1}>El puente quedó tendido</h1>
          <p className="sub">
            {enviado.datos.institucion} · visita {enviado.datos.numeroVisita} · {enviado.datos.fechaVisita}. Nivel de
            apropiación: <strong>{enviado.datos.nivel}</strong>.
          </p>
          <div style={{ margin: '20px 0 4px' }}>
            <Puente respuestas={enviado.respuestas} titulo="Puente de la visita registrada" />
          </div>
          <Leyenda />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <button type="button" className="btn" onClick={otraVisita}>Registrar otra visita</button>
            <button type="button" className="btn btn--suave" onClick={() => window.print()}>Imprimir</button>
          </div>
        </main>
      </div>
    )
  }

  const pendientesErr = criterioActual ? (subidas[criterioActual.clave] || []) : []

  return (
    <div className="app">
      <header className="cabecera">
        <div className="cabecera__fila">
          <span className="cabecera__titulo">El puente de la articulación</span>
          <span className="cabecera__cuenta" aria-live="polite">{respondidos}/{CRITERIOS.length} tablas</span>
        </div>
        <Puente respuestas={respuestas} actual={criterioActual?.clave} onElegir={irACriterio} mini={false} />
      </header>

      <main className="hoja" key={paso}>
        {paso === 0 && (
          <>
            <div className="logos">
              <img src={logo1} alt="Evidencia Potencial" />
              <img src={logo2} alt="Comité de Cafeteros de Caldas" />
              <img src={logo3} alt="Alcaldía de Manizales" />
            </div>
            <p className="mono">{SUBTITULO} · La Universidad en el Campo</p>
            <h1 ref={inicioRef} tabIndex={-1}>{TITULO}</h1>
            <p className="sub">
              Seguimiento a la implementación del Protocolo de Articulación de la Educación Media con la Posmedia.
              Cada criterio que respondas tiende una tabla del puente. Puedes dejar el formulario y volver: se guarda en este teléfono.
            </p>
            <div className="campos">
              <Campo id="acompanante" etiqueta="Nombre del acompañante" error={errores.acompanante}>
                <input id="acompanante" value={datos.acompanante} autoComplete="name"
                  onChange={(e) => cambiar('acompanante', e.target.value)} />
              </Campo>
              <Campo id="institucion" etiqueta="Institución educativa visitada" error={errores.institucion}>
                <select id="institucion" value={datos.institucion} onChange={(e) => cambiar('institucion', e.target.value)}>
                  <option value="">Elige una…</option>
                  {INSTITUCIONES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </Campo>
              <div className="fila-2">
                <Campo id="fecha" etiqueta="Fecha de la visita" error={errores.fechaVisita}>
                  <input id="fecha" type="date" value={datos.fechaVisita} onChange={(e) => cambiar('fechaVisita', e.target.value)} />
                </Campo>
                <Campo id="numero" etiqueta="Número de visita" error={errores.numeroVisita}>
                  <input id="numero" type="number" inputMode="numeric" min="1" max="50" value={datos.numeroVisita}
                    onChange={(e) => cambiar('numeroVisita', e.target.value)} />
                </Campo>
              </div>
            </div>
          </>
        )}

        {criterioActual && (
          <>
            <div className="criterio__num">
              <b>{paso}</b>
              <span className="mono">de {CRITERIOS.length} · {criterioActual.componente}</span>
            </div>
            <h2 ref={inicioRef} tabIndex={-1}>{criterioActual.componente}</h2>
            <p className="criterio__texto">{criterioActual.criterio}</p>

            <div role="radiogroup" aria-label="Respuesta" className="respuestas">
              {RESPUESTAS.map((r) => (
                <button key={r.valor} type="button" role="radio"
                  className={`resp resp--${r.valor.toLowerCase()}`}
                  aria-checked={datos.criterios[criterioActual.clave].respuesta === r.valor}
                  onClick={() => cambiarCriterio(criterioActual.clave, 'respuesta', r.valor)}>
                  <IconoRespuesta valor={r.valor} />
                  {r.etiqueta}
                </button>
              ))}
            </div>
            {errores.respuesta && <p className="error" role="alert" style={{ marginTop: 10 }}>{errores.respuesta}</p>}

            <div className="evidencia">
              <Campo id="evidencia" etiqueta="Evidencia verificable" ayuda="Describe lo que viste o lo que te mostraron (opcional).">
                <textarea id="evidencia" value={datos.criterios[criterioActual.clave].evidencia}
                  placeholder={criterioActual.pista}
                  onChange={(e) => cambiarCriterio(criterioActual.clave, 'evidencia', e.target.value)} />
              </Campo>
              <div style={{ marginTop: 12 }}>
                <label className="btn btn--suave btn--chico" style={{ cursor: 'pointer' }}>
                  📎 Adjuntar foto o PDF
                  <input type="file" className="sr-only" multiple accept="image/*,application/pdf"
                    onChange={(e) => {
                      adjuntar(criterioActual.clave, e.target.files)
                      e.target.value = ''
                    }} />
                </label>
                <ul className="adjuntos" style={{ marginTop: 10 }}>
                  {datos.criterios[criterioActual.clave].archivos.map((a) => (
                    <li key={a.url} className="adjunto">
                      <span title={a.nombre}>✓ {a.nombre}</span>
                      <button type="button" aria-label={`Quitar ${a.nombre}`} onClick={() => quitarArchivo(criterioActual.clave, a.url)}>×</button>
                    </li>
                  ))}
                  {pendientesErr.map((s) => (
                    <li key={s.id} className={`adjunto${s.estado === 'error' ? ' adjunto--error' : ''}`}>
                      <span title={s.nombre}>{s.estado === 'subiendo' ? '⏳ Subiendo… ' : '⚠ '}{s.nombre}</span>
                      {s.estado === 'error' && (
                        <>
                          <span style={{ maxWidth: 'none' }}>{s.error}</span>
                          {TIPOS_OK.includes(s.archivo.type) && (
                            <button type="button" aria-label="Reintentar" onClick={() => subirUno(criterioActual.clave, s)}>↻</button>
                          )}
                          <button type="button" aria-label="Descartar" onClick={() => quitarSubida(criterioActual.clave, s.id)}>×</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {paso === PASO_HALLAZGOS && (
          <>
            <p className="mono">Bitácora de obra</p>
            <h2 ref={inicioRef} tabIndex={-1}>Hallazgos y acciones de mejora</h2>
            <p className="sub">Registra lo que funciona o las brechas, lo que se acordó transformar y quién lo hará. Es opcional.</p>
            {datos.hallazgos.map((h, i) => (
              <section key={h.id} className="hallazgo" aria-label={`Hallazgo ${i + 1}`}>
                <span className="mono">Hallazgo {i + 1}</span>
                <div className="campos">
                  <Campo id={`h-${h.id}`} etiqueta={HALLAZGO.hallazgo.etiqueta} ayuda={HALLAZGO.hallazgo.ayuda} error={errores[h.id]}>
                    <textarea id={`h-${h.id}`} value={h.hallazgo} onChange={(e) => cambiarHallazgo(h.id, 'hallazgo', e.target.value)} />
                  </Campo>
                  <Campo id={`a-${h.id}`} etiqueta={HALLAZGO.accion.etiqueta} ayuda={HALLAZGO.accion.ayuda}>
                    <textarea id={`a-${h.id}`} value={h.accion} onChange={(e) => cambiarHallazgo(h.id, 'accion', e.target.value)} />
                  </Campo>
                  <div className="fila-2">
                    <Campo id={`r-${h.id}`} etiqueta={HALLAZGO.responsable.etiqueta} ayuda={HALLAZGO.responsable.ayuda}>
                      <input id={`r-${h.id}`} value={h.responsable} onChange={(e) => cambiarHallazgo(h.id, 'responsable', e.target.value)} />
                    </Campo>
                    <Campo id={`f-${h.id}`} etiqueta={HALLAZGO.fecha.etiqueta} ayuda={HALLAZGO.fecha.ayuda}>
                      <input id={`f-${h.id}`} type="date" value={h.fecha} onChange={(e) => cambiarHallazgo(h.id, 'fecha', e.target.value)} />
                    </Campo>
                  </div>
                </div>
                <button type="button" className="btn btn--peligro btn--chico" style={{ marginTop: 12 }}
                  onClick={() => setDatos((d) => ({ ...d, hallazgos: d.hallazgos.filter((x) => x.id !== h.id) }))}>
                  Quitar este hallazgo
                </button>
              </section>
            ))}
            <button type="button" className="btn btn--suave" style={{ marginTop: 16 }}
              onClick={() => setDatos((d) => ({ ...d, hallazgos: [...d.hallazgos, nuevoHallazgo()] }))}>
              + Agregar hallazgo
            </button>
          </>
        )}

        {paso === PASO_CIERRE && (
          <>
            <p className="mono">Valoración final de la IE</p>
            <h2 ref={inicioRef} tabIndex={-1}>Nivel de apropiación</h2>
            <p className="sub">Elige el sello que mejor describe a {datos.institucion || 'la institución'} tras esta visita.</p>
            <Leyenda />
            <div role="radiogroup" aria-label="Nivel de apropiación" className="sellos">
              {NIVELES.map((n) => (
                <button key={n.valor} type="button" role="radio" className="sello"
                  aria-checked={datos.nivel === n.valor} onClick={() => cambiar('nivel', n.valor)}>
                  <span className="sello__marca" aria-hidden="true">{n.valor[0]}</span>
                  <span><strong>{n.valor}</strong> – {n.definicion}</span>
                </button>
              ))}
            </div>
            {errores.nivel && <p className="error" role="alert" style={{ marginTop: 10 }}>{errores.nivel}</p>}
            {subiendo && <p className="aviso">Hay archivos subiéndose. Espera a que terminen para enviar.</p>}
            {errorEnvio && <p className="aviso" role="alert">{errorEnvio}</p>}
          </>
        )}
      </main>

      <nav className="navegacion" aria-label="Navegación del formulario">
        <div className="navegacion__in">
          {paso > 0 && <button type="button" className="btn btn--suave" onClick={() => ir(paso - 1)}>Atrás</button>}
          {paso < ULTIMO ? (
            <button type="button" className="btn" onClick={siguiente}>
              {paso === 0 ? 'Empezar el puente' : paso === PASO_HALLAZGOS ? 'Ir al cierre' : 'Siguiente'}
            </button>
          ) : (
            <button type="button" className="btn" disabled={enviando || subiendo} onClick={enviar}>
              {enviando ? 'Enviando…' : 'Enviar visita'}
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}

function Leyenda() {
  return (
    <ul className="leyenda" aria-label="Leyenda del puente">
      <li><i className="i-si" /> Sí</li>
      <li><i className="i-parcial" /> Parcial</li>
      <li><i className="i-no" /> No</li>
      <li><i className="i-na" /> No aplica</li>
      <li><i className="i-vacia" /> Sin responder</li>
    </ul>
  )
}
