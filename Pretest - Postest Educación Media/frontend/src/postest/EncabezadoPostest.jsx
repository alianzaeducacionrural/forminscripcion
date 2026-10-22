import Membrete from '../components/Membrete.jsx';
import Progreso from '../components/Progreso.jsx';
import { POSTEST_PROPOSITO } from '../data/catalogos.js';

export default function EncabezadoPostest({ respondidas, total }) {
  return (
    <header className="encabezado">
      <Membrete />
      <div className="encabezado-cuerpo">
        <h1>Postest</h1>
        <p className="encabezado-subtitulo">
          Estrategias metodológicas activas y uso pedagógico de evidencias — Iniciativa La
          Universidad en el Campo / Comunidades de Cambio
        </p>
        <Progreso respondidas={respondidas} total={total} />
        <div className="encabezado-objetivo">
          <span className="encabezado-objetivo-rotulo">Propósito</span>
          <p>{POSTEST_PROPOSITO}</p>
        </div>
      </div>
    </header>
  );
}
