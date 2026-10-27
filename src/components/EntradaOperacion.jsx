const EJEMPLOS = ['12+21', '45.5-12.25', '-7+3.5', '99.99+99.99', '8--2']

export default function EntradaOperacion({ texto, onCambiar, onCalcular, error, animando }) {
  const enviar = (e) => {
    e.preventDefault()
    onCalcular()
  }

  return (
    <form onSubmit={enviar} className="capa rounded-2xl p-5">
      <label htmlFor="operacion" className="font-titulo text-base font-bold">
        <i className="bi bi-keyboard me-2 text-primario" aria-hidden="true" />
        Escribe una operación
      </label>
      <p className="mt-1 text-sm text-texto-suave">
        Números de −99.99 a 99.99, con hasta 2 decimales, y el operador <span className="font-codigo">+</span> o{' '}
        <span className="font-codigo">-</span>.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          id="operacion"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck="false"
          value={texto}
          onChange={(e) => onCambiar(e.target.value)}
          aria-invalid={!!error}
          aria-describedby="operacion-error"
          placeholder="12+21"
          className={`capa-hundida font-codigo min-w-0 flex-1 rounded-xl px-4 py-3 text-lg outline-none transition-colors focus:border-primario ${
            error && texto ? 'border-red-400!' : ''
          }`}
        />
        <button
          type="submit"
          disabled={!!error || animando}
          className="flex items-center gap-2 rounded-xl bg-acento px-4 py-3 font-titulo font-bold text-acento-texto transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <i className={`bi ${animando ? 'bi-hourglass-split' : 'bi-lightning-charge-fill'}`} aria-hidden="true" />
          Calcular
        </button>
      </div>

      <p id="operacion-error" className="mt-2 min-h-5 text-sm text-red-600 dark:text-red-400" role="status">
        {texto && error}
      </p>

      <div className="mt-1 flex flex-wrap gap-2">
        {EJEMPLOS.map((ej) => (
          <button
            key={ej}
            type="button"
            onClick={() => onCambiar(ej)}
            className="font-codigo rounded-lg bg-primario-suave px-2.5 py-1 text-sm text-primario-fuerte transition-colors hover:bg-primario hover:text-white"
          >
            {ej}
          </button>
        ))}
      </div>
    </form>
  )
}
