"use client";

import { create } from "zustand";
import { goTo, initialState, openDoc, runCommand, toggleFile, toggleTerminal } from "../lib/terminal";
import type { DeskState } from "../types";

type DeskActions = {
  /** open a folder (0 = back to the desk). The terminal slides away while a folder is open. */
  go: (i: number) => void;
  run: (cmd: string) => void;
  toggle: (j: number) => void;
  openDoc: (folderId: string, name: string) => void;
  toggleTerminal: () => void;
};

export const useDeskStore = create<DeskState & DeskActions>()((set) => ({
  ...initialState,
  go: (i) => set((s) => goTo(s, i)),
  run: (cmd) => set((s) => runCommand(s, cmd)),
  toggle: (j) => set((s) => toggleFile(s, j)),
  openDoc: (folderId, name) => set((s) => openDoc(s, folderId, name)),
  toggleTerminal: () => set(toggleTerminal),
}));
