import { useEffect, useMemo, useState } from 'react'
import { getRespuestas } from '../api.js'
import { ESCALA, PREGUNTAS_ABIERTAS } from '../data/encuesta.js'
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
                        {f.institucion} · {f.programa} · {universidadDe(f)}
                      </small>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </>
      ) : null}
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
