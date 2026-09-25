import IESCard from './IESCard.jsx';
import TarjetaGlobal from './TarjetaGlobal.jsx';

export default function GridIES({ resumenes, totales, onAbrirInstitucion, onAbrirGlobal }) {
  return (
    <section className="bloque">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Por institución</h2>
      </div>
      {resumenes.length === 0 ? (
        <p className="vacio">Todavía no hay envíos. Cuando una institución envíe una matriz, aparecerá aquí.</p>
      ) : (
        <div className="grid-ies">
          <TarjetaGlobal totales={totales} onAbrir={onAbrirGlobal} />
          {resumenes.map((r, i) => (
            <IESCard key={r.clave} resumen={r} indice={i + 1} onAbrir={() => onAbrirInstitucion(r.clave)} />
          ))}
        </div>
      )}
    </section>
  );
}
