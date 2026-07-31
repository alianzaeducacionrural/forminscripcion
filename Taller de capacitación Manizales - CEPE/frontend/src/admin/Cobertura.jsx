import { useState } from 'react';

export default function Cobertura({ resumen }) {
  const [copiado, setCopiado] = useState(false);
  const total = resumen.total_instituciones;
  const registradas = resumen.instituciones_registradas.length;
  const porcentaje = total > 0 ? Math.round((registradas / total) * 100) : 0;

  function copiarFaltantes() {
    const texto = resumen.instituciones_faltantes.join('\n');
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    });
  }

  return (
    <section className="bloque bloque--cobertura">
      <h2 className="bloque-titulo">Cobertura</h2>

      <div className="cobertura-contador">
        <span className="cobertura-contador-numero">{registradas}</span>
        <span className="cobertura-contador-separador">/</span>
        <span className="cobertura-contador-total">{total}</span>
        <span className="cobertura-contador-etiqueta">instituciones inscritas</span>
      </div>

      <div className="cobertura-barra" role="progressbar" aria-valuenow={registradas} aria-valuemin={0} aria-valuemax={total}>
        <div className="cobertura-barra-relleno" style={{ '--pct': porcentaje / 100 }} />
      </div>

      {resumen.instituciones_faltantes.length === 0 ? (
        <p className="cobertura-completa">Las {total} instituciones ya inscribieron docentes.</p>
      ) : (
        <div className="cobertura-faltantes">
          <div className="cobertura-faltantes-cabecera">
            <span>Faltan por inscribir ({resumen.instituciones_faltantes.length})</span>
            <button type="button" className="boton-link" onClick={copiarFaltantes}>
              {copiado ? 'Copiado' : 'Copiar lista'}
            </button>
          </div>
          <ul className="cobertura-faltantes-lista">
            {resumen.instituciones_faltantes.map((nombre) => (
              <li key={nombre}>{nombre}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
