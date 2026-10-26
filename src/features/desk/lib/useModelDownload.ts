"use client";

import { useEffect, useState } from "react";

/** The 3D files and their sizes in bytes (used for the progress when the server does not say how big a file is). */
const FILES: readonly (readonly [string, number])[] = [
  ["/models/laptop.glb", 3_503_968],
  ["/models/desk.glb", 450_144],
  ["/models/plant.glb", 158_396],
  ["/models/clock.glb", 201_460],
];
const TOTAL = FILES.reduce((a, [, n]) => a + n, 0);

export type ModelDownload = {
  /** 0 to 100 */
  progress: number;
  /** all files are in the browser's cache, so the scene can start without waiting for the network */
  done: boolean;
  /** the connection is slow enough to be worth saying so */
  slow: boolean;
};

/**
 * Downloads the 3D files once `active`, reporting real progress (so the loader can show a bar) and whether the network is slow.
 * The files land in the browser's cache, so the scene's own load right after is instant. A failed download counts as done: the
 * scene reports any real problem itself.
 */
export function useModelDownload(active: boolean): ModelDownload {
  const [state, setState] = useState<ModelDownload>({ progress: 0, done: false, slow: false });

  useEffect(() => {
    if (!active) return;
    let alive = true;
    const started = performance.now();
    const got = FILES.map(() => 0);
    const set = (patch: Partial<ModelDownload>) => alive && setState((s) => ({ ...s, ...patch }));

    const update = () => {
      const bytes = got.reduce((a, b) => a + b, 0);
      const seconds = (performance.now() - started) / 1000;
      const rate = bytes / Math.max(seconds, 0.001); // bytes per second so far
      // slow: after 2 seconds, on track to need more than about 8 seconds in all
      const slow = seconds > 2 && (TOTAL - bytes) / Math.max(rate, 1) > 8;
      set({ progress: Math.min(99, Math.round((bytes / TOTAL) * 100)), slow });
    };

    const download = async ([url]: readonly [string, number], i: number) => {
      const res = await fetch(url);
      const reader = res.body?.getReader();
      if (!reader) {
        await res.arrayBuffer();
        got[i] = FILES[i][1];
        return;
      }
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        got[i] += value.byteLength;
        update();
      }
    };

    Promise.all(FILES.map(download)).then(
      () => set({ progress: 100, done: true, slow: false }),
      () => set({ done: true }),
    );
    return () => {
      alive = false;
    };
  }, [active]);

  return state;
}
