import { useMemo, useState } from 'react';
import InstitucionCard from './InstitucionCard.jsx';
import TarjetaGlobal from './TarjetaGlobal.jsx';

const COMPARADORES = {
  alfabetico: (a, b) => a.institucion.localeCompare(b.institucion, 'es'),
  alineacion: (a, b) => (b.alineadoPost ?? -1) - (a.alineadoPost ?? -1),
  participacion: (a, b) => b.totalPretest + b.totalPostest - (a.totalPretest + a.totalPostest),
};

export default function GridInstituciones({ resumenes, resumenGlobal, onAbrirInstitucion, onAbrirGlobal }) {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('alfabetico');
  const [soloConDatos, setSoloConDatos] = useState(false);

  const filtradas = useMemo(() => {
    let lista = resumenes;
    if (soloConDatos) lista = lista.filter((r) => r.estado !== 'sin-datos');
    const q = busqueda.trim().toLowerCase();
    if (q) lista = lista.filter((r) => r.institucion.toLowerCase().includes(q));
    return [...lista].sort(COMPARADORES[orden]);
  }, [resumenes, busqueda, orden, soloConDatos]);

  return (
    <section className="bloque bloque--grid">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Por institución</h2>
        <div className="grid-controles">
          <input
            type="search"
            className="filtro-input"
            placeholder="Buscar institución…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select className="filtro-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="alfabetico">Orden alfabético</option>
            <option value="alineacion">Mayor % alineado (después)</option>
            <option value="participacion">Mayor participación</option>
          </select>
          <label className="grid-toggle">
            <input type="checkbox" checked={soloConDatos} onChange={(e) => setSoloConDatos(e.target.checked)} />
            Solo con datos
          </label>
        </div>
      </div>

      <div className="grid-instituciones">
        <TarjetaGlobal
          totalPretest={resumenGlobal.totalPretest}
          totalPostest={resumenGlobal.totalPostest}
          alineadoPre={resumenGlobal.alineadoPre}
          alineadoPost={resumenGlobal.alineadoPost}
          onAbrir={onAbrirGlobal}
        />
        {filtradas.map((r) => (
          <InstitucionCard key={r.institucion} resumen={r} onAbrir={() => onAbrirInstitucion(r.institucion)} />
        ))}
      </div>

      {filtradas.length === 0 && <p className="tabla-vacia">Ninguna institución coincide con la búsqueda.</p>}
    </section>
  );
}
