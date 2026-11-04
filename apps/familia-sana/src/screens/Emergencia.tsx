import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, type Integrante } from '../lib/db'
import { nombreCompleto, textoEdad } from '../lib/salud'
import { Avatar, Boton, Tarjeta } from '../ui/kit'
import { Icono } from '../ui/iconos'

/** Ficha de emergencia: lo esencial para mostrar rápido a un médico o socorrista. */
export function FichaEmergencia({ i }: { i: Integrante }) {
  const meds = useLiveQuery(() => db.medicamentos.where('integranteId').equals(i.id!).filter((m) => m.activo).toArray(), [i.id], [])
  const [grande, setGrande] = useState(false)
  const contenido = (
    <div className={`space-y-3 ${grande ? 'text-lg' : ''}`}>
      <div className="flex items-center gap-3"><Avatar i={i} t="lg" /><div><p className="text-xl font-extrabold">{nombreCompleto(i)}</p><p className="text-piedra-600">{textoEdad(i.fechaNacimiento)}</p></div></div>
      <Fila t="Grupo sanguíneo" v={i.grupoSanguineo || 'No se conoce'} fuerte />
      <Fila t="Alergias" v={i.alergias || 'No registradas'} alerta={!!i.alergias} />
      <Fila t="Enfermedades importantes" v={i.cronicas || 'No registradas'} />
      <Fila t="Medicamentos habituales" v={meds.length ? meds.map((m) => `${m.nombre} ${m.concentracion ?? ''} (${m.dosis})`).join(', ') : 'Ninguno registrado'} />
      <Fila t="Contacto de emergencia" v={i.contactoEmergencia || 'No registrado'} />
      {i.medicoCabecera && <Fila t="Médico de cabecera" v={i.medicoCabecera} />}
      {i.seguro && <Fila t="Seguro médico" v={i.seguro} />}
    </div>
  )
  return (
    <div className="mt-4">
      <Tarjeta className="border-2 !border-coral-400">
        <div className="mb-3 flex items-center gap-2 text-coral-600"><Icono n="emergencia" c="w-6 h-6" /><p className="font-extrabold uppercase tracking-wide">Ficha de emergencia</p></div>
        {contenido}
      </Tarjeta>
      <div className="mt-3 grid grid-cols-2 gap-3 no-imprimir">
        <Boton variante="peligro" icono="ojo" onClick={() => setGrande(true)}>Mostrar grande</Boton>
        <Boton variante="borde" icono="imprimir" onClick={() => print()}>Imprimir</Boton>
      </div>
      <p className="mt-3 text-xs text-piedra-500">La ficha solo se ve dentro de la app. Si configurás un PIN, nadie la puede abrir sin desbloquear.</p>
      {grande && (
        <div className="fixed inset-0 z-[95] overflow-y-auto bg-white p-6" onClick={() => setGrande(false)}>
          <p className="mb-4 text-center font-extrabold uppercase text-coral-600">Ficha de emergencia · tocá para cerrar</p>
          {contenido}
        </div>
      )}
    </div>
  )
}
function Fila({ t, v, alerta, fuerte }: { t: string; v: string; alerta?: boolean; fuerte?: boolean }) {
  return <div className={`rounded-2xl p-3 ${alerta ? 'bg-coral-50' : 'bg-crema-100'}`}><p className="text-xs font-bold uppercase text-piedra-500">{t}</p><p className={`${fuerte ? 'text-2xl font-extrabold' : 'font-bold'} ${alerta ? 'text-coral-600' : ''}`}>{v}</p></div>
}
