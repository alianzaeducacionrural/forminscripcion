import './Progreso.css';

/** Barra fija arriba: se ve siempre cuánto falta, sin esconder ni bloquear nada.
 * Se anima con transform (no con width). */
export default function Progreso({ respondidas, total, etiqueta }) {
  const fraccion = total > 0 ? respondidas / total : 0;
  const completo = total > 0 && respondidas >= total;

  return (
    <div className={`progreso ${completo ? 'progreso--completo' : ''}`} role="status" aria-live="polite">
      <div className="progreso-interior">
        <span className="progreso-etiqueta">{etiqueta}</span>
        <div className="progreso-barra">
          <div className="progreso-relleno" style={{ transform: `scaleX(${fraccion})` }} />
        </div>
        <span className="progreso-texto">
          {completo ? '¡Listo para enviar!' : `${respondidas} de ${total}`}
        </span>
      </div>
    </div>
  );
}
