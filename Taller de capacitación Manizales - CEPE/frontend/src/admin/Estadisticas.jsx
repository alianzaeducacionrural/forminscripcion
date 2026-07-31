export default function Estadisticas({ resumen }) {
  const stats = [
    { etiqueta: 'Docentes inscritos', valor: resumen.total_docentes, color: 'indigo' },
    { etiqueta: 'Instituciones', valor: `${resumen.instituciones_registradas.length}/${resumen.total_instituciones}`, color: 'violeta' },
    { etiqueta: 'Con más de un área', valor: resumen.docentes_multi_area, color: 'ambar' },
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
