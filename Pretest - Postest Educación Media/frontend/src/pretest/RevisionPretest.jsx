import { PRETEST_PREGUNTAS, PRETEST_P4_TEXTO } from '../data/catalogos.js';

export default function RevisionPretest({ datos, enviando, errorEnvio, onEditar, onConfirmar }) {
  return (
    <section className="revision entra" aria-label="Revise antes de enviar">
      <h2>Revise antes de enviar</h2>
      <p className="revision-institucion">
        {datos.nombreDocente} — {datos.institucion}
      </p>

      <ol className="revision-lista">
        <li className="revision-item">
          <span className="revision-item-pregunta">1. {PRETEST_PREGUNTAS.p1.texto}</span>
          <span className="revision-item-respuesta">{PRETEST_PREGUNTAS.p1.opciones[datos.p1]}</span>
        </li>
        <li className="revision-item">
          <span className="revision-item-pregunta">2. {PRETEST_PREGUNTAS.p2.texto}</span>
          <span className="revision-item-respuesta">{PRETEST_PREGUNTAS.p2.opciones[datos.p2]}</span>
        </li>
        <li className="revision-item">
          <span className="revision-item-pregunta">3. {PRETEST_PREGUNTAS.p3.texto}</span>
          <span className="revision-item-respuesta">{PRETEST_PREGUNTAS.p3.opciones[datos.p3]}</span>
        </li>
        <li className="revision-item">
          <span className="revision-item-pregunta">4. {PRETEST_P4_TEXTO}</span>
          <span className="revision-item-respuesta">
            {datos.p4Elementos.join(', ')}
            {datos.p4Elementos.includes('Otro') && datos.p4Otro ? ` (Otro: ${datos.p4Otro})` : ''}
          </span>
        </li>
        {(datos.p5Competencia || datos.p5Estrategia || datos.p5Evidencia) && (
          <li className="revision-item">
            <span className="revision-item-pregunta">5. Estrategia metodológica activa</span>
            <span className="revision-item-respuesta">
              {[datos.p5Competencia, datos.p5Estrategia, datos.p5Evidencia].filter(Boolean).join(' · ')}
            </span>
          </li>
        )}
      </ol>

      {errorEnvio && (
        <p className="revision-error" role="alert">
          No se pudo enviar: {errorEnvio}
        </p>
      )}

      <div className="revision-acciones">
        <button type="button" className="boton boton--secundario" onClick={onEditar} disabled={enviando}>
          Editar
        </button>
        <button type="button" className="boton boton--primario" onClick={onConfirmar} disabled={enviando}>
          {enviando ? 'Enviando…' : 'Confirmar y enviar'}
        </button>
      </div>
    </section>
  );
}
