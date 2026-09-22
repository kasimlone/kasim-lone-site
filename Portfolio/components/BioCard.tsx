import { SocialTile } from "@/components/SocialTile";
import { socials } from "@/lib/projects";

export function BioCard() {
  return (
    <div className="mb-12 rounded-xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50 tracking-tight">
        Kasim Lone
      </h1>
      <p className="mt-1 text-zinc-300 font-mono text-sm">
        Head of Computer Science and Digital Literacy
      </p>
      <p className="text-zinc-300 font-mono text-sm">
        Founder,{" "}
        <a
          href="https://www.runpy.co.uk"
          target="_blank"
          rel="noreferrer"
          className="text-syntax-keyword hover:underline"
        >
          RunPy
        </a>
      </p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {socials.map((s) => (
          <SocialTile key={s.name} social={s} />
        ))}
      </div>
    </div>
  );
}
