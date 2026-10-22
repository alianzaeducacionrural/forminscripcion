import './preguntas.css';

/**
 * Pregunta de opción única, renderizada como lista de radio-cards (no
 * <input type="radio"> desnudos). Marcado invierte a fondo blanco + borde
 * de marca + check — mismo lenguaje visual que el chip de área.
 */
export default function PreguntaOpcionUnica({ numero, texto, opciones, valor, onChange, error, tocado }) {
  return (
    <fieldset className="pregunta entra">
      <legend className="pregunta-enunciado">
        {numero && <span className="pregunta-numero">{numero}</span>}
        {texto}
      </legend>
      <div className="opciones-lista" role="radiogroup" aria-label={texto}>
        {Object.entries(opciones).map(([letra, textoOpcion]) => (
          <button
            key={letra}
            type="button"
            role="radio"
            aria-checked={valor === letra}
            className={`opcion-card ${valor === letra ? 'opcion-card--marcada' : ''}`}
            onClick={() => onChange(letra)}
          >
            <span className="opcion-card-marca" aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="opcion-card-texto">{textoOpcion}</span>
          </button>
        ))}
      </div>
      {error && tocado && <p className="campo-error">{error}</p>}
    </fieldset>
  );
}
