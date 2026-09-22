"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Delete, Lock } from "lucide-react";

const PIN = "7584";
const LENGTH = 4;

export function PinGate() {
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (entered.length !== LENGTH) return;
    if (entered === PIN) {
      document.cookie = `site_pin=${PIN}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
      window.location.href = next;
    } else {
      setError(true);
      const t = setTimeout(() => {
        setError(false);
        setEntered("");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [entered, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") backspace();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function press(d: string) {
    setEntered((v) => (v.length >= LENGTH ? v : v + d));
  }
  function backspace() {
    setEntered((v) => v.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <main className="min-h-screen text-zinc-200 isolate flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url(/classroom.jpg)", filter: "blur(6px) saturate(1.15)", transform: "scale(1.15)", zIndex: 0 }}
        aria-hidden
      />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(15,20,25,0.6)", zIndex: 1 }} aria-hidden />

      <div className={`relative z-10 w-full max-w-sm rounded-xl border border-zinc-700/60 bg-panel/80 backdrop-blur-md p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] ${error ? "animate-[shake_0.4s]" : ""}`}>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-syntax-keyword" />
          <span className="font-mono text-xs uppercase tracking-widest text-white">// enter pin</span>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: LENGTH }).map((_, i) => {
            const filled = i < entered.length;
            return (
              <div
                key={i}
                className={`w-10 h-12 rounded-md border ${
                  error
                    ? "border-red-500/70"
                    : filled
                    ? "border-syntax-keyword"
                    : "border-zinc-700/60"
                } bg-bg2/70 flex items-center justify-center font-mono text-xl text-zinc-100`}
              >
                {filled ? "•" : ""}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className="rounded-lg border border-zinc-700/60 bg-bg2/70 backdrop-blur-md py-3 font-mono text-lg text-zinc-100 hover:border-syntax-keyword hover:bg-bg2/90 hover:-translate-y-0.5 transition"
            >
              {k}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => press("0")}
            className="rounded-lg border border-zinc-700/60 bg-bg2/70 backdrop-blur-md py-3 font-mono text-lg text-zinc-100 hover:border-syntax-keyword hover:bg-bg2/90 hover:-translate-y-0.5 transition"
          >
            0
          </button>
          <button
            type="button"
            onClick={backspace}
            className="rounded-lg border border-zinc-700/60 bg-bg2/70 backdrop-blur-md py-3 flex items-center justify-center text-zinc-300 hover:border-syntax-keyword hover:text-white hover:bg-bg2/90 hover:-translate-y-0.5 transition"
            aria-label="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-5 font-mono text-[10px] text-zinc-500 text-center">
          {"// protected — pin required"}
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </main>
  );
}
