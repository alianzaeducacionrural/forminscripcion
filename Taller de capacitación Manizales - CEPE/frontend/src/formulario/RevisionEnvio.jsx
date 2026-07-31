import { AREAS_ABREVIADAS } from '../data/catalogos.js';

export default function RevisionEnvio({ institucion, docentes, enviando, errorEnvio, onEditar, onConfirmar }) {
  return (
    <section className="revision entra" aria-label="Revisión antes de enviar">
      <h2>Revise antes de enviar</h2>
      <p className="revision-institucion">{institucion}</p>

      <ol className="revision-lista">
        {docentes.map((docente, i) => (
          <li key={i} className="revision-item">
            <span className="revision-item-numero">{String(i + 1).padStart(2, '0')}</span>
            <div className="revision-item-cuerpo">
              <span className="revision-item-nombre">{docente.nombre}</span>
              <span className="revision-item-detalle">
                {docente.telefono} · {docente.areas.map((a) => AREAS_ABREVIADAS[a] || a).join(', ')}
              </span>
            </div>
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
