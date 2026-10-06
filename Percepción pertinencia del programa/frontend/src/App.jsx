import { useEffect, useMemo, useRef, useState } from 'react'
import { enviarEncuesta } from './api.js'
import {
  INSTITUCIONES,
  PROGRAMAS_POR_UNIVERSIDAD,
  UNIVERSIDADES,
} from './data/catalogos.js'
import {
  BLOQUES,
  ESCALA,
  FACTORES,
  INSTRUCCION,
  MAX_FACTORES,
  NA,
  OTRA,
  PREGUNTAS_ABIERTAS,
  PROPOSITO,
  PROYECCIONES,
  VALORACION_GLOBAL,
} from './data/encuesta.js'

const CLAVE_BORRADOR = 'percepcion-pertinencia-borrador'
const TOTAL_ITEMS = BLOQUES.reduce((n, b) => n + b.items.length, 0)

const INICIAL = {
  universidad: '',
  universidadOtra: '',
  programa: '',
  institucion: '',
  respuestas: {},
  valoracionGlobal: '',
  fortaleza: '',
  dificultad: '',
  cambiaria: '',
  mantener: '',
  apoyo: '',
  factores: [],
  factorOtro: '',
  proyeccion: '',
  proyeccionOtra: '',
}

// Pasos: 0 bienvenida · 1 caracterización · 2-6 bloques Likert · 7 valoración global
// · 8 pregunta clave · 9 proyección.
const PASOS = [
  { id: 'inicio', titulo: 'Bienvenida', emoji: '👋' },
  { id: 'caracterizacion', titulo: 'Caracterización', emoji: '🪪' },
  ...BLOQUES.map((b) => ({ id: b.id, titulo: b.titulo, emoji: b.emoji })),
  { id: 'global', titulo: 'Valoración global', emoji: '⭐' },
  { id: 'clave', titulo: 'Lo que más pesa', emoji: '🧭' },
  { id: 'proyeccion', titulo: 'Tu futuro', emoji: '🚀' },
]
const ULTIMO = PASOS.length - 1

function leerBorrador() {
  try {
    const crudo = localStorage.getItem(CLAVE_BORRADOR)
    if (!crudo) return { datos: INICIAL, paso: 0, idEnvio: crypto.randomUUID() }
    const { datos, paso, idEnvio } = JSON.parse(crudo)
    return { datos: { ...INICIAL, ...datos }, paso: paso ?? 0, idEnvio: idEnvio || crypto.randomUUID() }
  } catch {
    return { datos: INICIAL, paso: 0, idEnvio: crypto.randomUUID() }
  }
}

function validarPaso(paso, d) {
  const e = {}
  const id = PASOS[paso].id
  if (id === 'caracterizacion') {
    if (!d.universidad) e.universidad = 'Elige tu universidad.'
    if (d.universidad === OTRA && !d.universidadOtra.trim()) e.universidadOtra = 'Escribe el nombre de tu universidad.'
    if (!d.programa.trim()) e.programa = d.universidad === OTRA ? 'Escribe tu programa.' : 'Elige tu programa.'
    if (!d.institucion) e.institucion = 'Elige tu institución educativa.'
  }
  const bloque = BLOQUES.find((b) => b.id === id)
  if (bloque) {
    for (const item of bloque.items) {
      if (d.respuestas[item.clave] == null) e[item.clave] = 'Elige una opción.'
    }
  }
  if (id === 'global' && !d.valoracionGlobal) e.valoracionGlobal = 'Elige una valoración.'
  if (id === 'clave') {
    if (d.factores.length === 0) e.factores = 'Elige al menos una opción (o "Ninguna").'
    if (d.factores.includes(OTRA) && !d.factorOtro.trim()) e.factorOtro = 'Cuéntanos cuál es.'
  }
  if (id === 'proyeccion') {
    if (!d.proyeccion) e.proyeccion = 'Elige una opción.'
    if (d.proyeccion === OTRA && !d.proyeccionOtra.trim()) e.proyeccionOtra = 'Cuéntanos qué esperas hacer.'
  }
  return e
}

export default function App() {
  const [inicio] = useState(leerBorrador)
  const [datos, setDatos] = useState(inicio.datos)
  const [paso, setPaso] = useState(inicio.paso)
  const [idEnvio] = useState(inicio.idEnvio)
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('editando') // editando | enviando | enviado
  const [errorEnvio, setErrorEnvio] = useState('')
  const tope = useRef(null)

  useEffect(() => {
    if (estado === 'enviado') return
    try {
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ datos, paso, idEnvio }))
    } catch {
      /* sin almacenamiento: el formulario funciona igual */
    }
  }, [datos, paso, idEnvio, estado])

  const respondidas = useMemo(
    () => BLOQUES.reduce((n, b) => n + b.items.filter((i) => datos.respuestas[i.clave] != null).length, 0),
    [datos.respuestas],
  )
  const progreso = estado === 'enviado' ? 100 : Math.round((paso / PASOS.length) * 100)

  const poner = (campo, valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }))
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e))
  }
  const ponerRespuesta = (clave, valor) => {
    setDatos((d) => ({ ...d, respuestas: { ...d.respuestas, [clave]: valor } }))
    setErrores((e) => (e[clave] ? { ...e, [clave]: undefined } : e))
  }

  const irA = (nuevo) => {
    setPaso(nuevo)
    setErrores({})
    setErrorEnvio('')
    requestAnimationFrame(() => tope.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const enfocarPrimerError = (e) => {
    requestAnimationFrame(() => {
      const claves = Object.keys(e).filter((k) => e[k])
      const nodo = document.querySelector(`[data-campo="${claves[0]}"]`)
      nodo?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const siguiente = async () => {
    const e = validarPaso(paso, datos)
    if (Object.keys(e).length) {
      setErrores(e)
      enfocarPrimerError(e)
      return
    }
    if (paso < ULTIMO) return irA(paso + 1)
    setEstado('enviando')
    setErrorEnvio('')
    try {
      await enviarEncuesta({
        idEnvio,
        universidad: datos.universidad,
        universidadOtra: datos.universidadOtra,
        programa: datos.programa,
        institucion: datos.institucion,
        respuestas: datos.respuestas,
        valoracionGlobal: datos.valoracionGlobal,
        fortaleza: datos.fortaleza,
        dificultad: datos.dificultad,
        cambiaria: datos.cambiaria,
        mantener: datos.mantener,
        apoyo: datos.apoyo,
        factores: datos.factores,
        factorOtro: datos.factorOtro,
        proyeccion: datos.proyeccion,
        proyeccionOtra: datos.proyeccionOtra,
      })
      try {
        localStorage.removeItem(CLAVE_BORRADOR)
      } catch {
        /* nada */
      }
      setEstado('enviado')
      requestAnimationFrame(() => tope.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch (err) {
      setEstado('editando')
      setErrorEnvio(err.message)
    }
  }

  const id = PASOS[paso].id
  const bloque = BLOQUES.find((b) => b.id === id)

  return (
    <div className="app">
      <Fondo />
      <header className="cabecera" ref={tope}>
        <span className="sello">La Universidad en el Campo</span>
        <h1>
          Tu voz <em>cuenta</em>
        </h1>
        <p className="subtitulo">Encuesta de valoración del Programa Técnico Profesional</p>
      </header>

      {estado !== 'enviado' && (
        <nav className="progreso" aria-label="Progreso de la encuesta">
          <div className="barra" role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100}>
            <div className="barra-relleno" style={{ width: `${progreso}%` }} />
            <span className="barra-brote" style={{ left: `${progreso}%` }} aria-hidden="true">
              🌱
            </span>
          </div>
          <div className="progreso-texto">
            <span>
              {PASOS[paso].emoji} {PASOS[paso].titulo}
            </span>
            <span>
              Paso {paso + 1} de {PASOS.length}
            </span>
          </div>
        </nav>
      )}

      <main className="lienzo" key={estado === 'enviado' ? 'fin' : paso}>
        {estado === 'enviado' && <Gracias />}

        {estado !== 'enviado' && id === 'inicio' && <Bienvenida />}

        {estado !== 'enviado' && id === 'caracterizacion' && (
          <Caracterizacion datos={datos} poner={poner} errores={errores} setDatos={setDatos} />
        )}

        {estado !== 'enviado' && bloque && (
          <section className="tarjeta">
            <h2 className="titulo-seccion">
              <span className="titulo-emoji">{bloque.emoji}</span> {bloque.titulo}
            </h2>
            <p className="ayuda">¿Qué tan de acuerdo estás con las siguientes afirmaciones?</p>
            <div className="contador-bloque">
              <strong>{respondidas}</strong> de {TOTAL_ITEMS} respondidas
            </div>
            <ol className="afirmaciones">
              {bloque.items.map((item, i) => (
                <Afirmacion
                  key={item.clave}
                  item={item}
                  valor={datos.respuestas[item.clave]}
                  error={errores[item.clave]}
                  onChange={(v) => {
                    ponerRespuesta(item.clave, v)
                    const sig = bloque.items[i + 1]
                    if (sig && datos.respuestas[sig.clave] == null) {
                      setTimeout(
                        () =>
                          document
                            .querySelector(`[data-campo="${sig.clave}"]`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                        260,
                      )
                    }
                  }}
                />
              ))}
            </ol>
          </section>
        )}

        {estado !== 'enviado' && id === 'global' && (
          <Global datos={datos} poner={poner} errores={errores} />
        )}
        {estado !== 'enviado' && id === 'clave' && <Clave datos={datos} poner={poner} errores={errores} />}
        {estado !== 'enviado' && id === 'proyeccion' && (
          <Proyeccion datos={datos} poner={poner} errores={errores} />
        )}

        {errorEnvio && (
          <div className="alerta" role="alert">
            {errorEnvio}
          </div>
        )}

        {estado !== 'enviado' && (
          <div className="acciones">
            {paso > 0 && (
              <button type="button" className="btn btn-secundario" onClick={() => irA(paso - 1)} disabled={estado === 'enviando'}>
                ← Atrás
              </button>
            )}
            <button type="button" className="btn btn-primario" onClick={siguiente} disabled={estado === 'enviando'}>
              {estado === 'enviando'
                ? 'Enviando…'
                : paso === 0
                  ? 'Empezar →'
                  : paso === ULTIMO
                    ? 'Enviar mi opinión 🎉'
                    : 'Siguiente →'}
            </button>
          </div>
        )}
      </main>

      <footer className="pie">La Universidad en el Campo · Iniciativa Comunidades de Cambio</footer>
    </div>
  )
}

function Fondo() {
  return (
    <div className="fondo" aria-hidden="true">
      <span className="forma f1" />
      <span className="forma f2" />
      <span className="forma f3" />
      <span className="forma f4" />
    </div>
  )
}

function Bienvenida() {
  return (
    <section className="tarjeta bienvenida">
      <h2 className="titulo-seccion">¡Hola! 👋 Queremos escucharte</h2>
      <div className="bloque-texto">
        <h3>Propósito</h3>
        <p>{PROPOSITO}</p>
      </div>
      <div className="bloque-texto destacado">
        <h3>Antes de empezar</h3>
        <p>{INSTRUCCION}</p>
      </div>
      <h3 className="mini-titulo">Escala de valoración</h3>
      <ul className="leyenda">
        {ESCALA.map((e) => (
          <li key={e.valor}>
            <span className={`ficha ficha-${e.valor}`}>{e.valor}</span>
            <span>{e.texto}</span>
          </li>
        ))}
        <li>
          <span className="ficha ficha-na">N/A</span>
          <span>{NA.texto}</span>
        </li>
      </ul>
    </section>
  )
}

function Selector({ etiqueta, campo, valor, onChange, opciones, deshabilitado, ayuda, error, placeholder }) {
  return (
    <div className={`campo ${error ? 'con-error' : ''}`} data-campo={campo}>
      <label htmlFor={campo}>{etiqueta}</label>
      <div className={`select-envoltura ${deshabilitado ? 'inactivo' : ''} ${valor ? 'lleno' : ''}`}>
        <select id={campo} value={valor} disabled={deshabilitado} onChange={(e) => onChange(e.target.value)}>
          <option value="">{deshabilitado ? ayuda : placeholder}</option>
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

function Caracterizacion({ datos, poner, errores, setDatos }) {
  const esOtra = datos.universidad === OTRA
  const programas = PROGRAMAS_POR_UNIVERSIDAD[datos.universidad] || []

  return (
    <section className="tarjeta">
      <h2 className="titulo-seccion">
        <span className="titulo-emoji">🪪</span> Cuéntanos de ti
      </h2>
      <p className="ayuda">Elige en orden: cada lista se ajusta según lo que vayas escogiendo.</p>

      <div className="grupo">
        <div className="grupo-etiqueta">🎓 Tu formación</div>
        <Selector
          etiqueta="Universidad"
          campo="universidad"
          valor={datos.universidad}
          placeholder="Selecciona tu universidad"
          opciones={[...UNIVERSIDADES, OTRA]}
          error={errores.universidad}
          onChange={(v) => setDatos((d) => ({ ...d, universidad: v, programa: '', universidadOtra: '' }))}
        />
        {esOtra ? (
          <>
            <Texto etiqueta="¿Cuál universidad?" campo="universidadOtra" valor={datos.universidadOtra} poner={poner} error={errores.universidadOtra} />
            <Texto etiqueta="Programa técnico profesional" campo="programa" valor={datos.programa} poner={poner} error={errores.programa} />
          </>
        ) : (
          <Selector
            etiqueta="Programa técnico profesional"
            campo="programa"
            valor={datos.programa}
            placeholder="Selecciona tu programa"
            ayuda="Primero elige tu universidad"
            deshabilitado={!datos.universidad}
            opciones={programas}
            error={errores.programa}
            onChange={(v) => poner('programa', v)}
          />
        )}
      </div>

      <div className="grupo">
        <div className="grupo-etiqueta">📍 Tu colegio</div>
        <Selector
          etiqueta="Institución educativa"
          campo="institucion"
          valor={datos.institucion}
          placeholder="Selecciona tu institución"
          opciones={INSTITUCIONES}
          error={errores.institucion}
          onChange={(v) => poner('institucion', v)}
        />
      </div>
    </section>
  )
}

function Texto({ etiqueta, campo, valor, poner, error }) {
  return (
    <div className={`campo ${error ? 'con-error' : ''}`} data-campo={campo}>
      <label htmlFor={campo}>{etiqueta}</label>
      <input id={campo} type="text" maxLength={200} value={valor} onChange={(e) => poner(campo, e.target.value)} />
      {error && <p className="error">{error}</p>}
    </div>
  )
}

function Afirmacion({ item, valor, error, onChange }) {
  const seleccionada = ESCALA.find((e) => e.valor === valor)
  return (
    <li className={`afirmacion ${valor != null ? 'respondida' : ''} ${error ? 'con-error' : ''}`} data-campo={item.clave}>
      <p className="afirmacion-texto">{item.texto}</p>
      <div className="escala" role="radiogroup" aria-label={item.texto}>
        {ESCALA.map((e) => (
          <button
            key={e.valor}
            type="button"
            role="radio"
            aria-checked={valor === e.valor}
            aria-label={`${e.valor} — ${e.texto}`}
            className={`opcion op-${e.valor} ${valor === e.valor ? 'activa' : ''}`}
            onClick={() => onChange(e.valor)}
          >
            <span className="op-emoji">{e.emoji}</span>
            <span className="op-num">{e.valor}</span>
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={valor === NA.valor}
          aria-label={`N/A — ${NA.texto}`}
          className={`opcion op-na ${valor === NA.valor ? 'activa' : ''}`}
          onClick={() => onChange(NA.valor)}
        >
          N/A
        </button>
      </div>
      <p className="escala-lectura" aria-live="polite">
        {valor === NA.valor ? NA.texto : seleccionada ? seleccionada.texto : 'Toca una carita'}
      </p>
      {error && <p className="error">{error}</p>}
    </li>
  )
}

function Global({ datos, poner, errores }) {
  return (
    <section className="tarjeta">
      <h2 className="titulo-seccion">
        <span className="titulo-emoji">⭐</span> Valoración global
      </h2>
      <div className={`campo ${errores.valoracionGlobal ? 'con-error' : ''}`} data-campo="valoracionGlobal">
        <p className="pregunta">
          En términos generales, ¿cómo valoras el programa técnico profesional que estás cursando?
        </p>
        <div className="global" role="radiogroup">
          {VALORACION_GLOBAL.map((v, i) => (
            <button
              key={v.valor}
              type="button"
              role="radio"
              aria-checked={datos.valoracionGlobal === v.valor}
              className={`global-op op-${i + 1} ${datos.valoracionGlobal === v.valor ? 'activa' : ''}`}
              onClick={() => poner('valoracionGlobal', v.valor)}
            >
              <span className="global-emoji">{v.emoji}</span>
              <span>{v.valor}</span>
            </button>
          ))}
        </div>
        {errores.valoracionGlobal && <p className="error">{errores.valoracionGlobal}</p>}
      </div>

      <h3 className="mini-titulo">Cuéntanos más (opcional)</h3>
      {PREGUNTAS_ABIERTAS.map((p) => (
        <div className="campo" key={p.clave}>
          <label htmlFor={p.clave}>{p.texto}</label>
          <textarea
            id={p.clave}
            rows={3}
            maxLength={2000}
            value={datos[p.clave]}
            onChange={(e) => poner(p.clave, e.target.value)}
          />
        </div>
      ))}
    </section>
  )
}

function Clave({ datos, poner, errores }) {
  const lleno = datos.factores.length >= MAX_FACTORES
  const alternar = (f) => {
    const actual = datos.factores
    if (actual.includes(f)) return poner('factores', actual.filter((x) => x !== f))
    if (f === 'Ninguna') return poner('factores', ['Ninguna'])
    if (actual.length >= MAX_FACTORES) return
    poner('factores', [...actual.filter((x) => x !== 'Ninguna'), f])
  }
  return (
    <section className="tarjeta">
      <h2 className="titulo-seccion">
        <span className="titulo-emoji">🧭</span> Lo que más pesa
      </h2>
      <div className={`campo ${errores.factores ? 'con-error' : ''}`} data-campo="factores">
        <p className="pregunta">
          De las siguientes situaciones, ¿cuáles están afectando actualmente tu experiencia o permanencia en el programa?
        </p>
        <p className={`contador-chips ${lleno ? 'lleno' : ''}`}>
          Puedes seleccionar máximo tres · <strong>{datos.factores.filter((f) => f !== 'Ninguna').length}/{MAX_FACTORES}</strong>
        </p>
        <div className="chips">
          {FACTORES.map((f) => {
            const activo = datos.factores.includes(f)
            const bloqueado = !activo && f !== 'Ninguna' && lleno
            return (
              <button
                key={f}
                type="button"
                aria-pressed={activo}
                disabled={bloqueado}
                className={`chip ${activo ? 'activo' : ''}`}
                onClick={() => alternar(f)}
              >
                {activo && <span aria-hidden="true">✓ </span>}
                {f}
              </button>
            )
          })}
        </div>
        {errores.factores && <p className="error">{errores.factores}</p>}
      </div>
      {datos.factores.includes(OTRA) && (
        <Texto etiqueta="¿Cuál otra situación?" campo="factorOtro" valor={datos.factorOtro} poner={poner} error={errores.factorOtro} />
      )}
    </section>
  )
}

function Proyeccion({ datos, poner, errores }) {
  return (
    <section className="tarjeta">
      <h2 className="titulo-seccion">
        <span className="titulo-emoji">🚀</span> Tu futuro
      </h2>
      <div className={`campo ${errores.proyeccion ? 'con-error' : ''}`} data-campo="proyeccion">
        <p className="pregunta">Al finalizar el programa técnico profesional, ¿qué esperas hacer principalmente?</p>
        <div className="opciones-lista" role="radiogroup">
          {PROYECCIONES.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={datos.proyeccion === p}
              className={`opcion-lista ${datos.proyeccion === p ? 'activa' : ''}`}
              onClick={() => poner('proyeccion', p)}
            >
              <span className="marca" aria-hidden="true" />
              {p}
            </button>
          ))}
        </div>
        {errores.proyeccion && <p className="error">{errores.proyeccion}</p>}
      </div>
      {datos.proyeccion === OTRA && (
        <Texto etiqueta="¿Qué esperas hacer?" campo="proyeccionOtra" valor={datos.proyeccionOtra} poner={poner} error={errores.proyeccionOtra} />
      )}
    </section>
  )
}

function Gracias() {
  return (
    <section className="tarjeta gracias">
      <div className="confeti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ '--i': i }} />
        ))}
      </div>
      <div className="gracias-emoji" aria-hidden="true">
        🌱
      </div>
      <h2 className="titulo-seccion">¡Gracias por tu opinión!</h2>
      <p>
        Tus respuestas llegaron bien. Con ellas vamos a fortalecer el programa para que cada vez responda mejor a lo que
        necesitas en tu territorio.
      </p>
      <p className="gracias-firma">Ya puedes cerrar esta página.</p>
    </section>
  )
}
