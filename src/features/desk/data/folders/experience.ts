import type { FolderInput } from "../../schemas/desk.schema";

export const experience: FolderInput = {
  id: "experience",
  line: "Where I have worked and what I have led.",
  badge: "2.5+ years experience",
  files: [
    {
      name: "cloud-primero.md",
      title: "Cloud Primero",
      size: "3.6 KB",
      kind: "ROLE",
      meta: "Dec 2025 – Present · Front-End Engineer · Karachi",
      desc: "Lead frontend for SaaS dashboards and AI products as the primary frontend engineer, shipping MVPs in as little as a month.",
      tags: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "i18n"],
      notes: [
        "Designed the frontend architecture for current and upcoming products, including bilingual support",
        "Shipped multiple MVPs from scratch to launch, owning the frontend end to end",
        "Built interfaces for AI features that consume the product's backend AI services and APIs",
        "Implemented a Three.js 3D model for the SaaS product",
        "Raised Lighthouse scores to 80+ and cut page load times",
        "Work directly with clients in daily stand-ups and weekly reviews",
      ],
      links: [],
    },
    {
      name: "tafsol-technologies.md",
      title: "Tafsol Technologies",
      size: "2.7 KB",
      kind: "ROLE",
      meta: "Jan 2024 – Dec 2025 · Associate React.js Developer · Karachi",
      desc: "Joined as an intern, grew into a Junior and then an Associate React.js Developer. Contributed to 10+ client projects and independently delivered 3–5 of them end to end.",
      tags: ["React.js", "Next.js", "REST APIs", "PWA", "i18n"],
      notes: [
        "Built Tutor Elli, a UK e-learning platform, and Melad Zone",
        "Cut load times by 30% with optimised components and API calls",
        "Shipped internationalisation for 6+ languages",
        "Delivered SEO-friendly SSR/CSR and a PWA with offline support",
        "Projects spanned e-commerce, dashboards and portals, booking and service apps, and business websites",
        "Worked in agile sprints alongside UI/UX and backend teams",
      ],
      links: [],
    },
  ],
};
