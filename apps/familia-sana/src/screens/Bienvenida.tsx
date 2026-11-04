import { useState } from 'react'
import { ahora, db, registrarActividad, setAjuste } from '../lib/db'
import { cargarDemo } from '../lib/demo'
import { guardarPinApp } from '../lib/seguridad'
import { Boton, Campo, Chips, Entrada, Firma, Ilustracion, Logo, useToast } from '../ui/kit'
import { Icono } from '../ui/iconos'

export default function Bienvenida() {
  const [paso, setPaso] = useState(0)
  const [acepta, setAcepta] = useState(false)
  const [nombre, setNombre] = useState('')
  const [sexo, setSexo] = useState<'F' | 'M' | 'X'>()
  const [nac, setNac] = useState('')
  const [pin, setPin] = useState('')
  const [cargando, setCargando] = useState(false)
  const toast = useToast()

  const terminar = async (demo: boolean) => {
    if (pin && !/^\d{4,8}$/.test(pin)) return toast('El PIN tiene que tener entre 4 y 8 números.', 'error')
    if (!demo && !nombre.trim()) return toast('Escribí tu nombre para empezar.', 'error')
    setCargando(true)
    try {
      if (demo) await cargarDemo()
      else {
        await db.integrantes.add({ tipo: 'persona', nombre: nombre.trim(), relacion: 'Yo (administrador/a)', sexo, fechaNacimiento: nac || undefined, avatar: sexo === 'F' ? '👩' : sexo === 'M' ? '👨' : '🙂', color: '#6E9E84', creado: ahora() })
      }
      await setAjuste('usuario', demo ? 'Laura' : nombre.trim())
      await setAjuste('consentimiento', ahora())
      if (pin) await guardarPinApp(pin)
      await registrarActividad('Inicio de uso', demo ? 'Con demostración' : 'Familia propia')
      await setAjuste('bienvenida', true)
      location.hash = '#/inicio'
    } catch (e) {
      toast('No se pudo guardar. Revisá que tu navegador permita guardar datos.', 'error')
      console.error(e)
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-salvia-100 via-crema-100 to-crema-100">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-8 pt-[max(32px,env(safe-area-inset-top))]">
        <div className="mb-6 flex justify-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => <span key={i} className={`h-2 rounded-full transition-all ${i === paso ? 'w-8 bg-turquesa-500' : 'w-2 bg-salvia-200'}`} />)}
        </div>

        {paso === 0 && (
          <div className="entrar flex flex-1 flex-col items-center text-center">
            <Logo t="lg" />
            <h1 className="mt-6 font-display text-4xl text-salvia-700">Familia Sana</h1>
            <p className="mt-2 text-lg text-piedra-600">Tu familia, su salud, todo en un solo lugar</p>
            <Ilustracion n="familia" c="mt-8 w-48 h-48" />
            <ul className="mt-6 space-y-2 text-left text-piedra-700">
              {['Vacunas, remedios y turnos de toda la familia', 'Análisis y recetas siempre a mano', 'Recordatorios para no olvidarte de nada', 'Tus datos se guardan en tu celular'].map((t) => (
                <li key={t} className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-salvia-200 text-salvia-800"><Icono n="check" c="w-4 h-4" /></span>{t}</li>
              ))}
            </ul>
            <div className="mt-auto w-full pt-8"><Boton className="w-full" onClick={() => setPaso(1)}>Empezar</Boton></div>
          </div>
        )}

        {paso === 1 && (
          <div className="entrar flex flex-1 flex-col">
            <h2 className="font-display text-3xl text-piedra-800">Tu privacidad primero</h2>
            <p className="mt-2 text-piedra-600">Antes de empezar, leé esto con calma:</p>
            <div className="mt-4 space-y-3">
              {[
                ['candado', 'Tus datos de salud se guardan solo en este celular o computadora. No se envían a ningún servidor.'],
                ['corazon', 'Familia Sana organiza información. No da diagnósticos, no receta y no reemplaza a tu médico.'],
                ['vacuna', 'Los calendarios de vacunas y controles se basan en fuentes oficiales del Paraguay y se marcan cuando falta verificarlos.'],
                ['bajar', 'Hacé copias de seguridad desde Configuración. Si borrás los datos del navegador, se pierden.'],
                ['flor', 'La sección de salud femenina se puede proteger con un PIN propio.'],
              ].map(([i, t]) => (
                <div key={t} className="flex gap-3 rounded-2xl bg-white p-3 shadow-suave"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-salvia-100 text-salvia-700"><Icono n={i} c="w-5 h-5" /></span><p className="text-sm text-piedra-700">{t}</p></div>
              ))}
            </div>
            <label className="mt-5 flex items-start gap-3 rounded-2xl bg-white p-4 shadow-suave">
              <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-1 h-6 w-6 accent-turquesa-500" />
              <span className="text-sm text-piedra-700">Leí y acepto los <a href="#/ajustes/terminos" className="font-bold text-turquesa-600 underline" onClick={(e) => e.preventDefault()}>términos de uso</a> y la política de privacidad, y doy mi consentimiento para guardar datos de salud de mi familia en este dispositivo.</span>
            </label>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
              <Boton variante="suave" onClick={() => setPaso(0)}>Volver</Boton>
              <Boton disabled={!acepta} onClick={() => setPaso(2)}>Continuar</Boton>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="entrar flex flex-1 flex-col">
            <h2 className="font-display text-3xl text-piedra-800">¿Cómo te llamás?</h2>
            <p className="mt-2 text-piedra-600">Vas a ser quien administra la familia en este dispositivo.</p>
            <div className="mt-5 space-y-4">
              <Campo etiqueta="Tu nombre"><Entrada value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Ana" autoComplete="given-name" /></Campo>
              <Campo etiqueta="Sexo (para calendarios de salud)"><Chips opciones={[{ v: 'F', t: 'Mujer' }, { v: 'M', t: 'Hombre' }, { v: 'X', t: 'Prefiero no decir' }]} valor={sexo} onChange={(v) => setSexo(v as 'F')} /></Campo>
              <Campo etiqueta="Fecha de nacimiento (opcional)"><Entrada type="date" value={nac} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setNac(e.target.value)} /></Campo>
              <Campo etiqueta="PIN para abrir la app (opcional)" ayuda="De 4 a 8 números. Protege los datos si alguien más usa el celular."><Entrada inputMode="numeric" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" maxLength={8} /></Campo>
            </div>
            <div className="mt-auto space-y-3 pt-6">
              <Boton className="w-full" disabled={cargando} onClick={() => terminar(false)}>{cargando ? 'Guardando…' : 'Empezar con mi familia'}</Boton>
              <Boton variante="borde" className="w-full" disabled={cargando} onClick={() => terminar(true)}>Probar con una familia de ejemplo</Boton>
              <p className="text-center text-xs text-piedra-500">La familia de ejemplo usa datos ficticios. La podés borrar cuando quieras desde Configuración.</p>
              <button className="w-full text-sm font-bold text-piedra-500" onClick={() => setPaso(1)}>Volver</button>
            </div>
          </div>
        )}
        <Firma className="mt-6" />
      </div>
    </div>
  )
}
