import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    { path: "/", priority: 1 },
    { path: "/tutoring", priority: 0.9 },
    { path: "/blog", priority: 0.9 },
    { path: "/sixth-form-taster", priority: 0.8 },
    { path: "/who-shot-mr-burns", priority: 0.8 },
    { path: "/bitmap-images", priority: 0.7 },
    { path: "/exam-total", priority: 0.6 },
  ];

  const staticEntries = routes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority,
  }));

  const postEntries = getAllPosts().map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
