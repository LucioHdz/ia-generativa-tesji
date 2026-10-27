import { useEffect, useState } from 'react'

function temaInicial() {
  return document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
}

export default function Encabezado() {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    try {
      localStorage.setItem('tema', tema)
    } catch {
      // sin almacenamiento: el tema solo dura esta sesión
    }
  }, [tema])

  const oscuro = tema === 'oscuro'

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 sm:py-7">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primario text-xl text-white">
          <i className="bi bi-diagram-3-fill" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-titulo text-xl font-bold leading-tight sm:text-2xl">Neurocalculadora</h1>
          <p className="text-sm text-texto-suave">Una red neuronal que aprendió a sumar y restar</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setTema(oscuro ? 'claro' : 'oscuro')}
        className="capa flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors hover:border-primario"
        aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      >
        <i className={`bi ${oscuro ? 'bi-sun-fill' : 'bi-moon-stars-fill'} text-primario`} aria-hidden="true" />
        <span className="hidden sm:inline">{oscuro ? 'Tema claro' : 'Tema oscuro'}</span>
      </button>
    </header>
  )
}
