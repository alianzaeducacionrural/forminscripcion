import Sello from '../components/Sello.jsx';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PantallaExito({ config, institucion, totalFilas, onEnviarOtra }) {
  return (
    <div className="pantalla-exito entra">
      <Sello texto="RECIBIDO" fecha={FORMATO_FECHA.format(new Date())} />
      <h2>¡Gracias!</h2>
      <p className="pantalla-exito-institucion">{institucion}</p>
      <p className="pantalla-exito-resumen">
        Registramos su propuesta para la {config.titulo.split('.')[0]} ({totalFilas}{' '}
        {totalFilas === 1 ? 'fila' : 'filas'}). Si necesita corregir algo, puede volver a enviar
        el formulario: el Comité tomará como vigente el envío más reciente de su institución.
      </p>
      <button type="button" className="boton boton--secundario" onClick={onEnviarOtra}>
        Enviar una versión corregida
      </button>
    </div>
  );
}
