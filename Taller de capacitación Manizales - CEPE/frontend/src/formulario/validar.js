import { AREAS, INSTITUCIONES } from '../data/catalogos.js';

export function normalizarTelefono(valor) {
  return String(valor || '').replace(/\D/g, '');
}

export function telefonoValido(valor) {
  const digitos = normalizarTelefono(valor);
  return digitos.length >= 7 && digitos.length <= 10;
}

export function validarDocente(docente) {
  const errores = {};

  if (!docente.nombre || !docente.nombre.trim()) {
    errores.nombre = 'Escriba el nombre completo del docente.';
  }

  if (!telefonoValido(docente.telefono)) {
    errores.telefono = 'Escriba un teléfono válido (7 a 10 dígitos).';
  }

  if (!docente.areas || docente.areas.length === 0) {
    errores.areas = 'Seleccione al menos un área.';
  }

  return errores;
}

export function validarFormulario({ institucion, docentes }) {
  const errores = {};

  if (!institucion || !INSTITUCIONES.includes(institucion)) {
    errores.institucion = 'Seleccione la institución educativa.';
  }

  const erroresDocentes = docentes.map(validarDocente);
  const hayErroresDocentes = erroresDocentes.some((e) => Object.keys(e).length > 0);
  if (hayErroresDocentes) {
    errores.docentes = erroresDocentes;
  }

  return errores;
}

export function formularioEsValido(errores) {
  return Object.keys(errores).length === 0;
}

export function areasOrdenadas(areas) {
  return AREAS.filter((a) => areas.includes(a));
}
