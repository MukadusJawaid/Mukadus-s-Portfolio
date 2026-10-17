/**
 * Colours of the 3D world: the room, the props, the lights and the laptop. Three.js and canvas code
 * need real values in JavaScript, so this is the token file for the scene; the interface itself uses
 * the CSS tokens in styles/tokens.css. (The stage background, folder colours and window buttons are
 * read from those CSS tokens at runtime, see lib/tone.ts.)
 */
export const palette = {
  white: "#ffffff",

  /** lamps, bounce light and the soft reflections */
  light: {
    sky: "#ffe6c8",
    ground: "#3a2616",
    ambient: "#ffe9d0",
    key: "#ffe1bd",
    fill: "#b9d2ff",
    envWarm: "#ffe3c0",
    envSoft: "#ffd9b0",
    nameplate: "#ffd9a0",
    screenGlow: "#b8c6ff",
  },

  wood: { desk: "#7a4a2a", panel: "#5b3a22", wall: "#1a1109", plank: "#4a3123" },
  mat: { felt: "#2b2f36", leather: "#a67c52", pores: "#1b1f26" },
  brass: { base: "#c9a04a", plateGlow: "#b8893a", plateTop: "#f0d58a", plateMid: "#d4a84c", plateBottom: "#b98f3a", rail: "#ffcf94" },
  clock: { face: "#efe6cf", hands: "#2a2118" },
  nameplate: { base: "#4a2e1b" },
  mug: { saucer: "#efe3cc", glaze: "#c9602c", coffee: "#2a160c" },
  book: { red: "#8a3b2a", gold: "#d6a23f", teal: "#3a6a62" },
  plant: { pot: "#b8743f", leafA: "#3f6b3a", leafB: "#547d44" },

  laptop: {
    body: "#c9ccd2",
    keyWell: "#14161a",
    key: "#25282e",
    pad: "#b4b8bf",
    padEdge: "#7d8189",
    hinge: "#2a2d33",
    logo: "#e9edf5",
    bezel: "#07080a",
    camera: "#1b2a1f",
  },

  /** the desktop drawn on the laptop screen */
  screen: {
    wallpaper: ["#141433", "#2c2166", "#0d4a57"],
    blobs: [
      { x: 180, y: 700, r: 520, color: "rgba(255,138,92,.34)" },
      { x: 1100, y: 120, r: 560, color: "rgba(92,200,255,.30)" },
      { x: 700, y: 760, r: 460, color: "rgba(176,120,255,.24)" },
    ],
  },
} as const;
