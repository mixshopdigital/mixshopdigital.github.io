# Familia Sana · Arquitectura y plan técnico

*Tu familia, su salud, todo en un solo lugar.* Una solución digital de **Mix Shop Digital**.

## 1. Análisis del entorno

| Tema | Situación | Decisión |
|---|---|---|
| Sitio de la marca | `mixshopdigital.github.io` es un sitio estático en GitHub Pages (HTML, CSS, JS). No tiene servidor ni base de datos. | La app vive **separada** del sitio. Se puede publicar como subcarpeta (`/familia-sana/`) o en un subdominio, sin tocar el resto del sitio. |
| Servidor y base de datos en la nube | No hay cuenta de Supabase u otro backend todavía. | **Fase 1 (esta entrega): todo se guarda en el dispositivo** (IndexedDB). **Fase 2:** sincronización con Supabase (PostgreSQL + Auth + Storage privado). |
| Fuentes oficiales | Verificadas el 4/11/2026 contra el PAI (Esquema Regular 2026, actualizado el 2/9/2026, y Adenda VPH 2026), la DGVS y el MSPBS. | De 0 a 14 años, mamografía y próstata: **verificados**. Adultos, embarazadas y grupos de riesgo: el PAI solo publica la tabla 2021, por eso siguen como **“Requiere verificación”**. Detalle en `LISTA-VERIFICADA.md`. |

## 2. Tecnologías elegidas (y por qué)

| Capa | Elección | Motivo |
|---|---|---|
| Interfaz | **React 19 + TypeScript** con **Vite** | Estándar, mantenible, tipado fuerte para datos sensibles. Vite compila a archivos estáticos: se puede alojar gratis en GitHub Pages. |
| Estilos | **Tailwind CSS 3** con paleta propia | Sistema de diseño consistente y liviano. |
| Datos (fase 1) | **IndexedDB vía Dexie** | Funciona sin internet, guarda archivos (PDF, fotos) y no necesita servidor ni costo mensual. |
| PWA | **vite-plugin-pwa (Workbox)** | Instalable en Android, iPhone y computadoras; funciona sin conexión. |
| Gráficos | SVG propio (sin librería) | Livianos, accesibles y solo con datos reales registrados. |
| PDF | Hoja de impresión del navegador (“Guardar como PDF”) | Funciona en todos los navegadores sin enviar datos a ningún servicio. |
| Seguridad local | PIN con **PBKDF2-SHA-256 (150 000 iteraciones) + sal** (WebCrypto) | El PIN nunca se guarda en texto. |
| Fase 2 | **Supabase**: PostgreSQL con *Row Level Security*, Auth, Storage privado, Edge Functions para Web Push | Roles, invitaciones familiares, enlaces temporales firmados para médicos, copias en la nube. |

No se eligió Next.js porque esta fase no necesita servidor; agregarlo encarecería el alojamiento sin beneficio.

## 3. Mapa de navegación

```
Bienvenida (3 pasos: presentación → privacidad y consentimiento → tu nombre / demo / PIN)
└── [PIN de la app, si está activado]
    ├── Inicio (dashboard)  ← navegación inferior
    │     saludo · contadores · familia · remedios de hoy · próximas citas
    │     alertas preventivas · gráfico de evolución · cumplimiento · accesos rápidos
    ├── Mi familia          ← navegación inferior
    │     └── Perfil del integrante
    │           ├── Resumen (indicadores + accesos a cada módulo)
    │           ├── Ficha de emergencia
    │           ├── Línea de tiempo
    │           └── Crecimiento (niños) / Peso (mascotas)
    ├── Medicamentos        ← navegación inferior   (Horarios · Tratamientos · Cumplimiento)
    ├── Agenda              ← navegación inferior   (Mes · Semana · Lista)
    └── Más (menú)
          ├── Historia clínica      ├── Vacunación (carnet digital)
          ├── Análisis y documentos ├── Mascotas
          ├── Prevención            ├── Tengo una consulta
          ├── Salud femenina (PIN propio)
          ├── Recordatorios (centro de notificaciones)
          ├── Informes (resumen mensual + PDF por integrante + carpeta digital)
          └── Configuración (accesibilidad, PIN, recordatorios, copias, fuentes sanitarias, privacidad, términos, acerca de)
```

En computadoras, el menú inferior se reemplaza por un menú lateral con todas las secciones.

## 4. Modelo de datos

Definido en `src/lib/db.ts`. Cada tabla se traslada 1 a 1 a PostgreSQL en la fase 2 (agregando `familia_id` y `creado_por`).

| Tabla | Para qué | Campos principales |
|---|---|---|
| `integrantes` | Personas y mascotas | tipo, nombre, apellido, fechaNacimiento, sexo, relación, avatar/foto, grupo sanguíneo, documento, teléfono, alergias, crónicas, antecedentes, médico, centro, seguro, contacto de emergencia, especie, raza, peso, microchip, veterinario, archivado, antecedentes familiares |
| `registros` | Historia clínica (humana y veterinaria) | integranteId, categoría, fecha, título, descripción, profesional, especialidad, centro, diagnóstico informado, tratamiento, observaciones, próxima fecha, adjuntos |
| `documentos` | Biblioteca de estudios | integranteId, nombre, categoría, fechas, laboratorio, observaciones, archivo (Blob) |
| `mediciones` | Valores para gráficos | integranteId, tipo (peso, talla, perímetro cefálico, presión, glucemia, colesterol, hemoglobina, creatinina), fecha, valor(es), referencia del laboratorio |
| `medicamentos` | Tratamientos | integranteId, nombre, principio activo, presentación, concentración, dosis, vía, frecuencia (diaria / días / cada X horas), horarios, inicio, fin, prescriptor, indicaciones, receta, stock, renovación |
| `tomas` | Historial de cumplimiento | medicamentoId, fecha, hora, estado (tomado / pospuesto / omitido) |
| `eventos` | Agenda | integranteId, categoría, fecha, hora, especialidad, profesional, dirección, teléfono, motivo, estado, anticipación del aviso |
| `esquemaVacunas` | Calendario oficial editable | código, nombre, previene, dosis, edad en meses, grupo, fuente, url, verificado, activo |
| `vacunas` | Vacunas de cada integrante | código del esquema, fecha aplicada, lugar, lote, próxima dosis, **confirmada** |
| `recomendaciones` | Fuentes sanitarias de prevención | nombre, categoría, población, edades, frecuencia, fuente, url, fechas, vigencia, versión, automática |
| `controles` | Controles realizados | recomendación, fecha, próxima fecha indicada por el médico |
| `ciclos`, `etapas` | Salud femenina (privada) | inicio, fin, intensidad, dolor, síntomas, ánimo; embarazo, lactancia, posparto, menopausia, tratamiento hormonal |
| `notas` | “Tengo una consulta” | síntoma o pregunta, resuelta |
| `ajustes`, `actividad` | Configuración y registro de actividad | — |

## 5. Reglas sanitarias implementadas

- **Vacunas:** la fecha sugerida = fecha de nacimiento + edad del esquema. Estados: *Aplicada* (solo si la persona lo confirma), *Próxima* (±30 días), *Atrasada* (más de 30 días y menos de un año sin registro), *Requiere verificación* (sin registro hace más de un año, o registrada sin confirmar), *Pendiente*. Nunca se marca como aplicada sola.
- **Prevención:** cada control muestra población, frecuencia, fuente, enlace y vigencia. Solo se sugiere la próxima fecha automáticamente cuando la fuente da una frecuencia (por ejemplo mamografía anual desde los 40 años). PSA / tacto rectal **no se programan**: se muestra la recomendación del MSPBS (chequeo desde los 50 años, o 40 con antecedentes) para conversar con el médico. Si el médico indica otra fecha, esa manda.
- **Resultados de laboratorio:** se guardan y grafican con la referencia que informó el laboratorio. La app no interpreta.
- **Ciclo menstrual:** estimaciones con el promedio de los últimos ciclos registrados, desactivables, con aviso de que **no es método anticonceptivo**.
- **Medicamentos:** los recordatorios salen de la prescripción cargada. La app nunca cambia dosis ni horarios.
- **Actualización del catálogo:** `VERSION_CATALOGO` en `src/lib/demo.ts`. Al subirla, cada dispositivo actualiza las vacunas y recomendaciones por código al abrir la app, sin tocar los registros de la familia y conservando lo agregado a mano.
- **Cambio de recomendaciones:** al editar una recomendación sube su versión; las fechas indicadas por un médico y los registros históricos no se modifican.

## 6. Seguridad y privacidad (fase 1)

- Datos solo en el dispositivo; no se envían a ningún servidor. Se pide almacenamiento persistente al navegador.
- PIN de la app (bloqueo al abrir y tras 5 minutos en segundo plano, espera de 30 s cada 5 intentos fallidos).
- PIN propio por mujer para la sección de salud femenina. Esos datos nunca aparecen en informes.
- Documento de identidad oculto hasta tocar “Ver”.
- Confirmación antes de borrar; borrado total de datos; copia de seguridad y restauración en archivo.
- Registro de actividad local.
- Sin enlaces públicos: los informes se imprimen o se comparten desde el propio celular.
- Consentimiento informado, política de privacidad y términos de uso dentro de la app.

**Límite honesto:** en esta fase los datos no están cifrados dentro del navegador; la protección es el PIN y el bloqueo del propio celular. El cifrado en reposo y los permisos por rol llegan con la fase 2.

## 7. Fase 2 (requiere servicios externos)

| Función pedida | Qué hace falta | Mientras tanto |
|---|---|---|
| Cuenta, inicio de sesión y recuperación | Proyecto Supabase (plan gratuito alcanza para empezar) | PIN local + copia de seguridad |
| Varios integrantes con su propio acceso, invitaciones y roles (administrador, adulto titular, adulto autorizado, tutor, solo lectura) | Supabase Auth + tablas `familias`, `miembros_familia(rol)` + políticas RLS | Un solo dispositivo por familia; sección femenina con PIN propio |
| Compartir un informe temporalmente con un médico | Storage privado + enlaces firmados que vencen (Edge Function) | Imprimir / compartir el PDF o los archivos desde el celular |
| Avisos con la app cerrada | Web Push con claves VAPID + función programada en el servidor | Avisos mientras la app está abierta o en segundo plano + archivo `.ics` para el calendario del celular |
| Copias en la nube y cifrado en reposo | Storage + cifrado del lado del cliente | Copia de seguridad descargable |
| Asistente de IA (etapa futura) | API de IA con consentimiento explícito por documento | La estructura de datos ya separa documentos, valores y notas para poder resumirlos |

## 8. Notificaciones: qué se puede garantizar

| Plataforma | Con la app abierta o en segundo plano | Con la app cerrada |
|---|---|---|
| Android (Chrome) instalada | Sí | No en fase 1 (requiere Web Push, fase 2) |
| iPhone (iOS 16.4+) **instalada** en pantalla de inicio | Sí, con permiso | No en fase 1 |
| iPhone en Safari sin instalar | No permite notificaciones | No |
| Computadora | Sí | No |

Por eso el centro de **Recordatorios** dentro de la app es la fuente principal, y cada cita se puede agregar al calendario del celular.

## 9. Modelo de venta

Familia Sana se vende con **pago único**: una sola compra, sin licencias, suscripciones ni vencimientos. Cada compra recibe un **código de activación** (`FS-XXXX-XXXX-XXXX`) que se pone una sola vez al abrir la app. Se valida sin internet (`src/lib/activacion.ts`): los últimos 4 caracteres son una firma SHA-256 de los 8 anteriores con una clave que se pasa al compilar (`VITE_ACTIVACION_SAL` en `.env.local`, que no se sube al repositorio). La activación queda en el dispositivo y se conserva aunque se borren los datos. No vence y no se controla desde un servidor. Es una protección contra el reenvío del link, no un candado imposible de saltar. Los códigos se generan con la planilla privada de Mix Shop Digital. Sin publicidad y **sin comercializar datos de salud**. Sin precios dentro de la app: las consultas van por WhatsApp 0994 638 426.
