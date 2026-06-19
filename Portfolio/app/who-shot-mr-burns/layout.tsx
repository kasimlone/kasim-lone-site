import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

export const metadata: Metadata = {
  title: "Who Shot Mr. Burns? — Springfield Police Department",
  description:
    "A Springfield mystery — sift through suspects, clues and eyewitness statements to crack the case. A classroom puzzle by Kasim Lone.",
  alternates: { canonical: "/who-shot-mr-burns" },
};

const learningResourceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "Who Shot Mr. Burns? — Classroom Mystery",
  description:
    "A classroom puzzle styled as a Springfield Police Department case file — students sift through suspects, clues and eyewitness statements to crack the case.",
  url: `${siteUrl}/who-shot-mr-burns`,
  inLanguage: "en-GB",
  learningResourceType: "Activity",
  educationalUse: "Classroom Activity",
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
  teaches: ["Logical reasoning", "Deduction", "Evidence evaluation"],
  isAccessibleForFree: true,
  author: { "@id": `${siteUrl}/#kasim-lone` },
};

export default function WSMBLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&family=Bebas+Neue&display=swap"
        rel="stylesheet"
      />
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
      />
    </>
  );
}
