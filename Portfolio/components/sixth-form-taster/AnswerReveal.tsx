"use client";

import { useState } from "react";

export default function AnswerReveal({ answers }: { answers: string[] }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-2xl bg-navy text-white p-8 md:p-10 h-full">
      <div className="text-xs md:text-sm font-bold tracking-[0.18em] uppercase text-accent">
        Possible answers
      </div>

      {!revealed ? (
        <div className="mt-6 flex flex-col items-start gap-4">
          <p className="text-slate-300 italic">
            Have a think first — what would you try?
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent hover:bg-orange-600 transition text-white font-semibold"
          >
            Reveal answers
            <span>↓</span>
          </button>
        </div>
      ) : (
        <ol className="mt-5 space-y-4">
          {answers.map((a, i) => (
            <li key={a} className="flex gap-3 items-start">
              <span className="flex-none w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <span className="text-slate-200">{a}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
