import type { Metadata } from "next";
import { ProjectTile } from "@/components/ProjectTile";
import { SiteChrome } from "@/components/SiteChrome";
import { SiteSidebar } from "@/components/SiteSidebar";
import { BioCard } from "@/components/BioCard";
import { projects } from "@/lib/projects";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Kasim Lone — Computer Science Teacher & Builder",
  description:
    "Portfolio of Kasim Lone — Head of Computer Science and Digital Literacy, founder of RunPy. Interactive lessons, classroom tools and projects for GCSE and A Level Computer Science.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="min-h-screen text-zinc-200 isolate">
      {/* Blurred classroom background */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url(/classroom.jpg)", filter: "blur(6px) saturate(1.15)", transform: "scale(1.15)", zIndex: 0 }}
        aria-hidden
      />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(15,20,25,0.5)", zIndex: 1 }} aria-hidden />

      <SiteChrome file="main" />

      <div className="relative z-10 flex">
        <SiteSidebar currentPath="/" />

        <section className="flex-1 p-6 md:p-10 relative">
          <div className="hidden lg:block absolute top-8 right-8 opacity-40 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-leaf blur-md" />
            <div className="w-10 h-10 rounded-full bg-leafDark blur-md -mt-6 ml-4" />
          </div>

          <BioCard />

          <h2 className="font-mono text-xs uppercase tracking-widest text-white mb-3">// projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => <ProjectTile key={p.title} project={p} index={i} />)}
          </div>

          <footer className="mt-16 font-mono text-[10px] text-zinc-600">
            {"// © " + new Date().getFullYear() + " kasim lone — built on vercel"}
          </footer>
        </section>
      </div>
    </main>
  );
}
