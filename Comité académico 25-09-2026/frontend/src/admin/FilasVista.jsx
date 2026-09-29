import { MATRIZ_2, valoracionPorValor } from '../data/catalogos.js';

/** Las filas de un envío como fichas de solo lectura (una por acción / aspecto). */
export default function FilasVista({ config, filas }) {
  return (
    <ol className="fichas">
      {filas.map((fila) => {
        const valoracion = fila.valoracion ? valoracionPorValor(fila.valoracion) : null;
        return (
          <li key={`${fila.id_envio}-${fila.orden}`} className={`ficha ficha--${config.tema}`}>
            <div className="ficha-cabecera">
              <span className="ficha-numero">{fila.orden}</span>
              <span className="ficha-titulo">
                {config === MATRIZ_2 ? fila.aspecto : `${config.etiquetaFila} ${fila.orden}`}
              </span>
              {fila.personalizado && <span className="ficha-chip">Aspecto agregado</span>}
              {fila.categoria && (
                <span className="ficha-chip">
                  {fila.categoria === 'Otra' && fila.categoria_otra ? `Otra: ${fila.categoria_otra}` : fila.categoria}
                </span>
              )}
              {valoracion && (
                <span className={`ficha-valoracion ficha-valoracion--${valoracion.color}`}>{valoracion.etiqueta}</span>
              )}
            </div>
            <dl className="ficha-campos">
              {config.campos
                .filter((c) => c.tipo !== 'valoracion')
                .map((c) => (
                  <div key={c.clave} className={`ficha-campo ${c.clave === 'accion' ? 'ficha-campo--ancho' : ''}`}>
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
