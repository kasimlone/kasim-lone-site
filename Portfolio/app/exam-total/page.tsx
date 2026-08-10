import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { loadStaticIndex } from "@/lib/static-site-loader";
import StaticSiteScripts from "@/components/StaticSiteScripts";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Exam Mark Totaller",
  description:
    "A quick classroom tool for totalling exam marks across multiple papers — built by Kasim Lone.",
  alternates: { canonical: "/exam-total" },
};

export default async function ExamTotalPage() {
  const page = await loadStaticIndex("exam-total");
  if (!page) notFound();
  return (
    <>
      <Script
        async
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1129118659435264"
        crossOrigin="anonymous"
      />
      <div dangerouslySetInnerHTML={{ __html: page.bodyHTML }} />
      <StaticSiteScripts scripts={page.scripts} />
    </>
  );
}
