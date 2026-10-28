import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/app/Toaster";
import { PageWipe } from "@/components/site/PageWipe";
import { RouteProgress } from "@/components/site/RouteProgress";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Conserca · Diseño y supervisión de aire acondicionado y ventilación", template: "%s · Conserca" },
  description: "Diseñamos y supervisamos sistemas de aire acondicionado y ventilación mecánica.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-SV" data-scroll-behavior="smooth" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Aplica el tema guardado (o el del sistema) antes de pintar, para que no parpadee. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}` }} />
      </head>
      <body className="min-h-full">
        {children}
        <PageWipe />
        <Suspense fallback={null}><RouteProgress /></Suspense>
        <Toaster />
      </body>
    </html>
  );
}
