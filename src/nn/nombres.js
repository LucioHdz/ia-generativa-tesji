import { NOMBRES_ENTRADA } from './red.js'

const SUPER = ['⁰', '¹', '²', '³', '⁴', '⁵']
const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

// l = índice de capa contando la de entrada (0 = entrada).
export function nombreNeurona(l, j, totalCapas) {
  if (l === 0) return NOMBRES_ENTRADA[j]
  if (l === totalCapas - 1) return 'ŷ'
  return `h${SUPER[l]}${SUB[j + 1]}`
}

export function descripcionCapa(l, totalCapas) {
  if (l === 0) return 'Capa de entrada'
  if (l === totalCapas - 1) return 'Capa de salida'
  return `Capa oculta ${l}`
}
