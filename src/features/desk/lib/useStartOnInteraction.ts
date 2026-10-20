"use client";

import { useEffect, useState } from "react";
import { deskSession } from "./session";

/**
 * Turns true a moment after the page has loaded and painted its first frame, so the loader shows first and the 3D scene starts
 * straight away: nobody has to tap or move. A tap, key press or mouse move starts it even sooner. Coming back from the website
 * it starts immediately.
 */
export function useStartOnInteraction() {
  const [started, setStarted] = useState(deskSession.returning);

  useEffect(() => {
    const start = () => setStarted(true);
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => addEventListener(e, start, { passive: true, once: true }));
    let timer = 0;
    const soon = () => (timer = window.setTimeout(start, 150));
    if (document.readyState === "complete") soon();
    else addEventListener("load", soon, { once: true });
    return () => {
      window.clearTimeout(timer);
      removeEventListener("load", soon);
      events.forEach((e) => removeEventListener(e, start));
    };
  }, []);

  return started;
}
