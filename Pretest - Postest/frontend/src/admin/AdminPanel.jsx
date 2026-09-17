import { useEffect, useMemo, useState } from 'react';
import Membrete from '../components/Membrete.jsx';
import ParticipacionResumen from './ParticipacionResumen.jsx';
import EvolucionAgregada from './EvolucionAgregada.jsx';
import EstadisticasPretest from './EstadisticasPretest.jsx';
import EstadisticasPostest from './EstadisticasPostest.jsx';
import RespuestasAbiertas from './RespuestasAbiertas.jsx';
import { calcularResumenPretest, calcularResumenPostest, calcularParticipacion, calcularEvolucion } from './calculos.js';
import { descargarCSV } from './csv.js';
import { getPretest, getPostest } from '../api.js';
import './admin.css';

export default function AdminPanel() {
  const [pretest, setPretest] = useState([]);
  const [postest, setPostest] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

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

  const resumenPretest = useMemo(() => calcularResumenPretest(pretest), [pretest]);
  const resumenPostest = useMemo(() => calcularResumenPostest(postest), [postest]);
  const participacion = useMemo(() => calcularParticipacion(pretest, postest), [pretest, postest]);
  const evolucion = useMemo(() => calcularEvolucion(pretest, postest), [pretest, postest]);

  function handleDescargarPretest() {
    descargarCSV(
      'pretest-metodologias-activas.csv',
      pretest.map((f) => ({
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

  function handleDescargarPostest() {
    descargarCSV(
      'postest-metodologias-activas.csv',
      postest.map((f) => ({
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
            <ParticipacionResumen participacion={participacion} />
            <EvolucionAgregada evolucion={evolucion} />
            <EstadisticasPretest resumen={resumenPretest} onDescargarCSV={handleDescargarPretest} />
            <EstadisticasPostest resumen={resumenPostest} onDescargarCSV={handleDescargarPostest} />
            <RespuestasAbiertas pretest={pretest} postest={postest} />
          </>
        )}
      </div>
    </div>
  );
}
