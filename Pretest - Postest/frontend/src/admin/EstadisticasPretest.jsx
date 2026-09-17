import { PRETEST_PREGUNTAS, PRETEST_P4_TEXTO, INSTITUCIONES } from '../data/catalogos.js';
import DistribucionBarra from './DistribucionBarra.jsx';

export default function EstadisticasPretest({ resumen, onDescargarCSV }) {
  const preguntasOpcion = [
    { id: 'p1', numero: 1, ...resumen.p1, texto: PRETEST_PREGUNTAS.p1.texto, opciones: PRETEST_PREGUNTAS.p1.opciones },
    { id: 'p2', numero: 2, ...resumen.p2, texto: PRETEST_PREGUNTAS.p2.texto, opciones: PRETEST_PREGUNTAS.p2.opciones },
    { id: 'p3', numero: 3, ...resumen.p3, texto: PRETEST_PREGUNTAS.p3.texto, opciones: PRETEST_PREGUNTAS.p3.opciones },
  ];
  const maximoP4 = Math.max(1, ...Object.values(resumen.p4));
  const maximoInstitucion = Math.max(1, ...Object.values(resumen.porInstitucion));

  return (
    <section className="bloque bloque--test">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Pretest</h2>
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
        <p className="tabla-vacia">Todavía no hay respuestas de Pretest.</p>
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
            <p className="pregunta-resumen-texto">4. {PRETEST_P4_TEXTO}</p>
            <ul className="distribucion-lista">
              {Object.entries(resumen.p4).map(([etiqueta, valor]) => (
                <DistribucionBarra key={etiqueta} etiqueta={etiqueta} valor={valor} maximo={maximoP4} />
              ))}
            </ul>
          </div>

          <div className="pregunta-resumen">
            <p className="pregunta-resumen-texto">Respuestas por institución</p>
            <ul className="distribucion-lista">
              {INSTITUCIONES.map((institucion) => (
                <DistribucionBarra key={institucion} etiqueta={institucion} valor={resumen.porInstitucion[institucion] || 0} maximo={maximoInstitucion} />
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
