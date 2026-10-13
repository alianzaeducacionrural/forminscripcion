import { useEffect, useMemo, useState } from 'react'
import { getVisitas } from '../api.js'
import Puente from '../components/Puente.jsx'
import { CRITERIOS, RESPUESTAS } from '../data/checklist.js'
import { construirModelo } from './calculos.js'

const ETIQUETA = Object.fromEntries(RESPUESTAS.map((r) => [r.valor, r.etiqueta]))
const SIMBOLO = { SI: '✓', PARCIAL: '◐', NO: '✕', NA: '–' }
const VISTAS = [
  ['resumen', 'Instituciones'],
  ['mapa', 'Mapa de calor'],
  ['criterios', 'Por criterio'],
  ['compromisos', 'Compromisos'],
]

function descargarCSV(nombre, filas) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const texto = '﻿' + filas.map((f) => f.map(esc).join(',')).join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }))
  a.download = nombre
  a.click()
  URL.revokeObjectURL(a.href)
}

function Celda({ valor }) {
  return (
    <span className={`celda celda--${valor ? valor.toLowerCase() : 'vacia'}`} title={valor ? ETIQUETA[valor] : 'Sin visita'}>
      <span aria-hidden="true">{valor ? SIMBOLO[valor] : ''}</span>
      <span className="sr-only">{valor ? ETIQUETA[valor] : 'Sin visita'}</span>
    </span>
  )
}

function Resumen({ modelo, onAbrir }) {
  const visitadas = modelo.porIE.filter((ie) => ie.ultima).length
  const vencidos = modelo.hallazgos.filter((h) => h.vencido).length
  return (
    <>
      <div className="kpis">
        <div className="kpi"><b>{visitadas}/{modelo.porIE.length}</b><span>IE con acompañamiento</span></div>
        <div className="kpi"><b>{modelo.visitas.length}</b><span>acompañamientos registrados</span></div>
        <div className="kpi"><b>{modelo.hallazgos.length}</b><span>acciones de mejora</span></div>
        <div className={`kpi${vencidos ? ' kpi--alerta' : ''}`}><b>{vencidos}</b><span>acciones vencidas</span></div>
      </div>
      <div className="rejilla">
        {modelo.porIE.map((ie) => (
          <button key={ie.nombre} type="button" className="tarjeta-ie" onClick={() => onAbrir(ie.nombre)}>
            <span className="tarjeta-ie__nombre">{ie.nombre}</span>
            <Puente respuestas={ie.ultima?.respuestas} mini titulo={`Puente de ${ie.nombre}`} />
            {ie.ultima ? (
              <span className="tarjeta-ie__pie">
                <strong>{ie.ultima.nivel}</strong>
                <span className="mono">
                  Acompañamiento {ie.ultima.numero} · {ie.indice ?? '—'}%{ie.ultima.cambio != null ? ` (${ie.ultima.cambio >= 0 ? '▲ +' : '▼ '}${ie.ultima.cambio})` : ''} · {ie.ultima.fecha}
                </span>
              </span>
            ) : (
              <span className="tarjeta-ie__pie"><strong>Sin acompañamiento</strong><span className="mono">pendiente</span></span>
            )}
          </button>
        ))}
      </div>
    </>
  )
}

function Mapa({ modelo, onAbrir }) {
  return (
    <div className="tabla-scroll">
      <table className="mapa">
        <caption className="sr-only">Respuesta del acompañamiento elegido, por criterio e institución</caption>
        <thead>
          <tr>
            <th scope="col">Criterio</th>
            {modelo.porIE.map((ie) => (
              <th key={ie.nombre} scope="col" className="mapa__ie">
                <button type="button" onClick={() => onAbrir(ie.nombre)}>{ie.nombre}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CRITERIOS.map((c, i) => (
            <tr key={c.clave}>
              <th scope="row"><span className="mono">{i + 1}</span> {c.componente}</th>
              {modelo.porIE.map((ie) => (
                <td key={ie.nombre}><Celda valor={ie.ultima?.respuestas[c.clave]} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PorCriterio({ modelo }) {
  return (
    <ul className="barras">
      {[...modelo.porCriterio]
        .sort((a, b) => b.cuenta.NO + b.cuenta.PARCIAL * 0.5 - (a.cuenta.NO + a.cuenta.PARCIAL * 0.5))
        .map((c) => (
          <li key={c.clave}>
            <span className="barras__nombre">{c.componente}</span>
            <span className="barras__barra" role="img"
              aria-label={`${c.cuenta.SI} sí, ${c.cuenta.PARCIAL} parcial, ${c.cuenta.NO} no, ${c.cuenta.NA} no aplica`}>
              {['SI', 'PARCIAL', 'NO', 'NA'].map((k) => c.cuenta[k] > 0 && (
                <span key={k} className={`seg seg--${k.toLowerCase()}`} style={{ flex: c.cuenta[k] }}>{c.cuenta[k]}</span>
              ))}
            </span>
          </li>
        ))}
    </ul>
  )
}

function Compromisos({ modelo }) {
  const [ie, setIe] = useState('')
  const [soloVencidos, setSoloVencidos] = useState(false)
  const filas = modelo.hallazgos
    .filter((h) => (!ie || h.institucion === ie) && (!soloVencidos || h.vencido))
    .sort((a, b) => (a.fecha || '9999').localeCompare(b.fecha || '9999'))
  return (
    <>
      <div className="filtros">
        <select aria-label="Institución" value={ie} onChange={(e) => setIe(e.target.value)}>
          <option value="">Todas las instituciones</option>
          {modelo.porIE.map((x) => <option key={x.nombre}>{x.nombre}</option>)}
        </select>
        <label className="check"><input type="checkbox" checked={soloVencidos} onChange={(e) => setSoloVencidos(e.target.checked)} /> Solo vencidas</label>
        <button type="button" className="btn btn--suave btn--chico" disabled={!filas.length}
          onClick={() => descargarCSV('compromisos.csv', [
            ['Institución', 'Fecha del acompañamiento', 'Hallazgo', 'Acción de mejora', 'Responsable', 'Fecha de verificación'],
            ...filas.map((h) => [h.institucion, h.fechaVisita, h.hallazgo, h.accion, h.responsable, h.fecha]),
          ])}>
          Descargar CSV
        </button>
      </div>
      {filas.length === 0 ? <p className="vacio">No hay acciones de mejora con estos filtros.</p> : (
        <ul className="compromisos">
          {filas.map((h, i) => (
            <li key={`${h.id}-${i}`} className={h.vencido ? 'compromiso compromiso--vencido' : 'compromiso'}>
              <span className="mono">{h.institucion} · acompañamiento del {h.fechaVisita}</span>
              <p><strong>Hallazgo:</strong> {h.hallazgo}</p>
              <p><strong>Acción:</strong> {h.accion}</p>
              <p className="mono">
                {h.responsable || 'Sin responsable'} · {h.fecha ? `verificar ${h.fecha}` : 'sin fecha'}{h.vencido ? ' · VENCIDA' : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Detalle({ ie, onVolver }) {
  return (
    <section>
      <button type="button" className="btn btn--suave btn--chico" onClick={onVolver}>← Todas las instituciones</button>
      <h2 style={{ margin: '16px 0 4px' }}>{ie.nombre}</h2>
      {ie.visitas.length === 0 && <p className="vacio">Aún no tiene acompañamientos registrados.</p>}
      {ie.visitas.map((v) => (
        <article key={v.id} className="visita">
          <header>
            <h3>Acompañamiento {v.numero} · {v.fecha}</h3>
            <p className="mono">
              Padrino: {v.acompanante} · {v.nivel} · avance {v.indice ?? '—'}%
              {v.cambio != null && ` (${v.cambio >= 0 ? '▲ +' : '▼ '}${v.cambio} pts frente al anterior)`}
            </p>
          </header>
          <Puente respuestas={v.respuestas} titulo={`Puente del acompañamiento ${v.numero}`} />
          <details>
            <summary>Evidencias por criterio</summary>
            <ul className="evid">
              {CRITERIOS.map((c, i) => (
                <li key={c.clave}>
                  <Celda valor={v.respuestas[c.clave]} />
                  <div>
                    <strong>{i + 1}. {c.componente}</strong>
                    {v.evidencias[c.clave] && <p>{v.evidencias[c.clave]}</p>}
                    {v.archivos[c.clave].map((a) => (
                      <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="archivo">📎 {a.nombre}</a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </article>
      ))}
      {ie.hallazgos.length > 0 && (
        <>
          <h3 style={{ margin: '24px 0 8px' }}>Acciones de mejora</h3>
          <Compromisos modelo={{ hallazgos: ie.hallazgos, porIE: [ie] }} />
        </>
      )}
    </section>
  )
}

export default function Admin() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [vista, setVista] = useState('resumen')
  const [abierta, setAbierta] = useState('')
  const [sel, setSel] = useState('ultimo')

  const cargar = () => {
    setError('')
    getVisitas().then(setDatos).catch((e) => setError(e.message))
  }
  useEffect(() => {
    getVisitas().then(setDatos).catch((e) => setError(e.message))
  }, [])

  const modelo = useMemo(() => (datos ? construirModelo(datos, sel) : null), [datos, sel])
  const ie = modelo?.porIE.find((x) => x.nombre === abierta)

  return (
    <div className="adm">
      <header className="adm__cab">
        <div>
          <p className="mono">Protocolo de articulación · Manizales</p>
          <h1>Panel de seguimiento</h1>
        </div>
        <button type="button" className="btn btn--suave btn--chico" onClick={cargar}>Actualizar</button>
      </header>

      {error && <p className="aviso" role="alert">{error}</p>}
      {!modelo && !error && <p className="vacio">Cargando visitas…</p>}

      {modelo && (
        <>
          {!ie && (vista === 'resumen' || vista === 'mapa' || vista === 'criterios') && (
            <label className="filtros">
              Mostrar
              <select value={sel} onChange={(e) => setSel(e.target.value === 'ultimo' ? 'ultimo' : Number(e.target.value))}>
                <option value="ultimo">Último acompañamiento de cada IE</option>
                {Array.from({ length: modelo.maxNumero }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Acompañamiento {i + 1}</option>
                ))}
              </select>
            </label>
          )}
          {!ie && (
            <nav className="pestanas" aria-label="Vistas">
              {VISTAS.map(([id, nombre]) => (
                <button key={id} type="button" aria-current={vista === id ? 'page' : undefined} onClick={() => setVista(id)}>{nombre}</button>
              ))}
            </nav>
          )}
          {ie ? <Detalle ie={ie} onVolver={() => setAbierta('')} /> : (
            <>
              {vista === 'resumen' && <Resumen modelo={modelo} onAbrir={setAbierta} />}
              {vista === 'mapa' && <Mapa modelo={modelo} onAbrir={setAbierta} />}
              {vista === 'criterios' && <PorCriterio modelo={modelo} />}
              {vista === 'compromisos' && <Compromisos modelo={modelo} />}
            </>
          )}
        </>
      )}
    </div>
  )
}
