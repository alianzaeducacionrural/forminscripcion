import { useEffect, useMemo, useState } from 'react';
import EncabezadoPostest from './EncabezadoPostest.jsx';
import RevisionPostest from './RevisionPostest.jsx';
import PantallaExitoPostest from './PantallaExitoPostest.jsx';
import SelectorDocentePretest from './SelectorDocentePretest.jsx';
import Modal from '../components/Modal.jsx';
import DatosDocente from '../components/DatosDocente.jsx';
import PreguntaOpcionUnica from '../components/PreguntaOpcionUnica.jsx';
import PreguntaChecklist from '../components/PreguntaChecklist.jsx';
import PreguntaAbierta from '../components/PreguntaAbierta.jsx';
import {
  POSTEST_PREGUNTAS,
  POSTEST_Q3_TEXTO,
  POSTEST_Q3_ESTRATEGIAS,
  POSTEST_Q3_OTRA,
  POSTEST_Q3_APLICARIA_TEXTO,
  POSTEST_Q4_TEXTO,
  POSTEST_Q4_ELEMENTOS,
  POSTEST_Q5_TEXTO,
} from '../data/catalogos.js';
import { validarPostest, formularioEsValido, normalizarNombrePropio } from '../validar.js';
import { createDraftStore } from '../storage.js';
import { listInstituciones, getPretestPorInstitucion, submitPostest } from '../api.js';
import '../formulario.css';

const { loadDraft, saveDraft, clearDraft } = createDraftStore('postest-metodologias-activas-v1');

function estadoVacio() {
  return {
    institucion: '',
    nombreDocente: '',
    areas: [],
    q1: '',
    q2: '',
    q3Estrategias: [],
    q3Otra: '',
    q3Aplicaria: '',
    q4Elementos: [],
    q5Aprendizaje: '',
    q5Estrategia: '',
    q5Evidencia: '',
    q5Seguimiento: '',
  };
}

export default function PostestForm() {
  const [datos, setDatos] = useState(estadoVacio());
  const [tocados, setTocados] = useState({});
  const [mostrarModalRevision, setMostrarModalRevision] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [avisoBorrador, setAvisoBorrador] = useState(false);
  const [avisoConexion, setAvisoConexion] = useState(false);

  const [candidatos, setCandidatos] = useState(null);
  const [mostrarModalRecuperar, setMostrarModalRecuperar] = useState(false);
  const [autocompletado, setAutocompletado] = useState(false);

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

  // Al elegir institución, busca quiénes ya presentaron el Pretest ahí. Se
  // filtra en el servidor (ver getPretestPorInstitucion en el backend) para
  // no exponer el roster completo de las 14 instituciones a un visitante
  // anónimo del formulario público.
  useEffect(() => {
    if (!datos.institucion) {
      setCandidatos(null);
      return undefined;
    }
    let cancelado = false;
    getPretestPorInstitucion(datos.institucion)
      .then((data) => {
        if (cancelado) return;
        setCandidatos(data);
        if (data.length > 0) setMostrarModalRecuperar(true);
      })
      .catch(() => {
        if (!cancelado) setCandidatos([]);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos.institucion]);

  const errores = useMemo(() => validarPostest(datos), [datos]);

  const respondidas = [
    datos.institucion,
    datos.nombreDocente.trim(),
    datos.areas.length > 0,
    datos.q1,
    datos.q2,
    datos.q3Estrategias.length > 0,
    datos.q4Elementos.length > 0,
  ].filter(Boolean).length;

  function actualizar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  function cambiarNombreManualmente(valor) {
    setAutocompletado(false);
    actualizar('nombreDocente', valor);
  }

  function alternarArea(area, marcada) {
    setDatos((prev) => {
      const actuales = prev.areas;
      const nuevas = marcada ? [...actuales, area] : actuales.filter((a) => a !== area);
      return { ...prev, areas: nuevas };
    });
  }

  function alternarQ3(opcion, marcada) {
    setDatos((prev) => {
      const actuales = prev.q3Estrategias;
      const nuevas = marcada ? [...actuales, opcion] : actuales.filter((a) => a !== opcion);
      return { ...prev, q3Estrategias: nuevas };
    });
  }

  function alternarQ4(opcion, marcada) {
    setDatos((prev) => {
      const actuales = prev.q4Elementos;
      const nuevas = marcada ? [...actuales, opcion] : actuales.filter((a) => a !== opcion);
      return { ...prev, q4Elementos: nuevas };
    });
  }

  function tocar(campo) {
    setTocados((prev) => ({ ...prev, [campo]: true }));
  }

  function seleccionarCandidato(candidato) {
    setDatos((prev) => ({ ...prev, nombreDocente: candidato.nombre_docente, areas: candidato.areas }));
    setAutocompletado(true);
    setMostrarModalRecuperar(false);
  }

  function abrirRevision() {
    setTocados({ institucion: true, nombreDocente: true, areas: true, q1: true, q2: true, q3Estrategias: true, q4Elementos: true });
    setDatos((prev) => ({ ...prev, nombreDocente: normalizarNombrePropio(prev.nombreDocente) }));

    if (!formularioEsValido(errores)) {
      const primerError = document.querySelector('.campo-input--error, .select-institucion--error, .campo-error');
      if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setMostrarModalRevision(true);
  }

  async function confirmarEnvio() {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const payload = { ...datos, nombreDocente: normalizarNombrePropio(datos.nombreDocente) };
      await submitPostest(payload);
      clearDraft();
      setResultado(payload);
      setMostrarModalRevision(false);
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
          <PantallaExitoPostest nombreDocente={resultado.nombreDocente} />
        </div>
      </div>
    );
  }

  return (
    <div className="pagina">
      <div className="hoja">
        <EncabezadoPostest respondidas={respondidas} total={7} />

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
          onChangeNombre={cambiarNombreManualmente}
          areas={datos.areas}
          onToggleArea={alternarArea}
          errores={errores}
          tocados={tocados}
          onBlur={tocar}
          autocompletado={autocompletado}
        />

        {datos.institucion && (
          <div className="recuperar-nota">
            {candidatos === null ? null : candidatos.length > 0 ? (
              <button type="button" className="boton--texto" onClick={() => setMostrarModalRecuperar(true)}>
                ¿Ya presentó el Pretest? Buscar mi nombre
              </button>
            ) : (
              <span className="recuperar-nota-texto">
                No encontramos docentes con Pretest registrado para esta institución. Puede continuar diligenciando manualmente.
              </span>
            )}
          </div>
        )}

        <PreguntaOpcionUnica
          numero={1}
          texto={POSTEST_PREGUNTAS.q1.texto}
          opciones={POSTEST_PREGUNTAS.q1.opciones}
          valor={datos.q1}
          onChange={(v) => {
            actualizar('q1', v);
            tocar('q1');
          }}
          error={errores.q1}
          tocado={tocados.q1}
        />

        <PreguntaOpcionUnica
          numero={2}
          texto={POSTEST_PREGUNTAS.q2.texto}
          opciones={POSTEST_PREGUNTAS.q2.opciones}
          valor={datos.q2}
          onChange={(v) => {
            actualizar('q2', v);
            tocar('q2');
          }}
          error={errores.q2}
          tocado={tocados.q2}
        />

        <PreguntaChecklist
          numero={3}
          texto={POSTEST_Q3_TEXTO}
          opciones={POSTEST_Q3_ESTRATEGIAS}
          seleccion={datos.q3Estrategias}
          onToggle={(opcion, marcada) => {
            alternarQ3(opcion, marcada);
            tocar('q3Estrategias');
          }}
          sentinelOtro={POSTEST_Q3_OTRA}
          textoOtro={datos.q3Otra}
          onChangeOtro={(v) => actualizar('q3Otra', v)}
          error={errores.q3Estrategias}
          errorOtro={errores.q3Otra}
          tocado={tocados.q3Estrategias}
        />

        <fieldset className="pregunta entra">
          <PreguntaAbierta
            label={POSTEST_Q3_APLICARIA_TEXTO}
            valor={datos.q3Aplicaria}
            onChange={(v) => actualizar('q3Aplicaria', v)}
            placeholder="Opcional"
          />
        </fieldset>

        <PreguntaChecklist
          numero={4}
          texto={POSTEST_Q4_TEXTO}
          opciones={POSTEST_Q4_ELEMENTOS}
          seleccion={datos.q4Elementos}
          onToggle={(opcion, marcada) => {
            alternarQ4(opcion, marcada);
            tocar('q4Elementos');
          }}
          error={errores.q4Elementos}
          tocado={tocados.q4Elementos}
        />

        <fieldset className="pregunta entra">
          <legend className="pregunta-enunciado">
            <span className="pregunta-numero">5</span>
            {POSTEST_Q5_TEXTO}
          </legend>
          <PreguntaAbierta
            label="Aprendizaje o competencia que fortaleceré"
            valor={datos.q5Aprendizaje}
            onChange={(v) => actualizar('q5Aprendizaje', v)}
            placeholder="Opcional"
          />
          <PreguntaAbierta
            label="Estrategia metodológica activa que implementaré"
            valor={datos.q5Estrategia}
            onChange={(v) => actualizar('q5Estrategia', v)}
            placeholder="Opcional"
          />
          <PreguntaAbierta
            label="Evidencia que utilizaré para valorar el avance"
            valor={datos.q5Evidencia}
            onChange={(v) => actualizar('q5Evidencia', v)}
            placeholder="Opcional"
          />
          <PreguntaAbierta
            label="¿Cómo realizaré seguimiento a los resultados?"
            valor={datos.q5Seguimiento}
            onChange={(v) => actualizar('q5Seguimiento', v)}
            placeholder="Opcional"
          />
        </fieldset>

        <div className="acciones-finales">
          <button type="button" className="boton boton--primario" onClick={abrirRevision}>
            Revisar y enviar
          </button>
        </div>
      </div>

      {mostrarModalRecuperar && (
        <Modal titulo="¿Ya presentó el Pretest?" onCerrar={() => setMostrarModalRecuperar(false)}>
          <SelectorDocentePretest
            candidatos={candidatos || []}
            onSeleccionar={seleccionarCandidato}
            onOmitir={() => setMostrarModalRecuperar(false)}
          />
        </Modal>
      )}

      {mostrarModalRevision && (
        <Modal titulo="Revise antes de enviar" onCerrar={() => setMostrarModalRevision(false)}>
          <RevisionPostest
            datos={datos}
            enviando={enviando}
            errorEnvio={errorEnvio}
            onEditar={() => setMostrarModalRevision(false)}
            onConfirmar={confirmarEnvio}
          />
        </Modal>
      )}
    </div>
  );
}
