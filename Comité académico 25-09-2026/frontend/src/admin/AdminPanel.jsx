import { useEffect, useMemo, useState } from 'react';
import Membrete from '../components/Membrete.jsx';
import Modal from '../components/Modal.jsx';
import ResumenStats from './ResumenStats.jsx';
import CategoriasBarra from './CategoriasBarra.jsx';
import GridIES from './GridIES.jsx';
import { DetalleIES, DetalleGlobal } from './DetalleIES.jsx';
import { calcularTotales, distribucionCategorias, resumenPorIES } from './calculos.js';
import { getMatriz1, getMatriz2 } from '../api.js';
import '../formulario.css';
import './admin.css';

const GLOBAL = '__global__';

export default function AdminPanel() {
  const [matriz1, setMatriz1] = useState([]);
  const [matriz2, setMatriz2] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [abierta, setAbierta] = useState(null); // null | GLOBAL | nombre de IES

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

  const resumenes = useMemo(() => resumenPorIES(matriz1, matriz2), [matriz1, matriz2]);
  const totales = useMemo(() => calcularTotales(resumenes), [resumenes]);
  const categorias = useMemo(() => distribucionCategorias(resumenes), [resumenes]);

  const resumenAbierto = abierta && abierta !== GLOBAL ? resumenes.find((r) => r.institucion === abierta) : null;
  const primeraCarga = cargando && matriz1.length + matriz2.length === 0;

  return (
    <div className="pagina pagina--admin">
      <div className="hoja hoja-ancha">
        <Membrete />
        <div className="admin-encabezado">
          <div>
            <h1>Panel de coordinación</h1>
            <p className="admin-encabezado-subtitulo">Comité Académico — La Universidad en el Campo</p>
          </div>
          <button type="button" className="boton boton--secundario" onClick={cargar} disabled={cargando}>
            {cargando ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        {error ? (
          <div className="admin-error">
            <p>{error}</p>
            <button type="button" className="boton boton--primario" onClick={cargar}>
              Reintentar
            </button>
          </div>
        ) : primeraCarga ? (
          <p className="admin-cargando">Cargando información…</p>
        ) : (
          <>
            <ResumenStats totales={totales} />
            <GridIES
              resumenes={resumenes}
              totales={totales}
              onAbrirIES={setAbierta}
              onAbrirGlobal={() => setAbierta(GLOBAL)}
            />
            <CategoriasBarra distribucion={categorias} />
          </>
        )}
      </div>

      {abierta && (
        <Modal titulo={abierta === GLOBAL ? 'Todas las IES' : abierta} onCerrar={() => setAbierta(null)} ancho="grande">
          {abierta === GLOBAL ? <DetalleGlobal resumenes={resumenes} /> : <DetalleIES resumen={resumenAbierto} />}
        </Modal>
      )}
    </div>
  );
}
