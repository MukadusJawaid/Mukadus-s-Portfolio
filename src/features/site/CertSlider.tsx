"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { certificates } from "./data/certificates";

/**
 * The certificates as a slider: big cards that snap into place, previous / next buttons, and a progress bar that
 * follows the scroll. Each card opens the full-size image in a new tab. Previews are small copies (public/certs/thumb).
 */
export function CertSlider() {
  const row = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ max: 0, ratio: 0 });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const read = () => {
      const max = el.scrollWidth - el.clientWidth;
      setPos({ max, ratio: max > 0 ? el.scrollLeft / max : 0 });
    };
    read();
    el.addEventListener("scroll", read, { passive: true });
    addEventListener("resize", read);
    return () => {
      el.removeEventListener("scroll", read);
      removeEventListener("resize", read);
    };
  }, []);

  const go = (dir: -1 | 1) => {
    const el = row.current;
    const card = el?.querySelector<HTMLElement>("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 14), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <div className="sx-cslider">
      <div className="sx-cbar">
        <span className="sx-cprog" aria-hidden>
          <b style={{ transform: `scaleX(${certificates.length ? Math.max(0.12, (pos.ratio * (certificates.length - 1) + 1) / certificates.length) : 0})` }} />
        </span>
        <span className="sx-carrows">
          <button type="button" onClick={() => go(-1)} disabled={pos.ratio <= 0.01} aria-label="Previous certificate">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => go(1)} disabled={pos.max > 0 && pos.ratio >= 0.99} aria-label="Next certificate">
            <ChevronRight size={18} />
          </button>
        </span>
      </div>
      <ul className="sx-certs" ref={row}>
        {certificates.map((c) => (
          <li key={c.image}>
            <a href={c.image} target="_blank" rel="noopener noreferrer" aria-label={`${c.title}, ${c.issuer}, ${c.when}`}>
              <span className="sx-cert-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image.replace("/certs/", "/certs/thumb/")} alt="" width={800} height={566} loading="lazy" decoding="async" />
                <span className="sx-cert-view">
                  View full size <ArrowUpRight size={14} />
                </span>
              </span>
              <span className="sx-cert-when sx-mono">{c.when}</span>
              <span className="sx-cert-t">{c.title}</span>
              <span className="sx-cert-m">{c.issuer}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
