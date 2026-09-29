import { useEffect, useMemo, useRef, useState } from 'react';
import Progreso from '../components/Progreso.jsx';
import Modal from '../components/Modal.jsx';
import Membrete from '../components/Membrete.jsx';
import FilaAccion from './FilaAccion.jsx';
import RevisionPlan from './RevisionPlan.jsx';
import PantallaExitoPlan from './PantallaExitoPlan.jsx';
import { INSTITUCIONES_MANIZALES, MAX_CORTO } from '../data/catalogos.js';
import {
  accionVacia,
  armarPayload,
  calcularProgreso,
  esValido,
  estadoInicial,
  nuevoIdEnvio,
  puedeAgregarAccion,
  puedeQuitarAccion,
  restaurarBorrador,
  validarPlan,
} from './validarPlan.js';
import { createDraftStore } from '../storage.js';
import { listInstituciones } from '../api.js';
import '../herramienta/herramienta.css';
import './plan.css';

const PERSONAS = [
  { sufijo: 'Experimentado', etiqueta: 'Rector con experiencia', clase: 'ambar' },
  { sufijo: 'Nuevo', etiqueta: 'Rector nuevo', clase: 'turquesa' },
];

/**
 * Formulario de "Mi primer reto de acompañamiento": lo diligencia la dupla
 * junta, en un solo envío. A diferencia de las otras 2 herramientas (4 filas
 * fijas por componente), aquí las filas son "acciones" dinámicas: al menos
 * 1 es obligatoria, se pueden agregar más.
 */
export default function PlanAccionForm({ config, enviar }) {
  const store = useMemo(() => createDraftStore(`acompanamiento-pares-${config.id}-v1`), [config.id]);
  const [inicial] = useState(() => {
    const borrador = store.loadDraft();
    const conContenido =
      borrador &&
      (borrador.nombreExperimentado ||
        borrador.nombreNuevo ||
        (borrador.acciones || []).some((f) => Object.values(f).some(Boolean)));
    return conContenido
      ? { datos: restaurarBorrador(config, borrador), restaurado: true }
      : { datos: estadoInicial(config), restaurado: false };
  });
  const [datos, setDatos] = useState(inicial.datos);
  const [tocados, setTocados] = useState({});
  const [intentado, setIntentado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [avisoBorrador, setAvisoBorrador] = useState(inicial.restaurado);
  const [avisoConexion, setAvisoConexion] = useState(false);
  const ultimaAccion = useRef(null);
  const agregoAccion = useRef(false);
  const enviandoRef = useRef(false);
  const intentoRef = useRef(null);

  useEffect(() => {
    listInstituciones().catch(() => setAvisoConexion(true));
  }, []);

  useEffect(() => {
    if (resultado) return;
    store.saveDraft(datos);
  }, [datos, resultado, store]);

  useEffect(() => {
    if (agregoAccion.current && ultimaAccion.current) {
      ultimaAccion.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    agregoAccion.current = false;
  }, [datos.acciones.length]);

  useEffect(() => {
    if (!enviando) return undefined;
    const avisar = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [enviando]);

  const errores = useMemo(() => validarPlan(config, datos), [config, datos]);
  const progreso = useMemo(() => calcularProgreso(config, datos), [config, datos]);

  const visibleAccion = (idAccion, clave) => intentado || Boolean(tocados[`accion.${idAccion}.${clave}`]);
  const veError = (campo) => Boolean(errores[campo] && (intentado || tocados[campo]));

  function cambiarPersona(sufijo, clave, valor) {
    setDatos((prev) => ({ ...prev, [`${clave}${sufijo}`]: valor }));
  }

  function tocarPersona(sufijo, clave) {
    setTocados((prev) => ({ ...prev, [`${clave}${sufijo}`]: true }));
  }

  function cambiarAccion(idAccion, clave, valor) {
    setDatos((prev) => ({
      ...prev,
      acciones: prev.acciones.map((a) => (a.id === idAccion ? { ...a, [clave]: valor } : a)),
    }));
  }

  function tocarAccion(idAccion, clave) {
    setTocados((prev) => ({ ...prev, [`accion.${idAccion}.${clave}`]: true }));
  }

  function agregarAccion() {
    agregoAccion.current = true;
    setDatos((prev) => ({ ...prev, acciones: [...prev.acciones, accionVacia(config)] }));
  }

  function quitarAccion(idAccion) {
    setDatos((prev) => ({ ...prev, acciones: prev.acciones.filter((a) => a.id !== idAccion) }));
  }

  function idParaEnvio(payload) {
    const firma = JSON.stringify(payload);
    if (!intentoRef.current || intentoRef.current.firma !== firma) {
      intentoRef.current = { firma, id: nuevoIdEnvio() };
    }
    return intentoRef.current.id;
  }

  function abrirRevision() {
    if (enviandoRef.current) return;
    setIntentado(true);
    if (!esValido(errores)) {
      requestAnimationFrame(() => {
        const primero = document.querySelector('.campo-input--error');
        if (primero) primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    setMostrarModal(true);
  }

  async function confirmarEnvio() {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const payload = armarPayload(config, datos);
      const respuesta = await enviar({ ...payload, idEnvio: idParaEnvio(payload) });
      intentoRef.current = null;
      store.clearDraft();
      setResultado({
        nombreExperimentado: datos.nombreExperimentado.trim(),
        nombreNuevo: datos.nombreNuevo.trim(),
        correoExperimentado: datos.correoExperimentado.trim(),
        correoNuevo: datos.correoNuevo.trim(),
        correoEnviado: Boolean(respuesta?.correoEnviado),
      });
      setMostrarModal(false);
    } catch (err) {
      setErrorEnvio(err.message || 'Error desconocido. Intente de nuevo.');
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  }

  function volverAEditar() {
    setResultado(null);
    setIntentado(false);
    setAvisoBorrador(false);
  }

  if (resultado) {
    return (
      <div className="pagina">
        <Membrete />
        <main className="contenedor contenedor--exito">
          <PantallaExitoPlan resultado={resultado} onEnviarOtra={volverAEditar} />
        </main>
      </div>
    );
  }

  return (
    <div className="pagina">
      <Membrete />
      <Progreso respondidas={progreso.listos} total={progreso.total} />

      <header className="hero">
        <div className="hero-formas" aria-hidden="true">
          <span className="forma forma--circulo" />
          <span className="forma forma--anillo" />
          <span className="forma forma--cuadro" />
          <span className="forma forma--punto" />
        </div>
        <div className="hero-contenido">
          <span className="hero-etiqueta">Acompañamiento entre Pares · Sesión 1</span>
          <h1>{config.titulo}</h1>
          <p className="hero-subtitulo">{config.subtitulo}</p>
        </div>
      </header>

      <main className="contenedor">
        <section className="tarjeta tarjeta--pregunta entra">
          <span className="sticker sticker--acc2">Cómo funciona</span>
          <p className="pregunta-texto">{config.pregunta}</p>
        </section>

        {(avisoBorrador || avisoConexion) && (
          <div className="avisos">
            {avisoBorrador && (
              <p className="aviso aviso--info">Se restauró un borrador que tenía guardado en este dispositivo.</p>
            )}
            {avisoConexion && (
              <p className="aviso aviso--advertencia">
                No se pudo confirmar la conexión con el servidor. Puede seguir diligenciando; se avisará si el
                envío falla.
              </p>
            )}
          </div>
        )}

        <section className="tarjeta entra" aria-labelledby="titulo-dupla">
          <h2 className="tarjeta-titulo" id="titulo-dupla">
            <span className="numerito">★</span> ¿Quiénes conforman la dupla?
          </h2>
          <div className="dupla-grid">
            {PERSONAS.map(({ sufijo, etiqueta, clase }) => (
              <div key={sufijo} className={`dupla-bloque dupla-bloque--${clase}`}>
                <span className={`etiqueta-rol etiqueta-rol--${clase}`}>{etiqueta}</span>
                <div>
                  <label className="campo-etiqueta" htmlFor={`nombre${sufijo}`}>
                    Nombre
                  </label>
                  <input
                    id={`nombre${sufijo}`}
                    type="text"
                    className={`campo-input ${veError(`nombre${sufijo}`) ? 'campo-input--error' : ''}`}
                    value={datos[`nombre${sufijo}`]}
                    maxLength={MAX_CORTO}
                    autoComplete="name"
                    placeholder="Nombre y apellido"
                    onChange={(e) => cambiarPersona(sufijo, 'nombre', e.target.value)}
                    onBlur={() => tocarPersona(sufijo, 'nombre')}
                  />
                  {veError(`nombre${sufijo}`) && <p className="campo-error">{errores[`nombre${sufijo}`]}</p>}
                </div>
                <div>
                  <label className="campo-etiqueta" htmlFor={`correo${sufijo}`}>
                    Correo electrónico
                  </label>
                  <input
                    id={`correo${sufijo}`}
                    type="email"
                    className={`campo-input ${veError(`correo${sufijo}`) ? 'campo-input--error' : ''}`}
                    value={datos[`correo${sufijo}`]}
                    maxLength={MAX_CORTO}
                    autoComplete="email"
                    placeholder="nombre@correo.com"
                    onChange={(e) => cambiarPersona(sufijo, 'correo', e.target.value)}
                    onBlur={() => tocarPersona(sufijo, 'correo')}
                  />
                  {veError(`correo${sufijo}`) && <p className="campo-error">{errores[`correo${sufijo}`]}</p>}
                </div>
                <div>
                  <label className="campo-etiqueta" htmlFor={`institucion${sufijo}`}>
                    Institución educativa
                  </label>
                  <select
                    id={`institucion${sufijo}`}
                    className={`campo-select ${veError(`institucion${sufijo}`) ? 'campo-input--error' : ''}`}
                    value={datos[`institucion${sufijo}`]}
                    onChange={(e) => cambiarPersona(sufijo, 'institucion', e.target.value)}
                    onBlur={() => tocarPersona(sufijo, 'institucion')}
                  >
                    <option value="">Seleccione la institución</option>
                    {INSTITUCIONES_MANIZALES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {veError(`institucion${sufijo}`) && <p className="campo-error">{errores[`institucion${sufijo}`]}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="filas-herramienta">
          {datos.acciones.map((accion, i) => (
            <div key={accion.id} ref={i === datos.acciones.length - 1 ? ultimaAccion : null}>
              <FilaAccion
                config={config}
                fila={accion}
                indice={i}
                errores={errores.acciones[accion.id]}
                visibles={(clave) => visibleAccion(accion.id, clave)}
                onCambiar={(clave, valor) => cambiarAccion(accion.id, clave, valor)}
                onTocar={(clave) => tocarAccion(accion.id, clave)}
                onQuitar={() => quitarAccion(accion.id)}
                puedeQuitar={puedeQuitarAccion(datos)}
              />
            </div>
          ))}
        </div>

        {puedeAgregarAccion(datos) && (
          <button type="button" className="boton-agregar" onClick={agregarAccion}>
            <span className="boton-agregar-mas" aria-hidden="true">
              +
            </span>
            {config.botonAgregar}
          </button>
        )}

        <section className="tarjeta entra" aria-labelledby="titulo-compromiso">
          <h2 className="tarjeta-titulo" id="titulo-compromiso">
            Compromiso de cierre
          </h2>
          <label className="campo-etiqueta" htmlFor="compromiso">
            ¿Con qué se compromete la dupla al cerrar esta sesión?
          </label>
          <textarea
            id="compromiso"
            className={`campo-input campo-textarea ${veError('compromiso') ? 'campo-input--error' : ''}`}
            rows={3}
            value={datos.compromiso}
            onChange={(e) => setDatos((prev) => ({ ...prev, compromiso: e.target.value }))}
            onBlur={() => setTocados((prev) => ({ ...prev, compromiso: true }))}
          />
          {veError('compromiso') && <p className="campo-error">{errores.compromiso}</p>}
        </section>

        <div className="acciones-finales">
          <button type="button" className="boton boton--primario" onClick={abrirRevision}>
            Revisar y enviar →
          </button>
        </div>
      </main>

      {mostrarModal && (
        <Modal
          titulo="Confirmar envío"
          bloqueado={enviando}
          onCerrar={() => !enviandoRef.current && setMostrarModal(false)}
        >
          <RevisionPlan
            config={config}
            datos={datos}
            enviando={enviando}
            errorEnvio={errorEnvio}
            onEditar={() => !enviandoRef.current && setMostrarModal(false)}
            onConfirmar={confirmarEnvio}
          />
        </Modal>
      )}
    </div>
  );
}
