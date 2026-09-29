import { MAX_CARACTERES } from '../data/catalogos.js';

/** Una acción de acompañamiento como tarjeta: reto, acción, responsable,
 * fecha y evidencia de avance. Al menos una es obligatoria; las demás se
 * pueden quitar. */
export default function FilaAccion({ config, fila, indice, errores = {}, visibles, onCambiar, onTocar, onQuitar, puedeQuitar }) {
  const idBase = `accion-${fila.id}`;
  const mensaje = (clave) => (visibles(clave) ? errores[clave] : null);

  return (
    <section className="fila-herramienta entra" aria-labelledby={`${idBase}-titulo`}>
      <header className="fila-herramienta-cabecera">
        <span className="fila-herramienta-numero">{indice + 1}</span>
        <h2 className="fila-herramienta-titulo" id={`${idBase}-titulo`}>
          {config.etiquetaFila} {indice + 1}
        </h2>
        {puedeQuitar && (
          <button type="button" className="boton boton--texto" onClick={onQuitar} aria-label={`Quitar ${config.etiquetaFila} ${indice + 1}`}>
            Quitar
          </button>
        )}
      </header>

      <div className="fila-herramienta-cuerpo">
        {config.campos.map((c) => (
          <div key={c.clave} className="fila-campo">
            <label className="campo-etiqueta" htmlFor={`${idBase}-${c.clave}`}>
              {c.etiqueta}
            </label>
            {c.tipo === 'fecha' ? (
              <input
                id={`${idBase}-${c.clave}`}
                type="date"
                className={`campo-input ${mensaje(c.clave) ? 'campo-input--error' : ''}`}
                value={fila[c.clave]}
                onChange={(e) => onCambiar(c.clave, e.target.value)}
                onBlur={() => onTocar(c.clave)}
              />
            ) : (
              <textarea
                id={`${idBase}-${c.clave}`}
                className={`campo-input campo-textarea ${mensaje(c.clave) ? 'campo-input--error' : ''}`}
                rows={3}
                maxLength={MAX_CARACTERES}
                value={fila[c.clave]}
                onChange={(e) => onCambiar(c.clave, e.target.value)}
                onBlur={() => onTocar(c.clave)}
              />
            )}
            {mensaje(c.clave) && <p className="campo-error">{errores[c.clave]}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
