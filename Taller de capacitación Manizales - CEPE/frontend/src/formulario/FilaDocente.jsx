import { useEffect, useRef } from 'react';
import Casilla from '../components/Casilla.jsx';
import { AREAS } from '../data/catalogos.js';

export default function FilaDocente({ docente, index, errores = {}, tocado = {}, onChange, onToggleArea, onBlur, onRemove, canRemove, autoFocus }) {
  const nombreRef = useRef(null);

  useEffect(() => {
    if (autoFocus && nombreRef.current) {
      nombreRef.current.focus();
    }
  }, [autoFocus]);

  function alternarArea(area, marcada) {
    onToggleArea(area, marcada);
    onBlur('areas');
  }

  const numero = String(index + 1).padStart(2, '0');

  return (
    <div className="fila-docente entra">
      <div className="fila-docente-cabecera">
        <span className="fila-docente-numero">DOCENTE {numero}</span>
        {canRemove && (
          <button type="button" className="fila-docente-quitar" onClick={onRemove} aria-label={`Quitar docente ${numero}`}>
            Quitar
          </button>
        )}
      </div>

      <div className="campo">
        <label className="campo-etiqueta" htmlFor={`nombre-${index}`}>
          Nombre completo
        </label>
        <input
          ref={nombreRef}
          id={`nombre-${index}`}
          type="text"
          className={`campo-input ${errores.nombre && tocado.nombre ? 'campo-input--error' : ''}`}
          value={docente.nombre}
          onChange={(e) => onChange('nombre', e.target.value)}
          onBlur={() => onBlur('nombre')}
          placeholder="Ej. María Fernanda Ospina Ríos"
          autoComplete="name"
        />
        {errores.nombre && tocado.nombre && <p className="campo-error">{errores.nombre}</p>}
      </div>

      <div className="campo">
        <label className="campo-etiqueta" htmlFor={`telefono-${index}`}>
          Teléfono de contacto
        </label>
        <input
          id={`telefono-${index}`}
          type="tel"
          inputMode="tel"
          className={`campo-input campo-input--mono ${errores.telefono && tocado.telefono ? 'campo-input--error' : ''}`}
          value={docente.telefono}
          onChange={(e) => onChange('telefono', e.target.value)}
          onBlur={() => onBlur('telefono')}
          placeholder="Ej. 3117654321"
          autoComplete="tel"
        />
        {errores.telefono && tocado.telefono && <p className="campo-error">{errores.telefono}</p>}
      </div>

      <div className="campo">
        <span className="campo-etiqueta" id={`areas-label-${index}`}>
          Área(s) del conocimiento
        </span>
        <div className="grupo-areas" role="group" aria-labelledby={`areas-label-${index}`}>
          {AREAS.map((area) => (
            <Casilla
              key={area}
              etiqueta={area}
              checked={(docente.areas || []).includes(area)}
              onChange={(marcada) => alternarArea(area, marcada)}
            />
          ))}
        </div>
        {errores.areas && tocado.areas && <p className="campo-error">{errores.areas}</p>}
      </div>
    </div>
  );
}
