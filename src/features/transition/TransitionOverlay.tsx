"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { shell } from "@/features/desk/data/scene3d";
import { useTransitionStore } from "./useTransitionStore";
import "./transition.css";

/** how long the panel takes to fade in and out (matches transition.css), and the least time it stays up so the typing finishes */
const FADE_IN = 220;
const FADE_OUT = 320;
const MIN_HOLD = 700;

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
const frame = () => new Promise<void>((res) => requestAnimationFrame(() => res()));

/** The floating shapes: position, size, colour (a design token), corner shape and start delay. */
const SHAPES = [
  { x: "8%", y: "18%", s: 74, c: "var(--folder-skills)", r: "22px", d: 0 },
  { x: "82%", y: "14%", s: 54, c: "var(--folder-projects)", r: "50%", d: 0.6 },
  { x: "70%", y: "72%", s: 88, c: "var(--folder-education)", r: "26px", d: 0.2 },
  { x: "14%", y: "70%", s: 46, c: "var(--folder-about)", r: "50%", d: 1.1 },
  { x: "46%", y: "10%", s: 34, c: "var(--ice)", r: "10px", d: 0.9 },
  { x: "90%", y: "46%", s: 40, c: "var(--folder-experience)", r: "50%", d: 0.4 },
  { x: "30%", y: "86%", s: 58, c: "var(--ice)", r: "18px", d: 1.4 },
] as const;

/**
 * Mounted once in the root layout, so it is ready before anyone can click, and it survives the route change. A panel with a
 * pattern and floating shapes fades in over the page and types a terminal command (`cd ~/website`), the route changes
 * underneath it, and the panel fades out on the new page. It is plain CSS (opacity and transform only), so it stays smooth
 * even while the next page is busy starting up.
 */
export function TransitionOverlay() {
  const request = useTransitionStore((s) => s.request);
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const arrived = useRef<(() => void) | null>(null);
  const busy = useRef(false);

  // the new route has rendered
  useEffect(() => {
    arrived.current?.();
    arrived.current = null;
  }, [pathname]);

  useEffect(() => {
    const el = panel.current;
    if (!request || !el || busy.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(request.href);
      useTransitionStore.setState({ request: null });
      return;
    }
    busy.current = true;

    (async () => {
      el.dataset.state = "in";
      // the new page holds its big name (hero letters) until the panel lifts, so the name animation plays in view, not under the panel
      document.documentElement.dataset.reveal = "wait";
      await wait(FADE_IN);
      const shownAt = performance.now();
      const landed = new Promise<void>((res) => (arrived.current = res));
      router.push(request.href);
      // wait for the route to render (never longer than 4s), then two frames so the new page has painted
      await Promise.race([landed, wait(4000)]);
      await frame();
      await frame();
      // let the typing finish before the panel goes away
      await wait(Math.max(0, MIN_HOLD - (performance.now() - shownAt)));
      window.scrollTo(0, 0);
      el.dataset.state = "out";
      delete document.documentElement.dataset.reveal;
      await wait(FADE_OUT);
      el.dataset.state = "idle";
      busy.current = false;
      useTransitionStore.setState({ request: null });
    })();
  }, [request, router]);

  const label = request?.label ?? "";

  return (
    <div ref={panel} data-state="idle" aria-hidden className="tr-panel">
      <div className="tr-grid" />
      <div className="tr-dots" />
      {SHAPES.map((s, i) => (
        <i key={i} className="tr-shape" style={{ "--x": s.x, "--y": s.y, "--s": `${s.s}px`, "--c": s.c, "--r": s.r, "--d": `${s.d}s` } as CSSProperties} />
      ))}
      <span className="tr-sweep" />
      <p className="tr-card">
        <span className="tr-ok">{shell.user}</span> <span className="tr-link">~</span> <span className="tr-ok">%</span>{" "}
        {/* keyed by the request, so the typing starts over every time */}
        <span key={request?.id} className="tr-type" style={{ "--n": label.length } as CSSProperties}>
          {label}
        </span>
        <span className="tr-caret" />
      </p>
    </div>
  );
}
