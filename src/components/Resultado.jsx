const redondear2 = (n) => Math.round(n * 100) / 100

function Dato({ etiqueta, valor, destacado = false, icono }) {
  return (
    <div className={`rounded-xl p-3 ${destacado ? 'bg-primario text-white' : 'capa-hundida'}`}>
      <p className={`text-xs ${destacado ? 'text-white/80' : 'text-texto-suave'}`}>
        <i className={`bi ${icono} me-1`} aria-hidden="true" />
        {etiqueta}
      </p>
      <p className="font-codigo mt-1 truncate text-lg font-semibold tabular-nums">{valor}</p>
    </div>
  )
}

export default function Resultado({ visible, consulta, salida, exacto, pesosModificados }) {
  return (
    <div className="capa rounded-2xl p-5" aria-live="polite">
      <h2 className="font-titulo text-base font-bold">
        <i className="bi bi-bullseye me-2 text-primario" aria-hidden="true" />
        Resultado
      </h2>

      {!visible || !consulta ? (
        <p className="mt-2 text-sm text-texto-suave">
          Pulsa <span className="font-medium">Calcular</span> para ver la señal recorrer la red.
        </p>
      ) : (
        <div className="aparece">
          <p className="font-codigo mt-3 text-2xl font-semibold">
            {consulta.a} {consulta.op} {consulta.b < 0 ? `(${consulta.b})` : consulta.b}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Dato etiqueta="Salida de la red" valor={salida.toFixed(6)} icono="bi-cpu" />
            <Dato etiqueta="Redondeado" valor={redondear2(salida).toFixed(2)} icono="bi-magic" destacado />
            <Dato etiqueta="Resultado exacto" valor={exacto.toFixed(2)} icono="bi-check2-circle" />
            <Dato etiqueta="Error absoluto" valor={Math.abs(salida - exacto).toFixed(4)} icono="bi-rulers" />
          </div>

          {redondear2(salida) === exacto ? (
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-acento px-3 py-2 text-sm font-medium text-acento-texto">
              <i className="bi bi-stars" aria-hidden="true" />
              La red acertó al redondear a 2 decimales.
            </p>
          ) : (
            <p className="mt-3 flex items-start gap-2 text-sm text-texto-suave">
              <i className="bi bi-info-circle mt-0.5 text-primario" aria-hidden="true" />
              Una red neuronal aproxima el resultado; no lo calcula de forma exacta.
            </p>
          )}

          {pesosModificados && (
            <p className="mt-2 flex items-start gap-2 text-sm text-texto-suave">
              <i className="bi bi-sliders mt-0.5 text-primario" aria-hidden="true" />
              Estás usando pesos modificados. El resultado se actualiza en vivo.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
