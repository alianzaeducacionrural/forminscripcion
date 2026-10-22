import Casilla from './Casilla.jsx';
import { AREAS, AREAS_COLOR, INSTITUCIONES } from '../data/catalogos.js';

/**
 * Encabezado de datos común a Pretest y Postest: institución, nombre del
 * docente (normalizado a Nombre Propio antes de enviar) y áreas que orienta.
 */
export default function DatosDocente({
  institucion,
  onChangeInstitucion,
  nombreDocente,
  onChangeNombre,
  areas,
  onToggleArea,
  errores = {},
  tocados = {},
  onBlur,
  autocompletado = false,
}) {
  return (
    <>
      <section className="campo campo--institucion">
        <label className="campo-etiqueta" htmlFor="institucion-select">
          Institución educativa
        </label>
        <div className="select-envoltura">
          <select
            id="institucion-select"
            className={`select-institucion ${errores.institucion && tocados.institucion ? 'select-institucion--error' : ''}`}
            value={institucion}
            onChange={(e) => onChangeInstitucion(e.target.value)}
            onBlur={() => onBlur('institucion')}
          >
            <option value="" disabled>
              Seleccione su institución…
            </option>
            {INSTITUCIONES.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        {errores.institucion && tocados.institucion && <p className="campo-error">{errores.institucion}</p>}
      </section>

      <section className="campo">
        <label className="campo-etiqueta" htmlFor="nombre-docente">
          Nombre completo del docente
        </label>
        <input
          id="nombre-docente"
          type="text"
          className={`campo-input ${errores.nombreDocente && tocados.nombreDocente ? 'campo-input--error' : ''}`}
          value={nombreDocente}
          onChange={(e) => onChangeNombre(e.target.value)}
          onBlur={() => onBlur('nombreDocente')}
          placeholder="Ej. María Fernanda Ospina Ríos"
          autoComplete="name"
        />
        {errores.nombreDocente && tocados.nombreDocente && <p className="campo-error">{errores.nombreDocente}</p>}
        {autocompletado && !errores.nombreDocente && (
          <span className="recuperar-badge">Autocompletado desde el pretest</span>
        )}
      </section>

      <section className="campo">
        <span className="campo-etiqueta" id="areas-label">
          Área(s) que orienta
        </span>
        <div className="grupo-areas" role="group" aria-labelledby="areas-label">
          {AREAS.map((area) => (
            <Casilla
              key={area}
              etiqueta={area}
              color={AREAS_COLOR[area]}
              checked={areas.includes(area)}
              onChange={(marcada) => {
                onToggleArea(area, marcada);
                onBlur('areas');
              }}
            />
          ))}
        </div>
        {errores.areas && tocados.areas && <p className="campo-error">{errores.areas}</p>}
      </section>
    </>
  );
}
