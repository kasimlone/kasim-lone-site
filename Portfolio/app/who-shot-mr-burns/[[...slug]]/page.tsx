import { notFound } from "next/navigation";
import { loadWSMBPage, WSMB_SLUGS } from "@/lib/wsmb-loader";
import WSMBScripts from "@/components/who-shot-mr-burns/WSMBScripts";

export function generateStaticParams() {
  return WSMB_SLUGS.map((s) => ({ slug: s ? [s] : [] }));
}

export default async function WSMBPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const key = slug?.[0] ?? "";
  if (!WSMB_SLUGS.includes(key as (typeof WSMB_SLUGS)[number])) notFound();
  const page = await loadWSMBPage(key);
  if (!page) notFound();
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: page.bodyHTML }} />
      <WSMBScripts scripts={page.scripts} />
    </>
  );
}
