import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStaticIndex } from "@/lib/static-site-loader";
import StaticSiteScripts from "@/components/StaticSiteScripts";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

export const metadata: Metadata = {
  title: "Networks — Year 9 Interactive Lessons",
  description:
    "Interactive Year 9 Computer Science lessons on networks — the internet, connectivity, topologies and network types — plus a hands-on network simulator.",
  alternates: { canonical: "/networks-year-9" },
};

const learningResourceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "Networks — Year 9 Interactive Lessons",
  description:
    "Four interactive Year 9 Computer Science lessons on networks — the internet, connectivity, topologies and network types — plus a network simulator.",
  url: `${siteUrl}/networks-year-9`,
  inLanguage: "en-GB",
  learningResourceType: "Lesson",
  educationalLevel: "Key Stage 3 / Year 9",
  educationalUse: "Classroom Activity",
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
  teaches: ["Networks", "LAN", "WAN", "Network topologies", "The internet", "DNS", "Packets"],
  about: ["Computer Science", "Computer Networks"],
  isAccessibleForFree: true,
  author: { "@id": `${siteUrl}/#kasim-lone` },
};

export default async function NetworksYear9Page() {
  const page = await loadStaticIndex("networks-year-9");
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
