/** Comparación compacta pre/post de % alineado, para una tarjeta de institución. */
export default function MiniAlineacion({ pre, post }) {
  return (
    <div className="mini-alineacion">
      <div className="mini-alineacion-fila">
        <span className="mini-alineacion-etiqueta">Antes</span>
        <span className="mini-alineacion-pista">
          <span className="mini-alineacion-relleno mini-alineacion-relleno--pre" style={{ '--pct': (pre ?? 0) / 100 }} />
        </span>
        <span className="mini-alineacion-valor">{pre !== null ? `${pre}%` : '—'}</span>
      </div>
      <div className="mini-alineacion-fila">
        <span className="mini-alineacion-etiqueta">Después</span>
        <span className="mini-alineacion-pista">
          <span className="mini-alineacion-relleno mini-alineacion-relleno--post" style={{ '--pct': (post ?? 0) / 100 }} />
        </span>
        <span className="mini-alineacion-valor">{post !== null ? `${post}%` : '—'}</span>
      </div>
    </div>
  );
}
