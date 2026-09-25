import Sello from '../components/Sello.jsx';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PantallaExito({ config, resultado, onEnviarOtra }) {
  const { nombre, institucion, totalFilas } = resultado;
  const unidad = config.filasFijas.length > 0 ? ['aspecto', 'aspectos'] : ['acción', 'acciones'];

  return (
    <section className="tarjeta exito entra">
      <Sello texto="RECIBIDO" fecha={FORMATO_FECHA.format(new Date())} />
      <h1>¡Gracias, {nombre.split(' ')[0]}!</h1>
      <p className="exito-institucion">{institucion}</p>
      <p className="exito-resumen">
        Registramos su Matriz {config.numero} con {totalFilas} {totalFilas === 1 ? unidad[0] : unidad[1]}.
        Si necesita corregir algo, puede volver a enviarla: el Comité tomará como vigente su envío más
        reciente.
      </p>
      <button type="button" className="boton" onClick={onEnviarOtra}>
        Enviar una versión corregida
      </button>
    </section>
  );
}
