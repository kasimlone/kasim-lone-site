import { promises as fs } from "fs";
import path from "path";

const PAGES_DIR = path.join(process.cwd(), "lib", "wsmb-pages");

export const WSMB_SLUGS = [
  "",
  "suspects",
  "clue1",
  "clue2",
  "clue3",
  "clue4",
  "clue5",
  "solve",
  "more",
] as const;

function slugToFile(slug: string): string {
  if (!slug) return "index.html";
  return `${slug}.html`;
}

export type WSMBPage = {
  bodyHTML: string;
  scripts: string[];
};

export async function loadWSMBPage(slug: string): Promise<WSMBPage | null> {
  const file = slugToFile(slug);
  let raw: string;
  try {
    raw = await fs.readFile(path.join(PAGES_DIR, file), "utf8");
  } catch {
    return null;
  }

  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const headMatch = raw.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  let body = bodyMatch ? bodyMatch[1] : raw;
  const headStyle = headMatch
    ? Array.from(headMatch[1].matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
        .map((m) => `<style>${m[1]}</style>`)
        .join("\n")
    : "";

  body = headStyle + body;

  body = body.replace(
    /(href|src)="([^"]+)"/gi,
    (_full, attr: string, val: string) => {
      if (/^(https?:|data:|mailto:|tel:|#|\/)/i.test(val)) {
        return `${attr}="${val}"`;
      }
      if (/\.html$/i.test(val)) {
        const slugPart = val.replace(/\.html$/i, "");
        let target: string;
        if (slugPart === "more") target = "/";
        else if (slugPart === "index") target = "/who-shot-mr-burns";
        else target = `/who-shot-mr-burns/${slugPart}`;
        return `${attr}="${target}"`;
      }
      return `${attr}="/who-shot-mr-burns/${val}"`;
    }
  );

  const scripts: string[] = [];
  body = body.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (_full, attrs: string, code: string) => {
      if (/\bsrc\s*=/.test(attrs)) return "";
      scripts.push(code);
      return "";
    }
  );

  return { bodyHTML: body, scripts };
}
