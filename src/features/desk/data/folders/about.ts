import type { FolderInput } from "../../schemas/desk.schema";

export const about: FolderInput = {
  id: "about",
  line: "Who I am and how to reach me.",
  files: [
    {
      name: "bio.md",
      title: "Bio",
      size: "1.9 KB",
      kind: "MARKDOWN",
      meta: "Karachi, Pakistan",
      desc: "Software engineer with 2.5+ years of experience. I graduated from Sir Syed University with a bachelor's in Software Engineering, and I have a keen eye for design.",
      tags: ["Frontend", "Design", "Animation", "Three.js"],
      notes: [
        "Bachelor's in Software Engineering from Sir Syed University",
        "Diploma in Graphic & Web Design (GDWD) from Arena Multimedia",
        "A keen eye for design, and strong with responsive layouts and animation",
        "Recently learned Three.js, and I enjoy picking up new technologies",
        "Built a mobile app with React Native and Expo, and integrated the Claude API",
        "Take MVPs from idea to launch in as little as 1 month",
        "Open to frontend, full-stack and software engineering roles: on-site, hybrid or remote",
      ],
      links: [],
    },
    {
      name: "contact.json",
      title: "Contact",
      size: "0.4 KB",
      kind: "JSON",
      meta: "mukadus.jawaid.dev@gmail.com",
      desc: "Email is the best way to reach me. GitHub, LinkedIn and my portfolio are below.",
      tags: ["Contact"],
      notes: ["Based in Karachi, Pakistan"],
      links: [
        { t: "Email ↗", slug: "email", url: "mailto:mukadus.jawaid.dev@gmail.com", primary: true },
        { t: "GitHub ↗", slug: "github", url: "https://github.com/MukadusJawaid", primary: false },
        { t: "LinkedIn ↗", slug: "linkedin", url: "https://www.linkedin.com/in/mukadusjawaid/", primary: false },
        { t: "Behance ↗", slug: "behance", url: "https://www.behance.net/mukadusjawaid", primary: false },
      ],
    },
  ],
};
