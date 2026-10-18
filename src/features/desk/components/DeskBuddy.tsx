"use client";

import { useEffect, useRef } from "react";
import { RobotBody } from "@/features/robot/Robot";
import { useBuddyStore } from "../store/useBuddyStore";

/** what counts as "something you can click" outside the 3D screen: buttons, links, tabs, summaries, cards */
const CLICKABLE = "a[href], button:not(:disabled), [role=button], [role=tab], summary";

/** where the pointer was last seen, so the robot appears right under it */
const last = { x: -100, y: -100 };

/**
 * Pixel on the 3D desk page. Over anything clickable (the folders and files on the laptop screen, the terminal's buttons,
 * the details panel) the arrow disappears and the robot sits on the pointer instead: it leans the way you move, smiles,
 * and squashes when you click. Everywhere else, and for text fields, the normal cursor is used. Mouse and trackpad
 * only; with touch or "reduce motion" nothing changes.
 */
export function DeskBuddy() {
  const box = useRef<HTMLDivElement>(null);
  const hot = useBuddyStore((s) => s.laptop || s.dom);

  // notice clickable things under the pointer anywhere on the page, and hide the arrow over them
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("has-robot");
    const move = (e: PointerEvent) => {
      last.x = e.clientX;
      last.y = e.clientY;
      useBuddyStore.getState().setDom(Boolean((e.target as Element | null)?.closest?.(CLICKABLE)));
    };
    const leave = () => useBuddyStore.getState().setDom(false);
    addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave);
    return () => {
      removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
      root.classList.remove("has-robot");
      useBuddyStore.getState().setDom(false);
    };
  }, []);

  // while it is shown, the robot follows the pointer
  useEffect(() => {
    const el = box.current;
    if (!el || !hot) return;
    const to = { x: last.x, y: last.y };
    const pos = { x: last.x, y: last.y };
    let lean = 0;
    let prevX = pos.x;
    let raf = 0;

    const loop = () => {
      to.x = last.x;
      to.y = last.y;
      pos.x += (to.x - pos.x) * 0.4;
      pos.y += (to.y - pos.y) * 0.4;
      const vx = pos.x - prevX;
      prevX = pos.x;
      lean += (Math.max(-16, Math.min(16, vx * 1.1)) - lean) * 0.25;
      // the eyes look where the robot is heading
      const dx = to.x - pos.x;
      const dy = to.y - pos.y;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 20) * 3.2;
      el.style.setProperty("--ex", `${((dx / d) * k).toFixed(2)}px`);
      el.style.setProperty("--ey", `${((dy / d) * k).toFixed(2)}px`);
      el.style.transform = `translate3d(${pos.x - 28}px, ${pos.y - 34}px, 0) rotate(${lean.toFixed(2)}deg) scale(0.72)`;
      raf = requestAnimationFrame(loop);
    };
    const down = () => el.classList.add("squash");
    const up = () => el.classList.remove("squash");

    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
    };
  }, [hot]);

  // decoration only, so it is hidden from screen readers
  return hot ? (
    <div ref={box} className="sx-buddy on happy" aria-hidden>
      <RobotBody />
    </div>
  ) : null;
}
