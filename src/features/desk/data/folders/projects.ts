import type { FolderInput } from "../../schemas/desk.schema";

export const projects: FolderInput = {
  id: "projects",
  line: "AI products and web apps I have designed and built.",
  files: [
    {
      name: "wattwise.md",
      title: "Wattwise",
      size: "4.8 KB",
      kind: "PROJECT",
      meta: "Women Tech Quest 2026 (10Pearls) · AI",
      desc: "AI web app that reads a photo of an electricity bill, extracts every charge and tax, and answers questions in plain language.",
      tags: ["AI", "Web app"],
      notes: [
        "Works with K-Electric, LESCO and IESCO bills",
        "Self-checks the totals before showing results",
        "Explains charges and taxes in plain language",
      ],
      links: [{ t: "Live ↗", slug: "wattwise", url: "https://wtq26-mukadus-jawaid.vercel.app/", primary: true }],
    },
    {
      name: "capra-vision.md",
      title: "Capra Vision",
      size: "5.2 KB",
      kind: "PROJECT",
      meta: "Final year project · AI",
      desc: "Identifies goat breeds from a single photo with an AI model.",
      tags: ["React Native", "Node.js", "Figma", "AI"],
      notes: [
        "Mobile app in React Native with a Node.js backend",
        "Interface designed in Figma before it was built",
        "Earned top innovation scores",
      ],
      links: [
        { t: "Behance ↗", slug: "capra-behance", url: "https://www.behance.net/gallery/257228885/Capra-Vision-AI-Goat-Breed-Identifier", primary: true },
        { t: "Figma ↗", slug: "capra-figma", url: "https://www.figma.com/design/AVgqvK84OQATFSJjOn7Xn9/Capra-Vision?t=aoltPx4tRU9kwz1H-0", primary: false },
      ],
    },
    {
      name: "caropedia.md",
      title: "Caropedia",
      size: "3.0 KB",
      kind: "PROJECT",
      meta: "Personal project",
      desc: "Car catalogue web app for browsing models and their specs, built end to end.",
      tags: ["Web app", "Personal"],
      notes: ["Personal project, built end to end"],
      links: [{ t: "Live ↗", slug: "caropedia", url: "https://caropedia-by-mj.vercel.app/", primary: true }],
    },
  ],
};
