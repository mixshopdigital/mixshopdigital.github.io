import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { db, type Documento, type Integrante } from '../lib/db'
import { Avatar } from './kit'
import { Icono } from './iconos'

export function useIntegrantes(tipo?: 'persona' | 'mascota', archivados = false) {
  return useLiveQuery(() => db.integrantes.filter((i) => (!tipo || i.tipo === tipo) && (archivados || !i.archivado)).toArray(), [tipo, archivados]) ?? []
}

/** Fila horizontal de avatares para elegir un integrante. */
export function ElegirIntegrante({ lista, valor, onChange, todos }: { lista: Integrante[]; valor?: number; onChange: (id?: number) => void; todos?: boolean }) {
  return (
    <div className="sin-barra -mx-4 flex gap-3 overflow-x-auto px-4 py-1">
      {todos && (
        <button onClick={() => onChange(undefined)} className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl p-1 text-xs font-bold ${valor === undefined ? 'text-turquesa-600' : 'text-piedra-500'}`}>
          <span className={`grid h-12 w-12 place-items-center rounded-full ${valor === undefined ? 'bg-turquesa-500 text-white' : 'bg-white text-piedra-500 shadow-suave'}`}><Icono n="familia" /></span>Todos
        </button>
      )}
      {lista.map((i) => (
        <button key={i.id} onClick={() => onChange(i.id)} className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-2xl p-1 text-xs font-bold ${valor === i.id ? 'text-turquesa-600' : 'text-piedra-500'}`}>
          <span className={`rounded-full ${valor === i.id ? 'ring-4 ring-turquesa-400' : ''}`}><Avatar i={i} /></span>
          <span className="w-full truncate text-center">{i.nombre}</span>
        </button>
      ))}
    </div>
  )
}

/** Muestra un archivo guardado (imagen o PDF) con vista previa y descarga. */
export function VistaArchivo({ doc }: { doc: Documento }) {
  const url = useMemo(() => (doc.archivo ? URL.createObjectURL(doc.archivo) : undefined), [doc.archivo])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  if (!url) return <p className="rounded-2xl bg-crema-200 p-4 text-sm text-piedra-600">Este registro no tiene archivo adjunto.</p>
  const esImg = doc.archivoTipo?.startsWith('image/')
  const esPdf = doc.archivoTipo === 'application/pdf'
  return (
    <div className="space-y-2">
      {esImg && <img src={url} alt={doc.nombre} className="max-h-[60vh] w-full rounded-2xl bg-white object-contain" />}
      {esPdf && <object data={url} type="application/pdf" className="h-[60vh] w-full rounded-2xl bg-white"><p className="p-4 text-sm">Tu navegador no muestra el PDF acá. Usá “Descargar”.</p></object>}
      <div className="flex gap-2">
        <a href={url} download={doc.archivoNombre ?? doc.nombre} className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-salvia-100 px-4 font-bold text-salvia-800"><Icono n="bajar" c="w-5 h-5" />Descargar</a>
        <a href={url} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white px-4 font-bold text-piedra-700 border-2 border-crema-200"><Icono n="ojo" c="w-5 h-5" />Abrir</a>
      </div>
    </div>
  )
}

export const TIPOS_PERMITIDOS = 'application/pdf,image/jpeg,image/png,image/webp,image/heic'
export const MAX_MB = 15

export function validarArchivo(f: File): string | undefined {
  const ok = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(f.type)
  if (!ok) return 'Solo se aceptan PDF, JPG, PNG, WEBP o HEIC.'
  if (f.size > MAX_MB * 1024 * 1024) return `El archivo pesa más de ${MAX_MB} MB.`
  return undefined
}

export function useBorrador<T>(clave: string, inicial: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = sessionStorage.getItem(clave); return s ? { ...inicial, ...JSON.parse(s) } : inicial } catch { return inicial }
  })
  useEffect(() => { try { sessionStorage.setItem(clave, JSON.stringify(v)) } catch { /* sin almacenamiento */ } }, [clave, v])
  const limpiar = () => { try { sessionStorage.removeItem(clave) } catch { /* nada */ } }
  return [v, setV, limpiar] as const
}
