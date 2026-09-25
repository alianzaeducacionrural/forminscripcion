import { useEffect, useMemo, useRef, useState } from 'react';
import Membrete from '../components/Membrete.jsx';
import Progreso from '../components/Progreso.jsx';
import Modal from '../components/Modal.jsx';
import FilaMatriz from './FilaMatriz.jsx';
import RevisionMatriz from './RevisionMatriz.jsx';
import PantallaExito from './PantallaExito.jsx';
import { INSTITUCIONES } from '../data/catalogos.js';
import {
  armarPayload,
  calcularProgreso,
  esValido,
  estadoInicial,
  filaVacia,
  restaurarBorrador,
  validarMatriz,
} from '../validar.js';
import { createDraftStore } from '../storage.js';
import { listInstituciones } from '../api.js';
import '../formulario.css';
import './matriz.css';

/**
 * Formulario genérico para una matriz del Comité Académico. La configuración
 * (textos oficiales, columnas, filas fijas) vive en data/catalogos.js; aquí
 * solo hay comportamiento.
 */
export default function MatrizForm({ config, enviar }) {
  const store = useMemo(() => createDraftStore(`comite-academico-${config.id}-v1`), [config.id]);
  // El borrador se lee una sola vez al montar (inicializador perezoso), no en un efecto.
  const [inicial] = useState(() => {
    const borrador = store.loadDraft();
    const conContenido =
      borrador && (borrador.institucion || (borrador.filas || []).some((f) => f.accion || f.situacion));
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

  const errores = useMemo(() => validarMatriz(config, datos), [config, datos]);
  const progreso = useMemo(() => calcularProgreso(config, datos), [config, datos]);

  const visible = (idFila, clave) => intentado || Boolean(tocados[`${idFila}.${clave}`]);

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

  function abrirRevision() {
    setIntentado(true);
    if (!esValido(errores)) {
      // Esperar al render con los errores visibles antes de buscar el primero.
      requestAnimationFrame(() => {
        const primero = document.querySelector('.campo-input--error, .select-institucion--error');
        if (primero) primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    setMostrarModal(true);
  }

  async function confirmarEnvio() {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      await enviar(armarPayload(config, datos));
      store.clearDraft();
      setResultado({ institucion: datos.institucion, totalFilas: datos.filas.length });
      setMostrarModal(false);
    } catch (err) {
      setErrorEnvio(err.message || 'Error desconocido. Intente de nuevo.');
    } finally {
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
        <div className="hoja">
          <PantallaExito
            config={config}
            institucion={resultado.institucion}
            totalFilas={resultado.totalFilas}
            onEnviarOtra={volverAEditar}
          />
        </div>
      </div>
    );
  }

  const puedeQuitar = (fila) => !fila.fija && datos.filas.length > 1;

  return (
    <div className="pagina">
      <div className="hoja">
        <header className="encabezado">
          <Membrete />
          <div className="encabezado-cuerpo">
            <h1>{config.titulo}</h1>
            <p className="encabezado-subtitulo">{config.subtitulo}</p>
            <Progreso respondidas={progreso.listos} total={progreso.total} />

            <div className="encabezado-objetivo">
              <span className="encabezado-objetivo-rotulo">Pregunta orientadora</span>
              <p>{config.pregunta}</p>
            </div>

            {config.categorias.length > 0 && (
              <div className="guia-categorias">
                <span className="guia-categorias-titulo">{config.categoriasTitulo}</span>
                <ul className="guia-categorias-lista">
                  {config.categorias.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {config.producto && (
              <p className="encabezado-producto">
                <strong>Producto:</strong> {config.producto}
              </p>
            )}

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
        </header>

        <section className="campo campo--institucion">
          <label className="campo-etiqueta" htmlFor="institucion-select">
            Institución de educación superior
          </label>
          <div className="select-envoltura">
            <select
              id="institucion-select"
              className={`select-institucion ${errores.institucion && (intentado || tocados.institucion) ? 'select-institucion--error' : ''}`}
              value={datos.institucion}
              onChange={(e) => setDatos((prev) => ({ ...prev, institucion: e.target.value }))}
              onBlur={() => setTocados((prev) => ({ ...prev, institucion: true }))}
            >
              <option value="" disabled>
                Seleccione su institución…
              </option>
              {INSTITUCIONES.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
          {errores.institucion && (intentado || tocados.institucion) && (
            <p className="campo-error">{errores.institucion}</p>
          )}
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

        <div className="agregar-fila">
          <button type="button" className="boton-agregar" onClick={agregarFila}>
            <span aria-hidden="true">+</span> {config.botonAgregar}
          </button>
        </div>

        <div className="acciones-finales">
          <button type="button" className="boton boton--primario" onClick={abrirRevision}>
            Revisar y enviar
          </button>
        </div>
      </div>

      {mostrarModal && (
        <Modal titulo="Revise antes de enviar" onCerrar={() => setMostrarModal(false)}>
          <RevisionMatriz
            config={config}
            datos={datos}
            enviando={enviando}
            errorEnvio={errorEnvio}
            onEditar={() => setMostrarModal(false)}
            onConfirmar={confirmarEnvio}
          />
        </Modal>
      )}
    </div>
  );
}
