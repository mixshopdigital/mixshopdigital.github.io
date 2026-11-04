import { createContext, useContext, useEffect, useState, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import type { Integrante } from '../lib/db'
import { Icono, type NombreIcono } from './iconos'

// ---------- Navegación por hash ----------
let navegaciones = 0
/** Cambia en cada navegación real (no con replaceState), para remontar la pantalla. */
export const numeroNavegacion = () => navegaciones
export function useRuta() {
  const leer = () => (location.hash.replace(/^#\/?/, '') || 'inicio').split('?')[0].split('/')
  const [ruta, setRuta] = useState(leer)
  useEffect(() => {
    const f = () => { navegaciones++; setRuta(leer()); window.scrollTo(0, 0) }
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return ruta
}
export const ir = (r: string) => { location.hash = r.startsWith('#') ? r : `#/${r}` }
export const volver = () => (history.length > 1 ? history.back() : ir('inicio'))

// ---------- Avisos breves (toast) ----------
type Toast = { id: number; texto: string; tipo: 'ok' | 'error' }
const ToastCtx = createContext<(texto: string, tipo?: 'ok' | 'error') => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Toast[]>([])
  const mostrar = (texto: string, tipo: 'ok' | 'error' = 'ok') => {
    const id = Date.now() + Math.random()
    setLista((l) => [...l, { id, texto, tipo }])
    setTimeout(() => setLista((l) => l.filter((t) => t.id !== id)), 3200)
  }
  return (
    <ToastCtx.Provider value={mostrar}>
      {children}
      <div className="fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-4 pointer-events-none" aria-live="polite">
        {lista.map((t) => (
          <div key={t.id} className={`toast-in pointer-events-auto flex items-center gap-2 rounded-2xl px-4 py-3 shadow-flota text-sm font-bold max-w-md ${t.tipo === 'ok' ? 'bg-salvia-700 text-white' : 'bg-coral-600 text-white'}`}>
            <Icono n={t.tipo === 'ok' ? 'check' : 'alerta'} c="w-5 h-5 shrink-0" />
            {t.texto}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// ---------- Confirmación ----------
type Pedido = { titulo: string; texto: string; ok: string; peligro?: boolean; resolver: (v: boolean) => void }
const ConfirmCtx = createContext<(titulo: string, texto: string, ok?: string, peligro?: boolean) => Promise<boolean>>(async () => false)
export const useConfirmar = () => useContext(ConfirmCtx)
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Pedido>()
  const pedir = (titulo: string, texto: string, ok = 'Confirmar', peligro = true) => new Promise<boolean>((resolver) => setP({ titulo, texto, ok, peligro, resolver }))
  const cerrar = (v: boolean) => { p?.resolver(v); setP(undefined) }
  return (
    <ConfirmCtx.Provider value={pedir}>
      {children}
      {p && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-piedra-800/40 p-4" onClick={() => cerrar(false)}>
          <div role="alertdialog" aria-modal="true" className="sheet-in w-full max-w-sm rounded-3xl bg-crema-50 p-6 shadow-flota" onClick={(e) => e.stopPropagation()}>
            <div className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full ${p.peligro ? 'bg-coral-100 text-coral-600' : 'bg-salvia-100 text-salvia-700'}`}><Icono n={p.peligro ? 'basura' : 'check'} c="w-6 h-6" /></div>
            <h2 className="text-center font-display text-xl text-piedra-800">{p.titulo}</h2>
            <p className="mt-2 text-center text-piedra-600">{p.texto}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Boton variante="suave" onClick={() => cerrar(false)}>Cancelar</Boton>
              <Boton variante={p.peligro ? 'peligro' : 'primario'} onClick={() => cerrar(true)}>{p.ok}</Boton>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  )
}

// ---------- Botones ----------
type Variante = 'primario' | 'suave' | 'peligro' | 'borde' | 'lavanda' | 'texto'
const VAR: Record<Variante, string> = {
  primario: 'bg-turquesa-500 text-white hover:bg-turquesa-600 shadow-suave',
  suave: 'bg-salvia-100 text-salvia-800 hover:bg-salvia-200',
  peligro: 'bg-coral-500 text-white hover:bg-coral-600',
  borde: 'border-2 border-salvia-200 text-salvia-700 hover:bg-salvia-50 bg-white',
  lavanda: 'bg-lavanda-500 text-white hover:bg-lavanda-600',
  texto: 'text-turquesa-600 hover:bg-turquesa-50',
}
export function Boton({ variante = 'primario', icono, children, className = '', ...p }: { variante?: Variante; icono?: NombreIcono } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-5 font-bold transition active:scale-[0.98] disabled:opacity-50 ${VAR[variante]} ${className}`}>
      {icono && <Icono n={icono} c="w-5 h-5" />}
      {children}
    </button>
  )
}

// ---------- Tarjetas ----------
export function Tarjeta({ children, className = '', onClick, ...p }: { children: ReactNode; className?: string; onClick?: () => void } & React.HTMLAttributes<HTMLDivElement>) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag {...(p as object)} onClick={onClick} className={`block w-full text-left rounded-3xl bg-white p-4 shadow-suave border border-crema-200 ${onClick ? 'transition hover:shadow-flota active:scale-[0.99]' : ''} ${className}`}>
      {children}
    </Tag>
  )
}

export function Insignia({ children, clase = 'bg-salvia-100 text-salvia-700' }: { children: ReactNode; clase?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${clase}`}>{children}</span>
}

export function EtiquetaDemo({ demo }: { demo?: boolean }) {
  if (!demo) return null
  return <Insignia clase="bg-amber-100 text-amber-800">Ejemplo</Insignia>
}

// ---------- Encabezado de sección ----------
export function Cabecera({ titulo, subtitulo, atras, accion, color = 'salvia' }: { titulo: string; subtitulo?: string; atras?: boolean; accion?: ReactNode; color?: 'salvia' | 'lavanda' | 'cielo' | 'coral' | 'turquesa' }) {
  const fondos = { salvia: 'from-salvia-100', lavanda: 'from-lavanda-100', cielo: 'from-cielo-100', coral: 'from-coral-100', turquesa: 'from-turquesa-100' }
  return (
    <header className={`bg-gradient-to-b ${fondos[color]} to-crema-100 px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))]`}>
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        {atras && (
          <button onClick={volver} aria-label="Volver" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/80 text-piedra-700 shadow-suave"><Icono n="atras" c="w-5 h-5" /></button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl leading-tight text-piedra-800 truncate">{titulo}</h1>
          {subtitulo && <p className="text-sm text-piedra-600 truncate">{subtitulo}</p>}
        </div>
        {accion}
      </div>
    </header>
  )
}

export function Contenido({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto max-w-3xl px-4 pb-32 pt-2 ${className}`}>{children}</main>
}

export function Seccion({ titulo, accion, children }: { titulo: string; accion?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-bold text-piedra-700">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  )
}

// ---------- Estado vacío ilustrado ----------
export function Vacio({ ilus = 'familia', titulo, texto, accion }: { ilus?: 'familia' | 'pastilla' | 'calendario' | 'documento' | 'vacuna' | 'mascota' | 'corazon'; titulo: string; texto: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-salvia-200 bg-white/60 px-6 py-8 text-center">
      <Ilustracion n={ilus} />
      <h3 className="mt-3 font-display text-lg text-piedra-800">{titulo}</h3>
      <p className="mt-1 max-w-xs text-sm text-piedra-600">{texto}</p>
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}

export function Ilustracion({ n, c = 'w-28 h-28' }: { n: string; c?: string }) {
  // Ilustraciones simples y originales en SVG
  const comun = { viewBox: '0 0 120 120', className: c, 'aria-hidden': true }
  const fondo = <circle cx="60" cy="60" r="54" fill="#DFEBE3" />
  switch (n) {
    case 'pastilla':
      return <svg {...comun}>{fondo}<rect x="28" y="50" width="64" height="26" rx="13" transform="rotate(-30 60 63)" fill="#fff" /><path d="M60 46l17 30" stroke="#22A39B" strokeWidth="4" transform="rotate(-30 60 63)" /><rect x="28" y="50" width="32" height="26" rx="13" transform="rotate(-30 60 63)" fill="#F4917A" /><circle cx="88" cy="34" r="6" fill="#9479CF" /></svg>
    case 'calendario':
      return <svg {...comun}>{fondo}<rect x="30" y="34" width="60" height="54" rx="10" fill="#fff" /><rect x="30" y="34" width="60" height="16" rx="8" fill="#22A39B" /><g fill="#BFD6C7">{[0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => <rect key={`${r}${k}`} x={37 + k * 12} y={56 + r * 10} width="8" height="6" rx="2" />))}</g><rect x="61" y="66" width="8" height="6" rx="2" fill="#F4917A" /><rect x="42" y="28" width="4" height="12" rx="2" fill="#567F69" /><rect x="74" y="28" width="4" height="12" rx="2" fill="#567F69" /></svg>
    case 'documento':
      return <svg {...comun}>{fondo}<path d="M40 28h30l14 14v50a6 6 0 01-6 6H40a6 6 0 01-6-6V34a6 6 0 016-6z" fill="#fff" /><path d="M70 28v14h14" fill="#D9E8F7" /><g stroke="#6FA3D8" strokeWidth="4" strokeLinecap="round"><path d="M44 56h28M44 66h28M44 76h18" /></g><path d="M74 86l6-10 6 6 8-14" stroke="#22A39B" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'vacuna':
      return <svg {...comun}>{fondo}<g transform="rotate(45 60 60)"><rect x="50" y="26" width="20" height="50" rx="5" fill="#fff" stroke="#22A39B" strokeWidth="3" /><rect x="53" y="50" width="14" height="23" rx="3" fill="#C8ECEA" /><rect x="56" y="16" width="8" height="12" fill="#567F69" /><rect x="48" y="12" width="24" height="6" rx="3" fill="#567F69" /><path d="M60 76v20" stroke="#857D72" strokeWidth="3" strokeLinecap="round" /></g><path d="M86 30l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#F4917A" /></svg>
    case 'mascota':
      return <svg {...comun}>{fondo}<ellipse cx="60" cy="72" rx="20" ry="17" fill="#fff" /><g fill="#fff"><ellipse cx="40" cy="48" rx="8" ry="10" /><ellipse cx="54" cy="40" rx="8" ry="10" /><ellipse cx="68" cy="40" rx="8" ry="10" /><ellipse cx="82" cy="48" rx="8" ry="10" /></g><path d="M60 78c-5-4-9-7-9-11a4 4 0 019-2 4 4 0 019 2c0 4-4 7-9 11z" fill="#F4917A" /></svg>
    case 'corazon':
      return <svg {...comun}>{fondo}<path d="M60 92C40 76 28 66 28 50a15 15 0 0132-6 15 15 0 0132 6c0 16-12 26-32 42z" fill="#fff" /><path d="M36 58h12l5-10 8 20 5-10h18" stroke="#22A39B" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    default:
      return (
        <svg {...comun}>{fondo}
          <circle cx="44" cy="46" r="10" fill="#9479CF" /><path d="M28 86c0-12 7-22 16-22s16 10 16 22z" fill="#C3B3E8" />
          <circle cx="76" cy="44" r="11" fill="#4F8BC9" /><path d="M59 86c0-13 8-23 17-23s17 10 17 23z" fill="#6FA3D8" />
          <circle cx="60" cy="66" r="7" fill="#F4917A" /><path d="M50 92c0-9 4-15 10-15s10 6 10 15z" fill="#FFE1D7" />
          <path d="M60 24c-3-3-8-2-8 2 0 4 8 8 8 8s8-4 8-8c0-4-5-5-8-2z" fill="#22A39B" />
        </svg>
      )
  }
}

// ---------- Avatar ----------
export function Avatar({ i, t = 'md' }: { i?: Integrante; t?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const tam = { sm: 'h-9 w-9 text-lg', md: 'h-12 w-12 text-2xl', lg: 'h-16 w-16 text-3xl', xl: 'h-24 w-24 text-5xl' }[t]
  const color = i?.color ?? '#6E9E84'
  const foto = i?.avatar?.startsWith('data:')
  return (
    <span className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full ${tam}`} style={{ background: `${color}22`, boxShadow: `inset 0 0 0 2px ${color}55` }}>
      {foto ? <img src={i!.avatar} alt="" className="h-full w-full object-cover" /> : <span aria-hidden>{i?.avatar || (i?.nombre?.[0] ?? '?')}</span>}
    </span>
  )
}

// ---------- Campos de formulario ----------
export function Campo({ etiqueta, ayuda, error, children }: { etiqueta: string; ayuda?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-piedra-700">{etiqueta}</span>
      {children}
      {ayuda && !error && <span className="mt-1 block text-xs text-piedra-500">{ayuda}</span>}
      {error && <span className="mt-1 block text-xs font-bold text-coral-600">{error}</span>}
    </label>
  )
}
const estiloCampo = 'w-full min-h-[48px] rounded-2xl border-2 border-crema-200 bg-white px-4 py-2 text-piedra-800 outline-none transition focus:border-turquesa-400 placeholder:text-piedra-400'
export const Entrada = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${estiloCampo} ${p.className ?? ''}`} />
export const Selector = ({ children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`${estiloCampo} ${p.className ?? ''}`}>{children}</select>
export const Texto = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={3} {...p} className={`${estiloCampo} ${p.className ?? ''}`} />

export function Chips<T extends string | number>({ opciones, valor, onChange, multiple }: { opciones: { v: T; t: string }[]; valor: T | T[] | undefined; onChange: (v: T | T[]) => void; multiple?: boolean }) {
  const activo = (v: T) => (Array.isArray(valor) ? valor.includes(v) : valor === v)
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => (
        <button type="button" key={String(o.v)} onClick={() => {
          if (multiple) { const arr = Array.isArray(valor) ? valor : []; onChange(arr.includes(o.v) ? arr.filter((x) => x !== o.v) : [...arr, o.v]) }
          else onChange(o.v)
        }} className={`min-h-[40px] rounded-full px-4 text-sm font-bold transition ${activo(o.v) ? 'bg-turquesa-500 text-white shadow-suave' : 'bg-white text-piedra-700 border-2 border-crema-200'}`}>{o.t}</button>
      ))}
    </div>
  )
}

// ---------- Hoja inferior (modal) ----------
export function Hoja({ abierta, titulo, onCerrar, children, pie }: { abierta: boolean; titulo: string; onCerrar: () => void; children: ReactNode; pie?: ReactNode }) {
  useEffect(() => {
    if (!abierta) return
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    addEventListener('keydown', f)
    document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', f); document.body.style.overflow = '' }
  }, [abierta, onCerrar])
  if (!abierta) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-piedra-800/40" onClick={onCerrar}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className="sheet-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[28px] sm:rounded-[28px] bg-crema-100 shadow-flota" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-crema-200 px-5 py-4">
          <h2 className="flex-1 font-display text-xl text-piedra-800">{titulo}</h2>
          <button onClick={onCerrar} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-full bg-white text-piedra-600"><Icono n="x" c="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">{children}</div>
        {pie && <div className="border-t border-crema-200 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">{pie}</div>}
      </div>
    </div>
  )
}

// ---------- Gráfico de líneas simple (datos reales registrados) ----------
export function GraficoLinea({ puntos, puntos2, unidad, color = '#22A39B', color2 = '#9479CF', alto = 150 }: { puntos: { x: string; y: number }[]; puntos2?: { x: string; y: number }[]; unidad: string; color?: string; color2?: string; alto?: number }) {
  if (puntos.length === 0) return <p className="text-sm text-piedra-500">Todavía no hay valores registrados.</p>
  const todos = [...puntos, ...(puntos2 ?? [])].map((p) => p.y)
  let min = Math.min(...todos), max = Math.max(...todos)
  if (min === max) { min -= 1; max += 1 }
  const pad = (max - min) * 0.15
  min -= pad; max += pad
  const W = 320, H = alto, L = 36, R = 10, Tp = 12, B = 24
  const xs = puntos.map((_, i) => (puntos.length === 1 ? (W + L - R) / 2 : L + (i * (W - L - R)) / (puntos.length - 1)))
  const y = (v: number) => Tp + (1 - (v - min) / (max - min)) * (H - Tp - B)
  const linea = (ps: { y: number }[]) => ps.map((p, i) => `${i ? 'L' : 'M'}${xs[i]},${y(p.y)}`).join(' ')
  const marcas = [min + pad, (min + max) / 2, max - pad]
  const fmt = (n: number) => (Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Gráfico en ${unidad}`}>
      {marcas.map((m) => <g key={m}><line x1={L} x2={W - R} y1={y(m)} y2={y(m)} stroke="#F4EEE4" /><text x={L - 6} y={y(m) + 4} textAnchor="end" fontSize="10" fill="#857D72">{fmt(m)}</text></g>)}
      <path d={`${linea(puntos)} L${xs[puntos.length - 1]},${H - B} L${xs[0]},${H - B} Z`} fill={color} opacity="0.08" />
      <path d={linea(puntos)} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {puntos2 && <path d={linea(puntos2)} fill="none" stroke={color2} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 0" />}
      {puntos.map((p, i) => <g key={i}><circle cx={xs[i]} cy={y(p.y)} r="4.5" fill="#fff" stroke={color} strokeWidth="2.5" /><title>{`${p.x}: ${p.y} ${unidad}`}</title></g>)}
      {puntos2?.map((p, i) => <circle key={`b${i}`} cx={xs[i]} cy={y(p.y)} r="4" fill="#fff" stroke={color2} strokeWidth="2.5" />)}
      {puntos.map((p, i) => (puntos.length <= 6 || i % Math.ceil(puntos.length / 6) === 0) && <text key={`t${i}`} x={xs[i]} y={H - 6} textAnchor="middle" fontSize="10" fill="#857D72">{p.x}</text>)}
    </svg>
  )
}

export function Progreso({ valor, color = 'bg-turquesa-500' }: { valor: number; color?: string }) {
  return <div className="h-2.5 w-full overflow-hidden rounded-full bg-crema-200"><div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(0, Math.min(100, valor))}%` }} /></div>
}

export function Firma({ className = '' }: { className?: string }) {
  return <p className={`text-center text-xs tracking-wide text-piedra-500 ${className}`}>Una solución digital de <span className="font-bold text-salvia-700">Mix Shop Digital</span></p>
}

export function Logo({ t = 'md' }: { t?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-9 w-9', md: 'h-12 w-12', lg: 'h-24 w-24' }[t]
  return <img src="./icono.svg" alt="Familia Sana" className={`${s} rounded-[28%] shadow-suave`} />
}

/** Lee un archivo como dataURL reducido (para fotos de perfil). */
export async function fotoReducida(f: File, lado = 320): Promise<string> {
  const url = URL.createObjectURL(f)
  const img = new Image()
  await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; img.src = url })
  const esc = Math.min(1, lado / Math.max(img.width, img.height))
  const cv = document.createElement('canvas')
  cv.width = img.width * esc; cv.height = img.height * esc
  cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height)
  URL.revokeObjectURL(url)
  return cv.toDataURL('image/jpeg', 0.82)
}

/** true si la ruta actual pide abrir un formulario (por ejemplo "#/agenda?nuevo"). */
export const pide = (q: string) => location.hash.includes(`?${q}`)
export const limpiarPedido = () => { if (location.hash.includes('?')) history.replaceState(null, '', location.hash.split('?')[0]) }
/** Lee un parámetro de la ruta: "#/medicamentos?de=3" → param('de') = '3'. */
export const param = (k: string) => new URLSearchParams(location.hash.split('?')[1] ?? '').get(k) ?? undefined
