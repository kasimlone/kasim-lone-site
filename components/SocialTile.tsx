import { Linkedin, Youtube, Music2 } from "lucide-react";
import type { Social } from "@/lib/projects";

const iconMap = {
  LinkedIn: Linkedin,
  YouTube: Youtube,
  TikTok: Music2,
};

const colorMap = {
  LinkedIn: "from-[#0a66c2] to-[#0077b5]",
  YouTube: "from-[#ff0000] to-[#cc0000]",
  TikTok: "from-[#25f4ee] via-[#000] to-[#fe2c55]",
};

export function SocialTile({ social }: { social: Social }) {
  const Icon = iconMap[social.name];
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noreferrer"
      className="group relative block rounded-lg overflow-hidden border border-zinc-700/60 bg-bg2/70 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-syntax-keyword hover:bg-bg2/85 hover:shadow-[0_10px_28px_rgba(0,0,0,0.5)]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[social.name]} opacity-20 group-hover:opacity-40 transition`} />
      <div className="relative p-5 flex items-center gap-4">
        <Icon size={32} className="text-white" strokeWidth={1.5} />
        <div>
          <div className="font-semibold text-white">{social.name}</div>
          <div className="text-xs text-zinc-400 font-mono">{social.handle}</div>
        </div>
      </div>
    </a>
  );
}
