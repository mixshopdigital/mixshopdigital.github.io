import { db, getAjuste } from './db'
import { carnetVacunas, controlesDe, diasEntre, eventoAviso, hoyISO, nombreCompleto, sumarDias, tomasDelDia, type Aviso } from './salud'

/** Junta todos los recordatorios pendientes de la familia, calculados con los datos cargados. */
export async function calcularAvisos(): Promise<Aviso[]> {
  const hoy = hoyISO()
  const anticipacion = await getAjuste<number>('anticipacion', 3)
  const [integrantes, eventos, meds, tomas, esquema, vacunas, recs, controles, registros] = await Promise.all([
    db.integrantes.filter((i) => !i.archivado).toArray(),
    db.eventos.where('estado').equals('programado').toArray(),
    db.medicamentos.filter((m) => m.activo).toArray(),
    db.tomas.where('fecha').equals(hoy).toArray(),
    db.esquemaVacunas.toArray(),
    db.vacunas.toArray(),
    db.recomendaciones.toArray(),
    db.controles.toArray(),
    db.registros.filter((r) => !!r.proximaFecha).toArray(),
  ])
  const medsActivos = meds
  const nombre = new Map(integrantes.map((i) => [i.id!, i.nombre]))
  const vivos = new Set(integrantes.map((i) => i.id!))
  const avisos: Aviso[] = []

  // Tomas de hoy sin registrar
  const ahora = new Date()
  const hhmm = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`
  for (const t of tomasDelDia(medsActivos.filter((m) => vivos.has(m.integranteId)), tomas, hoy)) {
    if (t.registro && t.registro.estado !== 'pospuesto') continue
    avisos.push({
      id: `toma-${t.med.id}-${t.hora}`, tipo: 'medicamento', integranteId: t.med.integranteId,
      titulo: `${t.med.nombre} ${t.med.dosis ? `· ${t.med.dosis}` : ''}`, detalle: `${nombre.get(t.med.integranteId)} · ${t.hora}${t.registro?.estado === 'pospuesto' ? ' (pospuesto)' : ''}`,
      fecha: hoy, hora: t.hora, urgencia: t.hora <= hhmm ? 'alta' : 'media', ruta: '#/medicamentos',
    })
  }

  // Medicamentos: stock, fin de tratamiento, receta
  for (const m of medsActivos) {
    if (!vivos.has(m.integranteId)) continue
    const quien = nombre.get(m.integranteId) ?? ''
    if (m.stock !== undefined && m.stock <= 5) avisos.push({ id: `stock-${m.id}`, tipo: 'stock', integranteId: m.integranteId, titulo: `${m.nombre} se está terminando`, detalle: `${quien} · quedan ${m.stock}`, fecha: hoy, urgencia: m.stock <= 2 ? 'alta' : 'media', ruta: `#/medicamentos/${m.id}` })
    if (m.fin && diasEntre(hoy, m.fin) >= 0 && diasEntre(hoy, m.fin) <= 3) avisos.push({ id: `fin-${m.id}`, tipo: 'tratamiento', integranteId: m.integranteId, titulo: `Termina el tratamiento con ${m.nombre}`, detalle: quien, fecha: m.fin, urgencia: 'baja', ruta: `#/medicamentos/${m.id}` })
    if (m.renovarReceta && diasEntre(hoy, m.renovarReceta) <= 7) avisos.push({ id: `receta-${m.id}`, tipo: 'renovacion', integranteId: m.integranteId, titulo: `Renovar receta de ${m.nombre}`, detalle: quien, fecha: m.renovarReceta, urgencia: diasEntre(hoy, m.renovarReceta) < 0 ? 'alta' : 'media', ruta: `#/medicamentos/${m.id}` })
  }

  // Agenda
  for (const e of eventos) {
    if (!vivos.has(e.integranteId)) continue
    const dias = diasEntre(hoy, e.fecha)
    const aviso = e.avisoDias ?? anticipacion
    if (dias >= 0 && dias <= aviso) avisos.push(eventoAviso(e, nombre.get(e.integranteId) ?? ''))
  }

  // Vacunas próximas o atrasadas
  for (const p of integrantes.filter((i) => i.tipo === 'persona')) {
    for (const f of carnetVacunas(p, esquema, vacunas.filter((v) => v.integranteId === p.id))) {
      if (f.estado === 'atrasada' || f.estado === 'proxima') {
        avisos.push({ id: `vac-${p.id}-${f.esquema.codigo}`, tipo: 'vacuna', integranteId: p.id!, titulo: `Vacuna ${f.esquema.nombre} · ${f.esquema.dosis}`, detalle: `${nombreCompleto(p)} · ${f.estado === 'atrasada' ? 'atrasada, verificá el carnet' : 'próxima'}`, fecha: f.fechaSugerida!, urgencia: f.estado === 'atrasada' ? 'alta' : 'media', ruta: `#/vacunas/${p.id}` })
      }
    }
    for (const c of controlesDe(p, recs, controles.filter((x) => x.integranteId === p.id))) {
      if (c.estado === 'vencido' || c.estado === 'proximo') avisos.push({ id: `ctl-${p.id}-${c.rec.codigo}`, tipo: 'control', integranteId: p.id!, titulo: c.rec.nombre, detalle: `${p.nombre} · ${c.estado === 'vencido' ? 'necesita atención' : 'se acerca'}`, fecha: c.proxima!, urgencia: c.estado === 'vencido' ? 'alta' : 'baja', ruta: `#/prevencion/${p.id}` })
    }
  }

  // Próximas fechas indicadas por el veterinario o el médico (desparasitaciones, etc.)
  for (const r of registros) {
    if (!vivos.has(r.integranteId)) continue
    const d = diasEntre(hoy, r.proximaFecha!)
    if (d <= Math.max(anticipacion, 7)) avisos.push({ id: `reg-${r.id}`, tipo: 'veterinaria', integranteId: r.integranteId, titulo: `${r.categoria}: ${r.titulo}`, detalle: `${nombre.get(r.integranteId)} · ${d < 0 ? 'fecha pasada' : 'próxima fecha'}`, fecha: r.proximaFecha!, urgencia: d < 0 ? 'alta' : 'media', ruta: `#/integrante/${r.integranteId}` })
  }
  // Vacunas de mascotas con próxima dosis
  for (const v of vacunas) {
    if (!v.proximaDosis || !vivos.has(v.integranteId)) continue
    const d = diasEntre(hoy, v.proximaDosis)
    if (d <= 7) avisos.push({ id: `vprox-${v.id}`, tipo: 'vacuna', integranteId: v.integranteId, titulo: `Próxima dosis: ${v.nombre}`, detalle: `${nombre.get(v.integranteId)}`, fecha: v.proximaDosis, urgencia: d < 0 ? 'alta' : 'media', ruta: `#/vacunas/${v.integranteId}` })
  }

  const descartados = new Set(await getAjuste<string[]>(`descartados-${hoy}`, []))
  const peso = { alta: 0, media: 1, baja: 2 }
  return avisos
    .filter((a) => !descartados.has(a.id))
    .sort((a, b) => peso[a.urgencia] - peso[b.urgencia] || a.fecha.localeCompare(b.fecha) || (a.hora ?? '').localeCompare(b.hora ?? ''))
}

// ---------- Notificaciones del sistema ----------
export function soportaNotificaciones() {
  return 'Notification' in window && 'serviceWorker' in navigator
}

export async function pedirPermisoNotificaciones() {
  if (!soportaNotificaciones()) return 'no-soportado'
  return Notification.requestPermission()
}

/**
 * Revisa cada minuto mientras la app está abierta (o en segundo plano, si el sistema lo permite)
 * y muestra una notificación para las tomas y citas que llegan a su hora.
 * Limitación: sin un servidor de envío (Web Push), el celular puede no avisar si la app está cerrada.
 */
export function iniciarVigilante() {
  const enviados = new Set<string>()
  const revisar = async () => {
    if (!soportaNotificaciones() || Notification.permission !== 'granted') return
    if (!(await getAjuste('notificaciones', false))) return
    const ahora = new Date()
    const hhmm = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`
    const avisos = await calcularAvisos()
    const reg = await navigator.serviceWorker.getRegistration()
    for (const a of avisos) {
      const listo = a.tipo === 'medicamento' ? a.hora! <= hhmm : a.fecha === hoyISO() || a.fecha === sumarDias(hoyISO(), 1)
      const clave = `${a.id}-${hoyISO()}`
      if (!listo || enviados.has(clave)) continue
      enviados.add(clave)
      const opciones = { body: a.detalle, icon: './icono-192.png', badge: './icono-192.png', tag: clave, data: { ruta: a.ruta } }
      if (reg) reg.showNotification(a.titulo, opciones)
      else new Notification(a.titulo, opciones)
    }
  }
  revisar()
  return window.setInterval(revisar, 60000)
}
