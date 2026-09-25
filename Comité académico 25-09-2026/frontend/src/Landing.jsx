import { MATRIZ_1, MATRIZ_2 } from './data/catalogos.js';
import './landing.css';

const PANELES = [
  { config: MATRIZ_1, clase: 'azul', href: 'matriz-1/', nombre: 'Internacionalización' },
  { config: MATRIZ_2, clase: 'verde', href: 'matriz-2/', nombre: 'Fortalecimiento de la implementación del modelo' },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-cabecera">
        <span className="landing-fecha">25 · 09 · 2026</span>
        <h1>
          Comité
          <br />
          Académico
        </h1>
        <p className="landing-subtitulo">
          La Universidad en el Campo. Elija la matriz que va a diligenciar: cada una se envía por separado.
        </p>
      </header>

      <main className="landing-paneles">
        {PANELES.map(({ config, clase, href, nombre }) => (
          <a key={href} className={`panel panel--${clase}`} href={href}>
            <span className="panel-numero" aria-hidden="true">
              {config.numero}
            </span>
            <span className="panel-titulo">{nombre}</span>
            <span className="panel-detalle">{config.subtitulo}</span>
            <span className="panel-cta">
              Diligenciar <span aria-hidden="true">→</span>
            </span>
          </a>
        ))}
      </main>
    </div>
  );
}
