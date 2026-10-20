"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { RobotBody } from "@/features/robot/Robot";

/** The robot lives on wide screens only (993px and up). */
const WIDE = "(min-width: 993px)";
const subscribeWide = (cb: () => void) => {
  const m = matchMedia(WIDE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

/**
 * The website's robot. At the top of the page it sits on a perch in the hero (see .sx-bot-anchor) and watches the
 * mouse. Once you scroll it leaves the perch and becomes the cursor; back at the top it flies home. As the cursor
 * it leans into the direction it travels, smiles over links and buttons, and squashes on click.
 * On touch screens there is no pointer to follow: after the hero it docks in the bottom-right corner, looks the way you
 * are scrolling, and jumps you back to the top when tapped.
 */
export function MouseBuddy() {
  const box = useRef<HTMLDivElement>(null);
  const wide = useSyncExternalStore(subscribeWide, () => matchMedia(WIDE).matches, () => false);

  useEffect(() => {
    const el = box.current;
    if (!wide || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const touch = matchMedia("(pointer: coarse)").matches;
    const root = el.closest<HTMLElement>(".sx");
    const anchor = root?.querySelector<HTMLElement>(".sx-bot-anchor");
    const W = 56;
    const to = { x: innerWidth * 0.7, y: innerHeight * 0.6 };
    const pos = { x: to.x - W / 2, y: to.y - 34 };
    const prev = { x: pos.x };
    let lean = 0;
    let scale = 1;
    let free = scrollY > 40;
    let flightUntil = 0;
    let inside = true;
    let shown = false;
    let lastY = scrollY;
    let look = 0;
    let raf = 0;

    const setFree = (f: boolean) => {
      if (f === free) return;
      free = f;
      flightUntil = performance.now() + 900;
      root?.classList.toggle("has-buddy", free && !touch);
      el.classList.toggle("free", free);
      el.classList.toggle("dock", free && touch);
      if (!free) el.classList.remove("happy");
    };
    // it leaves its perch once you start scrolling, and returns when you are back at the top (with a margin so it never flickers)
    const onScroll = () => setFree(free ? scrollY > 12 : scrollY > 40);

    const loop = () => {
      const a = free ? undefined : anchor?.getBoundingClientRect();
      const home = !free && a && a.width > 0;
      // on a touch screen it docks in the bottom-right corner instead of following a pointer
      // while a project preview is active the mouse is inside an embedded page (the robot hears nothing from it, and would be
      // left stranded), so it waits beside the active project in the list on the left until the preview is released
      const listItem = free && !touch ? document.querySelector<HTMLElement>(".sx-live-on") && root?.querySelector<HTMLElement>(".sx-index a.on") : null;
      const li = listItem?.getBoundingClientRect();
      const waiting = Boolean(li && li.width > 0 && li.bottom > 70 && li.top < innerHeight - 40);
      const cx = waiting ? Math.max(24, li!.left - 34) : home ? a.left + a.width / 2 : touch ? innerWidth - 40 : to.x;
      const cy = waiting ? li!.top + li!.height / 2 : home ? a.top + a.height / 2 : touch ? innerHeight - 92 : to.y;
      // smaller as the cursor, so it covers as little of the page as possible
      const goal = home ? a.width / W : 0.78;
      const speed = performance.now() < flightUntil ? 0.1 : home ? 0.25 : 0.38;
      const tx = cx - W / 2;
      const ty = cy - 33.5;
      pos.x += (tx - pos.x) * speed;
      pos.y += (ty - pos.y) * speed;
      scale += (goal - scale) * 0.12;
      const vx = pos.x - prev.x;
      prev.x = pos.x;
      lean += (Math.max(-18, Math.min(18, vx * 1.1)) - lean) * 0.25;

      let ex: number, ey: number;
      if (home) {
        // on its perch the eyes follow the mouse
        const dx = to.x - cx;
        const dy = to.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 180) * 3.4;
        ex = (dx / d) * k;
        ey = (dy / d) * k;
      } else if (waiting) {
        // waiting beside the list: it looks across at the preview it is watching
        ex = 3;
        ey = 0;
      } else if (touch) {
        // docked: the eyes look the way the page is scrolling
        look += (Math.max(-1, Math.min(1, (scrollY - lastY) / 12)) - look) * 0.15;
        lastY = scrollY;
        ex = 0;
        ey = look * 3.4;
      } else {
        // as the cursor they look where the robot is heading
        const dx = tx - pos.x;
        const dy = ty - pos.y;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 24) * 3.4;
        ex = (dx / d) * k;
        ey = (dy / d) * k;
      }
      el.style.setProperty("--ex", `${ex.toFixed(2)}px`);
      el.style.setProperty("--ey", `${ey.toFixed(2)}px`);
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${lean.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      const show = Boolean(home) || inside || touch || waiting;
      if (show !== shown) {
        shown = show;
        el.classList.toggle("on", show);
      }
      raf = requestAnimationFrame(loop);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      to.x = e.clientX;
      to.y = e.clientY;
      inside = true;
      if (free) el.classList.toggle("happy", Boolean((e.target as Element | null)?.closest("a, button, [role=button]")));
    };
    const leave = () => (inside = false);
    // a click squashes it for a moment. It lets go by itself, because the release can happen inside an embedded page (which
    // the parent never hears about) and the robot would stay flattened
    let letGo = 0;
    const up = () => {
      clearTimeout(letGo);
      el.classList.remove("squash");
    };
    const down = () => {
      el.classList.add("squash");
      clearTimeout(letGo);
      letGo = window.setTimeout(up, 260);
    };
    // tapping the docked robot takes you back to the top
    const tap = () => {
      if (touch && free) scrollTo({ top: 0, behavior: "smooth" });
    };
    el.addEventListener("click", tap);

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    addEventListener("blur", up);
    root?.classList.toggle("has-buddy", free && !touch);
    el.classList.toggle("free", free);
    el.classList.toggle("dock", free && touch);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("click", tap);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      removeEventListener("blur", up);
      clearTimeout(letGo);
      root?.classList.remove("has-buddy");
    };
  }, [wide]);

  if (!wide) return null;

  return (
    <div ref={box} className="sx-buddy" aria-hidden>
      <RobotBody />
    </div>
  );
}
