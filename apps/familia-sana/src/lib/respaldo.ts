import { guardarActivacion, leerActivacion } from './activacion'
import { db, registrarActividad, setAjuste } from './db'

/** Copia de seguridad completa en un archivo JSON (los archivos adjuntos van en base64). */
export async function exportarRespaldo() {
  const salida: Record<string, unknown[]> = {}
  for (const t of db.tables) {
    const filas = await t.toArray()
    salida[t.name] = await Promise.all(filas.map(async (f) => {
      const r = { ...(f as Record<string, unknown>) }
      if (r.archivo instanceof Blob) r.archivo = { __blob: await aDataURL(r.archivo) }
      return r
    }))
  }
  const json = JSON.stringify({ app: 'familia-sana', version: 1, fecha: new Date().toISOString(), datos: salida })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  a.download = `familia-sana-respaldo-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
  await setAjuste('ultimoRespaldo', new Date().toISOString())
  await registrarActividad('Copia de seguridad descargada')
}

export async function importarRespaldo(archivo: File) {
  const datos = JSON.parse(await archivo.text())
  if (datos?.app !== 'familia-sana' || !datos.datos) throw new Error('El archivo no es una copia de Familia Sana.')
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) {
      await t.clear()
      const filas = (datos.datos[t.name] ?? []) as Record<string, unknown>[]
      for (const f of filas) {
        const a = f.archivo as { __blob?: string } | undefined
        if (a?.__blob) f.archivo = await (await fetch(a.__blob)).blob()
      }
      if (filas.length) await t.bulkAdd(filas as never[])
    }
  })
  await registrarActividad('Copia de seguridad restaurada')
}

export async function borrarTodo() {
  const activacion = leerActivacion()
  await db.delete()
  try { localStorage.clear(); sessionStorage.clear() } catch { /* nada */ }
  // la activación es de la compra, no de los datos: se conserva
  if (activacion) guardarActivacion(activacion)
  location.hash = ''
  location.reload()
}

function aDataURL(b: Blob) {
  return new Promise<string>((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.onerror = mal; r.readAsDataURL(b) })
}
