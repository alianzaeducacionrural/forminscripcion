import './Sello.css';

// Insignia de confirmación: estrella de 12 puntas con check, que gira al entrar.
export default function Sello({ texto = 'RECIBIDO', fecha }) {
  return (
    <div className="sello" role="status">
      <span className="sello-estrella" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="56" height="56">
          <path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="sello-texto">{texto}</span>
      {fecha && <span className="sello-fecha">{fecha}</span>}
    </div>
  );
}
