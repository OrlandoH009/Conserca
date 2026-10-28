import { Footer, Nav } from "@/components/site/Nav";
import { ScrollDown } from "@/components/site/ScrollDown";
import { SkipLink } from "@/components/site/SkipLink";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="contenido" tabIndex={-1} className="outline-none">{children}</main>
      <Footer />
      <ScrollDown />
    </>
  );
}
