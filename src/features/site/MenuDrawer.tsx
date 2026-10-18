"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LazyMotion, m } from "framer-motion";
import { Monitor, X, type LucideIcon } from "lucide-react";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { useMenuStore } from "./useMenuStore";

/** The animation engine downloads after the page is already showing. */
const features = () => import("./motionFeatures").then((x) => x.default);

type Item = { id: string; label: string; Icon: LucideIcon };

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The section menu for small screens: a drawer that slides in from the right and slides out again when closed (button,
 * backdrop, Escape or choosing a section). Choosing a section is handled by the page, which glides to it.
 */
export function MenuDrawer({ items }: { items: readonly Item[] }) {
  const open = useMenuStore((s) => s.open);
  const setOpen = useMenuStore((s) => s.setOpen);
  const [active, setActive] = useState("top");

  // the current section is the last one whose top has passed 45% of the screen height
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = "top";
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.45) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <LazyMotion features={features}>
      <AnimatePresence>
        {open && (
          <>
            <m.div
              key="bg"
              className="sx-drawer-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
            />
            <m.aside
              key="panel"
              id="sx-drawer"
              className="sx-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease }}
            >
              <div className="sx-drawer-top">
                <span className="sx-mono">Menu</span>
                <button type="button" className="sx-burger on" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <nav className="sx-drawer-nav" aria-label="Sections">
                {items.map(({ id, label, Icon }, i) => (
                  <m.a
                    key={id}
                    href={`#${id}`}
                    className={id === active ? "act" : undefined}
                    aria-current={id === active ? "true" : undefined}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease, delay: 0.12 + i * 0.05 }}
                    onClick={() => setOpen(false)}
                  >
                    <Icon aria-hidden />
                    {label}
                  </m.a>
                ))}
              </nav>
              <TransitionLink className="sx-btn pri sx-drawer-desk" href="/" label="cd ~/desk" onClick={() => setOpen(false)}>
                <Monitor size={18} /> Open the 3D desk
              </TransitionLink>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
