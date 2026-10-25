# Conserca web

Sitio público y sistema interno de **Conserca**, una empresa que **diseña y supervisa sistemas de aire acondicionado y ventilación mecánica** (no realiza la instalación).

Los clientes se registran y piden cotizaciones con un formulario de opciones; el equipo gestiona proyectos, cálculos, presupuestos y supervisión desde un panel con permisos por rol.

> **Estado:** uso local. Todos los clientes, proyectos y cifras de la semilla son de ejemplo, y las fórmulas de cálculo son simplificadas: ingeniería debe validarlas antes de usarlas en un proyecto real.

## Qué incluye

### Sitio público
- Portada animada, sección **Lo que hacemos** que cambia de servicio al hacer scroll, cifras con contador y página de servicios.
- **Modo claro y oscuro** con transición animada; recuerda la preferencia (o usa la del sistema).
- Barra de navegación que marca la sección actual, menú de perfil y cortinas animadas al saltar entre el sitio, la cotización y el panel.
- Respeta la preferencia de _reducir movimiento_ del sistema.

### Cuentas de cliente
- Login y registro en una sola pantalla (`/app/login`): un panel se desliza para mostrar el otro formulario.
- El registro pide nombre, correo, teléfono y contraseña (mínimo 10 caracteres). Crea siempre un rol `usuario`, sin acceso al panel.
- **Editar perfil**: se puede cambiar el nombre libremente; **teléfono y contraseña piden la contraseña actual**. El correo no se puede cambiar. Avisa si hay cambios sin guardar.

### Cotización (`/cotizar`)
- Solo para cuentas con sesión; sin ella, redirige al registro.
- Formulario de opciones: tipo de espacio, servicios, tamaño, etapa y urgencia, más un detalle opcional.
- Se envía con el nombre, correo y teléfono de la cuenta y llega al panel en _Clientes y cotizaciones_.

### Panel del equipo (`/app`)
- **Proyectos** con pestañas de cargas térmicas, distribución de aire, ventilación, presupuesto, supervisión y documentos, y memoria imprimible.
- **Calculadoras** de carga térmica y flujo de ventilación.
- **Catálogo** de equipos y materiales (los roles con permiso pueden agregar y quitar).
- **Clientes y cotizaciones**, y **usuarios y permisos**.

| Rol | Puede editar | Solo ve |
|---|---|---|
| Administración | todo | — |
| Ingeniería | proyectos, cálculos, catálogo | presupuestos, supervisión |
| Presupuestos | presupuestos | proyectos, cálculos, clientes, catálogo |
| Supervisión | supervisión | proyectos, cálculos, catálogo |
| Usuario (sitio) | — | sin acceso al panel |

La matriz completa está en `src/lib/permissions.ts`.

## Tecnología

| Capa | Herramienta |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 4 |
| Animación | Motion (`motion/react`) |
| Base de datos | MySQL (WampServer) con Drizzle ORM |
| Validación y sesión | Zod, bcryptjs, jose (cookie firmada) |
| Pruebas y calidad | Vitest, ESLint |

> Esta versión de Next.js tiene cambios respecto a lo habitual. Antes de tocar código de Next, consulta `node_modules/next/dist/docs/` (ver `AGENTS.md`).

## Puesta en marcha

Necesitas **Node.js** y **WampServer** (MySQL encendido; el ícono en verde).

1. **Crea la base de datos.** En `http://localhost/phpmyadmin`, como `root`, pestaña **Importar**, sube `scripts/crear-base.sql`. Crea la base `conserca` y el usuario `conserca_app`.
2. **Configura `.env`** en la raíz (no se sube a git):
   ```env
   DATABASE_URL=mysql://conserca_app:TU_CONTRASEÑA@127.0.0.1:3308/conserca
   SESSION_SECRET=una-cadena-larga-y-aleatoria
   ```
   Usa el **puerto en que corre el MySQL de WampServer** (aquí, `3308`). Si tienes otro MySQL instalado, puede estar en 3306: asegúrate de apuntar al de Wamp, o la conexión fallará con _Access denied_.
3. **Instala y crea las tablas:**
   ```bash
   npm install
   npm run db:push    # crea las tablas desde src/db/schema.ts
   npm run db:seed    # datos de ejemplo + usuarios de prueba (borra lo que haya)
   npm run dev        # http://localhost:3000
   ```

Cada día basta con encender WampServer y correr `npm run dev`. Para abrir el sitio desde otro equipo de la red local, usa la IP de tu máquina (`http://192.168.x.x:3000`); `next.config.ts` ya permite orígenes `192.168.*.*` en desarrollo.

### Usuarios de prueba
Los correos y contraseñas de ejemplo están en `src/db/seed.ts`: `admin@`, `ingenieria@`, `presupuestos@` y `supervision@conserca.test`. **Cámbialos antes de publicar.**

## Arquitectura

MVC en capas; cada capa solo habla con la de abajo y ESLint lo hace cumplir (`npm run lint` falla si una vista importa `@/db` o `@/models`, o si un controlador hace consultas directas).

```
src/
├─ app/          Vistas: rutas y páginas. (site)/ es el sitio público; app/ es el panel.
│                Los actions.ts son la entrada: llaman al controlador y refrescan la página.
├─ components/   Piezas visuales: site/, app/ y motion/ (animaciones)
├─ controllers/  Reglas de negocio, validación y permisos
├─ models/       Acceso a MySQL: una consulta = una función
├─ lib/          Fórmulas (calc), permisos, sesión, opciones de cotización, formato
├─ db/           Esquema de tablas, conexión y semilla
└─ proxy.ts      Sin sesión válida no se entra a /app (excepto el login)
```

Flujo: **Vista → action → Controlador → Modelo → MySQL**.

La autorización real ocurre en cada página y acción (`src/lib/auth.ts`); `proxy.ts` solo es una primera barrera rápida.

## Base de datos

12 tablas: `users`, `clients`, `quotes`, `projects`, `spaces`, `air_elements`, `vent_zones`, `documents`, `budget_items`, `site_visits`, `observations` y `equipment`. En phpMyAdmin, la pestaña **Diseñador** muestra las relaciones.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compilación y servidor de producción |
| `npm run lint` | ESLint (incluye las reglas de capas) |
| `npm test` | Pruebas de fórmulas y permisos |
| `npm run db:push` | Crea o actualiza las tablas según el esquema |
| `npm run db:seed` | Carga los datos de ejemplo (borra los existentes) |

## Seguridad y límites conocidos
- Las contraseñas se guardan con bcrypt; la sesión va en una cookie `httpOnly` firmada.
- El login limita intentos fallidos por correo, pero el contador vive en memoria (se reinicia con el servidor).
- Cambiar el teléfono o la contraseña exige la contraseña actual; ese paso no tiene límite de intentos.
- Es un proyecto de desarrollo local: antes de publicarlo hay que cambiar las contraseñas de ejemplo, definir un `SESSION_SECRET` propio y revisar la configuración de producción.
