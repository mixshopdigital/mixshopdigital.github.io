import { db, ahora, getAjuste, registrarActividad, setAjuste } from './db'
import { ESQUEMA_INICIAL, RECOMENDACIONES_INICIALES } from './fuentes'
import { hoyISO, sumarDias, sumarMeses } from './salud'

/** Carga el catálogo de fuentes sanitarias si la base está vacía. */
/** Versión del catálogo incluido en la app. Subirla cuando cambie fuentes.ts. */
export const VERSION_CATALOGO = 2

/**
 * Carga el catálogo de fuentes sanitarias si la base está vacía, o lo actualiza
 * cuando la app trae una versión nueva. Se actualiza por código: los registros de
 * la familia (vacunas aplicadas, controles, fechas indicadas por el médico) no se tocan
 * y las vacunas que la persona agregó a mano se conservan.
 */
export async function asegurarCatalogos() {
  const version = await getAjuste<number>('catalogoVersion', 0)
  if (version >= VERSION_CATALOGO && (await db.esquemaVacunas.count()) > 0) return
  await db.transaction('rw', db.esquemaVacunas, db.recomendaciones, async () => {
    for (const e of ESQUEMA_INICIAL) {
      const previa = await db.esquemaVacunas.where('codigo').equals(e.codigo).first()
      await db.esquemaVacunas.put(previa ? { ...e, id: previa.id } : e)
    }
    for (const r of RECOMENDACIONES_INICIALES) {
      const previa = await db.recomendaciones.where('codigo').equals(r.codigo).first()
      await db.recomendaciones.put(previa ? { ...r, id: previa.id } : r)
    }
  })
  if (version > 0) await registrarActividad('Fuentes sanitarias actualizadas', `Catálogo versión ${VERSION_CATALOGO}`)
  await setAjuste('catalogoVersion', VERSION_CATALOGO)
}

const T = hoyISO
const hace = (d: number) => sumarDias(T(), -d)
const en = (d: number) => sumarDias(T(), d)
const edad = (anios: number, meses = 0, dias = 0) => sumarDias(sumarMeses(T(), -(anios * 12 + meses)), -dias)

/**
 * Familia de DEMOSTRACIÓN con datos ficticios. Todo queda marcado con demo: true
 * y la app lo muestra con la etiqueta "Ejemplo". No son datos de personas reales.
 */
export async function cargarDemo() {
  await asegurarCatalogos()
  const c = ahora()
  const base = { demo: true, creado: c, tipo: 'persona' as const }
  const madre = await db.integrantes.add({ ...base, nombre: 'Laura', apellido: 'Ejemplo', relacion: 'Madre', sexo: 'F', fechaNacimiento: edad(41, 3), avatar: '👩🏻', color: '#9479CF', grupoSanguineo: 'O+', alergias: 'Penicilina', cronicas: 'Hipotiroidismo', medicoCabecera: 'Dra. Ficticia Gómez', centroMedico: 'Centro de Salud de ejemplo', contactoEmergencia: 'Carlos – 0981 000 000 (ficticio)', telefono: '0981 000 001' })
  const padre = await db.integrantes.add({ ...base, nombre: 'Carlos', apellido: 'Ejemplo', relacion: 'Padre', sexo: 'M', fechaNacimiento: edad(52, 7), avatar: '👨🏽', color: '#4F8BC9', grupoSanguineo: 'A+', cronicas: 'Hipertensión arterial', medicoCabecera: 'Dr. Ficticio Benítez', antecedenteFamiliarProstata: false, contactoEmergencia: 'Laura – 0981 000 001 (ficticio)' })
  const hija = await db.integrantes.add({ ...base, nombre: 'Sofía', apellido: 'Ejemplo', relacion: 'Hija', sexo: 'F', fechaNacimiento: edad(15, 2), avatar: '👧🏻', color: '#EC7559', alergias: 'Ácaros', contactoEmergencia: 'Laura – 0981 000 001 (ficticio)' })
  const nene = await db.integrantes.add({ ...base, nombre: 'Mateo', apellido: 'Ejemplo', relacion: 'Hijo', sexo: 'M', fechaNacimiento: edad(1, 2, 10), avatar: '👶🏻', color: '#22A39B', contactoEmergencia: 'Laura – 0981 000 001 (ficticio)' })
  const toby = await db.integrantes.add({ ...base, tipo: 'mascota', nombre: 'Toby', relacion: 'Mascota', especie: 'Perro', raza: 'Mestizo', sexo: 'M', fechaNacimiento: edad(4), avatar: '🐶', color: '#B08A5B', peso: 14.5, veterinario: 'Veterinaria de ejemplo', microchip: '—' })

  await db.registros.bulkAdd([
    { integranteId: padre, categoria: 'Enfermedades diagnosticadas', fecha: sumarMeses(T(), -38), titulo: 'Hipertensión arterial', descripcion: 'Diagnóstico informado por el médico (dato ficticio).', medico: 'Dr. Ficticio Benítez', especialidad: 'Clínica médica', tratamiento: 'Enalapril (ver medicamentos)', demo: true, creado: c },
    { integranteId: padre, categoria: 'Consulta', fecha: hace(40), titulo: 'Control de presión', medico: 'Dr. Ficticio Benítez', especialidad: 'Clínica médica', centro: 'Centro de Salud de ejemplo', observaciones: 'Seguir con el mismo tratamiento.', demo: true, creado: c },
    { integranteId: madre, categoria: 'Enfermedades diagnosticadas', fecha: sumarMeses(T(), -60), titulo: 'Hipotiroidismo', medico: 'Dra. Ficticia Gómez', especialidad: 'Endocrinología', demo: true, creado: c },
    { integranteId: madre, categoria: 'Cirugías', fecha: sumarMeses(T(), -120), titulo: 'Apendicectomía', centro: 'Hospital de ejemplo', demo: true, creado: c },
    { integranteId: madre, categoria: 'Alergias', fecha: sumarMeses(T(), -200), titulo: 'Alergia a penicilina', descripcion: 'Erupción en la piel (dato ficticio).', demo: true, creado: c },
    { integranteId: hija, categoria: 'Consulta', fecha: hace(20), titulo: 'Consulta por rinitis', especialidad: 'Pediatría', medico: 'Dra. Ficticia Ruiz', demo: true, creado: c },
    { integranteId: nene, categoria: 'Consulta', fecha: hace(25), titulo: 'Control pediátrico del año', especialidad: 'Pediatría', medico: 'Dra. Ficticia Ruiz', observaciones: 'Crece bien según su pediatra.', demo: true, creado: c },
    { integranteId: toby, categoria: 'Control veterinario', fecha: hace(60), titulo: 'Control anual', medico: 'Veterinaria de ejemplo', demo: true, creado: c },
    { integranteId: toby, categoria: 'Antiparasitario interno', fecha: hace(85), titulo: 'Desparasitación interna', proximaFecha: en(5), observaciones: 'Próxima fecha indicada por el veterinario.', demo: true, creado: c },
    { integranteId: toby, categoria: 'Antiparasitario externo', fecha: hace(28), titulo: 'Pipeta antipulgas', proximaFecha: en(2), demo: true, creado: c },
    { integranteId: toby, categoria: 'Castración', fecha: sumarMeses(T(), -36), titulo: 'Castración', demo: true, creado: c },
  ])

  // Mediciones para gráficos (valores ficticios)
  const med = [] as { integranteId: number; tipo: string; fecha: string; valor: number; valor2?: number; referencia?: string; demo: boolean }[]
  ;[[150, 95], [142, 92], [138, 88], [135, 86], [132, 85], [130, 84]].forEach(([s, d], i) => med.push({ integranteId: padre, tipo: 'presion', fecha: sumarMeses(T(), -(5 - i)), valor: s, valor2: d, demo: true }))
  ;[88, 86, 85, 84.5, 83.8, 83].forEach((v, i) => med.push({ integranteId: padre, tipo: 'peso', fecha: sumarMeses(T(), -(5 - i)), valor: v, demo: true }))
  ;[104, 99, 96].forEach((v, i) => med.push({ integranteId: padre, tipo: 'glucemia', fecha: sumarMeses(T(), -(12 - i * 5)), valor: v, referencia: '70 – 110 mg/dL (según laboratorio de ejemplo)', demo: true }))
  ;[212, 198, 189].forEach((v, i) => med.push({ integranteId: padre, tipo: 'colesterol', fecha: sumarMeses(T(), -(12 - i * 5)), valor: v, referencia: 'Hasta 200 mg/dL (según laboratorio de ejemplo)', demo: true }))
  ;[12.9, 13.2].forEach((v, i) => med.push({ integranteId: madre, tipo: 'hemoglobina', fecha: sumarMeses(T(), -(8 - i * 6)), valor: v, referencia: '12 – 16 g/dL (según laboratorio de ejemplo)', demo: true }))
  ;[[0, 3.4, 50, 34.5], [2, 5.6, 58, 39], [4, 6.9, 63, 41], [6, 7.8, 67, 43], [9, 8.9, 71, 44.5], [12, 9.7, 75, 46]].forEach(([m, p, t, pc]) => {
    const f = sumarMeses(sumarDias(T(), -(14 * 30 + 10)), m)
    med.push({ integranteId: nene, tipo: 'peso', fecha: f, valor: p, demo: true })
    med.push({ integranteId: nene, tipo: 'talla', fecha: f, valor: t, demo: true })
    med.push({ integranteId: nene, tipo: 'perimetroCefalico', fecha: f, valor: pc, demo: true })
  })
  ;[13.2, 13.8, 14.5].forEach((v, i) => med.push({ integranteId: toby, tipo: 'peso', fecha: sumarMeses(T(), -(12 - i * 6)), valor: v, demo: true }))
  await db.mediciones.bulkAdd(med)

  // Documentos de ejemplo (sin archivo real: solo ficha)
  await db.documentos.bulkAdd([
    { integranteId: padre, nombre: 'Perfil lipídico y glucemia', categoria: 'Análisis de sangre', fechaRealizacion: sumarMeses(T(), -2), fechaEntrega: sumarDias(sumarMeses(T(), -2), 2), laboratorio: 'Laboratorio de ejemplo', observaciones: 'Documento de demostración, sin archivo.', demo: true, creado: c },
    { integranteId: madre, nombre: 'Hemograma completo', categoria: 'Hemograma', fechaRealizacion: sumarMeses(T(), -2), laboratorio: 'Laboratorio de ejemplo', demo: true, creado: c },
    { integranteId: madre, nombre: 'Ecografía de tiroides', categoria: 'Ecografía', fechaRealizacion: sumarMeses(T(), -7), laboratorio: 'Centro de imágenes de ejemplo', demo: true, creado: c },
    { integranteId: hija, nombre: 'Receta antialérgico', categoria: 'Receta', fechaRealizacion: hace(20), laboratorio: 'Dra. Ficticia Ruiz', demo: true, creado: c },
  ])

  // Medicamentos
  await db.medicamentos.bulkAdd([
    { integranteId: padre, nombre: 'Enalapril', principioActivo: 'Enalapril', presentacion: 'Comprimidos', concentracion: '10 mg', dosis: '1 comprimido', via: 'Oral', frecuencia: 'diaria', horarios: ['08:00', '20:00'], inicio: sumarMeses(T(), -38), prescriptor: 'Dr. Ficticio Benítez', indicaciones: 'Según indicación médica (ejemplo).', stock: 4, renovarReceta: en(5), activo: true, demo: true, creado: c },
    { integranteId: madre, nombre: 'Levotiroxina', principioActivo: 'Levotiroxina', presentacion: 'Comprimidos', concentracion: '75 mcg', dosis: '1 comprimido', via: 'Oral', frecuencia: 'diaria', horarios: ['06:00'], inicio: sumarMeses(T(), -60), prescriptor: 'Dra. Ficticia Gómez', indicaciones: 'En ayunas (ejemplo).', stock: 24, activo: true, demo: true, creado: c },
    { integranteId: hija, nombre: 'Antialérgico (ejemplo)', presentacion: 'Comprimidos', dosis: '1 comprimido', via: 'Oral', frecuencia: 'diaria', horarios: ['21:00'], inicio: hace(20), fin: en(2), prescriptor: 'Dra. Ficticia Ruiz', stock: 3, activo: true, demo: true, creado: c },
    { integranteId: toby, nombre: 'Suplemento articular (ejemplo)', dosis: '1 comprimido', via: 'Oral', frecuencia: 'dias', dias: [1, 3, 5], horarios: ['14:00'], inicio: hace(30), prescriptor: 'Veterinaria de ejemplo', activo: true, demo: true, creado: c },
  ])
  const meds = await db.medicamentos.where('integranteId').anyOf([padre, madre]).toArray()
  const tomas = []
  for (let d = 1; d <= 14; d++) {
    const f = hace(d)
    for (const m of meds) for (const h of m.horarios) tomas.push({ medicamentoId: m.id!, integranteId: m.integranteId, fecha: f, hora: h, estado: (d % 6 === 0 && h === '20:00' ? 'omitido' : 'tomado') as 'tomado' | 'omitido', registrado: c })
  }
  await db.tomas.bulkAdd(tomas)

  // Agenda
  await db.eventos.bulkAdd([
    { integranteId: padre, categoria: 'Consulta médica', fecha: en(1), hora: '09:30', especialidad: 'Cardiología', profesional: 'Dr. Ficticio Benítez', direccion: 'Dirección de ejemplo 123', motivo: 'Control de presión', estado: 'programado', demo: true, creado: c },
    { integranteId: madre, categoria: 'Laboratorio', fecha: en(3), hora: '07:00', profesional: 'Laboratorio de ejemplo', motivo: 'Perfil tiroideo', observaciones: 'Ir en ayunas (ejemplo).', estado: 'programado', demo: true, creado: c },
    { integranteId: nene, categoria: 'Vacunación', fecha: en(6), hora: '08:00', direccion: 'Vacunatorio de ejemplo', motivo: 'Vacunas de los 15 meses (verificar con el vacunatorio)', estado: 'programado', demo: true, creado: c },
    { integranteId: toby, categoria: 'Consulta veterinaria', fecha: en(10), hora: '17:00', profesional: 'Veterinaria de ejemplo', motivo: 'Vacuna antirrábica', estado: 'programado', demo: true, creado: c },
    { integranteId: hija, categoria: 'Consulta médica', fecha: hace(20), hora: '15:00', especialidad: 'Pediatría', profesional: 'Dra. Ficticia Ruiz', motivo: 'Rinitis', estado: 'realizado', demo: true, creado: c },
  ])

  // Vacunas registradas (ejemplo): Mateo con el esquema hasta los 12 meses
  const nac = (await db.integrantes.get(nene))!.fechaNacimiento!
  const codigos = ['bcg', 'hepb-rn', 'rota-1', 'hexa-1', 'pcv13-1', 'rota-2', 'hexa-2', 'pcv13-2', 'hexa-3', 'flu-6m', 'pcv13-r', 'flu-12m', 'spr-1', 'aa']
  const esquema = await db.esquemaVacunas.where('codigo').anyOf(codigos).toArray()
  await db.vacunas.bulkAdd(esquema.map((e) => ({ integranteId: nene, esquemaCodigo: e.codigo, nombre: e.nombre, dosis: e.dosis, fechaAplicada: sumarDias(sumarMeses(nac, e.edadMeses ?? 0), 3), lugar: 'Vacunatorio de ejemplo', confirmada: true, demo: true, creado: c })))
  await db.vacunas.bulkAdd([
    { integranteId: madre, esquemaCodigo: 'flu-anual', nombre: 'Influenza estacional', dosis: 'Dosis anual', fechaAplicada: sumarMeses(T(), -6), lugar: 'Vacunatorio de ejemplo', confirmada: true, demo: true, creado: c },
    { integranteId: toby, esquemaCodigo: 'vet-antirrabica', nombre: 'Antirrábica', fechaAplicada: sumarMeses(T(), -12), proximaDosis: en(10), lugar: 'Veterinaria de ejemplo', confirmada: true, demo: true, creado: c },
  ])

  // Controles preventivos
  await db.controles.bulkAdd([
    { integranteId: madre, recomendacionCodigo: 'mamografia', fecha: sumarMeses(T(), -13), observaciones: 'Ejemplo', demo: true },
    { integranteId: madre, recomendacionCodigo: 'pap', fecha: sumarMeses(T(), -14), proximaIndicada: en(20), observaciones: 'Fecha indicada por la profesional (ejemplo)', demo: true },
    { integranteId: padre, recomendacionCodigo: 'presion', fecha: hace(40), demo: true },
  ])

  // Ciclo menstrual (Laura)
  const ciclos = []
  let inicio = sumarDias(T(), -10)
  for (let i = 0; i < 6; i++) {
    ciclos.push({ integranteId: madre, inicio, fin: sumarDias(inicio, 4), intensidad: 'moderada' as const, dolor: 3 + (i % 3), sintomas: i % 2 ? ['Cólicos'] : ['Cansancio', 'Cólicos'], demo: true })
    inicio = sumarDias(inicio, -(28 + (i % 3) - 1))
  }
  await db.ciclos.bulkAdd(ciclos)

  await db.notas.bulkAdd([
    { integranteId: padre, tipo: 'sintoma', fecha: hace(3), texto: 'Dolor de cabeza leve por la mañana (ejemplo).', resuelta: false, demo: true },
    { integranteId: padre, tipo: 'pregunta', fecha: hace(2), texto: '¿Tengo que controlar la presión en casa? ¿Cuántas veces por semana?', resuelta: false, demo: true },
  ])

  await setAjuste('demo', true)
  await registrarActividad('Demostración cargada', 'Familia de ejemplo con datos ficticios')
}

export async function borrarDemo() {
  const ids = (await db.integrantes.filter((i) => !!i.demo).toArray()).map((i) => i.id!)
  await db.transaction('rw', db.tables, async () => {
    for (const t of [db.registros, db.documentos, db.mediciones, db.medicamentos, db.tomas, db.eventos, db.vacunas, db.controles, db.ciclos, db.etapas, db.notas]) {
      await (t as unknown as { where: (k: string) => { anyOf: (x: number[]) => { delete: () => Promise<number> } } }).where('integranteId').anyOf(ids).delete()
    }
    await db.integrantes.bulkDelete(ids)
    await db.ajustes.put({ clave: 'demo', valor: false })
  })
  await registrarActividad('Demostración borrada')
}
