"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Lays its children out as the page's normal grid on wide screens. On phones (768px and below) the same children become
 * a sideways carousel: wide cards with a thin peek of the next one, story-style progress bars underneath,
 * and an automatic slide every few seconds (paused while you touch it or when it is off screen). The layout switch is
 * pure CSS (see .sx-slides in site.css).
 */
export function Slides({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const items = Children.toArray(children);
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const current = useRef(0);
  const holdUntil = useRef(0);
  const glide = useRef(0);

  const slides = () => [...(box.current?.querySelectorAll<HTMLElement>(".sx-slide") ?? [])];
  const isCarousel = () => !!box.current && getComputedStyle(box.current).display === "flex";

  const centre = (i: number) => {
    const el = box.current;
    const card = slides()[i];
    if (!el || !card || !isCarousel()) return;
    const from = el.scrollLeft;
    const to = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    cancelAnimationFrame(glide.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = to;
      return;
    }
    // a quick glide of a third of a second, with snapping paused while it runs
    const t0 = performance.now();
    el.style.scrollSnapType = "none";
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 340);
      el.scrollLeft = from + (to - from) * (1 - Math.pow(1 - p, 3));
      if (p < 1) glide.current = requestAnimationFrame(step);
      else el.style.removeProperty("scroll-snap-type");
    };
    glide.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onScroll = () => {
      if (!isCarousel()) return;
      let best = 0;
      let gap = Infinity;
      slides().forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - el.scrollLeft - el.clientWidth / 2);
        if (d < gap) {
          gap = d;
          best = i;
        }
      });
      if (best !== current.current) {
        current.current = best;
        setActive(best);
      }
    };
    const hold = () => (holdUntil.current = performance.now() + 9000);
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", hold, { passive: true });
    el.addEventListener("wheel", hold, { passive: true });
    const timer = window.setInterval(() => {
      if (performance.now() < holdUntil.current || !isCarousel()) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      centre((current.current + 1) % slides().length);
    }, 3200);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("wheel", hold);
      clearInterval(timer);
      cancelAnimationFrame(glide.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div ref={box} className={`sx-slides ${className}`} style={style}>
        {items.map((c, i) => (
          <div key={i} className={`sx-slide${i === active ? " on" : ""}`}>
            {c}
          </div>
        ))}
      </div>
      <div className="sx-sdots" aria-hidden>
        {/* story-style progress: finished cards are full, the current one fills up while it waits for the next slide */}
        {items.map((_, i) => (
          <button key={i} type="button" tabIndex={-1} className={i < active ? "done" : i === active ? "on" : undefined} onClick={() => centre(i)}>
            <i key={i === active ? active : "idle"} />
          </button>
        ))}
      </div>
    </>
  );
}
