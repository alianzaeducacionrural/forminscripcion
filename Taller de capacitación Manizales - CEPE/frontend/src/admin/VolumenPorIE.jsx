import { AREAS_ABREVIADAS, AREAS_COLOR } from '../data/catalogos.js';
import { institucionesOrdenadasPorVolumen } from './calculos.js';

export default function VolumenPorIE({ resumen }) {
  const filas = institucionesOrdenadasPorVolumen(resumen.docentes_por_institucion);
  const maximo = Math.max(1, ...filas.map(([, n]) => n));

  return (
    <section className="bloque bloque--volumen">
      <h2 className="bloque-titulo">Volumen</h2>

      <ul className="volumen-lista">
        {filas.map(([nombre, cantidad]) => (
          <li key={nombre} className={`volumen-fila ${cantidad === 0 ? 'volumen-fila--vacia' : ''}`}>
            <span className="volumen-fila-nombre">{nombre}</span>
            <span className="volumen-fila-barra-pista">
              <span className="volumen-fila-barra" style={{ '--pct': cantidad / maximo }} />
            </span>
            <span className="volumen-fila-numero">{cantidad}</span>
          </li>
        ))}
      </ul>

      <h3 className="bloque-subtitulo">Por área del conocimiento</h3>
      <p className="volumen-nota">
        {resumen.total_asignaciones_area} asignaciones de área sobre {resumen.total_docentes} docentes — un
        docente puede tener más de un área ({resumen.docentes_multi_area} lo hacen), así que la suma no
        coincide con el total.
      </p>
      <ul className="volumen-areas">
        {Object.entries(resumen.docentes_por_area).map(([area, cantidad]) => (
          <li key={area} className={`volumen-area-chip volumen-area-chip--${AREAS_COLOR[area] || 'indigo'}`}>
            <span>{AREAS_ABREVIADAS[area] || area}</span>
            <strong>{cantidad}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
