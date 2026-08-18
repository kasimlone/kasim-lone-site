import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SocialTile } from "@/components/SocialTile";
import { socials } from "@/lib/projects";

export function BioCard() {
  return (
    <div className="mb-12 flex flex-col md:flex-row items-start md:items-center gap-6 rounded-xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6">
      <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-syntax-keyword/60 shadow-[0_8px_24px_rgba(0,0,0,0.5)] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kasim.png"
          alt="Kasim Lone"
          className="w-full h-full object-cover scale-[1.45] origin-[50%_28%]"
        />
      </div>
      <div className="flex-1">
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
        <Link
          href="/tutoring"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-syntax-string text-black font-semibold px-4 py-2 hover:brightness-110 transition"
        >
          <GraduationCap className="w-4 h-4" />
          Book me as a tutor
          <span aria-hidden>→</span>
        </Link>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {socials.map((s) => (
            <SocialTile key={s.name} social={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
