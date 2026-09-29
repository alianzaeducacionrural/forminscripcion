import { limpiarTexto } from './validarPlan.js';

export default function RevisionPlan({ config, datos, enviando, errorEnvio, onEditar, onConfirmar }) {
  // Mientras se envía, el modal muestra solo el spinner: no hay nada que pulsar ni cerrar.
  if (enviando) {
    return (
      <section className="enviando entra" role="status" aria-live="assertive">
        <span className="spinner" aria-hidden="true" />
        <h2>Enviando su plan…</h2>
        <p>Estamos generando el PDF y enviándolo por correo a ambos. Puede tardar un poco más de lo usual — no cierre ni recargue esta ventana.</p>
      </section>
    );
  }

  return (
    <section className="revision entra" aria-label="Confirmar envío">
      <h2>¿Confirma el envío?</h2>
      <p className="revision-quien">
        <strong>{limpiarTexto(datos.nombreExperimentado)}</strong> ({limpiarTexto(datos.institucionExperimentado)}) y{' '}
        <strong>{limpiarTexto(datos.nombreNuevo)}</strong> ({limpiarTexto(datos.institucionNuevo)})
      </p>
      <p className="revision-ayuda">
        Enviaremos un PDF con este plan a {limpiarTexto(datos.correoExperimentado)} y {limpiarTexto(datos.correoNuevo)}.
        Revise que todo esté correcto antes de confirmar.
      </p>

      <ol className="revision-lista">
        {datos.acciones.map((accion, i) => (
          <li key={accion.id} className="revision-item">
            <span className="revision-item-titulo">
              <span className="revision-item-numero">{i + 1}</span>
              {config.etiquetaFila} {i + 1}
            </span>
            <dl className="revision-campos">
              {config.campos.map((c) => (
                <div key={c.clave} className="revision-campo">
                  <dt>{c.etiqueta}</dt>
                  <dd>{accion[c.clave].trim()}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
        <li className="revision-item">
          <span className="revision-item-titulo">Compromiso de cierre</span>
          <dl className="revision-campos">
            <div className="revision-campo">
              <dd>{limpiarTexto(datos.compromiso)}</dd>
            </div>
          </dl>
        </li>
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
