import { create } from "zustand";

/** The small-screen menu: the burger button in the header opens the drawer that slides in from the right. */
export const useMenuStore = create<{ open: boolean; setOpen: (open: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
