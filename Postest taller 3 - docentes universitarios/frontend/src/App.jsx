import { useEffect, useRef, useState } from 'react'
import { enviarEncuesta } from './api.js'
import { MUNICIPIOS, PROGRAMAS_POR_UNIVERSIDAD, UNIVERSIDADES } from './data/catalogos.js'
import {
  ABIERTAS,
  APOYOS,
  APROPIACION,
  DIFICULTADES,
  ESCALA,
  ESTADOS_APLICACION,
  ESTRATEGIAS,
  EVIDENCIAS,
  INSTRUCCION_APROPIACION,
  INSTRUCCION_PERTINENCIA,
  NA,
  NA_NIVEL,
  NIVELES,
  OBJETIVO,
  OTRA,
  PERTINENCIA,
  PERTINENCIA_GLOBAL,
  POBLACION,
  TALLERES,
  TIEMPOS,
} from './data/encuesta.js'

const CLAVE_BORRADOR = 'postest-taller-3-docentes-borrador'

const INICIAL = {
  nombre: '',
  municipio: '',
  universidad: '',
  universidadOtra: '',
  programa: '',
  tiempo: '',
  talleres: [],
  respuestas: {},
  estado: '',
  estrategias: [],
  dificultades: [],
  dificultadOtra: '',
  evidencias: [],
  pertinenciaGlobal: null,
  aporte: '',
  ajustar: '',
  apoyos: [],
}

const PASOS = [
  { id: 'inicio', titulo: 'Bienvenida', emoji: '👋' },
  { id: 'identificacion', titulo: 'Identificación', emoji: '🪪' },
  { id: 'pertinencia', titulo: 'Pertinencia de los talleres', emoji: '🎯' },
  { id: 'apropiacion', titulo: 'Apropiación de los aprendizajes', emoji: '🧠' },
  { id: 'transferencia', titulo: 'Transferencia a mis clases', emoji: '🔁' },
  { id: 'contexto', titulo: 'Pertinencia para el contexto', emoji: '🌱' },
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
  if (id === 'identificacion') {
    if (d.nombre.trim().length < 3) e.nombre = 'Escriba su nombre completo.'
    if (!d.municipio) e.municipio = 'Elija su municipio.'
    if (!d.universidad) e.universidad = 'Elija su institución o universidad.'
    if (d.universidad === OTRA && !d.universidadOtra.trim()) e.universidadOtra = 'Escriba el nombre de su institución.'
    if (!d.programa.trim()) e.programa = d.universidad === OTRA ? 'Escriba su programa académico.' : 'Elija su programa académico.'
    if (!d.tiempo) e.tiempo = 'Elija una opción.'
    if (!d.talleres.length) e.talleres = 'Elija al menos un taller.'
  }
  if (id === 'pertinencia') {
    for (const p of PERTINENCIA) if (d.respuestas[p.clave] == null) e[p.clave] = 'Elija una opción.'
  }
  if (id === 'apropiacion') {
    for (const a of APROPIACION) if (d.respuestas[a.clave] == null) e[a.clave] = 'Elija una opción.'
  }
  if (id === 'transferencia') {
    if (!d.estado) e.estado = 'Elija una opción.'
    if (!d.estrategias.length) e.estrategias = 'Elija al menos una opción.'
    if (!d.dificultades.length) e.dificultades = 'Elija al menos una opción.'
    if (d.dificultades.includes(OTRA) && !d.dificultadOtra.trim()) e.dificultadOtra = 'Cuéntenos cuál es.'
    if (!d.evidencias.length) e.evidencias = 'Elija al menos una opción.'
  }
  if (id === 'contexto') {
    if (d.pertinenciaGlobal == null) e.pertinenciaGlobal = 'Elija una opción.'
    if (!d.apoyos.length) e.apoyos = 'Elija al menos una opción.'
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

  const siguiente = async () => {
    const e = validarPaso(paso, datos)
    if (Object.keys(e).length) {
      setErrores(e)
      requestAnimationFrame(() => {
        const primero = Object.keys(e).find((k) => e[k])
        document.querySelector(`[data-campo="${primero}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    if (paso < ULTIMO) return irA(paso + 1)
    setEstado('enviando')
    setErrorEnvio('')
    try {
      await enviarEncuesta({ idEnvio, ...datos })
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
  const activo = estado !== 'enviado'

  return (
    <div className="app">
      <div className="fondo" aria-hidden="true">
        <span className="forma f1" />
        <span className="forma f2" />
        <span className="forma f3" />
        <span className="forma f4" />
      </div>
      <header className="cabecera" ref={tope}>
        <span className="sello">La Universidad en el Campo</span>
        <h1>
          Prueba de <em>salida</em>
        </h1>
        <p className="subtitulo">Formación de docentes universitarios · Seguimiento a la pertinencia, apropiación y aplicación de los aprendizajes</p>
      </header>

      {activo && (
        <nav className="progreso" aria-label="Progreso del formulario">
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

      <main className="lienzo" key={activo ? paso : 'fin'}>
        {!activo && <Gracias />}
        {activo && id === 'inicio' && <Bienvenida />}
        {activo && id === 'identificacion' && (
          <Identificacion datos={datos} poner={poner} errores={errores} setDatos={setDatos} setErrores={setErrores} />
        )}
        {activo && id === 'pertinencia' && (
          <Seccion emoji="🎯" titulo="Valoración de la pertinencia de los talleres" ayuda={INSTRUCCION_PERTINENCIA}>
            <ol className="afirmaciones">
              {PERTINENCIA.map((p) => (
                <Escala
                  key={p.clave}
                  clave={p.clave}
                  texto={p.texto}
                  niveles={ESCALA}
                  na={NA}
                  valor={datos.respuestas[p.clave]}
                  error={errores[p.clave]}
                  onChange={(v) => ponerRespuesta(p.clave, v)}
                />
              ))}
            </ol>
          </Seccion>
        )}
        {activo && id === 'apropiacion' && (
          <Seccion emoji="🧠" titulo="Apropiación de los aprendizajes por componente" ayuda={INSTRUCCION_APROPIACION}>
            <ul className="leyenda">
              {NIVELES.map((n) => (
                <li key={n.valor}>
                  <span className={`ficha ficha-${n.valor}`}>{n.valor}</span>
                  <span>{n.texto}</span>
                </li>
              ))}
              <li>
                <span className="ficha ficha-na">N/A</span>
                <span>{NA_NIVEL.texto}</span>
              </li>
            </ul>
            <ol className="afirmaciones">
              {APROPIACION.map((a) => (
                <Escala
                  key={a.clave}
                  clave={a.clave}
                  titulo={a.titulo}
                  texto={a.texto}
                  niveles={NIVELES}
                  na={NA_NIVEL}
                  valor={datos.respuestas[a.clave]}
                  error={errores[a.clave]}
                  onChange={(v) => ponerRespuesta(a.clave, v)}
                />
              ))}
            </ol>
          </Seccion>
        )}
        {activo && id === 'transferencia' && (
          <Seccion emoji="🔁" titulo="Transferencia de los aprendizajes a las clases universitarias">
            <Unica
              campo="estado"
              pregunta="4.1. ¿En qué estado se encuentra la aplicación de los aprendizajes de los talleres en mis clases?"
              opciones={ESTADOS_APLICACION}
              valor={datos.estado}
              error={errores.estado}
              onChange={(v) => poner('estado', v)}
            />
            <Multiple
              campo="estrategias"
              pregunta="4.2. ¿Qué estrategias ha aplicado o proyecta aplicar?"
              lista={ESTRATEGIAS}
              datos={datos}
              poner={poner}
              error={errores.estrategias}
            />
            <Multiple
              campo="dificultades"
              pregunta="4.3. ¿Qué dificultades limitan o podrían limitar la aplicación de los aprendizajes vistos en los talleres?"
              lista={DIFICULTADES}
              datos={datos}
              poner={poner}
              error={errores.dificultades}
            />
            {datos.dificultades.includes(OTRA) && (
              <Texto etiqueta="¿Cuál otra dificultad?" campo="dificultadOtra" valor={datos.dificultadOtra} poner={poner} error={errores.dificultadOtra} />
            )}
            <Multiple
              campo="evidencias"
              pregunta="4.4. ¿Qué evidencia podría aportar para documentar la aplicación?"
              lista={EVIDENCIAS}
              datos={datos}
              poner={poner}
              error={errores.evidencias}
            />
          </Seccion>
        )}
        {activo && id === 'contexto' && (
          <Seccion emoji="🌱" titulo="Pertinencia para el contexto de La Universidad en el Campo">
            <div className={`campo ${errores.pertinenciaGlobal ? 'con-error' : ''}`} data-campo="pertinenciaGlobal">
              <p className="pregunta">5.1. ¿Qué tan pertinente considera la formación para fortalecer sus clases en el programa?</p>
              <div className="global" role="radiogroup">
                {PERTINENCIA_GLOBAL.map((v) => (
                  <button
                    key={v.valor}
                    type="button"
                    role="radio"
                    aria-checked={datos.pertinenciaGlobal === v.valor}
                    className={`global-op op-${v.valor} ${datos.pertinenciaGlobal === v.valor ? 'activa' : ''}`}
                    onClick={() => poner('pertinenciaGlobal', v.valor)}
                  >
                    <span className="global-emoji">{v.emoji}</span>
                    <span>
                      {v.valor} — {v.texto}
                    </span>
                  </button>
                ))}
              </div>
              {errores.pertinenciaGlobal && <p className="error">{errores.pertinenciaGlobal}</p>}
            </div>
            {ABIERTAS.map((p, i) => (
              <div className="campo" key={p.clave}>
                <label htmlFor={p.clave}>
                  5.{i + 2}. {p.texto} <small>(opcional)</small>
                </label>
                <textarea id={p.clave} rows={3} maxLength={2000} value={datos[p.clave]} onChange={(e) => poner(p.clave, e.target.value)} />
              </div>
            ))}
            <Multiple
              campo="apoyos"
              pregunta="5.4. ¿Qué apoyo facilitaría la incorporación de los aprendizajes en sus clases?"
              lista={APOYOS}
              datos={datos}
              poner={poner}
              error={errores.apoyos}
            />
          </Seccion>
        )}

        {errorEnvio && (
          <div className="alerta" role="alert">
            {errorEnvio}
          </div>
        )}

        {activo && (
          <div className="acciones">
            {paso > 0 && (
              <button type="button" className="btn btn-secundario" onClick={() => irA(paso - 1)} disabled={estado === 'enviando'}>
                ← Atrás
              </button>
            )}
            <button type="button" className="btn btn-primario" onClick={siguiente} disabled={estado === 'enviando'}>
              {estado === 'enviando' ? 'Enviando…' : paso === 0 ? 'Empezar →' : paso === ULTIMO ? 'Enviar mis respuestas 🎉' : 'Siguiente →'}
            </button>
          </div>
        )}
      </main>

      <footer className="pie">La Universidad en el Campo · Iniciativa Comunidades de Cambio</footer>
    </div>
  )
}

function Bienvenida() {
  return (
    <section className="tarjeta bienvenida">
      <h2 className="titulo-seccion">¡Bienvenido(a)! 👋</h2>
      <div className="bloque-texto">
        <h3>Objetivo del instrumento</h3>
        <p>{OBJETIVO}</p>
      </div>
      <div className="bloque-texto destacado">
        <h3>Población</h3>
        <p>{POBLACION}</p>
      </div>
    </section>
  )
}

function Seccion({ emoji, titulo, ayuda, children }) {
  return (
    <section className="tarjeta">
      <h2 className="titulo-seccion">
        <span className="titulo-emoji">{emoji}</span> {titulo}
      </h2>
      {ayuda && <p className="ayuda">Instrucción: {ayuda}</p>}
      {children}
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

function Texto({ etiqueta, campo, valor, poner, error }) {
  return (
    <div className={`campo ${error ? 'con-error' : ''}`} data-campo={campo}>
      <label htmlFor={campo}>{etiqueta}</label>
      <input id={campo} type="text" maxLength={200} value={valor} onChange={(e) => poner(campo, e.target.value)} />
      {error && <p className="error">{error}</p>}
    </div>
  )
}

function Identificacion({ datos, poner, errores, setDatos, setErrores }) {
  const esOtra = datos.universidad === OTRA
  return (
    <Seccion emoji="🪪" titulo="Identificación" ayuda="Diligenciar antes de iniciar la evaluación.">
      <Texto etiqueta="Nombre completo" campo="nombre" valor={datos.nombre} poner={poner} error={errores.nombre} />
      <Selector
        etiqueta="Municipio"
        campo="municipio"
        valor={datos.municipio}
        placeholder="Seleccione su municipio"
        opciones={MUNICIPIOS}
        error={errores.municipio}
        onChange={(v) => poner('municipio', v)}
      />
      <Selector
        etiqueta="Institución o universidad"
        campo="universidad"
        valor={datos.universidad}
        placeholder="Seleccione su institución o universidad"
        opciones={[...UNIVERSIDADES, OTRA]}
        error={errores.universidad}
        onChange={(v) => {
          setDatos((d) => ({ ...d, universidad: v, programa: '', universidadOtra: '' }))
          setErrores((e) => ({ ...e, universidad: undefined, programa: undefined, universidadOtra: undefined }))
        }}
      />
      {esOtra ? (
        <>
          <Texto etiqueta="¿Cuál institución o universidad?" campo="universidadOtra" valor={datos.universidadOtra} poner={poner} error={errores.universidadOtra} />
          <Texto etiqueta="Programa académico" campo="programa" valor={datos.programa} poner={poner} error={errores.programa} />
        </>
      ) : (
        <Selector
          etiqueta="Programa académico"
          campo="programa"
          valor={datos.programa}
          placeholder="Seleccione su programa"
          ayuda="Primero elija su institución o universidad"
          deshabilitado={!datos.universidad}
          opciones={PROGRAMAS_POR_UNIVERSIDAD[datos.universidad] || []}
          error={errores.programa}
          onChange={(v) => poner('programa', v)}
        />
      )}
      <Unica
        campo="tiempo"
        pregunta="Tiempo de vinculación al programa"
        opciones={TIEMPOS}
        valor={datos.tiempo}
        error={errores.tiempo}
        onChange={(v) => poner('tiempo', v)}
      />
      <Multiple
        campo="talleres"
        pregunta="Talleres en los que participó"
        lista={{ ninguna: null, opciones: TALLERES }}
        datos={datos}
        poner={poner}
        error={errores.talleres}
      />
    </Seccion>
  )
}

/** Escala de 5 niveles + N/A. `niveles`/`na` cambian entre acuerdo (ESCALA) y apropiación (NIVELES). */
function Escala({ clave, titulo, texto, niveles, na, valor, error, onChange }) {
  const elegido = niveles.find((n) => n.valor === valor)
  const lectura = valor === na.valor ? na.corto || na.texto : elegido ? elegido.corto || elegido.texto : 'Toque una carita'
  return (
    <li className={`afirmacion ${valor != null ? 'respondida' : ''} ${error ? 'con-error' : ''}`} data-campo={clave}>
      {titulo && <h3 className="mini-titulo">{titulo}</h3>}
      <p className="afirmacion-texto">{texto}</p>
      <div className="escala" role="radiogroup" aria-label={texto}>
        {niveles.map((n) => (
          <button
            key={n.valor}
            type="button"
            role="radio"
            aria-checked={valor === n.valor}
            aria-label={`${n.valor} — ${n.corto || n.texto}`}
            className={`opcion op-${n.valor} ${valor === n.valor ? 'activa' : ''}`}
            onClick={() => onChange(n.valor)}
          >
            <span className="op-emoji">{n.emoji}</span>
            <span className="op-num">{n.valor}</span>
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={valor === na.valor}
          aria-label={`N/A — ${na.corto || na.texto}`}
          className={`opcion op-na ${valor === na.valor ? 'activa' : ''}`}
          onClick={() => onChange(na.valor)}
        >
          N/A
        </button>
      </div>
      <p className="escala-lectura" aria-live="polite">
        {lectura}
      </p>
      {error && <p className="error">{error}</p>}
    </li>
  )
}

function Unica({ campo, pregunta, opciones, valor, error, onChange }) {
  return (
    <div className={`campo ${error ? 'con-error' : ''}`} data-campo={campo}>
      <p className="pregunta">{pregunta}</p>
      <div className="opciones-lista" role="radiogroup" aria-label={pregunta}>
        {opciones.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={valor === o}
            className={`opcion-lista ${valor === o ? 'activa' : ''}`}
            onClick={() => onChange(o)}
          >
            <span className="marca" aria-hidden="true" />
            {o}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

/** Selección múltiple; la opción `lista.ninguna` (si existe) es excluyente con las demás. */
function Multiple({ campo, pregunta, lista, datos, poner, error }) {
  const actual = datos[campo]
  const alternar = (o) => {
    if (actual.includes(o)) return poner(campo, actual.filter((x) => x !== o))
    if (o === lista.ninguna) return poner(campo, [o])
    poner(campo, [...actual.filter((x) => x !== lista.ninguna), o])
  }
  return (
    <div className={`campo ${error ? 'con-error' : ''}`} data-campo={campo}>
      <p className="pregunta">{pregunta}</p>
      <p className="contador-chips">Selección múltiple</p>
      <div className="chips">
        {lista.opciones.map((o) => {
          const marcado = actual.includes(o)
          return (
            <button key={o} type="button" aria-pressed={marcado} className={`chip ${marcado ? 'activo' : ''}`} onClick={() => alternar(o)}>
              {marcado && <span aria-hidden="true">✓ </span>}
              {o}
            </button>
          )
        })}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
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
      <h2 className="titulo-seccion">¡Gracias por sus respuestas!</h2>
      <p>Sus respuestas llegaron bien. Con ellas vamos a fortalecer los procesos de formación de La Universidad en el Campo.</p>
      <p className="gracias-firma">Ya puede cerrar esta página.</p>
    </section>
  )
}
