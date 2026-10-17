import { owner } from "@/features/desk/data/scene3d";
import { tokens } from "@/styles/tokens";

/**
 * Everything search engines and link previews need to know about the site, in one place.
 * Set NEXT_PUBLIC_SITE_URL when the site moves to its own domain.
 */
export const site = {
  name: owner.name,
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mukadusjawaid.vercel.app").replace(/\/$/, ""),
  title: `${owner.name} | Frontend Software Engineer in Karachi`,
  description: `Portfolio of ${owner.name}, a Karachi software engineer specialising in React, Next.js and TypeScript. Explore projects and experience on an interactive 3D desk.`,
  jobTitle: "Software Engineer (Frontend Specialist)",
  city: "Karachi",
  country: "Pakistan",
  countryCode: "PK",
  themeColor: tokens.bg,
  social: {
    github: "https://github.com/MukadusJawaid",
    linkedin: "https://www.linkedin.com/in/mukadusjawaid/",
    behance: "https://www.behance.net/mukadusjawaid",
  },
  keywords: [
    "Mukadus Jawaid",
    "Mukadus Jawaid portfolio",
    "Mukadus Jawaid software engineer",
    "frontend developer Karachi",
    "React developer Karachi",
    "Next.js developer",
    "TypeScript developer",
    "Three.js developer",
    "software engineer Pakistan",
  ],
  knowsAbout: ["React", "Next.js", "TypeScript", "Three.js", "Tailwind CSS", "Node.js", "UI/UX design", "Web performance", "Internationalisation"],
} as const;
