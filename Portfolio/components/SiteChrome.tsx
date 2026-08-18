export function SiteChrome({ file }: { file: string }) {
  return (
    <div className="relative z-10 border-b border-zinc-800 bg-black/85 backdrop-blur-md px-5 py-3 flex items-center gap-3">
      <div className="flex gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f57]" />
        <span className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
        <span className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="font-mono text-base text-zinc-100 ml-4 font-semibold">
        kasim-lone.dev — {file}
      </div>
      <div className="ml-auto font-mono text-sm text-zinc-300 hidden sm:block">
        UTF-8 · ⎇ main
      </div>
    </div>
  );
}
