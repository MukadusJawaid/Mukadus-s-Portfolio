"use client";

import { create } from "zustand";

/** How much of the 3D scene has downloaded (0 to 100), reported by the scene itself so the loader can show real progress. */
export const useLoadStore = create<{ progress: number }>()(() => ({ progress: 0 }));
