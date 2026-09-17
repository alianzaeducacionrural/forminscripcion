/** Barra de avance en vivo — todas las preguntas están visibles, esto es lo
 * que comunica movimiento sin esconder cuánto falta ni bloquear la edición. */
export default function Progreso({ respondidas, total }) {
  const pct = total > 0 ? Math.round((respondidas / total) * 100) : 0;
  return (
    <div className="progreso" role="status">
      <div className="progreso-barra">
        <div className="progreso-relleno" style={{ width: `${pct}%` }} />
      </div>
      <span className="progreso-texto">
        {respondidas} de {total} respondidas
      </span>
    </div>
  );
}
