"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TerminalPanel } from "./TerminalPanel";

/**
 * Where the visible part of the page is. On an iPhone the on-screen keyboard does not resize the page, it covers it and
 * scrolls the page up to find the field, so a sheet fixed to the bottom of the page is pushed off the top of the screen.
 * Following the visual viewport keeps the sheet glued to the top of the keyboard.
 */
function useVisibleArea(active: boolean): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties>();
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    // Safari scrolls the whole page to bring a focused field into view, which moves the desk and its buttons too. Pinning the page
    // in place (and putting it back to the top if it still shifts) leaves only the sheet to react to the keyboard.
    const root = document.documentElement;
    const body = document.body;
    const before = { rootOverflow: root.style.overflow, bodyPosition: body.style.position, bodyInset: body.style.inset, bodyWidth: body.style.width };
    root.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.inset = "0";
    body.style.width = "100%";
    const update = () => {
      if (vv.offsetTop > 0 || window.scrollY > 0) window.scrollTo(0, 0);
      // Placed from the top of the visible area (so nothing depends on how the browser reports the keyboard): the sheet is as tall as
      // it wants to be, but never taller than the space above the keyboard, and its bottom edge sits on the keyboard.
      const h = Math.min(600, Math.round(vv.height * 0.82));
      setStyle({
        top: Math.round(vv.offsetTop + vv.height - h - 8),
        bottom: "auto",
        height: h,
        maxHeight: "none",
        transition: "top .28s cubic-bezier(.22,1,.36,1), height .28s cubic-bezier(.22,1,.36,1), opacity .2s",
      });
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      root.style.overflow = before.rootOverflow;
      body.style.position = before.bodyPosition;
      body.style.inset = before.bodyInset;
      body.style.width = before.bodyWidth;
      setStyle(undefined);
    };
  }, [active]);
  return style;
}

/** The terminal as a bottom sheet on small screens. Loaded only there, so wide screens never download the dialog code. */
export default function TermSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const area = useVisibleArea(open);
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        style={area}
        className="mx-auto max-w-2xl border-0 bg-transparent p-2 text-white shadow-none duration-500 data-[side=bottom]:h-[min(600px,72dvh)] data-[side=bottom]:max-h-[72dvh]"
      >
        <SheetTitle className="sr-only">Terminal</SheetTitle>
        <TerminalPanel className="h-full" onCollapse={onClose} closeAsCross />
      </SheetContent>
    </Sheet>
  );
}
