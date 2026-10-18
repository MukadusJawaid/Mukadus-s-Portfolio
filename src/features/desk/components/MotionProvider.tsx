"use client";

import type { ReactNode } from "react";
import { LazyMotion } from "framer-motion";

/** The animation engine downloads after the page is already showing, instead of being part of the first load. */
const features = () => import("./motionFeatures").then((m) => m.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={features}>{children}</LazyMotion>;
}
