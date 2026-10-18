"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TerminalPanel } from "./TerminalPanel";

/** The terminal as a bottom sheet on small screens. Loaded only there, so wide screens never download the dialog code. */
export default function TermSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-2xl border-0 bg-transparent p-2 text-white shadow-none duration-500 data-[side=bottom]:h-[min(600px,72dvh)] data-[side=bottom]:max-h-[72dvh]"
      >
        <SheetTitle className="sr-only">Terminal</SheetTitle>
        <TerminalPanel className="h-full" onCollapse={onClose} closeAsCross />
      </SheetContent>
    </Sheet>
  );
}
