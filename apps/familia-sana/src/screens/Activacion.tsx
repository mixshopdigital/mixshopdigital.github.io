import { useState } from 'react'
import { guardarActivacion, validarCodigo } from '../lib/activacion'
import { Boton, Campo, Firma, Logo } from '../ui/kit'
import { Icono } from '../ui/iconos'

export default function Activacion({ onActivar }: { onActivar: () => void }) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [probando, setProbando] = useState(false)

  const activar = async (e: React.FormEvent) => {
    e.preventDefault()
    setProbando(true)
    const ok = await validarCodigo(codigo)
    setProbando(false)
    if (!ok) return setError('Ese código no es válido. Revisá que esté completo, con las letras y números tal como te llegaron.')
    guardarActivacion({ codigo: ok, fecha: new Date().toISOString() })
    onActivar()
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-salvia-100 via-crema-100 to-crema-100">
      <form onSubmit={activar} className="entrar mx-auto flex w-full max-w-md flex-1 flex-col items-center px-6 pb-8 pt-[max(40px,env(safe-area-inset-top))] text-center">
        <Logo t="lg" />
        <h1 className="mt-6 font-display text-3xl text-salvia-700">Activá tu Familia Sana</h1>
        <p className="mt-2 text-piedra-600">Escribí el código que recibiste con tu compra. Se pone una sola vez y no vence.</p>
        <div className="mt-8 w-full text-left">
          <Campo etiqueta="Código de activación" error={error}>
            <input
              id="codigo-activacion"
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setError('') }}
              placeholder="FS-XXXX-XXXX-XXXX"
              autoComplete="off" autoCapitalize="characters" spellCheck={false}
              className="w-full rounded-2xl border-2 border-crema-300 bg-white px-4 py-3 text-center font-mono text-xl tracking-widest text-piedra-800 outline-none focus:border-turquesa-500"
            />
          </Campo>
        </div>
        <Boton type="submit" className="mt-4 w-full" disabled={probando || codigo.replace(/[^A-Za-z0-9]/g, '').length < 12}>Activar</Boton>
        <div className="mt-8 rounded-2xl bg-white/70 p-4 text-sm text-piedra-700">
          <p>¿Todavía no tenés tu código? Consultanos por WhatsApp.</p>
          <a href="https://wa.me/595994638426" target="_blank" rel="noopener" className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#25D366] px-4 font-bold text-white"><Icono n="whatsapp" c="w-5 h-5" />0994 638 426</a>
        </div>
        <Firma className="mt-auto pt-8" />
      </form>
    </div>
  )
}
