// Captura el aviso de instalación de la PWA (Android / Chrome / Edge).
type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
let aviso: EventoInstalar | undefined
const oyentes = new Set<() => void>()
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); aviso = e as EventoInstalar; oyentes.forEach((f) => f()) })
addEventListener('appinstalled', () => { aviso = undefined; oyentes.forEach((f) => f()) })

export const puedeInstalar = () => !!aviso
export const yaInstalada = () => matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
export const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
export function alCambiar(f: () => void) { oyentes.add(f); return () => { oyentes.delete(f) } }
export async function instalar() {
  if (!aviso) return false
  await aviso.prompt()
  const r = await aviso.userChoice
  aviso = undefined
  return r.outcome === 'accepted'
}
