import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import pesosEntrenados from './nn/pesos.json'
import { clonarRed, codificarEntrada, decodificarSalida, propagar } from './nn/red.js'
import { resultadoExacto, tokenizar } from './nn/tokenizar.js'
import Encabezado from './components/Encabezado.jsx'
import EntradaOperacion from './components/EntradaOperacion.jsx'
import Tokenizacion from './components/Tokenizacion.jsx'
import RedNeuronal from './components/RedNeuronal.jsx'
import PanelNeurona from './components/PanelNeurona.jsx'
import Resultado from './components/Resultado.jsx'

// Pasos de la animación: 0 tokens · 1 entradas · 2 oculta 1 · 3 oculta 2 · 4 salida · 5 resultado
export const PASO_FINAL = 5
const DURACION_PASO = 900
const DURACION_TOKEN = 90

export default function App() {
  const [red, setRed] = useState(() => clonarRed(pesosEntrenados))
  const [texto, setTexto] = useState('12+21')
  const [consulta, setConsulta] = useState(null)
  const [paso, setPaso] = useState(-1)
  const [repeticion, setRepeticion] = useState(0)
  const [seleccion, setSeleccion] = useState(null)
  const [ultimoCambio, setUltimoCambio] = useState(null)
  const temporizadores = useRef([])

  const analisis = useMemo(() => tokenizar(texto), [texto])
  const animando = paso >= 0 && paso < PASO_FINAL

  const propagacion = useMemo(
    () => (consulta ? propagar(red, codificarEntrada(consulta.a, consulta.op, consulta.b)) : null),
    [red, consulta],
  )

  const limpiarTemporizadores = () => {
    temporizadores.current.forEach(clearTimeout)
    temporizadores.current = []
  }
  useEffect(() => limpiarTemporizadores, [])

  const calcular = useCallback(() => {
    if (analisis.error) return
    limpiarTemporizadores()
    setConsulta(analisis)
    setUltimoCambio(null)
    setRepeticion((r) => r + 1)
    setPaso(0)
    let t = analisis.tokens.length * DURACION_TOKEN + 500
    for (let p = 1; p <= PASO_FINAL; p++) {
      temporizadores.current.push(setTimeout(() => setPaso(p), t))
      t += DURACION_PASO
    }
  }, [analisis])

  const cambiarParametro = (capa, indice, clave, i, valor) => {
    setRed((anterior) => {
      const nueva = clonarRed(anterior)
      if (clave === 'bias') nueva.capas[capa][indice].bias = valor
      else nueva.capas[capa][indice].pesos[i] = valor
      return nueva
    })
    setUltimoCambio({ capa, indice, marca: Date.now() })
  }

  const restaurarNeurona = (capa, indice) => {
    setRed((anterior) => {
      const nueva = clonarRed(anterior)
      const original = pesosEntrenados.capas[capa][indice]
      nueva.capas[capa][indice] = { pesos: [...original.pesos], bias: original.bias }
      return nueva
    })
    setUltimoCambio({ capa, indice, marca: Date.now() })
  }

  const restaurarTodo = () => {
    setRed(clonarRed(pesosEntrenados))
    setUltimoCambio(null)
  }

  const pesosModificados = useMemo(
    () => JSON.stringify(red.capas) !== JSON.stringify(pesosEntrenados.capas),
    [red],
  )

  const salida = propagacion ? decodificarSalida(propagacion.salida[0]) : null
  const exacto = consulta ? resultadoExacto(consulta.a, consulta.op, consulta.b) : null

  return (
    <div className="relative min-h-dvh">
      <div className="fondo-profundo" aria-hidden="true">
        <div className="orbe -top-40 -left-32 h-[28rem] w-[28rem] bg-primario" />
        <div className="orbe top-1/3 -right-40 h-[24rem] w-[24rem] bg-primario-suave" />
        <div className="orbe bottom-0 left-1/3 h-40 w-40 bg-acento opacity-20!" />
      </div>

      <Encabezado />

      <main className="mx-auto grid max-w-7xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-12 lg:gap-6">
        {/* En móvil la red va antes del resultado para que se vea la animación */}
        <section className="contents lg:col-span-4 lg:flex lg:min-w-0 lg:flex-col lg:gap-6">
          <div className="order-1 min-w-0 lg:order-none">
            <EntradaOperacion
              texto={texto}
              onCambiar={setTexto}
              onCalcular={calcular}
              error={analisis.error}
              animando={animando}
            />
          </div>
          <div className="order-2 min-w-0 lg:order-none">
            <Tokenizacion analisis={analisis} paso={paso} repeticion={repeticion} consulta={consulta} />
          </div>
          <div className="order-4 min-w-0 lg:order-none">
            <Resultado
              visible={paso >= PASO_FINAL}
              consulta={consulta}
              salida={salida}
              exacto={exacto}
              pesosModificados={pesosModificados}
            />
          </div>
        </section>

        <section className="order-3 flex min-w-0 flex-col gap-6 lg:order-none lg:col-span-8">
          <RedNeuronal
            red={red}
            propagacion={propagacion}
            paso={consulta ? paso : -1}
            repeticion={repeticion}
            seleccion={seleccion}
            onSeleccionar={setSeleccion}
            ultimoCambio={paso >= PASO_FINAL ? ultimoCambio : null}
            pesosModificados={pesosModificados}
            onRestaurarTodo={restaurarTodo}
          />
          {seleccion && (
            <PanelNeurona
              key={`${seleccion.capa}-${seleccion.indice}`}
              red={red}
              original={pesosEntrenados}
              seleccion={seleccion}
              propagacion={paso >= PASO_FINAL ? propagacion : null}
              onCambiar={cambiarParametro}
              onRestaurar={restaurarNeurona}
              onCerrar={() => setSeleccion(null)}
            />
          )}
        </section>
      </main>
    </div>
  )
}
