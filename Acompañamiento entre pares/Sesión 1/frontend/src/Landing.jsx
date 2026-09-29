import Membrete from './components/Membrete.jsx';
import { HERRAMIENTA_EXPERIMENTADOS, HERRAMIENTA_NUEVOS } from './data/catalogos.js';
import './landing.css';

const PANELES = [
  { config: HERRAMIENTA_EXPERIMENTADOS, clase: 'ambar', href: 'experimentados/' },
  { config: HERRAMIENTA_NUEVOS, clase: 'turquesa', href: 'nuevos/' },
];

export default function Landing() {
  return (
    <div className="landing-pagina">
      <Membrete />
      <div className="landing">
        <header className="landing-cabecera">
          <span className="landing-fecha">Acompañamiento entre pares · Sesión 1</span>
          <h1>
            ¿Cuál es
            <br />
            su rol?
          </h1>
          <p className="landing-subtitulo">
            Elija la herramienta que corresponde a su trayectoria como rector o rectora: cada una se
            envía por separado.
          </p>
        </header>

        <main className="landing-paneles">
          {PANELES.map(({ config, clase, href }) => (
            <a key={href} className={`panel panel--${clase}`} href={href}>
              <span className="panel-titulo">{config.titulo}</span>
              <span className="panel-subtitulo">{config.subtitulo}</span>
              <span className="panel-detalle">{config.pregunta}</span>
              <span className="panel-cta">
                Diligenciar <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </main>
      </div>
    </div>
  );
}
