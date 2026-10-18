import { create } from "zustand";

type TransitionRequest = { href: string; label: string; id: number };

type State = {
  request: TransitionRequest | null;
  go: (href: string, label: string) => void;
};

/** A page change asks the overlay (mounted once in the root layout) to play, then navigate. */
export const useTransitionStore = create<State>((set) => ({
  request: null,
  go: (href, label) => set({ request: { href, label, id: Date.now() } }),
}));
