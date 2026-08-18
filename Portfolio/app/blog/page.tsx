import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";
import { SiteSidebar } from "@/components/SiteSidebar";
import { BioCard } from "@/components/BioCard";
import { getAllPosts, formatDate } from "@/lib/blog";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title:
    "Blog — Computer Science, Curriculum, Teaching Resources & Tech | Kasim Lone",
  description:
    "Notes on Computer Science, curriculum design, teaching resources, and developments in technology — by Kasim Lone, Head of Computer Science and founder of RunPy.",
  keywords: [
    "computer science blog",
    "computer science teacher blog",
    "computer science curriculum",
    "GCSE computer science curriculum",
    "A Level computer science curriculum",
    "computer science teaching resources",
    "edtech blog",
    "technology in education",
    "developments in computer science",
    "computing curriculum UK",
    "head of computer science blog",
    "Kasim Lone blog",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title:
      "Computer Science, Curriculum & Teaching Resources — Kasim Lone Blog",
    description:
      "Notes on Computer Science, curriculum, teaching resources and developments in technology.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen text-zinc-200 isolate">
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url(/classroom.jpg)", filter: "blur(6px) saturate(1.15)", transform: "scale(1.15)", zIndex: 0 }}
        aria-hidden
      />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(15,20,25,0.55)", zIndex: 1 }} aria-hidden />

      <SiteChrome file="blog/" />

      <div className="relative z-10 flex">
        <SiteSidebar currentPath="/blog" />

        <section className="flex-1 p-6 md:p-10">
          <BioCard />

          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-white mb-3">// posts</h2>
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6 text-zinc-300">
                No posts yet — check back soon.
              </div>
            ) : (
              <ul className="space-y-4">
                {posts.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="block rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6 hover:border-syntax-keyword/60 transition"
                    >
                      <div className="font-mono text-xs text-zinc-400">
                        {formatDate(p.date)}
                        {p.tags && p.tags.length > 0 && (
                          <span className="ml-3">
                            {p.tags.map((t) => (
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
                      <h3 className="mt-2 text-xl font-semibold text-zinc-50 tracking-tight">
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="mt-2 text-zinc-300">{p.description}</p>
                      )}
                      <div className="mt-3 font-mono text-sm text-syntax-keyword">
                        read post →
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="mt-16 font-mono text-[10px] text-zinc-600">
            {"// © " + new Date().getFullYear() + " kasim lone"}
          </footer>
        </section>
      </div>
    </main>
  );
}
