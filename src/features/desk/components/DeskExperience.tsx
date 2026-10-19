"use client";

import { Fragment, useEffect } from "react";
import { m } from "framer-motion";
import dynamic from "next/dynamic";
import { useStageInsets } from "../lib/insets";
import { terminalWidth, WIDE_QUERY } from "../lib/layout";
import { useMediaQuery, useViewportWidth } from "../lib/media";
import { useDeskStore } from "../store/useDeskStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { DrawerContent } from "./DrawerContent";
import { ResizeHandle } from "./ResizeHandle";
import { StagePanel } from "./StagePanel";
import { TerminalPanel } from "./TerminalPanel";
import { MotionProvider } from "./MotionProvider";

const TermSheet = dynamic(() => import("./TermSheet"), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The 3D desk always fills the screen. Panels float over it and only animate transform and
 * opacity, so the 3D canvas never resizes while they move; the camera keeps the laptop centred in
 * whatever space is free.
 *
 * - 992px and wider: the terminal floats on the left (it slides away when a folder opens, can be
 *   resized, and comes back from the "terminal" button), the details drawer slides in on the right.
 * - below 992px (tablets and phones): the terminal is closed and opens as a bottom sheet from the
 *   "terminal" button; folder details appear in a bottom panel that does not block the page, so the
 *   laptop stays tappable above it. Its handle expands it to read more.
 */
export function DeskExperience() {
  const open = useDeskStore((s) => s.ch > 0);
  // on wide screens the details panel steps aside while the terminal is brought back over an open folder
  const drawerOpen = useDeskStore((s) => s.ch > 0 && s.drawer);
  const terminal = useDeskStore((s) => s.terminal);
  const toggleTerminal = useDeskStore((s) => s.toggleTerminal);
  const custom = useLayoutStore((s) => s.terminalW);
  const ch = useDeskStore((s) => s.ch);
  const termSheetCh = useLayoutStore((s) => s.termSheetCh);
  const closeTermSheet = useLayoutStore((s) => s.closeTermSheet);
  const toggleSheetExpanded = useLayoutStore((s) => s.toggleSheetExpanded);
  const wide = useMediaQuery(WIDE_QUERY);
  const tw = terminalWidth(useViewportWidth(), custom);
  const { drawerW, sheetH } = useStageInsets();

  // small screens: reading a file opens the details panel tall (it was too short to read in), and closing the file brings it back
  const fileOpen = useDeskStore((s) => s.file >= 0);
  useEffect(() => {
    if (!wide) useLayoutStore.setState({ sheetExpanded: fileOpen });
  }, [fileOpen, wide]);

  // restore the terminal width the visitor chose last time
  useEffect(() => {
    useLayoutStore.persist.rehydrate();
  }, []);

  return (
    <MotionProvider>
      <main className="relative h-dvh overflow-hidden p-2 sm:p-3">
        <div className="absolute inset-2 sm:inset-3">
          <StagePanel className="h-full w-full" />
        </div>

        {wide ? (
          // keyed per layout: React must not reuse the same panel element across the breakpoint, or the small-screen
          // version's animated height/transform would be left behind on the wide one
          <Fragment key="wide">
            <m.div
              aria-hidden={!terminal}
              inert={!terminal}
              initial={false}
              animate={{
                x: terminal ? 0 : -(tw + 48),
                opacity: terminal ? 1 : 0,
              }}
              transition={{ duration: 0.6, ease }}
              className="absolute bottom-3 left-3 top-3 z-20"
              style={{ width: tw }}
            >
              <TerminalPanel className="h-full" onCollapse={toggleTerminal} />
              <ResizeHandle width={tw} />
            </m.div>

            <m.aside
              aria-label="Documents"
              aria-hidden={!drawerOpen}
              inert={!drawerOpen}
              initial={false}
              animate={{ x: drawerOpen ? 0 : drawerW + 48, opacity: drawerOpen ? 1 : 0 }}
              transition={{ duration: 0.6, ease }}
              className="absolute bottom-3 right-3 top-3 z-30 overflow-hidden rounded-[22px] border border-white/10 bg-panel-raised/95 shadow-2xl"
              style={{ width: drawerW }}
            >
              <DrawerContent />
            </m.aside>
          </Fragment>
        ) : (
          <Fragment key="narrow">
            {/* terminal: a sheet the visitor opens on purpose; it never covers the desk by default */}
            <TermSheet open={termSheetCh === ch} onClose={closeTermSheet} />

            {/* details: a panel that does not block the page, so the laptop above it stays tappable */}
            <m.aside
              aria-label="Documents"
              aria-hidden={!open}
              inert={!open}
              initial={false}
              animate={{
                y: open ? 0 : sheetH + 48,
                opacity: open ? 1 : 0,
                height: sheetH,
              }}
              transition={{ duration: 0.55, ease }}
              className="absolute inset-x-2 bottom-2 z-30 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-[26px] border border-white/10 bg-panel-raised/95 shadow-2xl sm:inset-x-3 sm:bottom-3"
            >
              <button
                onClick={toggleSheetExpanded}
                aria-label="Expand or collapse details"
                className="grid h-8 shrink-0 place-items-center outline-none focus-visible:bg-white/5"
              >
                <span className="h-1 w-10 rounded-full bg-white/25" />
              </button>
              <div className="min-h-0 flex-1">
                <DrawerContent compact />
              </div>
            </m.aside>
          </Fragment>
        )}
      </main>
    </MotionProvider>
  );
}
