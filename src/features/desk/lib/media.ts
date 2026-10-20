"use client";

import { useSyncExternalStore } from "react";

/** SSR-safe media query hook; reports `false` on the server. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Current window width. 1440 on the server. */
export function useViewportWidth(): number {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb);
      return () => window.removeEventListener("resize", cb);
    },
    () => window.innerWidth,
    () => 1440,
  );
}

/** Current window height. 900 on the server. */
/**
 * The page height used for panel sizes. While a text field has the on-screen keyboard open the window height shrinks by the
 * keyboard's height, which must not shrink the panels (a panel that opens while the keyboard is still showing would be tiny),
 * so a shrink caused by the keyboard is ignored until the width changes or the field loses focus.
 */
let steady = 0;
let steadyW = 0;
function viewportHeightNow() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  const typing = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;
  if (w !== steadyW || h > steady || !typing) {
    steady = h;
    steadyW = w;
  }
  return steady;
}

export function useViewportHeight(): number {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb);
      window.addEventListener("focusout", cb);
      return () => {
        window.removeEventListener("resize", cb);
        window.removeEventListener("focusout", cb);
      };
    },
    viewportHeightNow,
    () => 900,
  );
}
