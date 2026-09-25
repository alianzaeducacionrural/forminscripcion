import Membrete from './components/Membrete.jsx';
import { MATRIZ_1, MATRIZ_2 } from './data/catalogos.js';
import './formulario.css';
import './landing.css';

export default function Landing() {
  return (
    <div className="pagina">
      <div className="hoja">
        <Membrete />
        <div className="landing-cuerpo">
          <h1>Comité Académico</h1>
          <p className="landing-subtitulo">
            La Universidad en el Campo. Cada institución de educación superior diligencia las dos
            matrices de trabajo.
          </p>
          <div className="landing-opciones">
            <a className="landing-opcion landing-opcion--m1" href="matriz-1/">
              <span className="landing-opcion-etiqueta">Matriz 1</span>
              <span className="landing-opcion-titulo">Internacionalización</span>
              <span className="landing-opcion-detalle">{MATRIZ_1.subtitulo}</span>
            </a>
            <a className="landing-opcion landing-opcion--m2" href="matriz-2/">
              <span className="landing-opcion-etiqueta">Matriz 2</span>
              <span className="landing-opcion-titulo">Fortalecimiento de la implementación del modelo</span>
              <span className="landing-opcion-detalle">{MATRIZ_2.subtitulo}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
