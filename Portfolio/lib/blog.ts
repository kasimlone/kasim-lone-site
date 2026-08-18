import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  author?: string;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
};

export type Post = PostMeta & {
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function ensureDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

function readPostFile(filename: string): Post {
  const slug = filename.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? new Date().toISOString()),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    author: data.author ? String(data.author) : undefined,
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  ensureDir();
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => /\.mdx?$/.test(f));
  const posts = files.map(readPostFile);
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts.map(({ content: _c, ...meta }) => meta);
}

export function getRecentPosts(limit = 5): PostMeta[] {
  return getAllPosts().slice(0, limit);
}

export function getPostBySlug(slug: string): Post | null {
  ensureDir();
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const filename of candidates) {
    const full = path.join(BLOG_DIR, filename);
    if (fs.existsSync(full)) {
      return readPostFile(filename);
    }
  }
  return null;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
