import Sello from '../components/Sello.jsx';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PantallaExitoPlan({ resultado, onEnviarOtra }) {
  const { nombre1, nombre2, correo1, correo2, correoEnviado } = resultado;

  return (
    <section className="tarjeta exito entra">
      <Sello texto="RECIBIDO" fecha={FORMATO_FECHA.format(new Date())} />
      <h1>¡Listo, {nombre1.split(' ')[0]} y {nombre2.split(' ')[0]}!</h1>
      <p className="exito-institucion">Plan de acompañamiento guardado</p>
      {correoEnviado ? (
        <p className="exito-resumen">
          Les enviamos un PDF con el plan completo a {correo1} y {correo2}. Si necesitan corregir
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
