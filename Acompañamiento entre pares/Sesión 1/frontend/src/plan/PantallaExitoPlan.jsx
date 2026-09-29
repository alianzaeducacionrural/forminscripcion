import Sello from '../components/Sello.jsx';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PantallaExitoPlan({ resultado, onEnviarOtra }) {
  const { nombreExperimentado, nombreNuevo, correoExperimentado, correoNuevo, correoEnviado } = resultado;

  return (
    <section className="tarjeta exito entra">
      <Sello texto="RECIBIDO" fecha={FORMATO_FECHA.format(new Date())} />
      <h1>¡Listo, {nombreExperimentado.split(' ')[0]} y {nombreNuevo.split(' ')[0]}!</h1>
      <p className="exito-institucion">Plan de acompañamiento guardado</p>
      {correoEnviado ? (
        <p className="exito-resumen">
          Les enviamos un PDF con el plan completo a {correoExperimentado} y {correoNuevo}. Si necesitan corregir
          algo, pueden volver a enviarlo: se tomará como vigente el envío más reciente.
        </p>
      ) : (
        <p className="exito-resumen">
          El plan quedó guardado, pero no pudimos enviar el correo con el PDF. Avísenle a la coordinación de
          Acompañamiento entre Pares para que se los reenvíe.
        </p>
      )}
      <button type="button" className="boton" onClick={onEnviarOtra}>
        Enviar una versión corregida
      </button>
    </section>
  );
}
