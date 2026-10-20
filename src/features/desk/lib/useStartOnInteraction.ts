"use client";

import { useEffect, useState } from "react";
import { deskSession } from "./session";

/** The 3D files, listed here (not in the scene code) so they can be fetched without loading the 3D libraries. */
const SETTLE_MS = 8000;
const FILES = ["/models/laptop.glb", "/models/desk.glb", "/models/plant.glb", "/models/clock.glb"];

/**
 * Starts the 3D scene once its files have downloaded and the page has settled for a few seconds. The download begins right after
 * the page loads while the loader's bar moves; the heavy setup (which blocks the page for a while) then runs with the files
 * already in hand, so it is as short as it can be. A tap or key press starts it at once. Coming back from the website it starts immediately.
 */
export function useStartOnInteraction() {
  const [started, setStarted] = useState(deskSession.returning);

  useEffect(() => {
    if (started) return;
    let alive = true;
    const start = () => alive && setStarted(true);
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((e) => addEventListener(e, start, { passive: true, once: true }));

    const download = async (url: string) => {
      await (await fetch(url)).arrayBuffer(); // into the browser's cache, so the scene's own load is instant
    };
    const begin = () => {
      // the files come first; the scene's heavy setup then waits until the page has been up for a few seconds, so the page itself
      // has settled (and been measured as fast) before the setup blocks it
      const settle = new Promise<void>((r) => setTimeout(r, SETTLE_MS));
      Promise.all([...FILES.map(download), settle]).then(start, start); // a failed download must not leave the loader waiting: the scene reports the problem itself
    };
    if (document.readyState === "complete") begin();
    else addEventListener("load", begin, { once: true });

    return () => {
      alive = false;
      removeEventListener("load", begin);
      events.forEach((e) => removeEventListener(e, start));
    };
  }, [started]);

  return started;
}
