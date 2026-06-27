import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { socials } from "@/lib/projects";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasim-lone.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kasim Lone — Computer Science Teacher & Builder",
    template: "%s · Kasim Lone",
  },
  description:
    "Kasim Lone — Head of Computer Science and Digital Literacy, founder of RunPy. Building interactive lessons, classroom tools and learning experiences for GCSE and A Level Computer Science.",
  applicationName: "Kasim Lone",
  authors: [{ name: "Kasim Lone", url: siteUrl }],
  creator: "Kasim Lone",
  publisher: "Kasim Lone",
  keywords: [
    "Kasim Lone",
    "Computer Science teacher",
    "GCSE Computer Science",
    "A Level Computer Science",
    "RunPy",
    "Python teaching",
    "interactive lessons",
    "digital literacy",
    "Head of Computer Science",
    "code",
    "coding",
    "programming",
    "IDE",
    "education",
    "edtech",
    "computer science",
    "comp sci",
    "run python",
    "python IDE",
    "online python",
    "run python online",
    "computer science lessons",
    "revision games",
    "computer science flashcards",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Kasim Lone",
    title: "Kasim Lone — Computer Science Teacher & Builder",
    description:
      "Head of Computer Science and Digital Literacy. Founder of RunPy. Interactive lessons and classroom tools.",
    url: siteUrl,
    locale: "en_GB",
    images: [
      {
        url: "/kasim.png",
        width: 1200,
        height: 630,
        alt: "Kasim Lone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kasim Lone — Computer Science Teacher & Builder",
    description:
      "Head of Computer Science and Digital Literacy. Founder of RunPy.",
    images: ["/kasim.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/kasim.png",
    apple: "/kasim.png",
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#0f1419",
  width: "device-width",
  initialScale: 1,
};

const personId = `${siteUrl}/#kasim-lone`;
const organizationId = "https://www.runpy.co.uk/#organization";
const websiteId = `${siteUrl}/#website`;

const sameAs = Array.from(
  new Set(
    [
      "https://www.runpy.co.uk",
      ...socials.map((s) => s.href).filter((href) => href.startsWith("http")),
    ],
  ),
);

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: "Kasim Lone",
      url: siteUrl,
      image: `${siteUrl}/kasim.png`,
      jobTitle: "Head of Computer Science and Digital Literacy",
      description:
        "Kasim Lone is Head of Computer Science and Digital Literacy and the founder of RunPy, an online Python IDE for classrooms. He builds interactive lessons, revision games and classroom tools for GCSE and A Level Computer Science.",
      knowsAbout: [
        "Computer Science",
        "Python",
        "Programming",
        "Education",
        "EdTech",
        "GCSE Computer Science",
        "A Level Computer Science",
        "Algorithms",
        "Data Representation",
        "Digital Literacy",
      ],
      worksFor: { "@id": organizationId },
      sameAs,
    },
    {
      "@type": "Organization",
      "@id": organizationId,
      name: "RunPy",
      url: "https://www.runpy.co.uk",
      description:
        "RunPy is an online Python IDE for classrooms — students write, run and share Python code in the browser, and teachers view, run, share and give feedback.",
      founder: { "@id": personId },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl,
      name: "Kasim Lone",
      description:
        "Portfolio of Kasim Lone — Computer Science teacher, founder of RunPy, builder of interactive lessons and classroom tools.",
      publisher: { "@id": personId },
      inLanguage: "en-GB",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
