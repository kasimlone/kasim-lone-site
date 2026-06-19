import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStaticIndex } from "@/lib/static-site-loader";
import StaticSiteScripts from "@/components/StaticSiteScripts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

export const metadata: Metadata = {
  title: "Bitmap Images — Interactive Lesson",
  description:
    "An interactive GCSE Computer Science lesson on bitmap images and data representation — built by Kasim Lone.",
  alternates: { canonical: "/bitmap-images" },
};

const learningResourceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "Bitmap Images — Interactive Lesson",
  description:
    "An interactive GCSE Computer Science lesson on data representation — pixels, resolution, colour depth and file size with hands-on demos.",
  url: `${siteUrl}/bitmap-images`,
  inLanguage: "en-GB",
  learningResourceType: "Lesson",
  educationalLevel: "GCSE / Key Stage 4",
  educationalUse: "Classroom Activity",
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
  teaches: ["Bitmap images", "Pixels", "Resolution", "Colour depth", "File size"],
  about: ["Computer Science", "Data Representation"],
  isAccessibleForFree: true,
  author: { "@id": `${siteUrl}/#kasim-lone` },
};

export default async function BitmapImagesPage() {
  const page = await loadStaticIndex("bitmap-images");
  if (!page) notFound();
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: page.bodyHTML }} />
      <StaticSiteScripts scripts={page.scripts} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
      />
    </>
  );
}
