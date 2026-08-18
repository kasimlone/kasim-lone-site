import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { SiteSidebar } from "@/components/SiteSidebar";
import { BioCard } from "@/components/BioCard";
import { getAllSlugs, getPostBySlug, formatDate } from "@/lib/blog";

export const dynamic = "force-static";
export const dynamicParams = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Kasim Lone`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author ?? "Kasim Lone"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author ?? "Kasim Lone",
      url: `${siteUrl}/tutoring`,
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    keywords: post.tags?.join(", "),
  };

  return (
    <main className="min-h-screen text-zinc-200 isolate">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url(/classroom.jpg)", filter: "blur(6px) saturate(1.15)", transform: "scale(1.15)", zIndex: 0 }}
        aria-hidden
      />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(15,20,25,0.55)", zIndex: 1 }} aria-hidden />

      <SiteChrome file={`blog/${post.slug}.mdx`} />

      <div className="relative z-10 flex">
        <SiteSidebar currentPath={`/blog/${post.slug}`} />

        <section className="flex-1 p-6 md:p-10">
          <BioCard />

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-mono text-zinc-300 hover:text-syntax-keyword mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> all posts
          </Link>

          <article className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-7 sm:p-10">
            <div className="font-mono text-xs text-zinc-400">
              {formatDate(post.date)}
              {post.tags && post.tags.length > 0 && (
                <span className="ml-3">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="mr-2 rounded bg-white/5 border border-white/10 px-1.5 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-zinc-50 tracking-tight">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-3 text-lg text-zinc-300">{post.description}</p>
            )}

            <div className="prose prose-invert mt-8 max-w-none prose-headings:tracking-tight prose-a:text-syntax-keyword prose-code:text-syntax-string prose-code:bg-black/40 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10">
              <MDXRemote
                source={post.content}
                options={{
                  mdxOptions: { remarkPlugins: [remarkGfm] },
                }}
              />
            </div>
          </article>

          <div className="mt-10 rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6 text-zinc-200">
            <p className="text-sm text-zinc-400 font-mono uppercase tracking-widest">// need 1-to-1 help?</p>
            <p className="mt-2">
              I offer 1-to-1 Computer Science tutoring for GCSE and A Level
              students — online across the UK and in person around London and
              Croydon.
            </p>
            <Link
              href="/tutoring"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-syntax-string text-black font-semibold px-4 py-2 hover:brightness-110 transition"
            >
              Book me as a tutor <span aria-hidden>→</span>
            </Link>
          </div>

          <footer className="mt-16 font-mono text-[10px] text-zinc-600">
            {"// © " + new Date().getFullYear() + " kasim lone"}
          </footer>
        </section>
      </div>
    </main>
  );
}
