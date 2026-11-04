/**
 * Activación de pago único. Cada compra recibe un código FS-XXXX-XXXX-XXXX.
 * Se valida sin internet y no vence. Los últimos 4 caracteres son una firma de los 8 anteriores.
 */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const SAL: string = import.meta.env.VITE_ACTIVACION_SAL ?? 'solo-desarrollo'
const CLAVE = 'familia-sana-activacion'

export function normalizar(t: string) {
  let s = t.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (s.startsWith('FS')) s = s.slice(2)
  return s
}

export function formatear(cuerpo: string, firma: string) {
  return `FS-${cuerpo.slice(0, 4)}-${cuerpo.slice(4, 8)}-${firma}`
}

export async function firmar(cuerpo: string) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`familia-sana|${SAL}|${cuerpo}`)))
  // 20 bits -> 4 caracteres de 5 bits
  const n = (d[0] << 12) | (d[1] << 4) | (d[2] >> 4)
  return [15, 10, 5, 0].map((s) => ALFABETO[(n >> s) & 31]).join('')
}

/** Devuelve el código con formato si es válido, o null. */
export async function validarCodigo(t: string) {
  const s = normalizar(t)
  if (s.length !== 12 || [...s].some((c) => !ALFABETO.includes(c))) return null
  const cuerpo = s.slice(0, 8)
  return (await firmar(cuerpo)) === s.slice(8) ? formatear(cuerpo, s.slice(8)) : null
}

export type Activacion = { codigo: string; fecha: string }

export function leerActivacion(): Activacion | null {
  try { const v = localStorage.getItem(CLAVE); return v ? JSON.parse(v) : null } catch { return null }
}

export function guardarActivacion(a: Activacion) {
  try { localStorage.setItem(CLAVE, JSON.stringify(a)) } catch { /* nada */ }
}

export async function estaActivada() {
  const a = leerActivacion()
  return !!a && !!(await validarCodigo(a.codigo))
}
