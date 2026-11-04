import Dexie, { type Table } from 'dexie'

/*
 * Modelo de datos de Familia Sana.
 * Hoy se guarda en el celular (IndexedDB). Las mismas tablas y campos están
 * pensados para pasar a PostgreSQL (Supabase) sin cambiar la lógica: ver docs/ARQUITECTURA.md.
 */

export type Sexo = 'F' | 'M' | 'X'
export type TipoIntegrante = 'persona' | 'mascota'

export interface Integrante {
  id?: number
  tipo: TipoIntegrante
  nombre: string
  apellido?: string
  fechaNacimiento?: string // YYYY-MM-DD (aproximada en mascotas)
  sexo?: Sexo
  relacion?: string // Madre, Padre, Hijo/a, ...
  avatar?: string // emoji o dataURL de foto
  color?: string
  grupoSanguineo?: string
  documento?: string
  telefono?: string
  alergias?: string
  cronicas?: string
  antecedentes?: string
  medicoCabecera?: string
  centroMedico?: string
  seguro?: string
  contactoEmergencia?: string
  // mascotas
  especie?: string
  raza?: string
  peso?: number
  microchip?: string
  veterinario?: string
  // estado
  archivado?: boolean
  antecedenteFamiliarMama?: boolean
  antecedenteFamiliarProstata?: boolean
  demo?: boolean
  creado: string
}

export const CATEGORIAS_HISTORIA = [
  'Antecedentes personales',
  'Enfermedades diagnosticadas',
  'Cirugías',
  'Hospitalizaciones',
  'Alergias',
  'Antecedentes familiares',
  'Tratamientos actuales',
  'Observaciones médicas',
  'Consulta',
  // mascotas
  'Control veterinario',
  'Antiparasitario interno',
  'Antiparasitario externo',
  'Castración',
  'Alimentación',
] as const

export interface RegistroClinico {
  id?: number
  integranteId: number
  categoria: string
  fecha: string
  titulo: string
  descripcion?: string
  medico?: string
  especialidad?: string
  centro?: string
  diagnostico?: string
  tratamiento?: string
  observaciones?: string
  proximaFecha?: string // p. ej. próxima desparasitación indicada por el veterinario
  adjuntos?: number[] // ids de Documento
  demo?: boolean
  creado: string
}

export const CATEGORIAS_DOCUMENTO = [
  'Análisis de sangre', 'Hemograma', 'Glucemia', 'Colesterol', 'Creatinina', 'Análisis de orina',
  'Estudio hormonal', 'Ecografía', 'Radiografía', 'Tomografía', 'Resonancia', 'Electrocardiograma',
  'Informe médico', 'Receta', 'Biopsia', 'Carnet de vacunación', 'Otro',
] as const

export interface Documento {
  id?: number
  integranteId: number
  nombre: string
  categoria: string
  fechaRealizacion?: string
  fechaEntrega?: string
  laboratorio?: string
  observaciones?: string
  archivo?: Blob
  archivoNombre?: string
  archivoTipo?: string
  demo?: boolean
  creado: string
}

/** Valores numéricos para gráficos: peso, presión, glucemia, etc. */
export interface Medicion {
  id?: number
  integranteId: number
  tipo: string // clave de TIPOS_MEDICION
  fecha: string
  valor: number
  valor2?: number // presión diastólica
  referencia?: string // valor de referencia que informó el laboratorio
  documentoId?: number
  nota?: string
  demo?: boolean
}

export const TIPOS_MEDICION: Record<string, { nombre: string; unidad: string; doble?: boolean }> = {
  peso: { nombre: 'Peso', unidad: 'kg' },
  talla: { nombre: 'Talla', unidad: 'cm' },
  perimetroCefalico: { nombre: 'Perímetro cefálico', unidad: 'cm' },
  presion: { nombre: 'Presión arterial', unidad: 'mmHg', doble: true },
  glucemia: { nombre: 'Glucemia', unidad: 'mg/dL' },
  colesterol: { nombre: 'Colesterol total', unidad: 'mg/dL' },
  hemoglobina: { nombre: 'Hemoglobina', unidad: 'g/dL' },
  creatinina: { nombre: 'Creatinina', unidad: 'mg/dL' },
}

export type FrecuenciaMed = 'diaria' | 'dias' | 'horas'

export interface Medicamento {
  id?: number
  integranteId: number
  nombre: string
  principioActivo?: string
  presentacion?: string
  concentracion?: string
  dosis: string
  via?: string
  frecuencia: FrecuenciaMed
  horarios: string[] // HH:MM (diaria / dias)
  dias?: number[] // 0=domingo (si frecuencia = dias)
  cadaHoras?: number // si frecuencia = horas
  horaInicio?: string // primera toma si frecuencia = horas
  inicio: string
  fin?: string // vacío = permanente
  prescriptor?: string
  indicaciones?: string
  observaciones?: string
  recetaDocId?: number
  stock?: number // unidades que quedan
  renovarReceta?: string // fecha
  activo: boolean
  demo?: boolean
  creado: string
}

export type EstadoToma = 'tomado' | 'pospuesto' | 'omitido'
export interface Toma {
  id?: number
  medicamentoId: number
  integranteId: number
  fecha: string // YYYY-MM-DD
  hora: string // HH:MM programada
  estado: EstadoToma
  registrado: string
}

export const CATEGORIAS_EVENTO = [
  'Consulta médica', 'Laboratorio', 'Estudio', 'Vacunación', 'Control preventivo',
  'Consulta veterinaria', 'Retiro de medicamentos', 'Tratamiento',
] as const

export interface Evento {
  id?: number
  integranteId: number
  categoria: string
  fecha: string
  hora?: string
  especialidad?: string
  profesional?: string
  direccion?: string
  telefono?: string
  motivo?: string
  observaciones?: string
  estado: 'programado' | 'realizado' | 'cancelado'
  avisoDias?: number // 0 mismo día, 1, 3, 7...
  demo?: boolean
  creado: string
}

/** Catálogo editable de vacunas (esquema oficial). */
export interface VacunaEsquema {
  id?: number
  codigo: string
  nombre: string
  previene: string
  dosis: string
  edadMeses?: number // edad recomendada en meses (vacío = por grupo o condición)
  grupo: string // Recién nacido, Lactantes, Niños, Adolescentes, Adultos, Embarazadas, Mascotas...
  sexo?: Sexo
  nota?: string
  fuente: string
  url?: string
  revisado?: string
  verificado: boolean // false = requiere verificación contra la fuente oficial
  especie?: string // para mascotas
  activo: boolean
}

export interface VacunaAplicada {
  id?: number
  integranteId: number
  esquemaCodigo?: string // vacía si es una vacuna fuera del esquema
  nombre: string
  dosis?: string
  fechaAplicada?: string
  lugar?: string
  lote?: string
  proximaDosis?: string
  confirmada: boolean // el usuario confirma que se aplicó
  observaciones?: string
  fotoDocId?: number
  demo?: boolean
  creado: string
}

/** Catálogo de recomendaciones preventivas (módulo de fuentes sanitarias). */
export interface Recomendacion {
  id?: number
  codigo: string
  nombre: string
  categoria: 'Salud femenina' | 'Salud masculina' | 'Salud infantil' | 'General'
  poblacion: string
  sexo?: Sexo
  edadDesde?: number // años
  edadHasta?: number
  edadDesdeConAntecedente?: number
  frecuenciaMeses?: number // vacío = según indicación médica
  frecuenciaTexto: string
  fuente: string
  url?: string
  fechaPublicacion?: string
  fechaRevision?: string
  vigencia: 'vigente' | 'requiere verificación' | 'reemplazada'
  automatica: boolean // false = solo se muestra; el médico decide
  nota?: string
  version: number
}

export interface ControlRealizado {
  id?: number
  integranteId: number
  recomendacionCodigo: string
  fecha: string
  proximaIndicada?: string // si el médico indicó otra fecha
  observaciones?: string
  demo?: boolean
}

export interface Ciclo {
  id?: number
  integranteId: number
  inicio: string
  fin?: string
  intensidad?: 'leve' | 'moderada' | 'abundante'
  dolor?: number // 0..10
  sintomas?: string[]
  animo?: string
  observaciones?: string
  demo?: boolean
}

export interface EtapaFemenina {
  id?: number
  integranteId: number
  etapa: 'Embarazo' | 'Lactancia' | 'Posparto' | 'Menopausia' | 'Tratamiento hormonal'
  desde: string
  hasta?: string
  nota?: string
  demo?: boolean
}

/** "Tengo una consulta": síntomas y preguntas para llevar al médico. */
export interface Nota {
  id?: number
  integranteId: number
  tipo: 'sintoma' | 'pregunta'
  fecha: string
  texto: string
  resuelta: boolean
  demo?: boolean
}

export interface Ajuste {
  clave: string
  valor: unknown
}

export interface Actividad {
  id?: number
  fecha: string
  accion: string
  detalle?: string
}

class FamiliaSanaDB extends Dexie {
  integrantes!: Table<Integrante, number>
  registros!: Table<RegistroClinico, number>
  documentos!: Table<Documento, number>
  mediciones!: Table<Medicion, number>
  medicamentos!: Table<Medicamento, number>
  tomas!: Table<Toma, number>
  eventos!: Table<Evento, number>
  esquemaVacunas!: Table<VacunaEsquema, number>
  vacunas!: Table<VacunaAplicada, number>
  recomendaciones!: Table<Recomendacion, number>
  controles!: Table<ControlRealizado, number>
  ciclos!: Table<Ciclo, number>
  etapas!: Table<EtapaFemenina, number>
  notas!: Table<Nota, number>
  ajustes!: Table<Ajuste, string>
  actividad!: Table<Actividad, number>

  constructor() {
    super('familia-sana')
    this.version(1).stores({
      integrantes: '++id, tipo, archivado, demo',
      registros: '++id, integranteId, categoria, fecha, demo',
      documentos: '++id, integranteId, categoria, fechaRealizacion, demo',
      mediciones: '++id, integranteId, tipo, fecha, [integranteId+tipo], demo',
      medicamentos: '++id, integranteId, activo, demo',
      tomas: '++id, medicamentoId, integranteId, fecha, [medicamentoId+fecha+hora]',
      eventos: '++id, integranteId, fecha, categoria, estado, demo',
      esquemaVacunas: '++id, &codigo, grupo, especie',
      vacunas: '++id, integranteId, esquemaCodigo, demo',
      recomendaciones: '++id, &codigo, categoria',
      controles: '++id, integranteId, recomendacionCodigo, demo',
      ciclos: '++id, integranteId, inicio, demo',
      etapas: '++id, integranteId, demo',
      notas: '++id, integranteId, resuelta, demo',
      ajustes: '&clave',
      actividad: '++id, fecha',
    })
  }
}

export const db = new FamiliaSanaDB()

export const ahora = () => new Date().toISOString()

export async function registrarActividad(accion: string, detalle?: string) {
  await db.actividad.add({ fecha: ahora(), accion, detalle })
}

export async function getAjuste<T>(clave: string, porDefecto: T): Promise<T> {
  const a = await db.ajustes.get(clave)
  return (a?.valor as T) ?? porDefecto
}

export async function setAjuste(clave: string, valor: unknown) {
  await db.ajustes.put({ clave, valor })
}

/** Borra un integrante y todo lo asociado. */
export async function eliminarIntegrante(id: number) {
  await db.transaction('rw', [db.integrantes, db.registros, db.documentos, db.mediciones, db.medicamentos, db.tomas, db.eventos, db.vacunas, db.controles, db.ciclos, db.etapas, db.notas], async () => {
    for (const t of [db.registros, db.documentos, db.mediciones, db.medicamentos, db.tomas, db.eventos, db.vacunas, db.controles, db.ciclos, db.etapas, db.notas] as Table<{ integranteId: number }, number>[]) {
      await t.where('integranteId').equals(id).delete()
    }
    await db.integrantes.delete(id)
  })
  await registrarActividad('Integrante eliminado', `#${id}`)
}
