"use client";
import { useEffect, useMemo, useState } from "react";

type Mode = "binary" | "linear";

type Step = {
  lo: number;
  hi: number;
  mid: number;
  checked: number;
  comment: string;
  done?: boolean;
  found?: boolean;
};

const USERS = [
  "adam23", "bella99", "chen05", "dina11", "elliot7", "fatima2", "george8",
  "hassan4", "imani21", "jack77", "kira88", "luca09", "mia42", "noah31",
];

function buildBinarySteps(arr: string[], target: string): Step[] {
  const steps: Step[] = [];
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) {
      steps.push({ lo, hi, mid, checked: mid, comment: `arr[${mid}] = "${arr[mid]}" — match! ✓`, done: true, found: true });
      return steps;
    }
    if (arr[mid] < target) {
      steps.push({ lo, hi, mid, checked: mid, comment: `arr[${mid}] = "${arr[mid]}" < "${target}" → search the right half` });
      lo = mid + 1;
    } else {
      steps.push({ lo, hi, mid, checked: mid, comment: `arr[${mid}] = "${arr[mid]}" > "${target}" → search the left half` });
      hi = mid - 1;
    }
  }
  steps.push({ lo, hi, mid: -1, checked: -1, comment: "Not found.", done: true, found: false });
  return steps;
}

function buildLinearSteps(arr: string[], target: string): Step[] {
  const steps: Step[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      steps.push({ lo: 0, hi: arr.length - 1, mid: -1, checked: i, comment: `arr[${i}] = "${arr[i]}" — match! ✓`, done: true, found: true });
      return steps;
    }
    steps.push({ lo: 0, hi: arr.length - 1, mid: -1, checked: i, comment: `arr[${i}] = "${arr[i]}" ≠ "${target}" → keep going` });
  }
  steps.push({ lo: 0, hi: arr.length - 1, mid: -1, checked: -1, comment: "Reached the end. Not found.", done: true, found: false });
  return steps;
}

export default function BinarySearchAnimation() {
  const [mode, setMode] = useState<Mode>("binary");
  const [target, setTarget] = useState("mia42");

  // For binary mode we display the sorted version; for linear we can use the same.
  const sortedUsers = useMemo(() => [...USERS].sort(), []);

  const steps = useMemo(() => {
    return mode === "binary"
      ? buildBinarySteps(sortedUsers, target)
      : buildLinearSteps(sortedUsers, target);
  }, [mode, target, sortedUsers]);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { setI(0); setPlaying(false); }, [target, mode]);

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const speed = mode === "linear" ? 600 : 1300;
    const t = setTimeout(() => setI((x) => x + 1), speed);
    return () => clearTimeout(t);
  }, [playing, i, steps.length, mode]);

  const step = steps[i];
  const isBinary = mode === "binary";

  // For binary: items outside [lo, hi] are eliminated.
  // For linear: items with index < step.checked are "already checked" (greyed but with strike).
  const isEliminated = (idx: number) => {
    if (isBinary) return idx < step.lo || idx > step.hi;
    if (step.checked === -1) return true; // not found final
    return idx < step.checked;
  };
  const isFutureLinear = (idx: number) => !isBinary && idx > step.checked;

  const remaining = isBinary
    ? Math.max(0, step.hi - step.lo + 1)
    : Math.max(0, sortedUsers.length - (step.checked === -1 ? sortedUsers.length : step.checked));

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
      {/* Mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setMode("binary")}
            className={[
              "px-5 py-1.5 rounded-full text-sm font-semibold transition",
              isBinary ? "bg-navy text-white shadow" : "text-muted hover:text-navy",
            ].join(" ")}
          >
            Binary search
          </button>
          <button
            onClick={() => setMode("linear")}
            className={[
              "px-5 py-1.5 rounded-full text-sm font-semibold transition",
              !isBinary ? "bg-navy text-white shadow" : "text-muted hover:text-navy",
            ].join(" ")}
          >
            Linear search
          </button>
        </div>
        <div className="text-xs text-muted">
          {isBinary ? "Requires a sorted list — halves the search each step." : "Checks each item one by one from the start."}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-bold tracking-wider text-accent uppercase">Live demo</div>
          <h3 className="text-2xl font-bold text-navy mt-1">
            Searching for <span className="font-mono text-accent">&quot;{target}&quot;</span>
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted mr-1">Target:</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono bg-white"
          >
            {sortedUsers.map((u) => (<option key={u}>{u}</option>))}
            <option value="zzz_missing">zzz_missing (not in list)</option>
          </select>
          <button
            onClick={() => { if (i >= steps.length - 1) setI(0); setPlaying((p) => !p); }}
            className="px-4 py-1.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-orange-600 transition"
          >
            {playing ? "Pause" : i >= steps.length - 1 ? "Replay" : "Play"}
          </button>
          <button
            onClick={() => setI((x) => Math.max(0, x - 1))}
            disabled={i === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-40"
          >◀</button>
          <button
            onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))}
            disabled={i >= steps.length - 1}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-40"
          >▶</button>
          <button
            onClick={() => { setI(0); setPlaying(false); }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
          >Reset</button>
        </div>
      </div>

      {/* Array visual */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 md:gap-2 min-w-max justify-center">
          {sortedUsers.map((u, idx) => {
            const out = isEliminated(idx);
            const future = isFutureLinear(idx);
            const isMid = isBinary && idx === step.mid && !out;
            const isChecking = !isBinary && idx === step.checked;
            const match = step.found && step.checked === idx;
            return (
              <div key={u} className="flex flex-col items-center">
                <div className="text-[10px] text-muted mb-1 font-mono">[{idx}]</div>
                <div
                  className={[
                    "w-[72px] md:w-[78px] h-16 md:h-18 rounded-xl flex items-center justify-center font-mono text-[11px] md:text-xs font-semibold border-2 transition-all duration-500",
                    match
                      ? "bg-emerald-500 text-white border-emerald-600 scale-110 shadow-lg"
                      : isMid || isChecking
                      ? "bg-teal text-white border-teal scale-105 shadow-md"
                      : future
                      ? "bg-white text-ink border-slate-300"
                      : out
                      ? "bg-slate-100 text-slate-300 border-slate-200 opacity-50 line-through"
                      : "bg-white text-ink border-slate-300",
                  ].join(" ")}
                >
                  {u}
                </div>
                <div className="h-5 mt-1 text-[10px] font-bold tracking-wider">
                  {match ? (
                    <span className="text-emerald-600">FOUND</span>
                  ) : isBinary ? (
                    isMid ? <span className="text-teal">MID</span>
                    : idx === step.lo && !out ? <span className="text-accent">LO</span>
                    : idx === step.hi && !out ? <span className="text-accent">HI</span>
                    : ""
                  ) : isChecking ? (
                    <span className="text-teal">CHECK</span>
                  ) : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-navy text-white p-4">
          <div className="text-[10px] font-bold tracking-widest text-accent">STEP</div>
          <div className="text-3xl font-bold mt-1">
            {i + 1}<span className="text-slate-400 text-lg"> / {steps.length}</span>
          </div>
        </div>
        <div className="rounded-xl bg-navy text-white p-4">
          <div className="text-[10px] font-bold tracking-widest text-accent">
            {isBinary ? "REMAINING" : "STILL TO CHECK"}
          </div>
          <div className="text-3xl font-bold mt-1">
            {remaining}<span className="text-slate-400 text-lg"> items</span>
          </div>
        </div>
        <div className="rounded-xl bg-navy text-white p-4">
          <div className="text-[10px] font-bold tracking-widest text-accent">
            {isBinary ? "RANGE" : "INDEX"}
          </div>
          <div className="text-3xl font-bold mt-1 font-mono">
            {isBinary
              ? (step.lo <= step.hi ? `[${step.lo}, ${step.hi}]` : "—")
              : (step.checked === -1 ? "—" : step.checked)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border-l-4 border-accent bg-orange-50 p-4 text-ink">
        <span className="font-bold text-navy">What happens here:</span> {step.comment}
      </div>
    </div>
  );
}
