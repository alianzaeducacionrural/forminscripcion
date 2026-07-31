import Membrete from '../components/Membrete.jsx';

export default function Encabezado() {
  return (
    <header className="encabezado">
      <Membrete />
      <div className="encabezado-cuerpo">
        <h1>Capacitación en Metodologías Activas</h1>
        <p className="encabezado-subtitulo">Formulario de inscripción de docentes</p>
        <div className="encabezado-objetivo">
          <span className="encabezado-objetivo-rotulo">Objetivo del taller</span>
          <p>
            Fortalecer habilidades en los docentes para el uso de metodologías activas y el
            mejoramiento de aprendizajes de los estudiantes, en procura de las trayectorias
            educativas completas.
          </p>
        </div>
        <p className="encabezado-instruccion">
          El rector o la rectora diligencia este formulario para inscribir a los docentes de
          su institución que participarán en el taller. Puede volver a abrir este enlace más
          adelante para agregar los docentes que hagan falta.
        </p>
      </div>
    </header>
  );
}
