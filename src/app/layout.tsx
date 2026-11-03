import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/app/Toaster";
import { LocaleProvider } from "@/components/site/LocaleProvider";
import { PageWipe } from "@/components/site/PageWipe";
import { RouteProgress } from "@/components/site/RouteProgress";
import { getT, getLocale } from "@/lib/i18n-server";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: { default: t("Conserca · Diseño y supervisión de aire acondicionado y ventilación"), template: "%s · Conserca" },
    description: t("Diseñamos y supervisamos sistemas de aire acondicionado y ventilación mecánica."),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale === "en" ? "en" : "es-SV"} data-scroll-behavior="smooth" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Aplica el tema guardado (o el del sistema) antes de pintar, para que no parpadee. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}` }} />
      </head>
      <body className="min-h-full">
        <LocaleProvider locale={locale}>
          {children}
          <PageWipe />
          <Suspense fallback={null}><RouteProgress /></Suspense>
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
