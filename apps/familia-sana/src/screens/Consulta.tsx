import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { fechaCorta, hoyISO } from '../lib/salud'
import { Boton, Cabecera, Chips, Contenido, Texto, Tarjeta, useToast, Vacio } from '../ui/kit'
import { ElegirIntegrante, useIntegrantes } from '../ui/comunes'
import { Icono } from '../ui/iconos'

/** "Tengo una consulta": anotar síntomas y preguntas para llevar al médico. No da diagnósticos. */
export default function Consulta({ id }: { id?: number }) {
  const familia = useIntegrantes()
  const actual = id ?? familia[0]?.id
  const [tipo, setTipo] = useState<'sintoma' | 'pregunta'>('sintoma')
  const [texto, setTexto] = useState('')
  const [verResueltas, setVerResueltas] = useState(false)
  const toast = useToast()
  const notas = useLiveQuery(() => (actual ? db.notas.where('integranteId').equals(actual).reverse().sortBy('fecha') : []), [actual], [])
  const persona = familia.find((f) => f.id === actual)
  const pendientes = notas.filter((n) => !n.resuelta)
  const agregar = async () => {
    if (!texto.trim()) return toast('Escribí algo para guardar.', 'error')
    await db.notas.add({ integranteId: actual!, tipo, fecha: hoyISO(), texto: texto.trim(), resuelta: false })
    setTexto(''); toast('Anotado para tu próxima consulta')
  }
  return (
    <>
      <Cabecera titulo="Tengo una consulta" subtitulo="Preparate para hablar con tu médico" color="coral" />
      <Contenido>
        {!persona ? <Vacio titulo="Primero agregá a tu familia" texto="Las notas se guardan por integrante." /> : (
          <>
            <ElegirIntegrante lista={familia} valor={actual} onChange={(v) => (location.hash = `#/consulta/${v}`)} />
            <Tarjeta className="mt-3 space-y-3">
              <Chips opciones={[{ v: 'sintoma', t: '🤒 Síntoma o molestia' }, { v: 'pregunta', t: '❓ Pregunta para el médico' }]} valor={tipo} onChange={(v) => setTipo(v as 'sintoma')} />
              <Texto value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={tipo === 'sintoma' ? 'Ej.: desde el lunes me duele la cabeza por la mañana' : 'Ej.: ¿tengo que repetir el análisis?'} />
              <Boton className="w-full" icono="mas" onClick={agregar}>Anotar</Boton>
            </Tarjeta>
            <div className="mt-5 flex items-center justify-between"><h2 className="font-bold">Para llevar a la consulta ({pendientes.length})</h2>{pendientes.length > 0 && <Boton variante="texto" icono="imprimir" onClick={() => print()}>Imprimir</Boton>}</div>
            <div className="solo-imprimir mb-2"><p className="text-lg font-bold">Temas para la consulta de {persona.nombre} · {fechaCorta(hoyISO())}</p></div>
            {pendientes.length === 0 ? <p className="mt-2 rounded-2xl bg-white p-4 text-sm text-piedra-500">No hay temas pendientes.</p> : (
              <div className="mt-2 space-y-2">
                {(['sintoma', 'pregunta'] as const).map((t) => pendientes.filter((n) => n.tipo === t).length > 0 && (
                  <div key={t}><p className="mb-1 text-sm font-bold text-piedra-500">{t === 'sintoma' ? 'Síntomas y observaciones' : 'Preguntas'}</p>
                    {pendientes.filter((n) => n.tipo === t).map((n) => (
                      <Tarjeta key={n.id} className="mb-2 flex items-start gap-3 !p-3">
                        <div className="flex-1"><p>{n.texto}</p><p className="text-xs text-piedra-500">{fechaCorta(n.fecha)}</p></div>
                        <button onClick={() => db.notas.update(n.id!, { resuelta: true })} className="no-imprimir inline-flex items-center gap-1 rounded-full bg-salvia-100 px-3 py-1.5 text-xs font-bold text-salvia-800"><Icono n="check" c="w-4 h-4" />Lo hablé</button>
                      </Tarjeta>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setVerResueltas(!verResueltas)} className="no-imprimir mt-4 text-sm font-bold text-piedra-500">{verResueltas ? 'Ocultar' : 'Ver'} temas ya conversados</button>
            {verResueltas && notas.filter((n) => n.resuelta).map((n) => <div key={n.id} className="mt-2 flex items-center justify-between rounded-2xl bg-crema-200 p-3 text-sm text-piedra-600"><span className="line-through">{n.texto}</span><button onClick={() => db.notas.delete(n.id!)} aria-label="Borrar" className="p-1"><Icono n="x" c="w-4 h-4" /></button></div>)}
            <p className="mt-6 rounded-2xl bg-coral-50 p-3 text-xs text-coral-600">Familia Sana no da diagnósticos. Si tenés un síntoma grave o una emergencia, llamá a emergencias o andá al servicio de urgencias más cercano.</p>
          </>
        )}
      </Contenido>
    </>
  )
}
