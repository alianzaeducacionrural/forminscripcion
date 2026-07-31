import { AREAS, INSTITUCIONES } from '../data/catalogos.js';

// Recalcula cobertura y volumen a partir de una lista de docentes — se usa
// tanto para el resumen global como para el resumen sobre un subconjunto
// filtrado, así los bloques del panel y la tabla nunca se desincronizan.
export function calcularResumen(docentes) {
  const porInstitucion = {};
  INSTITUCIONES.forEach((nombre) => {
    porInstitucion[nombre] = 0;
  });
  docentes.forEach((d) => {
    porInstitucion[d.institucion] = (porInstitucion[d.institucion] || 0) + 1;
  });

  const instituciones_registradas = INSTITUCIONES.filter((n) => porInstitucion[n] > 0);
  const instituciones_faltantes = INSTITUCIONES.filter((n) => porInstitucion[n] === 0);

  const porArea = {};
  AREAS.forEach((a) => {
    porArea[a] = 0;
  });
  let totalAsignacionesArea = 0;
  let docentesMultiArea = 0;
  docentes.forEach((d) => {
    (d.areas || []).forEach((area) => {
      porArea[area] = (porArea[area] || 0) + 1;
      totalAsignacionesArea++;
    });
    if ((d.areas || []).length > 1) docentesMultiArea++;
  });

  return {
    total_docentes: docentes.length,
    total_instituciones: INSTITUCIONES.length,
    instituciones_registradas,
    instituciones_faltantes,
    docentes_por_institucion: porInstitucion,
    docentes_por_area: porArea,
    total_asignaciones_area: totalAsignacionesArea,
    docentes_multi_area: docentesMultiArea,
  };
}

export function institucionesOrdenadasPorVolumen(porInstitucion) {
  return Object.entries(porInstitucion).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'));
}
