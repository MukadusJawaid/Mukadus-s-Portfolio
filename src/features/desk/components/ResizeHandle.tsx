"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { terminalWidth } from "../lib/layout";
import { useViewportWidth } from "../lib/media";
import { useLayoutStore } from "../store/useLayoutStore";

/**
 * Drag handle on the terminal's right edge. Drag to resize, double-click (or Enter) to go back to
 * the automatic width, arrow keys to nudge. The chosen width is remembered between visits.
 */
export function ResizeHandle({ width }: { width: number }) {
  const setWidth = useLayoutStore((s) => s.setTerminalW);
  const setResizing = useLayoutStore((s) => s.setResizing);
  const vw = useViewportWidth();
  const drag = useRef<{ x: number; w: number } | null>(null);
  const frame = useRef(0);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, w: width };
    setResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const x = e.clientX;
    cancelAnimationFrame(frame.current); // at most one update per frame while dragging
    frame.current = requestAnimationFrame(() => setWidth(terminalWidth(vw, d.w + (x - d.x))));
  };

  const end = () => {
    if (!drag.current) return;
    drag.current = null;
    setResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") setWidth(terminalWidth(vw, width - 24));
    else if (e.key === "ArrowRight") setWidth(terminalWidth(vw, width + 24));
    else if (e.key === "Enter" || e.key === "Home") setWidth(0);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize terminal"
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to resize · double-click to reset"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={end}
      onPointerCancel={end}
      onDoubleClick={() => setWidth(0)}
      onKeyDown={onKey}
      className="group absolute inset-y-0 -right-2.5 z-10 flex w-5 cursor-col-resize touch-none items-center justify-center outline-none"
    >
      <span className="h-14 w-[3px] rounded-full bg-white/15 transition group-hover:bg-link group-focus-visible:bg-link group-active:bg-link" />
    </div>
  );
}
