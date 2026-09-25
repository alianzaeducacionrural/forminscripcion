import { MAX_CARACTERES } from '../data/catalogos.js';

/**
 * Una fila de la matriz como tarjeta: en la hoja original es una fila de tabla
 * de 7 columnas, que en un teléfono es ilegible; aquí cada columna es un campo
 * con su encabezado oficial como etiqueta.
 */
export default function FilaMatriz({
  config,
  fila,
  indice,
  errores = {},
  visibles,
  onCambiar,
  onTocar,
  onQuitar,
  puedeQuitar,
}) {
  const esAspectoLibre = config.filasFijas.length > 0 && !fila.fija;
  const idBase = `fila-${fila.id}`;
  const tituloLibre = config.filasFijas.length > 0 && fila.aspecto.trim();
  const titulo = fila.fija ? fila.aspecto : tituloLibre || `${config.etiquetaFila} ${indice + 1}`;

  function mensaje(clave) {
    return visibles(clave) ? errores[clave] : null;
  }

  return (
    <section className="fila-matriz entra" aria-labelledby={`${idBase}-titulo`}>
      <header className="fila-matriz-cabecera">
        <span className="fila-matriz-numero">{indice + 1}</span>
        <h2 className="fila-matriz-titulo" id={`${idBase}-titulo`}>
          {titulo}
        </h2>
        {puedeQuitar && (
          <button
            type="button"
            className="boton boton--texto fila-matriz-quitar"
            onClick={onQuitar}
            aria-label={`Quitar ${titulo}`}
          >
            Quitar
          </button>
        )}
      </header>

      <div className="fila-matriz-cuerpo">
        {esAspectoLibre && (
          <div className="fila-campo fila-campo--ancho">
            <label className="campo-etiqueta" htmlFor={`${idBase}-aspecto`}>
              Aspecto a fortalecer
            </label>
            <input
              id={`${idBase}-aspecto`}
              type="text"
              className={`campo-input ${mensaje('aspecto') ? 'campo-input--error' : ''}`}
              value={fila.aspecto}
              maxLength={200}
              onChange={(e) => onCambiar('aspecto', e.target.value)}
              onBlur={() => onTocar('aspecto')}
            />
            {mensaje('aspecto') && <p className="campo-error">{errores.aspecto}</p>}
          </div>
        )}

        {config.categorias.length > 0 && (
          <div className="fila-campo fila-campo--ancho">
            <label className="campo-etiqueta" htmlFor={`${idBase}-categoria`}>
              Categoría orientadora <span className="campo-opcional">(opcional)</span>
            </label>
            <div className="select-envoltura">
              <select
                id={`${idBase}-categoria`}
                className="select-institucion select-institucion--compacto"
                value={fila.categoria}
                onChange={(e) => onCambiar('categoria', e.target.value)}
              >
                <option value="">Sin categoría</option>
                {config.categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Otra">Otra</option>
              </select>
            </div>
          </div>
        )}

        {config.campos.map((c, i) => (
          <div key={c.clave} className={`fila-campo ${i === 0 && config.categorias.length > 0 ? 'fila-campo--ancho' : ''}`}>
            <label className="campo-etiqueta" htmlFor={`${idBase}-${c.clave}`}>
              {c.etiqueta}
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
      </div>
    </section>
  );
}
