import { AREAS, AREAS_ABREVIADAS, INSTITUCIONES } from '../data/catalogos.js';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function formatearFecha(timestamp) {
  try {
    return FORMATO_FECHA.format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

export default function TablaDocentes({
  docentes,
  cargando,
  filtroInstitucion,
  filtroArea,
  busqueda,
  onFiltroInstitucion,
  onFiltroArea,
  onBusqueda,
  onDescargarCSV,
}) {
  return (
    <section className="tabla-seccion">
      <div className="tabla-filtros">
        <input
          type="search"
          className="filtro-input"
          placeholder="Buscar docente por nombre…"
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
        />
        <select className="filtro-select" value={filtroInstitucion} onChange={(e) => onFiltroInstitucion(e.target.value)}>
          <option value="">Todas las instituciones</option>
          {INSTITUCIONES.map((nombre) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>
        <select className="filtro-select" value={filtroArea} onChange={(e) => onFiltroArea(e.target.value)}>
          <option value="">Todas las áreas</option>
          {AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
        <button type="button" className="boton boton--secundario" onClick={onDescargarCSV} disabled={docentes.length === 0}>
          Descargar CSV
        </button>
      </div>

      {cargando ? (
        <div className="tabla-skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tabla-skeleton-fila" />
          ))}
        </div>
      ) : docentes.length === 0 ? (
        <p className="tabla-vacia">
          Ningún docente coincide con este filtro todavía. Ajuste la búsqueda o espere a que más rectores
          diligencien el formulario.
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Institución</th>
                <th>Docente</th>
                <th>Teléfono</th>
                <th>Áreas</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((d, i) => (
                <tr key={`${d.id_registro}-${i}`} data-etiqueta-institucion="Institución" data-etiqueta-docente="Docente">
                  <td data-etiqueta="Institución">{d.institucion}</td>
                  <td data-etiqueta="Docente">{d.nombre_docente}</td>
                  <td data-etiqueta="Teléfono" className="tabla-mono">{d.telefono}</td>
                  <td data-etiqueta="Áreas">
                    <div className="tabla-areas">
                      {(d.areas || []).map((a) => (
                        <span key={a} className="tabla-area-chip">
                          {AREAS_ABREVIADAS[a] || a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td data-etiqueta="Fecha" className="tabla-mono tabla-fecha">{formatearFecha(d.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
