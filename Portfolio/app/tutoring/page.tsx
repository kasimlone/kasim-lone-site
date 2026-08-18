import type { Metadata } from "next";
import { GraduationCap, Check } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { SiteSidebar } from "@/components/SiteSidebar";
import { BioCard } from "@/components/BioCard";
import ContactForm from "./ContactForm";

export const dynamic = "force-static";

const pageTitle =
  "Computer Science Tutor — GCSE & A Level Python Tutor in London & Croydon";
const pageDescription =
  "1-to-1 Computer Science tutor with 14 years' teaching experience. GCSE and A Level Computer Science, Python help, exam technique and revision. Online tutoring UK-wide, in-person around London and Croydon. Get in touch with Kasim Lone.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "computer science tutor",
    "computer science tutoring",
    "GCSE computer science tutor",
    "A Level computer science tutor",
    "Python tutor",
    "Python help",
    "1 to 1 tutor",
    "online computer science tutor",
    "computer science revision",
    "GCSE Python tutor",
    "A Level Python tutor",
    "computer science tutor London",
    "computer science tutor Croydon",
    "tutor near me",
    "tutor London",
    "tutor Croydon",
    "grade 9 computer science",
    "A* computer science",
    "AQA computer science tutor",
    "OCR computer science tutor",
    "Edexcel computer science tutor",
    "CIE computer science tutor",
    "KS3 computer science",
    "programming tutor",
    "coding tutor for students",
  ],
  alternates: { canonical: "/tutoring" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/tutoring",
    type: "website",
    images: ["/kasim.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/kasim.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Kasim Lone",
      jobTitle: "Head of Computer Science and Digital Literacy",
      url: "https://kasim-lone.dev/tutoring",
      image: "https://kasim-lone.dev/kasim.png",
      sameAs: [
        "https://www.linkedin.com/in/kasim-lone/",
        "https://www.youtube.com/@MrLoneCS",
        "https://www.runpy.co.uk",
      ],
      knowsAbout: [
        "Computer Science",
        "Python programming",
        "GCSE Computer Science",
        "A Level Computer Science",
        "Exam technique",
        "Algorithms",
        "Data representation",
        "Computer networks",
      ],
    },
    {
      "@type": "Service",
      serviceType: "Computer Science Tutoring",
      provider: { "@type": "Person", name: "Kasim Lone" },
      areaServed: [
        { "@type": "City", name: "London" },
        { "@type": "City", name: "Croydon" },
        { "@type": "Country", name: "United Kingdom" },
      ],
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
      },
      description:
        "1-to-1 tutoring in GCSE and A Level Computer Science, Python programming, exam technique and revision. Online across the UK and in person around London and Croydon.",
      url: "https://kasim-lone.dev/tutoring",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Which exam boards do you tutor for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "GCSE Computer Science with AQA, OCR, Edexcel and CIE, and A Level Computer Science with AQA, OCR and Edexcel.",
          },
        },
        {
          "@type": "Question",
          name: "Do you tutor online or in person?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Both. Online sessions are available anywhere in the UK using video call and a shared code editor. In-person sessions are available around London and Croydon.",
          },
        },
        {
          "@type": "Question",
          name: "Can you help with Python?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — Python is central to GCSE and A Level Computer Science. I cover Python fundamentals, exam-style programming questions, debugging and larger programming projects.",
          },
        },
        {
          "@type": "Question",
          name: "Can you push students towards a grade 9 or A*?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. With 14 years' teaching experience I have a strong track record of pushing top students to grade 9 at GCSE and A* at A Level, as well as helping students achieve above their target grades.",
          },
        },
      ],
    },
  ],
};

export default function TutoringPage() {
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

      <SiteChrome file="tutoring.md" />

      <div className="relative z-10 flex">
        <SiteSidebar currentPath="/tutoring" />

        <section className="flex-1 p-6 md:p-10">
          <BioCard />

          {/* Hero */}
          <section className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-7 sm:p-9">
            <div className="flex items-center gap-3 text-syntax-keyword font-mono text-xs uppercase tracking-widest">
              <GraduationCap className="w-4 h-4" /> tutoring
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-zinc-50 tracking-tight">
              Computer Science Tutor — GCSE, A Level &amp; Python
            </h2>
            <p className="mt-2 text-zinc-400 font-mono text-sm">
              1-to-1 tutoring · online across the UK · in-person around London &amp; Croydon
            </p>
            <p className="mt-4 text-zinc-300 leading-relaxed">
              I&apos;m a Computer Science tutor and Head of Department with 14
              years of classroom experience. I offer 1-to-1 GCSE Computer
              Science tutoring, A Level Computer Science tutoring and Python
              help for students who want clear explanations, focused revision
              and real progress in their grades — whether that&apos;s catching
              up or pushing for a grade 9 or A*.
            </p>
          </section>

          {/* About */}
          <section className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-white mb-3">// about</h2>
            <div className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6 space-y-3 text-zinc-200">
              <p>
                I&apos;m Kasim — currently Head of Computer Science and
                Digital Literacy, and founder of{" "}
                <a
                  href="https://www.runpy.co.uk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-syntax-keyword hover:underline"
                >
                  RunPy
                </a>
                , a browser-based Python environment used in classrooms.
              </p>
              <p>
                I&apos;ve been teaching Computer Science for 14 years across
                KS3, GCSE and A Level, with a strong track record of
                outstanding results — whether that&apos;s getting students up
                to speed and achieving above their target grade, or pushing
                top students to grade 9 and A*.
              </p>
              <p>
                My tutoring is grounded in exam-board specifications and the
                patterns students actually get stuck on. For my full teaching
                experience and CV, see my{" "}
                <a
                  href="https://www.linkedin.com/in/kasim-lone/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-syntax-keyword hover:underline"
                >
                  LinkedIn profile
                </a>
                .
              </p>
            </div>
          </section>

          {/* Offer */}
          <section className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-white mb-3">// what I offer</h2>
            <ul className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6 space-y-2.5">
              {[
                "1-to-1 online tutoring (video call + shared code editor) anywhere in the UK",
                "In-person tutoring around London and Croydon",
                "GCSE Computer Science tutor — AQA, OCR, Edexcel, CIE",
                "A Level Computer Science tutor — AQA, OCR, Edexcel",
                "Python tutoring — fundamentals through to advanced topics",
                "Revision, exam technique, past-paper walkthroughs and mark-scheme drills",
                "Grade 9 and A* push for students aiming for the top",
                "KS3 catch-up and enrichment for keen younger students",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-zinc-200">
                  <Check className="w-4 h-4 mt-1 text-syntax-string shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Logistics */}
          <section className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-white mb-3">// how it works</h2>
            <div className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6 text-zinc-200 space-y-2">
              <p>
                Every student is different, so sessions are tailored around
                what you need — the topics you&apos;re struggling with, your
                exam board, and how much time we have. After a short free
                intro chat we agree a plan that fits.
              </p>
              <p className="text-sm text-white/60">
                Rates on request — get in touch below with the year group and
                exam board and I&apos;ll come back with availability and pricing.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-white mb-3">// faq</h2>
            <div className="rounded-2xl border border-zinc-700/60 bg-panel/70 backdrop-blur-md p-6 text-zinc-200 space-y-5">
              <div>
                <h3 className="font-semibold text-zinc-50">Which exam boards do you tutor for?</h3>
                <p className="mt-1 text-zinc-300">
                  GCSE Computer Science with AQA, OCR, Edexcel and CIE, and A
                  Level Computer Science with AQA, OCR and Edexcel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-50">Do you tutor online or in person?</h3>
                <p className="mt-1 text-zinc-300">
                  Both. Online tutoring is available anywhere in the UK using
                  video call and a shared code editor. In-person tutoring is
                  available around London and Croydon.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-50">Can you help with Python?</h3>
                <p className="mt-1 text-zinc-300">
                  Yes — Python is central to GCSE and A Level Computer Science.
                  I cover Python fundamentals, exam-style programming
                  questions, debugging and larger programming projects.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-50">Can you push students towards a grade 9 or A*?</h3>
                <p className="mt-1 text-zinc-300">
                  Yes. With 14 years&apos; teaching experience I have a strong
                  track record of pushing top students to grade 9 at GCSE and
                  A* at A Level, as well as helping students achieve above
                  their target grades.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mt-10" id="contact">
            <h2 className="font-mono text-xs uppercase tracking-widest text-white mb-3">// get in touch</h2>
            <ContactForm />
          </section>

          <footer className="mt-16 font-mono text-[10px] text-zinc-600">
            {"// © " + new Date().getFullYear() + " kasim lone"}
          </footer>
        </section>
      </div>
    </main>
  );
}
