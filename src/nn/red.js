// Red neuronal multicapa escrita desde cero (sin librerías).
// Arquitectura: 3 entradas → 4 ocultas (tanh) → 4 ocultas (tanh) → 1 salida (lineal).

export const ARQUITECTURA = [3, 4, 4, 1]
export const NOMBRES_ENTRADA = ['A', 'B', 'Op']
export const ESCALA_ENTRADA = 100 // A y B en [-99.99, 99.99] → [-1, 1]
export const ESCALA_SALIDA = 200 // A ± B en [-199.98, 199.98] → [-1, 1]

export const activaciones = {
  tanh: (x) => Math.tanh(x),
  lineal: (x) => x,
}

export function activacionDeCapa(indiceCapa, totalCapas) {
  return indiceCapa === totalCapas - 1 ? 'lineal' : 'tanh'
}

// Normaliza la operación a los valores que recibe la red.
export function codificarEntrada(a, op, b) {
  return [a / ESCALA_ENTRADA, b / ESCALA_ENTRADA, op === '+' ? 1 : -1]
}

export function decodificarSalida(y) {
  return y * ESCALA_SALIDA
}

// Inicialización Xavier/Glorot para entrenar desde cero.
export function crearRedAleatoria(arquitectura = ARQUITECTURA, aleatorio = Math.random) {
  const capas = []
  for (let l = 1; l < arquitectura.length; l++) {
    const nEntradas = arquitectura[l - 1]
    const limite = Math.sqrt(6 / (nEntradas + arquitectura[l]))
    const neuronas = []
    for (let j = 0; j < arquitectura[l]; j++) {
      neuronas.push({
        pesos: Array.from({ length: nEntradas }, () => (aleatorio() * 2 - 1) * limite),
        bias: 0,
      })
    }
    capas.push(neuronas)
  }
  return { arquitectura: [...arquitectura], capas }
}

export function clonarRed(red) {
  return {
    arquitectura: [...red.arquitectura],
    capas: red.capas.map((capa) => capa.map((n) => ({ pesos: [...n.pesos], bias: n.bias }))),
  }
}

// Propagación hacia adelante. Devuelve el detalle de cada capa para poder animarla:
// z = suma ponderada + bias, a = activación(z).
export function propagar(red, entrada) {
  const detalle = [{ z: [...entrada], a: [...entrada] }]
  let actual = entrada
  red.capas.forEach((capa, l) => {
    const f = activaciones[activacionDeCapa(l, red.capas.length)]
    const z = capa.map((n) => n.pesos.reduce((s, w, i) => s + w * actual[i], n.bias))
    const a = z.map(f)
    detalle.push({ z, a })
    actual = a
  })
  return { salida: actual, detalle }
}

// Un paso de descenso por gradiente con Adam sobre un lote. Usado solo por el script de entrenamiento.
export function crearEntrenador(red, { tasa = 0.01, beta1 = 0.9, beta2 = 0.999, eps = 1e-8 } = {}) {
  const ceros = () => red.capas.map((capa) => capa.map((n) => ({ pesos: n.pesos.map(() => 0), bias: 0 })))
  const m = ceros()
  const v = ceros()
  let t = 0

  return function paso(lote) {
    const grad = ceros()
    let perdida = 0

    for (const { x, y } of lote) {
      const { salida, detalle } = propagar(red, x)
      const error = salida[0] - y
      perdida += error * error

      // delta de la capa de salida (lineal, MSE)
      let delta = [2 * error]
      for (let l = red.capas.length - 1; l >= 0; l--) {
        const entradaCapa = detalle[l].a
        red.capas[l].forEach((n, j) => {
          n.pesos.forEach((_, i) => (grad[l][j].pesos[i] += delta[j] * entradaCapa[i]))
          grad[l][j].bias += delta[j]
        })
        if (l > 0) {
          // derivada de tanh: 1 - a²
          delta = entradaCapa.map((a, i) => {
            const suma = red.capas[l].reduce((s, n, j) => s + n.pesos[i] * delta[j], 0)
            return suma * (1 - a * a)
          })
        }
      }
    }

    t++
    const k = 1 / lote.length
    const ajustar = (g, mObj, vObj, clave, idx, destino) => {
      const gi = (idx === null ? g[clave] : g[clave][idx]) * k
      const mi = beta1 * (idx === null ? mObj[clave] : mObj[clave][idx]) + (1 - beta1) * gi
      const vi = beta2 * (idx === null ? vObj[clave] : vObj[clave][idx]) + (1 - beta2) * gi * gi
      if (idx === null) {
        mObj[clave] = mi
        vObj[clave] = vi
      } else {
        mObj[clave][idx] = mi
        vObj[clave][idx] = vi
      }
      const mHat = mi / (1 - beta1 ** t)
      const vHat = vi / (1 - beta2 ** t)
      const cambio = (tasa * mHat) / (Math.sqrt(vHat) + eps)
      if (idx === null) destino[clave] -= cambio
      else destino[clave][idx] -= cambio
    }

    red.capas.forEach((capa, l) =>
      capa.forEach((n, j) => {
        n.pesos.forEach((_, i) => ajustar(grad[l][j], m[l][j], v[l][j], 'pesos', i, n))
        ajustar(grad[l][j], m[l][j], v[l][j], 'bias', null, n)
      }),
    )

    return perdida / lote.length
  }
}
