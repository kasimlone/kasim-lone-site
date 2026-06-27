import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    { path: "/", priority: 1 },
    { path: "/sixth-form-taster", priority: 0.8 },
    { path: "/who-shot-mr-burns", priority: 0.8 },
    { path: "/bitmap-images", priority: 0.7 },
    { path: "/exam-total", priority: 0.6 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority,
  }));
}
