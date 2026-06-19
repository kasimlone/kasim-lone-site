import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

export const metadata: Metadata = {
  title: "Thinking Like an A Level Computer Scientist",
  description:
    "From Data to Decisions — an A Level Computer Science taster lesson on searching algorithms, built by Kasim Lone.",
  alternates: { canonical: "/sixth-form-taster" },
};

const learningResourceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "Thinking Like an A Level Computer Scientist",
  description:
    "An A Level Computer Science taster lesson on linear search, binary search, scaling and complexity — the big idea behind algorithmic thinking.",
  url: `${siteUrl}/sixth-form-taster`,
  inLanguage: "en-GB",
  learningResourceType: "Lesson",
  educationalLevel: "A Level / Sixth Form",
  educationalUse: "Classroom Activity",
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
  teaches: ["Linear search", "Binary search", "Algorithmic complexity", "Computational thinking"],
  about: ["Computer Science", "Algorithms"],
  isAccessibleForFree: true,
  author: { "@id": `${siteUrl}/#kasim-lone` },
};

export default function SixthFormTasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-page text-ink min-h-screen antialiased">
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
      />
    </div>
  );
}
