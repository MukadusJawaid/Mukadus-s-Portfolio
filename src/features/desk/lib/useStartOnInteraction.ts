"use client";

import { useEffect, useState } from "react";
import { deskSession } from "./session";

const EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

/**
 * Turns true the first time the visitor moves the mouse, touches or types (or 3.5 seconds after the page loads). Used to hold back heavy work (the 3D scene)
 * until someone is actually there: the page loads fast, and a still image of the desk shows in the meantime.
 */
export function useStartOnInteraction() {
  // coming back from the website: someone is clearly here, so start straight away
  const [started, setStarted] = useState(deskSession.returning);

  useEffect(() => {
    const start = () => setStarted(true);
    EVENTS.forEach((e) => addEventListener(e, start, { passive: true, once: true }));
    // nobody moved: still start a few seconds after the page settled, so the still picture does not stay for long
    const idle = window.setTimeout(start, 3500);
    return () => {
      window.clearTimeout(idle);
      EVENTS.forEach((e) => removeEventListener(e, start));
    };
  }, []);

  return started;
}
