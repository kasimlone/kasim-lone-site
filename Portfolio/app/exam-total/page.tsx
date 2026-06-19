import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStaticIndex } from "@/lib/static-site-loader";
import StaticSiteScripts from "@/components/StaticSiteScripts";

export const metadata: Metadata = {
  title: "Exam Mark Totaller",
};

export default async function ExamTotalPage() {
  const page = await loadStaticIndex("exam-total");
  if (!page) notFound();
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: page.bodyHTML }} />
      <StaticSiteScripts scripts={page.scripts} />
    </>
  );
}
