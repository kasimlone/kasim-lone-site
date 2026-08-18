"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [yearGroup, setYearGroup] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/tutor-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, yearGroup, message, website }),
      });
      if (!res.ok) {
        setError(
          res.status === 400
            ? "Please check your details and try again."
            : "Something went wrong sending your message. Please try again later.",
        );
        setPending(false);
        return;
      }
      setSent(true);
      setPending(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6">
        <h3 className="text-lg font-semibold text-syntax-string">Message sent</h3>
        <p className="mt-2 text-sm text-white/70">
          Thanks — I&apos;ll be in touch by email shortly.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30 text-zinc-100";
  const labelCls = "block text-xs uppercase tracking-wider text-white/50 mb-2";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6 space-y-4"
    >
      <div>
        <label className={labelCls} htmlFor="tc-name">Name</label>
        <input
          id="tc-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="tc-email">Email</label>
        <input
          id="tc-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="tc-year">Year group or level (optional)</label>
        <input
          id="tc-year"
          type="text"
          placeholder="e.g. Year 11 GCSE, Year 13 A Level"
          value={yearGroup}
          onChange={(e) => setYearGroup(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="tc-message">Message</label>
        <textarea
          id="tc-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls + " resize-y"}
          placeholder="Tell me what you're studying, what you'd like help with, and when suits you."
        />
      </div>

      {/* Honeypot — hidden from users, catches bots */}
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending || !name || !email || !message}
        className="w-full rounded-lg bg-white text-black font-medium py-2 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
