// Tokenización por carácter de expresiones "A op B", p. ej. "12+21" o "-3.5 - 7.25".
// Cada carácter se convierte en un token con su tipo; luego un pequeño autómata
// decide si un "-" es signo del número o el operador de resta.

export const LIMITE = 99.99

const TIPOS = {
  digito: 'Dígito',
  punto: 'Punto decimal',
  signo: 'Signo negativo',
  operador: 'Operador',
}

export const ETIQUETA_TIPO = TIPOS

export function tokenizar(texto) {
  const caracteres = [...texto.replace(/−/g, '-')].filter((c) => c.trim() !== '')
  const tokens = []
  const numeros = ['', '']
  let op = null
  let actual = 0 // 0 = leyendo A, 1 = leyendo B

  for (let i = 0; i < caracteres.length; i++) {
    const c = caracteres[i]
    const num = numeros[actual]

    if (/\d/.test(c)) {
      tokens.push({ c, tipo: 'digito', parte: actual })
      numeros[actual] += c
    } else if (c === '.') {
      if (num.includes('.')) return error(tokens, `Hay dos puntos decimales en el número ${actual === 0 ? 'A' : 'B'}.`)
      tokens.push({ c, tipo: 'punto', parte: actual })
      numeros[actual] += c
    } else if (c === '-' && (num === '' || num === '-')) {
      if (num === '-') return error(tokens, 'Hay dos signos negativos seguidos.')
      tokens.push({ c, tipo: 'signo', parte: actual })
      numeros[actual] += c
    } else if ((c === '+' || c === '-') && actual === 0) {
      if (!/\d/.test(num)) return error(tokens, 'Falta el primer número antes del operador.')
      tokens.push({ c, tipo: 'operador', parte: 'op' })
      op = c
      actual = 1
    } else if (c === '+' || c === '-') {
      return error(tokens, 'Solo se admite una operación entre dos números.')
    } else if ('xX*×/÷'.includes(c)) {
      return error(tokens, `La red solo sabe sumar (+) y restar (−); "${c}" no está soportado.`)
    } else {
      return error(tokens, `El carácter "${c}" no es válido.`)
    }
  }

  if (!op) return error(tokens, tokens.length ? 'Falta el operador (+ o −).' : 'Escribe una operación, por ejemplo 12+21.')
  if (!/\d/.test(numeros[1])) return error(tokens, 'Falta el segundo número.')

  for (const [i, n] of numeros.entries()) {
    const nombre = i === 0 ? 'A' : 'B'
    const [entero, decimales = ''] = n.replace('-', '').split('.')
    if (n.endsWith('.')) return error(tokens, `El número ${nombre} termina en punto.`)
    if (entero.length > 2) return error(tokens, `El número ${nombre} debe estar entre −${LIMITE} y ${LIMITE}.`)
    if (decimales.length > 2) return error(tokens, `El número ${nombre} admite como máximo 2 decimales.`)
  }

  return { tokens, a: parseFloat(numeros[0]), op, b: parseFloat(numeros[1]), error: null }
}

function error(tokens, mensaje) {
  return { tokens, a: null, op: null, b: null, error: mensaje }
}

// Suma/resta exacta a 2 decimales (evita 0.1 + 0.2 = 0.30000000000000004).
export function resultadoExacto(a, op, b) {
  const ac = Math.round(a * 100)
  const bc = Math.round(b * 100)
  return (op === '+' ? ac + bc : ac - bc) / 100
}
