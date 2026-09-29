import Valoracion from '../components/Valoracion.jsx';
import { MAX_CARACTERES } from '../data/catalogos.js';

/**
 * Una fila de la herramienta como tarjeta: en la hoja original es una fila de
 * tabla, ilegible en un teléfono; aquí cada componente (Administrativo,
 * Curricular, Capacitación, Comunitario) es su propia tarjeta con un campo
 * por columna, usando el encabezado oficial como etiqueta.
 */
export default function FilaComponente({ config, fila, indice, errores = {}, visibles, onCambiar, onTocar }) {
  const idBase = `fila-${fila.componente}`;

  const mensaje = (clave) => (visibles(clave) ? errores[clave] : null);

  return (
    <section className="fila-herramienta entra" aria-labelledby={`${idBase}-titulo`}>
      <header className="fila-herramienta-cabecera">
        <span className="fila-herramienta-numero">{indice + 1}</span>
        <h2 className="fila-herramienta-titulo" id={`${idBase}-titulo`}>
          {fila.componente}
        </h2>
      </header>

      <div className="fila-herramienta-cuerpo">
        {config.campos.map((c) => (
          <div key={c.clave} className="fila-campo">
            <label className="campo-etiqueta" htmlFor={`${idBase}-${c.clave}`}>
              {c.etiqueta}
              {c.ayuda && <span className="campo-ayuda"> — {c.ayuda}</span>}
            </label>
            <textarea
              id={`${idBase}-${c.clave}`}
              className={`campo-input campo-textarea ${mensaje(c.clave) ? 'campo-input--error' : ''}`}
              rows={3}
              maxLength={MAX_CARACTERES}
              value={fila[c.clave]}
              onChange={(e) => onCambiar(c.clave, e.target.value)}
              onBlur={() => onTocar(c.clave)}
            />
            {mensaje(c.clave) && <p className="campo-error">{errores[c.clave]}</p>}
          </div>
        ))}

        {config.conValoracion && (
          <div className="fila-campo fila-campo--ancho">
            <label className="campo-etiqueta" id={`${idBase}-valoracion-titulo`}>
              ¿Cómo se valora en {fila.componente.toLowerCase()}?
            </label>
            <Valoracion
              id={`${idBase}-valoracion`}
              valor={fila.valoracion}
              onCambiar={(v) => {
                onCambiar('valoracion', v);
                onTocar('valoracion');
              }}
              error={mensaje('valoracion') ? errores.valoracion : null}
            />
          </div>
        )}
      </div>
    </section>
  );
}
