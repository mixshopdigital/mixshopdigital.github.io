import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getAjuste, registrarActividad, setAjuste, type Ciclo, type EtapaFemenina } from '../lib/db'
import { aISO, deISO, diasEntre, edadMeses, fechaCorta, hoyISO, nombreMes, predecirCiclo, sumarDias } from '../lib/salud'
import { guardarPinPrivado, pinPrivado, verificarPin } from '../lib/seguridad'
import { Boton, Cabecera, Campo, Chips, Contenido, Entrada, EtiquetaDemo, Hoja, Insignia, Seccion, Selector, Tarjeta, Texto, useConfirmar, useToast, Vacio } from '../ui/kit'
import { ElegirIntegrante, useIntegrantes } from '../ui/comunes'
import { Icono } from '../ui/iconos'
import { TecladoPin } from './Bloqueo'

// Secciones privadas desbloqueadas en esta sesión (se pierden al cerrar la app)
const desbloqueadas = new Set<number>()
const SINTOMAS = ['Cólicos', 'Dolor de cabeza', 'Hinchazón', 'Cansancio', 'Sensibilidad mamaria', 'Acné', 'Náuseas', 'Dolor lumbar']
const ANIMO = ['Bien', 'Sensible', 'Irritable', 'Triste', 'Ansiosa', 'Con energía']

export default function Femenina({ id }: { id?: number }) {
  const mujeres = useIntegrantes('persona').filter((i) => i.sexo === 'F' && (edadMeses(i.fechaNacimiento) ?? 999) >= 9 * 12)
  const actual = id ?? mujeres[0]?.id
  const i = mujeres.find((x) => x.id === actual)
  const pin = useLiveQuery(() => (actual ? pinPrivado(actual) : undefined), [actual], null)
  const [, refrescar] = useState(0)
  const [error, setError] = useState<string>()
  const abierta = !!actual && (desbloqueadas.has(actual) || pin === undefined)

  return (
    <>
      <Cabecera titulo="Salud femenina" subtitulo="Sección privada" color="lavanda" accion={abierta && actual && pin && <button onClick={() => { desbloqueadas.delete(actual); refrescar((x) => x + 1) }} className="inline-flex h-11 items-center gap-2 rounded-full bg-white/80 px-4 text-sm font-bold text-lavanda-600"><Icono n="candado" c="w-4 h-4" />Cerrar</button>} />
      <Contenido>
        {!i ? <Vacio ilus="corazon" titulo="Sin integrantes mujeres" texto="Esta sección aparece para mujeres de la familia desde los 9 años. Revisá que el perfil tenga sexo y fecha de nacimiento." /> : (
          <>
            {mujeres.length > 1 && <ElegirIntegrante lista={mujeres} valor={actual} onChange={(v) => { setError(undefined); location.hash = `#/femenina/${v}` }} />}
            {pin === null ? null : !abierta ? (
              <div className="mt-6 rounded-3xl bg-white p-6 shadow-suave">
                <TecladoPin titulo={`Sección privada de ${i.nombre}`} subtitulo="Ingresá el PIN de esta sección" error={error} onListo={async (p) => {
                  if (await verificarPin(p, pin)) { desbloqueadas.add(actual!); setError(undefined); await registrarActividad('Sección privada abierta', i.nombre); refrescar((x) => x + 1) }
                  else setError('PIN incorrecto')
                }} />
              </div>
            ) : <Panel integranteId={actual!} nombre={i.nombre} tienePin={!!pin} />}
          </>
        )}
      </Contenido>
    </>
  )
}

function Panel({ integranteId, nombre, tienePin }: { integranteId: number; nombre: string; tienePin: boolean }) {
  const ciclos = useLiveQuery(() => db.ciclos.where('integranteId').equals(integranteId).sortBy('inicio'), [integranteId], [])
  const etapas = useLiveQuery(() => db.etapas.where('integranteId').equals(integranteId).toArray(), [integranteId], [])
  const predicciones = useLiveQuery(() => getAjuste(`predicciones-${integranteId}`, true), [integranteId], true)
  const [mes, setMes] = useState(hoyISO().slice(0, 8) + '01')
  const [form, setForm] = useState<Ciclo | null>(null)
  const [formEtapa, setFormEtapa] = useState<EtapaFemenina | null>(null)
  const [crearPin, setCrearPin] = useState(false)
  const toast = useToast()
  const pred = predicciones ? predecirCiclo(ciclos) : undefined
  const enCurso = ciclos.find((c) => !c.fin && diasEntre(c.inicio, hoyISO()) <= 15)
  const etapaActiva = etapas.find((e) => !e.hasta || e.hasta >= hoyISO())

  // marcar días en el calendario
  const tipoDia = (f: string): 'periodo' | 'prevision' | 'fertil' | undefined => {
    for (const c of ciclos) { const fin = c.fin ?? sumarDias(c.inicio, (pred?.promedioSangrado ?? 5) - 1); if (f >= c.inicio && f <= fin && (c.fin || f <= hoyISO())) return 'periodo' }
    if (pred && f > hoyISO()) {
      // próximos 3 ciclos estimados
      for (let k = 0; k < 3; k++) {
        const ini = sumarDias(pred.proximo, k * pred.promedioCiclo)
        if (f >= ini && f <= sumarDias(ini, pred.promedioSangrado - 1)) return 'prevision'
        const ov = sumarDias(ini, -14)
        if (f >= sumarDias(ov, -5) && f <= sumarDias(ov, 1)) return 'fertil'
      }
    }
  }
  const d = deISO(mes)
  const primero = new Date(d.getFullYear(), d.getMonth(), 1)
  const inicioGrilla = sumarDias(aISO(primero), -((primero.getDay() + 6) % 7))
  const celdas = Array.from({ length: 42 }, (_, k) => sumarDias(inicioGrilla, k))
  const cambiarMes = (n: number) => setMes(aISO(new Date(d.getFullYear(), d.getMonth() + n, 1)))

  return (
    <div className="entrar">
      {!tienePin && (
        <Tarjeta className="mt-3 flex items-center gap-3 !bg-lavanda-50 border-lavanda-100">
          <Icono n="candado" c="w-6 h-6 text-lavanda-600 shrink-0" />
          <p className="flex-1 text-sm">Protegé esta sección con un <b>PIN propio de {nombre}</b>. Nadie más de la familia la podrá abrir.</p>
          <Boton variante="lavanda" className="!min-h-[40px] !px-4" onClick={() => setCrearPin(true)}>Crear PIN</Boton>
        </Tarjeta>
      )}
      {etapaActiva && <Tarjeta className="mt-3 !bg-lavanda-50 border-lavanda-100"><p className="text-sm"><b>{etapaActiva.etapa}</b> desde {fechaCorta(etapaActiva.desde)}. {etapaActiva.etapa === 'Embarazo' ? 'Recordá tus controles prenatales en Agenda.' : ''}</p></Tarjeta>}

      <div className="mt-3 grid grid-cols-2 gap-3">
        {enCurso ? (
          <Boton variante="lavanda" className="col-span-2" icono="check" onClick={async () => { await db.ciclos.update(enCurso.id!, { fin: hoyISO() }); toast('Fin del período registrado') }}>Terminó mi período hoy</Boton>
        ) : (
          <Boton variante="lavanda" className="col-span-2" icono="gota" onClick={async () => { await db.ciclos.add({ integranteId, inicio: hoyISO() }); await registrarActividad('Período registrado'); toast('Inicio del período registrado') }}>Empezó mi período hoy</Boton>
        )}
        <Boton variante="borde" onClick={() => setForm({ integranteId, inicio: hoyISO() })}>Registrar otra fecha</Boton>
        <Boton variante="borde" onClick={() => setFormEtapa({ integranteId, etapa: 'Embarazo', desde: hoyISO() })}>Embarazo y etapas</Boton>
      </div>

      {predicciones && pred && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Tarjeta className="!p-3"><p className="text-xs text-piedra-500">Próximo período (estimado)</p><p className="font-extrabold text-lavanda-600">{fechaCorta(pred.proximo)}</p></Tarjeta>
          <Tarjeta className="!p-3"><p className="text-xs text-piedra-500">Ciclo promedio</p><p className="font-extrabold">{pred.promedioCiclo} días</p></Tarjeta>
          <Tarjeta className="!p-3"><p className="text-xs text-piedra-500">Sangrado promedio</p><p className="font-extrabold">{pred.promedioSangrado} días</p></Tarjeta>
        </div>
      )}
      {predicciones && !pred && <p className="mt-4 rounded-2xl bg-white p-3 text-sm text-piedra-600">Registrá al menos dos períodos para ver estimaciones.</p>}

      <Tarjeta className="mt-4 !p-3">
        <div className="mb-2 flex items-center justify-between">
          <button aria-label="Mes anterior" onClick={() => cambiarMes(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-crema-100"><Icono n="atras" c="w-5 h-5" /></button>
          <p className="font-bold capitalize">{nombreMes(d.getMonth())} {d.getFullYear()}</p>
          <button aria-label="Mes siguiente" onClick={() => cambiarMes(1)} className="grid h-10 w-10 place-items-center rounded-full bg-crema-100"><Icono n="adelante" c="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase text-piedra-400">{['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'].map((x) => <span key={x}>{x}</span>)}</div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {celdas.map((f) => {
            const t = tipoDia(f)
            const fuera = deISO(f).getMonth() !== d.getMonth()
            return <span key={f} className={`grid h-10 place-items-center rounded-full text-sm ${t === 'periodo' ? 'bg-coral-400 font-bold text-white' : t === 'prevision' ? 'border-2 border-dashed border-coral-400 text-coral-600' : t === 'fertil' ? 'bg-lavanda-100 text-lavanda-600' : ''} ${f === hoyISO() ? 'ring-2 ring-turquesa-400' : ''} ${fuera ? 'opacity-40' : ''}`}>{deISO(f).getDate()}</span>
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-piedra-600">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-coral-400" />Período registrado</span>
          {predicciones && <><span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full border-2 border-dashed border-coral-400" />Período estimado</span><span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-lavanda-100" />Ventana fértil estimada</span></>}
        </div>
      </Tarjeta>
      {predicciones && <p className="mt-2 rounded-2xl bg-lavanda-50 p-3 text-xs text-lavanda-600"><b>Importante:</b> las fechas son solo estimaciones hechas con tus registros. <b>No sirven como método anticonceptivo</b> ni garantizan cuándo ocurre la ovulación.</p>}
      <label className="mt-3 flex items-center justify-between rounded-2xl bg-white p-4 shadow-suave"><span className="text-sm font-bold">Mostrar estimaciones</span><input type="checkbox" className="h-6 w-6 accent-lavanda-500" checked={!!predicciones} onChange={(e) => setAjuste(`predicciones-${integranteId}`, e.target.checked)} /></label>

      <Seccion titulo="Historial">
        {ciclos.length === 0 ? <p className="rounded-2xl bg-white p-4 text-sm text-piedra-500">Todavía no hay registros.</p> : (
          <div className="space-y-2">
            {[...ciclos].reverse().map((c, k, arr) => {
              const sig = arr[k - 1]
              const largo = sig ? diasEntre(c.inicio, sig.inicio) : undefined
              return (
                <Tarjeta key={c.id} onClick={() => setForm(c)} className="!p-3">
                  <div className="flex items-center justify-between gap-2"><p className="font-bold">{fechaCorta(c.inicio)}{c.fin ? ` → ${fechaCorta(c.fin)}` : ' (en curso)'}</p><EtiquetaDemo demo={c.demo} /></div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.fin && <Insignia clase="bg-coral-50 text-coral-600">{diasEntre(c.inicio, c.fin) + 1} días de sangrado</Insignia>}
                    {largo && <Insignia clase="bg-lavanda-50 text-lavanda-600">Ciclo de {largo} días</Insignia>}
                    {c.intensidad && <Insignia clase="bg-crema-200 text-piedra-700">{c.intensidad}</Insignia>}
                    {c.dolor !== undefined && <Insignia clase="bg-crema-200 text-piedra-700">Dolor {c.dolor}/10</Insignia>}
                    {c.sintomas?.map((s) => <Insignia key={s} clase="bg-crema-200 text-piedra-700">{s}</Insignia>)}
                  </div>
                </Tarjeta>
              )
            })}
          </div>
        )}
      </Seccion>
      {etapas.length > 0 && (
        <Seccion titulo="Etapas">
          <div className="space-y-2">{etapas.map((e) => <Tarjeta key={e.id} onClick={() => setFormEtapa(e)} className="!p-3"><p className="font-bold">{e.etapa}</p><p className="text-xs text-piedra-500">Desde {fechaCorta(e.desde)}{e.hasta ? ` hasta ${fechaCorta(e.hasta)}` : ''}{e.nota ? ` · ${e.nota}` : ''}</p></Tarjeta>)}</div>
        </Seccion>
      )}
      <p className="mt-6 text-xs text-piedra-500">Estos datos no se comparten con otros integrantes y no aparecen en los informes salvo que vos lo elijas.</p>
      {form && <FormCiclo c={form} onCerrar={() => setForm(null)} />}
      {formEtapa && <FormEtapa e={formEtapa} onCerrar={() => setFormEtapa(null)} />}
      {crearPin && <CrearPin integranteId={integranteId} onCerrar={() => setCrearPin(false)} />}
    </div>
  )
}

function FormCiclo({ c, onCerrar }: { c: Ciclo; onCerrar: () => void }) {
  const [d, setD] = useState(c)
  const toast = useToast()
  const confirmar = useConfirmar()
  const set = (k: keyof Ciclo, v: unknown) => setD((x) => ({ ...x, [k]: v }))
  const guardar = async () => {
    if (d.fin && d.fin < d.inicio) return toast('La fecha de fin no puede ser antes del inicio.', 'error')
    if (d.id) await db.ciclos.put(d); else await db.ciclos.add(d)
    toast('Registro guardado'); onCerrar()
  }
  const borrar = async () => { if (await confirmar('¿Borrar este registro?', fechaCorta(d.inicio), 'Borrar')) { await db.ciclos.delete(d.id!); onCerrar() } }
  return (
    <Hoja abierta titulo="Registro del período" onCerrar={onCerrar} pie={<div className="flex gap-3">{d.id && <Boton variante="borde" className="!text-coral-600" onClick={borrar} aria-label="Borrar"><Icono n="basura" c="w-5 h-5" /></Boton>}<Boton variante="lavanda" className="flex-1" onClick={guardar}>Guardar</Boton></div>}>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Inicio"><Entrada type="date" max={hoyISO()} value={d.inicio} onChange={(e) => set('inicio', e.target.value)} /></Campo>
        <Campo etiqueta="Fin"><Entrada type="date" max={hoyISO()} value={d.fin ?? ''} onChange={(e) => set('fin', e.target.value || undefined)} /></Campo>
      </div>
      <Campo etiqueta="Intensidad"><Chips opciones={[{ v: 'leve', t: 'Leve' }, { v: 'moderada', t: 'Moderada' }, { v: 'abundante', t: 'Abundante' }]} valor={d.intensidad} onChange={(v) => set('intensidad', v)} /></Campo>
      <Campo etiqueta={`Dolor: ${d.dolor ?? 0}/10`}><input type="range" min={0} max={10} value={d.dolor ?? 0} onChange={(e) => set('dolor', Number(e.target.value))} className="w-full accent-lavanda-500" /></Campo>
      <Campo etiqueta="Síntomas"><Chips multiple opciones={SINTOMAS.map((s) => ({ v: s, t: s }))} valor={d.sintomas ?? []} onChange={(v) => set('sintomas', v)} /></Campo>
      <Campo etiqueta="Ánimo"><Chips opciones={ANIMO.map((s) => ({ v: s, t: s }))} valor={d.animo} onChange={(v) => set('animo', v)} /></Campo>
      <Campo etiqueta="Observaciones"><Texto rows={2} value={d.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} /></Campo>
    </Hoja>
  )
}

function FormEtapa({ e, onCerrar }: { e: EtapaFemenina; onCerrar: () => void }) {
  const [d, setD] = useState(e)
  const confirmar = useConfirmar()
  const guardar = async () => { if (d.id) await db.etapas.put(d); else await db.etapas.add(d); onCerrar() }
  return (
    <Hoja abierta titulo="Embarazo y etapas" onCerrar={onCerrar} pie={<div className="flex gap-3">{d.id && <Boton variante="borde" className="!text-coral-600" aria-label="Borrar" onClick={async () => { if (await confirmar('¿Borrar esta etapa?', d.etapa, 'Borrar')) { await db.etapas.delete(d.id!); onCerrar() } }}><Icono n="basura" c="w-5 h-5" /></Boton>}<Boton variante="lavanda" className="flex-1" onClick={guardar}>Guardar</Boton></div>}>
      <Campo etiqueta="Etapa"><Selector value={d.etapa} onChange={(x) => setD({ ...d, etapa: x.target.value as EtapaFemenina['etapa'] })}>{['Embarazo', 'Lactancia', 'Posparto', 'Menopausia', 'Tratamiento hormonal'].map((x) => <option key={x}>{x}</option>)}</Selector></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Desde"><Entrada type="date" value={d.desde} onChange={(x) => setD({ ...d, desde: x.target.value })} /></Campo>
        <Campo etiqueta="Hasta (opcional)"><Entrada type="date" value={d.hasta ?? ''} onChange={(x) => setD({ ...d, hasta: x.target.value || undefined })} /></Campo>
      </div>
      <Campo etiqueta="Nota"><Texto rows={2} value={d.nota ?? ''} onChange={(x) => setD({ ...d, nota: x.target.value })} /></Campo>
      <p className="text-xs text-piedra-500">Los controles prenatales y posparto los indica tu profesional: agendalos en la Agenda.</p>
    </Hoja>
  )
}

function CrearPin({ integranteId, onCerrar }: { integranteId: number; onCerrar: () => void }) {
  const [primero, setPrimero] = useState<string>()
  const [error, setError] = useState<string>()
  const toast = useToast()
  return (
    <Hoja abierta titulo="PIN de la sección privada" onCerrar={onCerrar}>
      <TecladoPin titulo={primero ? 'Repetí el PIN' : 'Elegí un PIN'} subtitulo="De 4 a 8 números" error={error} onListo={async (p) => {
        if (!primero) { setPrimero(p); setError(undefined); return }
        if (p !== primero) { setPrimero(undefined); return setError('No coinciden. Empezá de nuevo.') }
        desbloqueadas.add(integranteId); await guardarPinPrivado(integranteId, p); toast('PIN creado'); onCerrar()
      }} />
    </Hoja>
  )
}
