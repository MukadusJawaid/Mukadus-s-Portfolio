export const owner = { name: "Mukadus Jawaid", role: "Frontend Engineer" };

/** Shown in the terminal prompt, like a real macOS zsh session. */
export const shell = { user: "mukadusjawaid", host: "portfolio" };

/** Laptop geometry (world units). The lid leans back by `lidAngle` radians. */
export const laptop = {
  position: { x: 0, y: 0.03, z: 0.1 },
  base: { w: 3.7, d: 2.5, t: 0.1 },
  lid: { w: 3.7, h: 2.45, t: 0.06 },
  lidAngle: -0.26,
  screen: { w: 3.34, h: 2.088 },
};

export const camera = {
  fov: 34,
  /**
   * `fitWidth` is how many world units should fill the free part of the stage. Angles are
   * polar (from straight up) and azimuth (around the desk).
   */
  overview: { fitWidth: 8.2, polar: 1.1, azimuth: 0, target: [0, 0.8, 0.2] as [number, number, number] },
  /** straight in front of the lid so the screen reads face-on */
  focus: { fitWidth: 3.6, polar: 1.31, azimuth: 0, target: [0, 1.32, -1.43] as [number, number, number] },
  /** where the intro glide starts: high and far back, straight ahead of the desk so the laptop never drifts sideways */
  intro: { from: [0, 9.5, 17] as [number, number, number] },
  limits: { minDistance: 1.8, maxDistance: 16, minPolar: 0.55, maxPolar: 1.6, minAzimuth: -1.35, maxAzimuth: 1.35 },
};

/** World-space corners of the laptop screen, derived from the laptop geometry above. */
export function screenCorners(): [number, number, number][] {
  const { base, lid, screen, lidAngle, position } = laptop;
  const pivot = [position.x, position.y + base.t + 0.02, position.z - base.d / 2 + 0.02] as const;
  const cos = Math.cos(lidAngle);
  const sin = Math.sin(lidAngle);
  const z = lid.t / 2 + 0.003;
  return ([-1, 1] as const).flatMap((sx) =>
    ([-1, 1] as const).map((sy): [number, number, number] => {
      const x = (sx * screen.w) / 2;
      const y = lid.h / 2 + (sy * screen.h) / 2;
      return [pivot[0] + x, pivot[1] + y * cos - z * sin, pivot[2] + y * sin + z * cos];
    }),
  );
}
