import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getAjuste, registrarActividad, setAjuste, type Recomendacion, type VacunaEsquema } from '../lib/db'
import { borrarDemo, cargarDemo } from '../lib/demo'
import { pedirPermisoNotificaciones } from '../lib/avisos'
import { borrarTodo, exportarRespaldo, importarRespaldo } from '../lib/respaldo'
import { guardarPinApp, pinApp } from '../lib/seguridad'
import { fechaCorta, hoyISO } from '../lib/salud'
import { Boton, Cabecera, Campo, Chips, Contenido, Entrada, Firma, Hoja, Insignia, Logo, Selector, Tarjeta, Texto, useConfirmar, useToast } from '../ui/kit'
import { Icono } from '../ui/iconos'
import { TecladoPin } from './Bloqueo'

export default function Ajustes({ seccion }: { seccion?: string }) {
  if (seccion === 'fuentes') return <Fuentes />
  if (seccion === 'privacidad') return <Legal tipo="privacidad" />
  if (seccion === 'terminos') return <Legal tipo="terminos" />
  if (seccion === 'actividad') return <ActividadLog />
  if (seccion === 'acerca') return <Acerca />
  return <Principal />
}

function Fila({ icono, titulo, sub, children, onClick }: { icono: string; titulo: string; sub?: string; children?: React.ReactNode; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className="flex w-full items-center gap-3 border-b border-crema-200 py-3 text-left last:border-0">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-salvia-100 text-salvia-700"><Icono n={icono} c="w-5 h-5" /></span>
      <div className="min-w-0 flex-1"><p className="font-bold">{titulo}</p>{sub && <p className="text-xs text-piedra-500">{sub}</p>}</div>
      {children ?? (onClick && <Icono n="adelante" c="w-5 h-5 text-piedra-400" />)}
    </Tag>
  )
}

function Interruptor({ on, onChange, etiqueta }: { on: boolean; onChange: (v: boolean) => void; etiqueta: string }) {
  return <button role="switch" aria-checked={on} aria-label={etiqueta} onClick={() => onChange(!on)} className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? 'bg-turquesa-500' : 'bg-crema-200'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-7' : 'left-1'}`} /></button>
}

function Principal() {
  const toast = useToast()
  const confirmar = useConfirmar()
  const usuario = useLiveQuery(() => getAjuste('usuario', ''), [], '')
  const mayor = useLiveQuery(() => getAjuste('modoMayor', false), [], false)
  const notif = useLiveQuery(() => getAjuste('notificaciones', false), [], false)
  const anticipacion = useLiveQuery(() => getAjuste('anticipacion', 3), [], 3)
  const demo = useLiveQuery(() => getAjuste('demo', false), [], false)
  const tienePin = useLiveQuery(async () => !!(await pinApp()), [], false)
  const ultimo = useLiveQuery(() => getAjuste<string | undefined>('ultimoRespaldo', undefined), [], undefined)
  const [pinHoja, setPinHoja] = useState(false)
  const [primero, setPrimero] = useState<string>()
  const [errorPin, setErrorPin] = useState<string>()
  const [nombre, setNombre] = useState<string>()

  return (
    <>
      <Cabecera titulo="Configuración" color="salvia" />
      <Contenido>
        <Tarjeta className="mt-2">
          <Fila icono="familia" titulo="Tu nombre" sub="Se usa en el saludo de inicio">
            <Entrada className="!w-36" value={nombre ?? usuario} onChange={(e) => setNombre(e.target.value)} onBlur={() => nombre !== undefined && setAjuste('usuario', nombre.trim())} />
          </Fila>
          <Fila icono="ojo" titulo="Modo adulto mayor" sub="Letras más grandes y menos opciones a la vez"><Interruptor etiqueta="Modo adulto mayor" on={!!mayor} onChange={(v) => setAjuste('modoMayor', v)} /></Fila>
        </Tarjeta>

        <h2 className="mt-6 mb-2 font-bold text-piedra-700">Recordatorios</h2>
        <Tarjeta>
          <Fila icono="campana" titulo="Notificaciones" sub="Avisos de remedios y citas en este dispositivo"><Interruptor etiqueta="Notificaciones" on={!!notif} onChange={async (v) => { if (v) { const r = await pedirPermisoNotificaciones(); if (r !== 'granted') return toast('El navegador no dio permiso para notificaciones.', 'error') } await setAjuste('notificaciones', v) }} /></Fila>
          <div className="py-3">
            <p className="mb-2 font-bold">Anticipación general</p>
            <Chips opciones={[{ v: 0, t: 'El mismo día' }, { v: 1, t: '1 día antes' }, { v: 3, t: '3 días antes' }, { v: 7, t: '1 semana antes' }]} valor={anticipacion} onChange={(v) => setAjuste('anticipacion', v)} />
          </div>
        </Tarjeta>

        <h2 className="mt-6 mb-2 font-bold text-piedra-700">Seguridad y privacidad</h2>
        <Tarjeta>
          <Fila icono="candado" titulo={tienePin ? 'Cambiar PIN de la app' : 'Crear PIN de la app'} sub="Pide el PIN al abrir y después de 5 minutos sin uso" onClick={() => { setPrimero(undefined); setErrorPin(undefined); setPinHoja(true) }} />
          {tienePin && <Fila icono="x" titulo="Quitar PIN" onClick={async () => { if (await confirmar('¿Quitar el PIN?', 'Cualquiera con tu celular podrá abrir la app.', 'Quitar')) { await guardarPinApp(); toast('PIN quitado') } }} />}
          <Fila icono="linea" titulo="Registro de actividad" sub="Qué se hizo y cuándo en este dispositivo" onClick={() => (location.hash = '#/ajustes/actividad')} />
          <Fila icono="escudo" titulo="Política de privacidad" onClick={() => (location.hash = '#/ajustes/privacidad')} />
          <Fila icono="informe" titulo="Términos de uso" onClick={() => (location.hash = '#/ajustes/terminos')} />
        </Tarjeta>

        <h2 className="mt-6 mb-2 font-bold text-piedra-700">Tus datos</h2>
        <Tarjeta>
          <Fila icono="bajar" titulo="Descargar copia de seguridad" sub={ultimo ? `Última: ${fechaCorta(ultimo.slice(0, 10))}` : 'Todavía no hiciste ninguna. Guardala en un lugar seguro.'} onClick={async () => { await exportarRespaldo(); toast('Copia descargada') }} />
          <label className="flex w-full cursor-pointer items-center gap-3 border-b border-crema-200 py-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-salvia-100 text-salvia-700"><Icono n="subir" c="w-5 h-5" /></span>
            <div className="flex-1"><p className="font-bold">Restaurar copia de seguridad</p><p className="text-xs text-piedra-500">Reemplaza los datos actuales</p></div>
            <input type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]; e.target.value = ''; if (!f) return
              if (!(await confirmar('¿Restaurar esta copia?', 'Se reemplazan todos los datos de este dispositivo.', 'Restaurar'))) return
              try { await importarRespaldo(f); toast('Copia restaurada'); setTimeout(() => location.reload(), 800) } catch (err) { toast((err as Error).message || 'No se pudo leer el archivo.', 'error') }
            }} />
          </label>
          {demo ? <Fila icono="basura" titulo="Borrar la familia de ejemplo" sub="Quita solo los datos ficticios" onClick={async () => { if (await confirmar('¿Borrar la familia de ejemplo?', 'Se borran los datos ficticios. Tus datos reales quedan.', 'Borrar')) { await borrarDemo(); toast('Datos de ejemplo borrados') } }} />
            : <Fila icono="familia" titulo="Cargar familia de ejemplo" sub="Datos ficticios para conocer la app" onClick={async () => { await cargarDemo(); toast('Familia de ejemplo cargada') }} />}
          <Fila icono="alerta" titulo="Borrar todos mis datos" sub="Elimina todo de este dispositivo de forma definitiva" onClick={async () => { if (await confirmar('¿Borrar TODO?', 'Se eliminan todos los integrantes, documentos y registros de este dispositivo. No se puede deshacer. Hacé antes una copia de seguridad.', 'Borrar todo')) await borrarTodo() }} />
        </Tarjeta>

        <h2 className="mt-6 mb-2 font-bold text-piedra-700">Fuentes sanitarias</h2>
        <Tarjeta><Fila icono="escudo" titulo="Calendario de vacunas y recomendaciones" sub="Ver fuentes oficiales, verificar y actualizar" onClick={() => (location.hash = '#/ajustes/fuentes')} /></Tarjeta>

        <Tarjeta className="mt-6"><Fila icono="info" titulo="Acerca de Familia Sana" sub="Versión, ayuda y contacto" onClick={() => (location.hash = '#/ajustes/acerca')} /></Tarjeta>
        <Firma className="mt-8" />
      </Contenido>

      <Hoja abierta={pinHoja} titulo="PIN de la app" onCerrar={() => setPinHoja(false)}>
        <TecladoPin titulo={primero ? 'Repetí el PIN' : 'Elegí un PIN nuevo'} subtitulo="De 4 a 8 números" error={errorPin} onListo={async (p) => {
          if (!primero) { setPrimero(p); setErrorPin(undefined); return }
          if (p !== primero) { setPrimero(undefined); return setErrorPin('No coinciden. Empezá de nuevo.') }
          await guardarPinApp(p); setPinHoja(false); toast('PIN guardado')
        }} />
      </Hoja>
    </>
  )
}

function Fuentes() {
  const esquema = useLiveQuery(() => db.esquemaVacunas.toArray(), [], [])
  const recs = useLiveQuery(() => db.recomendaciones.toArray(), [], [])
  const [vac, setVac] = useState<VacunaEsquema | null>(null)
  const [rec, setRec] = useState<Recomendacion | null>(null)
  const sin = esquema.filter((e) => !e.verificado).length + recs.filter((r) => r.vigencia === 'requiere verificación').length
  return (
    <>
      <Cabecera titulo="Fuentes sanitarias" subtitulo="Calendario y recomendaciones editables" atras />
      <Contenido>
        <Tarjeta className="mt-2 !bg-cielo-50 border-cielo-100 text-sm text-cielo-600">
          <p><b>Prioridad de fuentes:</b> MSPBS Paraguay, PAI, DGVS, INCAN, OMS y OPS. Cada ítem muestra su fuente, enlace y fecha de revisión.</p>
          <p className="mt-2">{sin > 0 ? <><b>{sin} ítems</b> todavía requieren verificación contra la publicación oficial vigente.</> : 'Todos los ítems están verificados.'} Cambiar un ítem no modifica los registros que ya cargó la familia.</p>
        </Tarjeta>
        <div className="mt-4 flex items-center justify-between"><h2 className="font-bold">Calendario de vacunación</h2><Boton variante="texto" icono="mas" onClick={() => setVac({ codigo: `nueva-${Date.now()}`, nombre: '', previene: '', dosis: '', grupo: 'Adultos', fuente: 'Programa Ampliado de Inmunizaciones (PAI) – MSPBS', url: 'https://pai.mspbs.gov.py/esquema-regular-de-vacunacion/', verificado: false, activo: true })}>Agregar</Boton></div>
        <div className="mt-2 space-y-2">{esquema.map((e) => (
          <Tarjeta key={e.id} onClick={() => setVac(e)} className={`!p-3 ${!e.activo ? 'opacity-50' : ''}`}>
            <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{e.nombre}</p><span className="text-sm text-piedra-500">{e.dosis}</span>{e.verificado ? <Insignia>Verificada</Insignia> : <Insignia clase="bg-cielo-100 text-cielo-600">Requiere verificación</Insignia>}</div>
            <p className="text-xs text-piedra-500">{e.grupo}{e.edadMeses !== undefined ? ` · ${e.edadMeses < 24 ? `${e.edadMeses} meses` : `${e.edadMeses / 12} años`}` : ''} · {e.fuente}</p>
          </Tarjeta>
        ))}</div>
        <h2 className="mt-6 font-bold">Recomendaciones preventivas</h2>
        <div className="mt-2 space-y-2">{recs.map((r) => (
          <Tarjeta key={r.id} onClick={() => setRec(r)} className="!p-3">
            <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{r.nombre}</p><Insignia clase={r.vigencia === 'vigente' ? 'bg-salvia-100 text-salvia-700' : r.vigencia === 'reemplazada' ? 'bg-crema-200 text-piedra-600' : 'bg-cielo-100 text-cielo-600'}>{r.vigencia}</Insignia></div>
            <p className="text-xs text-piedra-500">{r.categoria} · {r.poblacion} · {r.frecuenciaTexto}</p>
          </Tarjeta>
        ))}</div>
      </Contenido>
      {vac && <FormVacEsquema v={vac} onCerrar={() => setVac(null)} />}
      {rec && <FormRec r={rec} onCerrar={() => setRec(null)} />}
    </>
  )
}

function FormVacEsquema({ v, onCerrar }: { v: VacunaEsquema; onCerrar: () => void }) {
  const [d, setD] = useState(v)
  const toast = useToast()
  const set = (k: keyof VacunaEsquema, x: unknown) => setD((y) => ({ ...y, [k]: x }))
  const guardar = async () => {
    if (!d.nombre.trim()) return toast('Falta el nombre.', 'error')
    const final = { ...d, revisado: d.verificado && !v.verificado ? hoyISO() : d.revisado }
    if (d.id) await db.esquemaVacunas.put(final); else await db.esquemaVacunas.add(final)
    await registrarActividad('Calendario de vacunas actualizado', d.nombre); toast('Calendario actualizado'); onCerrar()
  }
  return (
    <Hoja abierta titulo={d.id ? 'Editar vacuna del calendario' : 'Nueva vacuna del calendario'} onCerrar={onCerrar} pie={<Boton className="w-full" onClick={guardar}>Guardar</Boton>}>
      <Campo etiqueta="Nombre"><Entrada value={d.nombre} onChange={(e) => set('nombre', e.target.value)} /></Campo>
      <Campo etiqueta="Enfermedad que previene"><Entrada value={d.previene} onChange={(e) => set('previene', e.target.value)} /></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Dosis"><Entrada value={d.dosis} onChange={(e) => set('dosis', e.target.value)} /></Campo>
        <Campo etiqueta="Edad (meses)" ayuda="Vacío = por grupo o condición"><Entrada type="number" min={0} value={d.edadMeses ?? ''} onChange={(e) => set('edadMeses', e.target.value === '' ? undefined : Number(e.target.value))} /></Campo>
      </div>
      <Campo etiqueta="Grupo"><Selector value={d.grupo} onChange={(e) => set('grupo', e.target.value)}>{['Recién nacido', 'Lactantes', 'Niños', 'Adolescentes', 'Adultos', 'Adultos mayores', 'Embarazadas', 'Adultos y grupos de riesgo', 'Enfermedades crónicas', 'Mascotas'].map((g) => <option key={g}>{g}</option>)}</Selector></Campo>
      <Campo etiqueta="Fuente"><Entrada value={d.fuente} onChange={(e) => set('fuente', e.target.value)} /></Campo>
      <Campo etiqueta="Enlace oficial"><Entrada type="url" value={d.url ?? ''} onChange={(e) => set('url', e.target.value)} /></Campo>
      <Campo etiqueta="Nota"><Texto rows={2} value={d.nota ?? ''} onChange={(e) => set('nota', e.target.value)} /></Campo>
      <label className="flex items-center gap-3 rounded-2xl bg-white p-3"><input type="checkbox" className="h-6 w-6 accent-turquesa-500" checked={d.verificado} onChange={(e) => set('verificado', e.target.checked)} /><span className="text-sm"><b>Verificada</b> contra la publicación oficial vigente{d.revisado ? ` (revisada el ${fechaCorta(d.revisado)})` : ''}</span></label>
      <label className="flex items-center gap-3 rounded-2xl bg-white p-3"><input type="checkbox" className="h-6 w-6 accent-turquesa-500" checked={d.activo} onChange={(e) => set('activo', e.target.checked)} /><span className="text-sm">Activa en el calendario</span></label>
    </Hoja>
  )
}

function FormRec({ r, onCerrar }: { r: Recomendacion; onCerrar: () => void }) {
  const [d, setD] = useState(r)
  const toast = useToast()
  const set = (k: keyof Recomendacion, x: unknown) => setD((y) => ({ ...y, [k]: x }))
  const guardar = async () => {
    const cambioReal = d.frecuenciaMeses !== r.frecuenciaMeses || d.edadDesde !== r.edadDesde || d.vigencia !== r.vigencia
    await db.recomendaciones.put({ ...d, version: cambioReal ? r.version + 1 : r.version, fechaRevision: hoyISO() })
    await registrarActividad('Recomendación actualizada', `${d.nombre} v${cambioReal ? r.version + 1 : r.version}`)
    toast(cambioReal ? 'Recomendación actualizada. Las fechas ya indicadas por un médico no se modifican.' : 'Guardado'); onCerrar()
  }
  return (
    <Hoja abierta titulo={d.nombre} onCerrar={onCerrar} pie={<Boton className="w-full" onClick={guardar}>Guardar</Boton>}>
      <Campo etiqueta="Población destinataria"><Entrada value={d.poblacion} onChange={(e) => set('poblacion', e.target.value)} /></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Edad desde (años)"><Entrada type="number" value={d.edadDesde ?? ''} onChange={(e) => set('edadDesde', e.target.value === '' ? undefined : Number(e.target.value))} /></Campo>
        <Campo etiqueta="Frecuencia (meses)" ayuda="Vacío = según el médico"><Entrada type="number" value={d.frecuenciaMeses ?? ''} onChange={(e) => set('frecuenciaMeses', e.target.value === '' ? undefined : Number(e.target.value))} /></Campo>
      </div>
      <Campo etiqueta="Frecuencia (texto)"><Entrada value={d.frecuenciaTexto} onChange={(e) => set('frecuenciaTexto', e.target.value)} /></Campo>
      <Campo etiqueta="Fuente"><Entrada value={d.fuente} onChange={(e) => set('fuente', e.target.value)} /></Campo>
      <Campo etiqueta="Enlace"><Entrada type="url" value={d.url ?? ''} onChange={(e) => set('url', e.target.value)} /></Campo>
      <Campo etiqueta="Fecha de publicación o actualización"><Entrada type="date" value={d.fechaPublicacion ?? ''} onChange={(e) => set('fechaPublicacion', e.target.value)} /></Campo>
      <Campo etiqueta="Vigencia"><Chips opciones={[{ v: 'vigente', t: 'Vigente' }, { v: 'requiere verificación', t: 'Requiere verificación' }, { v: 'reemplazada', t: 'Reemplazada' }]} valor={d.vigencia} onChange={(v) => set('vigencia', v)} /></Campo>
      <label className="flex items-center gap-3 rounded-2xl bg-white p-3"><input type="checkbox" className="h-6 w-6 accent-turquesa-500" checked={d.automatica} onChange={(e) => set('automatica', e.target.checked)} /><span className="text-sm">Sugerir la próxima fecha automáticamente según la frecuencia</span></label>
      <Campo etiqueta="Nota"><Texto rows={3} value={d.nota ?? ''} onChange={(e) => set('nota', e.target.value)} /></Campo>
      <p className="text-xs text-piedra-500">Versión {r.version}{r.fechaRevision ? ` · revisada el ${fechaCorta(r.fechaRevision)}` : ''}</p>
    </Hoja>
  )
}

function ActividadLog() {
  const lista = useLiveQuery(() => db.actividad.orderBy('fecha').reverse().limit(200).toArray(), [], [])
  return (
    <>
      <Cabecera titulo="Registro de actividad" subtitulo="Últimos 200 movimientos en este dispositivo" atras />
      <Contenido><Tarjeta className="mt-2">{lista.map((a) => <div key={a.id} className="border-b border-crema-200 py-2 text-sm last:border-0"><p className="font-bold">{a.accion}</p><p className="text-xs text-piedra-500">{new Date(a.fecha).toLocaleString('es-PY')}{a.detalle ? ` · ${a.detalle}` : ''}</p></div>)}</Tarjeta></Contenido>
    </>
  )
}

function Acerca() {
  return (
    <>
      <Cabecera titulo="Acerca de" atras />
      <Contenido>
        <div className="mt-4 flex flex-col items-center text-center">
          <Logo t="lg" />
          <h2 className="mt-3 font-display text-3xl text-salvia-700">Familia Sana</h2>
          <p className="text-piedra-600">Tu familia, su salud, todo en un solo lugar</p>
          <p className="mt-1 text-xs text-piedra-500">Versión 1.0 · Datos guardados en este dispositivo</p>
        </div>
        <Tarjeta className="mt-6 text-center">
          <p className="text-xs uppercase tracking-widest text-piedra-500">Una solución digital de</p>
          <p className="mt-1 font-display text-2xl text-piedra-800">Mix Shop Digital</p>
          <p className="text-sm italic text-piedra-600">“Herramientas inteligentes que simplifican tu vida.”</p>
          <a href="https://wa.me/595994638426" target="_blank" rel="noopener" className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#25D366] px-5 font-bold text-white"><Icono n="whatsapp" c="w-5 h-5" />Consultas por WhatsApp 0994 638 426</a>
          <p className="mt-3 text-sm"><a href="https://mixshopdigital.github.io" target="_blank" rel="noopener" className="font-bold text-turquesa-600">mixshopdigital.github.io</a></p>
        </Tarjeta>
        <Tarjeta className="mt-4 text-sm text-piedra-700">
          <p className="font-bold">Importante</p>
          <p className="mt-1">Familia Sana es una herramienta de organización. No diagnostica, no receta, no cambia dosis y no reemplaza la consulta con profesionales de la salud. Las recomendaciones preventivas y de vacunación muestran su fuente oficial y pueden cambiar: confirmá siempre con tu médico o vacunatorio.</p>
        </Tarjeta>
        <Firma className="mt-8" />
      </Contenido>
    </>
  )
}

function Legal({ tipo }: { tipo: 'privacidad' | 'terminos' }) {
  const privacidad = [
    ['Qué datos guarda', 'Los datos que vos cargás: perfiles de la familia y mascotas, historia clínica, documentos, vacunas, medicamentos, citas, controles y registros de salud femenina.'],
    ['Dónde se guardan', 'En esta versión, solo en el almacenamiento interno del navegador de este dispositivo. No se envían a servidores de Mix Shop Digital ni de terceros.'],
    ['Quién puede verlos', 'Quien tenga acceso a este dispositivo. Por eso recomendamos activar el PIN de la app y el PIN de la sección privada de salud femenina.'],
    ['Datos sensibles', 'La información de salud es sensible. Los datos menstruales y reproductivos no se comparten con otros integrantes ni se incluyen en informes.'],
    ['Compartir', 'Solo se comparte información cuando vos lo hacés (imprimir, descargar o compartir un informe). La app no crea enlaces públicos.'],
    ['Copias y borrado', 'Podés descargar una copia de seguridad, restaurarla y borrar todos los datos cuando quieras desde Configuración.'],
    ['Publicidad', 'Familia Sana no muestra publicidad invasiva y nunca vende ni comercializa datos de salud.'],
    ['Marco legal', 'El tratamiento de datos personales en Paraguay está regulado por la legislación nacional de protección de datos. Antes de ofrecer una versión con cuenta en la nube, este texto se revisará con asesoría legal.'],
    ['Contacto', 'Mix Shop Digital · WhatsApp 0994 638 426.'],
  ]
  const terminos = [
    ['Uso', 'Familia Sana es una herramienta para organizar información de salud familiar. Es de uso personal y familiar.'],
    ['No es atención médica', 'La app no realiza diagnósticos, no indica tratamientos ni modifica dosis. Las estimaciones (por ejemplo, del ciclo menstrual) no son métodos anticonceptivos.'],
    ['Fuentes', 'Los calendarios y recomendaciones se basan en publicaciones oficiales y pueden cambiar. Los ítems sin verificar se marcan como tales.'],
    ['Recordatorios', 'Las notificaciones dependen del navegador, del sistema operativo y de los permisos. No se garantiza su entrega en todos los casos.'],
    ['Responsabilidad', 'La persona usuaria es responsable de la exactitud de los datos que carga y de hacer copias de seguridad.'],
    ['Datos de ejemplo', 'La familia de ejemplo usa datos ficticios, identificados como “Ejemplo”.'],
  ]
  const lista = tipo === 'privacidad' ? privacidad : terminos
  return (
    <>
      <Cabecera titulo={tipo === 'privacidad' ? 'Política de privacidad' : 'Términos de uso'} atras />
      <Contenido><div className="mt-2 space-y-3">{lista.map(([t, x]) => <Tarjeta key={t}><p className="font-bold">{t}</p><p className="mt-1 text-sm text-piedra-700">{x}</p></Tarjeta>)}</div><Firma className="mt-8" /></Contenido>
    </>
  )
}
