import { useMemo, useState } from 'react';
import { INSTITUCIONES } from '../data/catalogos.js';

function textoAbierto(test, f) {
  if (test === 'pretest') {
    return [f.p5_competencia, f.p5_estrategia, f.p5_evidencia].filter(Boolean).join(' · ');
  }
  return [f.q3_aplicaria, f.q5_aprendizaje, f.q5_estrategia, f.q5_evidencia, f.q5_seguimiento].filter(Boolean).join(' · ');
}

export default function RespuestasAbiertas({ pretest, postest, mostrarFiltroInstitucion = true }) {
  const [test, setTest] = useState('pretest');
  const [institucion, setInstitucion] = useState('');

  const filas = test === 'pretest' ? pretest : postest;
  const conTexto = useMemo(
    () =>
      filas
        .filter((f) => !institucion || f.institucion === institucion)
        .map((f) => ({ ...f, texto: textoAbierto(test, f) }))
        .filter((f) => f.texto.trim().length > 0),
    [filas, institucion, test]
  );

  return (
    <section className="tabla-seccion">
      <h2 className="bloque-titulo">Respuestas abiertas</h2>
      <div className="tabla-filtros">
        <select className="filtro-select" value={test} onChange={(e) => setTest(e.target.value)}>
          <option value="pretest">Pretest</option>
          <option value="postest">Postest</option>
        </select>
        {mostrarFiltroInstitucion && (
          <select className="filtro-select" value={institucion} onChange={(e) => setInstitucion(e.target.value)}>
            <option value="">Todas las instituciones</option>
            {INSTITUCIONES.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {conTexto.length === 0 ? (
        <p className="tabla-vacia">No hay respuestas abiertas para este filtro.</p>
      ) : (
        <ul className="abiertas-lista">
          {conTexto.map((f, i) => (
            <li key={`${f.id_registro}-${i}`} className="abiertas-item">
              <div className="abiertas-item-cabecera">
                <span className="abiertas-item-nombre">{f.nombre_docente}</span>
                {mostrarFiltroInstitucion && <span className="abiertas-item-institucion">{f.institucion}</span>}
              </div>
              <p className="abiertas-item-texto">{f.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
