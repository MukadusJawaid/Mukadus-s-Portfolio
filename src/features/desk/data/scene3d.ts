export const owner = { name: "Mukadus Jawaid", role: "Frontend Engineer" };

/** The little robot that guides visitors around the website and the desk. */
export const robot = { name: "Pixel" };

/** Shown in the terminal prompt, like a real macOS zsh session. */
export const shell = { user: "mukadusjawaid", host: "portfolio" };

export const camera = {
  fov: 34,
  /**
   * `fitWidth` is how many world units should fill the free part of the stage. Angles are
   * polar (from straight up) and azimuth (around the desk).
   */
  overview: { fitWidth: 6.6, polar: 1.1, azimuth: 0, target: [0, 0.95, 0.1] as [number, number, number] },
  /** straight in front of the lid so the screen reads face-on */
  focus: { fitWidth: 3.6, polar: 1.31, azimuth: 0 },
  /** where the intro glide starts: high and far back, straight ahead of the desk so the laptop never drifts sideways */
  intro: { from: [0, 7.5, 22] as [number, number, number] },
  limits: { minDistance: 1.8, maxDistance: 16, minPolar: 0.55, maxPolar: 1.6, minAzimuth: -1.35, maxAzimuth: 1.35 },
};

/**
 * World-space corners of the laptop screen. The Laptop component measures them from the real model as it loads
 * (with the lid open) and stores them here; the camera reads them to frame the screen. The values below are a
 * close estimate, used only before the model is in.
 */
export const screenRig: { corners: [number, number, number][] } = {
  corners: [
    [-1.67, 0.56, -1.19],
    [-1.67, 2.34, -1.65],
    [1.67, 0.56, -1.19],
    [1.67, 2.34, -1.65],
  ],
};

export const screenCorners = () => screenRig.corners;

/** The middle of the screen: where the camera looks when a folder is open. */
export const screenCenter = (): [number, number, number] => {
  const c = screenRig.corners;
  const avg = (i: number) => c.reduce((sum, p) => sum + p[i], 0) / c.length;
  return [avg(0), avg(1), avg(2)];
};
