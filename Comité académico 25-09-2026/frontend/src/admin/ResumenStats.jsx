export default function ResumenStats({ totales }) {
  const bloques = [
    { clase: 'sol', valor: totales.instituciones, etiqueta: 'Instituciones registradas', nota: 'han enviado al menos una matriz' },
    { clase: 'm1', valor: totales.iesM1, etiqueta: 'con Matriz 1', nota: `${totales.acciones} ${totales.acciones === 1 ? 'acción propuesta' : 'acciones propuestas'}` },
    { clase: 'm2', valor: totales.iesM2, etiqueta: 'con Matriz 2', nota: `${totales.aspectos} ${totales.aspectos === 1 ? 'aspecto registrado' : 'aspectos registrados'}` },
    { clase: 'naranja', valor: totales.completas, etiqueta: 'con las dos matrices', nota: 'cobertura completa' },
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
