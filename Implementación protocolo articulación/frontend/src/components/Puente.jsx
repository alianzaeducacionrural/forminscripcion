import { CRITERIOS, RESPUESTAS } from '../data/checklist.js'

const N = CRITERIOS.length
const X0 = 96
const X1 = 604
const PASO = (X1 - X0) / N
const ANCHO = PASO - 4
const BASE = 88
const ARCO = 26

const ETIQUETA = Object.fromEntries(RESPUESTAS.map((r) => [r.valor, r.etiqueta]))

function posicion(i) {
  const t = (i + 0.5) / N
  return { x: X0 + i * PASO + 2, y: BASE - Math.sin(t * Math.PI) * ARCO }
}

/**
 * El puente entre la Educación Media (izquierda) y la Posmedia (derecha).
 * Cada tabla es un criterio; su forma y color dependen de la respuesta.
 * Con `onElegir` las tablas son botones que saltan al criterio.
 */
export default function Puente({ respuestas = {}, actual, onElegir, mini = false, titulo = 'Puente de articulación' }) {
  return (
    <svg
      className={`puente${mini ? ' puente--mini' : ''}`}
      viewBox="0 0 700 150"
      role="img"
      aria-label={titulo}
    >
      <defs>
        {CRITERIOS.map((c, i) => {
          const { x, y } = posicion(i)
          return (
            <clipPath key={c.clave} id={`mitad-${c.clave}-${mini ? 'm' : 'g'}`}>
              <rect x={x} y={y + 11} width={ANCHO} height={11} />
            </clipPath>
          )
        })}
      </defs>

      {/* Cables */}
      <path className="puente__cable" d={`M${X0} ${BASE - 2} Q350 ${BASE - ARCO * 2 - 18} ${X1} ${BASE - 2}`} />
      <path className="puente__cable puente__cable--2" d={`M${X0} ${BASE + 20} Q350 ${BASE - ARCO * 2 + 8} ${X1} ${BASE + 20}`} />

      {/* Orillas */}
      <g className="puente__orilla">
        <path d="M0 96 H92 V150 H0 Z" />
        <path d="M608 96 H700 V150 H608 Z" />
      </g>
      <text className="puente__rotulo" x="46" y="124" textAnchor="middle">EDUCACIÓN</text>
      <text className="puente__rotulo" x="46" y="138" textAnchor="middle">MEDIA</text>
      <text className="puente__rotulo" x="654" y="124" textAnchor="middle">POSMEDIA</text>

      {/* Tablas */}
      {CRITERIOS.map((c, i) => {
        const { x, y } = posicion(i)
        const r = respuestas[c.clave]
        const clase = `tabla tabla--${r ? r.toLowerCase() : 'vacia'}${actual === c.clave ? ' tabla--actual' : ''}`
        const nombre = `${i + 1}. ${c.componente}: ${r ? ETIQUETA[r] : 'sin responder'}`
        const interactivo = !!onElegir
        return (
          <g
            key={c.clave}
            className={clase}
            {...(interactivo && {
              role: 'button',
              tabIndex: 0,
              'aria-label': nombre,
              'aria-current': actual === c.clave ? 'step' : undefined,
              onClick: () => onElegir(c.clave),
              onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onElegir(c.clave)
                }
              },
            })}
          >
            <title>{nombre}</title>
            <rect className="tabla__base" x={x} y={y} width={ANCHO} height={22} rx="3" />
            {r === 'PARCIAL' && (
              <rect className="tabla__mitad" x={x} y={y} width={ANCHO} height={22} rx="3"
                clipPath={`url(#mitad-${c.clave}-${mini ? 'm' : 'g'})`} />
            )}
            {!mini && (
              <>
                {r === 'SI' && <path className="tabla__marca" d={`M${x + 6} ${y + 11} l4 4 l8 -8`} />}
                {r === 'NO' && <path className="tabla__marca" d={`M${x + 7} ${y + 6} l10 10 M${x + 17} ${y + 6} l-10 10`} />}
                {r === 'NA' && <path className="tabla__marca" d={`M${x + 7} ${y + 11} h10`} />}
                <text className="tabla__num" x={x + ANCHO / 2} y={y + 38} textAnchor="middle">{i + 1}</text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
