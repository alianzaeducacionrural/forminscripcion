import { useEffect, useMemo, useState } from 'react';
import Membrete from '../components/Membrete.jsx';
import Modal from '../components/Modal.jsx';
import ParticipacionResumen from './ParticipacionResumen.jsx';
import EvolucionAgregada from './EvolucionAgregada.jsx';
import GridInstituciones from './GridInstituciones.jsx';
import InstitucionDetalle from './InstitucionDetalle.jsx';
import RespuestasAbiertas from './RespuestasAbiertas.jsx';
import {
  calcularResumenPretest,
  calcularResumenPostest,
  calcularResumenPorInstitucion,
  calcularParticipacion,
  calcularEvolucion,
} from './calculos.js';
import { descargarCSV } from './csv.js';
import { getPretest, getPostest } from '../api.js';
import './admin.css';

function csvPretest(filas, nombreArchivo) {
  descargarCSV(
    nombreArchivo,
    filas.map((f) => ({
      institucion: f.institucion,
      docente: f.nombre_docente,
      areas: (f.areas || []).join('; '),
      p1: f.p1_opcion,
      p2: f.p2_opcion,
      p3: f.p3_opcion,
      p4: (f.p4_elementos || []).join('; '),
      p4_otro: f.p4_otro,
      p5_competencia: f.p5_competencia,
      p5_estrategia: f.p5_estrategia,
      p5_evidencia: f.p5_evidencia,
      fecha: f.timestamp,
    }))
  );
}

function csvPostest(filas, nombreArchivo) {
  descargarCSV(
    nombreArchivo,
    filas.map((f) => ({
      institucion: f.institucion,
      docente: f.nombre_docente,
      areas: (f.areas || []).join('; '),
      q1: f.q1_opcion,
      q2: f.q2_opcion,
      q3: (f.q3_estrategias || []).join('; '),
      q3_otra: f.q3_otra,
      q3_aplicaria: f.q3_aplicaria,
      q4: (f.q4_elementos || []).join('; '),
      q5_aprendizaje: f.q5_aprendizaje,
      q5_estrategia: f.q5_estrategia,
      q5_evidencia: f.q5_evidencia,
      q5_seguimiento: f.q5_seguimiento,
      fecha: f.timestamp,
    }))
  );
}

export default function AdminPanel() {
  const [pretest, setPretest] = useState([]);
  const [postest, setPostest] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [institucionAbierta, setInstitucionAbierta] = useState(null); // null | '__global__' | nombre

  function cargar() {
    setCargando(true);
    setError(null);
    Promise.all([getPretest(), getPostest()])
      .then(([pre, post]) => {
        setPretest(pre);
        setPostest(post);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar la información.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  const resumenPretestGlobal = useMemo(() => calcularResumenPretest(pretest), [pretest]);
  const resumenPostestGlobal = useMemo(() => calcularResumenPostest(postest), [postest]);
  const resumenesPorInstitucion = useMemo(() => calcularResumenPorInstitucion(pretest, postest), [pretest, postest]);
  const participacion = useMemo(() => calcularParticipacion(pretest, postest), [pretest, postest]);
  const evolucion = useMemo(() => calcularEvolucion(pretest, postest), [pretest, postest]);

  const resumenGlobalTile = {
    totalPretest: pretest.length,
    totalPostest: postest.length,
    alineadoPre: resumenPretestGlobal.porcentajeAlineadoPromedio,
    alineadoPost: resumenPostestGlobal.porcentajeAlineadoPromedio,
  };

  const detalle = useMemo(() => {
    if (!institucionAbierta) return null;
    if (institucionAbierta === '__global__') {
      return { titulo: 'Todas las instituciones', pretest, postest, esGlobal: true };
    }
    return {
      titulo: institucionAbierta,
      pretest: pretest.filter((f) => f.institucion === institucionAbierta),
      postest: postest.filter((f) => f.institucion === institucionAbierta),
      esGlobal: false,
    };
  }, [institucionAbierta, pretest, postest]);

  return (
    <div className="pagina pagina--admin">
      <div className="hoja hoja-ancha">
        <Membrete />
        <div className="admin-encabezado">
          <h1>Panel de coordinación</h1>
          <p className="admin-encabezado-subtitulo">Estrategias metodológicas activas — Pretest / Postest</p>
        </div>

        {error ? (
          <div className="admin-error">
            <p>{error}</p>
            <button type="button" className="boton boton--primario" onClick={cargar}>
              Reintentar
            </button>
          </div>
        ) : cargando ? (
          <p className="admin-cargando">Cargando información…</p>
        ) : (
          <>
            <ParticipacionResumen
              participacion={participacion}
              alineadoPreGlobal={resumenPretestGlobal.porcentajeAlineadoPromedio}
              alineadoPostGlobal={resumenPostestGlobal.porcentajeAlineadoPromedio}
            />
            <EvolucionAgregada evolucion={evolucion} />
            <GridInstituciones
              resumenes={resumenesPorInstitucion}
              resumenGlobal={resumenGlobalTile}
              onAbrirInstitucion={setInstitucionAbierta}
              onAbrirGlobal={() => setInstitucionAbierta('__global__')}
            />
            <RespuestasAbiertas pretest={pretest} postest={postest} />
          </>
        )}
      </div>

      {detalle && (
        <Modal titulo={detalle.titulo} onCerrar={() => setInstitucionAbierta(null)} ancho="grande">
          <InstitucionDetalle
            titulo={detalle.titulo}
            pretest={detalle.pretest}
            postest={detalle.postest}
            esGlobal={detalle.esGlobal}
            onDescargarPretest={() => csvPretest(detalle.pretest, `pretest-${detalle.titulo}.csv`)}
            onDescargarPostest={() => csvPostest(detalle.postest, `postest-${detalle.titulo}.csv`)}
          />
        </Modal>
      )}
    </div>
  );
}
