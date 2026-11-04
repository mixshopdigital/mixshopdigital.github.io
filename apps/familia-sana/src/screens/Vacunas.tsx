import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ahora, db, registrarActividad, type VacunaAplicada } from '../lib/db'
import { carnetVacunas, ESTADO_VACUNA, fechaCorta, hoyISO, nombreCompleto, textoEdad, type FilaVacuna } from '../lib/salud'
import { Avatar, Boton, Cabecera, Campo, Contenido, Entrada, EtiquetaDemo, Hoja, Insignia, limpiarPedido, pide, Selector, Tarjeta, Texto, useConfirmar, useToast, Vacio } from '../ui/kit'
import { ElegirIntegrante, TIPOS_PERMITIDOS, useIntegrantes, validarArchivo } from '../ui/comunes'
import { Icono } from '../ui/iconos'

export default function Vacunas({ id }: { id?: number }) {
  const familia = useIntegrantes()
  const actual = id ?? familia[0]?.id
  const i = familia.find((x) => x.id === actual)
  const [form, setForm] = useState<VacunaAplicada | null>(null)
  const [filtro, setFiltro] = useState<string>('')
  const esquema = useLiveQuery(() => db.esquemaVacunas.toArray(), [], [])
  const aplicadas = useLiveQuery(() => (actual ? db.vacunas.where('integranteId').equals(actual).toArray() : []), [actual], [])
  const sinVerificar = esquema.filter((e) => !e.verificado && e.activo).length
  const nueva = (f?: FilaVacuna): VacunaAplicada => ({ integranteId: actual!, esquemaCodigo: f?.esquema.codigo, nombre: f?.esquema.nombre ?? '', dosis: f?.esquema.dosis, fechaAplicada: hoyISO(), confirmada: true, creado: ahora() })
  useEffect(() => { if (pide('nuevo') && actual) { setForm(nueva()); limpiarPedido() } }, [actual]) // eslint-disable-line react-hooks/exhaustive-deps

  const carnet = i && i.tipo === 'persona' ? carnetVacunas(i, esquema, aplicadas) : []
  const fuera = aplicadas.filter((a) => !a.esquemaCodigo || !carnet.some((f) => f.esquema.codigo === a.esquemaCodigo))
  const lista = carnet.filter((f) => !filtro || f.estado === filtro)
  const grupos = new Map<string, FilaVacuna[]>()
  for (const f of lista) grupos.set(f.esquema.grupo, [...(grupos.get(f.esquema.grupo) ?? []), f])
  const cuenta = (e: string) => carnet.filter((f) => f.estado === e).length

  return (
    <>
      <Cabecera titulo="Vacunación" subtitulo="Carnet digital de cada integrante" color="turquesa" accion={actual && <Boton className="!px-4" icono="mas" onClick={() => setForm(nueva())}>Registrar</Boton>} />
      <Contenido>
        {!i ? <Vacio ilus="vacuna" titulo="Primero agregá a tu familia" texto="El calendario se calcula con la fecha de nacimiento de cada persona." /> : (
          <>
            <ElegirIntegrante lista={familia} valor={actual} onChange={(v) => (location.hash = `#/vacunas/${v}`)} />
            {sinVerificar > 0 && i.tipo === 'persona' && (
              <div className="mt-3 flex gap-3 rounded-2xl border border-cielo-100 bg-cielo-50 p-3 text-sm text-cielo-600">
                <Icono n="info" c="w-5 h-5 shrink-0" />
                <p>El calendario precargado se basa en el <b>Esquema Regular del PAI – MSPBS</b>, pero todavía tiene {sinVerificar} vacunas <b>sin verificar</b> contra la tabla oficial vigente. Confirmá siempre con tu vacunatorio. <a href="#/ajustes/fuentes" className="font-bold underline">Ver fuentes</a></p>
              </div>
            )}

            <Tarjeta className="mt-3 overflow-hidden !p-0">
              <div className="flex items-center gap-3 bg-gradient-to-r from-turquesa-500 to-salvia-500 p-4 text-white">
                <Avatar i={i} t="lg" />
                <div className="min-w-0 flex-1"><p className="text-xs uppercase tracking-wider text-white/80">Carnet digital de vacunas</p><p className="truncate text-lg font-extrabold">{nombreCompleto(i)}</p><p className="text-sm text-white/90">{i.fechaNacimiento ? `Nació el ${fechaCorta(i.fechaNacimiento)} · ${textoEdad(i.fechaNacimiento)}` : 'Cargá la fecha de nacimiento para calcular fechas'}</p></div>
                <Icono n="vacuna" c="w-8 h-8 text-white/70" />
              </div>
              {i.tipo === 'persona' && (
                <div className="grid grid-cols-4 divide-x divide-crema-200 text-center">
                  {(['aplicada', 'proxima', 'atrasada', 'verificar'] as const).map((e) => <button key={e} onClick={() => setFiltro(filtro === e ? '' : e)} className={`py-3 ${filtro === e ? 'bg-crema-100' : ''}`}><p className="text-xl font-extrabold">{cuenta(e)}</p><p className="text-[11px] text-piedra-500">{ESTADO_VACUNA[e].texto}</p></button>)}
                </div>
              )}
            </Tarjeta>

            {i.tipo === 'persona' && [...grupos].map(([g, filas]) => (
              <section key={g} className="mt-5">
                <h2 className="mb-2 font-bold text-piedra-700">{g}</h2>
                <div className="space-y-2">
                  {filas.map((f) => (
                    <Tarjeta key={f.esquema.codigo} onClick={() => setForm(f.aplicada ?? nueva(f))} className="!p-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${f.estado === 'aplicada' ? 'bg-salvia-500 text-white' : 'bg-crema-200 text-piedra-500'}`}><Icono n={f.estado === 'aplicada' ? 'check' : 'vacuna'} c="w-5 h-5" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{f.esquema.nombre}</p><Insignia clase={ESTADO_VACUNA[f.estado].clase}>{ESTADO_VACUNA[f.estado].texto}</Insignia>{!f.esquema.verificado && <Insignia clase="bg-cielo-50 text-cielo-600">Fuente sin verificar</Insignia>}</div>
                          <p className="text-sm text-piedra-600">{f.esquema.dosis} · Previene: {f.esquema.previene}</p>
                          <p className="text-xs text-piedra-500">
                            {f.aplicada?.fechaAplicada && f.aplicada.confirmada ? `Aplicada el ${fechaCorta(f.aplicada.fechaAplicada)}${f.aplicada.lugar ? ` en ${f.aplicada.lugar}` : ''}${f.aplicada.lote ? ` · Lote ${f.aplicada.lote}` : ''}` : f.fechaSugerida ? `Fecha sugerida: ${fechaCorta(f.fechaSugerida)}` : 'Según indicación'}
                          </p>
                          {f.estado === 'verificar' && !f.aplicada && <p className="mt-1 text-xs text-cielo-600">No hay registro: revisá el carnet en papel y cargá la dosis si la tiene.</p>}
                        </div>
                      </div>
                    </Tarjeta>
                  ))}
                </div>
              </section>
            ))}

            <section className="mt-5">
              <h2 className="mb-2 font-bold text-piedra-700">{i.tipo === 'mascota' ? 'Vacunas veterinarias' : 'Otras vacunas registradas'}</h2>
              {fuera.length === 0 ? <p className="rounded-2xl bg-white p-4 text-sm text-piedra-500">{i.tipo === 'mascota' ? 'Registrá las vacunas de tu mascota y la próxima fecha que indique el veterinario.' : 'Campañas, vacunas de viaje u otras indicadas por el médico.'}</p> : (
                <div className="space-y-2">{fuera.map((a) => (
                  <Tarjeta key={a.id} onClick={() => setForm(a)} className="!p-3">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{a.nombre}</p>{a.confirmada ? <Insignia>Aplicada</Insignia> : <Insignia clase={ESTADO_VACUNA.verificar.clase}>Requiere verificación</Insignia>}<EtiquetaDemo demo={a.demo} /></div>
                    <p className="text-xs text-piedra-500">{a.fechaAplicada ? `Aplicada el ${fechaCorta(a.fechaAplicada)}` : 'Sin fecha'}{a.proximaDosis ? ` · Próxima dosis: ${fechaCorta(a.proximaDosis)}` : ''}</p>
                  </Tarjeta>
                ))}</div>
              )}
            </section>
            <Boton variante="borde" icono="imprimir" className="mt-5 w-full" onClick={() => print()}>Imprimir o guardar el carnet en PDF</Boton>
            <p className="mt-4 text-xs text-piedra-500">Una vacuna se marca como aplicada <b>solo cuando vos lo confirmás</b>. Las fechas sugeridas se calculan con la fecha de nacimiento y el esquema cargado; no reemplazan la indicación del vacunatorio.</p>
          </>
        )}
      </Contenido>
      {form && <FormVacuna v={form} onCerrar={() => setForm(null)} />}
    </>
  )
}

function FormVacuna({ v, onCerrar }: { v: VacunaAplicada; onCerrar: () => void }) {
  const [d, setD] = useState(v)
  const [foto, setFoto] = useState<File>()
  const esquema = useLiveQuery(() => db.esquemaVacunas.filter((e) => e.activo).toArray(), [], [])
  const confirmar = useConfirmar()
  const toast = useToast()
  const set = (k: keyof VacunaAplicada, x: unknown) => setD((y) => ({ ...y, [k]: x }))
  const guardar = async () => {
    if (!d.nombre.trim()) return toast('Escribí el nombre de la vacuna.', 'error')
    if (d.confirmada && !d.fechaAplicada) return toast('Para marcarla como aplicada, indicá la fecha.', 'error')
    if (d.fechaAplicada && d.fechaAplicada > hoyISO()) return toast('La fecha de aplicación no puede ser futura.', 'error')
    let fotoDocId = d.fotoDocId
    if (foto) fotoDocId = await db.documentos.add({ integranteId: d.integranteId, nombre: `Carnet: ${d.nombre}`, categoria: 'Carnet de vacunación', fechaRealizacion: d.fechaAplicada, archivo: foto, archivoNombre: foto.name, archivoTipo: foto.type, creado: ahora() })
    const final = { ...d, fotoDocId }
    if (d.id) await db.vacunas.put(final); else await db.vacunas.add(final)
    await registrarActividad(d.confirmada ? 'Vacuna confirmada' : 'Vacuna registrada sin confirmar', d.nombre)
    toast(d.confirmada ? 'Vacuna registrada como aplicada' : 'Guardada para verificar'); onCerrar()
  }
  const borrar = async () => { if (!(await confirmar('¿Borrar este registro de vacuna?', 'No se puede deshacer.', 'Borrar'))) return; await db.vacunas.delete(d.id!); toast('Registro borrado'); onCerrar() }
  return (
    <Hoja abierta titulo={d.id ? 'Editar vacuna' : 'Registrar vacuna'} onCerrar={onCerrar} pie={<div className="flex gap-3">{d.id && <Boton variante="borde" className="!text-coral-600" aria-label="Borrar" onClick={borrar}><Icono n="basura" c="w-5 h-5" /></Boton>}<Boton className="flex-1" onClick={guardar}>Guardar</Boton></div>}>
      {!d.id && (
        <Campo etiqueta="Vacuna del calendario (opcional)">
          <Selector value={d.esquemaCodigo ?? ''} onChange={(e) => { const s = esquema.find((x) => x.codigo === e.target.value); setD((y) => ({ ...y, esquemaCodigo: s?.codigo, nombre: s?.nombre ?? y.nombre, dosis: s?.dosis ?? y.dosis })) }}>
            <option value="">Otra vacuna (fuera del calendario)</option>
            {esquema.map((s) => <option key={s.codigo} value={s.codigo}>{s.grupo} · {s.nombre} · {s.dosis}</option>)}
          </Selector>
        </Campo>
      )}
      <Campo etiqueta="Nombre *"><Entrada value={d.nombre} onChange={(e) => set('nombre', e.target.value)} /></Campo>
      <Campo etiqueta="Dosis"><Entrada value={d.dosis ?? ''} onChange={(e) => set('dosis', e.target.value)} /></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Fecha de aplicación"><Entrada type="date" max={hoyISO()} value={d.fechaAplicada ?? ''} onChange={(e) => set('fechaAplicada', e.target.value || undefined)} /></Campo>
        <Campo etiqueta="Lote (si lo sabés)"><Entrada value={d.lote ?? ''} onChange={(e) => set('lote', e.target.value)} /></Campo>
      </div>
      <Campo etiqueta="Lugar de vacunación"><Entrada value={d.lugar ?? ''} onChange={(e) => set('lugar', e.target.value)} /></Campo>
      <Campo etiqueta="Próxima dosis (si te la indicaron)"><Entrada type="date" value={d.proximaDosis ?? ''} onChange={(e) => set('proximaDosis', e.target.value || undefined)} /></Campo>
      <Campo etiqueta="Foto del carnet"><input type="file" accept={TIPOS_PERMITIDOS} capture="environment" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const err = validarArchivo(f); if (err) toast(err, 'error'); else setFoto(f) }} className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-salvia-100 file:px-4 file:py-2 file:font-bold file:text-salvia-800" /></Campo>
      <Campo etiqueta="Observaciones"><Texto rows={2} value={d.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} /></Campo>
      <label className={`flex items-start gap-3 rounded-2xl p-4 ${d.confirmada ? 'bg-salvia-100' : 'bg-cielo-50'}`}>
        <input type="checkbox" className="mt-1 h-6 w-6 accent-turquesa-500" checked={d.confirmada} onChange={(e) => set('confirmada', e.target.checked)} />
        <span className="text-sm"><b>Confirmo que esta vacuna fue aplicada.</b> Si no estás seguro/a, dejalo sin marcar y quedará como “Requiere verificación”.</span>
      </label>
    </Hoja>
  )
}
