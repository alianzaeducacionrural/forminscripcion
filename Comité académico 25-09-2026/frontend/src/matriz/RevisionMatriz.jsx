export default function RevisionMatriz({ config, datos, enviando, errorEnvio, onEditar, onConfirmar }) {
  const tituloFila = (fila, i) =>
    config.filasFijas.length > 0 ? fila.aspecto.trim() : `${config.etiquetaFila} ${i + 1}`;

  return (
    <section className="revision entra" aria-label="Revise antes de enviar">
      <h2>Revise antes de enviar</h2>
      <p className="revision-quien">
        <strong>{datos.nombre.trim()}</strong> · {datos.institucion.trim()}
      </p>

      <ol className="revision-lista">
        {datos.filas.map((fila, i) => (
          <li key={fila.id} className="revision-item">
            <span className="revision-item-titulo">
              <span className="revision-item-numero">{i + 1}</span>
              {tituloFila(fila, i)}
              {fila.categoria ? <em className="revision-item-categoria">{fila.categoria}</em> : null}
            </span>
            <dl className="revision-campos">
              {config.campos.map((c) => (
                <div key={c.clave} className="revision-campo">
                  <dt>{c.etiqueta}</dt>
                  <dd>{fila[c.clave].trim()}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>

      {errorEnvio && (
        <p className="revision-error" role="alert">
          No se pudo enviar: {errorEnvio}
        </p>
      )}

      <div className="revision-acciones">
        <button type="button" className="boton" onClick={onEditar} disabled={enviando}>
          Editar
        </button>
        <button type="button" className="boton boton--primario" onClick={onConfirmar} disabled={enviando}>
          {enviando ? 'Enviando…' : 'Confirmar y enviar'}
        </button>
      </div>
    </section>
  );
}
