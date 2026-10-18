"use client";

import { create } from "zustand";

/**
 * Where Pixel takes the place of the arrow: over a clickable thing on the laptop screen (`laptop`), or over a button,
 * link or card anywhere else on the desk page, such as the terminal and the details panel (`dom`).
 */
export const useBuddyStore = create<{ laptop: boolean; dom: boolean; setLaptop: (v: boolean) => void; setDom: (v: boolean) => void }>()((set) => ({
  laptop: false,
  dom: false,
  setLaptop: (laptop) => set((s) => (s.laptop === laptop ? s : { laptop })),
  setDom: (dom) => set((s) => (s.dom === dom ? s : { dom })),
}));
