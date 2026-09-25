import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import ResumenStats from './ResumenStats.jsx';
import CategoriasBarra from './CategoriasBarra.jsx';
import GridIES from './GridIES.jsx';
import { DetalleIES, DetalleGlobal } from './DetalleIES.jsx';
import { calcularTotales, distribucionCategorias, resumenPorInstitucion } from './calculos.js';
import { getMatriz1, getMatriz2 } from '../api.js';
import './admin.css';

const GLOBAL = '__global__';

export default function AdminPanel() {
  const [matriz1, setMatriz1] = useState([]);
  const [matriz2, setMatriz2] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [abierta, setAbierta] = useState(null); // null | GLOBAL | clave de institución

  function cargar() {
    setCargando(true);
    setError(null);
    Promise.all([getMatriz1(), getMatriz2()])
      .then(([m1, m2]) => {
        setMatriz1(m1);
        setMatriz2(m2);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar la información.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  const resumenes = useMemo(() => resumenPorInstitucion(matriz1, matriz2), [matriz1, matriz2]);
  const totales = useMemo(() => calcularTotales(resumenes), [resumenes]);
  const categorias = useMemo(() => distribucionCategorias(resumenes), [resumenes]);

  const resumenAbierto = abierta && abierta !== GLOBAL ? resumenes.find((r) => r.clave === abierta) : null;
  const primeraCarga = cargando && matriz1.length + matriz2.length === 0;

  return (
    <div className="admin">
      <header className="admin-hero">
        <div className="admin-hero-interior">
          <div>
            <span className="admin-hero-etiqueta">Comité Académico · 25 sep 2026</span>
            <h1>Panel de coordinación</h1>
            <p>La Universidad en el Campo — Matrices 1 y 2</p>
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
            <GridIES
              resumenes={resumenes}
              totales={totales}
              onAbrirInstitucion={setAbierta}
              onAbrirGlobal={() => setAbierta(GLOBAL)}
            />
            <CategoriasBarra distribucion={categorias} />
          </>
        )}
      </main>

      {abierta && (resumenAbierto || abierta === GLOBAL) && (
        <Modal
          titulo={abierta === GLOBAL ? 'Todas las instituciones' : resumenAbierto.institucion}
          onCerrar={() => setAbierta(null)}
          ancho="grande"
        >
          {abierta === GLOBAL ? <DetalleGlobal resumenes={resumenes} /> : <DetalleIES resumen={resumenAbierto} />}
        </Modal>
      )}
    </div>
  );
}
