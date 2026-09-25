import { useEffect, useMemo, useRef, useState } from 'react';
import Progreso from '../components/Progreso.jsx';
import Modal from '../components/Modal.jsx';
import FilaMatriz from './FilaMatriz.jsx';
import RevisionMatriz from './RevisionMatriz.jsx';
import PantallaExito from './PantallaExito.jsx';
import { INSTITUCIONES_SUGERIDAS, MAX_CORTO } from '../data/catalogos.js';
import {
  armarPayload,
  calcularProgreso,
  esValido,
  estadoInicial,
  filaVacia,
  nuevoIdEnvio,
  restaurarBorrador,
  validarMatriz,
} from '../validar.js';
import { createDraftStore } from '../storage.js';
import { listInstituciones } from '../api.js';
import './matriz.css';

/**
 * Formulario genérico para una matriz del Comité Académico. La configuración
 * (textos oficiales, columnas, filas fijas) vive en data/catalogos.js; aquí
 * solo hay comportamiento.
 */
export default function MatrizForm({ config, enviar }) {
  const store = useMemo(() => createDraftStore(`comite-academico-${config.id}-v2`), [config.id]);
  // El borrador se lee una sola vez al montar (inicializador perezoso), no en un efecto.
  const [inicial] = useState(() => {
    const borrador = store.loadDraft();
    const conContenido =
      borrador &&
      (borrador.nombre ||
        borrador.institucion ||
        (borrador.filas || []).some((f) => f.accion || f.situacion));
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
  const ultimaFila = useRef(null);
  const agregoFila = useRef(false);
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

  // Al agregar una fila, llevar la vista hasta ella para que no pase desapercibida.
  useEffect(() => {
    if (agregoFila.current && ultimaFila.current) {
      ultimaFila.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    agregoFila.current = false;
  }, [datos.filas.length]);

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

  const errores = useMemo(() => validarMatriz(config, datos), [config, datos]);
  const progreso = useMemo(() => calcularProgreso(config, datos), [config, datos]);

  const visible = (idFila, clave) => intentado || Boolean(tocados[`${idFila}.${clave}`]);
  const veError = (campo) => Boolean(errores[campo] && (intentado || tocados[campo]));
  const nombreMatriz = config.titulo.replace(/^Matriz \d+\.\s*/, '');

  function cambiarFila(idFila, clave, valor) {
    setDatos((prev) => ({
      ...prev,
      filas: prev.filas.map((f) => (f.id === idFila ? { ...f, [clave]: valor } : f)),
    }));
  }

  function tocarFila(idFila, clave) {
    setTocados((prev) => ({ ...prev, [`${idFila}.${clave}`]: true }));
  }

  function agregarFila() {
    agregoFila.current = true;
    setDatos((prev) => ({ ...prev, filas: [...prev.filas, filaVacia(config)] }));
  }

  function quitarFila(idFila) {
    setDatos((prev) => ({ ...prev, filas: prev.filas.filter((f) => f.id !== idFila) }));
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
      await enviar({ ...payload, idEnvio: idParaEnvio(payload) });
      intentoRef.current = null;
      store.clearDraft();
      setResultado({ nombre: datos.nombre.trim(), institucion: datos.institucion.trim(), totalFilas: datos.filas.length });
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
        <main className="contenedor contenedor--exito">
          <PantallaExito config={config} resultado={resultado} onEnviarOtra={volverAEditar} />
        </main>
      </div>
    );
  }

  const puedeQuitar = (fila) => !fila.fija && datos.filas.length > 1;

  return (
    <div className="pagina">
      <Progreso respondidas={progreso.listos} total={progreso.total} />

      <header className="hero">
        <div className="hero-formas" aria-hidden="true">
          <span className="forma forma--circulo" />
          <span className="forma forma--anillo" />
          <span className="forma forma--cuadro" />
          <span className="forma forma--punto" />
        </div>
        <span className="hero-numero" aria-hidden="true">
          {config.numero}
        </span>
        <div className="hero-contenido">
          <span className="hero-etiqueta">Comité Académico · 25 sep 2026</span>
          <h1>{nombreMatriz}</h1>
          <p className="hero-subtitulo">{config.subtitulo}</p>
        </div>
      </header>

      <main className="contenedor">
        <section className="tarjeta tarjeta--pregunta entra">
          <span className="sticker sticker--acc2">Pregunta orientadora</span>
          <p className="pregunta-texto">{config.pregunta}</p>
        </section>

        {config.categorias.length > 0 && (
          <section className="tarjeta entra">
            <h2 className="tarjeta-titulo">{config.categoriasTitulo}</h2>
            <ul className="stickers">
              {config.categorias.map((c, i) => (
                <li key={c} className={`sticker sticker--${i % 5}`}>
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}

        {config.producto && (
          <section className="producto entra">
            <span className="producto-rotulo">Producto</span>
            <p>{config.producto}</p>
          </section>
        )}

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
                Institución
              </label>
              <input
                id="institucion"
                type="text"
                list="instituciones-sugeridas"
                className={`campo-input ${veError('institucion') ? 'campo-input--error' : ''}`}
                value={datos.institucion}
                maxLength={MAX_CORTO}
                autoComplete="organization"
                placeholder="Universidad, entidad u organización"
                onChange={(e) => setDatos((prev) => ({ ...prev, institucion: e.target.value }))}
                onBlur={() => setTocados((prev) => ({ ...prev, institucion: true }))}
              />
              <datalist id="instituciones-sugeridas">
                {INSTITUCIONES_SUGERIDAS.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
              {veError('institucion') && <p className="campo-error">{errores.institucion}</p>}
            </div>
          </div>
        </section>

        <div className="filas-matriz">
          {datos.filas.map((fila, i) => (
            <div key={fila.id} ref={i === datos.filas.length - 1 ? ultimaFila : null}>
              <FilaMatriz
                config={config}
                fila={fila}
                indice={i}
                errores={errores.filas[fila.id]}
                visibles={(clave) => visible(fila.id, clave)}
                onCambiar={(clave, valor) => cambiarFila(fila.id, clave, valor)}
                onTocar={(clave) => tocarFila(fila.id, clave)}
                onQuitar={() => quitarFila(fila.id)}
                puedeQuitar={puedeQuitar(fila)}
              />
            </div>
          ))}
        </div>

        <button type="button" className="boton-agregar" onClick={agregarFila}>
          <span className="boton-agregar-mas" aria-hidden="true">
            +
          </span>
          {config.botonAgregar}
        </button>

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
          <RevisionMatriz
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
