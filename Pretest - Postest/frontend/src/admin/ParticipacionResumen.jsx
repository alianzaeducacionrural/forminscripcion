export default function ParticipacionResumen({ participacion }) {
  const stats = [
    { etiqueta: 'Solo Pretest', valor: participacion.soloPretest, color: 'pre' },
    { etiqueta: 'Solo Postest', valor: participacion.soloPostest, color: 'violeta' },
    { etiqueta: 'Ambos (evolución medible)', valor: participacion.ambos, color: 'post' },
  ];

  return (
    <div className="stats-fila">
      {stats.map((s) => (
        <div key={s.etiqueta} className={`stat-tarjeta stat-tarjeta--${s.color}`}>
          <span className="stat-tarjeta-valor">{s.valor}</span>
          <span className="stat-tarjeta-etiqueta">{s.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
