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
    description: "An online Python IDE — code, share, manage and teach Python in the browser. Run Python online with a user-friendly space for students to write code, and for teachers to view, run, share and give feedback.",
    tags: ["python", "IDE", "edtech"],
    href: "https://www.runpy.co.uk",
    preview: "/project-cards/runpy-preview.png",
  },
  {
    title: "Who Shot Mr. Burns?",
    description: "A Springfield mystery — sift through suspects, clues and eyewitness statements to crack the case of who shot Mr. Burns.",
    tags: ["next", "game", "mystery"],
    href: "/who-shot-mr-burns",
    preview: "/project-cards/burns-preview.png",
  },
  {
    title: "REV11",
    description: "Build your Ultimate XI. Computer science revision games and flashcards dressed as a football team-builder — answer quiz questions to earn coins, open packs, collect cards and complete achievements.",
    tags: ["revision", "flashcards", "game"],
    href: "/revision11",
    preview: "/project-cards/rev11-preview.png",
  },
  {
    title: "SQL Injection Lab",
    description: "An interactive 8-step security lesson that walks you through SQL injection — from a normal login through to attacks, data theft, 2FA and prevention.",
    tags: ["security", "education", "interactive"],
    href: "https://sql-exploit-lab.base44.app",
    preview: "/project-cards/sql-lab-preview.png",
  },
  {
    title: "Exam Total",
    description: "A keyboard-first marking tool — type any digit to add it to a running total. Shows the live mark count and how many questions you've entered.",
    tags: ["next", "tool", "education"],
    href: "/exam-total",
    preview: "/project-cards/examtotal-preview.png",
  },
  {
    title: "Bitmap Images",
    description: "A GCSE Computer Science lesson on data representation — explore how computers store pictures using pixels, resolution, colour depth and file size with hands-on demos.",
    tags: ["comp sci", "lessons", "gcse"],
    href: "/bitmap-images",
    preview: "/project-cards/bitmap-images-preview.png",
  },
  {
    title: "Sixth Form Taster",
    description: "A taster A Level Computer Science lesson — from data to decisions. Walks through linear vs binary search, scaling, complexity and the big idea behind algorithmic thinking.",
    tags: ["comp sci", "lessons", "algorithms"],
    href: "/sixth-form-taster",
    preview: "/project-cards/sixth-form-taster-preview.png",
  },
  {
    title: "IO Quiz",
    description: "Input & Output Devices — can you spot the difference? A quick interactive computer science revision quiz covering computers, consoles and phones.",
    tags: ["quiz", "revision", "comp sci"],
    href: "https://cswhitgift.my.canva.site/ioquiz",
    preview: "/project-cards/ioquiz-preview.png",
  },
];

export const socials: Social[] = [
  { name: "LinkedIn", handle: "kasim-lone", href: "https://www.linkedin.com/in/kasim-lone/" },
  { name: "YouTube", handle: "@MrLoneCS", href: "https://www.youtube.com/@MrLoneCS" },
  { name: "TikTok", handle: "@kasimlone", href: "#" },
];
