import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ahora, db, registrarActividad, type EstadoToma, type Medicamento } from '../lib/db'
import { cumplimiento, DIAS, fechaCorta, hoyISO, sumarDias, tomasDelDia, type TomaProgramada } from '../lib/salud'
import { Avatar, Boton, Cabecera, Campo, Chips, Contenido, Entrada, EtiquetaDemo, Hoja, Insignia, ir, limpiarPedido, param, pide, Progreso, Selector, Tarjeta, Texto, useConfirmar, useToast, Vacio } from '../ui/kit'
import { ElegirIntegrante, TIPOS_PERMITIDOS, useIntegrantes, validarArchivo } from '../ui/comunes'
import { Icono } from '../ui/iconos'

/** Registra una toma (tomado, pospuesto u omitido). Si se toma, descuenta del stock. */
export async function registrarToma(t: TomaProgramada, estado: EstadoToma) {
  const previo = await db.tomas.where('[medicamentoId+fecha+hora]').equals([t.med.id!, t.fecha, t.hora]).first()
  if (previo) await db.tomas.update(previo.id!, { estado, registrado: ahora() })
  else await db.tomas.add({ medicamentoId: t.med.id!, integranteId: t.med.integranteId, fecha: t.fecha, hora: t.hora, estado, registrado: ahora() })
  if (estado === 'tomado' && previo?.estado !== 'tomado' && t.med.stock !== undefined && t.med.stock > 0) await db.medicamentos.update(t.med.id!, { stock: t.med.stock - 1 })
}

export default function Medicamentos({ medId }: { medId?: number }) {
  const familia = useIntegrantes()
  const [quien, setQuien] = useState<number | undefined>(() => (param('de') ? Number(param('de')) : undefined))
  const [pestana, setPestana] = useState<'hoy' | 'tratamientos' | 'historial'>(quien ? 'tratamientos' : 'hoy')
  const [form, setForm] = useState<Medicamento | null>(null)
  const [fecha, setFecha] = useState(hoyISO())
  const meds = useLiveQuery(() => db.medicamentos.toArray(), [], [])
  const tomas = useLiveQuery(() => db.tomas.where('fecha').equals(fecha).toArray(), [fecha], [])
  const detalle = meds.find((m) => m.id === medId)
  const nombre = new Map(familia.map((i) => [i.id!, i]))
  const visibles = meds.filter((m) => nombre.has(m.integranteId) && (!quien || m.integranteId === quien))
  const programadas = tomasDelDia(visibles, tomas, fecha)
  const nuevo = (): Medicamento => ({ integranteId: quien ?? familia[0]?.id ?? 0, nombre: '', dosis: '', frecuencia: 'diaria', horarios: ['08:00'], inicio: hoyISO(), activo: true, creado: ahora() })
  useEffect(() => { if (pide('nuevo') && familia.length) { setForm(nuevo()); limpiarPedido() } }, [familia.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // agrupar por hora para el organizador visual
  const porHora = new Map<string, TomaProgramada[]>()
  for (const t of programadas) porHora.set(t.hora, [...(porHora.get(t.hora) ?? []), t])
  const ahoraHH = new Date().toTimeString().slice(0, 5)
  const hechas = programadas.filter((t) => t.registro && t.registro.estado !== 'pospuesto').length

  return (
    <>
      <Cabecera titulo="Medicamentos" subtitulo="Organizador familiar de remedios" color="turquesa" accion={familia.length > 0 && <Boton className="!px-4" icono="mas" onClick={() => setForm(nuevo())}>Nuevo</Boton>} />
      <Contenido>
        {familia.length === 0 ? <Vacio ilus="pastilla" titulo="Primero agregá a tu familia" texto="Cada remedio se vincula a una persona o mascota." /> : (
          <>
            <ElegirIntegrante lista={familia} valor={quien} onChange={setQuien} todos />
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-crema-200 p-1 text-sm font-bold">
              {([['hoy', 'Horarios'], ['tratamientos', 'Tratamientos'], ['historial', 'Cumplimiento']] as const).map(([k, t]) => <button key={k} onClick={() => setPestana(k)} className={`rounded-xl py-2 ${pestana === k ? 'bg-white text-piedra-800 shadow-suave' : 'text-piedra-600'}`}>{t}</button>)}
            </div>

            {pestana === 'hoy' && (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-2">
                  <button aria-label="Día anterior" onClick={() => setFecha(sumarDias(fecha, -1))} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-suave"><Icono n="atras" c="w-5 h-5" /></button>
                  <div className="text-center"><p className="font-bold">{fecha === hoyISO() ? 'Hoy' : fechaCorta(fecha)}</p><p className="text-xs text-piedra-500">{hechas} de {programadas.length} registradas</p></div>
                  <button aria-label="Día siguiente" onClick={() => setFecha(sumarDias(fecha, 1))} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-suave"><Icono n="adelante" c="w-5 h-5" /></button>
                </div>
                {programadas.length > 0 && <div className="mt-3"><Progreso valor={(hechas / programadas.length) * 100} /></div>}
                {programadas.length === 0 ? <div className="mt-4"><Vacio ilus="pastilla" titulo="Sin tomas este día" texto="Cuando registres un remedio con horarios, el organizador del día aparece acá." accion={<Boton icono="mas" onClick={() => setForm(nuevo())}>Registrar medicamento</Boton>} /></div> : (
                  <ol className="relative mt-5 ml-3 border-l-2 border-turquesa-100">
                    {[...porHora].map(([hora, lista]) => (
                      <li key={hora} className="mb-5 ml-6">
                        <span className={`absolute -left-[9px] mt-1 h-4 w-4 rounded-full ring-4 ring-crema-100 ${fecha === hoyISO() && hora <= ahoraHH ? 'bg-turquesa-500' : 'bg-turquesa-100'}`} />
                        <p className="text-lg font-extrabold text-turquesa-700">{hora}</p>
                        <div className="mt-2 space-y-2">
                          {lista.map((t) => {
                            const p = nombre.get(t.med.integranteId)
                            const est = t.registro?.estado
                            return (
                              <Tarjeta key={t.med.id} className={`!p-3 ${est === 'tomado' ? '!bg-salvia-50' : est === 'omitido' ? '!bg-crema-200' : ''}`}>
                                <div className="flex items-center gap-3">
                                  <Avatar i={p} t="sm" />
                                  <button className="min-w-0 flex-1 text-left" onClick={() => ir(`medicamentos/${t.med.id}`)}><p className={`truncate font-bold ${est === 'tomado' ? 'line-through decoration-salvia-400' : ''}`}>{t.med.nombre} {t.med.concentracion}</p><p className="truncate text-xs text-piedra-500">{p?.nombre} · {t.med.dosis}{t.med.via ? ` · ${t.med.via}` : ''}</p></button>
                                  {est && <Insignia clase={est === 'tomado' ? 'bg-salvia-100 text-salvia-700' : est === 'omitido' ? 'bg-crema-200 text-piedra-600' : 'bg-amber-100 text-amber-800'}>{est}</Insignia>}
                                </div>
                                {est !== 'tomado' && est !== 'omitido' && (
                                  <div className="mt-3 grid grid-cols-3 gap-2">
                                    <button onClick={() => registrarToma(t, 'tomado')} className="min-h-[44px] rounded-xl bg-turquesa-500 font-bold text-white">Tomado</button>
                                    <button onClick={() => registrarToma(t, 'pospuesto')} className="min-h-[44px] rounded-xl bg-amber-100 font-bold text-amber-800">Posponer</button>
                                    <button onClick={() => registrarToma(t, 'omitido')} className="min-h-[44px] rounded-xl bg-crema-200 font-bold text-piedra-700">Omitir</button>
                                  </div>
                                )}
                                {(est === 'tomado' || est === 'omitido') && <button onClick={async () => { await db.tomas.delete(t.registro!.id!); if (est === 'tomado' && t.med.stock !== undefined) await db.medicamentos.update(t.med.id!, { stock: t.med.stock + 1 }) }} className="mt-2 text-xs font-bold text-piedra-500">Deshacer</button>}
                              </Tarjeta>
                            )
                          })}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="mt-2 text-xs text-piedra-500">Los horarios son los que cargaste según la receta. La app nunca cambia dosis ni horarios.</p>
              </div>
            )}

            {pestana === 'tratamientos' && (
              <div className="entrar mt-4 space-y-3">
                {visibles.length === 0 ? <Vacio ilus="pastilla" titulo="Sin remedios cargados" texto="Registrá los medicamentos tal como figuran en la receta." accion={<Boton icono="mas" onClick={() => setForm(nuevo())}>Registrar medicamento</Boton>} /> :
                  [...visibles].sort((a, b) => Number(b.activo) - Number(a.activo)).map((m) => <TarjetaMed key={m.id} m={m} p={nombre.get(m.integranteId)} />)}
              </div>
            )}

            {pestana === 'historial' && <Historial meds={visibles} />}
          </>
        )}
      </Contenido>
      {form && <FormMedicamento m={form} onCerrar={() => setForm(null)} />}
      {detalle && !form && <DetalleMed m={detalle} onEditar={() => setForm(detalle)} />}
    </>
  )
}

function textoFrecuencia(m: Medicamento) {
  if (m.frecuencia === 'horas') return `Cada ${m.cadaHoras} h desde las ${m.horaInicio}`
  const h = m.horarios.join(', ')
  if (m.frecuencia === 'dias') return `${(m.dias ?? []).map((d) => DIAS[d].slice(0, 3)).join(', ')} · ${h}`
  return `Todos los días · ${h}`
}

function TarjetaMed({ m, p }: { m: Medicamento; p?: Parameters<typeof Avatar>[0]['i'] }) {
  return (
    <Tarjeta onClick={() => ir(`medicamentos/${m.id}`)} className={!m.activo ? 'opacity-60' : ''}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-turquesa-100 text-turquesa-700"><Icono n="pastilla" c="w-5 h-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{m.nombre} {m.concentracion}</p><EtiquetaDemo demo={m.demo} /></div>
          <p className="text-sm text-piedra-600">{m.dosis} · {textoFrecuencia(m)}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Insignia clase="bg-crema-200 text-piedra-700">{p?.nombre}</Insignia>
            {!m.activo ? <Insignia clase="bg-crema-200 text-piedra-600">Finalizado</Insignia> : m.fin ? <Insignia clase="bg-lavanda-100 text-lavanda-600">Hasta {fechaCorta(m.fin)}</Insignia> : <Insignia>Permanente</Insignia>}
            {m.stock !== undefined && m.stock <= 5 && m.activo && <Insignia clase="bg-coral-100 text-coral-600">Quedan {m.stock}</Insignia>}
          </div>
        </div>
      </div>
    </Tarjeta>
  )
}

function Historial({ meds }: { meds: Medicamento[] }) {
  const desde = sumarDias(hoyISO(), -30)
  const tomas = useLiveQuery(() => db.tomas.where('fecha').between(desde, hoyISO(), true, true).toArray(), [desde], [])
  const activos = meds.filter((m) => m.activo)
  if (!activos.length) return <div className="mt-4"><Vacio ilus="pastilla" titulo="Sin datos" texto="El cumplimiento se calcula con las tomas que marcás cada día." /></div>
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-piedra-600">Últimos 30 días. Se cuentan las tomas marcadas como tomadas u omitidas.</p>
      {activos.map((m) => {
        const t = tomas.filter((x) => x.medicamentoId === m.id)
        const c = cumplimiento(t)
        return (
          <Tarjeta key={m.id}>
            <div className="flex items-center justify-between"><p className="font-bold">{m.nombre}</p><p className="font-extrabold text-turquesa-600">{c === undefined ? '—' : `${c}%`}</p></div>
            <Progreso valor={c ?? 0} />
            <p className="mt-1 text-xs text-piedra-500">{t.filter((x) => x.estado === 'tomado').length} tomadas · {t.filter((x) => x.estado === 'omitido').length} omitidas · {t.filter((x) => x.estado === 'pospuesto').length} pospuestas</p>
            <div className="mt-2 flex gap-[3px]">{Array.from({ length: 14 }).map((_, k) => { const f = sumarDias(hoyISO(), -13 + k); const del = t.filter((x) => x.fecha === f); const ok = del.length && del.every((x) => x.estado === 'tomado'); const mal = del.some((x) => x.estado === 'omitido'); return <span key={k} title={fechaCorta(f)} className={`h-5 flex-1 rounded ${ok ? 'bg-turquesa-400' : mal ? 'bg-coral-400' : del.length ? 'bg-amber-200' : 'bg-crema-200'}`} /> })}</div>
            <p className="mt-1 text-[11px] text-piedra-400">Últimos 14 días</p>
          </Tarjeta>
        )
      })}
    </div>
  )
}

function DetalleMed({ m, onEditar }: { m: Medicamento; onEditar: () => void }) {
  const confirmar = useConfirmar()
  const toast = useToast()
  const p = useLiveQuery(() => db.integrantes.get(m.integranteId), [m.integranteId])
  const receta = useLiveQuery(() => (m.recetaDocId ? db.documentos.get(m.recetaDocId) : undefined), [m.recetaDocId])
  const [compra, setCompra] = useState('30')
  const cerrar = () => ir('medicamentos')
  const finalizar = async () => { await db.medicamentos.update(m.id!, { activo: !m.activo, fin: m.activo ? hoyISO() : m.fin }); await registrarActividad(m.activo ? 'Tratamiento finalizado' : 'Tratamiento reactivado', m.nombre); toast(m.activo ? 'Tratamiento finalizado' : 'Tratamiento reactivado') }
  const borrar = async () => { if (!(await confirmar(`¿Borrar ${m.nombre}?`, 'Se borra también su historial de tomas.', 'Borrar'))) return; await db.tomas.where('medicamentoId').equals(m.id!).delete(); await db.medicamentos.delete(m.id!); await registrarActividad('Medicamento borrado', m.nombre); toast('Medicamento borrado'); cerrar() }
  return (
    <Hoja abierta titulo={`${m.nombre} ${m.concentracion ?? ''}`} onCerrar={cerrar} pie={<div className="grid grid-cols-3 gap-2"><Boton variante="borde" className="!px-2 !text-coral-600" onClick={borrar}>Borrar</Boton><Boton variante="suave" className="!px-2" onClick={finalizar}>{m.activo ? 'Finalizar' : 'Reactivar'}</Boton><Boton className="!px-2" onClick={onEditar}>Editar</Boton></div>}>
      <div className="flex items-center gap-3"><Avatar i={p} /><div><p className="font-bold">{p?.nombre}</p><p className="text-sm text-piedra-500">{textoFrecuencia(m)}</p></div></div>
      <div className="space-y-1.5 rounded-2xl bg-white p-4 text-sm">
        {([['Principio activo', m.principioActivo], ['Presentación', m.presentacion], ['Dosis indicada', m.dosis], ['Vía', m.via], ['Inicio', fechaCorta(m.inicio)], ['Fin', m.fin ? fechaCorta(m.fin) : 'Tratamiento permanente'], ['Prescriptor', m.prescriptor], ['Indicaciones', m.indicaciones], ['Observaciones', m.observaciones], ['Renovar receta', m.renovarReceta && fechaCorta(m.renovarReceta)]] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => <p key={k}><span className="text-piedra-500">{k}:</span> <b>{v}</b></p>)}
      </div>
      {m.stock !== undefined && (
        <div className="flex items-center justify-between rounded-2xl bg-white p-4">
          <div><p className="text-sm text-piedra-500">Unidades que quedan</p><p className={`text-2xl font-extrabold ${m.stock <= 5 ? 'text-coral-600' : ''}`}>{m.stock}</p></div>
          <div className="flex items-center gap-2"><Boton variante="suave" className="!px-3" aria-label="Restar una unidad" onClick={() => db.medicamentos.update(m.id!, { stock: Math.max(0, m.stock! - 1) })}>−1</Boton><Entrada aria-label="Unidades compradas" type="number" min={1} className="!w-20" value={compra} onChange={(e) => setCompra(e.target.value)} /><Boton variante="suave" className="!px-3" onClick={async () => { if (Number(compra) > 0) { await db.medicamentos.update(m.id!, { stock: m.stock! + Number(compra) }); toast(`Se sumaron ${compra} unidades`) } }}>Sumar</Boton></div>
        </div>
      )}
      {receta && <a href={`#/documentos/${receta.integranteId}?ver=${receta.id}`} className="block rounded-2xl bg-cielo-50 p-3 font-bold text-cielo-600">📎 Ver foto de la receta</a>}
      <EtiquetaDemo demo={m.demo} />
    </Hoja>
  )
}

function FormMedicamento({ m, onCerrar }: { m: Medicamento; onCerrar: () => void }) {
  const familia = useIntegrantes()
  const [d, setD] = useState<Medicamento>(m)
  const [paso, setPaso] = useState(0)
  const [receta, setReceta] = useState<File>()
  const [permanente, setPermanente] = useState(!m.fin)
  const [error, setError] = useState<string>()
  const toast = useToast()
  const set = (k: keyof Medicamento, v: unknown) => setD((x) => ({ ...x, [k]: v }))
  const validar = () => {
    if (!d.nombre.trim()) return (setPaso(0), 'Escribí el nombre del medicamento.')
    if (!d.dosis.trim()) return (setPaso(0), 'Escribí la dosis indicada en la receta.')
    if (d.frecuencia !== 'horas' && !d.horarios.filter(Boolean).length) return (setPaso(1), 'Agregá al menos un horario.')
    if (d.frecuencia === 'dias' && !d.dias?.length) return (setPaso(1), 'Elegí los días.')
    if (d.frecuencia === 'horas' && (!d.cadaHoras || d.cadaHoras < 1 || d.cadaHoras > 72 || !d.horaInicio)) return (setPaso(1), 'Indicá cada cuántas horas (1 a 72) y la hora de la primera toma.')
    if (!permanente && d.fin && d.fin < d.inicio) return (setPaso(1), 'La fecha de fin no puede ser antes del inicio.')
  }
  const guardar = async () => {
    const e = validar(); if (e) return setError(e)
    let recetaDocId = d.recetaDocId
    if (receta) recetaDocId = await db.documentos.add({ integranteId: d.integranteId, nombre: `Receta: ${d.nombre}`, categoria: 'Receta', fechaRealizacion: d.inicio, laboratorio: d.prescriptor, archivo: receta, archivoNombre: receta.name, archivoTipo: receta.type, creado: ahora() })
    const final = { ...d, nombre: d.nombre.trim(), horarios: [...new Set(d.horarios.filter(Boolean))].sort(), fin: permanente ? undefined : d.fin, recetaDocId }
    if (d.id) await db.medicamentos.put(final); else await db.medicamentos.add(final)
    await registrarActividad(d.id ? 'Medicamento editado' : 'Medicamento agregado', final.nombre)
    toast('Medicamento guardado'); onCerrar()
  }
  const pasos = ['Qué', 'Cuándo', 'Receta']
  return (
    <Hoja abierta titulo={d.id ? 'Editar medicamento' : 'Nuevo medicamento'} onCerrar={onCerrar}
      pie={<div className="space-y-2">
        <div className="flex justify-center gap-2">{pasos.map((p, i) => <button key={p} onClick={() => setPaso(i)} className={`rounded-full px-3 py-1 text-xs font-bold ${i === paso ? 'bg-turquesa-500 text-white' : 'bg-crema-200 text-piedra-600'}`}>{i + 1}. {p}</button>)}</div>
        {error && <p className="text-center text-sm font-bold text-coral-600">{error}</p>}
        <div className="grid grid-cols-2 gap-3">{paso > 0 ? <Boton variante="suave" onClick={() => setPaso(paso - 1)}>Atrás</Boton> : <Boton variante="suave" onClick={onCerrar}>Cancelar</Boton>}{paso < 2 ? <Boton onClick={() => { setError(undefined); setPaso(paso + 1) }}>Siguiente</Boton> : <Boton onClick={guardar}>Guardar</Boton>}</div>
      </div>}>
      {paso === 0 && <>
        <Campo etiqueta="¿Para quién?"><Selector value={d.integranteId} onChange={(e) => set('integranteId', Number(e.target.value))}>{familia.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</Selector></Campo>
        <Campo etiqueta="Nombre del medicamento *"><Entrada value={d.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Como figura en la caja o receta" /></Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Principio activo"><Entrada value={d.principioActivo ?? ''} onChange={(e) => set('principioActivo', e.target.value)} /></Campo>
          <Campo etiqueta="Concentración"><Entrada value={d.concentracion ?? ''} onChange={(e) => set('concentracion', e.target.value)} placeholder="Ej.: 500 mg" /></Campo>
          <Campo etiqueta="Presentación"><Selector value={d.presentacion ?? ''} onChange={(e) => set('presentacion', e.target.value)}><option value="">—</option>{['Comprimidos', 'Cápsulas', 'Jarabe', 'Gotas', 'Inyectable', 'Crema / pomada', 'Inhalador', 'Sobres', 'Otra'].map((x) => <option key={x}>{x}</option>)}</Selector></Campo>
          <Campo etiqueta="Vía"><Selector value={d.via ?? ''} onChange={(e) => set('via', e.target.value)}><option value="">—</option>{['Oral', 'Sublingual', 'Inhalatoria', 'Tópica', 'Oftálmica', 'Ótica', 'Nasal', 'Intramuscular', 'Subcutánea', 'Otra'].map((x) => <option key={x}>{x}</option>)}</Selector></Campo>
        </div>
        <Campo etiqueta="Dosis indicada *" ayuda="Copiá exactamente lo que dice la receta."><Entrada value={d.dosis} onChange={(e) => set('dosis', e.target.value)} placeholder="Ej.: 1 comprimido" /></Campo>
      </>}
      {paso === 1 && <>
        <Campo etiqueta="Frecuencia"><Chips opciones={[{ v: 'diaria', t: 'Todos los días' }, { v: 'dias', t: 'Días específicos' }, { v: 'horas', t: 'Cada X horas' }]} valor={d.frecuencia} onChange={(v) => set('frecuencia', v)} /></Campo>
        {d.frecuencia === 'dias' && <Campo etiqueta="Días"><Chips multiple opciones={[1, 2, 3, 4, 5, 6, 0].map((n) => ({ v: n, t: DIAS[n].slice(0, 3) }))} valor={d.dias ?? []} onChange={(v) => set('dias', v)} /></Campo>}
        {d.frecuencia !== 'horas' ? (
          <Campo etiqueta="Horarios">
            <div className="space-y-2">
              {d.horarios.map((h, k) => <div key={k} className="flex gap-2"><Entrada type="time" value={h} onChange={(e) => set('horarios', d.horarios.map((x, j) => (j === k ? e.target.value : x)))} />{d.horarios.length > 1 && <button aria-label="Quitar horario" onClick={() => set('horarios', d.horarios.filter((_, j) => j !== k))} className="grid w-12 place-items-center rounded-2xl bg-crema-200"><Icono n="x" c="w-5 h-5" /></button>}</div>)}
              <Boton variante="texto" icono="mas" onClick={() => set('horarios', [...d.horarios, '20:00'])}>Agregar horario</Boton>
            </div>
          </Campo>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Cada cuántas horas"><Entrada type="number" min={1} max={72} value={d.cadaHoras ?? ''} onChange={(e) => set('cadaHoras', Number(e.target.value) || undefined)} /></Campo>
            <Campo etiqueta="Primera toma"><Entrada type="time" value={d.horaInicio ?? ''} onChange={(e) => set('horaInicio', e.target.value)} /></Campo>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Fecha de inicio"><Entrada type="date" value={d.inicio} onChange={(e) => set('inicio', e.target.value)} /></Campo>
          {!permanente && <Campo etiqueta="Fecha de fin"><Entrada type="date" min={d.inicio} value={d.fin ?? ''} onChange={(e) => set('fin', e.target.value)} /></Campo>}
        </div>
        <Chips opciones={[{ v: 'perm', t: 'Tratamiento permanente' }, { v: 'temp', t: 'Tratamiento temporal' }]} valor={permanente ? 'perm' : 'temp'} onChange={(v) => setPermanente(v === 'perm')} />
      </>}
      {paso === 2 && <>
        <Campo etiqueta="Médico prescriptor"><Entrada value={d.prescriptor ?? ''} onChange={(e) => set('prescriptor', e.target.value)} /></Campo>
        <Campo etiqueta="Indicaciones"><Texto rows={2} value={d.indicaciones ?? ''} onChange={(e) => set('indicaciones', e.target.value)} placeholder="Ej.: después de comer" /></Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Unidades que tenés" ayuda="Te avisamos cuando queden 5 o menos."><Entrada type="number" min={0} value={d.stock ?? ''} onChange={(e) => set('stock', e.target.value === '' ? undefined : Number(e.target.value))} /></Campo>
          <Campo etiqueta="Renovar receta el"><Entrada type="date" value={d.renovarReceta ?? ''} onChange={(e) => set('renovarReceta', e.target.value || undefined)} /></Campo>
        </div>
        <Campo etiqueta="Foto de la receta"><input type="file" accept={TIPOS_PERMITIDOS} capture="environment" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const err = validarArchivo(f); if (err) toast(err, 'error'); else setReceta(f) }} className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-salvia-100 file:px-4 file:py-2 file:font-bold file:text-salvia-800" /></Campo>
        <Campo etiqueta="Observaciones"><Texto rows={2} value={d.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} /></Campo>
      </>}
    </Hoja>
  )
}
