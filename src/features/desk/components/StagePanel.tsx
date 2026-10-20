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
import { useLoadStore } from "../store/useLoadStore";
import { useStartOnInteraction } from "../lib/useStartOnInteraction";
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
  const progress = useLoadStore((s) => s.progress);
  // the scene starts when someone is there (first move, touch or key); until then the page stays light
  const mount3d = useStartOnInteraction();

  const cur = folders[ch];
  const f = file >= 0 ? cur.files[file] : null;
  const overview = ch === 0;

  return (
    <section aria-label="Desk" className={`relative min-h-0 min-w-0 overflow-hidden rounded-[22px] bg-stage ${className}`}>
      {/* nothing of the desk is drawn until the live scene is ready: a plain stage with a small loader, then the scene fades in */}
      {!failed && mount3d && (
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
          <DeskScene onReady={() => setReady(true)} onFail={() => setFailed(true)} />
        </div>
      )}

      {!ready && !failed && (
        // The loader: Pixel floats over a soft glow above the name. A thin moving line shows that something is loading; Pixel
        // is drowsy for a moment and wide awake once the scene starts.
        <div className="absolute inset-y-0 left-0 right-0 z-[5] flex flex-col items-center justify-center gap-4 min-[992px]:left-[clamp(372px,calc(27vw+12px),532px)]" role="status">
          <div className="desk-loader-bot" data-awake={mount3d ? "" : undefined}>
            <RobotBody />
          </div>
          <p className="font-sans text-2xl font-semibold tracking-tight text-white sm:text-3xl">Mukadus Jawaid</p>
          <p className="-mt-2 font-mono text-xs uppercase tracking-[.22em] text-white/70">Frontend Engineer</p>
          {/* the line is only there once the scene is loading, and it fills with the real download progress (no endless looping) */}
          <span className="desk-loader-bar mt-2" aria-label="Loading the 3D desk" style={{ opacity: mount3d ? 1 : 0 }}>
            <i style={{ transform: `scaleX(${Math.max(0.06, progress / 100)})` }} />
          </span>
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
