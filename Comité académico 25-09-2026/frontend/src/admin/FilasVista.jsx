import { MATRIZ_2 } from '../data/catalogos.js';

/** Las filas de un envío como fichas de solo lectura (una por acción / aspecto). */
export default function FilasVista({ config, filas, mostrarIES }) {
  return (
    <ol className="fichas">
      {filas.map((fila) => (
        <li key={`${fila.id_envio}-${fila.orden}`} className={`ficha ficha--${config.tema}`}>
          <div className="ficha-cabecera">
            <span className="ficha-numero">{fila.orden}</span>
            <span className="ficha-titulo">
              {config === MATRIZ_2 ? fila.aspecto : `${config.etiquetaFila} ${fila.orden}`}
            </span>
            {fila.personalizado && <span className="ficha-chip">Aspecto agregado por la IES</span>}
            {fila.categoria && <span className="ficha-chip">{fila.categoria}</span>}
            {mostrarIES && <span className="ficha-ies">{fila.institucion}</span>}
          </div>
          <dl className="ficha-campos">
            {config.campos.map((c) => (
              <div key={c.clave} className={`ficha-campo ${c.clave === 'accion' ? 'ficha-campo--ancho' : ''}`}>
                <dt>{c.etiqueta}</dt>
                <dd>{fila[c.columna]}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ol>
  );
}
