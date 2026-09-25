export default function ResumenStats({ totales }) {
  const tarjetas = [
    { clase: 'm1', valor: `${totales.iesM1} de ${totales.totalIES}`, etiqueta: 'IES con Matriz 1 enviada' },
    { clase: 'm2', valor: `${totales.iesM2} de ${totales.totalIES}`, etiqueta: 'IES con Matriz 2 enviada' },
    { clase: 'm1', valor: totales.acciones, etiqueta: 'Acciones de internacionalización propuestas' },
    { clase: 'm2', valor: totales.aspectos, etiqueta: 'Aspectos a fortalecer registrados' },
  ];

  return (
    <div className="stats-fila">
      {tarjetas.map((t) => (
        <div key={t.etiqueta} className={`stat-tarjeta stat-tarjeta--${t.clase}`}>
          <span className="stat-tarjeta-valor">{t.valor}</span>
          <span className="stat-tarjeta-etiqueta">{t.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
