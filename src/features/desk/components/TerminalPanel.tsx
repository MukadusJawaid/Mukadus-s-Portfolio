"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, CornerDownLeft, X } from "lucide-react";
import { folders } from "../data/folders";
import { shell } from "../data/scene3d";
import { shortPath } from "../lib/prompt";
import { useDeskStore } from "../store/useDeskStore";
import { TerminalLine } from "./TerminalLine";

type Props = {
  className?: string;
  /** wide screens only: slides the terminal away */
  onCollapse?: () => void;
  /** small-screen sheet: the hide button is a cross, since the panel comes up from the bottom rather than sliding left */
  closeAsCross?: boolean;
};

export function TerminalPanel({ className = "", onCollapse, closeAsCross }: Props) {
  const ch = useDeskStore((s) => s.ch);
  const log = useDeskStore((s) => s.log);
  const run = useDeskStore((s) => s.run);
  const go = useDeskStore((s) => s.go);
  const openDoc = useDeskStore((s) => s.openDoc);
  const cur = folders[ch];
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  // like a real terminal, it takes keystrokes as soon as it is open. In the small-screen sheet, wait for the sheet's
  // own focus handling to finish first.
  const hasCollapse = Boolean(onCollapse);
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), hasCollapse ? 0 : 350);
    return () => clearTimeout(t);
  }, [hasCollapse]);

  // the prompt sits right after the last line, so keep it in view as the history grows
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  const path = shortPath(ch ? `root/${cur.id}` : "root");
  const quick = ch ? ["ls", "cd ..", "help", "clear"] : ["ls", ...folders.slice(1).map((f) => `cd ${f.id}`), "help"];

  return (
    <section
      aria-label="Terminal"
      className={`flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-panel/95 shadow-2xl ${className}`}
    >
      {/* window chrome */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-white/[.07] px-4">
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-2.5 rounded-full bg-window-close" />
          <i className="size-2.5 rounded-full bg-window-minimize" />
          <i className="size-2.5 rounded-full bg-window-zoom" />
        </span>
        <span className="min-w-0 flex-1 truncate text-center font-mono text-caption text-fg-dim">mukadusjawaid — portfolio — zsh</span>
        {onCollapse ? (
          <button
            onClick={onCollapse}
            aria-label={closeAsCross ? "Close terminal" : "Hide terminal"}
            title={closeAsCross ? "Close" : "Hide terminal"}
            className="-mr-1 grid size-7 place-items-center rounded-md text-fg-dim transition hover:bg-white/10 hover:text-white"
          >
            {closeAsCross ? <X className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        ) : (
          <span className="size-7" aria-hidden />
        )}
      </div>

      {/* quick commands */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/[.07] px-4 py-2.5 [scrollbar-width:none]">
        {quick.map((k) => (
          <button
            key={k}
            onClick={() => {
              run(k);
              inputRef.current?.focus({ preventScroll: true });
            }}
            className="shrink-0 rounded-full border border-white/10 bg-white/[.04] px-3 py-1 font-mono text-caption text-fg-secondary transition hover:border-link/50 hover:bg-link/10 hover:text-white"
          >
            {k}
          </button>
        ))}
      </div>

      {/* history, with the prompt as its last line like in a real terminal; clicking anywhere focuses it */}
      <div
        ref={feedRef}
        onClick={(e) => {
          // clicking links, buttons or the prompt itself keeps its own behaviour; selecting text must not steal focus
          if ((e.target as HTMLElement).closest("button, a, input") || window.getSelection()?.toString()) return;
          inputRef.current?.focus({ preventScroll: true });
        }}
        className="min-h-0 flex-1 cursor-text overflow-y-auto px-4 py-4 font-mono text-caption leading-[1.6] [scrollbar-color:var(--scrollbar)_transparent] [scrollbar-width:thin]"
      >
        {log.map((l, i) => (
          <TerminalLine key={i} line={l} onGo={go} onFile={openDoc} />
        ))}

        <form
          className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-0.5 first:mt-0"
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
          }}
        >
          <label htmlFor="cmd" className="flex shrink-0 flex-wrap items-baseline gap-x-2">
            <span className="text-ok">
              {shell.user}@{shell.host}
            </span>
            <span className="text-link">{path}</span>
            <span className="text-ok">%</span>
          </label>
          {/* below 992px iOS zooms into inputs under 16px, so the field is 16px and scaled down to match the history text */}
          <div className="relative h-7 min-w-[9rem] flex-1">
            <input
              id="cmd"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              // like a real terminal: Ctrl+L (or Cmd+K on a Mac) clears the screen
              onKeyDown={(e) => {
                if ((e.ctrlKey && e.key === "l") || (e.metaKey && e.key === "k")) {
                  e.preventDefault();
                  run("clear");
                }
              }}
              className="absolute left-0 top-0 h-full w-full bg-transparent text-caption max-[991px]:h-[139%] max-[991px]:w-[139%] max-[991px]:origin-top-left max-[991px]:scale-[.72] max-[991px]:text-[16px] text-white caret-ok outline-none placeholder:text-fg-ghost"
              placeholder="type a command, or try help"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button
            type="submit"
            aria-label="Send command"
            title="Send"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[.06] text-fg-secondary transition hover:border-link/50 hover:text-white lg:hidden"
          >
            <CornerDownLeft className="size-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
