"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function UnlockForm() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") ?? "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Incorrect password." : "Something went wrong.");
        setPending(false);
        return;
      }
      const data = (await res.json()) as { next?: string };
      window.location.href = data.next ?? next;
    } catch {
      setError("Something went wrong.");
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl"
      >
        <h1 className="text-xl font-semibold mb-1">Protected page</h1>
        <p className="text-sm text-white/60 mb-6">
          Enter the password to continue.
        </p>
        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
          Password
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
        />
        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={pending || !password}
          className="mt-6 w-full rounded-lg bg-white text-black font-medium py-2 disabled:opacity-50"
        >
          {pending ? "Checking…" : "Unlock"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-3 w-full text-sm text-white/50 hover:text-white/80"
        >
          Back to portfolio
        </button>
      </form>
    </main>
  );
}
