import { useEffect, useRef } from 'react';
import './Modal.css';

/**
 * `bloqueado` impide cerrar el modal (Escape, clic afuera y botón ✕) mientras
 * hay una operación en curso, como el envío de un formulario.
 */
export default function Modal({ titulo, onCerrar, children, ancho = 'normal', bloqueado = false }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function alPresionarTecla(e) {
      if (e.key === 'Escape' && !bloqueado) onCerrar();
    }
    document.addEventListener('keydown', alPresionarTecla);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', alPresionarTecla);
  }, [onCerrar, bloqueado]);

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && !bloqueado && onCerrar()}>
      <div
        className={`modal-panel entra ${ancho === 'grande' ? 'modal-panel--grande' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        aria-busy={bloqueado}
        tabIndex={-1}
        ref={panelRef}
      >
        {!bloqueado && (
          <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
