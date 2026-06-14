import { ProjectTile } from "@/components/ProjectTile";
import { SocialTile } from "@/components/SocialTile";
import { projects, socials } from "@/lib/projects";

export default function Home() {
  return (
    <main className="min-h-screen text-zinc-200 isolate">
      {/* Blurred classroom background */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url(/classroom.png)", filter: "blur(6px) saturate(1.15)", transform: "scale(1.15)", zIndex: 0 }}
        aria-hidden
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(15,20,25,0.5)", zIndex: 1 }} aria-hidden />

      {/* App chrome */}
      <div className="relative z-10 border-b border-zinc-800 bg-black/85 backdrop-blur-md px-5 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f57]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="font-mono text-base text-zinc-100 ml-4 font-semibold">kasim-lone.dev — main</div>
        <div className="ml-auto font-mono text-sm text-zinc-300">UTF-8 · TypeScript · ⎇ main</div>
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-zinc-800 bg-black/85 backdrop-blur-md p-4 font-mono text-sm text-zinc-100 min-h-screen">
          <div className="text-zinc-300 uppercase tracking-widest text-xs mb-3 font-semibold">explorer</div>
          <div className="space-y-1.5">
            <div className="text-syntax-keyword text-base font-semibold">▾ kasim-lone</div>
            <div className="pl-3 text-zinc-300 font-semibold">▾ projects/</div>
            {projects.map((p) => (
              <div key={p.title} className="pl-6 text-zinc-100 hover:text-syntax-keyword truncate cursor-pointer">
                {p.title.toLowerCase().replace(/\s+/g, "-")}.tsx
              </div>
            ))}
            <div className="pl-3 text-zinc-300 font-semibold mt-3">▾ socials/</div>
            {socials.map((s) => (
              <div key={s.name} className="pl-6 text-zinc-100 hover:text-syntax-keyword cursor-pointer">
                {s.name.toLowerCase()}.md
              </div>
            ))}
            <div className="pl-3 mt-3 text-zinc-100 hover:text-syntax-keyword cursor-pointer">readme.md</div>
          </div>
          <div className="mt-10 text-xs text-zinc-400">
            <div><span className="text-leaf">●</span> online</div>
            <div className="mt-1">cwd: ~/kasim-lone</div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1 p-6 md:p-10 relative">
          {/* Decorative plant */}
          <div className="hidden lg:block absolute top-8 right-8 opacity-40 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-leaf blur-md" />
            <div className="w-10 h-10 rounded-full bg-leafDark blur-md -mt-6 ml-4" />
          </div>

          {/* Bio */}
          <div className="mb-12 flex flex-col md:flex-row items-start md:items-center gap-6 rounded-xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-syntax-keyword/60 shadow-[0_8px_24px_rgba(0,0,0,0.5)] shrink-0">
              <img
                src="/kasim.png"
                alt="Kasim Lone"
                className="w-full h-full object-cover scale-[1.45] origin-[50%_28%]"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50 tracking-tight">Kasim Lone</h1>
              <p className="mt-1 text-zinc-300 font-mono text-sm">
                Head of Computer Science and Digital Literacy
              </p>
              <p className="text-zinc-300 font-mono text-sm">
                Founder, <a href="https://www.runpy.co.uk" target="_blank" rel="noreferrer" className="text-syntax-keyword hover:underline">RunPy</a>
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {socials.map((s) => <SocialTile key={s.name} social={s} />)}
              </div>
            </div>
          </div>

          {/* Projects */}
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
