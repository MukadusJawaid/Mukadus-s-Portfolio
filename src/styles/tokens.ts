/**
 * A TypeScript mirror of the few tokens needed where CSS variables do not exist: page metadata
 * (theme colour), the share image, and the favicon files. Keep these in step with styles/tokens.css.
 * Everything the browser renders reads the CSS tokens directly.
 */
export const tokens = {
  bg: "#090b0f",
  stage: "#140d08",
  /** the share image (1200x630) */
  og: {
    gradient: ["#0b0d12", "#151b36", "#0e3b45"],
    url: "#aeb8e0",
    role: "#cfd6f7",
    stack: "#7fe3d4",
    footer: "#8a93b8",
    text: "#ffffff",
  },
} as const;
