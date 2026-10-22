import Casilla from './Casilla.jsx';
import './preguntas.css';

/**
 * Pregunta de selección múltiple (checklist), reutilizando el chip `Casilla`
 * del proyecto hermano. Un color de marca único (no un color por opción,
 * como en las áreas) porque estas opciones no tienen identidad propia.
 * sentinelOtro/textoOtro/onChangeOtro son opcionales: solo se pasan cuando
 * el checklist tiene una opción de texto libre ("Otro"/"Otra").
 */
export default function PreguntaChecklist({
  numero,
  texto,
  opciones,
  seleccion,
  onToggle,
  color = 'indigo',
  sentinelOtro,
  textoOtro,
  onChangeOtro,
  error,
  errorOtro,
  tocado,
}) {
  return (
    <fieldset className="pregunta entra">
      <legend className="pregunta-enunciado">
        {numero && <span className="pregunta-numero">{numero}</span>}
        {texto}
      </legend>
      <div className="checklist-lista" role="group" aria-label={texto}>
        {opciones.map((opcion) => (
          <Casilla
            key={opcion}
            etiqueta={opcion}
            color={color}
            checked={seleccion.includes(opcion)}
            onChange={(marcada) => onToggle(opcion, marcada)}
          />
        ))}
        {sentinelOtro && (
          <Casilla
            etiqueta={sentinelOtro}
            color={color}
            checked={seleccion.includes(sentinelOtro)}
            onChange={(marcada) => onToggle(sentinelOtro, marcada)}
          />
        )}
      </div>
      {sentinelOtro && seleccion.includes(sentinelOtro) && (
        <>
          <input
            type="text"
            className="campo-input campo-input--otro entra"
            placeholder={`Especifique "${sentinelOtro}"…`}
            value={textoOtro || ''}
            onChange={(e) => onChangeOtro(e.target.value)}
          />
          {errorOtro && tocado && <p className="campo-error">{errorOtro}</p>}
        </>
      )}
      {error && tocado && <p className="campo-error">{error}</p>}
    </fieldset>
  );
}
