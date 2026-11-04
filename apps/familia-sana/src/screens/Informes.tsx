import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, registrarActividad, type Documento } from '../lib/db'
import { carnetVacunas, controlesDe, fechaCorta, fechaLarga, hoyISO, nombreCompleto, nombreMes, textoEdad } from '../lib/salud'
import { Avatar, Boton, Cabecera, Contenido, Firma, Insignia, Tarjeta, useToast, Vacio } from '../ui/kit'
import { useIntegrantes } from '../ui/comunes'
import { Icono } from '../ui/iconos'

export default function Informes({ id }: { id?: number }) {
  if (id) return <InformePersona id={id} />
  return <ResumenFamiliar />
}

function ResumenFamiliar() {
  const familia = useIntegrantes()
  const [mes, setMes] = useState(hoyISO().slice(0, 7))
  const datos = useLiveQuery(async () => {
    const enMes = (f?: string) => !!f && f.startsWith(mes)
    const [ev, docs, vac, meds, recs, ctl] = await Promise.all([db.eventos.toArray(), db.documentos.toArray(), db.vacunas.toArray(), db.medicamentos.toArray(), db.recomendaciones.toArray(), db.controles.toArray()])
    let pend = 0
    for (const p of familia.filter((f) => f.tipo === 'persona')) pend += controlesDe(p, recs, ctl.filter((c) => c.integranteId === p.id)).filter((c) => c.estado === 'vencido' || c.estado === 'proximo').length
    return {
      consultas: ev.filter((e) => e.estado === 'realizado' && enMes(e.fecha)).length,
      estudios: docs.filter((d) => enMes(d.fechaRealizacion) || enMes(d.creado.slice(0, 10))).length,
      vacunas: vac.filter((v) => v.confirmada && enMes(v.fechaAplicada)).length,
      meds: meds.filter((m) => enMes(m.inicio) || enMes(m.creado.slice(0, 10))).length,
      pend,
    }
  }, [mes, familia.length])
  const [a, m] = mes.split('-').map(Number)
  const mover = (n: number) => { const d = new Date(a, m - 1 + n, 1); setMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`) }
  return (
    <>
      <Cabecera titulo="Informes" subtitulo="Resumen familiar y fichas en PDF" color="cielo" />
      <Contenido>
        <Tarjeta className="mt-2">
          <div className="flex items-center justify-between"><button aria-label="Mes anterior" onClick={() => mover(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-crema-100"><Icono n="atras" c="w-5 h-5" /></button><p className="font-bold capitalize">Resumen de {nombreMes(m - 1)} {a}</p><button aria-label="Mes siguiente" onClick={() => mover(1)} className="grid h-10 w-10 place-items-center rounded-full bg-crema-100"><Icono n="adelante" c="w-5 h-5" /></button></div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {([['Consultas realizadas', datos?.consultas, 'agenda'], ['Estudios incorporados', datos?.estudios, 'informe'], ['Vacunas aplicadas', datos?.vacunas, 'vacuna'], ['Medicamentos registrados', datos?.meds, 'pastilla'], ['Controles pendientes', datos?.pend, 'escudo']] as [string, number | undefined, string][]).map(([t, n, i]) => (
              <div key={t} className="rounded-2xl bg-crema-100 p-3 text-center"><Icono n={i} c="mx-auto w-5 h-5 text-cielo-600" /><p className="mt-1 text-2xl font-extrabold">{n ?? '—'}</p><p className="text-[11px] text-piedra-500">{t}</p></div>
            ))}
          </div>
        </Tarjeta>
        <h2 className="mt-6 mb-2 font-bold">Resumen sanitario por integrante (PDF)</h2>
        {familia.length === 0 ? <Vacio titulo="Sin integrantes" texto="Agregá a tu familia para generar informes." /> : (
          <div className="grid gap-2 sm:grid-cols-2">{familia.map((i) => (
            <Tarjeta key={i.id} onClick={() => (location.hash = `#/informes/${i.id}`)} className="flex items-center gap-3 !p-3"><Avatar i={i} /><div className="flex-1"><p className="font-bold">{nombreCompleto(i)}</p><p className="text-xs text-piedra-500">Ver e imprimir resumen</p></div><Icono n="imprimir" c="w-5 h-5 text-cielo-600" /></Tarjeta>
          ))}</div>
        )}
      </Contenido>
    </>
  )
}

const SECCIONES = { datos: 'Datos generales', antecedentes: 'Antecedentes y diagnósticos declarados', medicamentos: 'Medicamentos actuales', vacunas: 'Vacunas registradas', estudios: 'Últimos estudios', consultas: 'Consultas recientes', controles: 'Controles pendientes' }
type Clave = keyof typeof SECCIONES

function InformePersona({ id }: { id: number }) {
  const toast = useToast()
  const [incluir, setIncluir] = useState<Record<Clave, boolean>>({ datos: true, antecedentes: true, medicamentos: true, vacunas: true, estudios: true, consultas: true, controles: true })
  const [elegidos, setElegidos] = useState<number[]>([])
  const d = useLiveQuery(async () => {
    const i = await db.integrantes.get(id)
    if (!i) return null
    const [reg, meds, vac, esquema, docs, ev, recs, ctl] = await Promise.all([
      db.registros.where('integranteId').equals(id).reverse().sortBy('fecha'), db.medicamentos.where('integranteId').equals(id).filter((m) => m.activo).toArray(),
      db.vacunas.where('integranteId').equals(id).toArray(), db.esquemaVacunas.toArray(), db.documentos.where('integranteId').equals(id).reverse().sortBy('fechaRealizacion'),
      db.eventos.where('integranteId').equals(id).filter((e) => e.estado === 'realizado').reverse().sortBy('fecha'), db.recomendaciones.toArray(), db.controles.where('integranteId').equals(id).toArray(),
    ])
    return { i, reg, meds, vac: vac.filter((v) => v.confirmada), esquema, docs, ev, ctl: i.tipo === 'persona' ? controlesDe(i, recs, ctl).filter((c) => c.estado !== 'al dia') : [], carnet: i.tipo === 'persona' ? carnetVacunas(i, esquema, vac) : [] }
  }, [id])
  if (d === undefined) return null
  if (d === null) return <><Cabecera titulo="Informe" atras /><Contenido><Vacio titulo="No encontrado" texto="Este integrante no existe." /></Contenido></>
  const { i } = d
  const diag = d.reg.filter((r) => ['Antecedentes personales', 'Enfermedades diagnosticadas', 'Cirugías', 'Hospitalizaciones', 'Alergias', 'Antecedentes familiares'].includes(r.categoria))
  const consultas = [...d.reg.filter((r) => r.categoria === 'Consulta' || r.categoria === 'Control veterinario'), ...d.ev.map((e) => ({ fecha: e.fecha, titulo: `${e.categoria}${e.especialidad ? ` · ${e.especialidad}` : ''}`, medico: e.profesional }))].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 8)
  const demo = i.demo

  const compartir = async () => {
    const texto = document.getElementById('informe')?.innerText ?? ''
    const archivo = new File([texto], `Resumen-${i.nombre}.txt`, { type: 'text/plain' })
    try {
      if (navigator.canShare?.({ files: [archivo] })) await navigator.share({ files: [archivo], title: `Resumen de salud de ${i.nombre}` })
      else if (navigator.share) await navigator.share({ title: `Resumen de salud de ${i.nombre}`, text: texto })
      else { await navigator.clipboard.writeText(texto); toast('Resumen copiado. Pegalo en el mensaje para tu médico.') }
      await registrarActividad('Informe compartido', i.nombre)
    } catch { /* cancelado por la persona */ }
  }
  const carpeta = async () => {
    const docs = d.docs.filter((x) => elegidos.includes(x.id!) && x.archivo)
    if (!docs.length) return toast('Elegí al menos un documento con archivo.', 'error')
    const files = docs.map((x) => new File([x.archivo!], x.archivoNombre ?? `${x.nombre}`, { type: x.archivoTipo }))
    try {
      if (navigator.canShare?.({ files })) { await navigator.share({ files, title: `Carpeta de salud de ${i.nombre}` }); return }
    } catch { return }
    for (const x of docs) descargar(x)
    toast(`Se descargaron ${docs.length} archivo(s).`)
  }

  return (
    <>
      <div className="no-imprimir"><Cabecera titulo={`Informe de ${i.nombre}`} subtitulo="Resumen sanitario para imprimir o guardar en PDF" atras color="cielo" /></div>
      <Contenido>
        <div className="no-imprimir space-y-3">
          <Tarjeta>
            <p className="mb-2 text-sm font-bold">Qué incluir</p>
            <div className="flex flex-wrap gap-2">{(Object.keys(SECCIONES) as Clave[]).map((k) => <button key={k} onClick={() => setIncluir({ ...incluir, [k]: !incluir[k] })} className={`rounded-full px-3 py-1.5 text-xs font-bold ${incluir[k] ? 'bg-cielo-500 text-white' : 'bg-crema-200 text-piedra-600'}`}>{SECCIONES[k]}</button>)}</div>
            <p className="mt-2 text-xs text-piedra-500">Los datos del ciclo menstrual nunca se incluyen en este informe.</p>
          </Tarjeta>
          <div className="grid grid-cols-2 gap-3">
            <Boton icono="imprimir" onClick={() => { registrarActividad('Informe impreso', i.nombre); print() }}>Imprimir / PDF</Boton>
            <Boton variante="suave" icono="compartir" onClick={compartir}>Compartir</Boton>
          </div>
          <p className="text-xs text-piedra-500">Para guardar como PDF: tocá “Imprimir / PDF” y elegí <b>“Guardar como PDF”</b> en la impresora. Compartilo vos mismo/a con tu médico por WhatsApp o correo; la app no publica enlaces.</p>
        </div>

        <article id="informe" className="mt-4 rounded-3xl bg-white p-5 shadow-suave print:shadow-none print:p-0">
          <header className="flex items-center gap-3 border-b-2 border-salvia-200 pb-3">
            <img src="./icono.svg" alt="" className="h-12 w-12 rounded-xl" />
            <div className="flex-1"><p className="font-display text-xl text-salvia-700">Resumen de salud</p><p className="text-sm text-piedra-500">Familia Sana · generado el {fechaLarga(hoyISO())}</p></div>
          </header>
          {demo && <p className="mt-3 rounded-xl bg-amber-100 p-2 text-center text-sm font-bold text-amber-900">DATOS FICTICIOS DE DEMOSTRACIÓN · NO ES INFORMACIÓN MÉDICA REAL</p>}
          {incluir.datos && (
            <Bloque t={SECCIONES.datos}>
              <p className="text-lg font-bold">{nombreCompleto(i)}</p>
              <p>{i.relacion} · {textoEdad(i.fechaNacimiento)} · Nacimiento: {fechaCorta(i.fechaNacimiento)}{i.especie ? ` · ${i.especie} ${i.raza ?? ''}` : ''}</p>
              {i.grupoSanguineo && <p>Grupo sanguíneo: <b>{i.grupoSanguineo}</b></p>}
              <p>Alergias: <b className={i.alergias ? 'text-coral-600' : ''}>{i.alergias || 'No registradas'}</b></p>
              {i.cronicas && <p>Enfermedades crónicas: <b>{i.cronicas}</b></p>}
              {i.medicoCabecera && <p>Médico de cabecera: {i.medicoCabecera}</p>}
              {i.contactoEmergencia && <p>Contacto de emergencia: {i.contactoEmergencia}</p>}
            </Bloque>
          )}
          {incluir.antecedentes && <Bloque t={SECCIONES.antecedentes}>{diag.length ? <ul className="list-disc pl-5">{diag.map((r) => <li key={r.id}><b>{r.titulo}</b> ({r.categoria}, {fechaCorta(r.fecha)}){r.diagnostico ? ` — ${r.diagnostico}` : ''}{r.medico ? ` · ${r.medico}` : ''}</li>)}</ul> : <p>{i.antecedentes || 'Sin registros.'}</p>}</Bloque>}
          {incluir.medicamentos && <Bloque t={SECCIONES.medicamentos}>{d.meds.length ? <ul className="list-disc pl-5">{d.meds.map((m) => <li key={m.id}><b>{m.nombre} {m.concentracion}</b> — {m.dosis}; {m.frecuencia === 'horas' ? `cada ${m.cadaHoras} h` : m.horarios.join(', ')}{m.prescriptor ? ` · indicado por ${m.prescriptor}` : ''}</li>)}</ul> : <p>Ninguno activo.</p>}</Bloque>}
          {incluir.vacunas && <Bloque t={SECCIONES.vacunas}>{d.vac.length ? <ul className="list-disc pl-5">{d.vac.sort((a, b) => (a.fechaAplicada ?? '').localeCompare(b.fechaAplicada ?? '')).map((v) => <li key={v.id}>{v.nombre}{v.dosis ? ` (${v.dosis})` : ''} — {fechaCorta(v.fechaAplicada)}{v.lugar ? `, ${v.lugar}` : ''}{v.lote ? `, lote ${v.lote}` : ''}</li>)}</ul> : <p>Sin vacunas confirmadas.</p>}
            {d.carnet.some((f) => f.estado === 'atrasada' || f.estado === 'proxima') && <p className="mt-1 text-sm">Pendientes según el calendario cargado: {d.carnet.filter((f) => f.estado === 'atrasada' || f.estado === 'proxima').map((f) => `${f.esquema.nombre} (${f.esquema.dosis})`).join(', ')}.</p>}
          </Bloque>}
          {incluir.estudios && <Bloque t={SECCIONES.estudios}>{d.docs.length ? <ul className="list-disc pl-5">{d.docs.slice(0, 10).map((x) => <li key={x.id}>{x.nombre} — {x.categoria}, {fechaCorta(x.fechaRealizacion)}{x.laboratorio ? `, ${x.laboratorio}` : ''}</li>)}</ul> : <p>Sin estudios cargados.</p>}</Bloque>}
          {incluir.consultas && <Bloque t={SECCIONES.consultas}>{consultas.length ? <ul className="list-disc pl-5">{consultas.map((c, k) => <li key={k}>{fechaCorta(c.fecha)} — {c.titulo}{c.medico ? ` · ${c.medico}` : ''}</li>)}</ul> : <p>Sin consultas registradas.</p>}</Bloque>}
          {incluir.controles && i.tipo === 'persona' && <Bloque t={SECCIONES.controles}>{d.ctl.length ? <ul className="list-disc pl-5">{d.ctl.map((c) => <li key={c.rec.codigo}>{c.rec.nombre}: {c.estado === 'consultar' ? 'consultar con el profesional' : c.estado}{c.proxima ? ` (${fechaCorta(c.proxima)})` : ''}</li>)}</ul> : <p>Sin pendientes.</p>}</Bloque>}
          <p className="mt-4 border-t border-crema-200 pt-3 text-xs text-piedra-500">Información registrada por la familia. No constituye diagnóstico ni indicación médica. La interpretación corresponde al profesional de salud.</p>
          <Firma className="mt-2" />
        </article>

        <Tarjeta className="no-imprimir mt-4">
          <p className="font-bold">Carpeta digital de salud</p>
          <p className="text-sm text-piedra-600">Elegí documentos para compartir o descargar juntos.</p>
          <div className="mt-2 space-y-1">{d.docs.filter((x) => x.archivo).map((x: Documento) => (
            <label key={x.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-crema-100"><input type="checkbox" className="h-5 w-5 accent-turquesa-500" checked={elegidos.includes(x.id!)} onChange={(e) => setElegidos(e.target.checked ? [...elegidos, x.id!] : elegidos.filter((y) => y !== x.id))} /><span className="flex-1 text-sm">{x.nombre}</span><Insignia clase="bg-crema-200 text-piedra-600">{fechaCorta(x.fechaRealizacion)}</Insignia></label>
          ))}{!d.docs.some((x) => x.archivo) && <p className="text-sm text-piedra-500">No hay documentos con archivo adjunto.</p>}</div>
          {d.docs.some((x) => x.archivo) && <Boton variante="suave" icono="bajar" className="mt-3 w-full" onClick={carpeta}>Exportar documentos elegidos</Boton>}
        </Tarjeta>
      </Contenido>
    </>
  )
}

function Bloque({ t, children }: { t: string; children: React.ReactNode }) {
  return <section className="mt-4 break-inside-avoid"><h3 className="mb-1 text-sm font-extrabold uppercase tracking-wide text-salvia-700">{t}</h3><div className="space-y-0.5 text-sm text-piedra-800">{children}</div></section>
}

function descargar(x: Documento) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(x.archivo!)
  a.download = x.archivoNombre ?? x.nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}
