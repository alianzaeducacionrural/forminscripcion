import IESCard from './IESCard.jsx';
import TarjetaGlobal from './TarjetaGlobal.jsx';

export default function GridIES({ resumenes, totales, onAbrirIES, onAbrirGlobal }) {
  return (
    <section className="bloque">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Por institución</h2>
      </div>
      <div className="grid-ies">
        <TarjetaGlobal totales={totales} onAbrir={onAbrirGlobal} />
        {resumenes.map((r) => (
          <IESCard key={r.institucion} resumen={r} onAbrir={() => onAbrirIES(r.institucion)} />
        ))}
      </div>
    </section>
  );
}
