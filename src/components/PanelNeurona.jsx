import { activacionDeCapa } from '../nn/red.js'
import { descripcionCapa, nombreNeurona } from '../nn/nombres.js'

const MIN = -5
const MAX = 5

function Deslizador({ id, etiqueta, valor, original, onCambiar }) {
  const pct = ((Math.min(Math.max(valor, MIN), MAX) - MIN) / (MAX - MIN)) * 100
  const modificado = Math.abs(valor - original) > 1e-9
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="font-codigo">
          {etiqueta}
        </label>
        <span className="font-codigo flex items-center gap-1.5 tabular-nums">
          {modificado && <span className="h-2 w-2 rounded-full bg-acento" title="Modificado" />}
          {valor.toFixed(2)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={MIN}
        max={MAX}
        step="0.01"
        value={valor}
        onChange={(e) => onCambiar(parseFloat(e.target.value))}
        className="deslizador mt-1.5 w-full"
        style={{ '--pct': `${pct}%` }}
      />
    </div>
  )
}

export default function PanelNeurona({ red, original, seleccion, propagacion, onCambiar, onRestaurar, onCerrar }) {
  const { capa, indice } = seleccion
  const totalCapas = red.arquitectura.length
  const l = capa + 1
  const neurona = red.capas[capa][indice]
  const neuronaOriginal = original.capas[capa][indice]
  const funcion = activacionDeCapa(capa, red.capas.length)
  const nombre = nombreNeurona(l, indice, totalCapas)

  const x = propagacion?.detalle[capa].a
  const z = propagacion?.detalle[l].z[indice]
  const a = propagacion?.detalle[l].a[indice]

  return (
    <aside
      className="panel-entra capa fixed inset-x-3 bottom-3 z-20 max-h-[55dvh] overflow-y-auto rounded-2xl border-primario/50! p-5 shadow-2xl shadow-primario/25 lg:static lg:max-h-none lg:overflow-visible"
      aria-label={`Pesos de la neurona ${nombre}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-texto-suave uppercase">
            {descripcionCapa(l, totalCapas)} · {funcion}
          </p>
          <h3 className="font-codigo mt-0.5 text-2xl font-semibold text-primario">{nombre}</h3>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="grid h-8 w-8 place-items-center rounded-lg text-texto-suave transition-colors hover:bg-superficie-2 hover:text-texto"
          aria-label="Cerrar panel"
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:gap-x-8">
        {neurona.pesos.map((w, i) => (
          <Deslizador
            key={i}
            id={`w-${capa}-${indice}-${i}`}
            etiqueta={`w${i + 1}  ${nombreNeurona(l - 1, i, totalCapas)} -> ${nombre}`}
            valor={w}
            original={neuronaOriginal.pesos[i]}
            onCambiar={(v) => onCambiar(capa, indice, 'peso', i, v)}
          />
        ))}
        <Deslizador
          id={`b-${capa}-${indice}`}
          etiqueta="bias  b"
          valor={neurona.bias}
          original={neuronaOriginal.bias}
          onCambiar={(v) => onCambiar(capa, indice, 'bias', null, v)}
        />
      </div>

      <div className="capa-hundida font-codigo mt-5 rounded-xl p-3 text-xs leading-relaxed">
        {propagacion ? (
          <>
            <p className="text-texto-suave">z = Σ wᵢ·xᵢ + b</p>
            <p className="break-words">
              z = {neurona.pesos.map((w, i) => `(${w.toFixed(2)}·${x[i].toFixed(2)})`).join(' + ')} +{' '}
              {neurona.bias.toFixed(2)}
            </p>
            <p className="mt-1">
              z = <span className="text-primario">{z.toFixed(4)}</span>
            </p>
            <p className="mt-1">
              a = {funcion}(z) {'=>'} <span className="rounded bg-acento px-1 text-acento-texto">{a.toFixed(4)}</span>
            </p>
          </>
        ) : (
          <p className="text-texto-suave">Calcula una operación para ver cómo esta neurona procesa la señal.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRestaurar(capa, indice)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-borde py-2 text-sm font-medium transition-colors hover:border-primario hover:text-primario"
      >
        <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
        Restaurar esta neurona
      </button>
    </aside>
  )
}
