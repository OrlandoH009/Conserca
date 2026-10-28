import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
