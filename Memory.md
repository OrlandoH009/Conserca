# Memory — Conserca

Registro de cambios del proyecto. Reconstruido desde el historial de git (hasta `cfc7796`, 2026-10-28). Agrega una entrada nueva arriba cada vez que hagamos cambios.

Para detalles estables ver: `README.md` (qué incluye, roles, stack), `DESIGN.md` (tokens y reglas de diseño), `AGENTS.md` (aviso: este Next.js tiene cambios, leer `node_modules/next/dist/docs/` antes de tocar código de Next).

## Contexto rápido
- **Qué es:** sitio público + panel interno de Conserca (diseña y supervisa sistemas de A/C y ventilación; no instala).
- **Stack:** Next.js 16 (App Router) + React 19 + TS, Tailwind 4, Motion, MySQL (WampServer) + Drizzle, Zod, bcryptjs, jose, Vitest, ESLint.
- **Estructura:** `src/app/(site)` (público), `src/app/app/(panel)` (equipo), `src/app/app/login`, `src/controllers`, `src/models`, `src/db`, `src/lib`, `src/components/{app,site,motion}`.
- **Regional:** El Salvador — USD, IVA 13 %, `America/El_Salvador`, `+503` (`src/lib/config.ts`).
- **Estado:** uso local; datos de semilla son de ejemplo; fórmulas simplificadas (ingeniería debe validarlas).

## Historial

### 2026-11-06 — Roles fijos: solo los 3 del equipo + usuario de prueba (sin commit aún)
- Por indicación del usuario (el PDF menciona a las 3 personas del equipo), los roles quedan **fijos en 4**: `admin` = Gerente de Diseño, `ingenieria` = Ing. Diseñador, `dibujo` = Técnico en Dibujo y `usuario` = cuenta de prueba/cliente del sitio. Se **quitaron** los roles `presupuestos` y `supervision` (permisos, tipos, semilla, README, pruebas).
- Consecuencias: el Ing. Diseñador ahora **edita supervisión** (antes solo la veía; era un rol aparte); presupuestos lo edita solo el Gerente (Ingeniería lo ve); cobros solo el Gerente.
- **Base de datos actualizada:** quedan 4 usuarios (`admin@`, `ingenieria@`, `dibujo@`, `cliente@conserca.test`); se borraron `presupuestos@` y `supervision@` y el proyecto que tenía el supervisor pasó al Ing. Diseñador. Contraseña de `dibujo@`: la de la semilla (`Dibujo-Prueba-2026`). La cuenta de prueba ve el proyecto 07 («Proyecto de prueba»), no el 01.
- Probado en navegador con las 4 cuentas; `tsc`, `eslint` y `vitest` (26) sin errores.

### 2026-11-06 — Roles según el PDF del cliente (sin commit aún)
- **Equipo según el PDF** (máx. 3 personas por proyecto): Gerente de Diseño (decide, aprueba, factura; = rol `admin`), Ing. Diseñador (= `ingenieria`) y **Técnico en Dibujo** (nuevo rol `dibujo`). `presupuestos` y `supervision` se conservaron como roles opcionales (el PDF no los menciona; se pueden quitar si no se usan).
- **Áreas nuevas** en `lib/permissions.ts`: `cobros` (solo Gerente y Presupuestos; **Ingeniería ya no ve la pestaña Cobros**, antes la veía por colgar de presupuestos) y `documentos` (subir/cambiar/quitar documentos; Gerente, Ingeniería y Dibujo editan, el resto solo ve). El Técnico en Dibujo ve proyectos y cálculos pero no cambia estado/etapa/avance ni ve clientes, cobros ni presupuesto. Los avisos de revisión del cliente ahora llegan a quienes editan documentos.
- Etiquetas: Gerente de Diseño / Ing. Diseñador / Técnico en Dibujo (con EN). Semilla con usuario `dibujo@conserca.test`; README con la tabla nueva.
- **Cuentas existentes:** la base no se tocó; para usar el rol nuevo hay que crear (o cambiar de rol a) un usuario en Usuarios y permisos. Probado en navegador con los 5 roles (pestañas, botones, rutas y subida de documentos); `tsc`, `eslint` y `vitest` (27) sin errores.

### 2026-11-06 — Cobros y facturación, según las respuestas del cliente (sin commit aún)
- **Origen:** PDF «Preguntas_levantamiento_HVAC - RESPUESTAS RAZM» (las respuestas están como notas del PDF). Dolor principal: se olvida llevar el control de avances y facturar (Anticipo → Estimación 1 → Estimación 2 → Pago final); un proyecto se quedó sin facturar por cierre de año. Quien decide y aprueba: el Gerente de Diseño HVAC / Representante Legal. Son ~50 proyectos al año (25 % grandes, 50 % medianos, 25 % pequeños), equipo de 3 personas.
- **Nueva pestaña «Cobros»** en el proyecto (`tabs/Cobros.tsx`, área `presupuestos`): plan de 4 cobros a partir del monto del contrato (30/30/20/20 % y avance 0/40/70/100 %, **valores de partida que hay que confirmar con el cliente**, se editan por cobro), estados Pendiente → Facturado → Cobrado con n.º de factura y fechas, alerta «Toca facturar» cuando el avance del proyecto llega al del cobro (o ya está entregado) y aviso en nov–dic por el cierre de año. Reglas puras en `lib/payments.ts` (+ test).
- **Panel general:** tarjeta «Por facturar», lista «Cobros por atender» y aviso de cierre de año (solo roles con acceso a presupuestos).
- **Clientes:** campos NIT/NRC, correo de facturación y quién autoriza que se facture; la pestaña Cobros avisa lo que falte.
- **Documentos:** nuevos tipos del flujo real: oferta firmada, orden de compra, contrato, fichas técnicas, cuadros de equipos.
- **Base de datos:** tabla nueva `payments` y 3 columnas en `clients` → hace falta `npm run db:push` con MySQL encendido (no se pudo aplicar ni ver en el navegador: estaba apagado). `tsc`, `eslint` y `vitest` (25 pruebas) sin errores; traducciones EN añadidas.
- **No hecho (siguiente):** seguimiento de ofertas con fecha límite (cotizaciones → oferta → negociación → aceptada), avisos automáticos por correo, roles Técnico en Dibujo / Ing. Diseñador, facturación electrónica real.

### 2026-11-02 — Panel del equipo también en inglés (sin commit aún)
- Mismo mecanismo (`t()` + `lib/i18n-en.ts` + cookie `lang`): ahora cubre `/app` completo (menú, panel general, proyectos y sus 7 pestañas, memoria imprimible, calculadoras, catálogo, clientes y cotizaciones, usuarios y permisos, avisos) y los componentes compartidos (`ActionForm`, `ActionButton`, `AutoSelect`, `EditDialog`, `PdfInput`, `Calculators`, `ProgressControl`, `RowActions`, `SideNav`, `MobileNav`, `BellLink`, `PrintButton`).
- **Mensajes del servidor:** `translate()` ahora también reconoce claves con `{marcadores}` como *patrón* sobre textos ya armados en español (errores de validación, avisos y actividad guardados: «Documento «X»: En revisión» → «Document “X”: Under review»). Lo específico va antes que lo general en `i18n-en.ts`. Se aplica con `t(r.error)` en formularios/botones y `t(e.message)` / `t(n.text)` en actividad y avisos. Los textos ya guardados en la base no cambian, solo se traducen al mostrarse.
- **Hecho con un codemod** (envolvió texto JSX y atributos en `t()` e inyectó `getT()`/`useT()`), más revisión manual de constantes (`QS`, `KIND`, `STATUS`, `TABS`, `AREAS`, `LV`…), plantillas con variables y mensajes. `lib/i18n.test.ts` ahora también revisa esas constantes y el reconocimiento de mensajes del servidor.
- Cambios de API: `detailRows(d, t?)` acepta traductor; `ActionForm`/`ActionButton`/`AutoSelect`/`RowActions` ya no tienen textos por defecto en los parámetros (se resuelven dentro); `AutoSelect` traduce el texto de sus opciones; `BellLink` pasó a componente de cliente; `ProjectTabs` y `SideNav` traducen sus etiquetas.
- **Pendiente / limitaciones:** las fechas del panel siguen con meses en español (`fmtDate` usa `CONFIG.locale`); solo Mis proyectos pasa el idioma. Si un mensaje del servidor no tiene patrón en el diccionario, se ve en español. Los datos que escribe la gente (nombres, catálogo, mensajes de cotización, zonas) no se traducen.
- **Verificado con la base ya encendida:** login con la cuenta de prueba, panel general, proyectos (las 7 pestañas y la memoria), clientes, catálogo, calculadoras, usuarios y avisos en inglés y en español; `tsc`, `eslint` y `vitest` (22 pruebas) sin errores. Al probar se corrigieron: etapas de proyecto, tipo de espacio, "N zonas" y el aviso "Estimado con fórmulas simplificadas…". Sin probar: errores de formularios y confirmaciones en inglés con clics reales.

### 2026-11-02 — Idioma inglés en el sitio público (sin commit aún)
- **Cómo funciona:** el español es la clave. `t("Texto en español")` devuelve la traducción si el idioma es inglés; si falta, muestra el español. Cookie `lang` (`es`/`en`), sin prefijo en la URL. Servidor: `getT()`/`getLocale()` (`lib/i18n-server.ts`); cliente: `useT()` (`components/site/LocaleProvider.tsx`, puesto en `app/layout.tsx`). Botón **EN/ES** (`LangToggle`) en la barra, el menú de celular y las pantallas de login; `<html lang>` y títulos de página (`generateMetadata`) cambian con el idioma.
- **Diccionario:** `lib/i18n-en.ts`. Para agregar un texto nuevo: escribirlo en español dentro de `t()` y añadir su traducción ahí. `lib/i18n.test.ts` falla si algún `t("…")` literal, servicio, opción de cotización, etapa o rol no tiene traducción (los textos que llegan por variable solo los cubren las listas de datos).
- **Traducido:** barra, pie, portada, "Lo que hacemos", servicios, cotización rápida y personalizada, login/registro, menú de usuario, editar perfil, Mis proyectos, Avisos (interfaz), 404 y mensajes de error de los formularios. Los valores que se guardan/validan en el servidor (opciones de cotización, etapas, servicios) siguen en español; solo cambia lo que se ve.
- **No traducido:** el panel del equipo (`/app`), los textos legales (Términos y Privacidad; en inglés muestran un aviso de que rige la versión en español y su fecha sigue en español), y los textos que genera el servidor al guardar (avisos, actividad, nombres de proyectos).
- Cambio de texto en español: la etiqueta "Inicio" de Mis proyectos pasó a "Inicio del proyecto" (chocaba con "Inicio" = Home del menú). `StatusBadge`, `StageStepper`, `NotificationList`, `LegalDoc` y `SkipLink` ahora son componentes async de servidor. `fmtDate`/`fmtDateTime` aceptan un locale opcional.
- Verificado en el navegador: portada, servicios, cotizar, login, 404, legales y cambio EN↔ES. Sin ver: Mis proyectos, cotización con sesión y Avisos (MySQL apagado). `tsc`, `eslint` y `vitest` sin errores.

### 2026-11-02 — Línea de la barra ya no rebota + logo del login lleva al inicio (sin commit aún)
- Bug: al bajar hasta el fondo y cambiar de página desde la barra, la línea bajo el enlace activo salía desde abajo (la barra es `fixed` y el `layoutId` de motion contaba el scroll). `layoutRoot` (en el `nav` y en el `header`) no lo arregló. Solución en `NavLinks.tsx`: se quitó el `layoutId` deslizante; ahora cada enlace activo muestra su línea con una animación corta (`bar-grow`). Medido: la línea se queda en y=44 todo el cambio.
- Mismo arreglo en `SideNav.tsx` (panel): fondo y barra de la sección activa sin `layoutId` (aparecen con `pop`); se quitó la prop `scope` (ya no hacía falta; también en `MobileNav`). `tsc` y `eslint` sin errores; no se pudo ver renderizado porque MySQL sigue apagado.
- Login (`app/login/AuthShell.tsx`): el logo, en escritorio y en celular, ahora es un enlace a `/` (inicio).

### 2026-11-02 — Banda final en oscuro vuelve a la paleta (sin commit aún)
- Feedback: en modo oscuro la banda "Cuéntanos tu proyecto" (casi blanca por la inversión de `--mono`) no parecía parte de la web.
- `(site)/page.tsx`: en oscuro la banda usa `dark:bg-accent-solid` (azul de marca) con botón blanco de texto azul; en claro sigue negra. `globals.css`: `.dark .btn-dark` vuelve al azul (botón "← Ir al sitio" del panel). Regla: `--mono` casi blanco en oscuro solo para detalles pequeños (punto/barra del menú), no para bloques grandes.

### 2026-11-02 — Logo nuevo del usuario (sin commit aún)
- El usuario reemplazó `public/brand/logo.png` (mismo tamaño 2068×408, sin los blancos). Se sincronizó `logo-dark.png` con la transparencia del nuevo para que ambos modos se vean igual (copia previa fuera del repo; se puede rehacer desde git). `logo-white.png` (login) y `mark.png` siguen siendo los de siempre.
- `Logo.tsx`: `sizes` de 240px → 480px para que Next sirva una imagen más nítida (pantallas retina) y se lea mejor el texto "Sistemas HVAC · Diseño · Supervisión". Tamaños de la sesión anterior sin cambios (nav `h-11`, pie `h-12`).
- Pendiente: que el usuario confirme si le gusta; si no, `git checkout -- public/brand` vuelve al logo original.

### 2026-11-02 — "Lo que hacemos" solo con clic (sin commit aún)
- `components/motion/ScrollServices.tsx` (escritorio): se quitó el efecto de scroll (sección fija de ~560vh, manchas y rejilla que se movían). Ahora es una sección de una pantalla y el servicio cambia solo al hacer clic en la lista. Fondo estático. El nombre del archivo quedó igual aunque ya no usa scroll.
- Celular (`MobileServices`) no cambió: ya eran tarjetas simples.

### 2026-11-02 — Logo más grande y limpio + cortina hacia login/registro (sin commit aún)
- Logo: `public/brand/logo.png` y `logo-dark.png` se limpiaron (se quitó el halo/bordes blancos y la franja pálida que no eran parte del logo; se conservan los blancos internos de las olas y letras). El original está en git (`git checkout -- public/brand` lo restaura). `logo-white.png` y `mark.png` no se tocaron.
- Tamaños: `Logo` por defecto `h-8` → `h-10`; barra superior del sitio `h-11`; pie de página `h-12`; menú de celular se queda en `h-8` (el ancho del menú no da para más).
- `PageWipe.tsx`: ahora la cortina animada también se usa al ir desde cualquier página del sitio (p. ej. Servicios) a `/app/login` o `/registro`. Desde el panel (cerrar sesión) no. Verificado en el navegador: cubre, navega y retira.

### 2026-11-02 — Toques minimalistas en negro/gris/blanco (sin commit aún)
- Nuevos tokens `--mono` / `--on-mono` (`bg-mono`, `text-on-mono`) en `globals.css`: negro `#0a0a0a` sobre blanco en claro; se invierte (casi blanco con texto negro) en oscuro y en impresión. Documentado en `DESIGN.md`.
- Portada (`(site)/page.tsx`): cifras grandes y cifras de ejemplos en `text-ink`; etiqueta "Ejemplos de proyecto" y números de pasos en `text-mute`; chip de tipo de proyecto neutro con borde; banda final "Cuéntanos tu proyecto" en negro con botón blanco.
- Global: barra de scroll gris (`--field-line`) en vez de degradado cian; hover de `.card` con borde neutro (`ink/25`) en vez de acento.
- Panel: `SideNav` con sección activa en negro/gris (texto `ink`, barra y punto `bg-mono`, fondo `line/50`); botón "← Ir al sitio" negro (`.btn-dark`); "Cerrar sesión" y acciones rápidas con contorno gris (`.btn-line`); hover de filas de tablas gris (`line/40`).
- Nuevas clases en `globals.css`: `.btn-dark` (junto a `.btn`) y `.btn-line` (junto a `.btn-ghost`).
- Verificación del panel: no se pudo ver renderizado porque MySQL (WampServer) estaba apagado y el login falla con "Failed query ... users". Solo se comprobaron las clases nuevas en claro/oscuro sobre elementos de prueba. Pendiente mirar el panel con la base encendida.
- La paleta azul (`--accent`, botones, enlaces, "Supervisamos.") no se tocó.
- Nota: había un `next dev` ya corriendo en el puerto 3000 (el 3100 de `launch.json` choca con él).

### 2026-10-28 — `cfc7796` Arreglos 2 (155 archivos)
**Sitio público**
- Cotización dividida: rápida sin sesión (`QuickForm`, campo trampa anti-bot) y personalizada con sesión (`CotizarForm`, detalles en `quote-details.ts`).
- Nuevo `/mis-proyectos`: el cliente ve estado, etapa, % de avance, fechas, visitas y PDF.
- Páginas `/terminos`, `/privacidad` (datos en `lib/legal.ts`; pendiente completar `email` y revisión legal), `/avisos`, `not-found` propio.
- Responsive: `MobileMenu`, `MobileServices`, nav compacto; `RouteProgress`, `BackButton`, `StageStepper`, `SkipLink`.
- Logo/branding en `public/brand/`, íconos (`icon.png`, `apple-icon.png`, `opengraph-image.png`); se quitaron los SVG de plantilla y `favicon.ico`.

**Panel**
- Proyecto con pestañas (`ProjectTabs`) + nueva pestaña **Actividad**; tabs de Cargas, Distribución, Documentos, Presupuesto, Supervisión y Ventilación reescritas.
- Documentos PDF (≤10 MB) guardados en `storage/documents/`, descarga por `/api/documentos/[id]` (solo cliente dueño y equipo con acceso).
- Presupuesto descargable: `/api/proyectos/[id]/presupuesto`.
- Clientes: editar/eliminar (`EditDialog`, `RowActions`, `ConfirmButton`).
- Usuarios: página de edición `usuarios/[id]`; no se puede borrar ni cambiar rol de uno mismo ni quitar al último admin.
- Avisos/notificaciones (`BellLink`, `NotificationList`, `MarkRead`), `MobileNav`, `ProgressControl`, `AutoSelect`, `Toaster`, `SubmitButton`, `ActionButton`.
- Calculadoras: guardado de espacios/zonas (`saveCalcSpace`, `saveCalcZone`).

**Login / cuentas**
- `AuthArt`, `PasswordInput` (mostrar/ocultar), registro exige aceptar Términos y Privacidad (rol `usuario`, sin acceso al panel).
- Editar perfil: teléfono y contraseña piden la contraseña actual.

**Backend / datos**
- Nuevos controllers: activity, notification, portal, user; ampliados: project, quote, document, budget, calc, client, dashboard.
- Nuevos modelos: `event`, `notification`; cambios en project, quote, document, client, etc.
- `db/schema.ts` y `seed.ts` ampliados. Nuevos libs: `config`, `legal`, `motion`, `pdf`(+test), `project`, `quote-details`, `quote-options`, `stages`, `storage`, `whatsapp`.
- `proxy.ts` ajustado.

**Tooling**
- `scripts/dev.mjs`, `scripts/backup-db.mjs`, `scripts/crear-base.example.sql`, `.env.example`, `.gitignore` reducido, `DESIGN.md` y `README.md` reescritos.

### 2026-10-28 — `738d676` Arreglos del sistema y bugs
- Se eliminó `formulario-tally/` (`index.html` y `tally-guia.md`).

### 2026-10-24 — `3bf8e3b` Primer commit
- Base del sistema: sitio público (portada animada, servicios, cotizar, registro), login/registro, panel (proyectos con tabs, calculadoras, catálogo, clientes, usuarios), roles/permisos, controllers/models/Drizzle + seed, calculadoras con tests, modo claro/oscuro, animaciones (Airflow, ServiceScene, PageWipe).
- Se agregó `formulario-tally/` (luego eliminado).

### `e5a397b` Initial commit from Create Next App
- Plantilla inicial de Next.js.

## Pendiente / a tener en cuenta
- Completar `email` en `src/lib/legal.ts` y revisión legal de Términos/Privacidad antes de publicar.
- Fórmulas de cálculo: validación por ingeniería antes de uso real.
- Cambios posteriores a `cfc7796` que no estén commiteados no aparecen arriba.
