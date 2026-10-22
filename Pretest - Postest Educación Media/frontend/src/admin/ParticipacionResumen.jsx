/** Resumen ejecutivo del panel: cuántos docentes, qué tan completo va el
 * proceso (pre + post), cuánto cambió la alineación y cuántas instituciones
 * ya tienen datos. */
export default function ParticipacionResumen({ participacion, alineadoPreGlobal, alineadoPostGlobal, institucionesConDatos, totalInstituciones }) {
  const { soloPretest, soloPostest, ambos } = participacion;
  const total = soloPretest + soloPostest + ambos;
  const pctCompleto = total > 0 ? Math.round((ambos / total) * 100) : 0;
  const hayDelta = alineadoPreGlobal !== null && alineadoPostGlobal !== null;
  const delta = hayDelta ? alineadoPostGlobal - alineadoPreGlobal : null;
  const pctInst = totalInstituciones > 0 ? Math.round((institucionesConDatos / totalInstituciones) * 100) : 0;

  const segmentos = [
    { clave: 'pre', etiqueta: 'Solo Pretest', valor: soloPretest },
    { clave: 'ambos', etiqueta: 'Pre + Post', valor: ambos },
    { clave: 'post', etiqueta: 'Solo Postest', valor: soloPostest },
  ];

  return (
    <section className="kpi-seccion">
      <div className="kpi-fila">
        <div className="kpi kpi--primario">
          <span className="kpi-etiqueta">Docentes participantes</span>
          <span className="kpi-valor">{total}</span>
          <span className="kpi-nota">{participacion.totalPretest} en Pretest · {participacion.totalPostest} en Postest</span>
        </div>

        <div className="kpi">
          <span className="kpi-etiqueta">Completaron Pre + Post</span>
          <span className="kpi-valor">{pctCompleto}<small>%</small></span>
          <span className="kpi-barra"><span style={{ '--pct': pctCompleto / 100 }} /></span>
          <span className="kpi-nota">{ambos} de {total} docentes</span>
        </div>

        <div className="kpi">
          <span className="kpi-etiqueta">Alineación antes → después</span>
          <span className="kpi-valor kpi-valor--par">
            {alineadoPreGlobal ?? '—'}<small>%</small> <i aria-hidden="true">→</i> {alineadoPostGlobal ?? '—'}<small>%</small>
          </span>
          {hayDelta ? (
            <span className={`kpi-delta ${delta >= 0 ? 'kpi-delta--sube' : 'kpi-delta--baja'}`}>
              {delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : ''}{delta} pts
            </span>
          ) : (
            <span className="kpi-nota">Falta Pretest o Postest para comparar</span>
          )}
        </div>

        <div className="kpi">
          <span className="kpi-etiqueta">Instituciones con datos</span>
          <span className="kpi-valor">{institucionesConDatos}<small>/{totalInstituciones}</small></span>
          <span className="kpi-barra"><span style={{ '--pct': pctInst / 100 }} /></span>
          <span className="kpi-nota">{totalInstituciones - institucionesConDatos} sin registros aún</span>
        </div>
      </div>

      {total > 0 && (
        <div className="particip">
          <div className="particip-barra" role="img" aria-label={segmentos.map((s) => `${s.etiqueta}: ${s.valor}`).join(', ')}>
            {segmentos.map((s) => s.valor > 0 && (
              <span key={s.clave} className={`particip-seg particip-seg--${s.clave}`} style={{ flexGrow: s.valor }}>{s.valor}</span>
            ))}
          </div>
          <ul className="particip-leyenda">
            {segmentos.map((s) => (
              <li key={s.clave}><span className={`particip-punto particip-seg--${s.clave}`} />{s.etiqueta}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
