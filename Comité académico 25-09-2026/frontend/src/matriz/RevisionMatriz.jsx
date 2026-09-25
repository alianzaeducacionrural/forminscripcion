export default function RevisionMatriz({ config, datos, enviando, errorEnvio, onEditar, onConfirmar }) {
  return (
    <section className="revision entra" aria-label="Revise antes de enviar">
      <h2>Revise antes de enviar</h2>
      <p className="revision-institucion">
        {datos.institucion} — {datos.filas.length} {datos.filas.length === 1 ? 'fila' : 'filas'}
      </p>

      <ol className="revision-lista">
        {datos.filas.map((fila, i) => (
          <li key={fila.id} className="revision-item">
            <span className="revision-item-pregunta">
              {fila.fija ? fila.aspecto : config.filasFijas.length > 0 ? fila.aspecto : `${config.etiquetaFila} ${i + 1}`}
              {fila.categoria ? ` · ${fila.categoria}` : ''}
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
        <button type="button" className="boton boton--secundario" onClick={onEditar} disabled={enviando}>
          Editar
        </button>
        <button type="button" className="boton boton--primario" onClick={onConfirmar} disabled={enviando}>
          {enviando ? 'Enviando…' : 'Confirmar y enviar'}
        </button>
      </div>
    </section>
  );
}
