import type { Ciclo, ControlRealizado, Evento, Integrante, Medicamento, Recomendacion, Toma, VacunaAplicada, VacunaEsquema } from './db'

// ---------- Fechas ----------
export const hoyISO = () => aISO(new Date())
export function aISO(d: Date) {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
export function deISO(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
export function sumarMeses(s: string, meses: number) {
  const d = deISO(s)
  const dia = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + meses)
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(dia, ultimo))
  return aISO(d)
}
export function sumarDias(s: string, dias: number) {
  const d = deISO(s)
  d.setDate(d.getDate() + dias)
  return aISO(d)
}
export function diasEntre(a: string, b: string) {
  return Math.round((deISO(b).getTime() - deISO(a).getTime()) / 86400000)
}
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export function fechaLarga(s?: string) {
  if (!s) return '—'
  const d = deISO(s)
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}
export function fechaCorta(s?: string) {
  if (!s) return '—'
  const d = deISO(s)
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`
}
export function nombreMes(m: number) { return MESES[m] }
export function cuando(s: string) {
  const n = diasEntre(hoyISO(), s)
  if (n === 0) return 'hoy'
  if (n === 1) return 'mañana'
  if (n === -1) return 'ayer'
  if (n > 1 && n < 7) return `en ${n} días`
  if (n < -1 && n > -30) return `hace ${-n} días`
  return fechaCorta(s)
}

// ---------- Edad ----------
export function edadMeses(nacimiento?: string, ref = hoyISO()) {
  if (!nacimiento) return undefined
  const a = deISO(nacimiento), b = deISO(ref)
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  if (b.getDate() < a.getDate()) m--
  return m
}
export function edadAnios(nacimiento?: string) {
  const m = edadMeses(nacimiento)
  return m === undefined ? undefined : Math.floor(m / 12)
}
export function textoEdad(nacimiento?: string) {
  const m = edadMeses(nacimiento)
  if (m === undefined) return 'Edad sin cargar'
  if (m < 0) return 'Fecha futura'
  if (m < 1) {
    const d = diasEntre(nacimiento!, hoyISO())
    return `${d} ${d === 1 ? 'día' : 'días'}`
  }
  if (m < 24) return `${m} ${m === 1 ? 'mes' : 'meses'}`
  const a = Math.floor(m / 12)
  return `${a} años`
}
export function nombreCompleto(i?: Integrante) {
  if (!i) return ''
  return [i.nombre, i.apellido].filter(Boolean).join(' ')
}

// ---------- Vacunas ----------
export type EstadoVacuna = 'aplicada' | 'atrasada' | 'proxima' | 'pendiente' | 'verificar'
export interface FilaVacuna {
  esquema: VacunaEsquema
  fechaSugerida?: string
  aplicada?: VacunaAplicada
  estado: EstadoVacuna
}

/** Calcula el carnet sugerido de una persona a partir de su fecha de nacimiento. */
export function carnetVacunas(p: Integrante, esquema: VacunaEsquema[], aplicadas: VacunaAplicada[], hoy = hoyISO()): FilaVacuna[] {
  const filas: FilaVacuna[] = []
  for (const e of esquema) {
    if (!e.activo || e.grupo === 'Mascotas') continue
    if (e.sexo && p.sexo && e.sexo !== p.sexo) continue
    const aplicada = aplicadas.find((a) => a.esquemaCodigo === e.codigo && a.confirmada)
    const registrada = aplicadas.find((a) => a.esquemaCodigo === e.codigo && !a.confirmada)
    if (e.edadMeses === undefined) {
      // vacunas por grupo o condición (embarazo, campañas): solo se muestran si ya hay registro
      if (aplicada || registrada) filas.push({ esquema: e, aplicada: aplicada ?? registrada, estado: aplicada ? 'aplicada' : 'verificar' })
      continue
    }
    if (!p.fechaNacimiento) {
      filas.push({ esquema: e, aplicada, estado: aplicada ? 'aplicada' : 'verificar' })
      continue
    }
    const fechaSugerida = sumarMeses(p.fechaNacimiento, e.edadMeses)
    let estado: EstadoVacuna
    if (aplicada) estado = 'aplicada'
    else if (registrada) estado = 'verificar'
    else {
      const d = diasEntre(hoy, fechaSugerida)
      // Si pasó más de un año sin registro, lo más probable es que falte cargarla:
      // pedimos revisar el carnet en papel en lugar de marcarla como atrasada.
      if (d < -365) estado = 'verificar'
      else if (d < -30) estado = 'atrasada'
      else if (d <= 30) estado = 'proxima'
      else estado = 'pendiente'
    }
    filas.push({ esquema: e, fechaSugerida, aplicada: aplicada ?? registrada, estado })
  }
  return filas.sort((a, b) => (a.esquema.edadMeses ?? 9999) - (b.esquema.edadMeses ?? 9999))
}

export const ESTADO_VACUNA: Record<EstadoVacuna, { texto: string; clase: string }> = {
  aplicada: { texto: 'Aplicada', clase: 'bg-salvia-100 text-salvia-700' },
  proxima: { texto: 'Próxima', clase: 'bg-turquesa-100 text-turquesa-700' },
  pendiente: { texto: 'Pendiente', clase: 'bg-crema-200 text-piedra-700' },
  atrasada: { texto: 'Atrasada', clase: 'bg-coral-100 text-coral-600' },
  verificar: { texto: 'Requiere verificación', clase: 'bg-cielo-100 text-cielo-600' },
}

// ---------- Prevención ----------
export type EstadoControl = 'al dia' | 'proximo' | 'vencido' | 'sin registro' | 'consultar'
export interface FilaControl {
  rec: Recomendacion
  ultimo?: ControlRealizado
  proxima?: string
  estado: EstadoControl
  motivo: string
}

export function aplicaRecomendacion(p: Integrante, r: Recomendacion) {
  if (p.tipo !== 'persona') return false
  if (r.sexo && p.sexo !== r.sexo) return false
  const anios = edadAnios(p.fechaNacimiento)
  if (anios === undefined) return !r.edadHasta
  const antecedente = r.codigo === 'prostata' ? p.antecedenteFamiliarProstata : r.codigo === 'mamografia' ? p.antecedenteFamiliarMama : false
  const desde = antecedente && r.edadDesdeConAntecedente !== undefined ? r.edadDesdeConAntecedente : r.edadDesde
  if (desde !== undefined && anios < desde) return false
  if (r.edadHasta !== undefined && anios >= r.edadHasta) return false
  return true
}

export function controlesDe(p: Integrante, recs: Recomendacion[], hechos: ControlRealizado[], hoy = hoyISO()): FilaControl[] {
  return recs
    .filter((r) => r.vigencia !== 'reemplazada' && aplicaRecomendacion(p, r))
    .map((rec) => {
      const delTipo = hechos.filter((h) => h.recomendacionCodigo === rec.codigo).sort((a, b) => b.fecha.localeCompare(a.fecha))
      const ultimo = delTipo[0]
      let proxima = ultimo?.proximaIndicada
      if (!proxima && ultimo && rec.frecuenciaMeses && rec.automatica) proxima = sumarMeses(ultimo.fecha, rec.frecuenciaMeses)
      let estado: EstadoControl
      let motivo: string
      if (!ultimo) {
        estado = rec.automatica ? 'sin registro' : 'consultar'
        motivo = rec.automatica ? 'Todavía no registraste este control.' : 'Consultá con tu profesional cuándo corresponde.'
      } else if (proxima) {
        const d = diasEntre(hoy, proxima)
        estado = d < 0 ? 'vencido' : d <= 30 ? 'proximo' : 'al dia'
        motivo = ultimo.proximaIndicada ? 'Fecha indicada por el profesional.' : `Sugerida según la fuente (${rec.frecuenciaTexto.toLowerCase()}).`
      } else {
        estado = 'al dia'
        motivo = 'Registrado. La próxima fecha la define tu profesional.'
      }
      return { rec, ultimo, proxima, estado, motivo }
    })
}

export const ESTADO_CONTROL: Record<EstadoControl, { texto: string; clase: string }> = {
  'al dia': { texto: 'Al día', clase: 'bg-salvia-100 text-salvia-700' },
  proximo: { texto: 'Próximo', clase: 'bg-turquesa-100 text-turquesa-700' },
  vencido: { texto: 'Necesita atención', clase: 'bg-coral-100 text-coral-600' },
  'sin registro': { texto: 'Sin registro', clase: 'bg-crema-200 text-piedra-700' },
  consultar: { texto: 'Consultar al médico', clase: 'bg-cielo-100 text-cielo-600' },
}

// ---------- Medicamentos ----------
export interface TomaProgramada {
  med: Medicamento
  fecha: string
  hora: string
  registro?: Toma
}

export function tomasDelDia(meds: Medicamento[], tomas: Toma[], fecha = hoyISO()): TomaProgramada[] {
  const d = deISO(fecha)
  const lista: TomaProgramada[] = []
  for (const m of meds) {
    if (!m.activo) continue
    if (m.inicio > fecha) continue
    if (m.fin && m.fin < fecha) continue
    let horas: string[] = []
    if (m.frecuencia === 'diaria') horas = m.horarios
    else if (m.frecuencia === 'dias') horas = m.dias?.includes(d.getDay()) ? m.horarios : []
    else if (m.frecuencia === 'horas' && m.cadaHoras && m.horaInicio) {
      // horario "cada X horas" contado desde la primera toma del día de inicio
      const [h0, min0] = m.horaInicio.split(':').map(Number)
      const inicio = deISO(m.inicio)
      inicio.setHours(h0, min0, 0, 0)
      const desde = new Date(d); desde.setHours(0, 0, 0, 0)
      const hasta = new Date(d); hasta.setHours(23, 59, 59, 999)
      const paso = m.cadaHoras * 3600000
      let t = inicio.getTime()
      if (t < desde.getTime()) t += Math.ceil((desde.getTime() - t) / paso) * paso
      for (; t <= hasta.getTime(); t += paso) {
        const x = new Date(t)
        horas.push(`${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`)
      }
    }
    for (const hora of horas) {
      lista.push({ med: m, fecha, hora, registro: tomas.find((t) => t.medicamentoId === m.id && t.fecha === fecha && t.hora === hora) })
    }
  }
  return lista.sort((a, b) => a.hora.localeCompare(b.hora))
}

export function cumplimiento(tomas: Toma[]) {
  const total = tomas.filter((t) => t.estado !== 'pospuesto').length
  if (!total) return undefined
  return Math.round((tomas.filter((t) => t.estado === 'tomado').length / total) * 100)
}

// ---------- Ciclo menstrual ----------
export interface Prediccion {
  promedioCiclo: number
  promedioSangrado: number
  proximo: string
  ventanaFertilDesde: string
  ventanaFertilHasta: string
  ciclosUsados: number
}

/** Estimación simple a partir de los ciclos registrados. No es método anticonceptivo. */
export function predecirCiclo(ciclos: Ciclo[]): Prediccion | undefined {
  const orden = [...ciclos].sort((a, b) => a.inicio.localeCompare(b.inicio))
  if (orden.length < 2) return undefined
  const largos: number[] = []
  for (let i = 1; i < orden.length; i++) {
    const l = diasEntre(orden[i - 1].inicio, orden[i].inicio)
    if (l >= 15 && l <= 60) largos.push(l)
  }
  if (!largos.length) return undefined
  const ultimos = largos.slice(-6)
  const promedioCiclo = Math.round(ultimos.reduce((a, b) => a + b, 0) / ultimos.length)
  const sangrados = orden.filter((c) => c.fin).map((c) => diasEntre(c.inicio, c.fin!) + 1)
  const promedioSangrado = sangrados.length ? Math.round(sangrados.reduce((a, b) => a + b, 0) / sangrados.length) : 5
  const ultimo = orden[orden.length - 1].inicio
  let proximo = sumarDias(ultimo, promedioCiclo)
  while (proximo < hoyISO() && diasEntre(proximo, hoyISO()) > promedioCiclo) proximo = sumarDias(proximo, promedioCiclo)
  const ovulacion = sumarDias(proximo, -14)
  return { promedioCiclo, promedioSangrado, proximo, ventanaFertilDesde: sumarDias(ovulacion, -5), ventanaFertilHasta: sumarDias(ovulacion, 1), ciclosUsados: ultimos.length + 1 }
}

// ---------- Recordatorios ----------
export interface Aviso {
  id: string
  tipo: 'medicamento' | 'vacuna' | 'consulta' | 'control' | 'renovacion' | 'tratamiento' | 'veterinaria' | 'stock'
  integranteId: number
  titulo: string
  detalle: string
  fecha: string
  hora?: string
  urgencia: 'alta' | 'media' | 'baja'
  ruta: string
}

export function eventoAviso(e: Evento, nombre: string): Aviso {
  return {
    id: `ev-${e.id}`, tipo: e.categoria === 'Consulta veterinaria' ? 'veterinaria' : 'consulta', integranteId: e.integranteId,
    titulo: `${e.categoria}${e.especialidad ? ` · ${e.especialidad}` : ''}`,
    detalle: `${nombre}${e.profesional ? ` con ${e.profesional}` : ''}`,
    fecha: e.fecha, hora: e.hora, urgencia: e.fecha === hoyISO() ? 'alta' : 'media', ruta: `#/agenda/${e.id}`,
  }
}
