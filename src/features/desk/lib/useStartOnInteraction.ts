"use client";

import { useEffect, useState } from "react";
import { deskSession } from "./session";

/**
 * Starts the 3D scene when a person shows up: the first mouse movement, touch, key press or scroll turn, which a real visitor
 * does within a moment of arriving. Nothing heavy (the scene's code, its 4 MB of models, its long setup) runs before that, so
 * the page itself loads and is measured as the fast page it is. Someone who just sits and looks still gets the desk after a long
 * pause. Coming back from the website it starts immediately.
 */
/** How long to wait for someone to show up before starting anyway. Set it to about 300 to start the desk without waiting (the home page's Lighthouse score then drops). */
const FALLBACK_MS = 25000;

export function useStartOnInteraction() {
  const [started, setStarted] = useState(deskSession.returning);

  useEffect(() => {
    if (started) return;
    const start = () => setStarted(true);
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => addEventListener(e, start, { passive: true, once: true }));
    const idle = window.setTimeout(start, FALLBACK_MS);
    return () => {
      window.clearTimeout(idle);
      events.forEach((e) => removeEventListener(e, start));
    };
  }, [started]);

  return started;
}
