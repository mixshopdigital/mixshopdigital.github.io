import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ahora, db, registrarActividad, type Recomendacion } from '../lib/db'
import { controlesDe, ESTADO_CONTROL, fechaCorta, hoyISO, type FilaControl } from '../lib/salud'
import { Boton, Cabecera, Campo, Contenido, Entrada, Hoja, Insignia, Tarjeta, Texto, useConfirmar, useToast, Vacio } from '../ui/kit'
import { ElegirIntegrante, useIntegrantes } from '../ui/comunes'
import { Icono } from '../ui/iconos'

const ICONO_CAT: Record<string, [string, string]> = {
  'Salud femenina': ['flor', 'bg-lavanda-100 text-lavanda-600'], 'Salud masculina': ['escudo', 'bg-cielo-100 text-cielo-600'],
  'Salud infantil': ['corazon', 'bg-coral-100 text-coral-600'], General: ['escudo', 'bg-salvia-100 text-salvia-700'],
}

export default function Prevencion({ id }: { id?: number }) {
  const familia = useIntegrantes('persona')
  const actual = id ?? familia[0]?.id
  const i = familia.find((x) => x.id === actual)
  const recs = useLiveQuery(() => db.recomendaciones.toArray(), [], [])
  const hechos = useLiveQuery(() => (actual ? db.controles.where('integranteId').equals(actual).toArray() : []), [actual], [])
  const [registrar, setRegistrar] = useState<FilaControl | null>(null)
  const [ver, setVer] = useState<FilaControl | null>(null)
  const filas = i ? controlesDe(i, recs, hechos) : []
  const grupos = new Map<string, FilaControl[]>()
  for (const f of filas) grupos.set(f.rec.categoria, [...(grupos.get(f.rec.categoria) ?? []), f])
  const atencion = filas.filter((f) => f.estado === 'vencido' || f.estado === 'proximo').length

  return (
    <>
      <Cabecera titulo="Prevención" subtitulo="Controles según fuentes oficiales" color="salvia" />
      <Contenido>
        {!i ? <Vacio ilus="corazon" titulo="Primero agregá a tu familia" texto="Los controles se muestran según la edad y el sexo de cada persona." /> : (
          <>
            <ElegirIntegrante lista={familia} valor={actual} onChange={(v) => (location.hash = `#/prevencion/${v}`)} />
            {!i.fechaNacimiento && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">Cargá la fecha de nacimiento de {i.nombre} para ver los controles que corresponden a su edad.</p>}
            <Tarjeta className="mt-3 flex items-center gap-3 !bg-salvia-50 border-salvia-100">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-salvia-700"><Icono n="escudo" /></span>
              <p className="flex-1 text-sm text-piedra-700">{atencion ? <><b>{atencion} control(es)</b> necesitan atención.</> : 'No hay controles vencidos con los datos registrados.'} Tocá un control para ver su fuente oficial.</p>
            </Tarjeta>
            {[...grupos].map(([g, fs]) => (
              <section key={g} className="mt-5">
                <h2 className="mb-2 font-bold text-piedra-700">{g}</h2>
                <div className="space-y-2">
                  {fs.map((f) => {
                    const [ic, cl] = ICONO_CAT[g] ?? ICONO_CAT.General
                    return (
                      <Tarjeta key={f.rec.codigo} onClick={() => setVer(f)} className="!p-3">
                        <div className="flex items-start gap-3">
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cl}`}><Icono n={ic} c="w-5 h-5" /></span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{f.rec.nombre}</p><Insignia clase={ESTADO_CONTROL[f.estado].clase}>{ESTADO_CONTROL[f.estado].texto}</Insignia></div>
                            <p className="text-xs text-piedra-500">{f.rec.frecuenciaTexto}</p>
                            <p className="text-xs text-piedra-500">{f.ultimo ? `Último: ${fechaCorta(f.ultimo.fecha)}` : 'Sin registro'}{f.proxima ? ` · Próximo: ${fechaCorta(f.proxima)}` : ''}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setRegistrar(f) }} aria-label={`Registrar ${f.rec.nombre}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-turquesa-500 text-white"><Icono n="mas" c="w-5 h-5" /></button>
                        </div>
                      </Tarjeta>
                    )
                  })}
                </div>
              </section>
            ))}
            <p className="mt-6 text-xs text-piedra-500">La app muestra recomendaciones generales con su fuente. No programa estudios por su cuenta: tu profesional decide qué controles corresponden según tus antecedentes.</p>
          </>
        )}
      </Contenido>
      {ver && <DetalleControl f={ver} onCerrar={() => setVer(null)} onRegistrar={() => { setRegistrar(ver); setVer(null) }} />}
      {registrar && i && <FormControl integranteId={i.id!} rec={registrar.rec} onCerrar={() => setRegistrar(null)} />}
    </>
  )
}

function DetalleControl({ f, onCerrar, onRegistrar }: { f: FilaControl; onCerrar: () => void; onRegistrar: () => void }) {
  const historial = useLiveQuery(() => db.controles.where('integranteId').equals(f.ultimo?.integranteId ?? -1).filter((c) => c.recomendacionCodigo === f.rec.codigo).reverse().sortBy('fecha'), [f], [])
  const confirmar = useConfirmar()
  const r = f.rec
  return (
    <Hoja abierta titulo={r.nombre} onCerrar={onCerrar} pie={<div className="grid grid-cols-2 gap-2"><Boton variante="suave" onClick={() => (location.hash = '#/agenda?nuevo')}>Agendar</Boton><Boton onClick={onRegistrar}>Registrar control</Boton></div>}>
      <Insignia clase={ESTADO_CONTROL[f.estado].clase}>{ESTADO_CONTROL[f.estado].texto}</Insignia>
      <p className="text-sm text-piedra-700">{f.motivo}</p>
      <div className="space-y-1.5 rounded-2xl bg-white p-4 text-sm">
        <p><span className="text-piedra-500">A quién corresponde:</span> <b>{r.poblacion}</b></p>
        <p><span className="text-piedra-500">Frecuencia según la fuente:</span> <b>{r.frecuenciaTexto}</b></p>
        <p><span className="text-piedra-500">Fuente:</span> <b>{r.fuente}</b></p>
        {r.url && <p className="break-all"><a href={r.url} target="_blank" rel="noopener" className="font-bold text-turquesa-600 underline">Ver la publicación oficial</a></p>}
        <p><span className="text-piedra-500">Vigencia:</span> <b>{r.vigencia}</b>{r.fechaRevision ? ` (revisada el ${fechaCorta(r.fechaRevision)})` : ''}</p>
        {r.nota && <p className="rounded-xl bg-cielo-50 p-2 text-cielo-600">{r.nota}</p>}
      </div>
      {historial.length > 0 && (
        <div><p className="mb-1 font-bold">Historial</p>{historial.map((c) => (
          <div key={c.id} className="flex items-center justify-between border-b border-crema-200 py-2 text-sm">
            <span>{fechaCorta(c.fecha)}{c.proximaIndicada ? ` · próxima indicada: ${fechaCorta(c.proximaIndicada)}` : ''}{c.observaciones ? ` · ${c.observaciones}` : ''}</span>
            <button aria-label="Borrar" onClick={async () => { if (await confirmar('¿Borrar este registro?', fechaCorta(c.fecha), 'Borrar')) await db.controles.delete(c.id!) }} className="p-1 text-piedra-400"><Icono n="x" c="w-4 h-4" /></button>
          </div>
        ))}</div>
      )}
    </Hoja>
  )
}

function FormControl({ integranteId, rec, onCerrar }: { integranteId: number; rec: Recomendacion; onCerrar: () => void }) {
  const [fecha, setFecha] = useState(hoyISO())
  const [prox, setProx] = useState('')
  const [obs, setObs] = useState('')
  const toast = useToast()
  const guardar = async () => {
    if (!fecha || fecha > hoyISO()) return toast('Indicá la fecha en que se hizo el control.', 'error')
    await db.controles.add({ integranteId, recomendacionCodigo: rec.codigo, fecha, proximaIndicada: prox || undefined, observaciones: obs || undefined })
    await registrarActividad('Control registrado', rec.nombre)
    toast('Control registrado'); onCerrar()
  }
  void ahora
  return (
    <Hoja abierta titulo={`Registrar: ${rec.nombre}`} onCerrar={onCerrar} pie={<Boton className="w-full" onClick={guardar}>Guardar</Boton>}>
      <Campo etiqueta="¿Cuándo se hizo?"><Entrada type="date" max={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} /></Campo>
      <Campo etiqueta="Próxima fecha que indicó tu profesional (opcional)" ayuda="Si la cargás, se usa esta fecha en lugar de la sugerida por la fuente."><Entrada type="date" value={prox} onChange={(e) => setProx(e.target.value)} /></Campo>
      <Campo etiqueta="Observaciones"><Texto rows={2} value={obs} onChange={(e) => setObs(e.target.value)} /></Campo>
    </Hoja>
  )
}
