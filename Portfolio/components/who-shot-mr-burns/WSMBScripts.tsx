"use client";

import { useEffect } from "react";

export default function WSMBScripts({ scripts }: { scripts: string[] }) {
  useEffect(() => {
    const tags: HTMLScriptElement[] = [];
    for (const code of scripts) {
      const s = document.createElement("script");
      s.text = code;
      document.body.appendChild(s);
      tags.push(s);
    }
    return () => {
      for (const t of tags) t.remove();
    };
  }, [scripts]);
  return null;
}
