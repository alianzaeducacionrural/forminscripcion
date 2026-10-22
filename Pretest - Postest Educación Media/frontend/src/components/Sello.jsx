import './Sello.css';

// Insignia de confirmación: círculo con degradado de marca y check blanco,
// con un anillo de pulso alrededor para el momento de "listo".
export default function Sello({ texto = 'RECIBIDO', fecha }) {
  return (
    <div className="sello" role="status">
      <span className="sello-pulso" aria-hidden="true" />
      <span className="sello-insignia" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="34" height="34">
          <path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="sello-texto">{texto}</span>
      {fecha && <span className="sello-fecha">{fecha}</span>}
    </div>
  );
}
