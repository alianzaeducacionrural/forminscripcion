import { VALORACIONES } from '../data/catalogos.js';
import './Valoracion.css';

/**
 * Semáforo de valoración de "Mi capital de experiencia": 3 opciones con
 * significado propio (domina / fortaleciendo / aprender), como chips
 * seleccionables — sin el círculo de radio nativo. Por defecto los 3 chips
 * son neutros (gris); al elegir uno, ESE toma su color propio del semáforo
 * (verde / ámbar / azul); los demás quedan neutros.
 */
export default function Valoracion({ id, valor, onCambiar, error }) {
  return (
    <div className="valoracion" role="radiogroup" aria-labelledby={`${id}-titulo`} aria-invalid={Boolean(error)}>
      <div className="valoracion-chips">
        {VALORACIONES.map((v) => {
          const activo = valor === v.valor;
          return (
            <label key={v.valor} className={`valoracion-chip valoracion-chip--${v.color} ${activo ? 'valoracion-chip--activo' : ''}`}>
              <input
                type="radio"
                name={id}
                value={v.valor}
                checked={activo}
                onChange={() => onCambiar(v.valor)}
                className="valoracion-input"
              />
              {v.etiqueta}
            </label>
          );
        })}
      </div>
      {error && <p className="campo-error">{error}</p>}
    </div>
  );
}
