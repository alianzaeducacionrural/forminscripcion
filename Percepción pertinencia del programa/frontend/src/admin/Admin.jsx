import { useEffect, useMemo, useState } from 'react'
import { getRespuestas } from '../api.js'
import { BLOQUES, ESCALA, NA, PREGUNTAS_ABIERTAS } from '../data/encuesta.js'
import {
  agrupar,
  COLOR_ESCALA,
  conteoFactores,
  conteoProyeccion,
  descargarCSV,
  distribucionGlobal,
  promedioGeneral,
  resumenBloques,
  universidadDe,
} from './calculos.js'

const fmt = (n) => (n == null ? '—' : n.toFixed(2).replace('.', ','))
const pct = (parte, total) => (total ? Math.round((parte / total) * 100) : 0)

export default function Admin() {
  const [filas, setFilas] = useState([])
  const [estado, setEstado] = useState('cargando')
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({ universidad: '', programa: '', institucion: '' })
  const [pestana, setPestana] = useState(PREGUNTAS_ABIERTAS[0].clave)
  const [busqueda, setBusqueda] = useState('')
  const [buscarNombre, setBuscarNombre] = useState('')
  const [detalle, setDetalle] = useState(null)

  const [version, setVersion] = useState(0)

  const actualizar = () => {
    setEstado('cargando')
    setVersion((v) => v + 1)
  }

  useEffect(() => {
    let vigente = true
    getRespuestas()
      .then((datos) => {
        if (!vigente) return
        setFilas(datos)
        setEstado('listo')
      })
      .catch((e) => {
        if (!vigente) return
        setError(e.message)
        setEstado('error')
      })
    return () => {
      vigente = false
    }
  }, [version])

  const opciones = useMemo(() => {
    const u = [...new Set(filas.map(universidadDe))].sort()
    const p = [...new Set(filas.filter((f) => !filtros.universidad || universidadDe(f) === filtros.universidad).map((f) => f.programa))].sort()
    const i = [...new Set(filas.map((f) => f.institucion))].sort()
    return { u, p, i }
  }, [filas, filtros.universidad])

  const visibles = useMemo(
    () =>
      filas.filter(
        (f) =>
          (!filtros.universidad || universidadDe(f) === filtros.universidad) &&
          (!filtros.programa || f.programa === filtros.programa) &&
          (!filtros.institucion || f.institucion === filtros.institucion),
      ),
    [filas, filtros],
  )

  const bloques = useMemo(() => resumenBloques(visibles), [visibles])
  const general = promedioGeneral(bloques)
  const global = useMemo(() => distribucionGlobal(visibles), [visibles])
  const factores = useMemo(() => conteoFactores(visibles), [visibles])
  const proyeccion = useMemo(() => conteoProyeccion(visibles), [visibles])
  const porUniversidad = useMemo(() => agrupar(visibles.map((f) => ({ ...f, universidad: universidadDe(f) })), 'universidad'), [visibles])
  const porInstitucion = useMemo(() => agrupar(visibles, 'institucion'), [visibles])

  const altoMuyAlto = global.filter((g) => g.valor === 'Alto' || g.valor === 'Muy alto').reduce((s, g) => s + g.total, 0)
  const continuar = bloques.flatMap((b) => b.items).find((i) => i.clave === 'p26')
  const continuarPct = continuar ? pct(continuar.conteo[4] + continuar.conteo[5], continuar.n) : 0

  const abiertas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return visibles
      .filter((f) => String(f[pestana] || '').trim())
      .filter((f) => !q || String(f[pestana]).toLowerCase().includes(q))
      .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
  }, [visibles, pestana, busqueda])

  const registros = useMemo(() => {
    const q = buscarNombre.trim().toLowerCase()
    return [...visibles]
      .filter((f) => !q || String(f.nombre || '').toLowerCase().includes(q) || String(f.institucion).toLowerCase().includes(q))
      .sort((x, y) => String(y.timestamp).localeCompare(String(x.timestamp)))
  }, [visibles, buscarNombre])

  const hayFiltro = Object.values(filtros).some(Boolean)
  const maxGlobal = Math.max(1, ...global.map((g) => g.total))
  const maxFactor = Math.max(1, ...factores.map((f) => f.total))
  const maxProy = Math.max(1, ...proyeccion.map((p) => p.total))

  return (
    <div className="adm">
      <header className="adm-cab">
        <div>
          <span className="sello">Panel de resultados</span>
          <h1>Tu voz cuenta</h1>
          <p>Encuesta de valoración del Programa Técnico Profesional · La Universidad en el Campo</p>
        </div>
        <div className="adm-acc">
          <button type="button" className="adm-btn" onClick={actualizar} disabled={estado === 'cargando'}>
            {estado === 'cargando' ? 'Actualizando…' : '↻ Actualizar'}
          </button>
          <button type="button" className="adm-btn adm-btn-pri" onClick={() => descargarCSV(visibles)} disabled={!visibles.length}>
            ⬇ Descargar CSV
          </button>
        </div>
      </header>

      {estado === 'error' && <div className="alerta">{error}</div>}
      {estado === 'cargando' && !filas.length && <p className="adm-vacio">Cargando respuestas…</p>}

      {estado !== 'cargando' || filas.length ? (
        <>
          <section className="adm-filtros" aria-label="Filtros">
            <Filtro etiqueta="Universidad" valor={filtros.universidad} opciones={opciones.u} onChange={(v) => setFiltros({ universidad: v, programa: '', institucion: filtros.institucion })} />
            <Filtro etiqueta="Programa" valor={filtros.programa} opciones={opciones.p} onChange={(v) => setFiltros({ ...filtros, programa: v })} />
            <Filtro etiqueta="Institución" valor={filtros.institucion} opciones={opciones.i} onChange={(v) => setFiltros({ ...filtros, institucion: v })} />
            {hayFiltro && (
              <button type="button" className="adm-limpiar" onClick={() => setFiltros({ universidad: '', programa: '', institucion: '' })}>
                Quitar filtros
              </button>
            )}
          </section>

          {!visibles.length ? (
            <p className="adm-vacio">{filas.length ? 'No hay respuestas con esos filtros.' : 'Aún no hay respuestas.'}</p>
          ) : (
            <>
              <section className="adm-kpis">
                <Kpi etiqueta="Respuestas" valor={visibles.length} nota={hayFiltro ? `de ${filas.length} en total` : 'recibidas'} color="var(--turquesa)" />
                <Kpi etiqueta="Promedio general" valor={fmt(general)} nota="escala de 1 a 5" color="var(--verde)" />
                <Kpi etiqueta="Valoran el programa alto o muy alto" valor={`${pct(altoMuyAlto, visibles.length)}%`} nota={`${altoMuyAlto} de ${visibles.length}`} color="var(--lila)" />
                <Kpi etiqueta="Piensan continuar su trayectoria" valor={`${continuarPct}%`} nota="de acuerdo o totalmente de acuerdo" color="var(--sol)" />
              </section>

              <section className="adm-tarjeta">
                <h2>⭐ Valoración global</h2>
                <Barras filas={global.map((g) => ({ nombre: `${g.emoji} ${g.valor}`, total: g.total }))} max={maxGlobal} total={visibles.length} />
              </section>

              <section className="adm-tarjeta">
                <h2>🧩 Promedio por dimensión</h2>
                <div className="adm-dims">
                  {bloques.map((b) => (
                    <div className="adm-dim" key={b.id}>
                      <div className="adm-dim-t">
                        <span>
                          {b.emoji} {b.titulo}
                        </span>
                        <strong>{fmt(b.promedio)}</strong>
                      </div>
                      <div className="adm-pista">
                        <div className="adm-relleno" style={{ width: `${((b.promedio || 0) / 5) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="adm-tarjeta">
                <h2>📊 Cómo valoraron cada afirmación</h2>
                <Leyenda />
                {bloques.map((b) => (
                  <div className="adm-bloque" key={b.id}>
                    <h3>
                      {b.emoji} {b.titulo} <span>{fmt(b.promedio)}</span>
                    </h3>
                    {b.items.map((i) => (
                      <div className="adm-item" key={i.clave}>
                        <p>{i.texto}</p>
                        <div className="adm-seg" role="img" aria-label={`Promedio ${fmt(i.promedio)}`}>
                          {ESCALA.map((e) =>
                            i.conteo[e.valor] ? (
                              <span key={e.valor} style={{ flex: i.conteo[e.valor], background: COLOR_ESCALA[e.valor] }} title={`${e.valor} — ${e.texto}: ${i.conteo[e.valor]}`}>
                                {pct(i.conteo[e.valor], i.n) >= 9 ? `${pct(i.conteo[e.valor], i.n)}%` : ''}
                              </span>
                            ) : null,
                          )}
                        </div>
                        <small>
                          Promedio <strong>{fmt(i.promedio)}</strong> · {i.n} respuestas{i.conteo.na ? ` · ${i.conteo.na} N/A` : ''}
                        </small>
                      </div>
                    ))}
                  </div>
                ))}
              </section>

              <div className="adm-dos">
                <section className="adm-tarjeta">
                  <h2>🧭 Situaciones que más afectan</h2>
                  <Barras filas={factores.filter((f) => f.total)} max={maxFactor} total={visibles.length} vacio="Nadie marcó situaciones." />
                </section>
                <section className="adm-tarjeta">
                  <h2>🚀 Qué esperan hacer al terminar</h2>
                  <Barras filas={proyeccion.filter((p) => p.total)} max={maxProy} total={visibles.length} vacio="Sin datos." />
                </section>
              </div>

              <div className="adm-dos">
                <Tabla titulo="🎓 Por universidad" filas={porUniversidad} />
                <Tabla titulo="🏫 Por institución" filas={porInstitucion} />
              </div>

              <section className="adm-tarjeta">
                <h2>💬 Respuestas abiertas</h2>
                <div className="adm-tabs" role="tablist">
                  {PREGUNTAS_ABIERTAS.map((p) => (
                    <button key={p.clave} type="button" role="tab" aria-selected={pestana === p.clave} className={pestana === p.clave ? 'activa' : ''} onClick={() => setPestana(p.clave)}>
                      {p.texto.replace(/^¿/, '').split(',')[0].slice(0, 42)}
                      {p.texto.length > 42 ? '…' : ''}
                    </button>
                  ))}
                </div>
                <p className="adm-pregunta">{PREGUNTAS_ABIERTAS.find((p) => p.clave === pestana).texto}</p>
                <input type="search" className="adm-buscar" placeholder="Buscar en las respuestas…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                <p className="adm-cuenta">{abiertas.length} respuestas</p>
                <ul className="adm-citas">
                  {abiertas.map((f) => (
                    <li key={f.id_envio}>
                      <p>{f[pestana]}</p>
                      <small>
                        {f.nombre || 'Sin nombre'} · {f.institucion} · {f.programa} · {universidadDe(f)}
                      </small>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="adm-tarjeta">
                <h2>🗂️ Base de datos individual</h2>
                <input type="search" className="adm-buscar" placeholder="Buscar por nombre o institución…" value={buscarNombre} onChange={(e) => setBuscarNombre(e.target.value)} />
                <p className="adm-cuenta">{registros.length} registros · toca una fila para ver todas sus respuestas</p>
                <div className="adm-tabla-scroll">
                  <table className="adm-tabla adm-base">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Nombre</th>
                        <th>Universidad</th>
                        <th>Programa</th>
                        <th>Institución</th>
                        <th>Prom.</th>
                        <th>Global</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registros.map((f) => (
                        <tr key={f.id_envio} tabIndex={0} onClick={() => setDetalle(f)} onKeyDown={(e) => e.key === 'Enter' && setDetalle(f)}>
                          <td>{fechaCorta(f.timestamp)}</td>
                          <td>{f.nombre || '—'}</td>
                          <td>{universidadDe(f)}</td>
                          <td>{f.programa}</td>
                          <td>{f.institucion}</td>
                          <td>{fmt(promedioGeneral(resumenBloques([f])))}</td>
                          <td>{f.valoracion_global}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      ) : null}
      {detalle && <Detalle f={detalle} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}

function Filtro({ etiqueta, valor, opciones, onChange }) {
  return (
    <label className="adm-filtro">
      <span>{etiqueta}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todas</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function Kpi({ etiqueta, valor, nota, color }) {
  return (
    <div className="adm-kpi" style={{ '--k': color }}>
      <span className="adm-kpi-e">{etiqueta}</span>
      <strong>{valor}</strong>
      <small>{nota}</small>
    </div>
  )
}

function Barras({ filas, max, total, vacio }) {
  if (!filas.length) return <p className="adm-vacio">{vacio || 'Sin datos.'}</p>
  return (
    <ul className="adm-barras">
      {filas.map((f) => (
        <li key={f.nombre}>
          <div className="adm-barra-t">
            <span>{f.nombre}</span>
            <strong>
              {f.total} <small>({pct(f.total, total)}%)</small>
            </strong>
          </div>
          <div className="adm-pista">
            <div className="adm-relleno" style={{ width: `${(f.total / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Leyenda() {
  return (
    <ul className="adm-leyenda">
      {ESCALA.map((e) => (
        <li key={e.valor}>
          <i style={{ background: COLOR_ESCALA[e.valor] }} />
          {e.valor} · {e.texto}
        </li>
      ))}
    </ul>
  )
}

function Tabla({ titulo, filas }) {
  return (
    <section className="adm-tarjeta">
      <h2>{titulo}</h2>
      <table className="adm-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Resp.</th>
            <th>Prom.</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.nombre}>
              <td>{f.nombre}</td>
              <td>{f.total}</td>
              <td>{fmt(f.promedio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

const fechaCorta = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function Detalle({ f, onCerrar }) {
  useEffect(() => {
    const cerrar = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  }, [onCerrar])

  const texto = (v) => (v === 'N/A' ? NA.texto : ESCALA.find((e) => e.valor === v)?.texto || '')
  return (
    <div className="modal-fondo" onClick={onCerrar} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Respuestas de ${f.nombre}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-x" onClick={onCerrar} aria-label="Cerrar">
          ✕
        </button>
        <h2>{f.nombre || 'Sin nombre'}</h2>
        <p className="modal-meta">
          {universidadDe(f)} · {f.programa}
          <br />
          {f.institucion}, {f.municipio} · {fechaCorta(f.timestamp)}
        </p>
        <p className="modal-global">
          Valoración global: <strong>{f.valoracion_global}</strong>
        </p>
        {BLOQUES.map((b) => (
          <div className="adm-bloque" key={b.id}>
            <h3>
              {b.emoji} {b.titulo}
            </h3>
            {b.items.map((i) => (
              <div className="modal-fila" key={i.clave}>
                <span>{i.texto}</span>
                <b className={`modal-nota n${f[i.clave] === 'N/A' ? 'a' : f[i.clave]}`} title={texto(f[i.clave])}>
                  {f[i.clave]}
                </b>
              </div>
            ))}
          </div>
        ))}
        <div className="adm-bloque">
          <h3>💬 Respuestas abiertas</h3>
          {PREGUNTAS_ABIERTAS.map((p) => (
            <div className="modal-abierta" key={p.clave}>
              <small>{p.texto}</small>
              <p>{f[p.clave] || '—'}</p>
            </div>
          ))}
        </div>
        <div className="adm-bloque">
          <h3>🧭 Situaciones y proyección</h3>
          <p>
            <b>Situaciones:</b> {f.factores}
            {f.factor_otro ? ` (otra: ${f.factor_otro})` : ''}
          </p>
          <p>
            <b>Al terminar espera:</b> {f.proyeccion}
            {f.proyeccion_otra ? ` (${f.proyeccion_otra})` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
