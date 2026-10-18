"use client";

import { useCallback, useEffect, useRef } from "react";
import { m } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { folders } from "../data/folders";
import { folderTint, folderTone } from "../lib/tone";
import { useDeskStore } from "../store/useDeskStore";
import { DocumentCard } from "./DocumentCard";

/**
 * Details for the folder that was opened last. It keeps showing that folder while the panel
 * slides out, so closing never flashes an empty panel.
 * `compact` is the small-screen version: a single slim header row, so the cards get the room.
 */
export function DrawerContent({ compact = false }: { compact?: boolean }) {
  const lastCh = useDeskStore((s) => s.lastCh);
  const file = useDeskStore((s) => s.file);
  const open = useDeskStore((s) => s.ch > 0);
  const go = useDeskStore((s) => s.go);
  const toggle = useDeskStore((s) => s.toggle);
  const c = folders[lastCh];
  const badge = c.badge ? (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-caption font-semibold"
      style={{ background: folderTint(c.id, 13), borderColor: folderTint(c.id, 40), color: folderTone(c.id) }}
    >
      <span className="size-1.5 rounded-full" style={{ background: folderTone(c.id) }} aria-hidden />
      {c.badge}
    </span>
  ) : null;
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  const alignTo = useCallback((j: number, behavior: ScrollBehavior) => {
    const box = scroller.current;
    const card = cards.current[j];
    if (box && card) box.scrollTo({ top: Math.max(0, card.offsetTop - 12), behavior });
  }, []);

  // when a file is opened (on the laptop screen, in the terminal or by tapping a card), scroll its card into view;
  // opening a different folder starts again from the top. The card is aligned again when it has finished
  // expanding (see onExpanded), because the list only gets its full height then.
  useEffect(() => {
    if (file < 0) {
      if (open) scroller.current?.scrollTo({ top: 0 });
      return;
    }
    alignTo(file, "smooth");
  }, [file, lastCh, open, alignTo]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {compact ? (
        <header className="shrink-0 border-b border-white/10 px-4 pb-2.5 pt-0.5">
          <div className="flex items-center gap-3">
          <span className="size-2.5 shrink-0 rounded-full" style={{ background: folderTone(c.id), boxShadow: `0 0 10px ${folderTone(c.id)}` }} aria-hidden />
          <h2 className="text-title font-semibold capitalize leading-none text-white">{c.id}</h2>
          <span className="min-w-0 flex-1 truncate font-mono text-caption text-fg-dim">~/root/{c.id}</span>
          <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 font-mono text-caption text-fg-muted">{c.files.length} files</span>
          <Button variant="ghost" size="icon" aria-label="Close folder" onClick={() => go(0)} className="-mr-2 size-8 text-fg-muted hover:text-white">
            <X />
          </Button>
          </div>
          {badge && <div className="mt-2 pl-[22px]">{badge}</div>}
        </header>
      ) : (
        <header className="relative shrink-0 border-b border-white/10 px-7 pb-5 pt-6">
          <span className="absolute inset-y-0 left-0 w-1" style={{ background: folderTone(c.id) }} aria-hidden />
          <div className="flex items-center justify-between">
            <span className="font-mono text-small" style={{ color: folderTone(c.id) }}>
              ~/root/{c.id}
            </span>
            <Button variant="ghost" size="icon" aria-label="Close folder" onClick={() => go(0)} className="-mr-2 text-fg-muted hover:text-white">
              <X />
            </Button>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <h2 className="text-display font-semibold capitalize leading-none tracking-tight text-white">{c.id}</h2>
            <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-caption text-fg-muted">{c.files.length} files</span>
          </div>
          {badge && <div className="mt-3">{badge}</div>}
          <p className="mt-3 text-body leading-relaxed text-fg-muted">{c.line}</p>
        </header>
      )}

      <div
        ref={scroller}
        className={`relative min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--scrollbar)_transparent] [scrollbar-width:thin] ${
          compact ? "px-3 pb-6 pt-3" : "px-5 pb-8 pt-4"
        }`}
      >
        <div className="flex flex-col gap-3">
          {c.files.map((x, j) => (
            <m.div
              // restart the entrance whenever a different folder is shown
              key={`${c.id}-${x.name}`}
              ref={(el) => {
                cards.current[j] = el;
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={open ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: open ? 0.12 + j * 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
              style={!open ? { opacity: 1 } : undefined}
            >
              <DocumentCard file={x} tone={c.id} selected={j === file} onToggle={() => toggle(j)} onExpanded={() => alignTo(j, "smooth")} />
            </m.div>
          ))}
        </div>
      </div>
    </div>
  );
}
