import Membrete from '../components/Membrete.jsx';
import Progreso from '../components/Progreso.jsx';

export default function EncabezadoPretest({ respondidas, total }) {
  return (
    <header className="encabezado">
      <Membrete />
      <div className="encabezado-cuerpo">
        <h1>Pretest</h1>
        <p className="encabezado-subtitulo">
          Estrategias metodológicas activas y uso pedagógico de evidencias — Iniciativa La
          Universidad en el Campo / Comunidades de Cambio
        </p>
        <Progreso respondidas={respondidas} total={total} />
        <p className="encabezado-instruccion">
          Este cuestionario no tiene respuestas correctas ni incorrectas — nos ayuda a
          conocer qué sabe hoy sobre estrategias metodológicas activas, antes del taller.
        </p>
      </div>
    </header>
  );
}
