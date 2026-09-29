import { filasParaCSVPlan, formatearFecha } from './calculos.js';
import { descargarCSV } from './csv.js';

function PlanCard({ plan }) {
  return (
    <div className="envio">
      <div className="envio-cabecera">
        <span className="envio-nombre">
          {plan.nombreExperimentado} · {plan.nombreNuevo}
        </span>
        <span className="envio-institucion">
          {plan.institucionExperimentado} → {plan.institucionNuevo}
        </span>
        <span className="envio-fecha">
          {formatearFecha(plan.fecha)}
          {plan.totalEnvios > 1 ? ` · ${plan.totalEnvios} envíos (vigente: el más reciente)` : ''}
        </span>
      </div>
      <ol className="fichas">
        {plan.acciones.map((fila) => (
          <li key={`${fila.id_envio}-${fila.orden}`} className="ficha ficha--violeta">
            <div className="ficha-cabecera">
              <span className="ficha-numero">{fila.orden}</span>
              <span className="ficha-titulo">Acción {fila.orden}</span>
            </div>
            <dl className="ficha-campos">
              <div className="ficha-campo">
                <dt>Reto concreto</dt>
                <dd>{fila.reto}</dd>
              </div>
              <div className="ficha-campo">
                <dt>Acción de acompañamiento</dt>
                <dd>{fila.accion}</dd>
              </div>
              <div className="ficha-campo">
                <dt>Responsable</dt>
                <dd>{fila.responsable}</dd>
              </div>
              <div className="ficha-campo">
                <dt>Fecha</dt>
                <dd>{fila.fecha}</dd>
              </div>
              <div className="ficha-campo">
                <dt>Evidencia de avance</dt>
                <dd>{fila.evidencia}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      <p className="plan-compromiso">
        <strong>Compromiso de cierre:</strong> {plan.compromiso}
      </p>
    </div>
  );
}

/** Lista de planes de acompañamiento vigentes (uno por dupla), con CSV. No se
 * agrupan por institución porque una dupla puede cruzar dos instituciones. */
export default function PlanesAccion({ planes }) {
  return (
    <section className="bloque">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Planes de acompañamiento (duplas)</h2>
        {planes.length > 0 && (
          <button
            type="button"
            className="boton boton--chico"
            onClick={() => descargarCSV('planes-accion.csv', filasParaCSVPlan(planes))}
          >
            Descargar CSV
          </button>
        )}
      </div>
      {planes.length === 0 ? (
        <p className="vacio">
          Todavía no hay planes registrados. Cuando una dupla envíe su reto de acompañamiento, aparecerá aquí.
        </p>
      ) : (
        <div className="envios">
          {planes.map((plan) => (
            <PlanCard key={plan.idEnvio} plan={plan} />
          ))}
        </div>
      )}
    </section>
  );
}
