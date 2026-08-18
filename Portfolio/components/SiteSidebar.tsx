import Link from "next/link";
import { projects, socials } from "@/lib/projects";
import { getRecentPosts } from "@/lib/blog";

function slug(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

function SidebarLink({
  href,
  active,
  children,
  className = "",
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const external = /^https?:\/\//.test(href);
  const cls = `block truncate ${
    active
      ? "text-syntax-keyword font-semibold"
      : "text-zinc-100 hover:text-syntax-keyword"
  } ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function SiteSidebar({ currentPath }: { currentPath: string }) {
  const recentPosts = getRecentPosts(5);
  return (
    <aside className="hidden md:block w-64 border-r border-zinc-800 bg-black/85 backdrop-blur-md p-4 font-mono text-sm text-zinc-100 min-h-screen shrink-0">
      <div className="text-zinc-300 uppercase tracking-widest text-xs mb-3 font-semibold">
        explorer
      </div>
      <div className="space-y-1.5">
        <Link
          href="/"
          className="block text-syntax-keyword text-base font-semibold hover:underline"
        >
          ▾ kasim-lone
        </Link>

        <Link
          href="/"
          className="block pl-3 text-syntax-fn font-semibold uppercase tracking-wide hover:underline"
        >
          ▾ projects/
        </Link>
        {projects.map((p) => {
          const active =
            !/^https?:\/\//.test(p.href) && currentPath === p.href;
          return (
            <SidebarLink
              key={p.title}
              href={p.href}
              active={active}
              className="pl-6"
            >
              {slug(p.title)}.tsx
            </SidebarLink>
          );
        })}

        <div className="pl-3 text-syntax-fn font-semibold uppercase tracking-wide mt-3">▾ blog/</div>
        <SidebarLink
          href="/blog"
          active={currentPath === "/blog"}
          className="pl-6 italic text-zinc-400"
        >
          all-posts
        </SidebarLink>
        {recentPosts.map((p) => (
          <SidebarLink
            key={p.slug}
            href={`/blog/${p.slug}`}
            active={currentPath === `/blog/${p.slug}`}
            className="pl-6"
          >
            {p.slug}.mdx
          </SidebarLink>
        ))}

        <div className="pl-3 text-syntax-fn font-semibold uppercase tracking-wide mt-3">▾ socials/</div>
        {socials.map((s) => (
          <SidebarLink key={s.name} href={s.href} className="pl-6">
            {s.name.toLowerCase()}.md
          </SidebarLink>
        ))}

        <SidebarLink
          href="/tutoring"
          active={currentPath === "/tutoring"}
          className="pl-3 mt-3 text-syntax-string hover:text-syntax-keyword"
        >
          tutoring.md
        </SidebarLink>
        <SidebarLink
          href="/"
          active={currentPath === "/"}
          className="pl-3"
        >
          readme.md
        </SidebarLink>
      </div>

      <div className="mt-10 text-xs text-zinc-400">
        <div>
          <span className="text-leaf">●</span> online
        </div>
        <div className="mt-1">cwd: ~/kasim-lone</div>
      </div>
    </aside>
  );
}
