import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ahora, CATEGORIAS_DOCUMENTO, db, registrarActividad, TIPOS_MEDICION, type Documento, type Medicion } from '../lib/db'
import { deISO, fechaCorta, hoyISO, MESES_CORTOS } from '../lib/salud'
import { Avatar, Boton, Cabecera, Campo, Contenido, Entrada, EtiquetaDemo, GraficoLinea, Hoja, Insignia, limpiarPedido, param, pide, Seccion, Selector, Tarjeta, Texto, useConfirmar, useToast, Vacio } from '../ui/kit'
import { ElegirIntegrante, TIPOS_PERMITIDOS, useIntegrantes, validarArchivo, VistaArchivo } from '../ui/comunes'
import { Icono } from '../ui/iconos'

export default function Documentos({ id }: { id?: number }) {
  const familia = useIntegrantes()
  const [quien, setQuien] = useState<number | undefined>(id)
  const [cat, setCat] = useState('')
  const [buscar, setBuscar] = useState('')
  const [vista, setVista] = useState<'lista' | 'galeria' | 'valores'>(() => (pide('valor') ? 'valores' : 'lista'))
  const [form, setForm] = useState<Documento | null>(null)
  const [ver, setVer] = useState<Documento | null>(null)
  const [formValor, setFormValor] = useState(() => pide('valor'))
  const docs = useLiveQuery(() => db.documentos.orderBy('fechaRealizacion').reverse().toArray(), [], [])
  const nombre = new Map(familia.map((i) => [i.id!, i]))
  const lista = docs.filter((d) => nombre.has(d.integranteId) && (!quien || d.integranteId === quien) && (!cat || d.categoria === cat) && (!buscar || `${d.nombre} ${d.laboratorio} ${d.fechaRealizacion}`.toLowerCase().includes(buscar.toLowerCase())))
  const nuevo = (): Documento => ({ integranteId: quien ?? familia[0]?.id ?? 0, nombre: '', categoria: 'Análisis de sangre', fechaRealizacion: hoyISO(), creado: ahora() })

  useEffect(() => {
    if (pide('nuevo') && familia.length && !form) { setForm(nuevo()); limpiarPedido() }
    const v = param('ver'); if (v) db.documentos.get(Number(v)).then((d) => d && setVer(d))
    if (pide('valor')) limpiarPedido()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familia.length])

  // agrupar por año y mes (historial cronológico)
  const grupos = new Map<string, Documento[]>()
  for (const d of lista) { const k = d.fechaRealizacion?.slice(0, 7) ?? 'Sin fecha'; grupos.set(k, [...(grupos.get(k) ?? []), d]) }
  const tituloMes = (k: string) => (k === 'Sin fecha' ? k : `${MESES_CORTOS[Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`)

  return (
    <>
      <Cabecera titulo="Análisis y documentos" subtitulo="Estudios, informes y recetas" color="cielo" accion={familia.length > 0 && <Boton className="!px-4" icono="subir" onClick={() => setForm(nuevo())}>Subir</Boton>} />
      <Contenido>
        {familia.length === 0 ? <Vacio ilus="documento" titulo="Primero agregá a tu familia" texto="Cada documento se guarda en el perfil de un integrante." /> : (
          <>
            <ElegirIntegrante lista={familia} valor={quien} onChange={setQuien} todos />
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-crema-200 p-1 text-sm font-bold">
              {([['lista', 'Lista'], ['galeria', 'Galería'], ['valores', 'Valores']] as const).map(([k, t]) => <button key={k} onClick={() => setVista(k)} className={`rounded-xl py-2 ${vista === k ? 'bg-white text-piedra-800 shadow-suave' : 'text-piedra-600'}`}>{t}</button>)}
            </div>
            {vista !== 'valores' && (
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <div className="relative"><Icono n="buscar" c="absolute left-4 top-3.5 w-5 h-5 text-piedra-400" /><Entrada className="!pl-11" placeholder="Buscar por nombre o fecha" value={buscar} onChange={(e) => setBuscar(e.target.value)} /></div>
                <Selector className="!w-auto" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoría"><option value="">Todas</option>{CATEGORIAS_DOCUMENTO.map((c) => <option key={c}>{c}</option>)}</Selector>
              </div>
            )}

            {vista === 'lista' && (lista.length === 0 ? <div className="mt-4"><Vacio ilus="documento" titulo="Sin documentos" texto="Subí análisis, ecografías, recetas o informes en PDF o foto." accion={<Boton icono="subir" onClick={() => setForm(nuevo())}>Subir documento</Boton>} /></div> : (
              [...grupos].map(([k, ds]) => (
                <Seccion key={k} titulo={tituloMes(k)}>
                  <div className="space-y-2">{ds.map((d) => (
                    <Tarjeta key={d.id} onClick={() => setVer(d)} className="flex items-center gap-3 !p-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cielo-100 text-cielo-600">{d.archivoTipo?.startsWith('image/') ? '🖼️' : d.archivo ? '📄' : <Icono n="informe" c="w-5 h-5" />}</span>
                      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-bold">{d.nombre}</p><EtiquetaDemo demo={d.demo} /></div><p className="truncate text-xs text-piedra-500">{d.categoria} · {fechaCorta(d.fechaRealizacion)}{d.laboratorio ? ` · ${d.laboratorio}` : ''}</p></div>
                      <Avatar i={nombre.get(d.integranteId)} t="sm" />
                    </Tarjeta>
                  ))}</div>
                </Seccion>
              ))
            ))}
            {vista === 'galeria' && <Galeria docs={lista.filter((d) => d.archivoTipo?.startsWith('image/'))} onVer={setVer} />}
            {vista === 'valores' && <Valores quien={quien} familia={familia} onNuevo={() => setFormValor(true)} />}
          </>
        )}
      </Contenido>
      {form && <FormDocumento d={form} onCerrar={() => setForm(null)} />}
      {ver && <DetalleDocumento d={ver} onCerrar={() => setVer(null)} onEditar={() => { setForm(ver); setVer(null) }} />}
      {formValor && familia.length > 0 && <FormValor integranteId={quien ?? familia[0].id!} onCerrar={() => setFormValor(false)} />}
    </>
  )
}

function Galeria({ docs, onVer }: { docs: Documento[]; onVer: (d: Documento) => void }) {
  const urls = useMemo(() => docs.map((d) => (d.archivo ? URL.createObjectURL(d.archivo) : '')), [docs])
  useEffect(() => () => urls.forEach((u) => u && URL.revokeObjectURL(u)), [urls])
  if (!docs.length) return <div className="mt-4"><Vacio ilus="documento" titulo="Sin imágenes" texto="Las fotos de estudios, recetas y carnets aparecen acá." /></div>
  return <div className="mt-4 grid grid-cols-3 gap-2">{docs.map((d, k) => <button key={d.id} onClick={() => onVer(d)} className="aspect-square overflow-hidden rounded-2xl bg-white shadow-suave"><img src={urls[k]} alt={d.nombre} className="h-full w-full object-cover" /></button>)}</div>
}

function Valores({ quien, familia, onNuevo }: { quien?: number; familia: { id?: number; nombre: string }[]; onNuevo: () => void }) {
  const med = useLiveQuery(() => db.mediciones.orderBy('fecha').toArray(), [], [])
  const confirmar = useConfirmar()
  const ids = quien ? [quien] : familia.map((f) => f.id!)
  const grupos: { integranteId: number; tipo: string; filas: Medicion[] }[] = []
  for (const iid of ids) for (const t of Object.keys(TIPOS_MEDICION)) {
    const filas = med.filter((m) => m.integranteId === iid && m.tipo === t)
    if (filas.length) grupos.push({ integranteId: iid, tipo: t, filas })
  }
  const et = (f: string) => { const x = deISO(f); return `${MESES_CORTOS[x.getMonth()]} ${String(x.getFullYear()).slice(2)}` }
  return (
    <div className="mt-4 space-y-3">
      <Boton icono="mas" className="w-full" onClick={onNuevo}>Registrar un valor</Boton>
      <p className="rounded-2xl bg-cielo-50 p-3 text-xs text-cielo-600">Comparación de resultados del mismo tipo. Se muestran los valores de referencia que informó el laboratorio. <b>La app no interpreta resultados</b>: eso lo hace tu profesional.</p>
      {grupos.length === 0 ? <Vacio ilus="corazon" titulo="Sin valores" texto="Cargá peso, presión, glucemia, colesterol u otros valores para ver su evolución." /> : grupos.map((g) => {
        const info = TIPOS_MEDICION[g.tipo]
        return (
          <Tarjeta key={`${g.integranteId}-${g.tipo}`}>
            <div className="flex items-center justify-between"><p className="font-bold">{info.nombre} · {familia.find((f) => f.id === g.integranteId)?.nombre}</p><Insignia clase="bg-cielo-50 text-cielo-600">{info.unidad}</Insignia></div>
            {g.filas.length >= 2 && <div className="mt-2"><GraficoLinea puntos={g.filas.map((m) => ({ x: et(m.fecha), y: m.valor }))} puntos2={info.doble ? g.filas.map((m) => ({ x: et(m.fecha), y: m.valor2 ?? m.valor })) : undefined} unidad={info.unidad} alto={130} /></div>}
            <table className="mt-2 w-full text-sm"><thead className="text-left text-xs text-piedra-500"><tr><th className="py-1">Fecha</th><th>Valor</th><th>Referencia del laboratorio</th><th /></tr></thead>
              <tbody>{[...g.filas].reverse().map((m) => <tr key={m.id} className="border-t border-crema-200"><td className="py-1.5">{fechaCorta(m.fecha)}</td><td className="font-bold">{m.valor}{m.valor2 ? `/${m.valor2}` : ''}</td><td className="text-xs text-piedra-600">{m.referencia ?? '—'}</td><td><button aria-label="Borrar valor" className="p-1 text-piedra-400" onClick={async () => { if (await confirmar('¿Borrar este valor?', `${info.nombre}: ${m.valor}`, 'Borrar')) await db.mediciones.delete(m.id!) }}><Icono n="x" c="w-4 h-4" /></button></td></tr>)}</tbody></table>
          </Tarjeta>
        )
      })}
    </div>
  )
}

function FormValor({ integranteId, onCerrar }: { integranteId: number; onCerrar: () => void }) {
  const familia = useIntegrantes()
  const [d, setD] = useState({ integranteId, tipo: 'presion', fecha: hoyISO(), valor: '', valor2: '', referencia: '', nota: '' })
  const toast = useToast()
  const info = TIPOS_MEDICION[d.tipo]
  const guardar = async () => {
    const v = Number(d.valor), v2 = Number(d.valor2)
    if (!(v > 0) || (info.doble && !(v2 > 0))) return toast('Revisá el valor: tiene que ser un número mayor a cero.', 'error')
    await db.mediciones.add({ integranteId: d.integranteId, tipo: d.tipo, fecha: d.fecha, valor: v, valor2: info.doble ? v2 : undefined, referencia: d.referencia || undefined, nota: d.nota || undefined })
    toast('Valor guardado'); onCerrar()
  }
  return (
    <Hoja abierta titulo="Registrar un valor" onCerrar={onCerrar} pie={<Boton className="w-full" onClick={guardar}>Guardar</Boton>}>
      <Campo etiqueta="¿De quién?"><Selector value={d.integranteId} onChange={(e) => setD({ ...d, integranteId: Number(e.target.value) })}>{familia.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</Selector></Campo>
      <Campo etiqueta="¿Qué valor?"><Selector value={d.tipo} onChange={(e) => setD({ ...d, tipo: e.target.value })}>{Object.entries(TIPOS_MEDICION).map(([k, t]) => <option key={k} value={k}>{t.nombre} ({t.unidad})</option>)}</Selector></Campo>
      <Campo etiqueta="Fecha"><Entrada type="date" max={hoyISO()} value={d.fecha} onChange={(e) => setD({ ...d, fecha: e.target.value })} /></Campo>
      <div className={`grid gap-3 ${info.doble ? 'grid-cols-2' : ''}`}>
        <Campo etiqueta={info.doble ? 'Máxima (sistólica)' : `Valor (${info.unidad})`}><Entrada type="number" inputMode="decimal" step="0.1" value={d.valor} onChange={(e) => setD({ ...d, valor: e.target.value })} /></Campo>
        {info.doble && <Campo etiqueta="Mínima (diastólica)"><Entrada type="number" inputMode="decimal" value={d.valor2} onChange={(e) => setD({ ...d, valor2: e.target.value })} /></Campo>}
      </div>
      <Campo etiqueta="Valor de referencia del laboratorio (opcional)" ayuda="Copialo tal como figura en el informe."><Entrada value={d.referencia} onChange={(e) => setD({ ...d, referencia: e.target.value })} /></Campo>
      <Campo etiqueta="Nota"><Entrada value={d.nota} onChange={(e) => setD({ ...d, nota: e.target.value })} /></Campo>
    </Hoja>
  )
}

function FormDocumento({ d: inicial, onCerrar }: { d: Documento; onCerrar: () => void }) {
  const familia = useIntegrantes()
  const [d, setD] = useState(inicial)
  const [error, setError] = useState<string>()
  const toast = useToast()
  const set = (k: keyof Documento, v: unknown) => setD((x) => ({ ...x, [k]: v }))
  const guardar = async () => {
    if (!d.nombre.trim()) return setError('Poné un nombre al estudio.')
    if (!d.integranteId) return setError('Elegí a quién pertenece.')
    if (d.id) await db.documentos.put(d); else await db.documentos.add({ ...d, nombre: d.nombre.trim() })
    await registrarActividad(d.id ? 'Documento editado' : 'Documento agregado', d.nombre)
    toast('Documento guardado'); onCerrar()
  }
  return (
    <Hoja abierta titulo={d.id ? 'Editar documento' : 'Subir documento'} onCerrar={onCerrar} pie={<Boton className="w-full" onClick={guardar}>Guardar</Boton>}>
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-cielo-400 bg-cielo-50 p-5 text-center">
        <Icono n="subir" c="w-8 h-8 text-cielo-600" />
        <span className="font-bold text-cielo-600">{d.archivoNombre ?? 'Elegí un PDF o sacá una foto'}</span>
        <span className="text-xs text-piedra-500">PDF, JPG, PNG, WEBP o HEIC · hasta 15 MB</span>
        <input type="file" accept={TIPOS_PERMITIDOS} className="hidden" onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return
          const err = validarArchivo(f); if (err) return toast(err, 'error')
          setD((x) => ({ ...x, archivo: f, archivoNombre: f.name, archivoTipo: f.type, nombre: x.nombre || f.name.replace(/\.[^.]+$/, '') }))
        }} />
      </label>
      <Campo etiqueta="¿De quién es?"><Selector value={d.integranteId} onChange={(e) => set('integranteId', Number(e.target.value))}>{familia.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</Selector></Campo>
      <Campo etiqueta="Nombre del estudio *" error={error}><Entrada value={d.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej.: Hemograma completo" /></Campo>
      <Campo etiqueta="Categoría"><Selector value={d.categoria} onChange={(e) => set('categoria', e.target.value)}>{CATEGORIAS_DOCUMENTO.map((c) => <option key={c}>{c}</option>)}</Selector></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Fecha de realización"><Entrada type="date" value={d.fechaRealizacion ?? ''} onChange={(e) => set('fechaRealizacion', e.target.value)} /></Campo>
        <Campo etiqueta="Fecha de entrega"><Entrada type="date" value={d.fechaEntrega ?? ''} onChange={(e) => set('fechaEntrega', e.target.value)} /></Campo>
      </div>
      <Campo etiqueta="Profesional o laboratorio"><Entrada value={d.laboratorio ?? ''} onChange={(e) => set('laboratorio', e.target.value)} /></Campo>
      <Campo etiqueta="Observaciones"><Texto rows={2} value={d.observaciones ?? ''} onChange={(e) => set('observaciones', e.target.value)} /></Campo>
      <p className="text-xs text-piedra-500">Si el estudio tiene valores (glucemia, colesterol…), cargalos en la pestaña “Valores” para ver su evolución.</p>
    </Hoja>
  )
}

function DetalleDocumento({ d, onCerrar, onEditar }: { d: Documento; onCerrar: () => void; onEditar: () => void }) {
  const confirmar = useConfirmar()
  const toast = useToast()
  const borrar = async () => {
    if (!(await confirmar('¿Borrar este documento?', 'Se borra el archivo de este dispositivo. No se puede deshacer.', 'Borrar'))) return
    await db.documentos.delete(d.id!); await registrarActividad('Documento borrado', d.nombre); toast('Documento borrado'); onCerrar()
  }
  return (
    <Hoja abierta titulo={d.nombre} onCerrar={onCerrar} pie={<div className="grid grid-cols-2 gap-3"><Boton variante="borde" icono="basura" className="!text-coral-600" onClick={borrar}>Borrar</Boton><Boton variante="suave" icono="editar" onClick={onEditar}>Editar</Boton></div>}>
      <div className="flex flex-wrap gap-2"><Insignia clase="bg-cielo-50 text-cielo-600">{d.categoria}</Insignia><EtiquetaDemo demo={d.demo} /></div>
      <VistaArchivo doc={d} />
      <div className="space-y-1 text-sm">
        <p><span className="text-piedra-500">Realizado:</span> <b>{fechaCorta(d.fechaRealizacion)}</b></p>
        {d.fechaEntrega && <p><span className="text-piedra-500">Entregado:</span> <b>{fechaCorta(d.fechaEntrega)}</b></p>}
        {d.laboratorio && <p><span className="text-piedra-500">Profesional / laboratorio:</span> <b>{d.laboratorio}</b></p>}
        {d.observaciones && <p className="text-piedra-700">{d.observaciones}</p>}
      </div>
    </Hoja>
  )
}
