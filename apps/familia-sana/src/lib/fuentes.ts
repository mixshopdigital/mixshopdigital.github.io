import type { Recomendacion, VacunaEsquema } from './db'

/*
 * Catálogo inicial de fuentes sanitarias.
 *
 * Verificado el 2026-11-04 contra las páginas oficiales del MSPBS:
 *  - Esquema Regular de Vacunación 2026 del PAI (página y su imagen oficial, actualizadas el
 *    2026-09-02; misma tabla reutilizada por el PAI el 2026-10-14).
 *  - Adenda VPH 2026 del PAI (presentación de septiembre de 2026).
 *  - DGVS (mamografía, 2026-10-19) y MSPBS (próstata, 2025-11-10).
 * Lo que la fuente no dice queda escrito como "la fuente no lo indica" y no se inventa.
 * El esquema 2026 del PAI cubre de recién nacidos a 14 años. Para adultos, embarazadas y
 * grupos de riesgo el PAI solo tiene publicada la tabla 2021 (desactualizada en otras filas),
 * por eso esas filas siguen como "requiere verificación" (verificado: false).
 * Nada de esto reemplaza al vacunatorio ni al médico.
 */

const PAI = 'Programa Ampliado de Inmunizaciones (PAI) – MSPBS, Esquema Regular de Vacunación 2026'
const PAI_URL = 'https://pai.mspbs.gov.py/esquema-de-vacunacion-2-2/'
const PAI_IMG = 'https://pai.mspbs.gov.py/wp-content/uploads/2026/09/Esquema-vacunacion-2026-1_page-0001.jpg'
const PAI_2021 = 'PAI – MSPBS, Esquema Regular de Vacunación 2021 (tabla anterior, sin actualizar para adultos)'
const PAI_2021_URL = 'https://pai.mspbs.gov.py/esquema-regular-de-vacunacion/'
const PAI_VPH = 'PAI – MSPBS, Vacunación contra el VPH en Paraguay (Adenda 2026, septiembre 2026)'
const PAI_VPH_URL = 'https://pai.mspbs.gov.py/wp-content/uploads/2026/09/ESQUEMA-CON-ADENDA-VPH-.pptx'
const REVISADO = '2026-11-04'

type V = Omit<VacunaEsquema, 'id' | 'fuente' | 'verificado' | 'activo'> & Partial<Pick<VacunaEsquema, 'url' | 'fuente' | 'verificado'>>

const v = (x: V): VacunaEsquema => ({ fuente: PAI, url: PAI_URL, revisado: REVISADO, verificado: true, activo: true, ...x })

const HEXA = 'Difteria, tétanos, tos ferina, hepatitis B, poliomielitis (inactivada) y Haemophilus influenzae de tipo b'
const HEXA_NOTA = 'El PAI usa la hexavalente desde la cohorte de recién nacidos de abril de 2023, en reemplazo de la pentavalente y la vacuna contra la poliomielitis.'
const NEUMO = 'Neumonía, meningitis, otitis'
const FLU = 'Influenza grave'
const FLU_NOTA = 'Dosis anual. Según el PAI: de 6 a 35 meses, quien recibe la vacuna por primera vez lleva 2 dosis de 0,25 mL con al menos 1 mes entre ambas. Desde los 3 años, 1 dosis de 0,5 mL si en la temporada anterior completó el esquema primario.'
const SPR_NOTA = 'Sin antecedente de vacuna, o si viaja a países con circulación de sarampión, el PAI recomienda completar el esquema: 1 dosis si recibió 1 antes, o 2 dosis si no tiene ninguna.'

export const ESQUEMA_INICIAL: VacunaEsquema[] = [
  // Recién nacido
  v({ codigo: 'bcg', nombre: 'BCG', previene: 'Formas graves de tuberculosis', dosis: 'Al nacer', edadMeses: 0, grupo: 'Recién nacido', nota: 'Se aplica antes del alta del hospital si el bebé está en condiciones (PAI, 14/10/2026).' }),
  v({ codigo: 'hepb-rn', nombre: 'Hepatitis B pediátrica (HEPB)', previene: 'Transmisión perinatal de hepatitis B', dosis: 'Al nacer', edadMeses: 0, grupo: 'Recién nacido', nota: 'Dentro de las primeras 24 horas de vida (PAI, 14/10/2026).' }),

  // 2 meses
  v({ codigo: 'rota-1', nombre: 'Rotavirus', previene: 'Diarrea por rotavirus', dosis: 'Dosis de los 2 meses', edadMeses: 2, grupo: 'Lactantes' }),
  v({ codigo: 'hexa-1', nombre: 'Hexavalente', previene: HEXA, dosis: 'Dosis de los 2 meses', edadMeses: 2, grupo: 'Lactantes', nota: HEXA_NOTA }),
  v({ codigo: 'pcv13-1', nombre: 'Neumococo conjugada 13 valente', previene: NEUMO, dosis: 'Dosis de los 2 meses', edadMeses: 2, grupo: 'Lactantes' }),

  // 4 meses
  v({ codigo: 'rota-2', nombre: 'Rotavirus', previene: 'Diarrea por rotavirus', dosis: 'Dosis de los 4 meses', edadMeses: 4, grupo: 'Lactantes' }),
  v({ codigo: 'hexa-2', nombre: 'Hexavalente', previene: HEXA, dosis: 'Dosis de los 4 meses', edadMeses: 4, grupo: 'Lactantes', nota: HEXA_NOTA }),
  v({ codigo: 'pcv13-2', nombre: 'Neumococo conjugada 13 valente', previene: NEUMO, dosis: 'Dosis de los 4 meses', edadMeses: 4, grupo: 'Lactantes' }),

  // 6 meses
  v({ codigo: 'hexa-3', nombre: 'Hexavalente', previene: HEXA, dosis: 'Dosis de los 6 meses', edadMeses: 6, grupo: 'Lactantes', nota: HEXA_NOTA }),
  v({ codigo: 'flu-6m', nombre: 'Influenza estacional', previene: FLU, dosis: 'Dosis anual (6 meses)', edadMeses: 6, grupo: 'Lactantes', nota: FLU_NOTA }),

  // 12 meses
  v({ codigo: 'pcv13-r', nombre: 'Neumococo conjugada 13 valente', previene: NEUMO, dosis: 'Dosis de los 12 meses', edadMeses: 12, grupo: 'Niños' }),
  v({ codigo: 'flu-12m', nombre: 'Influenza estacional', previene: FLU, dosis: 'Dosis anual (12 meses)', edadMeses: 12, grupo: 'Niños', nota: FLU_NOTA }),
  v({ codigo: 'spr-1', nombre: 'SPR (triple viral)', previene: 'Sarampión, paperas, rubéola', dosis: '1ª dosis', edadMeses: 12, grupo: 'Niños', nota: SPR_NOTA }),
  v({ codigo: 'aa', nombre: 'Fiebre amarilla (AA)', previene: 'Fiebre amarilla', dosis: 'Dosis única de por vida', edadMeses: 12, grupo: 'Niños' }),

  // 15 meses
  v({ codigo: 'flu-15m', nombre: 'Influenza estacional', previene: FLU, dosis: 'Dosis anual (15 meses)', edadMeses: 15, grupo: 'Niños', nota: FLU_NOTA }),
  v({ codigo: 'vari-1', nombre: 'Varicela', previene: 'Varicela', dosis: '1ª dosis', edadMeses: 15, grupo: 'Niños' }),
  v({ codigo: 'hepa', nombre: 'Hepatitis A', previene: 'Hepatitis A', dosis: 'Dosis de los 15 meses', edadMeses: 15, grupo: 'Niños' }),

  // 18 meses
  v({ codigo: 'hexa-18m', nombre: 'Hexavalente', previene: HEXA, dosis: 'Dosis de los 18 meses', edadMeses: 18, grupo: 'Niños', nota: HEXA_NOTA }),
  v({ codigo: 'flu-18m', nombre: 'Influenza estacional', previene: FLU, dosis: 'Dosis anual (18 meses)', edadMeses: 18, grupo: 'Niños', nota: FLU_NOTA }),
  v({ codigo: 'spr-2', nombre: 'SPR (triple viral)', previene: 'Sarampión, paperas, rubéola', dosis: '2ª dosis', edadMeses: 18, grupo: 'Niños', nota: SPR_NOTA }),

  // 2, 4 y 5 años
  v({ codigo: 'flu-2a', nombre: 'Influenza estacional', previene: FLU, dosis: 'Dosis anual (2 años)', edadMeses: 24, grupo: 'Niños', nota: FLU_NOTA }),
  v({ codigo: 'ipv-4a', nombre: 'IPV (polio inactivada)', previene: 'Poliomielitis', dosis: 'Dosis de los 4 años', edadMeses: 48, grupo: 'Niños' }),
  v({ codigo: 'dpt-4a', nombre: 'DPT', previene: 'Difteria, tos ferina o tos convulsa, tétanos', dosis: 'Dosis de los 4 años', edadMeses: 48, grupo: 'Niños' }),
  v({ codigo: 'vari-2', nombre: 'Varicela', previene: 'Varicela', dosis: '2ª dosis', edadMeses: 60, grupo: 'Niños' }),

  // 9 a 14 años
  v({ codigo: 'vph', nombre: 'VPH (virus del papiloma humano)', previene: 'Infección por los virus del papiloma humano', dosis: 'Dosis única', edadMeses: 108, grupo: 'Adolescentes',
    nota: 'Niñas y niños de 9 a 14 años, vacuna tetravalente. Dosis única desde 2024: quien ya recibió una dosis del esquema anterior se queda con esa. Personas inmunocomprometidas: 3 dosis (0, 1 y 6 meses). Recuperación: niñas hasta los 18 años, 1 dosis. Adenda 2026: personas en situaciones especiales hasta los 45 años (VIH, tratamiento inmunosupresor, trasplante, víctimas de violencia sexual, lesiones CIN2), con orden médica.' }),
  v({ codigo: 'tdpa-ado', nombre: 'Tdpa', previene: 'Difteria, tétanos, tos ferina o tos convulsa', dosis: 'Entre los 9 y 14 años (la fuente no indica edad exacta ni número de dosis)', edadMeses: 108, grupo: 'Adolescentes', nota: 'El esquema 2026 la pone para niñas y niños de 9 a 14 años, junto con la VPH.' }),

  // Adultos, embarazadas y grupos de riesgo: el esquema 2026 no los incluye. Solo está la tabla 2021 del PAI.
  v({ codigo: 'tdpa-emb', nombre: 'Tdpa (embarazadas)', previene: 'Tos convulsa, tétanos y difteria', dosis: 'Durante el embarazo (la fuente no indica la semana)', grupo: 'Embarazadas', sexo: 'F', fuente: PAI_2021, url: PAI_2021_URL, verificado: false, nota: 'Figura en la tabla 2021 del PAI. La semana la indica el profesional que controla el embarazo.' }),
  v({ codigo: 'flu-anual', nombre: 'Influenza estacional', previene: 'Cuadros graves y complicaciones por influenza', dosis: 'Dosis anual', grupo: 'Adultos y grupos de riesgo', fuente: PAI_2021, url: PAI_2021_URL, verificado: false, nota: 'La tabla 2021 del PAI la indica para adultos mayores, enfermos crónicos, embarazadas y personal de salud. Verificar la campaña de cada año.' }),
  v({ codigo: 'td-adulto', nombre: 'Td (doble adultos)', previene: 'Tétanos, difteria', dosis: 'La fuente no indica dosis ni intervalo', grupo: 'Adultos', fuente: PAI_2021, url: PAI_2021_URL, verificado: false, nota: 'Figura en la tabla 2021 del PAI para adultos, adultos mayores y enfermos crónicos.' }),
  v({ codigo: 'neumo23', nombre: 'Neumococo 23 valente', previene: 'Neumonía, meningitis, otitis', dosis: 'La fuente no indica dosis ni edad exacta', grupo: 'Adultos mayores y enfermos crónicos', fuente: PAI_2021, url: PAI_2021_URL, verificado: false, nota: 'Figura en la tabla 2021 del PAI para adultos mayores y enfermos crónicos.' }),

  // Mascotas: no hay esquema oficial cargado; la fecha la indica el veterinario.
  { codigo: 'vet-antirrabica', nombre: 'Antirrábica', previene: 'Rabia', dosis: 'Según indicación del veterinario', grupo: 'Mascotas', fuente: 'Indicación del veterinario', verificado: true, activo: true, especie: 'todas', nota: 'La fecha de la próxima dosis la indica el veterinario.' },
  { codigo: 'vet-polivalente', nombre: 'Vacuna polivalente / séxtuple / triple felina', previene: 'Según la vacuna indicada', dosis: 'Según indicación del veterinario', grupo: 'Mascotas', fuente: 'Indicación del veterinario', verificado: true, activo: true, especie: 'todas' },
]

// Imagen oficial del esquema 2026, por si la app quiere enlazarla.
export const PAI_ESQUEMA_IMAGEN = PAI_IMG
export const PAI_VPH_ADENDA = { fuente: PAI_VPH, url: PAI_VPH_URL }

const MSPBS = 'Ministerio de Salud Pública y Bienestar Social (MSPBS)'

export const RECOMENDACIONES_INICIALES: Recomendacion[] = [
  {
    codigo: 'mamografia', nombre: 'Mamografía', categoria: 'Salud femenina', poblacion: 'Mujeres desde los 40 años, aunque no tengan síntomas', sexo: 'F', edadDesde: 40,
    frecuenciaMeses: 12, frecuenciaTexto: 'Una vez al año',
    fuente: 'Dirección General de Vigilancia de la Salud (DGVS) – MSPBS, "19 de octubre: un día para honrar la lucha y recordar que la detección a tiempo salva vidas"',
    url: 'https://dgvs.mspbs.gov.py/19-de-octubre-un-dia-para-honrar-la-lucha-y-recordar-que-la-deteccion-a-tiempo-salva-vidas/',
    fechaPublicacion: '2026-10-19', fechaRevision: '2026-11-04',
    vigencia: 'vigente', automatica: true, version: 2,
    nota: 'En los servicios del MSPBS se puede hacer sin orden médica. Con antecedentes familiares directos o factores de alto riesgo, el profesional define la edad de inicio y la frecuencia. Ley 6211/18: dos días laborales libres y pagados al año para PAP y mamografía.',
  },
  {
    codigo: 'pap', nombre: 'Papanicolaou (PAP)', categoria: 'Salud femenina', poblacion: 'Mujeres, a partir de los tres años de haber iniciado las relaciones sexuales', sexo: 'F',
    frecuenciaMeses: 12, frecuenciaTexto: 'Una vez al año. Si da negativo 2 años seguidos, se puede espaciar cada 3 años',
    fuente: `${MSPBS} – "HoyPorVos: cáncer de cuello uterino, enfermedad que se puede prevenir"`,
    url: 'https://www.mspbs.gov.py/portal/35177/hoyporvos-cancer-de-cuello-uterino-enfermedad-que-se-puede-prevenir.html',
    fechaPublicacion: '2026-03-25', fechaRevision: '2026-11-04',
    vigencia: 'vigente', automatica: false, version: 2,
    nota: 'La edad de inicio depende de cuándo empezaron las relaciones sexuales, por eso la app no la calcula sola. Desde los 30 años, el MSPBS usa el test de VPH como prueba principal; en las demás edades sigue el PAP. Ley 6211/18: dos días laborales libres y pagados al año para PAP y mamografía.',
  },
  {
    codigo: 'vph-test', nombre: 'Test de VPH', categoria: 'Salud femenina', poblacion: 'Mujeres de 30 a 65 años que no estén embarazadas', sexo: 'F', edadDesde: 30, edadHasta: 65,
    frecuenciaTexto: 'La fuente no indica cada cuánto se repite: lo define el profesional según el resultado',
    fuente: `${MSPBS} – "Día Mundial de Prevención del Cáncer de Cuello Uterino" y "En Concepción: implementan pruebas de VPH"`,
    url: 'https://www.mspbs.gov.py/portal/32588/dia-mundial-de-prevencion-del-cancer-de-cuello-uterino.html',
    fechaPublicacion: '2025-03-26', fechaRevision: '2026-11-04',
    vigencia: 'vigente', automatica: false, version: 2,
    nota: 'Gratuito en los servicios del MSPBS. Es la prueba de tamizaje primario desde los 30 años (MSPBS, 03/10/2025: https://www.mspbs.gov.py/portal/33972/en-concepcion-implementan-pruebas-de-vph-para-la-prevencion-del-cancer-de-cuello-uterino.html). En 2025 ya estaba en 17 regiones sanitarias, falta Boquerón (MSPBS, 25/03/2026).',
  },
  { codigo: 'gineco', nombre: 'Consulta ginecológica', categoria: 'Salud femenina', poblacion: 'Mujeres', sexo: 'F', frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1 },
  { codigo: 'mamaria', nombre: 'Control de salud mamaria (examen clínico)', categoria: 'Salud femenina', poblacion: 'Mujeres', sexo: 'F', frecuenciaTexto: 'Según indicación médica', fuente: 'Indicación del profesional', vigencia: 'vigente', automatica: false, version: 1, nota: 'La DGVS recomienda consultar ante cualquier cambio en las mamas. La autoobservación no reemplaza a la mamografía.' },

  {
    codigo: 'prostata', nombre: 'Evaluación prostática', categoria: 'Salud masculina', poblacion: 'Hombres desde los 50 años, o desde los 40 si hay antecedentes familiares de cáncer de próstata', sexo: 'M', edadDesde: 50, edadDesdeConAntecedente: 40,
    frecuenciaMeses: 12, frecuenciaTexto: 'Control anual con el urólogo; el MSPBS recomienda el análisis de PSA una vez al año',
    fuente: `${MSPBS} – "Noviembre azul: chequeo anual a partir de los 50 años, o antes si hay antecedentes"`,
    url: 'https://www.mspbs.gov.py/portal/34247/noviembre-azul-chequeo-anual-a-partir-de-los-50-antildeos-o-antes-si-hay-antecedentes.html',
    fechaPublicacion: '2025-11-10', fechaRevision: '2026-11-04',
    vigencia: 'vigente', automatica: false, version: 2,
    nota: 'El urólogo indica los estudios e interpreta el PSA. Ley 6280/19, art. 13: dos días laborales pagados al año para estudios preventivos de cáncer de próstata y colon.',
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
