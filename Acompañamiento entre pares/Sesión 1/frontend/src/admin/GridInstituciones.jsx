import InstitucionCard from './InstitucionCard.jsx';
import TarjetaGlobal from './TarjetaGlobal.jsx';

export default function GridInstituciones({ resumenes, totales, onAbrirInstitucion, onAbrirGlobal }) {
  return (
    <section className="bloque">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Por institución</h2>
      </div>
      {resumenes.length === 0 ? (
        <p className="vacio">Todavía no hay envíos. Cuando una institución envíe una herramienta, aparecerá aquí.</p>
      ) : (
        <div className="grid-ies">
          <TarjetaGlobal totales={totales} onAbrir={onAbrirGlobal} />
          {resumenes.map((r, i) => (
            <InstitucionCard key={r.clave} resumen={r} indice={i + 1} onAbrir={() => onAbrirInstitucion(r.clave)} />
          ))}
        </div>
      )}
    </section>
  );
}
