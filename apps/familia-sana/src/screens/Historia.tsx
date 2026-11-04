import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ahora, CATEGORIAS_HISTORIA, db, registrarActividad, type RegistroClinico } from '../lib/db'
import { fechaCorta, hoyISO } from '../lib/salud'
import { Boton, Cabecera, Campo, Contenido, Entrada, EtiquetaDemo, Hoja, Insignia, Selector, Tarjeta, Texto, useConfirmar, useToast, Vacio } from '../ui/kit'
import { ElegirIntegrante, TIPOS_PERMITIDOS, useIntegrantes, validarArchivo } from '../ui/comunes'
import { Icono } from '../ui/iconos'

const VET = ['Control veterinario', 'Antiparasitario interno', 'Antiparasitario externo', 'Castración', 'Cirugías', 'Alergias', 'Alimentación', 'Enfermedades diagnosticadas', 'Tratamientos actuales', 'Observaciones médicas']
const HUMANO = CATEGORIAS_HISTORIA.filter((c) => !['Control veterinario', 'Antiparasitario interno', 'Antiparasitario externo', 'Castración', 'Alimentación'].includes(c))

export default function Historia({ id }: { id?: number }) {
  const familia = useIntegrantes()
  const actual = id ?? familia[0]?.id
  const persona = familia.find((i) => i.id === actual)
  const [cat, setCat] = useState<string>()
  const [buscar, setBuscar] = useState('')
  const [form, setForm] = useState<RegistroClinico | null>(null)
  const registros = useLiveQuery(() => (actual ? db.registros.where('integranteId').equals(actual).reverse().sortBy('fecha') : []), [actual], [])
  const cats = persona?.tipo === 'mascota' ? VET : HUMANO
  const lista = registros.filter((r) => (!cat || r.categoria === cat) && (!buscar || `${r.titulo} ${r.descripcion} ${r.diagnostico} ${r.medico}`.toLowerCase().includes(buscar.toLowerCase())))
  const nuevo = (): RegistroClinico => ({ integranteId: actual!, categoria: cat ?? cats[0], fecha: hoyISO(), titulo: '', creado: ahora() })

  return (
    <>
      <Cabecera titulo="Historia clínica" subtitulo={persona ? `De ${persona.nombre}` : undefined} color="cielo" accion={actual && <Boton className="!px-4" icono="mas" onClick={() => setForm(nuevo())}>Nuevo</Boton>} />
      <Contenido>
        {familia.length === 0 ? <Vacio titulo="Primero agregá a tu familia" texto="Cada integrante tiene su propia historia clínica." accion={<Boton onClick={() => (location.hash = '#/familia?nuevo')}>Agregar integrante</Boton>} /> : (
          <>
            <ElegirIntegrante lista={familia} valor={actual} onChange={(v) => { setCat(undefined); location.hash = `#/historia/${v}` }} />
            <div className="relative mt-3"><Icono n="buscar" c="absolute left-4 top-3.5 w-5 h-5 text-piedra-400" /><Entrada className="!pl-11" placeholder="Buscar en la historia" value={buscar} onChange={(e) => setBuscar(e.target.value)} /></div>
            <div className="sin-barra -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
              <button onClick={() => setCat(undefined)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${!cat ? 'bg-cielo-500 text-white' : 'bg-white text-piedra-600 shadow-suave'}`}>Todo ({registros.length})</button>
              {cats.map((c) => { const n = registros.filter((r) => r.categoria === c).length; return <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${cat === c ? 'bg-cielo-500 text-white' : 'bg-white text-piedra-600 shadow-suave'}`}>{c}{n ? ` (${n})` : ''}</button> })}
            </div>
            <div className="entrar mt-4 space-y-3">
              {lista.length === 0 ? <Vacio ilus="documento" titulo="Sin registros" texto={cat ? `No hay registros en "${cat}".` : 'Registrá consultas, diagnósticos informados, cirugías, alergias y más.'} accion={<Boton icono="mas" onClick={() => setForm(nuevo())}>Agregar registro</Boton>} /> :
                lista.map((r) => (
                  <Tarjeta key={r.id} onClick={() => setForm(r)}>
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cielo-100 text-cielo-600"><Icono n="historia" c="w-5 h-5" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{r.titulo}</p><EtiquetaDemo demo={r.demo} /></div>
                        <p className="text-xs text-piedra-500">{fechaCorta(r.fecha)} · {r.categoria}{r.especialidad ? ` · ${r.especialidad}` : ''}</p>
                        {r.descripcion && <p className="mt-1 line-clamp-2 text-sm text-piedra-700">{r.descripcion}</p>}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {r.medico && <Insignia clase="bg-crema-200 text-piedra-700">{r.medico}</Insignia>}
                          {r.proximaFecha && <Insignia clase="bg-turquesa-50 text-turquesa-700">Próxima: {fechaCorta(r.proximaFecha)}</Insignia>}
                          {!!r.adjuntos?.length && <Insignia clase="bg-cielo-50 text-cielo-600">📎 {r.adjuntos.length}</Insignia>}
                        </div>
                      </div>
                    </div>
                  </Tarjeta>
                ))}
            </div>
            <p className="mt-6 text-center text-xs text-piedra-500">Familia Sana no hace diagnósticos. Registrá lo que informó tu profesional.</p>
          </>
        )}
      </Contenido>
      {form && <FormRegistro r={form} cats={cats} onCerrar={() => setForm(null)} />}
    </>
  )
}

function FormRegistro({ r, cats, onCerrar }: { r: RegistroClinico; cats: readonly string[]; onCerrar: () => void }) {
  const [d, setD] = useState(r)
  const [archivo, setArchivo] = useState<File>()
  const [error, setError] = useState<string>()
  const toast = useToast()
  const confirmar = useConfirmar()
  const adjuntos = useLiveQuery(() => (d.adjuntos?.length ? db.documentos.bulkGet(d.adjuntos) : []), [d.adjuntos], [])
  const set = (k: keyof RegistroClinico, v: unknown) => setD((x) => ({ ...x, [k]: v }))
  const guardar = async () => {
    if (!d.titulo.trim()) return setError('Escribí un título corto.')
    let adj = d.adjuntos ?? []
    if (archivo) {
      const docId = await db.documentos.add({ integranteId: d.integranteId, nombre: `${d.titulo} (adjunto)`, categoria: 'Informe médico', fechaRealizacion: d.fecha, laboratorio: d.medico, archivo, archivoNombre: archivo.name, archivoTipo: archivo.type, creado: ahora() })
      adj = [...adj, docId]
    }
    const final = { ...d, titulo: d.titulo.trim(), adjuntos: adj }
    if (d.id) await db.registros.put(final); else await db.registros.add(final)
    await registrarActividad(d.id ? 'Registro clínico editado' : 'Registro clínico agregado', final.titulo)
    toast('Registro guardado'); onCerrar()
  }
  const borrar = async () => {
    if (!(await confirmar('¿Borrar este registro?', 'Los archivos adjuntos quedan en Documentos.', 'Borrar'))) return
    await db.registros.delete(d.id!); await registrarActividad('Registro clínico borrado', d.titulo); toast('Registro borrado'); onCerrar()
  }
  return (
    <Hoja abierta titulo={d.id ? 'Editar registro' : 'Nuevo registro'} onCerrar={onCerrar} pie={<div className="flex gap-3">{d.id && <Boton variante="borde" className="!text-coral-600" onClick={borrar} aria-label="Borrar"><Icono n="basura" c="w-5 h-5" /></Boton>}<Boton className="flex-1" onClick={guardar}>Guardar</Boton></div>}>
      <Campo etiqueta="Categoría"><Selector value={d.categoria} onChange={(e) => set('categoria', e.target.value)}>{cats.map((c) => <option key={c}>{c}</option>)}</Selector></Campo>
      <Campo etiqueta="Título *" error={error}><Entrada value={d.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ej.: Consulta por dolor de garganta" /></Campo>
      <Campo etiqueta="Fecha"><Entrada type="date" value={d.fecha} onChange={(e) => set('fecha', e.target.value)} /></Campo>
      <Campo etiqueta="Descripción"><Texto value={d.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} /></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Profesional"><Entrada value={d.medico ?? ''} onChange={(e) => set('medico', e.target.value)} /></Campo>
        <Campo etiqueta="Especialidad"><Entrada value={d.especialidad ?? ''} onChange={(e) => set('especialidad', e.target.value)} /></Campo>
      </div>
      <Campo etiqueta="Centro asistencial"><Entrada value={d.centro ?? ''} onChange={(e) => set('centro', e.target.value)} /></Campo>
      <Campo etiqueta="Diagnóstico informado por el profesional"><Texto rows={2} value={d.diagnostico ?? ''} onChange={(e) => set('diagnostico', e.target.value)} /></Campo>
      <Campo etiqueta="Tratamiento indicado"><Texto rows={2} value={d.tratamiento ?? ''} onChange={(e) => set('tratamiento', e.target.value)} /></Campo>
      <Campo etiqueta="Observaciones"><Texto rows={2} value={d.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} /></Campo>
      <Campo etiqueta="Próxima fecha indicada (opcional)" ayuda="Por ejemplo, la próxima desparasitación o el próximo control. Te avisamos antes."><Entrada type="date" value={d.proximaFecha ?? ''} onChange={(e) => set('proximaFecha', e.target.value || undefined)} /></Campo>
      <Campo etiqueta="Adjuntar archivo (PDF o foto)">
        <input type="file" accept={TIPOS_PERMITIDOS} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const err = validarArchivo(f); if (err) { toast(err, 'error'); e.target.value = '' } else setArchivo(f) }} className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-salvia-100 file:px-4 file:py-2 file:font-bold file:text-salvia-800" />
      </Campo>
      {adjuntos.filter(Boolean).map((a) => <p key={a!.id} className="text-sm">📎 <a className="font-bold text-turquesa-600" href={`#/documentos/${a!.integranteId}?ver=${a!.id}`}>{a!.nombre}</a></p>)}
    </Hoja>
  )
}
