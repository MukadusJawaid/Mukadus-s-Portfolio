"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { ArrowLeft, Globe, Minus, Plus, ScanSearch, SquareTerminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { folders } from "../data/folders";
import { RobotBody } from "@/features/robot/Robot";
import { DeskBuddy } from "./DeskBuddy";
import { useStageInsets } from "../lib/insets";
import { folderTone } from "../lib/tone";
import { useDeskStore } from "../store/useDeskStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { useViewStore } from "../store/useViewStore";

const DeskScene = dynamic(() => import("../scene3d/DeskScene"), { ssr: false });

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function StagePanel({ className = "" }: { className?: string }) {
  const ch = useDeskStore((s) => s.ch);
  const file = useDeskStore((s) => s.file);
  const go = useDeskStore((s) => s.go);
  const terminal = useDeskStore((s) => s.terminal);
  const toggleTerminal = useDeskStore((s) => s.toggleTerminal);
  const view = useViewStore((s) => s.api);
  // floating panels (terminal left and details right on wide screens, details at the bottom on narrow ones): keep our overlay UI clear of them
  const { wide, left, right, bottom } = useStageInsets();
  const openTermSheet = useLayoutStore((s) => s.openTermSheet);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const cur = folders[ch];
  const f = file >= 0 ? cur.files[file] : null;
  const overview = ch === 0;

  return (
    <section aria-label="Desk" className={`relative min-h-0 min-w-0 overflow-hidden rounded-[22px] bg-stage ${className}`}>
      {/* nothing of the desk is drawn until the live scene is ready: a plain stage with a small loader, then the scene fades in */}
      {!failed && (
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
          <DeskScene onReady={() => setReady(true)} onFail={() => setFailed(true)} />
        </div>
      )}

      {!ready && !failed && (
        // while the scene loads: Pixel bobs above the name, with a thin progress line that keeps moving
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[5] flex -translate-y-1/2 flex-col items-center gap-3" style={{ left, right }} role="status">
          <div className="desk-loader-bot">
            <RobotBody />
          </div>
          <p className="font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">Mukadus Jawaid</p>
          <p className="font-mono text-xs text-white/60">setting up the 3D desk…</p>
          <span className="desk-loader-bar" aria-hidden />
        </div>
      )}

      {/* no WebGL: the same navigation as a simple list */}
      {failed && (
        <div className="absolute inset-0 grid place-content-center gap-3 p-6 sm:grid-cols-2">
          {folders.slice(1).map((c, i) => (
            <Button
              key={c.id}
              variant="outline"
              onClick={() => go(i + 1)}
              className="h-24 w-48 justify-start border-white/15 bg-white/5 px-5 font-mono text-base"
              style={{ color: folderTone(c.id) }}
            >
              /{c.id}
            </Button>
          ))}
        </div>
      )}

      {/* keyboard / screen-reader navigation for the 3D screen */}
      <nav className="sr-only" aria-label="Folders">
        {folders.slice(1).map((c, i) => (
          <button key={c.id} onClick={() => go(i + 1)}>
            Open {c.id}
          </button>
        ))}
      </nav>

      <DeskBuddy />

      <div className="pointer-events-none absolute inset-0 z-[3] opacity-[.12] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      <div className="pointer-events-none absolute inset-0 z-[3] [background:radial-gradient(ellipse_80%_75%_at_50%_50%,transparent_55%,var(--vignette)_100%)]" />

      <div
        className="absolute top-3 z-[6] flex items-center gap-2 transition-[left,right] duration-500 sm:top-5"
        style={{ left: left + 14, right: right + 14 }}
      >
        {(!wide || !terminal) && (
          <Button
            variant="outline"
            onClick={() => (wide ? toggleTerminal() : openTermSheet(ch))}
            aria-label="Show terminal"
            className="h-9 shrink-0 rounded-full border-white/15 bg-black/30 px-3 font-mono text-xs backdrop-blur-md hover:bg-white/10 lg:h-10 lg:text-body-sm"
          >
            <SquareTerminal /> <span className="hidden sm:inline">terminal</span>
          </Button>
        )}
        {!overview && (
          <Button
            variant="outline"
            onClick={() => go(0)}
            className="h-9 shrink-0 rounded-full border-white/15 bg-black/30 px-3 font-mono text-xs backdrop-blur-md hover:bg-white/10 lg:h-10 lg:text-body-sm"
          >
            <ArrowLeft /> <span className="hidden sm:inline">back to desk</span>
          </Button>
        )}
        <div className="pointer-events-none inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-white/15 bg-panel-chip/60 px-3 font-mono text-xs text-stage-chip-fg backdrop-blur-md lg:h-10 lg:px-4 lg:text-sm">
          <span className="size-2 shrink-0 rounded-full" style={{ background: folderTone(cur.id), boxShadow: `0 0 10px ${folderTone(cur.id)}` }} />
          <span className="truncate">
            <span className="hidden sm:inline">mukadusjawaid.dev</span>
            <span className="text-white">{overview ? "/" : `/${cur.id}${f ? "/" + f.name : ""}`}</span>
          </span>
        </div>
        <TransitionLink
          href="/site"
          label="cd ~/website"
          className="pointer-events-auto ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 font-mono text-xs text-white backdrop-blur-md transition hover:border-link/60 hover:bg-white/10 lg:h-10 lg:text-body-sm"
        >
          <Globe className="size-4" /> <span className="hidden sm:inline">go to website</span>
          <span className="sm:hidden">web</span>
        </TransitionLink>
      </div>

      {/* zoom controls and hint: centred in the free space between the panels on wide screens; on small screens the controls
          stand in a column at the right edge so they never cover the laptop screen */}
      <div
        className={cn(
          "pointer-events-none absolute z-[6] flex flex-col gap-2.5 transition-[left,right,bottom] duration-500",
          wide ? "items-center" : "items-end",
        )}
        style={wide ? { left: left + 16, right: right + 16, bottom: bottom ? bottom + 4 : 16 } : { left: 12, right: 12, bottom: (bottom || 0) + 12 }}
      >
        <div className={cn("pointer-events-auto flex gap-1 rounded-2xl border border-white/15 bg-black/40 p-1 backdrop-blur-md", !wide && "flex-col")} role="group" aria-label="Camera controls">
          {(
            [
              ["Zoom out", Minus, () => view?.zoomOut()],
              ["Zoom in", Plus, () => view?.zoomIn()],
              [overview ? "Recentre view" : "Recentre on screen", ScanSearch, () => view?.reset()],
            ] as const
          ).map(([label, Icon, run]) => (
            <Button key={label} variant="ghost" size="icon" aria-label={label} title={label} onClick={run} disabled={!view} className="text-white/80 hover:bg-white/10 hover:text-white">
              <Icon />
            </Button>
          ))}
        </div>
        <p className={cn("self-center px-2 text-center text-xs text-stage-fg sm:text-sm", !wide && bottom > 0 && "hidden")}>
          {overview ? "Drag to look around · scroll or use + − to zoom · click a folder on the laptop" : "Click a file on the laptop to read it · drag to look around"}
        </p>
      </div>
    </section>
  );
}
