import { valoracionPorValor } from '../data/catalogos.js';

/** Las filas de un envío como fichas de solo lectura (una por componente). */
export default function FilasVista({ config, filas }) {
  return (
    <ol className="fichas">
      {filas.map((fila) => {
        const val = config.conValoracion ? valoracionPorValor(fila.valoracion) : null;
        return (
          <li key={`${fila.id_envio}-${fila.orden}`} className={`ficha ficha--${config.tema}`}>
            <div className="ficha-cabecera">
              <span className="ficha-numero">{fila.orden}</span>
              <span className="ficha-titulo">{fila.componente}</span>
              {val && <span className={`ficha-chip ficha-chip--${val.color}`}>{val.etiquetaCorta}</span>}
            </div>
            <dl className="ficha-campos">
              {config.campos.map((c) => (
                <div key={c.clave} className="ficha-campo">
                  <dt>{c.etiqueta}</dt>
                  <dd>{fila[c.columna]}</dd>
                </div>
              ))}
            </dl>
          </li>
        );
      })}
    </ol>
  );
}
