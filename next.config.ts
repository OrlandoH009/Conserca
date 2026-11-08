import type { NextConfig } from "next";

// Cabeceras de seguridad. shortcut: sin Content-Security-Policy (el script del modo oscuro y los de Next son en línea y exigirían nonces); añadirla si se agrega contenido de terceros.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" }, // solo se aplica por HTTPS
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || ".next", // permite compilar para producción sin pisar el servidor de desarrollo (ver docs/PRUEBA_DE_CARGA.md)
  headers: async () => [{ source: "/:path*", headers: SECURITY_HEADERS }],
  devIndicators: false, // quita el logo de Next en la esquina
  allowedDevOrigins: ["192.168.*.*", "*.trycloudflare.com"], // abrir el sitio desde la red local y desde el túnel de Cloudflare
  experimental: { serverActions: { bodySizeLimit: "12mb" } }, // PDF de hasta 10 MB
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
