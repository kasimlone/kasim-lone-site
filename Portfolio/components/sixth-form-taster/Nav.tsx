"use client";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Start" },
  { id: "hook", label: "Hook" },
  { id: "gcse-vs-a", label: "GCSE → A Level" },
  { id: "linear", label: "Linear Search" },
  { id: "scaling", label: "Scaling" },
  { id: "complexity", label: "Complexity" },
  { id: "binary", label: "Binary Search" },
  { id: "quote", label: "Big Idea" },
  { id: "task2", label: "Task 2" },
  { id: "table", label: "Compare" },
];

export default function Nav() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <a href="#hero" className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="font-bold text-navy text-sm md:text-base">
            From Data to Decisions
          </span>
        </a>
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-2.5 py-1 rounded text-muted hover:text-navy hover:bg-slate-100 transition"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="h-0.5 bg-slate-100">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
