import './Sello.css';

// El sello de "recibido": el mismo gesto que un funcionario hace con un
// formulario en papel, traducido a una animación de estampado. Se usa en
// la pantalla de éxito del formulario.
export default function Sello({ texto = 'RECIBIDO', fecha }) {
  return (
    <div className="sello" role="status">
      <svg viewBox="0 0 120 120" className="sello-anillo" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 4" />
        <path d="M38 61 L52 75 L84 40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sello-texto">{texto}</span>
      {fecha && <span className="sello-fecha">{fecha}</span>}
    </div>
  );
}
