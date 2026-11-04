import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getAjuste, TIPOS_MEDICION } from '../lib/db'
import { calcularAvisos } from '../lib/avisos'
import { alCambiar, esIOS, instalar, puedeInstalar, yaInstalada } from '../lib/instalar'
import { cumplimiento, cuando, DIAS, fechaCorta, hoyISO, MESES_CORTOS, deISO, nombreMes, sumarDias, tomasDelDia } from '../lib/salud'
import { Avatar, Boton, Firma, GraficoLinea, Hoja, Insignia, ir, Logo, Progreso, Seccion, Tarjeta, Vacio } from '../ui/kit'
import { useIntegrantes } from '../ui/comunes'
import { Icono } from '../ui/iconos'
import { registrarToma } from './Medicamentos'

const ICONO_AVISO: Record<string, [string, string]> = {
  medicamento: ['pastilla', 'bg-turquesa-100 text-turquesa-700'], vacuna: ['vacuna', 'bg-turquesa-100 text-turquesa-700'],
  consulta: ['agenda', 'bg-cielo-100 text-cielo-600'], control: ['escudo', 'bg-salvia-100 text-salvia-700'],
  renovacion: ['informe', 'bg-coral-100 text-coral-600'], tratamiento: ['reloj', 'bg-lavanda-100 text-lavanda-600'],
  veterinaria: ['mascota', 'bg-amber-100 text-amber-800'], stock: ['alerta', 'bg-coral-100 text-coral-600'],
}
export { ICONO_AVISO }

export default function Inicio({ cantAvisos }: { cantAvisos: number }) {
  const familia = useIntegrantes()
  const usuario = useLiveQuery(() => getAjuste('usuario', ''), [], '')
  const demo = useLiveQuery(() => getAjuste('demo', false), [], false)
  const mayor = useLiveQuery(() => getAjuste('modoMayor', false), [], false)
  const hoy = hoyISO()
  const avisos = useLiveQuery(() => calcularAvisos(), [], [])
  const meds = useLiveQuery(() => db.medicamentos.filter((m) => m.activo).toArray(), [], [])
  const tomasHoy = useLiveQuery(() => db.tomas.where('fecha').equals(hoy).toArray(), [hoy], [])
  const tomas14 = useLiveQuery(() => db.tomas.where('fecha').between(sumarDias(hoy, -14), hoy, true, true).toArray(), [hoy], [])
  const eventos = useLiveQuery(() => db.eventos.where('fecha').aboveOrEqual(hoy).filter((e) => e.estado === 'programado').sortBy('fecha'), [hoy], [])
  const mediciones = useLiveQuery(() => db.mediciones.toArray(), [], [])
  const [grafico, setGrafico] = useState<string>()
  const [instalable, setInstalable] = useState(puedeInstalar())
  const [ayudaIOS, setAyudaIOS] = useState(false)
  useEffect(() => alCambiar(() => setInstalable(puedeInstalar())), [])

  const h = new Date().getHours()
  const saludo = h < 12 ? 'Buen día' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  const d = deISO(hoy)
  const nombreDe = new Map(familia.map((i) => [i.id!, i]))
  const vivos = new Set(familia.map((i) => i.id))
  const programadas = tomasDelDia(meds.filter((m) => vivos.has(m.integranteId)), tomasHoy, hoy)
  const pendientes = programadas.filter((t) => !t.registro || t.registro.estado === 'pospuesto')
  const cumple = cumplimiento(tomas14)
  const proximos = eventos.filter((e) => vivos.has(e.integranteId)).slice(0, 3)
  const alertas = avisos.filter((a) => a.tipo === 'control' || a.tipo === 'vacuna' || a.tipo === 'renovacion' || a.tipo === 'stock' || a.tipo === 'veterinaria')

  // Series disponibles para gráficos (solo datos reales registrados)
  const series = new Map<string, { integranteId: number; tipo: string }>()
  for (const m of mediciones) if (vivos.has(m.integranteId)) series.set(`${m.integranteId}-${m.tipo}`, { integranteId: m.integranteId, tipo: m.tipo })
  const claves = [...series.keys()].sort((a, b) => (a.includes('presion') ? -1 : b.includes('presion') ? 1 : 0))
  const elegido = grafico && series.has(grafico) ? grafico : claves[0]
  const serie = elegido ? series.get(elegido)! : undefined
  const puntos = serie ? mediciones.filter((m) => m.integranteId === serie.integranteId && m.tipo === serie.tipo).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(-8) : []
  const etiquetaFecha = (f: string) => { const x = deISO(f); return `${x.getDate()} ${MESES_CORTOS[x.getMonth()]}` }

  const accesos = [
    { t: 'Agregar integrante', i: 'familia', r: 'familia?nuevo', c: 'bg-salvia-100 text-salvia-700' },
    { t: 'Registrar análisis', i: 'informe', r: 'documentos?nuevo', c: 'bg-cielo-100 text-cielo-600' },
    { t: 'Registrar medicamento', i: 'pastilla', r: 'medicamentos?nuevo', c: 'bg-turquesa-100 text-turquesa-700' },
    { t: 'Agendar consulta', i: 'agenda', r: 'agenda?nuevo', c: 'bg-coral-100 text-coral-600' },
    { t: 'Registrar vacuna', i: 'vacuna', r: 'vacunas?nuevo', c: 'bg-turquesa-100 text-turquesa-700' },
    { t: 'Agregar mascota', i: 'mascota', r: 'mascotas?nuevo', c: 'bg-amber-100 text-amber-800' },
  ]

  return (
    <>
      <header className="rounded-b-[36px] bg-gradient-to-br from-salvia-500 to-salvia-700 px-4 pb-6 pt-[max(18px,env(safe-area-inset-top))] text-white">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="lg:hidden"><Logo t="sm" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-salvia-100">{DIAS[d.getDay()][0].toUpperCase() + DIAS[d.getDay()].slice(1)}, {d.getDate()} de {nombreMes(d.getMonth())}</p>
              <h1 className="truncate font-display text-2xl">{saludo}{usuario ? `, ${usuario}` : ''}</h1>
            </div>
            <a href="#/avisos" className="relative grid h-12 w-12 place-items-center rounded-full bg-white/15" aria-label={`Recordatorios: ${cantAvisos}`}>
              <Icono n="campana" />
              {cantAvisos > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[11px] font-bold">{cantAvisos}</span>}
            </a>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2 text-center">
            {[
              [pendientes.length, 'Tomas hoy', 'medicamentos'],
              [proximos.length, 'Próximas citas', 'agenda'],
              [avisos.filter((a) => a.tipo === 'vacuna').length, 'Vacunas', 'vacunas'],
              [avisos.length, 'Recordatorios', 'avisos'],
            ].map(([n, t, r]) => (
              <a key={t as string} href={`#/${r}`} className="rounded-2xl bg-white/15 px-1 py-2.5 backdrop-blur transition hover:bg-white/25">
                <p className="text-2xl font-extrabold leading-none">{n}</p>
                <p className="mt-1 text-[11px] leading-tight text-salvia-50">{t}</p>
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="entrar mx-auto max-w-3xl px-4 pb-32">
        {demo && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
            <Icono n="info" c="w-5 h-5 shrink-0" />
            <p className="flex-1">Estás viendo una <b>familia de ejemplo</b> con datos ficticios. No es información médica real.</p>
            <a href="#/ajustes" className="font-bold underline">Borrar</a>
          </div>
        )}

        {(instalable || (esIOS() && !yaInstalada())) && (
          <Tarjeta className="mt-4 flex items-center gap-3 !bg-turquesa-50 border-turquesa-100">
            <Logo t="sm" />
            <p className="flex-1 text-sm text-piedra-700"><b>Instalá Familia Sana</b> en tu celular para abrirla como una app.</p>
            <Boton className="!min-h-[40px] !px-4" onClick={async () => (instalable ? instalar() : setAyudaIOS(true))}>Instalar</Boton>
          </Tarjeta>
        )}

        <Seccion titulo="Mi familia" accion={<a href="#/familia" className="text-sm font-bold text-turquesa-600">Ver todos</a>}>
          {familia.length === 0 ? (
            <Vacio titulo="Agregá a tu familia" texto="Empezá cargando a cada integrante. Después vas a poder registrar su salud." accion={<Boton icono="mas" onClick={() => ir('familia?nuevo')}>Agregar integrante</Boton>} />
          ) : (
            <div className="sin-barra -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
              {familia.map((i) => (
                <a key={i.id} href={`#/integrante/${i.id}`} className="flex w-24 shrink-0 flex-col items-center rounded-3xl bg-white p-3 shadow-suave border border-crema-200">
                  <Avatar i={i} t="lg" />
                  <p className="mt-2 w-full truncate text-center text-sm font-bold">{i.nombre}</p>
                  <p className="w-full truncate text-center text-[11px] text-piedra-500">{i.relacion}</p>
                </a>
              ))}
              <a href="#/familia?nuevo" className="flex w-24 shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-salvia-200 p-3 text-salvia-600">
                <Icono n="mas" c="w-8 h-8" /><span className="mt-1 text-xs font-bold">Agregar</span>
              </a>
            </div>
          )}
        </Seccion>

        <Seccion titulo="Remedios de hoy" accion={<a href="#/medicamentos" className="text-sm font-bold text-turquesa-600">Organizador</a>}>
          {programadas.length === 0 ? (
            <Tarjeta className="text-sm text-piedra-600">No hay tomas programadas para hoy.</Tarjeta>
          ) : (
            <div className="space-y-2">
              {(pendientes.length ? pendientes : programadas).slice(0, mayor ? 3 : 4).map((t) => {
                const p = nombreDe.get(t.med.integranteId)
                return (
                  <Tarjeta key={`${t.med.id}-${t.hora}`} className="flex items-center gap-3 !p-3">
                    <span className="w-14 shrink-0 rounded-xl bg-turquesa-50 py-1.5 text-center font-extrabold text-turquesa-700">{t.hora}</span>
                    <div className="min-w-0 flex-1"><p className="truncate font-bold">{t.med.nombre}</p><p className="truncate text-xs text-piedra-500">{p?.nombre} · {t.med.dosis}</p></div>
                    {t.registro && t.registro.estado !== 'pospuesto' ? <Insignia>{t.registro.estado}</Insignia> : (
                      <button onClick={() => registrarToma(t, 'tomado')} className="grid h-11 w-11 place-items-center rounded-full bg-turquesa-500 text-white shadow-suave" aria-label={`Marcar ${t.med.nombre} como tomado`}><Icono n="check" /></button>
                    )}
                  </Tarjeta>
                )
              })}
              {pendientes.length > 4 && <a href="#/medicamentos" className="block text-center text-sm font-bold text-turquesa-600">Ver {pendientes.length - 4} más</a>}
            </div>
          )}
        </Seccion>

        <Seccion titulo="Próximas citas" accion={<a href="#/agenda" className="text-sm font-bold text-turquesa-600">Agenda</a>}>
          {proximos.length === 0 ? <Tarjeta className="text-sm text-piedra-600">No tenés citas próximas. <a href="#/agenda?nuevo" className="font-bold text-turquesa-600">Agendar una</a></Tarjeta> : (
            <div className="space-y-2">
              {proximos.map((e) => {
                const x = deISO(e.fecha)
                return (
                  <Tarjeta key={e.id} onClick={() => ir(`agenda/${e.id}`)} className="flex items-center gap-3 !p-3">
                    <div className="w-14 shrink-0 rounded-2xl bg-cielo-50 py-1.5 text-center"><p className="text-xl font-extrabold leading-none text-cielo-600">{x.getDate()}</p><p className="text-[11px] font-bold uppercase text-cielo-500">{MESES_CORTOS[x.getMonth()]}</p></div>
                    <div className="min-w-0 flex-1"><p className="truncate font-bold">{e.categoria}{e.especialidad ? ` · ${e.especialidad}` : ''}</p><p className="truncate text-xs text-piedra-500">{nombreDe.get(e.integranteId)?.nombre} · {cuando(e.fecha)}{e.hora ? ` · ${e.hora}` : ''}</p></div>
                    <Avatar i={nombreDe.get(e.integranteId)} t="sm" />
                  </Tarjeta>
                )
              })}
            </div>
          )}
        </Seccion>

        {alertas.length > 0 && (
          <Seccion titulo="Necesitan atención" accion={<a href="#/avisos" className="text-sm font-bold text-turquesa-600">Ver todo</a>}>
            <div className="space-y-2">
              {alertas.slice(0, mayor ? 3 : 4).map((a) => {
                const [ic, cl] = ICONO_AVISO[a.tipo]
                return (
                  <Tarjeta key={a.id} onClick={() => (location.hash = a.ruta)} className={`flex items-center gap-3 !p-3 ${a.urgencia === 'alta' ? 'border-coral-100 !bg-coral-50' : ''}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cl}`}><Icono n={ic} c="w-5 h-5" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate font-bold">{a.titulo}</p><p className="truncate text-xs text-piedra-500">{a.detalle} · {cuando(a.fecha)}</p></div>
                    <Icono n="adelante" c="w-5 h-5 text-piedra-400" />
                  </Tarjeta>
                )
              })}
            </div>
          </Seccion>
        )}

        <div className="ocultar-mayor">
          <Seccion titulo="Evolución">
            <Tarjeta>
              {!serie ? (
                <div className="text-center text-sm text-piedra-600"><p>Cuando registres peso, presión, glucemia u otros valores, vas a ver su evolución acá.</p><a href="#/documentos?valor" className="mt-2 inline-block font-bold text-turquesa-600">Registrar un valor</a></div>
              ) : (
                <>
                  <div className="sin-barra -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
                    {claves.map((k) => { const s = series.get(k)!; return (
                      <button key={k} onClick={() => setGrafico(k)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${k === elegido ? 'bg-turquesa-500 text-white' : 'bg-crema-200 text-piedra-700'}`}>{nombreDe.get(s.integranteId)?.nombre} · {TIPOS_MEDICION[s.tipo]?.nombre ?? s.tipo}</button>
                    ) })}
                  </div>
                  <GraficoLinea puntos={puntos.map((p) => ({ x: etiquetaFecha(p.fecha), y: p.valor }))} puntos2={TIPOS_MEDICION[serie.tipo]?.doble ? puntos.map((p) => ({ x: etiquetaFecha(p.fecha), y: p.valor2 ?? p.valor })) : undefined} unidad={TIPOS_MEDICION[serie.tipo]?.unidad ?? ''} />
                  <p className="mt-2 text-xs text-piedra-500">Último: <b>{puntos.at(-1)!.valor}{puntos.at(-1)!.valor2 ? `/${puntos.at(-1)!.valor2}` : ''} {TIPOS_MEDICION[serie.tipo]?.unidad}</b> el {fechaCorta(puntos.at(-1)!.fecha)}. {puntos.at(-1)!.referencia ? `Referencia del laboratorio: ${puntos.at(-1)!.referencia}.` : ''} La interpretación la hace tu profesional.</p>
                </>
              )}
            </Tarjeta>
            {cumple !== undefined && (
              <Tarjeta className="mt-3">
                <div className="flex items-center justify-between"><p className="font-bold">Cumplimiento de remedios</p><p className="text-2xl font-extrabold text-turquesa-600">{cumple}%</p></div>
                <Progreso valor={cumple} />
                <p className="mt-2 text-xs text-piedra-500">Tomas marcadas como "tomado" en los últimos 14 días.</p>
              </Tarjeta>
            )}
          </Seccion>
        </div>

        <Seccion titulo="Accesos rápidos">
          <div className="grid grid-cols-3 gap-3">
            {accesos.map((a) => (
              <a key={a.t} href={`#/${a.r}`} className="flex flex-col items-center gap-2 rounded-3xl bg-white p-3 text-center text-xs font-bold text-piedra-700 shadow-suave border border-crema-200 active:scale-95 transition">
                <span className={`relative grid h-12 w-12 place-items-center rounded-2xl ${a.c}`}><Icono n={a.i} /><span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-turquesa-500 text-white"><Icono n="mas" c="w-3 h-3" /></span></span>
                {a.t}
              </a>
            ))}
          </div>
        </Seccion>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Tarjeta onClick={() => ir('consulta')} className="!bg-coral-50 border-coral-100"><Icono n="chat" c="w-7 h-7 text-coral-600" /><p className="mt-2 font-bold">Tengo una consulta</p><p className="text-xs text-piedra-600">Anotá síntomas y preguntas para tu médico</p></Tarjeta>
          <Tarjeta onClick={() => ir('informes')} className="!bg-cielo-50 border-cielo-100"><Icono n="informe" c="w-7 h-7 text-cielo-600" /><p className="mt-2 font-bold">Resumen del mes</p><p className="text-xs text-piedra-600">Consultas, estudios, vacunas e informes PDF</p></Tarjeta>
        </div>

        <Firma className="mt-10" />
      </main>

      <Hoja abierta={ayudaIOS} titulo="Instalar en iPhone" onCerrar={() => setAyudaIOS(false)}>
        <ol className="list-decimal space-y-3 pl-5 text-piedra-700">
          <li>Abrí esta página en <b>Safari</b>.</li>
          <li>Tocá el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba).</li>
          <li>Elegí <b>“Agregar a pantalla de inicio”</b>.</li>
          <li>Tocá <b>Agregar</b>. Listo: vas a ver el ícono de Familia Sana.</li>
        </ol>
      </Hoja>
    </>
  )
}
