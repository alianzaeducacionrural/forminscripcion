import './preguntas.css';

/**
 * Pregunta de texto libre, opcional — sin asterisco ni contador de caracteres.
 * Sin padding horizontal propio: se usa anidada dentro de un `.pregunta`
 * fieldset que ya aporta el padding del contenedor.
 */
export default function PreguntaAbierta({ label, valor, onChange, placeholder }) {
  return (
    <div className="pregunta-abierta">
      <label className="campo-etiqueta">{label}</label>
      <textarea
        className="campo-input campo-textarea"
        rows={3}
        value={valor || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
