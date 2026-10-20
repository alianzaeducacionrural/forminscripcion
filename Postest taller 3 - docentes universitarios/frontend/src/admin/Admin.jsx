import { useEffect, useMemo, useState } from 'react'
import { getRespuestas } from '../api.js'
import {
  ABIERTAS,
  APOYOS,
  APROPIACION,
  DIFICULTADES,
  ESCALA,
  ESTADOS_APLICACION,
  ESTRATEGIAS,
  EVIDENCIAS,
  NA,
  NA_NIVEL,
  NIVELES,
  PERTINENCIA,
  PERTINENCIA_GLOBAL,
  TALLERES,
  TIEMPOS,
} from '../data/encuesta.js'
import {
  agrupar,
  COLOR_ESCALA,
  conteoLista,
  conteoUnico,
  descargarCSV,
  promedioApropiacion,
  promedioDe,
  promedioPertinencia,
  resumenItems,
  universidadDe,
} from './calculos.js'

const fmt = (n) => (n == null ? '—' : n.toFixed(2).replace('.', ','))
const pct = (parte, total) => (total ? Math.round((parte / total) * 100) : 0)
const FILTROS_VACIOS = { municipio: '', universidad: '', programa: '', tiempo: '', taller: '' }

export default function Admin() {
  const [filas, setFilas] = useState([])
  const [estado, setEstado] = useState('cargando')
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [buscar, setBuscar] = useState('')
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
    const unicos = (lista) => [...new Set(lista)].sort()
    return {
      municipio: unicos(filas.map((f) => f.municipio)),
      universidad: unicos(filas.map(universidadDe)),
      programa: unicos(filas.filter((f) => !filtros.universidad || universidadDe(f) === filtros.universidad).map((f) => f.programa)),
    }
  }, [filas, filtros.universidad])

  const visibles = useMemo(
    () =>
      filas.filter(
        (f) =>
          (!filtros.municipio || f.municipio === filtros.municipio) &&
          (!filtros.universidad || universidadDe(f) === filtros.universidad) &&
          (!filtros.programa || f.programa === filtros.programa) &&
          (!filtros.tiempo || f.tiempo === filtros.tiempo) &&
          (!filtros.taller || String(f.talleres).split('; ').includes(filtros.taller)),
      ),
    [filas, filtros],
  )

  const pertinencia = useMemo(() => resumenItems(visibles, PERTINENCIA), [visibles])
  const apropiacion = useMemo(() => resumenItems(visibles, APROPIACION), [visibles])
  const aplicacion = useMemo(() => conteoUnico(visibles, 'estado_aplicacion', ESTADOS_APLICACION), [visibles])
  const global = useMemo(
    () =>
      PERTINENCIA_GLOBAL.map((g) => ({
        nombre: `${g.emoji} ${g.valor} — ${g.texto}`,
        total: visibles.filter((f) => Number(f.pertinencia_global) === g.valor).length,
      })),
    [visibles],
  )
  const estrategias = useMemo(() => conteoLista(visibles, 'estrategias', ESTRATEGIAS.opciones), [visibles])
  const dificultades = useMemo(() => conteoLista(visibles, 'dificultades', DIFICULTADES.opciones), [visibles])
  const evidencias = useMemo(() => conteoLista(visibles, 'evidencias', EVIDENCIAS.opciones), [visibles])
  const apoyos = useMemo(() => conteoLista(visibles, 'apoyos', APOYOS.opciones), [visibles])
  const porMunicipio = useMemo(() => agrupar(visibles, 'municipio'), [visibles])
  const porUniversidad = useMemo(() => agrupar(visibles.map((f) => ({ ...f, universidad: universidadDe(f) })), 'universidad'), [visibles])

  const yaAplican = aplicacion.slice(0, 2).reduce((s, a) => s + a.total, 0)

  const registros = useMemo(() => {
    const q = buscar.trim().toLowerCase()
    return [...visibles]
      .filter((f) => !q || [f.nombre, f.programa, f.municipio, universidadDe(f)].some((x) => String(x).toLowerCase().includes(q)))
      .sort((x, y) => String(y.timestamp).localeCompare(String(x.timestamp)))
  }, [visibles, buscar])

  const hayFiltro = Object.values(filtros).some(Boolean)

  return (
    <div className="adm">
      <header className="adm-cab">
        <div>
          <span className="sello">Panel de resultados</span>
          <h1>Prueba de salida</h1>
          <p>Formación de docentes universitarios · La Universidad en el Campo</p>
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
            <Filtro etiqueta="Municipio" valor={filtros.municipio} opciones={opciones.municipio} onChange={(v) => setFiltros({ ...filtros, municipio: v })} />
            <Filtro etiqueta="Institución o universidad" valor={filtros.universidad} opciones={opciones.universidad} onChange={(v) => setFiltros({ ...filtros, universidad: v, programa: '' })} />
            <Filtro etiqueta="Programa" valor={filtros.programa} opciones={opciones.programa} onChange={(v) => setFiltros({ ...filtros, programa: v })} />
            <Filtro etiqueta="Tiempo de vinculación" valor={filtros.tiempo} opciones={TIEMPOS} onChange={(v) => setFiltros({ ...filtros, tiempo: v })} />
            <Filtro etiqueta="Taller" valor={filtros.taller} opciones={TALLERES} onChange={(v) => setFiltros({ ...filtros, taller: v })} />
            {hayFiltro && (
              <button type="button" className="adm-limpiar" onClick={() => setFiltros(FILTROS_VACIOS)}>
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
                <Kpi etiqueta="Pertinencia de los talleres" valor={fmt(promedioDe(pertinencia))} nota="promedio de 1 a 5" color="var(--verde)" />
                <Kpi etiqueta="Apropiación de los aprendizajes" valor={fmt(promedioDe(apropiacion))} nota="promedio de 1 a 5" color="var(--lila)" />
                <Kpi etiqueta="Ya aplican o incorporan" valor={`${pct(yaAplican, visibles.length)}%`} nota={`${yaAplican} de ${visibles.length}`} color="var(--sol)" />
              </section>

              <section className="adm-tarjeta">
                <h2>🎯 Pertinencia de los talleres</h2>
                <Leyenda niveles={ESCALA} />
                <Segmentadas items={pertinencia} niveles={ESCALA} />
              </section>

              <section className="adm-tarjeta">
                <h2>🧠 Apropiación por componente</h2>
                <Leyenda niveles={NIVELES} />
                <Segmentadas items={apropiacion} niveles={NIVELES} />
              </section>

              <section className="adm-tarjeta">
                <h2>🔁 Estado de aplicación en las clases</h2>
                <Barras filas={aplicacion} total={visibles.length} />
              </section>

              <div className="adm-dos">
                <Lista titulo="🛠️ Estrategias aplicadas o proyectadas" filas={estrategias} total={visibles.length} />
                <Lista titulo="🚧 Dificultades para aplicar" filas={dificultades} total={visibles.length} />
              </div>
              <div className="adm-dos">
                <Lista titulo="📎 Evidencias que podrían aportar" filas={evidencias} total={visibles.length} />
                <Lista titulo="🤝 Apoyos que facilitarían la incorporación" filas={apoyos} total={visibles.length} />
              </div>

              <section className="adm-tarjeta">
                <h2>🌱 Pertinencia de la formación para sus clases</h2>
                <Barras filas={global} total={visibles.length} />
              </section>

              <div className="adm-dos">
                <Tabla titulo="🎓 Por institución o universidad" filas={porUniversidad} />
                <Tabla titulo="📍 Por municipio" filas={porMunicipio} />
              </div>

              <section className="adm-tarjeta">
                <h2>🗂️ Base de datos individual</h2>
                <input type="search" className="adm-buscar" placeholder="Buscar por nombre, programa, municipio o institución…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                <p className="adm-cuenta">{registros.length} registros · toque una fila para ver todas sus respuestas</p>
                <div className="adm-tabla-scroll">
                  <table className="adm-tabla adm-base">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Institución</th>
                        <th>Programa</th>
                        <th>Municipio</th>
                        <th>Pert.</th>
                        <th>Apropiación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registros.map((f) => (
                        <tr key={f.id_envio} tabIndex={0} onClick={() => setDetalle(f)} onKeyDown={(e) => e.key === 'Enter' && setDetalle(f)}>
                          <td>{f.nombre || '—'}</td>
                          <td>{universidadDe(f)}</td>
                          <td>{f.programa}</td>
                          <td>{f.municipio}</td>
                          <td>{fmt(promedioPertinencia([f]))}</td>
                          <td>{fmt(promedioApropiacion([f]))}</td>
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
        <option value="">Todos</option>
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

function Barras({ filas, total, vacio }) {
  if (!filas.length) return <p className="adm-vacio">{vacio || 'Sin datos.'}</p>
  const max = Math.max(1, ...filas.map((f) => f.total))
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

function Lista({ titulo, filas, total }) {
  return (
    <section className="adm-tarjeta">
      <h2>{titulo}</h2>
      <Barras filas={filas.filter((f) => f.total)} total={total} vacio="Nadie marcó opciones." />
    </section>
  )
}

function Leyenda({ niveles }) {
  return (
    <ul className="adm-leyenda">
      {niveles.map((n) => (
        <li key={n.valor}>
          <i style={{ background: COLOR_ESCALA[n.valor] }} />
          {n.valor} · {n.corto || n.texto}
        </li>
      ))}
    </ul>
  )
}

function Segmentadas({ items, niveles }) {
  return items.map((i) => (
    <div className="adm-item" key={i.clave}>
      <p>{i.titulo ? `${i.titulo} — ${i.texto}` : i.texto}</p>
      <div className="adm-seg" role="img" aria-label={`Promedio ${fmt(i.promedio)}`}>
        {niveles.map((n) =>
          i.conteo[n.valor] ? (
            <span key={n.valor} style={{ flex: i.conteo[n.valor], background: COLOR_ESCALA[n.valor] }} title={`${n.valor} — ${n.corto || n.texto}: ${i.conteo[n.valor]}`}>
              {pct(i.conteo[n.valor], i.n) >= 9 ? `${pct(i.conteo[n.valor], i.n)}%` : ''}
            </span>
          ) : null,
        )}
      </div>
      <small>
        Promedio <strong>{fmt(i.promedio)}</strong> · {i.n} respuestas{i.conteo.na ? ` · ${i.conteo.na} N/A` : ''}
      </small>
    </div>
  ))
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
            <th>Pert.</th>
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

  const nota = (clave, niveles, na) => {
    const v = f[clave]
    const texto = v === 'N/A' ? na.corto || na.texto : niveles.find((n) => n.valor === v)?.corto || niveles.find((n) => n.valor === v)?.texto || ''
    return (
      <b className={`modal-nota n${v === 'N/A' ? 'a' : v}`} title={texto}>
        {v}
      </b>
    )
  }
  const lista = (titulo, valor, otra) => (
    <p>
      <b>{titulo}:</b> {valor || '—'}
      {otra ? ` (otra: ${otra})` : ''}
    </p>
  )

  return (
    <div className="modal-fondo" onClick={onCerrar} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Respuestas del docente" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-x" onClick={onCerrar} aria-label="Cerrar">
          ✕
        </button>
        <h2>{f.nombre || 'Sin nombre'}</h2>
        <p className="modal-meta">
          {universidadDe(f)} · {f.programa} · {f.municipio}
          <br />
          Vinculación: {f.tiempo} · {fechaCorta(f.timestamp)}
          <br />
          Talleres: {f.talleres}
        </p>
        <div className="adm-bloque">
          <h3>🎯 Pertinencia de los talleres</h3>
          {PERTINENCIA.map((p) => (
            <div className="modal-fila" key={p.clave}>
              <span>{p.texto}</span>
              {nota(p.clave, ESCALA, NA)}
            </div>
          ))}
        </div>
        <div className="adm-bloque">
          <h3>🧠 Apropiación por componente</h3>
          {APROPIACION.map((a) => (
            <div className="modal-fila" key={a.clave}>
              <span>{a.titulo}</span>
              {nota(a.clave, NIVELES, NA_NIVEL)}
            </div>
          ))}
        </div>
        <div className="adm-bloque">
          <h3>🔁 Transferencia a sus clases</h3>
          {lista('Estado de aplicación', f.estado_aplicacion)}
          {lista('Estrategias', f.estrategias)}
          {lista('Dificultades', f.dificultades, f.dificultad_otra)}
          {lista('Evidencias', f.evidencias)}
        </div>
        <div className="adm-bloque">
          <h3>🌱 Pertinencia para el contexto</h3>
          <p>
            <b>Pertinencia de la formación:</b> {PERTINENCIA_GLOBAL.find((g) => g.valor === Number(f.pertinencia_global))?.texto || '—'}
          </p>
          {ABIERTAS.map((p) => (
            <div className="modal-abierta" key={p.clave}>
              <small>{p.texto}</small>
              <p>{f[p.clave] || '—'}</p>
            </div>
          ))}
          {lista('Apoyos', f.apoyos)}
        </div>
      </div>
    </div>
  )
}
