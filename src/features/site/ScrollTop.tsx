"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** A round button in the bottom-right corner that brings you back to the top once you have scrolled a good way down. */
export function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(scrollY > 700);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`sx-top${show ? " show" : ""}`}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      onClick={() => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
    >
      <ArrowUp size={20} />
    </button>
  );
}
