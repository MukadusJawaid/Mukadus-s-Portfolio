"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LazyMotion, m } from "framer-motion";
import { ArrowUpRight, Monitor, X, type LucideIcon } from "lucide-react";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { useMenuStore } from "./useMenuStore";

/** The animation engine downloads after the page is already showing. */
const features = () => import("./motionFeatures").then((x) => x.default);

type Item = { id: string; label: string; Icon: LucideIcon; hint: string };
type Social = { label: string; href: string };

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The section menu for small screens: a drawer that slides in from the right and slides out again when closed (button,
 * backdrop, Escape or choosing a section). Choosing a section is handled by the page, which glides to it.
 */
export function MenuDrawer({ items, name, socials }: { items: readonly Item[]; name: string; socials: readonly Social[] }) {
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
                <span className="sx-drawer-id">
                  <i />
                  <span>
                    <b>{name}</b>
                    <small className="sx-mono">Frontend engineer</small>
                  </span>
                </span>
                <button type="button" className="sx-burger on" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <nav className="sx-drawer-nav" aria-label="Sections">
                {items.map(({ id, label, Icon, hint }, i) => (
                  <m.a
                    key={id}
                    href={`#${id}`}
                    className={id === active ? "act" : undefined}
                    aria-current={id === active ? "true" : undefined}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease, delay: 0.1 + i * 0.05 }}
                    onClick={() => setOpen(false)}
                  >
                    <span className="sx-dn-ico">
                      <Icon aria-hidden />
                    </span>
                    <span className="sx-dn-txt">
                      <b>{label}</b>
                      <small>{hint}</small>
                    </span>
                    <ArrowUpRight className="sx-dn-go" aria-hidden />
                  </m.a>
                ))}
              </nav>
              <div className="sx-drawer-foot">
                <TransitionLink className="sx-btn pri sx-drawer-desk" href="/" label="cd ~/desk" onClick={() => setOpen(false)}>
                  <Monitor size={18} /> Open the 3D desk
                </TransitionLink>
                <div className="sx-drawer-soc">
                  {socials.map((l) => (
                    <a key={l.label} href={l.href} target={l.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
