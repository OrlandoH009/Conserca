import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // quita el logo de Next en la esquina
  allowedDevOrigins: ["192.168.*.*"], // abrir el sitio desde otros equipos de la red local
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
