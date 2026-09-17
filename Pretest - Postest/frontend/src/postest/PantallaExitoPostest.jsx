import Sello from '../components/Sello.jsx';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PantallaExitoPostest({ nombreDocente }) {
  return (
    <div className="pantalla-exito entra">
      <Sello texto="RECIBIDO" fecha={FORMATO_FECHA.format(new Date())} />
      <h2>¡Gracias, {nombreDocente}!</h2>
      <p className="pantalla-exito-resumen">
        Registramos sus respuestas del Postest. Gracias por participar en el taller de
        Estrategias metodológicas activas.
      </p>
    </div>
  );
}
