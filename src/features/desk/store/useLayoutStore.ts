"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type LayoutState = {
  /** custom terminal width in px on wide screens, 0 = automatic (a share of the window) */
  terminalW: number;
  /** true while the visitor is dragging the terminal's edge */
  resizing: boolean;
  /** narrow screens: the terminal sheet is open, remembered together with the folder it was opened in so that
   *  it closes by itself as soon as a folder opens or closes (null = closed) */
  termSheetCh: number | null;
  /** narrow screens: the details panel is expanded to near full height */
  sheetExpanded: boolean;
  setTerminalW: (w: number) => void;
  setResizing: (r: boolean) => void;
  openTermSheet: (ch: number) => void;
  closeTermSheet: () => void;
  toggleSheetExpanded: () => void;
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      terminalW: 0,
      resizing: false,
      termSheetCh: null,
      sheetExpanded: false,
      setTerminalW: (terminalW) => set({ terminalW }),
      setResizing: (resizing) => set({ resizing }),
      openTermSheet: (termSheetCh) => set({ termSheetCh }),
      closeTermSheet: () => set({ termSheetCh: null }),
      toggleSheetExpanded: () => set((s) => ({ sheetExpanded: !s.sheetExpanded })),
    }),
    {
      name: "desk-layout",
      // only the chosen terminal width is worth keeping between visits
      partialize: (s) => ({ terminalW: s.terminalW }),
      skipHydration: true,
    },
  ),
);
