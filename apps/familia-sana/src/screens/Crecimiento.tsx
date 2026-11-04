import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, TIPOS_MEDICION, type Integrante } from '../lib/db'
import { edadMeses, fechaCorta, hoyISO } from '../lib/salud'
import { Boton, Campo, Entrada, GraficoLinea, Hoja, Tarjeta, useToast } from '../ui/kit'

/** Curva de crecimiento con los datos registrados (peso, talla, perímetro cefálico). */
export function Crecimiento({ i }: { i: Integrante }) {
  const esM = i.tipo === 'mascota'
  const tipos = esM ? ['peso'] : ['peso', 'talla', 'perimetroCefalico']
  const [tipo, setTipo] = useState('peso')
  const [form, setForm] = useState(false)
  const [v, setV] = useState({ fecha: hoyISO(), peso: '', talla: '', perimetroCefalico: '' })
  const toast = useToast()
  const datos = useLiveQuery(() => db.mediciones.where('integranteId').equals(i.id!).filter((m) => tipos.includes(m.tipo)).sortBy('fecha'), [i.id], [])
  const serie = datos.filter((m) => m.tipo === tipo)
  const etiqueta = (f: string) => { const m = edadMeses(i.fechaNacimiento, f); return m === undefined ? fechaCorta(f) : m < 24 ? `${m}m` : `${Math.floor(m / 12)}a` }
  const guardar = async () => {
    const filas = tipos.filter((t) => (v as Record<string, string>)[t]).map((t) => ({ integranteId: i.id!, tipo: t, fecha: v.fecha, valor: Number((v as Record<string, string>)[t]) }))
    if (!filas.length) return toast('Cargá al menos un valor.', 'error')
    if (filas.some((f) => !(f.valor > 0))) return toast('Revisá los números: tienen que ser mayores a cero.', 'error')
    await db.mediciones.bulkAdd(filas)
    if (esM && v.peso) await db.integrantes.update(i.id!, { peso: Number(v.peso) })
    toast('Medición guardada'); setForm(false); setV({ fecha: hoyISO(), peso: '', talla: '', perimetroCefalico: '' })
  }
  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">{tipos.map((t) => <button key={t} onClick={() => setTipo(t)} className={`rounded-full px-4 py-2 text-sm font-bold ${tipo === t ? 'bg-turquesa-500 text-white' : 'bg-white text-piedra-600 shadow-suave'}`}>{TIPOS_MEDICION[t].nombre}</button>)}</div>
      <Tarjeta>
        <GraficoLinea puntos={serie.map((m) => ({ x: etiqueta(m.fecha), y: m.valor }))} unidad={TIPOS_MEDICION[tipo].unidad} />
        {serie.length > 0 && <p className="mt-2 text-xs text-piedra-500">Último: <b>{serie.at(-1)!.valor} {TIPOS_MEDICION[tipo].unidad}</b> ({fechaCorta(serie.at(-1)!.fecha)}).</p>}
      </Tarjeta>
      {!esM && <p className="rounded-2xl bg-cielo-50 p-3 text-xs text-cielo-600">Referencia: los patrones de crecimiento infantil de la <b>OMS</b> (who.int/tools/child-growth-standards) son los que usa el pediatra para ubicar estos valores en percentiles. La app muestra la evolución con tus datos; la comparación con las curvas OMS la hace el profesional.</p>}
      <Boton icono="mas" className="w-full" onClick={() => setForm(true)}>Registrar medición</Boton>
      <Tarjeta className="!p-0 overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-crema-200 text-left"><tr><th className="p-2">Fecha</th>{tipos.map((t) => <th key={t} className="p-2">{TIPOS_MEDICION[t].nombre}</th>)}</tr></thead>
          <tbody>{[...new Set(datos.map((d) => d.fecha))].reverse().map((f) => <tr key={f} className="border-t border-crema-200"><td className="p-2">{fechaCorta(f)}</td>{tipos.map((t) => <td key={t} className="p-2">{datos.find((d) => d.fecha === f && d.tipo === t)?.valor ?? '—'}</td>)}</tr>)}</tbody></table>
      </Tarjeta>
      <Hoja abierta={form} titulo="Nueva medición" onCerrar={() => setForm(false)} pie={<Boton className="w-full" onClick={guardar}>Guardar</Boton>}>
        <Campo etiqueta="Fecha"><Entrada type="date" max={hoyISO()} value={v.fecha} onChange={(e) => setV({ ...v, fecha: e.target.value })} /></Campo>
        {tipos.map((t) => <Campo key={t} etiqueta={`${TIPOS_MEDICION[t].nombre} (${TIPOS_MEDICION[t].unidad})`}><Entrada type="number" inputMode="decimal" step="0.1" min="0" value={(v as Record<string, string>)[t]} onChange={(e) => setV({ ...v, [t]: e.target.value })} /></Campo>)}
      </Hoja>
    </div>
  )
}
