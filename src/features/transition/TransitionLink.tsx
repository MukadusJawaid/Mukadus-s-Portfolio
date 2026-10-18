"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useTransitionStore } from "./useTransitionStore";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string; label: string };

/** A normal link that plays the page transition (new tab / modifier clicks stay native). */
export function TransitionLink({ href, label, onClick, ...rest }: Props) {
  const go = useTransitionStore((s) => s.go);
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(href, label);
      }}
    />
  );
}
