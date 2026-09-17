/** Fila de barra horizontal — mismo lenguaje visual que `.volumen-fila` del
 * proyecto hermano, reutilizado para distribuciones de respuesta y conteos
 * por institución en este panel. */
export default function DistribucionBarra({ etiqueta, valor, maximo }) {
  const pct = maximo > 0 ? valor / maximo : 0;
  return (
    <li className="distribucion-fila">
      <span className="distribucion-fila-etiqueta">{etiqueta}</span>
      <span className="distribucion-fila-barra-pista">
        <span className="distribucion-fila-barra" style={{ '--pct': pct }} />
      </span>
      <span className="distribucion-fila-numero">{valor}</span>
    </li>
  );
}
