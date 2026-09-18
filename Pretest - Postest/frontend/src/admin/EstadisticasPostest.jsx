import { POSTEST_PREGUNTAS, POSTEST_Q3_TEXTO, POSTEST_Q4_TEXTO, INSTITUCIONES } from '../data/catalogos.js';
import DistribucionBarra from './DistribucionBarra.jsx';

export default function EstadisticasPostest({ resumen, onDescargarCSV, mostrarPorInstitucion = true }) {
  const preguntasOpcion = [
    { id: 'q1', numero: 1, ...resumen.q1, texto: POSTEST_PREGUNTAS.q1.texto, opciones: POSTEST_PREGUNTAS.q1.opciones },
    { id: 'q2', numero: 2, ...resumen.q2, texto: POSTEST_PREGUNTAS.q2.texto, opciones: POSTEST_PREGUNTAS.q2.opciones },
  ];
  const maximoQ3 = Math.max(1, ...Object.values(resumen.q3));
  const maximoQ4 = Math.max(1, ...Object.values(resumen.q4.conteo));
  const maximoInstitucion = Math.max(1, ...Object.values(resumen.porInstitucion));

  return (
    <section className="bloque bloque--test">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Postest</h2>
        <div className="bloque-acciones">
          <span className="stat-chip">{resumen.total} respuestas</span>
          {resumen.porcentajeAlineadoPromedio !== null && (
            <span className="stat-chip stat-chip--primario">{resumen.porcentajeAlineadoPromedio}% alineado</span>
          )}
          <button type="button" className="boton boton--secundario" onClick={onDescargarCSV} disabled={resumen.total === 0}>
            Descargar CSV
          </button>
        </div>
      </div>

      {resumen.total === 0 ? (
        <p className="tabla-vacia">Todavía no hay respuestas de Postest.</p>
      ) : (
        <>
          {preguntasOpcion.map((p) => {
            const maximo = Math.max(1, ...Object.values(p.distribucion));
            return (
              <div key={p.id} className="pregunta-resumen">
                <p className="pregunta-resumen-texto">
                  {p.numero}. {p.texto}
                </p>
                <ul className="distribucion-lista">
                  {['a', 'b', 'c', 'd'].map((letra) => (
                    <DistribucionBarra key={letra} etiqueta={p.opciones[letra]} valor={p.distribucion[letra]} maximo={maximo} />
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="pregunta-resumen">
            <p className="pregunta-resumen-texto">3. {POSTEST_Q3_TEXTO}</p>
            <ul className="distribucion-lista">
              {Object.entries(resumen.q3).map(([etiqueta, valor]) => (
                <DistribucionBarra key={etiqueta} etiqueta={etiqueta} valor={valor} maximo={maximoQ3} />
              ))}
            </ul>
          </div>

          <div className="pregunta-resumen">
            <p className="pregunta-resumen-texto">
              4. {POSTEST_Q4_TEXTO}
              {resumen.q4.alineadoPct !== null && <span className="stat-chip stat-chip--primario"> {resumen.q4.alineadoPct}% alineado</span>}
            </p>
            <ul className="distribucion-lista">
              {Object.entries(resumen.q4.conteo).map(([etiqueta, valor]) => (
                <DistribucionBarra key={etiqueta} etiqueta={etiqueta} valor={valor} maximo={maximoQ4} />
              ))}
            </ul>
          </div>

          {mostrarPorInstitucion && (
            <div className="pregunta-resumen">
              <p className="pregunta-resumen-texto">Respuestas por institución</p>
              <ul className="distribucion-lista">
                {INSTITUCIONES.map((institucion) => (
                  <DistribucionBarra key={institucion} etiqueta={institucion} valor={resumen.porInstitucion[institucion] || 0} maximo={maximoInstitucion} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
