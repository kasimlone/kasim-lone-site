import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thinking Like an A Level Computer Scientist",
  description: "From Data to Decisions — a searching algorithms taster lesson.",
};

export default function SixthFormTasterLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-page text-ink min-h-screen antialiased">{children}</div>;
}
