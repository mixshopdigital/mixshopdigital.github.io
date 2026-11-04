import { getAjuste, registrarActividad, setAjuste } from './db'

/*
 * Protección local con PIN.
 * El PIN nunca se guarda: se guarda un hash PBKDF2 (SHA-256, 150 000 iteraciones) con sal aleatoria.
 * Sirve para el bloqueo de la app y para la sección privada de salud femenina de cada integrante.
 */

const enc = new TextEncoder()
const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b))))
const deB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

async function derivar(pin: string, sal: Uint8Array) {
  const clave = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal as BufferSource, iterations: 150000 }, clave, 256)
  return b64(bits)
}

export interface PinGuardado { sal: string; hash: string }

export async function crearPin(pin: string): Promise<PinGuardado> {
  const sal = crypto.getRandomValues(new Uint8Array(16))
  return { sal: b64(sal), hash: await derivar(pin, sal) }
}

export async function verificarPin(pin: string, g?: PinGuardado) {
  if (!g) return false
  return (await derivar(pin, deB64(g.sal))) === g.hash
}

export async function pinApp() { return getAjuste<PinGuardado | undefined>('pinApp', undefined) }
export async function guardarPinApp(pin?: string) {
  await setAjuste('pinApp', pin ? await crearPin(pin) : undefined)
  await registrarActividad(pin ? 'PIN de la app configurado' : 'PIN de la app quitado')
}

export async function pinPrivado(integranteId: number) { return getAjuste<PinGuardado | undefined>(`pinPrivado-${integranteId}`, undefined) }
export async function guardarPinPrivado(integranteId: number, pin: string) {
  await setAjuste(`pinPrivado-${integranteId}`, await crearPin(pin))
  await registrarActividad('PIN privado configurado', `Integrante #${integranteId}`)
}
