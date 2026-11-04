import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ahora, CATEGORIAS_EVENTO, db, registrarActividad, type Evento } from '../lib/db'
import { aISO, cuando, deISO, DIAS, fechaLarga, hoyISO, nombreMes, sumarDias } from '../lib/salud'
import { Avatar, Boton, Cabecera, Campo, Chips, Contenido, Entrada, EtiquetaDemo, Hoja, Insignia, ir, limpiarPedido, param, pide, Selector, Tarjeta, Texto, useConfirmar, useToast, Vacio } from '../ui/kit'
import { ElegirIntegrante, useIntegrantes } from '../ui/comunes'
import { Icono } from '../ui/iconos'

const COLOR_CAT: Record<string, string> = {
  'Consulta médica': 'bg-cielo-500', Laboratorio: 'bg-lavanda-500', Estudio: 'bg-lavanda-500', Vacunación: 'bg-turquesa-500',
  'Control preventivo': 'bg-salvia-500', 'Consulta veterinaria': 'bg-amber-500', 'Retiro de medicamentos': 'bg-coral-500', Tratamiento: 'bg-coral-400',
}

export default function Agenda({ eventoId }: { eventoId?: number }) {
  const familia = useIntegrantes()
  const [quien, setQuien] = useState<number | undefined>(() => (param('de') ? Number(param('de')) : undefined))
  const [cat, setCat] = useState('')
  const [vista, setVista] = useState<'mes' | 'semana' | 'lista'>('mes')
  const [dia, setDia] = useState(hoyISO())
  const [form, setForm] = useState<Evento | null>(null)
  const eventos = useLiveQuery(() => db.eventos.orderBy('fecha').toArray(), [], [])
  const nombre = new Map(familia.map((i) => [i.id!, i]))
  const visibles = eventos.filter((e) => nombre.has(e.integranteId) && (!quien || e.integranteId === quien) && (!cat || e.categoria === cat))
  const detalle = eventos.find((e) => e.id === eventoId)
  const nuevo = (fecha = dia): Evento => ({ integranteId: quien ?? familia[0]?.id ?? 0, categoria: 'Consulta médica', fecha, hora: '09:00', estado: 'programado', avisoDias: 1, creado: ahora() })
  useEffect(() => { if (pide('nuevo') && familia.length) { setForm(nuevo()); limpiarPedido() } }, [familia.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const d = deISO(dia)
  const primero = new Date(d.getFullYear(), d.getMonth(), 1)
  const inicioGrilla = sumarDias(aISO(primero), -((primero.getDay() + 6) % 7)) // lunes
  const celdas = Array.from({ length: 42 }, (_, k) => sumarDias(inicioGrilla, k))
  const inicioSemana = sumarDias(dia, -((d.getDay() + 6) % 7))
  const semana = Array.from({ length: 7 }, (_, k) => sumarDias(inicioSemana, k))
  const delDia = (f: string) => visibles.filter((e) => e.fecha === f)
  const mover = (n: number) => { if (vista === 'mes') { const x = new Date(d.getFullYear(), d.getMonth() + n, 1); setDia(aISO(x)) } else setDia(sumarDias(dia, n * 7)) }
  const proximos = visibles.filter((e) => e.fecha >= hoyISO() && e.estado === 'programado')
  const pasados = visibles.filter((e) => e.fecha < hoyISO() || e.estado !== 'programado').reverse()

  return (
    <>
      <Cabecera titulo="Agenda médica" subtitulo="Citas, estudios y controles de la familia" color="turquesa" accion={familia.length > 0 && <Boton className="!px-4" icono="mas" onClick={() => setForm(nuevo())}>Agendar</Boton>} />
      <Contenido>
        {familia.length === 0 ? <Vacio ilus="calendario" titulo="Primero agregá a tu familia" texto="Cada cita se asigna a un integrante." /> : (
          <>
            <ElegirIntegrante lista={familia} valor={quien} onChange={setQuien} todos />
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-crema-200 p-1 text-sm font-bold">
                {([['mes', 'Mes'], ['semana', 'Semana'], ['lista', 'Lista']] as const).map(([k, t]) => <button key={k} onClick={() => setVista(k)} className={`rounded-xl py-2 ${vista === k ? 'bg-white text-piedra-800 shadow-suave' : 'text-piedra-600'}`}>{t}</button>)}
              </div>
              <Selector className="!w-auto" aria-label="Categoría" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Todo</option>{CATEGORIAS_EVENTO.map((c) => <option key={c}>{c}</option>)}</Selector>
            </div>

            {vista !== 'lista' && (
              <Tarjeta className="mt-3 !p-3">
                <div className="mb-2 flex items-center justify-between">
                  <button aria-label="Anterior" onClick={() => mover(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-crema-100"><Icono n="atras" c="w-5 h-5" /></button>
                  <p className="font-bold capitalize">{nombreMes(d.getMonth())} {d.getFullYear()}</p>
                  <button aria-label="Siguiente" onClick={() => mover(1)} className="grid h-10 w-10 place-items-center rounded-full bg-crema-100"><Icono n="adelante" c="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase text-piedra-400">{['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'].map((x) => <span key={x}>{x}</span>)}</div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {(vista === 'mes' ? celdas : semana).map((f) => {
                    const evs = delDia(f)
                    const fuera = vista === 'mes' && deISO(f).getMonth() !== d.getMonth()
                    return (
                      <button key={f} onClick={() => setDia(f)} className={`flex ${vista === 'semana' ? 'h-20' : 'h-12'} flex-col items-center rounded-xl pt-1 text-sm transition ${f === dia ? 'bg-turquesa-500 text-white' : f === hoyISO() ? 'bg-turquesa-50 font-extrabold text-turquesa-700' : fuera ? 'text-piedra-400' : 'hover:bg-crema-100'}`}>
                        {deISO(f).getDate()}
                        <span className="mt-1 flex flex-wrap justify-center gap-0.5">{evs.slice(0, 3).map((e) => <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${f === dia ? 'bg-white' : COLOR_CAT[e.categoria] ?? 'bg-piedra-400'}`} />)}</span>
                      </button>
                    )
                  })}
                </div>
              </Tarjeta>
            )}

            {vista !== 'lista' ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between"><p className="font-bold">{DIAS[d.getDay()][0].toUpperCase() + DIAS[d.getDay()].slice(1)} {d.getDate()}</p><button onClick={() => setForm(nuevo(dia))} className="text-sm font-bold text-turquesa-600">+ Agregar este día</button></div>
                {delDia(dia).length === 0 ? <p className="rounded-2xl bg-white p-4 text-sm text-piedra-500">No hay nada agendado este día.</p> : <div className="space-y-2">{delDia(dia).map((e) => <FilaEvento key={e.id} e={e} p={nombre.get(e.integranteId)} />)}</div>}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {proximos.length === 0 && pasados.length === 0 && <Vacio ilus="calendario" titulo="Agenda vacía" texto="Agendá consultas, laboratorios, vacunas y retiro de remedios." accion={<Boton icono="mas" onClick={() => setForm(nuevo())}>Agendar</Boton>} />}
                {proximos.length > 0 && <p className="font-bold text-piedra-700">Próximos</p>}
                {proximos.map((e) => <FilaEvento key={e.id} e={e} p={nombre.get(e.integranteId)} mostrarFecha />)}
                {pasados.length > 0 && <p className="pt-3 font-bold text-piedra-700">Realizados, cancelados y pasados</p>}
                {pasados.map((e) => <FilaEvento key={e.id} e={e} p={nombre.get(e.integranteId)} mostrarFecha />)}
              </div>
            )}
          </>
        )}
      </Contenido>
      {form && <FormEvento e={form} onCerrar={() => setForm(null)} />}
      {detalle && !form && <DetalleEvento e={detalle} onEditar={() => setForm(detalle)} />}
    </>
  )
}

function FilaEvento({ e, p, mostrarFecha }: { e: Evento; p?: Parameters<typeof Avatar>[0]['i']; mostrarFecha?: boolean }) {
  return (
    <Tarjeta onClick={() => ir(`agenda/${e.id}`)} className={`flex items-center gap-3 !p-3 ${e.estado === 'cancelado' ? 'opacity-50' : ''}`}>
      <span className={`h-12 w-1.5 shrink-0 rounded-full ${COLOR_CAT[e.categoria] ?? 'bg-piedra-400'}`} />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-bold ${e.estado === 'cancelado' ? 'line-through' : ''}`}>{e.categoria}{e.especialidad ? ` · ${e.especialidad}` : ''}</p>
        <p className="truncate text-xs text-piedra-500">{mostrarFecha ? `${cuando(e.fecha)} · ` : ''}{e.hora ?? 'Sin hora'}{e.profesional ? ` · ${e.profesional}` : ''}</p>
        <div className="mt-0.5 flex gap-1"><EtiquetaDemo demo={e.demo} />{e.estado !== 'programado' && <Insignia clase={e.estado === 'realizado' ? 'bg-salvia-100 text-salvia-700' : 'bg-crema-200 text-piedra-600'}>{e.estado}</Insignia>}</div>
      </div>
      <Avatar i={p} t="sm" />
    </Tarjeta>
  )
}

function DetalleEvento({ e, onEditar }: { e: Evento; onEditar: () => void }) {
  const p = useLiveQuery(() => db.integrantes.get(e.integranteId), [e.integranteId])
  const confirmar = useConfirmar()
  const toast = useToast()
  const cerrar = () => ir('agenda')
  const estado = async (estado: Evento['estado']) => { await db.eventos.update(e.id!, { estado }); await registrarActividad(`Cita ${estado}`, e.categoria); toast(estado === 'realizado' ? 'Marcada como realizada' : estado === 'cancelado' ? 'Cita cancelada' : 'Cita reprogramada'); cerrar() }
  const borrar = async () => { if (!(await confirmar('¿Borrar esta cita?', 'No se puede deshacer.', 'Borrar'))) return; await db.eventos.delete(e.id!); toast('Cita borrada'); cerrar() }
  const calendario = () => {
    // archivo .ics para agregar al calendario del celular
    const f = e.fecha.replace(/-/g, ''), h = (e.hora ?? '09:00').replace(':', '') + '00'
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Familia Sana//ES', 'BEGIN:VEVENT', `UID:fs-${e.id}@familiasana`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART:${f}T${h}`, `SUMMARY:${e.categoria} - ${p?.nombre ?? ''}`, `LOCATION:${e.direccion ?? ''}`, `DESCRIPTION:${[e.motivo, e.profesional, e.telefono].filter(Boolean).join(' · ')}`, 'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'cita-familia-sana.ics'; a.click()
  }
  return (
    <Hoja abierta titulo={e.categoria} onCerrar={cerrar} pie={
      <div className="space-y-2">
        {e.estado === 'programado' ? <div className="grid grid-cols-2 gap-2"><Boton onClick={() => estado('realizado')} icono="check">Realizada</Boton><Boton variante="suave" onClick={() => estado('cancelado')}>Cancelar cita</Boton></div> : <Boton variante="suave" className="w-full" onClick={() => estado('programado')}>Volver a programada</Boton>}
        <div className="grid grid-cols-3 gap-2"><Boton variante="borde" className="!px-2 !text-coral-600" onClick={borrar}>Borrar</Boton><Boton variante="borde" className="!px-2" onClick={calendario}>Calendario</Boton><Boton variante="borde" className="!px-2" onClick={onEditar}>Editar</Boton></div>
      </div>}>
      <div className="flex items-center gap-3"><Avatar i={p} /><div><p className="font-bold">{p?.nombre}</p><p className="text-sm text-piedra-500">{fechaLarga(e.fecha)}{e.hora ? ` · ${e.hora}` : ''}</p></div></div>
      <div className="space-y-1.5 rounded-2xl bg-white p-4 text-sm">
        {([['Especialidad', e.especialidad], ['Profesional', e.profesional], ['Dirección', e.direccion], ['Motivo', e.motivo], ['Documentación', e.observaciones]] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => <p key={k}><span className="text-piedra-500">{k}:</span> <b>{v}</b></p>)}
        {e.telefono && <p><span className="text-piedra-500">Teléfono:</span> <a className="font-bold text-turquesa-600" href={`tel:${e.telefono}`}>{e.telefono}</a></p>}
        <p><span className="text-piedra-500">Aviso:</span> <b>{e.avisoDias === 0 ? 'el mismo día' : `${e.avisoDias ?? 3} día(s) antes`}</b></p>
      </div>
      <EtiquetaDemo demo={e.demo} />
    </Hoja>
  )
}

function FormEvento({ e, onCerrar }: { e: Evento; onCerrar: () => void }) {
  const familia = useIntegrantes()
  const [d, setD] = useState(e)
  const [personal, setPersonal] = useState(![0, 1, 3, 7].includes(e.avisoDias ?? 1))
  const [error, setError] = useState<string>()
  const toast = useToast()
  const set = (k: keyof Evento, v: unknown) => setD((x) => ({ ...x, [k]: v }))
  const guardar = async () => {
    if (!d.fecha) return setError('Elegí la fecha.')
    if (!d.integranteId) return setError('Elegí a quién corresponde.')
    if (d.id) await db.eventos.put(d); else await db.eventos.add(d)
    await registrarActividad(d.id ? 'Cita editada' : 'Cita agendada', d.categoria)
    toast('Cita guardada'); onCerrar()
  }
  return (
    <Hoja abierta titulo={d.id ? 'Editar cita' : 'Agendar'} onCerrar={onCerrar} pie={<>{error && <p className="mb-2 text-center text-sm font-bold text-coral-600">{error}</p>}<Boton className="w-full" onClick={guardar}>Guardar</Boton></>}>
      <Campo etiqueta="¿Para quién?"><Selector value={d.integranteId} onChange={(x) => set('integranteId', Number(x.target.value))}>{familia.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</Selector></Campo>
      <Campo etiqueta="Tipo"><Selector value={d.categoria} onChange={(x) => set('categoria', x.target.value)}>{CATEGORIAS_EVENTO.map((c) => <option key={c}>{c}</option>)}</Selector></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Fecha"><Entrada type="date" value={d.fecha} onChange={(x) => set('fecha', x.target.value)} /></Campo>
        <Campo etiqueta="Hora"><Entrada type="time" value={d.hora ?? ''} onChange={(x) => set('hora', x.target.value)} /></Campo>
        <Campo etiqueta="Especialidad"><Entrada value={d.especialidad ?? ''} onChange={(x) => set('especialidad', x.target.value)} /></Campo>
        <Campo etiqueta="Profesional"><Entrada value={d.profesional ?? ''} onChange={(x) => set('profesional', x.target.value)} /></Campo>
      </div>
      <Campo etiqueta="Dirección"><Entrada value={d.direccion ?? ''} onChange={(x) => set('direccion', x.target.value)} /></Campo>
      <Campo etiqueta="Teléfono"><Entrada type="tel" value={d.telefono ?? ''} onChange={(x) => set('telefono', x.target.value)} /></Campo>
      <Campo etiqueta="Motivo"><Entrada value={d.motivo ?? ''} onChange={(x) => set('motivo', x.target.value)} /></Campo>
      <Campo etiqueta="Documentación u observaciones"><Texto rows={2} value={d.observaciones ?? ''} onChange={(x) => set('observaciones', x.target.value)} placeholder="Ej.: llevar análisis anteriores, ir en ayunas" /></Campo>
      <Campo etiqueta="¿Cuándo te avisamos?">
        <Chips opciones={[{ v: 0, t: 'El mismo día' }, { v: 1, t: '1 día antes' }, { v: 3, t: '3 días antes' }, { v: 7, t: '1 semana antes' }, { v: -1, t: 'Personalizado' }]} valor={personal ? -1 : d.avisoDias} onChange={(v) => { if (v === -1) setPersonal(true); else { setPersonal(false); set('avisoDias', v) } }} />
      </Campo>
      {personal && <Campo etiqueta="Días de anticipación"><Entrada type="number" min={0} max={60} value={d.avisoDias ?? ''} onChange={(x) => set('avisoDias', Number(x.target.value))} /></Campo>}
    </Hoja>
  )
}
