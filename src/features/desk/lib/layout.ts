/** Layout constants shared by the panels and the 3D camera (px). */
/** Wide layout (floating panels) starts here; below it the desk fills the screen and panels become sheets. */
export const WIDE_QUERY = "(min-width: 992px)";
/** Details drawer width on wide screens: 420px, a bit narrower toward 992px. */
export const drawerWidth = (viewportWidth: number) => Math.min(420, Math.max(340, Math.round(viewportWidth * 0.34)));
/** Details panel height on narrow screens: a peek that leaves the laptop visible, or nearly full height. */
export const sheetHeight = (viewportHeight: number, expanded: boolean) =>
  expanded ? Math.round(viewportHeight * 0.88) : Math.round(Math.min(viewportHeight * 0.6, 540));
/** space between a panel and the stage content it must not cover */
export const GAP = 12;
/** space at the top of the stage taken by the back button and address pill */
export const TOP_PX = 72;

const TERMINAL_MIN = 320;
const terminalMax = (viewportWidth: number) => Math.min(760, Math.round(viewportWidth * 0.55));

/** Width of the floating terminal on wide screens: the visitor's choice, or 27% of the window. */
export const terminalWidth = (viewportWidth: number, custom = 0) =>
  custom > 0
    ? Math.min(terminalMax(viewportWidth), Math.max(TERMINAL_MIN, Math.round(custom)))
    : Math.min(520, Math.max(360, Math.round(viewportWidth * 0.27)));
