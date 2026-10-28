# Diseño de Conserca

Fuente de verdad: variables de `src/app/globals.css`. Los componentes usan solo estos tokens de Tailwind; no colores fijos para superficies.

| Token | Clase | Claro | Oscuro | Uso |
|---|---|---|---|---|
| `--bg` | `bg-bg` | `#f4f7fa` | `#0b1118` | fondo de página |
| `--surface` | `bg-surface` | `#ffffff` | `#121b25` | tarjetas, nav, modales |
| `--ink` | `text-ink` | `#1c2733` | `#e6edf3` | texto principal |
| `--mute` | `text-mute` | `#5d6b7a` | `#9aa9b8` | texto secundario |
| `--line` | `border-line` | `#d9e1e9` | `#243242` | bordes |
| `--accent` | `text-accent`, `border-accent` | `#0a7099` | `#29a9da` | texto, enlaces y bordes de acento |
| `--accent-solid` / `-2` | `bg-accent-solid`, `to-accent-solid-2` | `#0a7099` / `#0b7ea8` | igual | rellenos con texto blanco (botones, paneles); contraste ≥ 4.5:1 |
| `--field-line` | `border-field` | `#7f8e9d` | `#5d6e7f` | borde de campos y opciones (≥ 3:1) |
| `--soft` | `bg-soft` | `#e3f3f9` | acento al 16 % | fondos suaves, hover |

- Tipografía: Inter.
- Modo oscuro: clase `dark` en `<html>` (ver `ThemeToggle` y el script de `layout.tsx`).
- Componentes base (`@layer components`): `.btn`, `.btn-ghost`, `.btn-lg`, `.card`, `.input`, `.label`, `.badge`, `.tbl`.
- Excepción conocida: los colores de estado (`emerald`, `amber`, `red`, `slate`) siguen reasignándose en `.dark` dentro de `globals.css`.
- Movimiento: respetar `prefers-reduced-motion`.
- Contraste: texto blanco solo sobre `accent-solid`; texto de acento solo con `text-accent`. La revisión automática de contraste (WCAG AA) debe dar 0 fallas en claro y oscuro.
- Impresión: `@media print` fuerza paleta clara (la memoria se imprime legible aunque se esté en modo oscuro).
- Regional: idioma `es-SV`, zona `America/El_Salvador`, dólares e IVA 13 % se definen en `src/lib/config.ts`.
