import { folders } from "../data/folders";
import { owner } from "../data/scene3d";
import type { DeskState, TermLine } from "../types";

const MAX_LOG = 300;

const pathOf = (ch: number) => (ch ? "root/" + folders[ch].id : "root");

const listFolders = (): TermLine[] =>
  folders.slice(1).map((d, i) => ({ k: "dir", name: d.id, count: d.files.length, desc: d.line, to: i + 1 }));

const listFiles = (ch: number): TermLine[] =>
  folders[ch].files.map((x) => ({ k: "file", name: x.name, size: x.size, folder: folders[ch].id }));

const intro = (): TermLine[] => [
  { k: "login" },
  { k: "cmd", path: "root", text: "cat intro.md" },
  { k: "text", text: `Hi, I'm ${owner.name}.\nSoftware engineer in Karachi, frontend specialist building toward full-stack.` },
  { k: "cmd", path: "root", text: "ls" },
  ...listFolders(),
  { k: "mute", text: "Click a folder on the screen, or type cd <name>." },
];

export const initialState: DeskState = { ch: 0, lastCh: 1, file: -1, terminal: true, drawer: false, log: intro() };

/** Append lines to the history, keeping it bounded. */
const withLog = (s: DeskState, patch: Partial<DeskState>, ...lines: TermLine[]): DeskState => ({
  ...s,
  ...patch,
  log: [...s.log, ...lines].slice(-MAX_LOG),
});

/**
 * Go to a folder (0 is the desk). The terminal slides away whenever a folder opens, however it was
 * opened, and comes back when the visitor returns to the desk.
 */
export function goTo(s: DeskState, ch: number): DeskState {
  if (ch === s.ch) return s;
  const terminal = ch === 0;
  // the history records what the visitor did, not what it showed: just the command
  if (ch === 0) return withLog(s, { ch: 0, file: -1, terminal, drawer: false }, { k: "cmd", path: pathOf(s.ch), text: "cd .." });
  return withLog(s, { ch, lastCh: ch, file: -1, terminal, drawer: true }, { k: "cmd", path: pathOf(s.ch), text: "cd " + folders[ch].id });
}

/** Open a document (or collapse it when it is already open). Collapsing leaves the history alone. */
export function toggleFile(s: DeskState, j: number, force = false): DeskState {
  if (s.ch === 0) return s;
  if (s.file === j && !force) return { ...s, file: -1 };
  // reading a file: the terminal steps aside and the details panel is shown
  return withLog(s, { file: j, terminal: false, drawer: true }, { k: "cmd", path: pathOf(s.ch), text: "cat " + folders[s.ch].files[j].name });
}

/** Jump to a document from anywhere, e.g. from a line in the history. */
export function openDoc(s: DeskState, folderId: string, name: string): DeskState {
  const ch = folders.findIndex((d) => d.id === folderId);
  if (ch < 0) return s;
  const next = ch === s.ch ? s : goTo(s, ch);
  const j = folders[ch].files.findIndex((f) => f.name === name);
  return j < 0 ? next : toggleFile(next, j, true);
}

export function runCommand(s: DeskState, raw: string): DeskState {
  const c = raw.trim();
  if (!c) return s;
  const cur = folders[s.ch];
  const cmd: TermLine = { k: "cmd", path: pathOf(s.ch), text: c };

  if (c === "clear") return { ...s, log: [] };

  let m = c.match(/^cd\s+\/?([\w.~]+)\/?$/);
  if (m) {
    const i = m[1] === ".." || m[1] === "~" ? 0 : folders.findIndex((d) => d.id === m![1]);
    if (i >= 0) return goTo(s, i);
    return withLog(s, {}, cmd, { k: "err", text: `no folder named ${m[1]} — try ls` });
  }
  if (c === "ls") return withLog(s, {}, cmd, ...(s.ch ? listFiles(s.ch) : listFolders()));

  // "cat name", "open name", or just the file name (with or without its extension): open it, even from another folder
  m = c.match(/^(?:(?:cat|open)\s+)?(.+)$/);
  if (m) {
    const want = m[1].trim();
    const base = (n: string) => n.replace(/\.\w+$/, "");
    const here = cur.files.findIndex((x) => x.name === want || base(x.name) === want);
    if (here >= 0) return toggleFile(s, here, true);
    for (const d of folders.slice(1)) {
      const hit = d.files.find((x) => x.name === want || base(x.name) === want);
      if (hit) return openDoc(s, d.id, hit.name);
    }
    if (/^(cat|open)\s/.test(c)) return withLog(s, {}, cmd, { k: "err", text: `${want}: no such file — try ls` });
  }
  if (c === "help") {
    const rows: [string, string][] = [
      ["ls", "show what is here"],
      ["cd <name>", "open a folder"],
      ["cd ..", "back to the desk"],
      ["cat <file>", "open a document"],
      ["clear", "clear the history"],
    ];
    return withLog(s, {}, cmd, ...rows.map(([name, desc]): TermLine => ({ k: "help", name, desc })));
  }
  return withLog(s, {}, cmd, { k: "err", text: `unknown command: ${c} — type help` });
}

/** Showing the terminal over an open folder closes the details panel (the folder stays open); hiding it brings the panel back. */
export const toggleTerminal = (s: DeskState): DeskState => {
  const terminal = !s.terminal;
  return { ...s, terminal, drawer: s.ch > 0 ? !terminal : false };
};
