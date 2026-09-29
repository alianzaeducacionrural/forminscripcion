import Membrete from './components/Membrete.jsx';
import { HERRAMIENTA_EXPERIMENTADOS, HERRAMIENTA_NUEVOS, HERRAMIENTA_PLAN_ACCION } from './data/catalogos.js';
import './landing.css';

const PANELES = [
  { config: HERRAMIENTA_EXPERIMENTADOS, clase: 'ambar', href: 'experimentados/', inicial: 'E' },
  { config: HERRAMIENTA_NUEVOS, clase: 'turquesa', href: 'nuevos/', inicial: 'N' },
  { config: HERRAMIENTA_PLAN_ACCION, clase: 'violeta', href: 'plan-accion/', inicial: 'P' },
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
            el turno?
          </h1>
          <p className="landing-subtitulo">
            Las dos primeras se diligencian según su trayectoria como rector o rectora; la tercera
            la llena la dupla junta, al cierre de la sesión.
          </p>
        </header>

        <main className="landing-paneles">
          {PANELES.map(({ config, clase, href, inicial }) => (
            <a key={href} className={`panel panel--${clase}`} href={href}>
              <span className="panel-inicial" aria-hidden="true">
                {inicial}
              </span>
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
