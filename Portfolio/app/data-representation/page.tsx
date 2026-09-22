import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStaticIndex } from "@/lib/static-site-loader";
import StaticSiteScripts from "@/components/StaticSiteScripts";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

export const metadata: Metadata = {
  title: "Data Representation — Interactive GCSE Topics",
  description:
    "Interactive GCSE Computer Science topics on data representation — binary, hexadecimal, characters, images and sound.",
  alternates: { canonical: "/data-representation" },
};

const learningResourceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "Data Representation — Interactive GCSE Topics",
  description:
    "Five interactive GCSE Computer Science topics on data representation — binary, hexadecimal, characters, images and sound.",
  url: `${siteUrl}/data-representation`,
  inLanguage: "en-GB",
  learningResourceType: "Lesson",
  educationalLevel: "GCSE / Key Stage 4",
  educationalUse: "Classroom Activity",
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
  teaches: ["Binary", "Hexadecimal", "Characters", "ASCII", "Unicode", "Bitmap images", "Sound"],
  about: ["Computer Science", "Data Representation"],
  isAccessibleForFree: true,
  author: { "@id": `${siteUrl}/#kasim-lone` },
};

export default async function DataRepresentationPage() {
  const page = await loadStaticIndex("data-representation");
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
