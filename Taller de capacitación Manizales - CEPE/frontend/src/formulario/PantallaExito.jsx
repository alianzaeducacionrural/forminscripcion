import Sello from '../components/Sello.jsx';
import { AREAS_ABREVIADAS } from '../data/catalogos.js';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PantallaExito({ institucion, docentes, onInscribirMas }) {
  return (
    <div className="pantalla-exito entra">
      <Sello texto="RECIBIDO" fecha={FORMATO_FECHA.format(new Date())} />

      <h2>Inscripción registrada</h2>
      <p className="pantalla-exito-institucion">{institucion}</p>
      <p className="pantalla-exito-resumen">
        {docentes.length} {docentes.length === 1 ? 'docente inscrito' : 'docentes inscritos'} para la
        Capacitación en Metodologías Activas.
      </p>

      <ul className="pantalla-exito-lista">
        {docentes.map((docente, i) => (
          <li key={i} className="pantalla-exito-item">
            <span className="pantalla-exito-item-nombre">{docente.nombre}</span>
            <span className="pantalla-exito-item-areas">
              {docente.areas.map((a) => AREAS_ABREVIADAS[a] || a).join(' · ')}
            </span>
          </li>
        ))}
      </ul>

      <button type="button" className="boton boton--secundario" onClick={onInscribirMas}>
        Inscribir más docentes de {institucion}
      </button>
      <p className="pantalla-exito-nota">
        ¿Olvidó a algún docente? Puede volver a abrir este mismo enlace cuando quiera: los
        nuevos docentes se agregan, no se pierde lo ya registrado.
      </p>
    </div>
  );
}
