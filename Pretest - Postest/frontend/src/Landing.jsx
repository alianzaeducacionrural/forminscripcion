import Membrete from './components/Membrete.jsx';
import './formulario.css';

export default function Landing() {
  return (
    <div className="pagina">
      <div className="hoja">
        <Membrete />
        <div className="landing-cuerpo">
          <h1>Estrategias metodológicas activas</h1>
          <p className="landing-subtitulo">
            Iniciativa La Universidad en el Campo — Comunidades de Cambio. Elija el
            formulario según el momento del taller en el que se encuentra.
          </p>
          <div className="landing-opciones">
            <a className="landing-opcion" href="pretest/">
              <span className="landing-opcion-etiqueta">Antes del taller</span>
              <span className="landing-opcion-titulo">Pretest</span>
              <span className="landing-opcion-detalle">
                Cuéntenos qué sabe hoy sobre estrategias metodológicas activas.
              </span>
            </a>
            <a className="landing-opcion" href="postest/">
              <span className="landing-opcion-etiqueta">Después del taller</span>
              <span className="landing-opcion-titulo">Postest</span>
              <span className="landing-opcion-detalle">
                Cuéntenos qué aprendió y cómo lo aplicará en su práctica.
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
