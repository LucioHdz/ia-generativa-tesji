import { codificarEntrada, ESCALA_ENTRADA } from '../nn/red.js'
import { ETIQUETA_TIPO } from '../nn/tokenizar.js'

const ESTILO_TIPO = {
  digito: 'bg-primario-suave text-primario-fuerte',
  punto: 'bg-superficie-2 text-texto-suave',
  signo: 'bg-superficie-2 text-primario border border-primario/40',
  operador: 'bg-primario text-white',
}

const formato = (n, d = 2) => n.toFixed(d)

export default function Tokenizacion({ analisis, paso, repeticion, consulta }) {
  // Si el texto es el de la última consulta se muestra animado; si el usuario lo cambió, en vivo.
  const texto = (tokens) => tokens.map((t) => t.c).join('')
  const enAnimacion = paso >= 0 && consulta && texto(consulta.tokens) === texto(analisis.tokens)
  const tokens = analisis.tokens
  const mostrarCodificacion = enAnimacion && paso >= 1
  const x = consulta ? codificarEntrada(consulta.a, consulta.op, consulta.b) : null

  return (
    <div className="capa rounded-2xl p-5">
      <h2 className="font-titulo text-base font-bold">
        <i className="bi bi-grid-3x2-gap me-2 text-primario" aria-hidden="true" />
        Tokenización
      </h2>
      <p className="mt-1 text-sm text-texto-suave">Cada carácter se convierte en un token con un tipo.</p>

      <ol key={enAnimacion ? repeticion : 'vivo'} className="mt-4 flex min-h-16 flex-wrap gap-1.5" aria-label="Tokens">
        {tokens.length === 0 && <li className="text-sm text-texto-suave italic">Sin tokens todavía.</li>}
        {tokens.map((t, i) => (
          <li
            key={i}
            className={enAnimacion ? 'token-entra' : ''}
            style={enAnimacion ? { animationDelay: `${i * 90}ms` } : undefined}
            title={ETIQUETA_TIPO[t.tipo]}
          >
            <span
              className={`font-codigo grid h-10 w-9 place-items-center rounded-lg text-lg font-semibold ${ESTILO_TIPO[t.tipo]}`}
            >
              {t.c}
            </span>
            <span className="mt-1 block text-center font-codigo text-[10px] text-texto-suave">{i}</span>
          </li>
        ))}
      </ol>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-suave">
        {Object.entries(ETIQUETA_TIPO).map(([tipo, etiqueta]) => (
          <li key={tipo} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded ${ESTILO_TIPO[tipo]}`} />
            {etiqueta}
          </li>
        ))}
      </ul>

      {mostrarCodificacion && (
        <div className="capa-hundida aparece mt-4 rounded-xl p-3">
          <p className="mb-2 text-xs font-medium tracking-wide text-texto-suave uppercase">
            Tokens → entradas de la red
          </p>
          <dl className="font-codigo grid gap-1 text-sm">
            <div className="flex justify-between gap-2">
              <dt>A = {formato(consulta.a)}</dt>
              <dd className="text-primario">
                ÷ {ESCALA_ENTRADA} {'=>'} {formato(x[0], 4)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>B = {formato(consulta.b)}</dt>
              <dd className="text-primario">
                ÷ {ESCALA_ENTRADA} {'=>'} {formato(x[1], 4)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Op = {consulta.op}</dt>
              <dd className="text-primario">{'=>'} {x[2] > 0 ? '+1' : '-1'}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
