import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ahora, db, eliminarIntegrante, registrarActividad, type Integrante } from '../lib/db'
import { carnetVacunas, controlesDe, cuando, edadMeses, fechaCorta, hoyISO, nombreCompleto, textoEdad, tomasDelDia } from '../lib/salud'
import { Avatar, Boton, Cabecera, Campo, Chips, Contenido, Entrada, EtiquetaDemo, fotoReducida, Hoja, Insignia, ir, limpiarPedido, pide, Seccion, Selector, Tarjeta, Texto, useConfirmar, useToast, Vacio } from '../ui/kit'
import { useIntegrantes } from '../ui/comunes'
import { Icono } from '../ui/iconos'
import { Crecimiento } from './Crecimiento'
import { LineaTiempo } from './LineaTiempo'
import { FichaEmergencia } from './Emergencia'

const RELACIONES = ['Yo', 'Madre', 'Padre', 'Hija', 'Hijo', 'Abuela', 'Abuelo', 'Hermana', 'Hermano', 'Cónyuge', 'Otro familiar', 'Persona dependiente']
const AVATARES_P = ['👩', '👨', '👧', '👦', '👶', '👵', '👴', '🧑', '👩🏽', '👨🏽', '👧🏽', '👦🏽']
const AVATARES_M = ['🐶', '🐱', '🐰', '🐦', '🐢', '🐹', '🐴', '🐟']
const COLORES = ['#6E9E84', '#22A39B', '#9479CF', '#EC7559', '#4F8BC9', '#B08A5B', '#D4A72C']
const GRUPOS = ['', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'No sé']

export function ListaFamilia({ tipo }: { tipo: 'persona' | 'mascota' }) {
  const [verArchivados, setVerArchivados] = useState(false)
  const lista = useIntegrantes(tipo, verArchivados)
  const [form, setForm] = useState(() => { const n = pide('nuevo'); if (n) limpiarPedido(); return n })
  const esM = tipo === 'mascota'
  return (
    <>
      <Cabecera titulo={esM ? 'Mascotas' : 'Mi familia'} subtitulo={esM ? 'Salud de tus animales' : `${lista.filter((i) => !i.archivado).length} integrantes`} color={esM ? 'coral' : 'salvia'}
        accion={<Boton className="!px-4" icono="mas" onClick={() => setForm(true)}>Agregar</Boton>} />
      <Contenido>
        {lista.length === 0 ? (
          <div className="mt-4"><Vacio ilus={esM ? 'mascota' : 'familia'} titulo={esM ? 'Sin mascotas todavía' : 'Tu familia está vacía'} texto={esM ? 'Agregá a tu perro, gato u otra mascota para llevar sus vacunas, desparasitaciones y controles.' : 'Agregá a cada integrante para organizar su salud.'} accion={<Boton icono="mas" onClick={() => setForm(true)}>{esM ? 'Agregar mascota' : 'Agregar integrante'}</Boton>} /></div>
        ) : (
          <div className="entrar mt-3 grid gap-3 sm:grid-cols-2">
            {lista.map((i) => <TarjetaIntegrante key={i.id} i={i} />)}
          </div>
        )}
        <button onClick={() => setVerArchivados(!verArchivados)} className="mt-6 text-sm font-bold text-piedra-500">{verArchivados ? 'Ocultar archivados' : 'Ver archivados'}</button>
      </Contenido>
      <FormIntegrante abierta={form} tipo={tipo} onCerrar={() => setForm(false)} />
    </>
  )
}

function TarjetaIntegrante({ i }: { i: Integrante }) {
  const datos = useLiveQuery(async () => {
    const [meds, eventos] = await Promise.all([
      db.medicamentos.where('integranteId').equals(i.id!).filter((m) => m.activo).count(),
      db.eventos.where('integranteId').equals(i.id!).filter((e) => e.estado === 'programado' && e.fecha >= hoyISO()).sortBy('fecha'),
    ])
    return { meds, prox: eventos[0] }
  }, [i.id])
  return (
    <Tarjeta onClick={() => ir(`integrante/${i.id}`)} className={`flex items-center gap-3 ${i.archivado ? 'opacity-60' : ''}`}>
      <Avatar i={i} t="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><p className="truncate text-lg font-bold">{nombreCompleto(i)}</p><EtiquetaDemo demo={i.demo} /></div>
        <p className="text-sm text-piedra-500">{i.relacion} · {textoEdad(i.fechaNacimiento)}{i.especie ? ` · ${i.especie}` : ''}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {!!datos?.meds && <Insignia clase="bg-turquesa-50 text-turquesa-700">💊 {datos.meds} activos</Insignia>}
          {datos?.prox && <Insignia clase="bg-cielo-50 text-cielo-600">📅 {cuando(datos.prox.fecha)}</Insignia>}
          {i.alergias && <Insignia clase="bg-coral-50 text-coral-600">⚠️ Alergias</Insignia>}
          {i.archivado && <Insignia clase="bg-crema-200 text-piedra-600">Archivado</Insignia>}
        </div>
      </div>
      <Icono n="adelante" c="w-5 h-5 text-piedra-400" />
    </Tarjeta>
  )
}

export function FormIntegrante({ abierta, tipo, onCerrar, editar }: { abierta: boolean; tipo: 'persona' | 'mascota'; onCerrar: () => void; editar?: Integrante }) {
  const vacio: Integrante = { tipo, nombre: '', relacion: tipo === 'mascota' ? 'Mascota' : '', avatar: tipo === 'mascota' ? '🐶' : '🧑', color: COLORES[Math.floor(Math.random() * COLORES.length)], creado: ahora() }
  const [d, setD] = useState<Integrante>(editar ?? vacio)
  const [paso, setPaso] = useState(0)
  const [error, setError] = useState<string>()
  const toast = useToast()
  const esM = tipo === 'mascota'
  const pasos = esM ? ['Datos', 'Salud'] : ['Datos', 'Salud', 'Contactos']
  const set = (k: keyof Integrante, v: unknown) => setD((x) => ({ ...x, [k]: v }))
  const cerrar = () => { setPaso(0); setD(editar ?? vacio); setError(undefined); onCerrar() }

  const guardar = async () => {
    if (!d.nombre.trim()) { setPaso(0); return setError('Escribí el nombre.') }
    if (d.fechaNacimiento && d.fechaNacimiento > hoyISO()) { setPaso(0); return setError('La fecha de nacimiento no puede ser futura.') }
    const limpio = { ...d, nombre: d.nombre.trim(), apellido: d.apellido?.trim() }
    if (editar?.id) { await db.integrantes.put(limpio); await registrarActividad('Perfil editado', limpio.nombre) }
    else { const id = await db.integrantes.add(limpio); await registrarActividad('Integrante agregado', limpio.nombre); ir(`integrante/${id}`) }
    toast(editar ? 'Cambios guardados' : `${limpio.nombre} se agregó a la familia`)
    cerrar()
  }

  return (
    <Hoja abierta={abierta} titulo={editar ? `Editar a ${editar.nombre}` : esM ? 'Nueva mascota' : 'Nuevo integrante'} onCerrar={cerrar}
      pie={
        <div className="space-y-3">
          <div className="flex justify-center gap-2">{pasos.map((p, i) => <button key={p} onClick={() => setPaso(i)} className={`rounded-full px-3 py-1 text-xs font-bold ${i === paso ? 'bg-turquesa-500 text-white' : 'bg-crema-200 text-piedra-600'}`}>{i + 1}. {p}</button>)}</div>
          <div className="grid grid-cols-2 gap-3">
            {paso > 0 ? <Boton variante="suave" onClick={() => setPaso(paso - 1)}>Atrás</Boton> : <Boton variante="suave" onClick={cerrar}>Cancelar</Boton>}
            {paso < pasos.length - 1 ? <Boton onClick={() => { if (!d.nombre.trim()) return setError('Escribí el nombre.'); setError(undefined); setPaso(paso + 1) }}>Siguiente</Boton> : <Boton onClick={guardar}>Guardar</Boton>}
          </div>
          {paso < pasos.length - 1 && d.nombre.trim() && <button onClick={guardar} className="w-full text-sm font-bold text-turquesa-600">Guardar ahora y completar después</button>}
        </div>
      }>
      {paso === 0 && (
        <>
          <div className="flex items-center gap-4">
            <Avatar i={d} t="xl" />
            <div className="flex-1 space-y-2">
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-2xl bg-salvia-100 px-4 font-bold text-salvia-800"><Icono n="subir" c="w-5 h-5" />Foto<input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) set('avatar', await fotoReducida(f)) }} /></label>
              <div className="flex flex-wrap gap-1">{(esM ? AVATARES_M : AVATARES_P).map((a) => <button key={a} type="button" onClick={() => set('avatar', a)} className={`h-9 w-9 rounded-full text-xl ${d.avatar === a ? 'bg-turquesa-100 ring-2 ring-turquesa-400' : 'bg-white'}`}>{a}</button>)}</div>
            </div>
          </div>
          <div className="flex gap-2">{COLORES.map((c) => <button key={c} type="button" aria-label="Color" onClick={() => set('color', c)} className={`h-8 w-8 rounded-full ${d.color === c ? 'ring-4 ring-offset-2 ring-turquesa-300' : ''}`} style={{ background: c }} />)}</div>
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Nombre *" error={error}><Entrada value={d.nombre} onChange={(e) => set('nombre', e.target.value)} autoFocus /></Campo>
            {!esM && <Campo etiqueta="Apellido"><Entrada value={d.apellido ?? ''} onChange={(e) => set('apellido', e.target.value)} /></Campo>}
            {esM && <Campo etiqueta="Especie"><Selector value={d.especie ?? ''} onChange={(e) => set('especie', e.target.value)}><option value="">Elegí</option><option>Perro</option><option>Gato</option><option>Otra</option></Selector></Campo>}
          </div>
          {!esM && <Campo etiqueta="Relación familiar"><Selector value={d.relacion} onChange={(e) => set('relacion', e.target.value)}><option value="">Elegí</option>{RELACIONES.map((r) => <option key={r}>{r}</option>)}</Selector></Campo>}
          {esM && <Campo etiqueta="Raza"><Entrada value={d.raza ?? ''} onChange={(e) => set('raza', e.target.value)} /></Campo>}
          <Campo etiqueta={esM ? 'Fecha de nacimiento (aproximada)' : 'Fecha de nacimiento'} ayuda={d.fechaNacimiento ? `Edad: ${textoEdad(d.fechaNacimiento)}` : 'Con esta fecha se calculan vacunas y controles.'}><Entrada type="date" max={hoyISO()} value={d.fechaNacimiento ?? ''} onChange={(e) => set('fechaNacimiento', e.target.value || undefined)} /></Campo>
          <Campo etiqueta="Sexo" ayuda={esM ? undefined : 'Se usa solo para mostrar controles de salud que correspondan.'}><Chips opciones={esM ? [{ v: 'F', t: 'Hembra' }, { v: 'M', t: 'Macho' }] : [{ v: 'F', t: 'Femenino' }, { v: 'M', t: 'Masculino' }, { v: 'X', t: 'No indicar' }]} valor={d.sexo} onChange={(v) => set('sexo', v)} /></Campo>
        </>
      )}
      {paso === 1 && (
        <>
          {esM ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Peso (kg)"><Entrada type="number" step="0.1" min="0" value={d.peso ?? ''} onChange={(e) => set('peso', e.target.value ? Number(e.target.value) : undefined)} /></Campo>
                <Campo etiqueta="Microchip / identificación"><Entrada value={d.microchip ?? ''} onChange={(e) => set('microchip', e.target.value)} /></Campo>
              </div>
              <Campo etiqueta="Veterinario/a"><Entrada value={d.veterinario ?? ''} onChange={(e) => set('veterinario', e.target.value)} /></Campo>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="Grupo sanguíneo"><Selector value={d.grupoSanguineo ?? ''} onChange={(e) => set('grupoSanguineo', e.target.value)}>{GRUPOS.map((g) => <option key={g} value={g}>{g || 'Sin cargar'}</option>)}</Selector></Campo>
              <Campo etiqueta="Seguro médico"><Entrada value={d.seguro ?? ''} onChange={(e) => set('seguro', e.target.value)} placeholder="Opcional" /></Campo>
            </div>
          )}
          <Campo etiqueta="Alergias"><Texto rows={2} value={d.alergias ?? ''} onChange={(e) => set('alergias', e.target.value)} placeholder="Ej.: penicilina" /></Campo>
          {!esM && <Campo etiqueta="Enfermedades crónicas"><Texto rows={2} value={d.cronicas ?? ''} onChange={(e) => set('cronicas', e.target.value)} placeholder="Ej.: diabetes, hipertensión, asma" /></Campo>}
          <Campo etiqueta="Antecedentes médicos"><Texto rows={2} value={d.antecedentes ?? ''} onChange={(e) => set('antecedentes', e.target.value)} /></Campo>
          {!esM && (
            <div className="space-y-2 rounded-2xl bg-white p-3">
              <p className="text-sm font-bold text-piedra-700">Antecedentes familiares (para que el médico defina controles)</p>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-turquesa-500" checked={!!d.antecedenteFamiliarMama} onChange={(e) => set('antecedenteFamiliarMama', e.target.checked)} />Cáncer de mama en familiares directos</label>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-turquesa-500" checked={!!d.antecedenteFamiliarProstata} onChange={(e) => set('antecedenteFamiliarProstata', e.target.checked)} />Cáncer de próstata en familiares directos</label>
            </div>
          )}
        </>
      )}
      {paso === 2 && !esM && (
        <>
          <Campo etiqueta="Teléfono"><Entrada type="tel" value={d.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} /></Campo>
          <Campo etiqueta="Médico de cabecera"><Entrada value={d.medicoCabecera ?? ''} onChange={(e) => set('medicoCabecera', e.target.value)} /></Campo>
          <Campo etiqueta="Centro médico habitual"><Entrada value={d.centroMedico ?? ''} onChange={(e) => set('centroMedico', e.target.value)} /></Campo>
          <Campo etiqueta="Contacto de emergencia" ayuda="Nombre y teléfono"><Entrada value={d.contactoEmergencia ?? ''} onChange={(e) => set('contactoEmergencia', e.target.value)} /></Campo>
          <Campo etiqueta="Documento (opcional)" ayuda="Se muestra oculto en el perfil."><Entrada value={d.documento ?? ''} onChange={(e) => set('documento', e.target.value)} autoComplete="off" /></Campo>
        </>
      )}
    </Hoja>
  )
}

export function Perfil({ id, pestana = 'resumen' }: { id: number; pestana?: string }) {
  const i = useLiveQuery(() => db.integrantes.get(id), [id])
  const [editar, setEditar] = useState(false)
  const [verDoc, setVerDoc] = useState(false)
  const confirmar = useConfirmar()
  const toast = useToast()
  const resumen = useLiveQuery(async () => {
    if (!i) return
    const [meds, tomas, eventos, esquema, vacunas, recs, controles, docs] = await Promise.all([
      db.medicamentos.where('integranteId').equals(id).filter((m) => m.activo).toArray(),
      db.tomas.where('fecha').equals(hoyISO()).toArray(),
      db.eventos.where('integranteId').equals(id).filter((e) => e.estado === 'programado' && e.fecha >= hoyISO()).sortBy('fecha'),
      db.esquemaVacunas.toArray(), db.vacunas.where('integranteId').equals(id).toArray(),
      db.recomendaciones.toArray(), db.controles.where('integranteId').equals(id).toArray(),
      db.documentos.where('integranteId').equals(id).reverse().sortBy('fechaRealizacion'),
    ])
    const carnet = i.tipo === 'persona' ? carnetVacunas(i, esquema, vacunas) : []
    const ctl = controlesDe(i, recs, controles)
    return {
      meds, tomasHoy: tomasDelDia(meds, tomas).filter((t) => !t.registro).length, eventos,
      vacPend: carnet.filter((f) => f.estado === 'atrasada' || f.estado === 'proxima').length,
      vacTotal: carnet.length, vacOk: carnet.filter((f) => f.estado === 'aplicada').length,
      ctlPend: ctl.filter((c) => c.estado === 'vencido' || c.estado === 'proximo' || c.estado === 'sin registro').length,
      docs: docs.slice(0, 3),
    }
  }, [i])
  if (i === undefined) return null
  if (!i) return <><Cabecera titulo="No encontrado" atras /><Contenido><Vacio titulo="Este perfil no existe" texto="Puede que se haya eliminado." /></Contenido></>
  const esM = i.tipo === 'mascota'
  const mujer = i.sexo === 'F' && !esM && (edadMeses(i.fechaNacimiento) ?? 200) >= 9 * 12
  const nino = !esM && (edadMeses(i.fechaNacimiento) ?? 999) < 18 * 12
  const pestanas = [['resumen', 'Resumen'], ['emergencia', 'Emergencia'], ['linea', 'Línea de tiempo'], ...(nino || esM ? [['crecimiento', esM ? 'Peso' : 'Crecimiento']] : [])]

  const archivar = async () => {
    await db.integrantes.update(id, { archivado: !i.archivado })
    await registrarActividad(i.archivado ? 'Perfil reactivado' : 'Perfil archivado', i.nombre)
    toast(i.archivado ? 'Perfil reactivado' : 'Perfil archivado. Lo ves en "Ver archivados".')
  }
  const eliminar = async () => {
    if (!(await confirmar(`¿Eliminar a ${i.nombre}?`, 'Se borran su historia, documentos, vacunas, remedios y citas. No se puede deshacer.', 'Eliminar'))) return
    await eliminarIntegrante(id)
    toast('Perfil eliminado')
    ir(esM ? 'mascotas' : 'familia')
  }

  const modulos = [
    { t: 'Historia clínica', i: 'historia', r: `historia/${id}`, c: 'bg-cielo-100 text-cielo-600', n: undefined },
    { t: 'Documentos', i: 'informe', r: `documentos/${id}`, c: 'bg-cielo-100 text-cielo-600' },
    { t: 'Medicamentos', i: 'pastilla', r: `medicamentos?de=${id}`, c: 'bg-turquesa-100 text-turquesa-700' },
    { t: esM ? 'Vacunas' : 'Carnet de vacunas', i: 'vacuna', r: `vacunas/${id}`, c: 'bg-turquesa-100 text-turquesa-700' },
    ...(!esM ? [{ t: 'Prevención', i: 'escudo', r: `prevencion/${id}`, c: 'bg-salvia-100 text-salvia-700' }] : []),
    ...(mujer ? [{ t: 'Salud femenina', i: 'flor', r: `femenina/${id}`, c: 'bg-lavanda-100 text-lavanda-600' }] : []),
    { t: 'Agenda', i: 'agenda', r: `agenda?de=${id}`, c: 'bg-coral-100 text-coral-600' },
    { t: 'Informe PDF', i: 'imprimir', r: `informes/${id}`, c: 'bg-cielo-100 text-cielo-600' },
  ]

  return (
    <>
      <header className="bg-gradient-to-b to-crema-100 px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))] no-imprimir" style={{ backgroundImage: `linear-gradient(to bottom, ${i.color ?? '#6E9E84'}33, #FBF8F3)` }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <button onClick={() => history.back()} aria-label="Volver" className="grid h-11 w-11 place-items-center rounded-full bg-white/80 shadow-suave"><Icono n="atras" c="w-5 h-5" /></button>
            <button onClick={() => setEditar(true)} className="inline-flex h-11 items-center gap-2 rounded-full bg-white/80 px-4 font-bold text-piedra-700 shadow-suave"><Icono n="editar" c="w-4 h-4" />Editar</button>
          </div>
          <div className="mt-2 flex flex-col items-center text-center">
            <Avatar i={i} t="xl" />
            <h1 className="mt-2 font-display text-2xl">{nombreCompleto(i)}</h1>
            <p className="text-piedra-600">{i.relacion} · {textoEdad(i.fechaNacimiento)}{i.raza ? ` · ${i.raza}` : ''}</p>
            <div className="mt-1 flex gap-2"><EtiquetaDemo demo={i.demo} />{i.archivado && <Insignia clase="bg-crema-200 text-piedra-600">Archivado</Insignia>}</div>
          </div>
        </div>
      </header>
      <Contenido>
        <div className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-imprimir" role="tablist">
          {pestanas.map(([k, t]) => <a key={k} role="tab" aria-selected={pestana === k} href={`#/integrante/${id}/${k}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${pestana === k ? 'bg-piedra-800 text-white' : 'bg-white text-piedra-600 shadow-suave'}`}>{t}</a>)}
        </div>

        {pestana === 'resumen' && resumen && (
          <div className="entrar">
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Remedios activos', resumen.meds.length, 'pastilla', 'text-turquesa-600'],
                ['Próximas citas', resumen.eventos.length, 'agenda', 'text-cielo-600'],
                [esM ? 'Vacunas registradas' : 'Vacunas pendientes', esM ? '—' : resumen.vacPend, 'vacuna', 'text-turquesa-600'],
                ['Controles a revisar', esM ? '—' : resumen.ctlPend, 'escudo', 'text-coral-600'],
              ].map(([t, n, ic, c]) => (
                <Tarjeta key={t as string} className="!p-3"><Icono n={ic as string} c={`w-6 h-6 ${c}`} /><p className="mt-1 text-2xl font-extrabold">{n}</p><p className="text-xs text-piedra-500">{t}</p></Tarjeta>
              ))}
            </div>
            {(i.alergias || i.cronicas) && (
              <Tarjeta className="mt-3 !bg-coral-50 border-coral-100">
                {i.alergias && <p className="text-sm"><b className="text-coral-600">Alergias:</b> {i.alergias}</p>}
                {i.cronicas && <p className="mt-1 text-sm"><b className="text-coral-600">Enfermedades crónicas:</b> {i.cronicas}</p>}
              </Tarjeta>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {modulos.map((m) => (
                <a key={m.t} href={`#/${m.r}`} className="flex items-center gap-2 rounded-2xl bg-white p-3 text-sm font-bold shadow-suave border border-crema-200">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${m.c}`}><Icono n={m.i} c="w-5 h-5" /></span>{m.t}
                </a>
              ))}
            </div>
            {resumen.eventos.length > 0 && (
              <Seccion titulo="Próximas citas">
                <div className="space-y-2">{resumen.eventos.slice(0, 3).map((e) => <Tarjeta key={e.id} onClick={() => ir(`agenda/${e.id}`)} className="!p-3"><p className="font-bold">{e.categoria}{e.especialidad ? ` · ${e.especialidad}` : ''}</p><p className="text-sm text-piedra-500">{fechaCorta(e.fecha)} {e.hora} · {cuando(e.fecha)}</p></Tarjeta>)}</div>
              </Seccion>
            )}
            {resumen.docs.length > 0 && (
              <Seccion titulo="Últimos estudios">
                <div className="space-y-2">{resumen.docs.map((d) => <Tarjeta key={d.id} onClick={() => ir(`documentos/${id}`)} className="!p-3"><p className="font-bold">{d.nombre}</p><p className="text-sm text-piedra-500">{d.categoria} · {fechaCorta(d.fechaRealizacion)}</p></Tarjeta>)}</div>
              </Seccion>
            )}
            <Seccion titulo="Datos">
              <Tarjeta className="space-y-2 text-sm">
                {([
                  ['Fecha de nacimiento', fechaCorta(i.fechaNacimiento)], ['Grupo sanguíneo', i.grupoSanguineo], ['Especie', i.especie], ['Peso', i.peso ? `${i.peso} kg` : undefined], ['Microchip', i.microchip], ['Veterinario/a', i.veterinario],
                  ['Teléfono', i.telefono], ['Médico de cabecera', i.medicoCabecera], ['Centro médico', i.centroMedico], ['Seguro', i.seguro], ['Contacto de emergencia', i.contactoEmergencia], ['Antecedentes', i.antecedentes],
                ] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-b border-crema-200 pb-2 last:border-0"><span className="text-piedra-500">{k}</span><span className="text-right font-bold">{v}</span></div>)}
                {i.documento && <div className="flex justify-between gap-3"><span className="text-piedra-500">Documento</span><button onClick={() => setVerDoc(!verDoc)} className="font-bold text-turquesa-600">{verDoc ? i.documento : '•••••• Ver'}</button></div>}
              </Tarjeta>
            </Seccion>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Boton variante="borde" icono="archivo" onClick={archivar}>{i.archivado ? 'Reactivar' : 'Archivar'}</Boton>
              <Boton variante="borde" icono="basura" className="!text-coral-600 !border-coral-100" onClick={eliminar}>Eliminar</Boton>
            </div>
          </div>
        )}
        {pestana === 'emergencia' && <FichaEmergencia i={i} />}
        {pestana === 'linea' && <LineaTiempo id={id} />}
        {pestana === 'crecimiento' && <Crecimiento i={i} />}
      </Contenido>
      {editar && <FormIntegrante abierta tipo={i.tipo} editar={i} onCerrar={() => setEditar(false)} />}
    </>
  )
}
