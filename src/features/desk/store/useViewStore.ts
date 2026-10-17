"use client";

import { create } from "zustand";

/** Camera actions registered by the 3D scene so overlay buttons can drive it. */
type ViewApi = {
  zoomIn: () => void;
  zoomOut: () => void;
  /** frame the whole desk, or the open screen when a folder is open */
  reset: () => void;
};

export const useViewStore = create<{ api: ViewApi | null }>()(() => ({ api: null }));
