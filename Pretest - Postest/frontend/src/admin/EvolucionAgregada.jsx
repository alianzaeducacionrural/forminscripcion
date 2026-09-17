import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Comparación agregada (no pregunta-a-pregunta, ver PRODUCT.md) del % de
 * alineación con la práctica pedagógica recomendada, antes y después del
 * taller. Único bloque del panel que usa una librería de gráficos — el
 * resto sigue el patrón de barra CSS por --pct del proyecto hermano.
 */
export default function EvolucionAgregada({ evolucion }) {
  const datos = evolucion.porInstitucion.map((f) => ({
    nombre: f.institucion,
    Antes: f.pre ?? 0,
    Despues: f.post ?? 0,
  }));

  if (evolucion.global.pre !== null || evolucion.global.post !== null) {
    datos.push({ nombre: 'Global', Antes: evolucion.global.pre ?? 0, Despues: evolucion.global.post ?? 0 });
  }

  return (
    <section className="bloque bloque--evolucion">
      <h2 className="bloque-titulo">Evolución — % de alineación con la práctica recomendada</h2>
      <p className="volumen-nota">
        Comparación agregada, no pregunta por pregunta: el Pretest y el Postest tienen
        preguntas propias, con su propia redacción. Este promedio resume qué tan
        alineadas están las respuestas de opción con la práctica pedagógica recomendada,
        antes y después del taller — nunca se muestra ni se etiqueta así al docente.
      </p>

      {datos.length === 0 ? (
        <p className="tabla-vacia">Aún no hay suficientes respuestas de Pretest y Postest para comparar.</p>
      ) : (
        <div className="evolucion-grafico">
          <ResponsiveContainer width="100%" height={Math.max(220, datos.length * 42)}>
            <BarChart data={datos} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
              <CartesianGrid horizontal={false} stroke="var(--surface-band)" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="var(--ink-tertiary)" fontSize={12} />
              <YAxis type="category" dataKey="nombre" width={170} stroke="var(--ink-secondary)" fontSize={12} />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{ background: '#ffffff', border: 'none', borderRadius: 10, boxShadow: '0 4px 24px rgba(79,70,229,0.18)' }}
              />
              <Legend />
              <Bar dataKey="Antes" name="Antes" fill="var(--pre)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Despues" name="Después" fill="var(--post)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
