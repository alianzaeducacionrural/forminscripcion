import { useEffect, useMemo, useState } from 'react';
import Membrete from '../components/Membrete.jsx';
import Estadisticas from './Estadisticas.jsx';
import Cobertura from './Cobertura.jsx';
import VolumenPorIE from './VolumenPorIE.jsx';
import TablaDocentes from './TablaDocentes.jsx';
import { calcularResumen } from './calculos.js';
import { descargarCSV } from './csv.js';
import { getDocentes } from '../api.js';
import './admin.css';

export default function AdminPanel() {
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroInstitucion, setFiltroInstitucion] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [busqueda, setBusqueda] = useState('');

  function cargar() {
    setCargando(true);
    setError(null);
    getDocentes()
      .then((data) => setDocentes(data))
      .catch((err) => setError(err.message || 'No se pudo cargar la información.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  const docentesFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();
    return docentes.filter((d) => {
      if (filtroInstitucion && d.institucion !== filtroInstitucion) return false;
      if (filtroArea && !(d.areas || []).includes(filtroArea)) return false;
      if (busquedaNormalizada && !d.nombre_docente.toLowerCase().includes(busquedaNormalizada)) return false;
      return true;
    });
  }, [docentes, filtroInstitucion, filtroArea, busqueda]);

  const resumen = useMemo(() => calcularResumen(docentesFiltrados), [docentesFiltrados]);
  const hayFiltrosActivos = Boolean(filtroInstitucion || filtroArea || busqueda);

  function handleDescargarCSV() {
    const filas = docentesFiltrados.map((d) => ({
      institucion: d.institucion,
      docente: d.nombre_docente,
      telefono: d.telefono,
      areas: (d.areas || []).join('; '),
      fecha: d.timestamp,
    }));
    descargarCSV('docentes-metodologias-activas.csv', filas);
  }

  return (
    <div className="pagina pagina--admin">
      <div className="hoja hoja-ancha">
        <Membrete />
        <div className="admin-encabezado">
          <h1>Panel de coordinación</h1>
          <p className="admin-encabezado-subtitulo">Capacitación en Metodologías Activas</p>
          {hayFiltrosActivos && (
            <p className="admin-nota-filtro">
              Los bloques de cobertura y volumen reflejan el filtro activo, no el total general.
            </p>
          )}
        </div>

        {error ? (
          <div className="admin-error">
            <p>{error}</p>
            <button type="button" className="boton boton--primario" onClick={cargar}>
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <Estadisticas resumen={resumen} />

            <div className="admin-bloques">
              <Cobertura resumen={resumen} />
              <VolumenPorIE resumen={resumen} />
            </div>

            <TablaDocentes
              docentes={docentesFiltrados}
              cargando={cargando}
              filtroInstitucion={filtroInstitucion}
              filtroArea={filtroArea}
              busqueda={busqueda}
              onFiltroInstitucion={setFiltroInstitucion}
              onFiltroArea={setFiltroArea}
              onBusqueda={setBusqueda}
              onDescargarCSV={handleDescargarCSV}
            />
          </>
        )}
      </div>
    </div>
  );
}
