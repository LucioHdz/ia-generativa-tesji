// Entrena la red offline y guarda los pesos en src/nn/pesos.json.
// Uso: npm run entrenar
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  codificarEntrada,
  crearEntrenador,
  crearRedAleatoria,
  decodificarSalida,
  propagar,
  ESCALA_SALIDA,
} from '../src/nn/red.js'

// Generador pseudoaleatorio con semilla para que el entrenamiento sea reproducible.
function mulberry32(semilla) {
  return () => {
    semilla |= 0
    semilla = (semilla + 0x6d2b79f5) | 0
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const aleatorio = mulberry32(2026)
const numero = () => Math.round((aleatorio() * 2 - 1) * 9999) / 100

function ejemplo() {
  const a = numero()
  const b = numero()
  const op = aleatorio() < 0.5 ? '+' : '-'
  const resultado = op === '+' ? a + b : a - b
  return { a, b, op, x: codificarEntrada(a, op, b), y: resultado / ESCALA_SALIDA }
}

const red = crearRedAleatoria(undefined, aleatorio)
const ITERACIONES = Number(process.argv[2] ?? 1500000)
const LOTE = 64

const fases = [
  { hasta: 0.5, tasa: 0.01 },
  { hasta: 0.8, tasa: 0.002 },
  { hasta: 0.93, tasa: 0.0003 },
  { hasta: 1, tasa: 0.00005 },
]

let inicio = 0
for (const fase of fases) {
  const paso = crearEntrenador(red, { tasa: fase.tasa })
  const fin = Math.round(ITERACIONES * fase.hasta)
  for (let it = inicio; it < fin; it++) {
    const perdida = paso(Array.from({ length: LOTE }, ejemplo))
    if (it % 5000 === 0) console.log(`iter ${it}  tasa ${fase.tasa}  pérdida ${perdida.toExponential(3)}`)
  }
  inicio = fin
}

// Evaluación con ejemplos nuevos.
let errorMax = 0
let errorSuma = 0
const N = 20000
for (let i = 0; i < N; i++) {
  const e = ejemplo()
  const pred = decodificarSalida(propagar(red, e.x).salida[0])
  const err = Math.abs(pred - e.y * ESCALA_SALIDA)
  errorMax = Math.max(errorMax, err)
  errorSuma += err
}
console.log(`Error absoluto medio: ${(errorSuma / N).toFixed(4)}  máximo: ${errorMax.toFixed(4)}`)

const destino = fileURLToPath(new URL('../src/nn/pesos.json', import.meta.url))
writeFileSync(destino, JSON.stringify(red, null, 2))
console.log(`Pesos guardados en ${destino}`)
