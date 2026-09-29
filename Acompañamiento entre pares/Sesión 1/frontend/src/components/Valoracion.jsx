import { VALORACIONES } from '../data/catalogos.js';
import './Valoracion.css';

/**
 * Semáforo de valoración de "Mi capital de experiencia": 3 opciones con
 * significado propio (domina / fortaleciendo / aprender), cada una con su
 * color fijo — el mismo semáforo de la hoja original, como grupo de radios
 * accesible (no un <select>, para que las 3 se vean siempre de un vistazo).
 */
export default function Valoracion({ id, valor, onCambiar, error }) {
  return (
    <div className="valoracion" role="radiogroup" aria-labelledby={`${id}-titulo`} aria-invalid={Boolean(error)}>
      {VALORACIONES.map((v) => {
        const activo = valor === v.valor;
        return (
          <label key={v.valor} className={`valoracion-opcion valoracion-opcion--${v.color} ${activo ? 'valoracion-opcion--activa' : ''}`}>
            <input
              type="radio"
              name={id}
              value={v.valor}
              checked={activo}
              onChange={() => onCambiar(v.valor)}
              className="valoracion-input"
            />
            <span className="valoracion-punto" aria-hidden="true" />
            <span className="valoracion-texto">{v.etiqueta}</span>
          </label>
        );
      })}
      {error && <p className="campo-error">{error}</p>}
    </div>
  );
}
