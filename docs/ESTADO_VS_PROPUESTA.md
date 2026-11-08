# Estado del sistema vs. propuesta al cliente

Fase 0 (auditoría). Fecha: 2026-11-08. Solo lectura del código; no se modificó nada salvo este documento.
Pruebas automáticas al momento de la auditoría: `vitest` 26/26 pasan (5 archivos). No se probó contra la base de datos (MySQL apagado durante la auditoría) ni en un celular real.

Leyenda: **Cumple** · **Parcial** · **No cumple** · **No verificable** (con lo que hay en el repo no se puede comprobar).

## 1. Resumen

| # | Punto de la propuesta | Estado |
|---|---|---|
| 1 | Cobros por proyecto, «Toca facturar», aviso de fin de año, datos de facturación | **Cumple** (con 2 detalles) |
| 2 | Documentos por proyecto con versiones y PDF | **Cumple** |
| 3 | Etapas, avance, fecha de entrega, aviso de vencidos | **Cumple** (aviso solo en pantalla) |
| 4 | Registro de actividad | **Cumple** (con 1 fuga menor) |
| 5 | Calculadoras y presupuesto descargable | **Cumple** (presupuesto en CSV, no Excel) |
| 6 | Supervisión: visitas y observaciones | **Cumple** |
| 7 | Portal del cliente | **Cumple** |
| 8 | Roles | **Cumple** (con 1 fuga menor) |
| 9 | Español/inglés y celular | **Parcial** (celular sin probar en dispositivo) |
| 10 | Despliegue, respaldos, Google Drive | **No cumple** (no hay nada de despliegue en el repo; respaldo local sin automatizar) |

## 2. Detalle por punto

### 1. Cobros
| Requisito | Estado | Evidencia | Falta |
|---|---|---|---|
| Plan Anticipo / Estimación 1 / Estimación 2 / Pago final | Cumple | `src/lib/payments.ts:3-8` (30/30/20/20 %, avance 0/40/70/100) | Los porcentajes son fijos al crear el plan; luego se editan cobro por cobro (`payment.controller.ts:49-57`). No hay plantillas por tamaño. |
| «Toca facturar» al llegar al avance o al entregar | Cumple | `payments.ts:24-25` (`isDue`); usado en `payment.controller.ts:76`; prueba en `payments.test.ts` | — |
| Estados Pendiente / Facturado / Cobrado, nº de factura y fechas | Cumple | `payment.controller.ts:12`, `:22-27` (`datesFor`), `schema.ts:123` | — |
| Aviso en nov. y dic. | Cumple | `payments.ts:28`; mostrado en `app/(panel)/page.tsx:50` y `tabs/Cobros.tsx:46` | Se mide por mes calendario fijo (≥ noviembre). Sin fecha de corte configurable. |
| Panel: qué facturar y qué está facturado sin cobrar | Cumple | `payment.controller.ts:73-80`, `dashboard.controller.ts:23` | — |
| NIT/NRC, correo de facturación, quién autoriza | Cumple | `schema.ts:23-25`; formulario en `clientes/page.tsx` | — |
| Aviso automático (sin que alguien abra el sistema) | No cumple | No hay envío de correo ni tareas programadas | El problema central del cliente es que se olvidan: hoy el aviso solo aparece si abren el panel. |

### 2. Documentos
Cumple. Tipos: oferta, orden de compra, contrato, memoria, especificaciones, presupuesto, fichas, cuadros (`document.controller.ts:41`). Versiones: se numeran por título dentro del proyecto (`:45`). PDF: máx. 10 MB, se valida el contenido y no solo la extensión, se guarda con nombre aleatorio (`:22-35`). Limitación: solo PDF (no se aceptan Excel, DWG, ni enlaces).

### 3. Etapas, avance y vencidos
Cumple. Etapas fijas (`lib/stages.ts:2`), avance 0–100 (`project.controller.ts:114-122`), vencidos (`lib/project.ts`, `project.model.ts:35`). Falta: el aviso de vencido solo se ve en el panel y la lista; no llega por correo.

### 4. Actividad
Cumple. `activity.controller.ts:14` registra tipo, mensaje, quién y cuándo. **Fuga menor:** la pestaña Actividad usa el área `proyectos` (`proyectos/[id]/page.tsx:40`), así que el Ing. Diseñador y el Técnico en Dibujo ven líneas como «Cobro «Anticipo»: Facturado» aunque no tengan acceso a Cobros (`payment.controller.ts:44,55,66`; `event.model.ts:11`). No muestran montos. Además el tipo `cobro` no está en el diccionario de `Actividad.tsx:5` y se ve crudo.

### 5. Calculadoras y presupuesto
Cumple. Cargas, distribución, ventilación (`calc.controller.ts`); todas con guardas de servidor. Advertencia «Estimado con fórmulas simplificadas. Validar por ingeniería» en `components/app/ui.tsx:44`, `Calculators.tsx:26` y en la memoria impresa (`memoria/page.tsx:40`). Presupuesto descargable: **CSV**, no Excel (`api/proyectos/[id]/presupuesto/route.ts`). Excel abre el CSV, pero no es un `.xlsx`.

### 6. Supervisión
Cumple. `supervision.controller.ts`: visitas programadas y realizadas, observaciones abiertas/cerradas. Detalle: `toggleObservation` (`:49-54`) no comprueba que la observación pertenezca al proyecto enviado; solo afecta a usuarios con permiso de supervisión, no al cliente.

### 7. Portal del cliente
Cumple. Ve avance, etapas, PDF, visitas y conteo de observaciones sin su texto interno (`portal.controller.ts`). Aprueba o pide cambios con comentario (`document.controller.ts:86-101`) y el equipo recibe aviso. Falta: aprobar una estimación antes de facturar (no estaba prometido, ver Fase 2 #8).

### 8. Roles
Cumple en el servidor. Matriz en `lib/permissions.ts:15-21` coincide con la propuesta. Cada acción llama `assertAccess` y cada página `requireAccess` (`lib/auth.ts:30-42`); no depende de ocultar botones. El panel bloquea a `usuario` (`app/(panel)/layout.tsx:29`). El rol se lee de la base en cada petición (`auth.ts:23-27`). Detalles: la fuga de Actividad (punto 4); `proxy.ts` solo comprueba que haya sesión, la autorización real está en páginas y acciones (diseño correcto, pero no hay pruebas que lo cubran).

### 9. Idiomas y celular
Parcial. Español/inglés: hay prueba que exige traducción de cada texto (`i18n.test.ts`). Celular: hay navegación móvil (`MobileNav`, `app/(panel)/layout.tsx:45`), pero no se verificó en un dispositivo ni a 360 px de ancho.

### 10. Despliegue y respaldos
**No cumple.** En el repo no hay Caddyfile, pm2/`ecosystem`, Dockerfile, script de despliegue ni guía (`README.md:140` dice que es un proyecto de desarrollo local). Respaldo: `scripts/backup-db.mjs` hace `mysqldump` local, pero no está en `package.json` (el script dice `npm run db:backup` y ese comando no existe), no se ejecuta solo, no respalda los PDF (`storage/documents`) y no copia a Google Drive. HTTPS, firewall y respaldo diario del servidor serían configuración del servidor, aún no hecha. Capacidad 8–15 usuarios: **No verificable** (no hay prueba de carga con `next build`).

## 3. Verificaciones específicas pedidas
| Verificación | Resultado |
|---|---|
| Permisos en el servidor, no solo botones | **Sí.** Controladores con guardas: calc 13, project 18, payment 7, document 7, supervision 6, user 7, budget 5, client 5, catalog 4 (`grep` de `assertAccess/requireAccess`). Rutas API (`presupuesto`, `documentos`) también comprueban rol/dueño. |
| Un cliente no ve proyectos de otro | **Sí, por lectura de código.** `listByClientUser(userId)` (`project.model.ts:38`); PDF solo para equipo o dueño (`document.controller.ts:104-109`); revisión solo del dueño (`:91`); eventos filtrados por `visibleToClient`. **Sin prueba automática** y sin probar con base de datos en esta auditoría. |
| «Toca facturar» y aviso de fin de año | **Funcionan.** Lógica pura con prueba (`payments.test.ts`); en sesiones anteriores también se probó de punta a punta en el navegador. Aviso fijo a nov.–dic. |
| Existen respaldos | **Parcial.** Script manual de base de datos; sin automatización, sin PDF, sin Drive. |

## 4. Hallazgos de seguridad
Ordenados por importancia.

1. **Cuentas de ejemplo con contraseñas conocidas en `src/db/seed.ts:9-12`**, que sí está en el repositorio. Si se despliega con ellas, cualquiera entra como Gerente. Cambiarlas antes de publicar.
2. **Sin límite de intentos por IP ni captcha** en login, registro y cotización rápida. Login limita 5 intentos por correo, en memoria (`auth.controller.ts`). Un bot con correos distintos no se frena y cada intento gasta CPU (bcrypt). En un servidor de 1 CPU esto es el riesgo de sobrecarga más realista.
3. **Sin cabeceras de seguridad** (HSTS, X-Frame-Options, CSP, Referrer-Policy, X-Content-Type-Options); `next.config.ts` no define `headers()`.
4. **Sesiones de 7 días sin revocación**: cambiar la contraseña no cierra sesiones abiertas.
5. **Registro revela si un correo ya existe**.
6. ~~Trampa para bots del registro ineficaz~~ — **error de la auditoría**: el campo sí está oculto fuera de pantalla (`login/RegistroForm.tsx:18`). Sin hallazgo.
7. **Error en `user.controller.ts:9`**: el patrón de teléfono perdió las barras (`[+d][ds().-]` en lugar de `[+\d][\d\s().-]`); editar el teléfono de un usuario rechaza números normales. Ya venía así en git.
8. **Descarga de PDF lee el archivo completo en memoria** (`api/documentos/[id]/route.ts`); con muchas descargas simultáneas consume RAM.
9. **Secretos**: `.env` y `scripts/crear-base.sql` están en `.gitignore` y no están en git (verificado con `git ls-files`). `crear-base.sql` local contiene la contraseña del usuario de la base y da `ALL PRIVILEGES` sobre la base; en producción conviene un usuario con permisos mínimos y contraseña nueva.
10. **Subida de archivos**: bien resuelta (tamaño, firma del PDF, nombre aleatorio, fuera de `public`, descarga con permiso). No se validan otros formatos porque solo se admite PDF.
11. **Dependencias**: `npm audit --omit=dev` dio 0 vulnerabilidades.
12. **Validación de entradas**: Zod en todas las acciones revisadas; consultas parametrizadas con Drizzle (sin SQL concatenado).

## 5. Otras brechas frente al problema del cliente
- No hay correo saliente ni tareas programadas (nada de resumen semanal ni recordatorios).
- No hay exportación a Excel ni importación desde Excel (solo CSV del presupuesto).
- No hay seguimiento de ofertas (fecha límite, estado, recordatorio). El Gerente lleva ofertas y esto pasa a segundo plano.
- No hay asignación de personas por proyecto más allá de un «responsable» único; todos los roles ven todos los proyectos y reciben avisos por rol (`activity.controller.ts:24-31`).
- No hay reportes por mes/cliente/año ni antigüedad de cobros (30/60/90 días).
- Pruebas: solo cálculo, traducciones, PDF, matriz de permisos y lógica de cobros. **No hay pruebas de permisos en controladores ni de aislamiento entre clientes.**

## 6. Cambios de la propuesta que conviene aclarar al cliente
- «Respaldo diario y copia a Google Drive» hoy no existe en el sistema; se promete como parte del despliegue y hay que construirlo o retirarlo de la propuesta.
- El aviso de facturación/vencidos es dentro del sistema; no llega por correo hasta que se haga la Fase 2 #1.
- Presupuesto descargable es CSV.
- Los porcentajes del plan de cobros son 30/30/20/20 por defecto, editables por cobro, sin plantillas por tamaño.

---

# Anexo: propuesta actualizada (8 de noviembre de 2026)

Contrasta cada ítem del archivo «Cambios del sistema que implica la propuesta actualizada» con el código. Sin cambios de código todavía.

## A. Obligatorios
| # | Ítem | Estado | Evidencia / qué falta |
|---|---|---|---|
| A1 | Rol «Cliente» | **Parcial** | Hoy se llama «Usuario (sitio)» (`lib/permissions.ts:11`). El permiso sí se aplica en servidor (`app/(panel)/layout.tsx:29`, matriz todo `none`). Falta renombrar en ES/EN, en la tabla de usuarios y en README. El valor interno `"usuario"` puede quedar. |
| A2 | Aislamiento entre clientes | **Parcial** | Lógica correcta por lectura (`project.model.ts:38`, `document.controller.ts:91,108`); **falta la prueba automática** y probarlo contra la base. |
| A3 | Permisos por rol en servidor | **Cumple** | Ing. sin cobros ni clientes y con presupuesto en vista; Técnico sin cambiar estado ni cobros (`permissions.ts:17-18`, `project.controller.ts:94`). Falta cerrar la fuga de Actividad y cubrirlo con pruebas de controlador. |
| A4 | Plan de cobros editable por proyecto | **Cumple** | `payment.controller.ts:49-57`. El Gerente edita porcentaje/monto por cobro. Hoy se edita el **monto**, no el **porcentaje** (el porcentaje solo se usa al crear el plan). |
| A5 | «Toca facturar» con casos límite | **Parcial** | `payments.ts:24` y `payments.test.ts`. Hay que ampliar casos límite (avance exacto, 0 %, 100 %, cobro ya facturado, proyecto entregado con avance 0). |
| A6 | Aviso de cierre de año | **Cumple** | `payments.ts:28`. Año calendario asumido; falta confirmar con el cliente. |
| A7 | Avisos al aprobar / pedir cambios | **Cumple** | `document.controller.ts:94-100` (`notifyStaff`). |
| A8 | Documentos: versiones, límite, formatos | **Parcial** | Versiones por título (`document.controller.ts:45`), límite 10 MB con mensaje claro (`:24`, `PdfInput.tsx:24`), solo PDF. **No hay pantalla de historial de versiones por documento** (cada versión es una fila). Falta decidir formatos y tamaño. |
| A9 | Recuperación de contraseña | **No cumple** | No existe. Sin servicio de correo no se puede hacer el flujo estándar; hoy solo el Gerente puede cambiar la contraseña desde Usuarios. |
| A10 | Advertencia en calculadoras | **Cumple** | `components/app/ui.tsx:44`, `Calculators.tsx:26`, `memoria/page.tsx:40`. |
| A11 | Respaldo externo a Google Drive + `docs/RESTAURACION.md` | **No cumple** | `scripts/backup-db.mjs` es solo mysqldump local, sin PDF, sin Drive, sin programación, sin guía de restauración y sin prueba de restauración. |
| A12 | Alerta de disco al 80 % | **No cumple** | No existe. |
| A13 | Prueba de carga 8–15 usuarios | **No cumple** | No hay informe. Solo existe la medición de consultas por pantalla de sesiones anteriores. |

## B. Primera entrega por confirmar
| # | Ítem | Estado |
|---|---|---|
| B1 | Resumen semanal por correo | **No cumple** (no hay correo saliente) |
| B2 | Importar / exportar Excel | **No cumple** (solo CSV del presupuesto) |
| B3 | Plantillas por tamaño | **No cumple** (un solo plan fijo) |
| B4 | Seguimiento de ofertas | **No cumple** |

## C. Siguiente fase
Nada implementado; no se toca sin petición.

## Decisiones pendientes (ver mensaje de Fase 1)
Porcentajes por tamaño, quién mide el avance y qué es «entregado», etapas, catálogo y precios, formatos y tamaño de archivo, cuentas de cliente, proyectos asignados vs. todos, cálculos guardados y descarga, fotos en supervisión, celular o app, frecuencia de la copia a Drive y quién la ejecuta, umbral de disco, criterio de aprobación de la carga, año fiscal.

---

# Avance de la implementación

## Paso 1 — cambios chicos (2026-11-08)
Hecho: rol renombrado a «Cliente» (ES/EN, README; el valor interno sigue siendo `usuario`, sin cambios en la base de datos) → A1 **Cumple**. La pestaña Actividad oculta las líneas de cobros a quien no tiene acceso a Cobros (`project.controller.ts`, `activityOf`) y traduce el tipo «cobro». Corregido el patrón de teléfono (`user.controller.ts:9`). Pruebas nuevas: aislamiento entre clientes (`controllers/isolation.test.ts`: PDF de otro cliente, aprobar documento ajeno, lista propia) → A2 **Cumple**; casos límite de «Toca facturar» → A5 **Cumple**; permisos por rol (Cliente, Ing., Técnico) → A3 **Cumple**. 34 pruebas pasan; `tsc` y `eslint` sin errores.
Límite de las pruebas de aislamiento: usan modelos simulados, no la base real; la consulta `listByClientUser` se verificó solo por lectura.
Cambia respecto a lo prometido: nada.

## Paso 2 — seguridad contra bots y ataques (2026-11-08)
Hecho: límite de intentos por IP (`lib/rate-limit.ts`, con limpieza para que no crezca sin límite): login 30 por 10 min (además de los 5 fallos por correo que ya había), registro 5 por hora, cotización rápida 5 por hora, cotización con cuenta 10 por hora. Cabeceras de seguridad en `next.config.ts` (nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS) y se quita `X-Powered-By`. Probado en vivo: con una IP simulada el login se bloquea alrededor del intento 30 y otra IP sigue libre; las cabeceras salen en la respuesta. 36 pruebas pasan.
Límites conocidos: el contador está en memoria (se pierde al reiniciar y exige un solo proceso); la IP viene de `x-forwarded-for`/`cf-connecting-ip`, así que la app debe publicarse solo detrás de Caddy o Cloudflare; sin Content-Security-Policy; la descarga de PDF sigue leyendo el archivo completo en memoria.
Pendiente de este tema: captcha Turnstile (necesita cuenta de Cloudflare, se hace al desplegar), sesiones que no se cierran al cambiar la contraseña, el registro que revela si un correo existe.
Cambia respecto a lo prometido: nada; la propuesta ya decía «contraseñas protegidas, acceso por roles».

## Paso 3 — respaldos y aviso de disco (2026-11-08)
Hecho: `npm run db:backup` genera un solo `.tar.gz` con la base y los PDF, conserva los últimos 14 y, si `RCLONE_REMOTE` está definido, lo copia a Google Drive con rclone. `npm run db:restore` restaura con confirmación (`--yes`) y permite ensayar en otra base (`--db`). `npm run disk:check` avisa en la campana del Gerente si el disco pasa del 80 % (máx. 1 aviso al día). Guía en `docs/RESTAURACION.md` (instalación de rclone, cron, restauración paso a paso). → A11 y A12 **Parcial** (código y guía listos).
Probado: respaldo con base + PDF; aviso de disco (dispara y crea la notificación; el aviso de prueba se borró); restauración en modo simulación.
**No probado:** restauración real en una base vacía (hace falta una base de prueba con permisos) y copia a Drive (hace falta la cuenta del cliente). Se prueban en el servidor.
Cambia respecto a lo prometido: base y PDF se respaldan juntos y a diario (la propuesta decía «copia periódica a Google Drive»; la frecuencia semanal propuesta queda en diario a las 3:00 salvo que el cliente prefiera otra). El aviso de disco es dentro del sistema, no por correo.
Dato de entorno: el disco de este equipo de desarrollo está al 97 % (12,3 GB libres).
