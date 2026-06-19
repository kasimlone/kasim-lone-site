"use client";

import { useEffect } from "react";
import type { StaticScript } from "@/lib/static-site-loader";

export default function StaticSiteScripts({ scripts }: { scripts: StaticScript[] }) {
  useEffect(() => {
    const tags: HTMLScriptElement[] = [];
    for (const s of scripts) {
      const tag = document.createElement("script");
      if (s.kind === "src") tag.src = s.src;
      else tag.text = s.code;
      document.body.appendChild(tag);
      tags.push(tag);
    }
    return () => {
      for (const t of tags) t.remove();
    };
  }, [scripts]);
  return null;
}
