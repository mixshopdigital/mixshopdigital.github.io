import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { fechaCorta } from '../lib/salud'
import { Vacio } from '../ui/kit'
import { Icono } from '../ui/iconos'

/** Historial cronológico de los principales acontecimientos de salud de un integrante. */
export function LineaTiempo({ id }: { id: number }) {
  const items = useLiveQuery(async () => {
    const [reg, docs, vac, ev, ctl] = await Promise.all([
      db.registros.where('integranteId').equals(id).toArray(), db.documentos.where('integranteId').equals(id).toArray(),
      db.vacunas.where('integranteId').equals(id).filter((v) => v.confirmada && !!v.fechaAplicada).toArray(),
      db.eventos.where('integranteId').equals(id).filter((e) => e.estado === 'realizado').toArray(), db.controles.where('integranteId').equals(id).toArray(),
    ])
    const recs = new Map((await db.recomendaciones.toArray()).map((r) => [r.codigo, r.nombre]))
    return [
      ...reg.map((r) => ({ f: r.fecha, t: r.titulo, s: r.categoria, i: 'historia', c: 'bg-cielo-100 text-cielo-600' })),
      ...docs.filter((d) => d.fechaRealizacion).map((d) => ({ f: d.fechaRealizacion!, t: d.nombre, s: `Estudio · ${d.categoria}`, i: 'informe', c: 'bg-cielo-100 text-cielo-600' })),
      ...vac.map((v) => ({ f: v.fechaAplicada!, t: `${v.nombre}${v.dosis ? ` · ${v.dosis}` : ''}`, s: 'Vacuna aplicada', i: 'vacuna', c: 'bg-turquesa-100 text-turquesa-700' })),
      ...ev.map((e) => ({ f: e.fecha, t: `${e.categoria}${e.especialidad ? ` · ${e.especialidad}` : ''}`, s: e.motivo ?? 'Cita realizada', i: 'agenda', c: 'bg-coral-100 text-coral-600' })),
      ...ctl.map((c) => ({ f: c.fecha, t: recs.get(c.recomendacionCodigo) ?? c.recomendacionCodigo, s: 'Control preventivo', i: 'escudo', c: 'bg-salvia-100 text-salvia-700' })),
    ].sort((a, b) => b.f.localeCompare(a.f))
  }, [id], [])
  if (!items.length) return <div className="mt-4"><Vacio ilus="calendario" titulo="Sin historial todavía" texto="A medida que registres consultas, estudios y vacunas, se arma la línea de tiempo." /></div>
  let anio = ''
  return (
    <ol className="relative mt-4 ml-4 border-l-2 border-salvia-200">
      {items.map((x, k) => {
        const a = x.f.slice(0, 4)
        const cab = a !== anio ? (anio = a) : null
        return (
          <li key={k} className="mb-4 ml-6">
            {cab && <p className="-ml-10 mb-2 inline-block rounded-full bg-salvia-600 px-3 py-0.5 text-xs font-bold text-white">{cab}</p>}
            <span className={`absolute -left-[17px] grid h-8 w-8 place-items-center rounded-full ring-4 ring-crema-100 ${x.c}`}><Icono n={x.i} c="w-4 h-4" /></span>
            <div className="rounded-2xl bg-white p-3 shadow-suave"><p className="text-xs text-piedra-500">{fechaCorta(x.f)}</p><p className="font-bold">{x.t}</p><p className="text-sm text-piedra-600">{x.s}</p></div>
          </li>
        )
      })}
    </ol>
  )
}
