"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, Check, ChevronDown, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { folderTint, folderTone } from "../lib/tone";
import type { DeskFile } from "../types";

type Props = {
  file: DeskFile;
  /** id of the folder this card belongs to; its colour is the --folder-<id> token */
  tone: string;
  selected: boolean;
  onToggle: () => void;
  /** called when the expand animation has finished, so the list can re-align to this card */
  onExpanded?: () => void;
};

const isExternal = (url: string) => /^https?:/.test(url);

/** "capra-vision.md" -> "Capra vision" */
const titleOf = (name: string) => {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
};

export function DocumentCard({ file: x, tone, selected: s, onToggle, onExpanded }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        s ? "border-white/20 bg-white/[.07]" : "border-white/10 bg-white/[.03] hover:border-white/20 hover:bg-white/[.055]",
      )}
      style={s ? { boxShadow: `0 0 0 1px ${folderTint(tone, 33)}, 0 14px 40px -18px ${folderTint(tone, 40)}` } : undefined}
    >
      {/* accent edge: grows when the card is open */}
      <span className="absolute inset-y-0 left-0 transition-all duration-300" style={{ width: s ? 4 : 2, background: folderTone(tone), opacity: s ? 1 : 0.55 }} aria-hidden />

      <button onClick={onToggle} aria-expanded={s} className="flex w-full flex-col gap-3 py-4 pl-5 pr-4 text-left outline-none focus-visible:bg-white/5">
        <span className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: folderTint(tone, 14), color: folderTone(tone) }}>
            <FileText className="size-[18px]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-lead font-semibold leading-tight text-white">{x.title ?? titleOf(x.name)}</span>
            <span className="mt-0.5 block truncate font-mono text-caption text-fg-dim">{x.name}</span>
          </span>
          <span className="rounded-md px-1.5 py-0.5 font-mono text-micro font-semibold tracking-wider" style={{ background: folderTint(tone, 13), color: folderTone(tone) }}>
            {x.kind}
          </span>
        </span>

        {x.meta && <span className="text-small leading-snug text-fg-subtle">{x.meta}</span>}
        <span className="text-body leading-relaxed text-fg-body">{x.desc}</span>

        <span className="flex flex-wrap gap-1.5">
          {x.tags.map((g) => (
            <span key={g} className="rounded-md bg-white/[.07] px-2 py-0.5 font-mono text-caption text-fg-body">
              {g}
            </span>
          ))}
        </span>

        {x.notes.length > 0 && (
          <span className="flex items-center gap-1.5 text-small font-medium transition-colors" style={{ color: s ? "var(--fg-muted)" : folderTone(tone) }}>
            {s ? "Hide highlights" : `View ${x.notes.length} highlights`}
            <ChevronDown className={cn("size-3.5 transition-transform duration-300", s && "rotate-180")} aria-hidden />
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {s && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => s && onExpanded?.()}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-white/10 py-4 pl-5 pr-4">
              {x.notes.length > 0 && (
                <ul className="flex flex-col gap-2.5">
                  {x.notes.map((n) => (
                    <li key={n} className="flex gap-2.5 text-body-sm leading-relaxed text-fg-soft">
                      <span className="mt-[3px] grid size-4 shrink-0 place-items-center rounded-full" style={{ background: folderTint(tone, 15), color: folderTone(tone) }}>
                        <Check className="size-2.5" strokeWidth={3} aria-hidden />
                      </span>
                      {n}
                    </li>
                  ))}
                </ul>
              )}
              {x.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {x.links.map((l) => {
                    const download = l.url.endsWith(".pdf");
                    const Icon = download ? Download : ArrowUpRight;
                    return (
                      <a
                        key={l.slug}
                        href={l.url}
                        target={isExternal(l.url) ? "_blank" : undefined}
                        rel="noreferrer"
                        download={download ? "" : undefined}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold transition",
                          l.primary ? "text-on-accent hover:brightness-110" : "border border-white/20 bg-white/5 text-white hover:bg-white/10",
                        )}
                        style={l.primary ? { background: folderTone(tone) } : undefined}
                      >
                        {l.t.replace(/\s*[↗↓]\s*$/, "")}
                        <Icon className="size-3.5" aria-hidden />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
