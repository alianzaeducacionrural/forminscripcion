import './Casilla.css';

/**
 * Una casilla de formulario oficial: cuadro que se marca, con un código
 * corto opcional a la izquierda (como "IE01" o "d3") y una etiqueta.
 * `type="radio"` para selección única (una IE), `type="checkbox"` para
 * selección múltiple (áreas de un docente).
 */
export default function Casilla({ codigo, etiqueta, checked, onChange, type = 'checkbox', name, disabled = false }) {
  return (
    <button
      type="button"
      role={type}
      aria-checked={checked}
      disabled={disabled}
      name={name}
      className={`casilla ${checked ? 'casilla--marcada' : ''} ${type === 'radio' ? 'casilla--radio' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="casilla-cuadro" aria-hidden="true">
        {checked && (
          <svg viewBox="0 0 16 16" className="casilla-check">
            <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {codigo && <span className="casilla-codigo">{codigo}</span>}
      <span className="casilla-etiqueta">{etiqueta}</span>
    </button>
  );
}
