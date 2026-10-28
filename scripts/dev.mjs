// npm run dev: arranca Next y, si CLOUDFLARE_TUNNEL=true en .env, abre un túnel de Cloudflare y muestra su link.
import { spawn } from "node:child_process";

try {
  process.loadEnvFile(".env");
} catch {}

const tunnelOn = process.env.CLOUDFLARE_TUNNEL === "true";
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev"], {
  stdio: ["inherit", "pipe", "inherit"],
});
let tunnel;
let tunnelStarted = false;

next.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  // Next puede cambiar de puerto si el 3000 está ocupado: se toma el que imprime.
  const port = text.match(/Local:\s+http:\/\/localhost:(\d+)/)?.[1];
  if (tunnelOn && port && !tunnelStarted) {
    tunnelStarted = true;
    startTunnel(port);
  }
});

function startTunnel(port) {
  tunnel = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${port}`], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  tunnel.on("error", () =>
    console.log("- Cloudflare:    cloudflared no está instalado (winget install Cloudflare.cloudflared)"),
  );
  tunnel.stderr.on("data", (chunk) => {
    const url = chunk.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)?.[0];
    if (url) console.log(`- Cloudflare:    ${url}`);
  });
}

const stop = () => {
  tunnel?.kill();
  next.kill();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
next.on("exit", (code) => {
  tunnel?.kill();
  process.exit(code ?? 0);
});
