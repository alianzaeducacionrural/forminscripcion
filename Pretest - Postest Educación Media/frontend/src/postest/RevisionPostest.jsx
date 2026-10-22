import { POSTEST_PREGUNTAS, POSTEST_Q3_TEXTO, POSTEST_Q4_TEXTO } from '../data/catalogos.js';

export default function RevisionPostest({ datos, enviando, errorEnvio, onEditar, onConfirmar }) {
  return (
    <section className="revision entra" aria-label="Revise antes de enviar">
      <h2>Revise antes de enviar</h2>
      <p className="revision-institucion">
        {datos.nombreDocente} — {datos.institucion}
      </p>

      <ol className="revision-lista">
        <li className="revision-item">
          <span className="revision-item-pregunta">1. {POSTEST_PREGUNTAS.q1.texto}</span>
          <span className="revision-item-respuesta">{POSTEST_PREGUNTAS.q1.opciones[datos.q1]}</span>
        </li>
        <li className="revision-item">
          <span className="revision-item-pregunta">2. {POSTEST_PREGUNTAS.q2.texto}</span>
          <span className="revision-item-respuesta">{POSTEST_PREGUNTAS.q2.opciones[datos.q2]}</span>
        </li>
        <li className="revision-item">
          <span className="revision-item-pregunta">3. {POSTEST_Q3_TEXTO}</span>
          <span className="revision-item-respuesta">
            {datos.q3Estrategias.join(', ')}
            {datos.q3Estrategias.includes('Otra') && datos.q3Otra ? ` (Otra: ${datos.q3Otra})` : ''}
            {datos.q3Aplicaria ? ` — ${datos.q3Aplicaria}` : ''}
          </span>
        </li>
        <li className="revision-item">
          <span className="revision-item-pregunta">4. {POSTEST_Q4_TEXTO}</span>
          <span className="revision-item-respuesta">{datos.q4Elementos.join(', ')}</span>
        </li>
        {(datos.q5Aprendizaje || datos.q5Estrategia || datos.q5Evidencia || datos.q5Seguimiento) && (
          <li className="revision-item">
            <span className="revision-item-pregunta">5. Aplicación a mi práctica</span>
            <span className="revision-item-respuesta">
              {[datos.q5Aprendizaje, datos.q5Estrategia, datos.q5Evidencia, datos.q5Seguimiento]
                .filter(Boolean)
                .join(' · ')}
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
