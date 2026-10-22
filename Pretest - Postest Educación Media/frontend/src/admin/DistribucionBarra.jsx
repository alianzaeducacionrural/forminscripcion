/** Fila de barra horizontal. Con `total` la barra y el % se miden contra el
 * número de respuestas (qué parte del grupo eligió esa opción); sin `total`,
 * contra el máximo del grupo (conteos por institución). */
export default function DistribucionBarra({ etiqueta, valor, maximo, total }) {
  const base = total || maximo;
  const pct = base > 0 ? valor / base : 0;
  return (
    <li className="distribucion-fila">
      <span className="distribucion-fila-etiqueta" title={etiqueta}>{etiqueta}</span>
      <span className="distribucion-fila-barra-pista">
        <span className="distribucion-fila-barra" style={{ '--pct': pct }} />
      </span>
      <span className="distribucion-fila-numero">
        {valor}
        {total ? <small>{Math.round(pct * 100)}%</small> : null}
      </span>
    </li>
  );
}
