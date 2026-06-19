import type { Project } from "@/lib/projects";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProjectTile({ project, index = 0 }: { project: Project; index?: number }) {
  const fileName = project.title.toLowerCase().replace(/\s+/g, "-") + ".tsx";
  const internal = project.href.startsWith("/");
  const className =
    "group block rounded-lg overflow-hidden border border-zinc-700/60 bg-panel/70 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-syntax-keyword hover:bg-panel/85 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]";
  const Icon = internal ? ArrowRight : ArrowUpRight;
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    internal ? (
      <Link href={project.href} className={className}>
        {children}
      </Link>
    ) : (
      <a href={project.href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  return (
    <Wrapper>
      {/* Tab bar */}
      <div className="flex items-center gap-2 bg-bg2/80 border-b border-zinc-700/60 px-3 py-1.5">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-[11px] text-zinc-400 ml-2">{fileName}</span>
        <Icon size={12} className="ml-auto text-zinc-500 group-hover:text-syntax-keyword transition" />
      </div>

      {/* Preview image */}
      {project.preview && (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-zinc-700/60 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.preview}
            alt={`${project.title} preview`}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}

      {/* Code body */}
      <div className="p-5 font-mono text-sm leading-relaxed">
        <div className="flex gap-3">
          <div className="text-syntax-comment/60 select-none">
            {[1, 2, 3, 4, 5].map((n) => <div key={n}>{n}</div>)}
          </div>
          <div className="flex-1">
            <div><span className="text-syntax-comment">// {String(index + 1).padStart(2, "0")}</span></div>
            <div>
              <span className="text-syntax-keyword">export const</span>{" "}
              <span className="text-syntax-fn">{project.title.replace(/\s+/g, "")}</span>{" "}
              <span className="text-syntax-text">=</span> {"{"}
            </div>
            <div className="pl-3">
              <span className="text-syntax-text">name:</span>{" "}
              <span className="text-syntax-string">&quot;{project.title}&quot;</span>,
            </div>
            <div className="pl-3 text-syntax-text/90 text-xs leading-snug">
              {project.description}
            </div>
            <div>{"}"}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded bg-syntax-keyword/15 text-syntax-keyword text-xs font-mono">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}
