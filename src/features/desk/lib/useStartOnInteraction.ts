"use client";

import { useEffect, useState } from "react";
import { deskSession } from "./session";

const EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

/**
 * Turns true the first time the visitor moves the mouse, touches or types (or after a long wait, for someone who is just
 * looking). The 3D scene is a large bundle plus a lot of setup work, so it starts once someone is actually there: the page
 * loads fast, and the loader shows meanwhile. Coming back from the website it starts at once.
 */
export function useStartOnInteraction() {
  const [started, setStarted] = useState(deskSession.returning);

  useEffect(() => {
    const start = () => setStarted(true);
    EVENTS.forEach((e) => addEventListener(e, start, { passive: true, once: true }));
    const idle = window.setTimeout(start, 12000);
    return () => {
      window.clearTimeout(idle);
      EVENTS.forEach((e) => removeEventListener(e, start));
    };
  }, []);

  return started;
}
