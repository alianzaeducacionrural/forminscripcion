export default function ParticipacionResumen({ participacion, alineadoPreGlobal, alineadoPostGlobal }) {
  const hayDelta = alineadoPreGlobal !== null && alineadoPostGlobal !== null;
  const delta = hayDelta ? alineadoPostGlobal - alineadoPreGlobal : null;

  const stats = [
    { etiqueta: 'Solo Pretest', valor: participacion.soloPretest, color: 'pre' },
    { etiqueta: 'Solo Postest', valor: participacion.soloPostest, color: 'violeta' },
    { etiqueta: 'Completaron ambos', valor: participacion.ambos, color: 'post' },
  ];

  return (
    <div className="stats-fila">
      {stats.map((s) => (
        <div key={s.etiqueta} className={`stat-tarjeta stat-tarjeta--${s.color}`}>
          <span className="stat-tarjeta-valor">{s.valor}</span>
          <span className="stat-tarjeta-etiqueta">{s.etiqueta}</span>
        </div>
      ))}
      {hayDelta && (
        <div className={`stat-tarjeta stat-tarjeta--delta ${delta >= 0 ? 'stat-tarjeta--delta-positivo' : 'stat-tarjeta--delta-negativo'}`}>
          <span className="stat-tarjeta-valor">
            {delta > 0 ? '+' : ''}
            {delta} pts
          </span>
          <span className="stat-tarjeta-etiqueta">Cambio en alineación (después − antes)</span>
        </div>
      )}
    </div>
  );
}
