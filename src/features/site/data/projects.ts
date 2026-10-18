/**
 * The detailed side of each project on the website. The short card text (title, summary, tags) still
 * comes from features/desk/data/folders/projects.ts; this file adds everything visual and long-form.
 * `id` is the desk file name, e.g. "wattwise.md".
 *
 * To add material, edit the entry for your project:
 *   screens  put images in public/projects/<slug>/ and list them as "/projects/<slug>/home.png"
 *   live     a website to preview inside the card (many sites refuse to be embedded: use screens then)
 *   figma    a Figma file or prototype link; it is embedded with Figma's own viewer
 */
type Embed = { url: string; title: string };

export type SiteProject = {
  id: string;
  /** a longer paragraph shown under the summary */
  story?: string;
  role?: string;
  year?: string;
  /** a still image of the site, shown while the live page is not running (it is paused during scrolling) */
  poster?: string;
  screens: { label: string; src: string; alt?: string }[];
  live?: Embed;
  figma?: Embed;
};

const entries: (Omit<SiteProject, "screens"> & Partial<Pick<SiteProject, "screens">>)[] = [
  {
    id: "wattwise.md",
    poster: "/projects/wattwise/poster.jpg",
    live: { url: "https://wtq26-mukadus-jawaid.vercel.app/", title: "Wattwise live preview" },
    figma: {
      url: "https://www.figma.com/design/u2PyvNel3qZStptkzp9n8Y/Watt-Wise?node-id=0-1&t=tbxddOHoP4IqgxVj-0",
      title: "Wattwise in Figma",
    },
  },
  {
    id: "capra-vision.md",
    figma: {
      url: "https://www.figma.com/design/AVgqvK84OQATFSJjOn7Xn9/Capra-Vision?t=aoltPx4tRU9kwz1H-0",
      title: "Capra Vision in Figma",
    },
  },
  {
    id: "caropedia.md",
    poster: "/projects/caropedia/poster.jpg",
    live: { url: "https://caropedia-by-mj.vercel.app/", title: "Caropedia live preview" },
  },
  { id: "dream-escape.md", poster: "/projects/dream-escape/poster.jpg", live: { url: "https://mukadusjawaid.github.io/DreamEscape/", title: "Dream Escape live preview" } },
  { id: "notes-keeper.md", poster: "/projects/notes-keeper/poster.jpg", live: { url: "https://noteskeeperbymukadus.web.app/", title: "Notes Keeper live preview" } },
  { id: "emojipedia.md", poster: "/projects/emojipedia/poster.jpg", live: { url: "https://mukadusjawaid.github.io/Emojipedia/", title: "Emojipedia live preview" } },
];
const siteProjects: SiteProject[] = entries.map((p) => ({ screens: [], ...p }));

export const siteProjectFor = (id: string) => siteProjects.find((p) => p.id === id);

/** Figma's embeddable viewer for a normal share link. */
export const figmaEmbed = (url: string) => `https://www.figma.com/embed?embed_host=portfolio&url=${encodeURIComponent(url)}`;
