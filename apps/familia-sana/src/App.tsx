import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getAjuste } from './lib/db'
import { asegurarCatalogos } from './lib/demo'
import { calcularAvisos, iniciarVigilante } from './lib/avisos'
import { pinApp } from './lib/seguridad'
import { Firma, Hoja, ir, Logo, numeroNavegacion, useRuta } from './ui/kit'
import { Icono } from './ui/iconos'
import { SECCIONES } from './ui/secciones'
import Bienvenida from './screens/Bienvenida'
import Bloqueo from './screens/Bloqueo'
import Inicio from './screens/Inicio'
import { ListaFamilia, Perfil } from './screens/Familia'
import Historia from './screens/Historia'
import Documentos from './screens/Documentos'
import Medicamentos from './screens/Medicamentos'
import Agenda from './screens/Agenda'
import Prevencion from './screens/Prevencion'
import Femenina from './screens/Femenina'
import Vacunas from './screens/Vacunas'
import Informes from './screens/Informes'
import Ajustes from './screens/Ajustes'
import Avisos from './screens/Avisos'
import Consulta from './screens/Consulta'

const PRINCIPALES = [
  { r: 'inicio', t: 'Inicio', i: 'inicio' },
  { r: 'familia', t: 'Familia', i: 'familia' },
  { r: 'medicamentos', t: 'Remedios', i: 'pastilla' },
  { r: 'agenda', t: 'Agenda', i: 'agenda' },
]

export default function App() {
  const ruta = useRuta()
  const [listo, setListo] = useState(false)
  const [bloqueada, setBloqueada] = useState(false)
  const [menu, setMenu] = useState(false)
  const bienvenida = useLiveQuery(() => getAjuste('bienvenida', false), [], undefined)
  const mayor = useLiveQuery(() => getAjuste('modoMayor', false), [], false)
  const cantAvisos = useLiveQuery(async () => (await calcularAvisos()).filter((a) => a.urgencia !== 'baja').length, [ruta.join('/')], 0)

  useEffect(() => {
    ;(async () => {
      await asegurarCatalogos()
      if (await pinApp()) setBloqueada(true)
      setListo(true)
    })()
    const t = iniciarVigilante()
    // pedimos almacenamiento persistente para que el navegador no borre los datos
    navigator.storage?.persist?.()
    return () => clearInterval(t)
  }, [])

  useEffect(() => { document.documentElement.classList.toggle('mayor', !!mayor) }, [mayor])

  // Bloqueo automático al volver después de 5 minutos en segundo plano
  useEffect(() => {
    let oculta = 0
    const f = async () => {
      if (document.hidden) oculta = Date.now()
      else if (oculta && Date.now() - oculta > 5 * 60000 && (await pinApp())) setBloqueada(true)
    }
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [])

  if (!listo || bienvenida === undefined) return <PantallaCarga />
  if (!bienvenida) return <Bienvenida />
  if (bloqueada) return <Bloqueo onAbrir={() => setBloqueada(false)} />

  const [s, a, b] = ruta
  const n = a ? Number(a) : undefined
  let pantalla
  switch (s) {
    case 'familia': pantalla = <ListaFamilia tipo="persona" />; break
    case 'mascotas': pantalla = <ListaFamilia tipo="mascota" />; break
    case 'integrante': pantalla = <Perfil id={Number(a)} pestana={b} />; break
    case 'historia': pantalla = <Historia id={n} />; break
    case 'documentos': pantalla = <Documentos id={n} />; break
    case 'medicamentos': pantalla = <Medicamentos medId={n} />; break
    case 'agenda': pantalla = <Agenda eventoId={n} />; break
    case 'prevencion': pantalla = <Prevencion id={n} />; break
    case 'femenina': pantalla = <Femenina id={n} />; break
    case 'vacunas': pantalla = <Vacunas id={n} />; break
    case 'informes': pantalla = <Informes id={n} />; break
    case 'ajustes': pantalla = <Ajustes seccion={a} />; break
    case 'avisos': pantalla = <Avisos />; break
    case 'consulta': pantalla = <Consulta id={n} />; break
    default: pantalla = <Inicio cantAvisos={cantAvisos ?? 0} />
  }
  const activa = s === 'integrante' ? 'familia' : s || 'inicio'

  return (
    <div className="min-h-screen lg:pl-72">
      <aside className="no-imprimir fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-crema-200 bg-crema-50 lg:flex">
        <div className="flex items-center gap-3 px-6 py-6"><Logo t="md" /><div><p className="font-display text-xl leading-none text-salvia-700">Familia Sana</p><p className="mt-1 text-xs text-piedra-500">by Mix Shop Digital</p></div></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {SECCIONES.map((x) => (
            <a key={x.r} href={`#/${x.r}`} className={`flex items-center gap-3 rounded-2xl px-3 py-2 font-bold transition ${activa === x.r ? 'bg-salvia-100 text-salvia-800' : 'text-piedra-600 hover:bg-crema-200'}`}>
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${x.c}`}><Icono n={x.i} c="w-5 h-5" /></span>{x.t}
              {x.r === 'avisos' && !!cantAvisos && <span className="ml-auto rounded-full bg-coral-500 px-2 text-xs text-white">{cantAvisos}</span>}
            </a>
          ))}
        </nav>
        <Firma className="px-4 py-4" />
      </aside>

      <div key={numeroNavegacion()}>{pantalla}</div>

      <nav className="no-imprimir fixed inset-x-0 bottom-0 z-50 border-t border-crema-200 bg-crema-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navegación principal">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {PRINCIPALES.map((x) => (
            <a key={x.r} href={`#/${x.r}`} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${activa === x.r ? 'text-turquesa-600' : 'text-piedra-500'}`} aria-current={activa === x.r ? 'page' : undefined}>
              <span className={`grid h-8 w-12 place-items-center rounded-full transition ${activa === x.r ? 'bg-turquesa-100' : ''}`}><Icono n={x.i} c="w-6 h-6" /></span>{x.t}
            </a>
          ))}
          <button onClick={() => setMenu(true)} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${!PRINCIPALES.some((x) => x.r === activa) ? 'text-turquesa-600' : 'text-piedra-500'}`}>
            <span className="grid h-8 w-12 place-items-center rounded-full"><Icono n="menu" c="w-6 h-6" /></span>Más
          </button>
        </div>
      </nav>

      <Hoja abierta={menu} titulo="Todas las secciones" onCerrar={() => setMenu(false)}>
        <div className="grid grid-cols-3 gap-3">
          {SECCIONES.map((x) => (
            <button key={x.r} onClick={() => { setMenu(false); ir(x.r) }} className="flex flex-col items-center gap-2 rounded-3xl bg-white p-3 text-center text-xs font-bold text-piedra-700 shadow-suave">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${x.c}`}><Icono n={x.i} /></span>{x.t}
            </button>
          ))}
        </div>
        <Firma className="pt-2" />
      </Hoja>
    </div>
  )
}

function PantallaCarga() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-crema-100">
      <div className="animate-pulse"><Logo t="lg" /></div>
      <p className="mt-4 font-display text-xl text-salvia-700">Familia Sana</p>
    </div>
  )
}
