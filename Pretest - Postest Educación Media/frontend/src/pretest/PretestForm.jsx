import { useEffect, useMemo, useState } from 'react';
import EncabezadoPretest from './EncabezadoPretest.jsx';
import RevisionPretest from './RevisionPretest.jsx';
import PantallaExitoPretest from './PantallaExitoPretest.jsx';
import Modal from '../components/Modal.jsx';
import DatosDocente from '../components/DatosDocente.jsx';
import PreguntaOpcionUnica from '../components/PreguntaOpcionUnica.jsx';
import PreguntaChecklist from '../components/PreguntaChecklist.jsx';
import PreguntaAbierta from '../components/PreguntaAbierta.jsx';
import {
  PRETEST_PREGUNTAS,
  PRETEST_P4_TEXTO,
  PRETEST_P4_ELEMENTOS,
  PRETEST_P4_OTRO,
  PRETEST_P5_TEXTO,
} from '../data/catalogos.js';
import { validarPretest, formularioEsValido, normalizarNombrePropio } from '../validar.js';
import { createDraftStore } from '../storage.js';
import { listInstituciones, submitPretest } from '../api.js';
import '../formulario.css';

const { loadDraft, saveDraft, clearDraft } = createDraftStore('pretest-metodologias-activas-v1');

function estadoVacio() {
  return {
    institucion: '',
    nombreDocente: '',
    areas: [],
    p1: '',
    p2: '',
    p3: '',
    p4Elementos: [],
    p4Otro: '',
    p5Competencia: '',
    p5Estrategia: '',
    p5Evidencia: '',
  };
}

export default function PretestForm() {
  const [datos, setDatos] = useState(estadoVacio());
  const [tocados, setTocados] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [avisoBorrador, setAvisoBorrador] = useState(false);
  const [avisoConexion, setAvisoConexion] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.institucion || draft.nombreDocente)) {
      setDatos({ ...estadoVacio(), ...draft });
      setAvisoBorrador(true);
    }
  }, []);

  useEffect(() => {
    listInstituciones().catch(() => setAvisoConexion(true));
  }, []);

  useEffect(() => {
    if (resultado) return;
    saveDraft(datos);
  }, [datos, resultado]);

  const errores = useMemo(() => validarPretest(datos), [datos]);

  const respondidas = [
    datos.institucion,
    datos.nombreDocente.trim(),
    datos.areas.length > 0,
    datos.p1,
    datos.p2,
    datos.p3,
    datos.p4Elementos.length > 0,
  ].filter(Boolean).length;

  function actualizar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  // Actualizador funcional: evita que marcar dos áreas en sucesión rápida pierda la primera.
  function alternarArea(area, marcada) {
    setDatos((prev) => {
      const actuales = prev.areas;
      const nuevas = marcada ? [...actuales, area] : actuales.filter((a) => a !== area);
      return { ...prev, areas: nuevas };
    });
  }

  function alternarP4(opcion, marcada) {
    setDatos((prev) => {
      const actuales = prev.p4Elementos;
      const nuevas = marcada ? [...actuales, opcion] : actuales.filter((a) => a !== opcion);
      return { ...prev, p4Elementos: nuevas };
    });
  }

  function tocar(campo) {
    setTocados((prev) => ({ ...prev, [campo]: true }));
    if (campo === 'nombreDocente') {
      setDatos((prev) => ({ ...prev, nombreDocente: normalizarNombrePropio(prev.nombreDocente) }));
    }
  }

  function abrirRevision() {
    setTocados({ institucion: true, nombreDocente: true, areas: true, p1: true, p2: true, p3: true, p4Elementos: true });
    setDatos((prev) => ({ ...prev, nombreDocente: normalizarNombrePropio(prev.nombreDocente) }));

    if (!formularioEsValido(errores)) {
      const primerError = document.querySelector('.campo-input--error, .select-institucion--error, .campo-error');
      if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setMostrarModal(true);
  }

  async function confirmarEnvio() {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const payload = { ...datos, nombreDocente: normalizarNombrePropio(datos.nombreDocente) };
      await submitPretest(payload);
      clearDraft();
      setResultado(payload);
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
          <PantallaExitoPretest nombreDocente={resultado.nombreDocente} />
        </div>
      </div>
    );
  }

  return (
    <div className="pagina">
      <div className="hoja">
        <EncabezadoPretest respondidas={respondidas} total={7} />

        <div className="encabezado-cuerpo" style={{ paddingTop: 0, paddingBottom: 0 }}>
          {avisoBorrador && (
            <p className="aviso aviso--info">Se restauró un borrador que tenía guardado en este dispositivo.</p>
          )}
          {avisoConexion && (
            <p className="aviso aviso--advertencia">
              No se pudo confirmar la conexión con el servidor. Puede seguir diligenciando; se avisará si el envío falla.
            </p>
          )}
        </div>

        <DatosDocente
          institucion={datos.institucion}
          onChangeInstitucion={(v) => actualizar('institucion', v)}
          nombreDocente={datos.nombreDocente}
          onChangeNombre={(v) => actualizar('nombreDocente', v)}
          areas={datos.areas}
          onToggleArea={alternarArea}
          errores={errores}
          tocados={tocados}
          onBlur={tocar}
        />

        <PreguntaOpcionUnica
          numero={1}
          texto={PRETEST_PREGUNTAS.p1.texto}
          opciones={PRETEST_PREGUNTAS.p1.opciones}
          valor={datos.p1}
          onChange={(v) => {
            actualizar('p1', v);
            tocar('p1');
          }}
          error={errores.p1}
          tocado={tocados.p1}
        />

        <PreguntaOpcionUnica
          numero={2}
          texto={PRETEST_PREGUNTAS.p2.texto}
          opciones={PRETEST_PREGUNTAS.p2.opciones}
          valor={datos.p2}
          onChange={(v) => {
            actualizar('p2', v);
            tocar('p2');
          }}
          error={errores.p2}
          tocado={tocados.p2}
        />

        <PreguntaOpcionUnica
          numero={3}
          texto={PRETEST_PREGUNTAS.p3.texto}
          opciones={PRETEST_PREGUNTAS.p3.opciones}
          valor={datos.p3}
          onChange={(v) => {
            actualizar('p3', v);
            tocar('p3');
          }}
          error={errores.p3}
          tocado={tocados.p3}
        />

        <PreguntaChecklist
          numero={4}
          texto={PRETEST_P4_TEXTO}
          opciones={PRETEST_P4_ELEMENTOS}
          seleccion={datos.p4Elementos}
          onToggle={(opcion, marcada) => {
            alternarP4(opcion, marcada);
            tocar('p4Elementos');
          }}
          sentinelOtro={PRETEST_P4_OTRO}
          textoOtro={datos.p4Otro}
          onChangeOtro={(v) => actualizar('p4Otro', v)}
          error={errores.p4Elementos}
          errorOtro={errores.p4Otro}
          tocado={tocados.p4Elementos}
        />

        <fieldset className="pregunta entra">
          <legend className="pregunta-enunciado">
            <span className="pregunta-numero">5</span>
            {PRETEST_P5_TEXTO}
          </legend>
          <PreguntaAbierta
            label="Competencia o aprendizaje"
            valor={datos.p5Competencia}
            onChange={(v) => actualizar('p5Competencia', v)}
            placeholder="Opcional"
          />
          <PreguntaAbierta
            label="Estrategia que implementaría"
            valor={datos.p5Estrategia}
            onChange={(v) => actualizar('p5Estrategia', v)}
            placeholder="Opcional"
          />
          <PreguntaAbierta
            label="¿Qué evidencia utilizaría para valorar si la estrategia contribuyó al mejoramiento del aprendizaje?"
            valor={datos.p5Evidencia}
            onChange={(v) => actualizar('p5Evidencia', v)}
            placeholder="Opcional"
          />
        </fieldset>

        <div className="acciones-finales">
          <button type="button" className="boton boton--primario" onClick={abrirRevision}>
            Revisar y enviar
          </button>
        </div>
      </div>

      {mostrarModal && (
        <Modal titulo="Revise antes de enviar" onCerrar={() => setMostrarModal(false)}>
          <RevisionPretest
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
