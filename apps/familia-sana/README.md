# Familia Sana

Aplicación web progresiva (PWA) para organizar la salud de toda la familia, incluidas las mascotas.
*Una solución digital de Mix Shop Digital.*

- Plan técnico, mapa de navegación y modelo de datos: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)
- Manual de uso para familias: [`docs/MANUAL.md`](docs/MANUAL.md)

## Requisitos

- Node.js 20 o superior.

## Instalar y probar

```bash
npm install
npm run dev        # abre http://localhost:5173
npm run build      # genera la carpeta dist/ lista para publicar
npm run preview    # prueba la versión compilada
```

## Publicar

`dist/` son archivos estáticos con rutas relativas: se puede copiar a cualquier hosting con HTTPS.

- **GitHub Pages, como subcarpeta del sitio:** copiar el contenido de `dist/` a la carpeta `familia-sana/` del repositorio `mixshopdigital.github.io`. Queda en `https://mixshopdigital.github.io/familia-sana/`.
- **Subdominio propio:** crear un repositorio aparte, subir `dist/` y configurar el dominio en GitHub Pages, Netlify o Cloudflare Pages.

HTTPS es obligatorio para instalar la app y para las notificaciones.

## Estructura

```
src/
  App.tsx              navegación (inferior en celulares, lateral en computadoras)
  lib/db.ts            modelo de datos (IndexedDB con Dexie)
  lib/fuentes.ts       calendario de vacunas y recomendaciones con su fuente oficial
  lib/salud.ts         cálculos: edades, vacunas, controles, tomas, ciclo
  lib/avisos.ts        recordatorios y notificaciones
  lib/seguridad.ts     PIN (PBKDF2)
  lib/respaldo.ts      copia de seguridad y restauración
  lib/demo.ts          familia de ejemplo (datos ficticios)
  ui/                  componentes, íconos e ilustraciones
  screens/             una pantalla por módulo
public/                ícono, manifiesto y extra del service worker
```

## Mantenimiento

- **Actualizar el calendario de vacunas o una recomendación:** desde la app, *Configuración › Fuentes sanitarias* (cambia solo ese dispositivo), o editando `src/lib/fuentes.ts` para que las instalaciones nuevas lo traigan. Marcá `verificado: true` solo después de compararlo con la publicación oficial vigente.
- **Agregar un campo:** sumarlo en `src/lib/db.ts`; si es un índice nuevo, crear `this.version(2).stores({...})` sin borrar la versión 1.
- **Probar antes de publicar:** `npm run build` no debe mostrar errores de TypeScript.
