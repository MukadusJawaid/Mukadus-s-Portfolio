import { useState } from "react";
import { FileText, Folder } from "lucide-react";
import { shell } from "../data/scene3d";
import { shortPath } from "../lib/prompt";
import type { TermLine } from "../types";

type Props = {
  line: TermLine;
  onGo: (i: number) => void;
  onFile: (folder: string, name: string) => void;
};

const isReal = (url: string) => !url.startsWith("[");

/** "Sat Oct 17 22:39:31", the format macOS Terminal uses */
function loginStamp(d: Date) {
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", o);
  return `${part({ weekday: "short" })} ${part({ month: "short" })} ${d.getDate()} ${d.toLocaleTimeString("en-GB")}`;
}

/** The visitor's own session time, so the banner never claims a login that did not happen. */
function LoginLine() {
  const [stamp] = useState(() => loginStamp(new Date()));
  return (
    <div className="text-fg-subtle" suppressHydrationWarning>
      Last login: {stamp}
    </div>
  );
}

export function TerminalLine({ line: l, onGo, onFile }: Props) {
  switch (l.k) {
    case "login":
      return <LoginLine />;
    case "cmd":
      return (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-2 break-words first:mt-0">
          <span className="text-ok">
            {shell.user}@{shell.host}
          </span>
          <span className="text-link">{shortPath(l.path)}</span>
          <span className="text-ok">%</span>
          <span className="font-medium text-white">{l.text}</span>
        </div>
      );
    case "dir":
      return (
        <button
          onClick={() => onGo(l.to)}
          className="group flex w-full items-center gap-2.5 rounded-md px-2 py-0.5 text-left hover:bg-white/5"
        >
          <Folder className="size-3.5 shrink-0 text-link" aria-hidden />
          <span className="text-link group-hover:underline">{l.name}/</span>
          <span className="min-w-0 flex-1 truncate text-fg-faint">{l.desc}</span>
          <span className="shrink-0 text-fg-faint">{l.count}</span>
        </button>
      );
    case "file":
      return (
        <button
          onClick={() => onFile(l.folder, l.name)}
          className="group flex w-full items-center gap-2.5 rounded-md px-2 py-0.5 text-left hover:bg-white/5"
        >
          <FileText className="size-3.5 shrink-0 text-fg-muted" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-fg-soft group-hover:text-white group-hover:underline">{l.name}</span>
          <span className="shrink-0 text-fg-faint">{l.size}</span>
        </button>
      );
    case "meta":
      return <div className="pl-2 text-fg-subtle">{l.text}</div>;
    case "text":
      return <div className="whitespace-pre-wrap pl-2 text-fg-soft">{l.text}</div>;
    case "tags":
      return (
        <div className="flex flex-wrap gap-1.5 pl-2 pt-0.5">
          {l.text.split(", ").map((t) => (
            <span key={t} className="rounded bg-link/10 px-1.5 py-px text-caption text-ice">
              {t}
            </span>
          ))}
        </div>
      );
    case "ok":
      return <div className="pl-2 text-ok/90">{l.text}</div>;
    case "mute":
      return <div className="pl-2 text-fg-faint">{l.text}</div>;
    case "err":
      return <div className="pl-2 text-err">{l.text}</div>;
    case "link":
      return (
        <div className="pl-2">
          <a
            href={isReal(l.text) ? l.text : "#"}
            onClick={(e) => !isReal(l.text) && e.preventDefault()}
            target={isReal(l.text) && !l.text.startsWith("/") ? "_blank" : undefined}
            rel="noreferrer"
            className="break-all text-link underline decoration-link/40 underline-offset-4 hover:decoration-link"
          >
            ↗ {l.text}
          </a>
        </div>
      );
    case "help":
      return (
        <div className="grid grid-cols-[110px_1fr] gap-3 pl-2">
          <span className="text-link">{l.name}</span>
          <span className="text-fg-subtle">{l.desc}</span>
        </div>
      );
  }
}
