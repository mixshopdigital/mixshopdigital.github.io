import { useState } from 'react'
import { registrarActividad } from '../lib/db'
import { pinApp, verificarPin } from '../lib/seguridad'
import { Firma, Logo } from '../ui/kit'
import { Icono } from '../ui/iconos'

/** Teclado numérico para ingresar un PIN. Se usa en el bloqueo de la app y en la sección privada. */
export function TecladoPin({ titulo, subtitulo, onListo, error }: { titulo: string; subtitulo?: string; onListo: (pin: string) => void; error?: string }) {
  const [pin, setPin] = useState('')
  const tocar = (d: string) => {
    const n = (pin + d).slice(0, 8)
    setPin(n)
  }
  return (
    <div className="flex flex-col items-center">
      <h2 className="font-display text-2xl text-piedra-800">{titulo}</h2>
      {subtitulo && <p className="mt-1 text-center text-sm text-piedra-600">{subtitulo}</p>}
      <div className="my-5 flex h-4 gap-3" aria-label={`${pin.length} números ingresados`}>
        {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => <span key={i} className={`h-4 w-4 rounded-full ${i < pin.length ? 'bg-turquesa-500' : 'bg-salvia-200'}`} />)}
      </div>
      {error && <p className="mb-3 text-sm font-bold text-coral-600">{error}</p>}
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} onClick={() => tocar(d)} className="h-16 w-16 rounded-full bg-white text-2xl font-bold text-piedra-800 shadow-suave active:bg-salvia-100">{d}</button>)}
        <button onClick={() => setPin(pin.slice(0, -1))} aria-label="Borrar" className="grid h-16 w-16 place-items-center rounded-full text-piedra-600"><Icono n="atras" /></button>
        <button onClick={() => tocar('0')} className="h-16 w-16 rounded-full bg-white text-2xl font-bold text-piedra-800 shadow-suave active:bg-salvia-100">0</button>
        <button onClick={() => { onListo(pin); setPin('') }} aria-label="Entrar" disabled={pin.length < 4} className="grid h-16 w-16 place-items-center rounded-full bg-turquesa-500 text-white shadow-suave disabled:opacity-40"><Icono n="check" /></button>
      </div>
    </div>
  )
}

export default function Bloqueo({ onAbrir }: { onAbrir: () => void }) {
  const [error, setError] = useState<string>()
  const [intentos, setIntentos] = useState(0)
  const [espera, setEspera] = useState(0)
  const probar = async (pin: string) => {
    if (Date.now() < espera) return setError('Esperá unos segundos antes de volver a intentar.')
    if (await verificarPin(pin, await pinApp())) { await registrarActividad('Sesión abierta'); onAbrir() }
    else {
      const n = intentos + 1
      setIntentos(n)
      if (n % 5 === 0) setEspera(Date.now() + 30000)
      setError(n % 5 === 0 ? 'Demasiados intentos. Esperá 30 segundos.' : 'PIN incorrecto. Probá de nuevo.')
      await registrarActividad('PIN incorrecto')
    }
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-salvia-100 to-crema-100 px-6">
      <Logo t="lg" />
      <p className="mb-8 mt-3 font-display text-xl text-salvia-700">Familia Sana</p>
      <TecladoPin titulo="Ingresá tu PIN" onListo={probar} error={error} />
      <p className="mt-8 max-w-xs text-center text-xs text-piedra-500">¿Te olvidaste el PIN? Por seguridad no se puede recuperar sin perder los datos. Si tenés una copia de seguridad, podés reinstalar y restaurarla.</p>
      <Firma className="mt-6" />
    </div>
  )
}
