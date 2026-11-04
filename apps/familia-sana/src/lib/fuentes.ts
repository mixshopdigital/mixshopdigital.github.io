import type { Recomendacion, VacunaEsquema } from './db'

/*
 * Catálogo inicial de fuentes sanitarias.
 *
 * IMPORTANTE: durante el desarrollo no se pudo abrir directamente pai.mspbs.gov.py
 * (la red del entorno lo bloqueaba). Lo cargado abajo sale de textos publicados por el
 * PAI y el MSPBS que aparecen citados en buscadores, por eso TODO queda marcado como
 * "requiere verificación" (verificado: false). Antes de publicar la app hay que comparar
 * cada fila con la tabla oficial vigente y marcarla como verificada desde
 * Configuración > Fuentes sanitarias. Nada de esto reemplaza al vacunatorio ni al médico.
 */

const PAI = 'Programa Ampliado de Inmunizaciones (PAI) – MSPBS'
const PAI_URL = 'https://pai.mspbs.gov.py/esquema-de-vacunacion-2-2/'
const PAI_URL2 = 'https://pai.mspbs.gov.py/esquema-regular-de-vacunacion/'

type V = Omit<VacunaEsquema, 'id' | 'fuente' | 'verificado' | 'activo'> & Partial<Pick<VacunaEsquema, 'url'>>

const v = (x: V): VacunaEsquema => ({ fuente: PAI, url: PAI_URL, verificado: false, activo: true, ...x })

export const ESQUEMA_INICIAL: VacunaEsquema[] = [
  v({ codigo: 'bcg', nombre: 'BCG', previene: 'Formas graves de tuberculosis', dosis: 'Dosis única', edadMeses: 0, grupo: 'Recién nacido' }),
  v({ codigo: 'hepb-rn', nombre: 'Hepatitis B pediátrica', previene: 'Hepatitis B', dosis: 'Dosis al nacer', edadMeses: 0, grupo: 'Recién nacido' }),

  v({ codigo: 'rota-1', nombre: 'Rotavirus', previene: 'Diarrea grave por rotavirus', dosis: '1ª dosis', edadMeses: 2, grupo: 'Lactantes' }),
  v({ codigo: 'hexa-1', nombre: 'Hexavalente', previene: 'Difteria, tétanos, tos ferina, hepatitis B, poliomielitis (inactivada) y Haemophilus influenzae tipo b', dosis: '1ª dosis', edadMeses: 2, grupo: 'Lactantes' }),
  v({ codigo: 'pcv13-1', nombre: 'Neumococo conjugada 13 valente', previene: 'Neumonía, meningitis, otitis', dosis: '1ª dosis', edadMeses: 2, grupo: 'Lactantes' }),

  v({ codigo: 'rota-2', nombre: 'Rotavirus', previene: 'Diarrea grave por rotavirus', dosis: '2ª dosis', edadMeses: 4, grupo: 'Lactantes' }),
  v({ codigo: 'hexa-2', nombre: 'Hexavalente', previene: 'Difteria, tétanos, tos ferina, hepatitis B, poliomielitis (inactivada) y Haemophilus influenzae tipo b', dosis: '2ª dosis', edadMeses: 4, grupo: 'Lactantes' }),
  v({ codigo: 'pcv13-2', nombre: 'Neumococo conjugada 13 valente', previene: 'Neumonía, meningitis, otitis', dosis: '2ª dosis', edadMeses: 4, grupo: 'Lactantes' }),

  v({ codigo: 'hexa-3', nombre: 'Hexavalente', previene: 'Difteria, tétanos, tos ferina, hepatitis B, poliomielitis (inactivada) y Haemophilus influenzae tipo b', dosis: 'Dosis de los 6 meses (verificar número de dosis)', edadMeses: 6, grupo: 'Lactantes' }),
  v({ codigo: 'flu-6m', nombre: 'Influenza estacional', previene: 'Cuadros graves de influenza', dosis: 'Dosis anual (desde los 6 meses)', edadMeses: 6, grupo: 'Lactantes', nota: 'Se repite cada año en la campaña de invierno.' }),

  v({ codigo: 'pcv13-r', nombre: 'Neumococo conjugada 13 valente', previene: 'Neumonía, meningitis, otitis', dosis: 'Refuerzo', edadMeses: 12, grupo: 'Niños' }),
  v({ codigo: 'spr-1', nombre: 'SPR (triple viral)', previene: 'Sarampión, paperas, rubéola', dosis: '1ª dosis', edadMeses: 12, grupo: 'Niños' }),
  v({ codigo: 'aa', nombre: 'Fiebre amarilla (AA)', previene: 'Fiebre amarilla', dosis: 'Dosis única', edadMeses: 12, grupo: 'Niños' }),

  v({ codigo: 'vari-1', nombre: 'Varicela', previene: 'Cuadros graves y complicaciones por varicela', dosis: '1ª dosis', edadMeses: 15, grupo: 'Niños' }),
  v({ codigo: 'hepa', nombre: 'Hepatitis A', previene: 'Cuadros graves y complicaciones por hepatitis A', dosis: 'Dosis única', edadMeses: 15, grupo: 'Niños' }),

  v({ codigo: 'flu-2a', nombre: 'Influenza estacional', previene: 'Cuadros graves y complicaciones por influenza', dosis: 'Dosis anual', edadMeses: 24, grupo: 'Niños' }),

  v({ codigo: 'ipv-4a', nombre: 'IPV (polio inactivada)', previene: 'Poliomielitis', dosis: 'Refuerzo', edadMeses: 48, grupo: 'Niños' }),
  v({ codigo: 'dpt-4a', nombre: 'DPT', previene: 'Difteria, tos ferina (convulsa), tétanos', dosis: 'Refuerzo', edadMeses: 48, grupo: 'Niños' }),
  v({ codigo: 'vari-2', nombre: 'Varicela', previene: 'Cuadros graves y complicaciones por varicela', dosis: '2ª dosis', edadMeses: 60, grupo: 'Niños' }),

  v({ codigo: 'vph', nombre: 'VPH (virus del papiloma humano)', previene: 'Cáncer de cuello uterino y otras enfermedades por VPH', dosis: 'Según esquema vigente (verificar)', edadMeses: 108, grupo: 'Adolescentes', nota: 'Publicado por el PAI para niños, niñas y adolescentes de 9 a 14 años.', url: PAI_URL2 }),
  v({ codigo: 'tdpa-ado', nombre: 'Tdpa', previene: 'Tétanos, difteria y tos ferina', dosis: 'Según esquema vigente (verificar edad exacta)', edadMeses: 108, grupo: 'Adolescentes', nota: 'Publicado por el PAI para 9 a 14 años junto con VPH. Verificar edad exacta.', url: PAI_URL2 }),

  v({ codigo: 'tdpa-emb', nombre: 'Tdpa (embarazadas)', previene: 'Tos convulsa (del bebé), tétanos y difteria', dosis: 'En cada embarazo (verificar semana indicada)', grupo: 'Embarazadas', sexo: 'F', nota: 'La semana de aplicación la indica el profesional que controla el embarazo.' }),
  v({ codigo: 'flu-anual', nombre: 'Influenza estacional', previene: 'Cuadros graves de influenza', dosis: 'Dosis anual', grupo: 'Adultos y grupos de riesgo', nota: 'Para los grupos que defina cada campaña anual (adultos mayores, embarazadas, enfermedades crónicas, personal de salud, etc.). Verificar la campaña vigente.' }),

  // Mascotas: no hay esquema oficial cargado; la fecha la indica el veterinario.
  { codigo: 'vet-antirrabica', nombre: 'Antirrábica', previene: 'Rabia', dosis: 'Según indicación del veterinario', grupo: 'Mascotas', fuente: 'Indicación del veterinario', verificado: true, activo: true, especie: 'todas', nota: 'La fecha de la próxima dosis la indica el veterinario.' },
  { codigo: 'vet-polivalente', nombre: 'Vacuna polivalente / séxtuple / triple felina', previene: 'Según la vacuna indicada', dosis: 'Según indicación del veterinario', grupo: 'Mascotas', fuente: 'Indicación del veterinario', verificado: true, activo: true, especie: 'todas' },
]

const MSPBS = 'Ministerio de Salud Pública y Bienestar Social (MSPBS)'

export const RECOMENDACIONES_INICIALES: Recomendacion[] = [
  {
    codigo: 'mamografia', nombre: 'Mamografía', categoria: 'Salud femenina', poblacion: 'Mujeres desde los 40 años', sexo: 'F', edadDesde: 40,
    frecuenciaMeses: 12, frecuenciaTexto: 'Anual, salvo que el profesional indique otra frecuencia',
    fuente: 'DGVS / MSPBS – nota "19 de octubre" y nota "Octubre Rosa"',
    url: 'https://dgvs.mspbs.gov.py/19-de-octubre-un-dia-para-honrar-la-lucha-y-recordar-que-la-deteccion-a-tiempo-salva-vidas/',
    vigencia: 'requiere verificación', automatica: true, version: 1,
    nota: 'El MSPBS publicó que las mujeres de 40 años en adelante pueden hacerse una mamografía anual aunque no tengan síntomas. Con antecedentes familiares de cáncer de mama, el médico define el seguimiento.',
  },
  {
    codigo: 'pap', nombre: 'Papanicolaou (PAP)', categoria: 'Salud femenina', poblacion: 'Mujeres (edad de inicio según protocolo vigente)', sexo: 'F',
    frecuenciaTexto: 'Según el protocolo vigente y los resultados anteriores',
    fuente: `${MSPBS} – Protocolo de manejo de cáncer de cuello uterino 2025`,
    url: 'https://www.mspbs.gov.py/dependencias/portal/adjunto/f8bc36-PROTOCOLODEMANEJODECNCERDECUELLOUTERINOUNAPAGINA240720251.pdf',
    vigencia: 'requiere verificación', automatica: false, version: 1,
    nota: 'Edad e intervalo pendientes de verificar en el protocolo oficial. Registrá la fecha y la próxima que te indique tu profesional.',
  },
  {
    codigo: 'vph-test', nombre: 'Test de VPH', categoria: 'Salud femenina', poblacion: 'Mujeres (edad según protocolo vigente)', sexo: 'F',
    frecuenciaTexto: 'Según el protocolo vigente y los resultados anteriores',
    fuente: `${MSPBS} – Protocolo de manejo de cáncer de cuello uterino 2025`,
    url: 'https://www.mspbs.gov.py/dependencias/portal/adjunto/f8bc36-PROTOCOLODEMANEJODECNCERDECUELLOUTERINOUNAPAGINA240720251.pdf',
    vigencia: 'requiere verificación', automatica: false, version: 1,
    nota: 'El protocolo 2025 incorpora el test de VPH y la citología como pruebas de tamizaje. Edad e intervalo pendientes de verificar.',
  },
  { codigo: 'gineco', nombre: 'Consulta ginecológica', categoria: 'Salud femenina', poblacion: 'Mujeres', sexo: 'F', frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'mamaria', nombre: 'Control de salud mamaria (examen clínico)', categoria: 'Salud femenina', poblacion: 'Mujeres', sexo: 'F', frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },

  {
    codigo: 'prostata', nombre: 'Evaluación prostática', categoria: 'Salud masculina', poblacion: 'Hombres desde los 50 años, o desde los 40 con antecedentes familiares directos', sexo: 'M', edadDesde: 50, edadDesdeConAntecedente: 40,
    frecuenciaMeses: 12, frecuenciaTexto: 'Chequeo anual, el médico decide qué estudios (PSA, tacto) corresponden',
    fuente: `${MSPBS} – "Noviembre Azul: chequeo anual a partir de los 50 años o antes si hay antecedentes"`,
    url: 'https://www.mspbs.gov.py/portal/34247/noviembre-azul-chequeo-anual-a-partir-de-los-50-antildeos-o-antes-si-hay-antecedentes.html',
    vigencia: 'requiere verificación', automatica: false, version: 1,
    nota: 'La app no programa PSA ni tacto rectal: solo muestra la recomendación para conversarla con el médico.',
  },
  { codigo: 'urologia', nombre: 'Control urológico', categoria: 'Salud masculina', poblacion: 'Hombres', sexo: 'M', frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },

  { codigo: 'clinica', nombre: 'Consulta clínica general', categoria: 'General', poblacion: 'Adultos', edadDesde: 18, frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'presion', nombre: 'Control de presión arterial', categoria: 'General', poblacion: 'Adultos', edadDesde: 18, frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'glucemia', nombre: 'Glucemia', categoria: 'General', poblacion: 'Adultos', edadDesde: 18, frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'colesterol', nombre: 'Colesterol', categoria: 'General', poblacion: 'Adultos', edadDesde: 18, frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'cardio', nombre: 'Evaluación cardiovascular', categoria: 'General', poblacion: 'Adultos', edadDesde: 18, frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'colorrectal', nombre: 'Salud intestinal y colorrectal', categoria: 'General', poblacion: 'Adultos', edadDesde: 18, frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'requiere verificación', automatica: false, version: 1, nota: 'Pendiente de cargar la recomendación oficial del MSPBS / INCAN.' },

  { codigo: 'pediatrico', nombre: 'Control pediátrico (crecimiento y desarrollo)', categoria: 'Salud infantil', poblacion: 'Niños y niñas', edadHasta: 18, frecuenciaTexto: 'Según indicación del pediatra', fuente: 'Indicación del pediatra', vigencia: 'vigente', automatica: false, version: 1, nota: 'Registrá peso, talla y perímetro cefálico en cada control para ver la curva.' },
  { codigo: 'bucal', nombre: 'Salud bucal (odontología)', categoria: 'Salud infantil', poblacion: 'Niños y niñas', edadHasta: 18, frecuenciaTexto: 'Según indicación del odontólogo', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'visual', nombre: 'Control visual', categoria: 'Salud infantil', poblacion: 'Niños y niñas', edadHasta: 18, frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'auditivo', nombre: 'Control auditivo', categoria: 'Salud infantil', poblacion: 'Niños y niñas', edadHasta: 18, frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'escolar', nombre: 'Control escolar (certificado de salud)', categoria: 'Salud infantil', poblacion: 'Niños y niñas en edad escolar', edadDesde: 4, edadHasta: 18, frecuenciaTexto: 'Cuando lo pida la escuela o el médico', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
]
