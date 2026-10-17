"use client";

import { Fragment, useEffect } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useStageInsets } from "../lib/insets";
import { terminalWidth, WIDE_QUERY } from "../lib/layout";
import { useMediaQuery, useViewportWidth } from "../lib/media";
import { useDeskStore } from "../store/useDeskStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { DrawerContent } from "./DrawerContent";
import { ResizeHandle } from "./ResizeHandle";
import { StagePanel } from "./StagePanel";
import { TerminalPanel } from "./TerminalPanel";

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

  // restore the terminal width the visitor chose last time
  useEffect(() => {
    useLayoutStore.persist.rehydrate();
  }, []);

  return (
    <main className="relative h-dvh overflow-hidden p-2 sm:p-3">
      <div className="absolute inset-2 sm:inset-3">
        <StagePanel className="h-full w-full" />
      </div>

      {wide ? (
        // keyed per layout: React must not reuse the same panel element across the breakpoint, or the small-screen
        // version's animated height/transform would be left behind on the wide one
        <Fragment key="wide">
          <motion.div
            aria-hidden={!terminal}
            inert={!terminal}
            initial={false}
            animate={{ x: terminal ? 0 : -(tw + 48), opacity: terminal ? 1 : 0 }}
            transition={{ duration: 0.6, ease }}
            className="absolute bottom-3 left-3 top-3 z-20"
            style={{ width: tw }}
          >
            <TerminalPanel className="h-full" onCollapse={toggleTerminal} />
            <ResizeHandle width={tw} />
          </motion.div>

          <motion.aside
            aria-label="Documents"
            aria-hidden={!open}
            inert={!open}
            initial={false}
            animate={{ x: open ? 0 : drawerW + 48, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.6, ease }}
            className="absolute bottom-3 right-3 top-3 z-30 overflow-hidden rounded-[22px] border border-white/10 bg-panel-raised/95 shadow-2xl"
            style={{ width: drawerW }}
          >
            <DrawerContent />
          </motion.aside>
        </Fragment>
      ) : (
        <Fragment key="narrow">
          {/* terminal: a sheet the visitor opens on purpose; it never covers the desk by default */}
          <Sheet open={termSheetCh === ch} onOpenChange={(o) => !o && closeTermSheet()}>
            <SheetContent
              side="bottom"
              showCloseButton={false}
              className="mx-auto max-w-2xl border-0 bg-transparent p-2 text-white shadow-none duration-500 data-[side=bottom]:h-[min(600px,72dvh)] data-[side=bottom]:max-h-[72dvh]"
            >
              <SheetTitle className="sr-only">Terminal</SheetTitle>
              <TerminalPanel className="h-full" onCollapse={closeTermSheet} />
            </SheetContent>
          </Sheet>

          {/* details: a panel that does not block the page, so the laptop above it stays tappable */}
          <motion.aside
            aria-label="Documents"
            aria-hidden={!open}
            inert={!open}
            initial={false}
            animate={{ y: open ? 0 : sheetH + 48, opacity: open ? 1 : 0, height: sheetH }}
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
          </motion.aside>
        </Fragment>
      )}
    </main>
  );
}
