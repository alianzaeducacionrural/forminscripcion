import { useEffect, useMemo, useState } from 'react';
import Encabezado from './Encabezado.jsx';
import FilaDocente from './FilaDocente.jsx';
import RevisionEnvio from './RevisionEnvio.jsx';
import PantallaExito from './PantallaExito.jsx';
import Modal from '../components/Modal.jsx';
import { INSTITUCIONES } from '../data/catalogos.js';
import { validarFormulario, formularioEsValido, normalizarTelefono } from './validar.js';
import { loadDraft, saveDraft, clearDraft } from './storage.js';
import { listInstituciones, submitInscripcion } from '../api.js';
import './formulario.css';

function docenteVacio() {
  return { nombre: '', telefono: '', areas: [] };
}

export default function FormularioInscripcion() {
  const [institucion, setInstitucion] = useState('');
  const [docentes, setDocentes] = useState([docenteVacio()]);
  const [tocados, setTocados] = useState([{}]);
  const [institucionTocada, setInstitucionTocada] = useState(false);
  const [nuevoIndice, setNuevoIndice] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [avisoBorrador, setAvisoBorrador] = useState(false);
  const [avisoConexion, setAvisoConexion] = useState(false);

  // Restaura un borrador si existe — el rector no debe perder el avance si
  // cerró la pestaña a mitad del diligenciamiento.
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.institucion || (draft.docentes || []).some((d) => d.nombre))) {
      setInstitucion(draft.institucion || '');
      setDocentes(draft.docentes && draft.docentes.length ? draft.docentes : [docenteVacio()]);
      setTocados((draft.docentes || [docenteVacio()]).map(() => ({})));
      setAvisoBorrador(true);
    }
  }, []);

  // Ping de conectividad al backend: no bloquea el primer render (el
  // catálogo de instituciones ya está disponible localmente), solo avisa
  // temprano si el enlace del Web App no responde.
  useEffect(() => {
    listInstituciones().catch(() => setAvisoConexion(true));
  }, []);

  // Autoguardado del borrador.
  useEffect(() => {
    if (resultado) return;
    saveDraft({ institucion, docentes });
  }, [institucion, docentes, resultado]);

  const errores = useMemo(() => validarFormulario({ institucion, docentes }), [institucion, docentes]);

  function actualizarDocente(index, campo, valor) {
    setDocentes((prev) => prev.map((d, i) => (i === index ? { ...d, [campo]: valor } : d)));
  }

  // Usa el actualizador funcional de setDocentes (lee el estado previo real al
  // aplicarse, no un closure capturado en el render del click) para que marcar
  // dos áreas en sucesión rápida no pierda la primera selección.
  function alternarAreaDocente(index, area, marcada) {
    setDocentes((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d;
        const actuales = d.areas || [];
        const nuevas = marcada ? [...actuales, area] : actuales.filter((a) => a !== area);
        return { ...d, areas: nuevas };
      })
    );
  }

  function tocarCampo(index, campo) {
    setTocados((prev) => prev.map((t, i) => (i === index ? { ...t, [campo]: true } : t)));
  }

  function agregarDocente() {
    setDocentes((prev) => [...prev, docenteVacio()]);
    setTocados((prev) => [...prev, {}]);
    setNuevoIndice(docentes.length);
  }

  function quitarDocente(index) {
    setDocentes((prev) => prev.filter((_, i) => i !== index));
    setTocados((prev) => prev.filter((_, i) => i !== index));
  }

  function abrirModalInscripcion() {
    setInstitucionTocada(true);
    setTocados(docentes.map(() => ({ nombre: true, telefono: true, areas: true })));

    if (!formularioEsValido(errores)) {
      const primerError = document.querySelector('.campo-input--error, [aria-invalid="true"]');
      if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setMostrarModal(true);
  }

  async function confirmarEnvio() {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const payload = {
        institucion,
        docentes: docentes.map((d) => ({
          nombre: d.nombre.trim(),
          telefono: normalizarTelefono(d.telefono),
          areas: d.areas,
        })),
      };
      await submitInscripcion(payload);
      clearDraft();
      setResultado({ institucion, docentes: payload.docentes });
      setMostrarModal(false);
    } catch (err) {
      setErrorEnvio(err.message || 'Error desconocido. Intente de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="pagina">
        <div className="hoja">
          <PantallaExito institucion={resultado.institucion} docentes={resultado.docentes} />
        </div>
      </div>
    );
  }

  return (
    <div className="pagina">
      <div className="hoja">
        <Encabezado />

        <div className="encabezado-cuerpo" style={{ paddingTop: 0 }}>
          {avisoBorrador && (
            <p className="aviso aviso--info">Se restauró un borrador que tenía guardado en este dispositivo.</p>
          )}
          {avisoConexion && (
            <p className="aviso aviso--advertencia">
              No se pudo confirmar la conexión con el servidor. Puede seguir diligenciando; se avisará si el envío falla.
            </p>
          )}
        </div>

        <section className="campo campo--institucion">
          <label className="campo-etiqueta" htmlFor="institucion-select">
            Institución educativa
          </label>
          <div className="select-envoltura">
            <select
              id="institucion-select"
              className={`select-institucion ${errores.institucion && institucionTocada ? 'select-institucion--error' : ''}`}
              value={institucion}
              onChange={(e) => {
                setInstitucion(e.target.value);
                setInstitucionTocada(true);
              }}
              onBlur={() => setInstitucionTocada(true)}
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
          {errores.institucion && institucionTocada && <p className="campo-error">{errores.institucion}</p>}
        </section>

        <section className="seccion-docentes">
          <div className="seccion-docentes-cabecera">
            <h2>Docentes participantes</h2>
            <span className="folio">
              {docentes.length} {docentes.length === 1 ? 'docente' : 'docentes'}
            </span>
          </div>

          {docentes.map((docente, i) => (
            <FilaDocente
              key={i}
              index={i}
              docente={docente}
              errores={errores.docentes ? errores.docentes[i] : {}}
              tocado={tocados[i] || {}}
              onChange={(campo, valor) => actualizarDocente(i, campo, valor)}
              onToggleArea={(area, marcada) => alternarAreaDocente(i, area, marcada)}
              onBlur={(campo) => tocarCampo(i, campo)}
              onRemove={() => quitarDocente(i)}
              canRemove={docentes.length > 1}
              autoFocus={i === nuevoIndice}
            />
          ))}

          <button type="button" className="boton boton--agregar" onClick={agregarDocente}>
            + Agregar otro docente
          </button>
        </section>

        <div className="acciones-finales">
          <button type="button" className="boton boton--primario" onClick={abrirModalInscripcion}>
            Inscribir docentes
          </button>
        </div>
      </div>

      {mostrarModal && (
        <Modal titulo="Revise antes de enviar" onCerrar={() => setMostrarModal(false)}>
          <RevisionEnvio
            institucion={institucion}
            docentes={docentes}
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
