import { useState } from 'react';
import { AREAS_COLOR } from '../data/catalogos.js';
import './SelectorDocentePretest.css';

/**
 * Contenido del modal de recuperación de datos del postest: lista de
 * docentes que ya presentaron el Pretest en la institución elegida. Cada
 * fila es un solo botón (no anida el chip `Casilla`, que también es un
 * botón, para no romper la semántica de botón-dentro-de-botón) con chips de
 * área de solo lectura para que el docente se reconozca por color.
 */
export default function SelectorDocentePretest({ candidatos, onSeleccionar, onOmitir }) {
  const [busqueda, setBusqueda] = useState('');
  const filtrados = candidatos.filter((c) => c.nombre_docente.toLowerCase().includes(busqueda.trim().toLowerCase()));

  return (
    <section className="selector-docente entra" aria-label="Buscar mi registro del pretest">
      <h2>¿Ya presentó el Pretest?</h2>
      <p className="selector-docente-instruccion">
        Toque su nombre para completar sus datos automáticamente.
      </p>

      {candidatos.length > 5 && (
        <input
          type="text"
          className="campo-input selector-docente-buscar"
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoFocus
        />
      )}

      <ul className="selector-docente-lista">
        {filtrados.map((c) => (
          <li key={c.nombre_docente}>
            <button type="button" className="selector-docente-item" onClick={() => onSeleccionar(c)}>
              <span className="selector-docente-item-nombre">{c.nombre_docente}</span>
              <span className="selector-docente-item-areas">
                {c.areas.map((area) => (
                  <span key={area} className={`chip-lectura chip-lectura--${AREAS_COLOR[area] || 'indigo'}`}>
                    {area}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
        {filtrados.length === 0 && <li className="selector-docente-vacio">No hay coincidencias.</li>}
      </ul>

      <button type="button" className="boton boton--secundario selector-docente-omitir" onClick={onOmitir}>
        No estoy en la lista / continuar manualmente
      </button>
    </section>
  );
}
