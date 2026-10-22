import './Casilla.css';

/**
 * Chip de área del conocimiento: botón redondeado que se marca y desmarca,
 * con su propio color de identidad (uno de los 5 tonos de `AREAS_COLOR`).
 * Sin marcar es un contorno suave del mismo tono; marcado se rellena por
 * completo — el botón entero es el estado, sin casilla-cuadro separada.
 */
export default function Casilla({ etiqueta, checked, onChange, color = 'indigo', disabled = false }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      className={`chip chip--${color} ${checked ? 'chip--marcado' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="chip-check" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="chip-etiqueta">{etiqueta}</span>
    </button>
  );
}
