import { useEffect, useMemo, useRef, useState } from 'react';
import Progreso from '../components/Progreso.jsx';
import Modal from '../components/Modal.jsx';
import Membrete from '../components/Membrete.jsx';
import FilaComponente from './FilaComponente.jsx';
import RevisionHerramienta from './RevisionHerramienta.jsx';
import PantallaExito from './PantallaExito.jsx';
import { INSTITUCIONES_MANIZALES, MAX_CORTO } from '../data/catalogos.js';
import {
  armarPayload,
  calcularProgreso,
  esValido,
  estadoInicial,
  nuevoIdEnvio,
  restaurarBorrador,
  validarHerramienta,
} from '../validar.js';
import { createDraftStore } from '../storage.js';
import { listInstituciones } from '../api.js';
import './herramienta.css';

/**
 * Formulario genérico para una herramienta de acompañamiento entre pares. La
 * configuración (textos oficiales, columnas, si lleva valoración) vive en
 * data/catalogos.js; aquí solo hay comportamiento. Las 4 filas (una por
 * componente de gestión escolar) son fijas: no se agregan ni se quitan.
 */
export default function HerramientaForm({ config, enviar }) {
  const store = useMemo(() => createDraftStore(`acompanamiento-pares-${config.id}-v1`), [config.id]);
  // El borrador se lee una sola vez al montar (inicializador perezoso), no en un efecto.
  const [inicial] = useState(() => {
    const borrador = store.loadDraft();
    const conContenido =
      borrador &&
      (borrador.nombre || borrador.institucion || (borrador.filas || []).some((f) => Object.values(f).some(Boolean)));
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
  // Candado síncrono contra doble clic: `enviando` (estado) se actualiza en el
  // siguiente render, y dos clics muy seguidos entrarían antes de eso.
  const enviandoRef = useRef(false);
  // Un mismo contenido = un mismo idEnvio, también entre reintentos tras un
  // error de red; si el contenido cambia, es un envío nuevo y se genera otro id.
  const intentoRef = useRef(null);

  useEffect(() => {
    listInstituciones().catch(() => setAvisoConexion(true));
  }, []);

  useEffect(() => {
    if (resultado) return;
    store.saveDraft(datos);
  }, [datos, resultado, store]);

  // Mientras se envía, avisar si intentan cerrar o recargar la pestaña.
  useEffect(() => {
    if (!enviando) return undefined;
    const avisar = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [enviando]);

  const errores = useMemo(() => validarHerramienta(config, datos), [config, datos]);
  const progreso = useMemo(() => calcularProgreso(config, datos), [config, datos]);

  const visible = (componente, clave) => intentado || Boolean(tocados[`${componente}.${clave}`]);
  const veError = (campo) => Boolean(errores[campo] && (intentado || tocados[campo]));

  function cambiarFila(componente, clave, valor) {
    setDatos((prev) => ({
      ...prev,
      filas: prev.filas.map((f) => (f.componente === componente ? { ...f, [clave]: valor } : f)),
    }));
  }

  function tocarFila(componente, clave) {
    setTocados((prev) => ({ ...prev, [`${componente}.${clave}`]: true }));
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
      // Esperar al render con los errores visibles antes de buscar el primero.
      requestAnimationFrame(() => {
        const primero = document.querySelector('.campo-input--error, .valoracion[aria-invalid="true"]');
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
      await enviar({ ...payload, idEnvio: idParaEnvio(payload) });
      intentoRef.current = null;
      store.clearDraft();
      setResultado({ nombre: datos.nombre.trim(), institucion: datos.institucion.trim() });
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
          <PantallaExito config={config} resultado={resultado} onEnviarOtra={volverAEditar} />
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
          <span className="sticker sticker--acc2">Pregunta orientadora</span>
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

        <section className="tarjeta entra" aria-labelledby="titulo-quien">
          <h2 className="tarjeta-titulo" id="titulo-quien">
            <span className="numerito">★</span> ¿Quién diligencia?
          </h2>
          <div className="grid-quien">
            <div>
              <label className="campo-etiqueta" htmlFor="nombre">
                Su nombre
              </label>
              <input
                id="nombre"
                type="text"
                className={`campo-input ${veError('nombre') ? 'campo-input--error' : ''}`}
                value={datos.nombre}
                maxLength={MAX_CORTO}
                autoComplete="name"
                placeholder="Nombre y apellido"
                onChange={(e) => setDatos((prev) => ({ ...prev, nombre: e.target.value }))}
                onBlur={() => setTocados((prev) => ({ ...prev, nombre: true }))}
              />
              {veError('nombre') && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-etiqueta" htmlFor="institucion">
                Institución educativa
              </label>
              <select
                id="institucion"
                className={`campo-select ${veError('institucion') ? 'campo-input--error' : ''}`}
                value={datos.institucion}
                onChange={(e) => setDatos((prev) => ({ ...prev, institucion: e.target.value }))}
                onBlur={() => setTocados((prev) => ({ ...prev, institucion: true }))}
              >
                <option value="">Seleccione su institución</option>
                {INSTITUCIONES_MANIZALES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {veError('institucion') && <p className="campo-error">{errores.institucion}</p>}
            </div>
          </div>
        </section>

        <div className="filas-herramienta">
          {datos.filas.map((fila, i) => (
            <FilaComponente
              key={fila.componente}
              config={config}
              fila={fila}
              indice={i}
              errores={errores.filas[fila.componente]}
              visibles={(clave) => visible(fila.componente, clave)}
              onCambiar={(clave, valor) => cambiarFila(fila.componente, clave, valor)}
              onTocar={(clave) => tocarFila(fila.componente, clave)}
            />
          ))}
        </div>

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
          <RevisionHerramienta
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
