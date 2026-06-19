import { promises as fs } from "fs";
import path from "path";

export type StaticScript = { kind: "inline"; code: string } | { kind: "src"; src: string };

export type StaticPage = {
  bodyHTML: string;
  scripts: StaticScript[];
};

export async function loadStaticIndex(slug: string): Promise<StaticPage | null> {
  const file = path.join(process.cwd(), "public", slug, "index.html");
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return null;
  }

  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const headMatch = raw.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  let body = bodyMatch ? bodyMatch[1] : raw;

  const headExtras: string[] = [];
  if (headMatch) {
    for (const m of headMatch[1].matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
      headExtras.push(`<style>${m[1]}</style>`);
    }
    for (const m of headMatch[1].matchAll(/<link\b([^>]*?)>/gi)) {
      headExtras.push(`<link${m[1]}>`);
    }
  }
  body = headExtras.join("\n") + body;

  body = body.replace(
    /(href|src)="([^"]+)"/gi,
    (_full, attr: string, val: string) => {
      if (/^(https?:|data:|mailto:|tel:|#|\/)/i.test(val)) {
        return `${attr}="${val}"`;
      }
      return `${attr}="/${slug}/${val}"`;
    }
  );

  const scripts: StaticScript[] = [];
  body = body.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (_full, attrs: string, code: string) => {
      const srcMatch = attrs.match(/\bsrc\s*=\s*"([^"]+)"/i);
      if (srcMatch) {
        let src = srcMatch[1];
        if (!/^(https?:|data:|\/)/i.test(src)) src = `/${slug}/${src}`;
        scripts.push({ kind: "src", src });
      } else {
        scripts.push({ kind: "inline", code });
      }
      return "";
    }
  );

  return { bodyHTML: body, scripts };
}
