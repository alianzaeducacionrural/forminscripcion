import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import Membrete from '../components/Membrete.jsx';
import ResumenStats from './ResumenStats.jsx';
import DistribucionValoracion from './DistribucionValoracion.jsx';
import GridInstituciones from './GridInstituciones.jsx';
import { DetalleInstitucion, DetalleGlobal } from './DetalleInstitucion.jsx';
import { calcularTotales, distribucionValoracion, resumenPorInstitucion } from './calculos.js';
import { getExperimentados, getNuevos } from '../api.js';
import './admin.css';

const GLOBAL = '__global__';

export default function AdminPanel() {
  const [experimentados, setExperimentados] = useState([]);
  const [nuevos, setNuevos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [abierta, setAbierta] = useState(null); // null | GLOBAL | clave de institución

  function cargar() {
    setCargando(true);
    setError(null);
    Promise.all([getExperimentados(), getNuevos()])
      .then(([exp, nue]) => {
        setExperimentados(exp);
        setNuevos(nue);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar la información.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  const resumenes = useMemo(() => resumenPorInstitucion(experimentados, nuevos), [experimentados, nuevos]);
  const totales = useMemo(() => calcularTotales(resumenes), [resumenes]);
  const valoracion = useMemo(() => distribucionValoracion(resumenes), [resumenes]);

  const resumenAbierto = abierta && abierta !== GLOBAL ? resumenes.find((r) => r.clave === abierta) : null;
  const primeraCarga = cargando && experimentados.length + nuevos.length === 0;

  return (
    <div className="admin">
      <Membrete />
      <header className="admin-hero">
        <div className="admin-hero-interior">
          <div>
            <span className="admin-hero-etiqueta">Acompañamiento entre Pares · Sesión 1</span>
            <h1>Panel de coordinación</h1>
            <p>Rectores experimentados y rectores nuevos, por institución</p>
          </div>
          <button type="button" className="boton" onClick={cargar} disabled={cargando}>
            {cargando ? 'Actualizando…' : '↻ Actualizar'}
          </button>
        </div>
      </header>

      <main className="admin-cuerpo">
        {error ? (
          <div className="admin-mensaje admin-mensaje--error">
            <p>{error}</p>
            <button type="button" className="boton boton--primario" onClick={cargar}>
              Reintentar
            </button>
          </div>
        ) : primeraCarga ? (
          <p className="admin-mensaje">Cargando información…</p>
        ) : (
          <>
            <ResumenStats totales={totales} />
            <GridInstituciones
              resumenes={resumenes}
              totales={totales}
              onAbrirInstitucion={setAbierta}
              onAbrirGlobal={() => setAbierta(GLOBAL)}
            />
            <DistribucionValoracion distribucion={valoracion} />
          </>
        )}
      </main>

      {abierta && (resumenAbierto || abierta === GLOBAL) && (
        <Modal
          titulo={abierta === GLOBAL ? 'Todas las instituciones' : resumenAbierto.institucion}
          onCerrar={() => setAbierta(null)}
          ancho="grande"
        >
          {abierta === GLOBAL ? <DetalleGlobal resumenes={resumenes} /> : <DetalleInstitucion resumen={resumenAbierto} />}
        </Modal>
      )}
    </div>
  );
}
