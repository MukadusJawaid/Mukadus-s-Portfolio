"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronUp, CornerDownLeft, X } from "lucide-react";
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

  // Like a real shell: the up and down arrows (or the two buttons on small screens) walk through the commands you typed
  // earlier, and the history survives "clear". Down past the newest one brings back what you were typing.
  const past = useRef<string[]>([]);
  const lastCmd = useRef<unknown>(null);
  const at = useRef(-1);
  const draft = useRef("");
  useEffect(() => {
    const last = log.findLast((l) => l.k === "cmd");
    if (last && last !== lastCmd.current && last.k === "cmd") {
      lastCmd.current = last;
      if (last.text.trim() && past.current.at(-1) !== last.text) past.current.push(last.text);
    }
  }, [log]);
  const step = (dir: -1 | 1) => {
    const list = past.current;
    if (!list.length) return;
    if (at.current < 0) draft.current = value;
    if (dir < 0) at.current = at.current < 0 ? list.length - 1 : Math.max(0, at.current - 1);
    else at.current = at.current >= 0 && at.current < list.length - 1 ? at.current + 1 : -1;
    setValue(at.current < 0 ? draft.current : list[at.current]);
    inputRef.current?.focus({ preventScroll: true });
  };

  // the arrows work even when the prompt is not focused (as long as the terminal is showing and you are not typing elsewhere)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
      const field = inputRef.current;
      if (!field || field.closest("[inert]") || !field.offsetParent) return;
      e.preventDefault();
      step(e.key === "ArrowUp" ? -1 : 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  // Tab finishes what you started: commands, folder names after "cd", file names after "cat"
  const complete = () => {
    const m = /^(\S*)(?:\s+(\S*))?$/.exec(value.trimStart());
    if (!m) return;
    const [, word, arg] = m;
    const pool = arg === undefined ? ["ls", "cd", "cat", "clear", "help"] : word === "cd" ? ["..", ...folders.slice(1).map((f) => f.id)] : word === "cat" ? cur.files.map((f) => f.name) : [];
    const typed = arg ?? word;
    const hits = pool.filter((p) => p.startsWith(typed));
    if (!hits.length) return;
    let common = hits[0];
    for (const h of hits) while (!h.startsWith(common)) common = common.slice(0, -1);
    setValue(arg === undefined ? (hits.length === 1 ? `${common} ` : common) : `${word} ${common}`);
  };

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
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-panel/95 shadow-2xl ${className}`}
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
        className="min-h-0 flex-1 cursor-text overflow-y-auto px-4 py-4 max-lg:pb-20 font-mono text-caption leading-[1.6] [scrollbar-color:var(--scrollbar)_transparent] [scrollbar-width:thin]"
      >
        {log.map((l, i) => (
          <TerminalLine key={i} line={l} onGo={go} onFile={openDoc} />
        ))}

        <form
          id="term-form"
          className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-0.5 first:mt-0"
          onSubmit={(e) => {
            e.preventDefault();
            const typed = value.trim();
            if (typed && past.current.at(-1) !== typed) past.current.push(typed); // also commands such as "clear", which wipe the log
            const before = useDeskStore.getState();
            run(value);
            setValue("");
            at.current = -1;
            // a command that opens a folder or a file leads to the details panel: put the keyboard away so the panel gets the whole screen
            const after = useDeskStore.getState();
            if (after.ch !== before.ch || after.file !== before.file) inputRef.current?.blur();
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
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  step(e.key === "ArrowUp" ? -1 : 1);
                  return;
                }
                if (e.key === "Tab" && value.trim()) {
                  e.preventDefault();
                  complete();
                  return;
                }
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
        </form>
      </div>
      {/* small screens: history and send buttons stay in the bottom-right corner of the terminal, out of the typing line */}
      <div className="absolute bottom-3 right-3 z-10 flex gap-1 rounded-2xl border border-white/10 bg-panel/90 p-1 backdrop-blur-md lg:hidden">
        {(
          [
            ["Previous command", -1, ChevronUp],
            ["Next command", 1, ChevronDown],
          ] as const
        ).map(([label, dir, Icon]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => step(dir)}
            className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[.06] text-fg-secondary transition hover:border-link/50 hover:text-white active:scale-95"
          >
            <Icon className="size-4" />
          </button>
        ))}
        <button
          type="submit"
          form="term-form"
          aria-label="Send command"
          title="Send"
          className="grid size-9 place-items-center rounded-xl border border-link/40 bg-link/15 text-link transition hover:text-white active:scale-95"
        >
          <CornerDownLeft className="size-4" />
        </button>
      </div>
    </section>
  );
}
