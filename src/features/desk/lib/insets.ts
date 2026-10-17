"use client";

import { useDeskStore } from "../store/useDeskStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { drawerWidth, GAP, sheetHeight, terminalWidth, WIDE_QUERY } from "./layout";
import { useMediaQuery, useViewportHeight, useViewportWidth } from "./media";

/**
 * How much of the stage is covered by floating panels:
 * - wide screens: the terminal on the left (while it is showing) and the details drawer on the right
 *   (while a folder is open),
 * - narrow screens: the details panel at the bottom (while a folder is open).
 * The 3D camera and the overlay buttons keep clear of these.
 */
export function useStageInsets() {
  const wide = useMediaQuery(WIDE_QUERY);
  const vw = useViewportWidth();
  const vh = useViewportHeight();
  const terminal = useDeskStore((s) => s.terminal);
  const open = useDeskStore((s) => s.ch > 0);
  const custom = useLayoutStore((s) => s.terminalW);
  const expanded = useLayoutStore((s) => s.sheetExpanded);
  const sheetH = sheetHeight(vh, expanded);
  return {
    wide,
    drawerW: drawerWidth(vw),
    sheetH,
    left: wide && terminal ? terminalWidth(vw, custom) + GAP : 0,
    right: wide && open ? drawerWidth(vw) + GAP : 0,
    bottom: !wide && open ? sheetH + GAP : 0,
  };
}
