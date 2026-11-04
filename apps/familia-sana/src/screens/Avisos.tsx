import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { calcularAvisos, pedirPermisoNotificaciones, soportaNotificaciones } from '../lib/avisos'
import { getAjuste, setAjuste } from '../lib/db'
import { cuando, hoyISO } from '../lib/salud'
import { Boton, Cabecera, Contenido, Tarjeta, useToast, Vacio } from '../ui/kit'
import { Icono } from '../ui/iconos'
import { ICONO_AVISO } from './Inicio'

export default function Avisos() {
  const [rev, setRev] = useState(0)
  const avisos = useLiveQuery(() => calcularAvisos(), [rev], [])
  const activas = useLiveQuery(() => getAjuste('notificaciones', false), [], false)
  const [permiso, setPermiso] = useState(soportaNotificaciones() ? Notification.permission : 'no-soportado')
  const toast = useToast()
  useEffect(() => { const t = setInterval(() => setRev((x) => x + 1), 60000); return () => clearInterval(t) }, [])
  const activar = async () => {
    const r = await pedirPermisoNotificaciones()
    setPermiso(r)
    if (r === 'granted') { await setAjuste('notificaciones', true); toast('Notificaciones activadas') }
    else toast(r === 'no-soportado' ? 'Este navegador no permite notificaciones.' : 'No diste permiso. Podés cambiarlo en los ajustes del navegador.', 'error')
  }
  const descartar = async (id: string) => {
    const k = `descartados-${hoyISO()}`
    await setAjuste(k, [...(await getAjuste<string[]>(k, [])), id]); setRev((x) => x + 1)
  }
  const grupos: [string, typeof avisos][] = [['Ahora', avisos.filter((a) => a.urgencia === 'alta')], ['Próximamente', avisos.filter((a) => a.urgencia === 'media')], ['Para tener en cuenta', avisos.filter((a) => a.urgencia === 'baja')]]
  return (
    <>
      <Cabecera titulo="Recordatorios" subtitulo="Todo lo pendiente de la familia" color="coral" />
      <Contenido>
        {!(activas && permiso === 'granted') && (
          <Tarjeta className="mt-2 !bg-coral-50 border-coral-100">
            <div className="flex items-start gap-3"><Icono n="campana" c="w-6 h-6 text-coral-600 shrink-0" /><div className="flex-1"><p className="font-bold">Activá las notificaciones</p><p className="text-sm text-piedra-600">Te avisamos la hora de cada remedio y tus citas mientras la app esté abierta o en segundo plano.</p></div></div>
            <Boton className="mt-3 w-full" onClick={activar} disabled={permiso === 'no-soportado'}>{permiso === 'no-soportado' ? 'No disponible en este navegador' : 'Activar notificaciones'}</Boton>
            <p className="mt-2 text-xs text-piedra-500">Aviso honesto: algunos celulares (sobre todo iPhone sin instalar la app, o Android con ahorro de batería) pueden no mostrar avisos si la app está cerrada. Revisá esta pantalla cada día.</p>
          </Tarjeta>
        )}
        {avisos.length === 0 ? <div className="mt-4"><Vacio ilus="corazon" titulo="¡Todo al día!" texto="No hay recordatorios pendientes por ahora." /></div> : grupos.filter(([, l]) => l.length).map(([t, l]) => (
          <section key={t} className="mt-5">
            <h2 className="mb-2 font-bold text-piedra-700">{t}</h2>
            <div className="space-y-2">{l.map((a) => {
              const [ic, cl] = ICONO_AVISO[a.tipo]
              return (
                <Tarjeta key={a.id} className="flex items-center gap-3 !p-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cl}`}><Icono n={ic} c="w-5 h-5" /></span>
                  <button className="min-w-0 flex-1 text-left" onClick={() => (location.hash = a.ruta)}><p className="truncate font-bold">{a.titulo}</p><p className="truncate text-xs text-piedra-500">{a.detalle} · {cuando(a.fecha)}{a.hora ? ` ${a.hora}` : ''}</p></button>
                  <button aria-label="Ocultar por hoy" onClick={() => descartar(a.id)} className="grid h-9 w-9 place-items-center rounded-full text-piedra-400 hover:bg-crema-200"><Icono n="x" c="w-4 h-4" /></button>
                </Tarjeta>
              )
            })}</div>
          </section>
        ))}
        <p className="mt-6 text-xs text-piedra-500">La anticipación general de los avisos se cambia en Configuración. Cada cita también puede tener su propia anticipación.</p>
      </Contenido>
    </>
  )
}
