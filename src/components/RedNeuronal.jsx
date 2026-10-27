import { activacionDeCapa } from '../nn/red.js'
import { nombreNeurona } from '../nn/nombres.js'

const ANCHO = 760
const ALTO = 400
const RADIO = 26
const SEPARACION_Y = 80
const COLUMNAS_X = [80, 290, 500, 690]
const TITULOS_CAPA = ['Entrada', 'Oculta 1', 'Oculta 2', 'Salida']

function posiciones(arquitectura) {
  return arquitectura.map((n, l) => {
    const inicio = ALTO / 2 - ((n - 1) * SEPARACION_Y) / 2 + 12
    return Array.from({ length: n }, (_, j) => ({ x: COLUMNAS_X[l], y: inicio + j * SEPARACION_Y }))
  })
}

function relleno(a) {
  if (a == null) return 'var(--superficie)'
  const intensidad = Math.round(Math.min(Math.abs(a), 1) * 85)
  const base = a >= 0 ? 'var(--primario)' : 'var(--negativo)'
  return `color-mix(in oklab, ${base} ${intensidad}%, var(--superficie))`
}

const colorTexto = (a) => (a != null && Math.abs(a) > 0.55 ? '#ffffff' : 'var(--texto)')

export default function RedNeuronal({
  red,
  propagacion,
  paso,
  repeticion,
  seleccion,
  onSeleccionar,
  ultimoCambio,
  pesosModificados,
  onRestaurarTodo,
}) {
  const pos = posiciones(red.arquitectura)
  const totalCapas = red.arquitectura.length
  const capaSeleccionada = seleccion ? seleccion.capa + 1 : null

  const valor = (l, j) => (propagacion && paso >= l + 1 ? propagacion.detalle[l].a[j] : null)

  const seleccionar = (l, j) => {
    if (l === 0) return
    const mismo = seleccion && seleccion.capa === l - 1 && seleccion.indice === j
    onSeleccionar(mismo ? null : { capa: l - 1, indice: j })
  }

  return (
    <div className="capa rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-titulo text-base font-bold">
            <i className="bi bi-bezier2 me-2 text-primario" aria-hidden="true" />
            Red neuronal · 3 → 4 → 4 → 1
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Haz clic en una neurona oculta o de salida para ver y mover sus pesos.
          </p>
        </div>
        <button
          type="button"
          onClick={onRestaurarTodo}
          disabled={!pesosModificados}
          className="capa-hundida flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:border-primario disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
          Restaurar pesos
        </button>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-texto-suave sm:hidden">
        <i className="bi bi-arrows-expand-vertical" aria-hidden="true" />
        Desliza horizontalmente para ver toda la red.
      </p>
      <div className="-mx-2 mt-3 overflow-x-auto px-2">
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO + 20}`}
          className="font-codigo min-w-[560px] select-none"
          role="img"
          aria-label="Diagrama de la red neuronal con sus conexiones"
        >
          {/* Columnas de fondo: dan profundidad a cada capa */}
          {COLUMNAS_X.map((x, l) => (
            <g key={`col-${l}`}>
              <rect
                x={x - 52}
                y={18}
                width={104}
                height={ALTO - 4}
                rx={22}
                fill="var(--superficie-2)"
                opacity={paso === l + 1 ? 1 : 0.55}
                style={{ transition: 'opacity .4s' }}
              />
              <text
                x={x}
                y={40}
                textAnchor="middle"
                fontSize="12"
                fill="var(--texto-suave)"
                fontFamily="var(--font-titulo)"
                fontWeight="700"
              >
                {TITULOS_CAPA[l]}
              </text>
            </g>
          ))}

          {/* Sinapsis (pesos) */}
          {red.capas.map((capa, c) =>
            capa.map((neurona, j) =>
              neurona.pesos.map((w, i) => {
                const desde = pos[c][i]
                const hasta = pos[c + 1][j]
                const entrante = capaSeleccionada === c + 1 && seleccion.indice === j
                const atenuada = seleccion && !entrante
                const opacidad = (0.3 + Math.min(Math.abs(w) / 4, 0.6)) * (atenuada ? 0.35 : 1)
                return (
                  <line
                    key={`s-${c}-${j}-${i}`}
                    x1={desde.x}
                    y1={desde.y}
                    x2={hasta.x}
                    y2={hasta.y}
                    stroke={entrante ? 'var(--acento)' : w >= 0 ? 'var(--primario)' : 'var(--negativo)'}
                    strokeWidth={0.6 + Math.min(Math.abs(w), 5) * 1.3}
                    strokeDasharray={w < 0 ? '5 4' : undefined}
                    strokeLinecap="round"
                    opacity={opacidad}
                    style={{ transition: 'stroke-width .2s, opacity .3s' }}
                  >
                    <title>{`${nombreNeurona(c, i, totalCapas)} → ${nombreNeurona(c + 1, j, totalCapas)}: w = ${w.toFixed(3)}`}</title>
                  </line>
                )
              }),
            ),
          )}

          {/* Impulsos de la animación paso a paso */}
          {red.capas.map((capa, c) =>
            paso === c + 2
              ? capa.map((neurona, j) =>
                  neurona.pesos.map((_, i) => {
                    const d = pos[c][i]
                    const h = pos[c + 1][j]
                    return (
                      <path
                        key={`p-${repeticion}-${c}-${j}-${i}`}
                        d={`M${d.x} ${d.y} L${h.x} ${h.y}`}
                        pathLength="100"
                        className="sinapsis-pulso"
                        stroke="var(--acento)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )
                  }),
                )
              : null,
          )}

          {/* Impulsos en vivo al mover un peso */}
          {ultimoCambio &&
            ultimoCambio.capa + 1 < red.capas.length &&
            red.capas[ultimoCambio.capa + 1].map((_, j) => {
              const d = pos[ultimoCambio.capa + 1][ultimoCambio.indice]
              const h = pos[ultimoCambio.capa + 2][j]
              return (
                <path
                  key={`v-${ultimoCambio.marca}-${j}`}
                  d={`M${d.x} ${d.y} L${h.x} ${h.y}`}
                  pathLength="100"
                  className="sinapsis-pulso"
                  style={{ '--duracion': '0.45s' }}
                  stroke="var(--acento)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              )
            })}

          {/* Neuronas */}
          {pos.map((capa, l) =>
            capa.map(({ x, y }, j) => {
              const a = valor(l, j)
              const seleccionada = capaSeleccionada === l && seleccion.indice === j
              const editable = l > 0
              const dispara =
                (paso === l + 1 && propagacion) ||
                (ultimoCambio && ultimoCambio.capa + 1 === l && ultimoCambio.indice === j)
              const nombre = nombreNeurona(l, j, totalCapas)
              return (
                <g
                  key={`n-${l}-${j}`}
                  onClick={() => seleccionar(l, j)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      seleccionar(l, j)
                    }
                  }}
                  role={editable ? 'button' : undefined}
                  tabIndex={editable ? 0 : undefined}
                  aria-label={
                    editable
                      ? `Neurona ${nombre}, activación ${activacionDeCapa(l - 1, totalCapas - 1)}${a != null ? `, valor ${a.toFixed(2)}` : ''}`
                      : undefined
                  }
                  aria-pressed={editable ? seleccionada : undefined}
                  className={editable ? 'cursor-pointer outline-none [&:focus-visible>circle.borde]:stroke-acento' : ''}
                >
                  {dispara && (
                    <circle
                      key={`d-${repeticion}-${ultimoCambio?.marca ?? 0}`}
                      cx={x}
                      cy={y}
                      r={RADIO}
                      fill="none"
                      stroke="var(--acento)"
                      strokeWidth="3"
                      className="neurona-disparo"
                      style={{ animationDelay: paso === l + 1 && l > 0 ? '0.55s' : '0s', opacity: 0 }}
                    />
                  )}
                  <circle
                    className="borde"
                    cx={x}
                    cy={y}
                    r={RADIO}
                    fill={relleno(a)}
                    stroke={seleccionada ? 'var(--acento)' : 'var(--primario)'}
                    strokeWidth={seleccionada ? 4 : 2}
                    style={{
                      transition: 'fill .35s, stroke .2s',
                      transitionDelay: paso === l + 1 && l > 0 ? '0.5s, 0s' : '0s',
                    }}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill={colorTexto(a)}
                    style={{ transition: 'fill .35s' }}
                  >
                    {a != null ? a.toFixed(2) : nombre}
                  </text>
                  {a != null && (
                    <text x={x} y={y + RADIO + 15} textAnchor="middle" fontSize="11" fill="var(--texto-suave)">
                      {nombre}
                    </text>
                  )}
                </g>
              )
            }),
          )}
        </svg>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-texto-suave">
        <li className="flex items-center gap-2">
          <svg width="26" height="6" aria-hidden="true">
            <line x1="1" y1="3" x2="25" y2="3" stroke="var(--primario)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Peso positivo
        </li>
        <li className="flex items-center gap-2">
          <svg width="26" height="6" aria-hidden="true">
            <line x1="1" y1="3" x2="25" y2="3" stroke="var(--negativo)" strokeWidth="3" strokeDasharray="5 4" />
          </svg>
          Peso negativo
        </li>
        <li>Grosor = magnitud del peso</li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-acento" />
          Impulso (sinapsis)
        </li>
        <li>Color de la neurona = valor de activación</li>
      </ul>
    </div>
  )
}
