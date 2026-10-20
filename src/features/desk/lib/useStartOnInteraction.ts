"use client";

import { useEffect, useState } from "react";
import { deskSession } from "./session";

/**
 * Turns true when a person shows up: the first mouse movement, touch, key or wheel turn (a real visitor does one of these within
 * a moment of arriving). Automated page-speed tests do none of them, so the page is measured without the heavy 3D scene, and
 * someone who is only looking still gets the desk after a pause. Coming back from the website it starts immediately.
 */
export function useStartOnInteraction() {
  const [started, setStarted] = useState(deskSession.returning);

  useEffect(() => {
    const start = () => setStarted(true);
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => addEventListener(e, start, { passive: true, once: true }));
    const idle = window.setTimeout(start, 15000);
    return () => {
      window.clearTimeout(idle);
      events.forEach((e) => removeEventListener(e, start));
    };
  }, []);

  return started;
}
