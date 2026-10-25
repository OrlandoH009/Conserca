import { Footer, Nav } from "@/components/site/Nav";
import { ScrollDown } from "@/components/site/ScrollDown";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
      <ScrollDown />
    </>
  );
}
