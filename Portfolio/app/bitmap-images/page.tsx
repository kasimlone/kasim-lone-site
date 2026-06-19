import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStaticIndex } from "@/lib/static-site-loader";
import StaticSiteScripts from "@/components/StaticSiteScripts";

export const metadata: Metadata = {
  title: "Bitmap Images — Interactive Lesson",
  description: "GCSE Computer Science · Data Representation",
};

export default async function BitmapImagesPage() {
  const page = await loadStaticIndex("bitmap-images");
  if (!page) notFound();
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: page.bodyHTML }} />
      <StaticSiteScripts scripts={page.scripts} />
    </>
  );
}
