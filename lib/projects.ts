export type Project = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  preview?: string;
};

export type Social = {
  name: "LinkedIn" | "YouTube" | "TikTok";
  handle: string;
  href: string;
};

export const projects: Project[] = [
  {
    title: "RunPy",
    description: "Code, share, manage & teach Python in the browser. A user-friendly space for students to write Python, and for teachers to view, run, share and give feedback.",
    tags: ["python", "education", "web"],
    href: "https://www.runpy.co.uk",
    preview: "/runpy-preview.png",
  },
  {
    title: "Who Shot Mr. Burns?",
    description: "A Springfield mystery — sift through suspects, clues and eyewitness statements to crack the case of who shot Mr. Burns.",
    tags: ["next", "game", "mystery"],
    href: "https://who-shot-mr-burns.vercel.app",
    preview: "/burns-preview.png",
  },
  {
    title: "REV11",
    description: "Build your Ultimate XI. A football team-builder with quizzes, transfer market, packs and manager progression — earn coins, collect cards and complete achievements.",
    tags: ["next", "game", "football"],
    href: "https://revision11.vercel.app",
    preview: "/rev11-preview.png",
  },
  {
    title: "SQL Injection Lab",
    description: "An interactive 8-step security lesson that walks you through SQL injection — from a normal login through to attacks, data theft, 2FA and prevention.",
    tags: ["security", "education", "interactive"],
    href: "https://sql-exploit-lab.base44.app",
    preview: "/sql-lab-preview.png",
  },
  {
    title: "Exam Total",
    description: "A keyboard-first marking tool — type any digit to add it to a running total. Shows the live mark count and how many questions you've entered.",
    tags: ["next", "tool", "education"],
    href: "https://exam-total.vercel.app",
    preview: "/examtotal-preview.png",
  },
  {
    title: "Sixth Form Taster",
    description: "A taster A Level Computer Science lesson — from data to decisions. Walks through linear vs binary search, scaling, complexity and the big idea behind algorithmic thinking.",
    tags: ["next", "education", "algorithms"],
    href: "https://searching-algos.vercel.app/",
    preview: "/sixth-form-taster-preview.png",
  },
  {
    title: "IO Quiz",
    description: "Input & Output Devices — can you spot the difference? A quick interactive quiz covering computers, consoles and phones.",
    tags: ["quiz", "education", "tech"],
    href: "https://cswhitgift.my.canva.site/ioquiz",
    preview: "/ioquiz-preview.png",
  },
];

export const socials: Social[] = [
  { name: "LinkedIn", handle: "kasim-lone", href: "https://www.linkedin.com/in/kasim-lone/" },
  { name: "YouTube", handle: "@MrLoneCS", href: "https://www.youtube.com/@MrLoneCS" },
  { name: "TikTok", handle: "@kasimlone", href: "#" },
];
