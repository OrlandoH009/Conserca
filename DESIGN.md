# Diseño de Conserca

Fuente de verdad: variables de `src/app/globals.css`. Los componentes usan solo estos tokens de Tailwind; no colores fijos para superficies.

| Token | Clase | Claro | Oscuro | Uso |
|---|---|---|---|---|
| `--bg` | `bg-bg` | `#f3f7fc` | `#081426` | fondo de página |
| `--surface` | `bg-surface` | `#ffffff` | `#0f2038` | tarjetas, nav, modales |
| `--ink` | `text-ink` | `#14233a` | `#e8f0fa` | texto principal |
| `--mute` | `text-mute` | `#56687f` | `#a3b6cf` | texto secundario |
| `--line` | `border-line` | `#d5e1ef` | `#1f3a5c` | bordes |
| `--accent` | `text-accent`, `border-accent` | `#0b55b3` | `#4db2f5` | texto, enlaces y bordes de acento |
| `--accent-solid` / `-2` | `bg-accent-solid`, `to-accent-solid-2` | `#0b55b3` / `#1262c7` | igual | rellenos con texto blanco (botones, paneles); contraste ≥ 4.5:1 |
| `--field-line` | `border-field` | `#768aa3` | `#5f7c9f` | borde de campos y opciones (≥ 3:1) |
| `--mono` / `--on-mono` | `bg-mono`, `text-on-mono` | `#0a0a0a` / `#fff` | `#f5f5f5` / `#0a0a0a` | acento minimalista blanco y negro (banda final); se invierte en oscuro |
| `--soft` | `bg-soft` | `#e4effb` | acento al 16 % | fondos suaves, hover |

- Tipografía: Inter.
- Modo oscuro: clase `dark` en `<html>` (ver `ThemeToggle` y el script de `layout.tsx`).
- Variantes neutras: `.btn-dark` (con `.btn`) y `.btn-line` (con `.btn-ghost`).
- Componentes base (`@layer components`): `.btn`, `.btn-ghost`, `.btn-lg`, `.card`, `.input`, `.label`, `.badge`, `.tbl`.
- Excepción conocida: los colores de estado (`emerald`, `amber`, `red`, `slate`) siguen reasignándose en `.dark` dentro de `globals.css`.
- Movimiento: respetar `prefers-reduced-motion`.
- Contraste: texto blanco solo sobre `accent-solid`; texto de acento solo con `text-accent`. La revisión automática de contraste (WCAG AA) debe dar 0 fallas en claro y oscuro.
- Impresión: `@media print` fuerza paleta clara (la memoria se imprime legible aunque se esté en modo oscuro).
- Regional: idioma `es-SV`, zona `America/El_Salvador`, dólares e IVA 13 % se definen en `src/lib/config.ts`.
