export default function RevisionMatriz({ config, datos, enviando, errorEnvio, onEditar, onConfirmar }) {
  const tituloFila = (fila, i) =>
    config.filasFijas.length > 0 ? fila.aspecto.trim() : `${config.etiquetaFila} ${i + 1}`;

  // Mientras se envía, el modal muestra solo el spinner: no hay nada que pulsar ni cerrar.
  if (enviando) {
    return (
      <section className="enviando entra" role="status" aria-live="assertive">
        <span className="spinner" aria-hidden="true" />
        <h2>Enviando su matriz…</h2>
        <p>Esto puede tardar unos segundos. No cierre ni recargue esta ventana.</p>
      </section>
    );
  }

  return (
    <section className="revision entra" aria-label="Confirmar envío">
      <h2>¿Confirma el envío?</h2>
      <p className="revision-quien">
        <strong>{datos.nombre.trim()}</strong> · {datos.institucion.trim()}
      </p>
      <p className="revision-ayuda">Revise que todo esté correcto antes de confirmar.</p>

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
          No se pudo enviar. {errorEnvio}
        </p>
      )}

      <div className="revision-acciones">
        <button type="button" className="boton" onClick={onEditar}>
          Volver a editar
        </button>
        <button type="button" className="boton boton--primario" onClick={onConfirmar}>
          {errorEnvio ? 'Reintentar envío' : 'Confirmar y enviar'}
        </button>
      </div>
    </section>
  );
}
