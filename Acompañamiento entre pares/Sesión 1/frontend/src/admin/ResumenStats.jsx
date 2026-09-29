export default function ResumenStats({ totales }) {
  const bloques = [
    { clase: 'sol', valor: totales.instituciones, etiqueta: 'Instituciones registradas', nota: 'han enviado al menos una herramienta' },
    {
      clase: 'exp',
      valor: totales.rectoresExperimentados,
      etiqueta: 'rectores con experiencia',
      nota: `${totales.componentesExp} ${totales.componentesExp === 1 ? 'componente diligenciado' : 'componentes diligenciados'}`,
    },
    {
      clase: 'nue',
      valor: totales.rectoresNuevos,
      etiqueta: 'rectores nuevos',
      nota: `${totales.componentesNue} ${totales.componentesNue === 1 ? 'componente diligenciado' : 'componentes diligenciados'}`,
    },
  ];

  return (
    <div className="stats-fila">
      {bloques.map((b, i) => (
        <div key={b.etiqueta} className={`stat stat--${b.clase}`} style={{ '--i': i }}>
          <span className="stat-valor">{b.valor}</span>
          <span className="stat-etiqueta">{b.etiqueta}</span>
          <span className="stat-nota">{b.nota}</span>
        </div>
      ))}
    </div>
  );
}
