# Conserca web

Sitio público y sistema interno de **Conserca**, una empresa que **diseña y supervisa sistemas de aire acondicionado y ventilación mecánica** (no realiza la instalación).

Los clientes piden cotizaciones —rápidas sin cuenta, o personalizadas con cuenta— y con su cuenta siguen el avance de sus proyectos y descargan sus documentos en PDF. El equipo gestiona proyectos, cálculos, presupuestos y supervisión desde un panel con permisos por rol.

> **Estado:** uso local. Todos los clientes, proyectos y cifras de la semilla son de ejemplo, y las fórmulas de cálculo son simplificadas: ingeniería debe validarlas antes de usarlas en un proyecto real.

## Qué incluye

### Sitio público
- Portada animada, sección **Lo que hacemos** que cambia de servicio al hacer scroll (con escenas ilustradas animadas), cifras con contador y página de servicios.
- **Modo claro y oscuro** con transición animada; recuerda la preferencia (o usa la del sistema).
- Barra de navegación que marca la sección actual, logo con efecto al pasar el cursor, menú de perfil y cortinas animadas al saltar entre el sitio, la cotización y el panel.
- Pie de página que cambia según la sesión (con sesión no ofrece iniciar sesión ni registrarse), botón **Regresar** en las páginas secundarias y página **404** propia.
- **Diseño responsive**: pensado para celular desde 360 px. La barra superior se compacta (ícono de sesión en vez de texto), "Lo que hacemos" pasa a tarjetas que aparecen al bajar, y el panel del equipo usa una barra superior con menú que se desliza en lugar de la barra lateral. Las tablas se desplazan de lado dentro de su tarjeta.
- Animaciones: transición entre páginas del sitio y del panel, barras de avance que se llenan, opciones que "saltan" al elegirlas y menú de celular animado.
- Respeta la preferencia de _reducir movimiento_ del sistema.
- **Accesibilidad**: contraste AA verificado en claro y oscuro, foco de teclado visible, enlace "Saltar al contenido" y la memoria se imprime legible desde el modo oscuro.
- **Regional (El Salvador)**: presupuestos en dólares con IVA 13 %, fechas en hora de El Salvador y teléfonos `+503`; todo se ajusta en `src/lib/config.ts`.

### Cuentas de cliente
- Login y registro en una sola pantalla (`/app/login`): un panel se desliza para mostrar el otro formulario. Las contraseñas se pueden mostrar u ocultar.
- El registro pide nombre, correo, teléfono, contraseña (mínimo 10 caracteres) y **aceptar los Términos y el Aviso de privacidad**. Crea siempre un rol `usuario`, sin acceso al panel.
- **Editar perfil**: se puede cambiar el nombre libremente; **teléfono y contraseña piden la contraseña actual**. El correo no se puede cambiar. Avisa si hay cambios sin guardar.

### Cotización (`/cotizar`)
- **Sin sesión → cotización rápida**: nombre, teléfono y una descripción en texto libre (con campo trampa contra bots).
- **Con sesión → cotización personalizada**: opciones de tipo de espacio, tamaño, ubicación, servicios, etapa, plazo, planos, medio y horario de contacto, más un detalle opcional. Usa los datos de la cuenta. El servidor rechaza la rápida si hay sesión.
- Ambas llegan al panel en _Clientes y cotizaciones_.

### Mis proyectos (`/mis-proyectos`)
- Cada cliente con cuenta ve sus proyectos: estado, etapa, **porcentaje de avance**, fechas con los días que faltan, visitas de supervisión (con conteo de observaciones abiertas y cerradas, sin su texto interno) y los **PDF** de cada documento.
- El equipo (rol con edición de proyectos) liga la cuenta del cliente al proyecto, actualiza el avance y sube los PDF (máx. 10 MB; el formulario avisa el límite antes de enviar) desde la ficha del proyecto.
- Los PDF se guardan en `storage/documents/` (fuera de `public/`; no se sube a git) y se descargan por `/api/documentos/[id]`, que solo permite al cliente dueño y al equipo con acceso a proyectos.

### Páginas legales
- **Términos y condiciones** (`/terminos`) y **Aviso de privacidad** (`/privacidad`), redactados para El Salvador. Incluyen la reserva de derechos de autor del sitio y de los entregables.
- Los datos de la empresa están en `src/lib/legal.ts`: **completa `email`** (canal para ejercer derechos sobre datos y avisar infracciones) y cambia `updated` cuando modifiques los textos. Es un borrador: debe revisarlo un abogado antes de publicar.

### Panel del equipo (`/app`)
- **Proyectos** con pestañas de cargas térmicas, distribución de aire, ventilación, presupuesto, supervisión y documentos, y memoria imprimible.
- **Calculadoras** de carga térmica y flujo de ventilación.
- **Catálogo** de equipos y materiales (los roles con permiso pueden agregar y quitar).
- **Clientes y cotizaciones**.
- **Usuarios y permisos**: el admin crea, **edita** (datos, rol, contraseña) y **elimina** usuarios. No se puede eliminar ni cambiar el rol de uno mismo, ni quitar al último administrador; los proyectos de un usuario eliminado se conservan.

| Rol | Puede editar | Solo ve |
|---|---|---|
| Administración | todo | — |
| Ingeniería | proyectos, cálculos, catálogo | presupuestos, supervisión |
| Presupuestos | presupuestos | proyectos, cálculos, clientes, catálogo |
| Supervisión | supervisión | proyectos, cálculos, catálogo |
| Usuario (sitio) | — | sin acceso al panel; ve `/mis-proyectos` |

La matriz completa está en `src/lib/permissions.ts` (fija en el código).

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

1. **Crea la base de datos.** Copia `scripts/crear-base.example.sql` como `scripts/crear-base.sql`, cambia la contraseña e impórtalo en `http://localhost/phpmyadmin` como `root` (pestaña **Importar**). Crea la base `conserca` y el usuario `conserca_app`. El archivo real no se sube a git.
2. **Configura `.env`**: copia `.env.example` como `.env` (no se sube a git) y completa:
   ```env
   DATABASE_URL=mysql://conserca_app:TU_CONTRASEÑA@127.0.0.1:3308/conserca
   SESSION_SECRET=una-cadena-larga-y-aleatoria   # mínimo 32 caracteres
   ```
   Usa el **puerto en que corre el MySQL de WampServer** (aquí, `3308`). Si tienes otro MySQL instalado, puede estar en 3306: asegúrate de apuntar al de Wamp, o la conexión fallará con _Access denied_.
3. **Instala y crea las tablas:**
   ```bash
   npm install
   npm run db:push    # crea las tablas desde src/db/schema.ts
   npm run db:seed    # datos de ejemplo + usuarios de prueba (borra lo que haya)
   npm run dev        # http://localhost:3000
   ```
4. **Antes de publicar:** completa `src/lib/legal.ts`, cambia las contraseñas de ejemplo y define un `SESSION_SECRET` propio.

Cada día basta con encender WampServer y correr `npm run dev`. Para abrir el sitio desde otro equipo de la red local, usa la IP de tu máquina (`http://192.168.x.x:3000`); `next.config.ts` ya permite orígenes `192.168.*.*` en desarrollo.

### Usuarios de prueba
Los correos y contraseñas de ejemplo están en `src/db/seed.ts`: `admin@`, `ingenieria@`, `presupuestos@`, `supervision@` y `cliente@conserca.test`. El cliente de prueba ve el proyecto 01 en `/mis-proyectos`. **Cámbialos antes de publicar.**

## Arquitectura

MVC en capas; cada capa solo habla con la de abajo y ESLint lo hace cumplir (`npm run lint` falla si una vista importa `@/db` o `@/models`, o si un controlador hace consultas directas).

```
src/
├─ app/          Vistas: rutas y páginas. (site)/ es el sitio público; app/ es el panel;
│                api/ sirve los PDF. Los actions.ts son la entrada: llaman al controlador
│                y refrescan la página.
├─ components/   Piezas visuales: site/, app/ y motion/ (animaciones)
├─ controllers/  Reglas de negocio, validación y permisos
├─ models/       Acceso a MySQL: una consulta = una función
├─ lib/          Fórmulas (calc), permisos, sesión, opciones de cotización, PDF, datos legales
├─ db/           Esquema de tablas, conexión y semilla
└─ proxy.ts      Sin sesión válida no se entra a /app (excepto el login) ni a /mis-proyectos
```

Flujo: **Vista → action → Controlador → Modelo → MySQL**.

La autorización real ocurre en cada página y acción (`src/lib/auth.ts`); `proxy.ts` solo es una primera barrera rápida.

## Base de datos

12 tablas: `users`, `clients`, `quotes`, `projects`, `spaces`, `air_elements`, `vent_zones`, `documents`, `budget_items`, `site_visits`, `observations` y `equipment`. En phpMyAdmin, la pestaña **Diseñador** muestra las relaciones.

`projects` guarda el `progress` (0–100) y la cuenta de cliente ligada (`client_user_id`); `documents` guarda el nombre y la ruta del PDF subido.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compilación y servidor de producción |
| `npm run lint` | ESLint (incluye las reglas de capas) |
| `npm test` | Pruebas de fórmulas, permisos y validación de PDF |
| `npm run db:push` | Crea o actualiza las tablas según el esquema |
| `npm run db:seed` | Carga los datos de ejemplo (borra los existentes, incluidos usuarios) |

## Seguridad y límites conocidos
- Las contraseñas se guardan con bcrypt; la sesión va en una cookie `httpOnly` firmada.
- El login limita intentos fallidos por correo, pero el contador vive en memoria (se reinicia con el servidor).
- Cambiar el teléfono o la contraseña exige la contraseña actual; ese paso no tiene límite de intentos.
- Los PDF se validan por contenido (cabecera `%PDF-`) y tamaño; el acceso se revisa en cada descarga.
- La cotización rápida (pública) solo tiene un campo trampa contra bots y validación de formato: sin límite por IP.
- Cambiar la contraseña de un usuario no cierra sus sesiones abiertas (duran 7 días).
- Es un proyecto de desarrollo local: antes de publicarlo hay que cambiar las contraseñas de ejemplo, definir un `SESSION_SECRET` propio, completar los datos legales y revisar la configuración de producción.
