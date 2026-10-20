import { useGLTF } from "@react-three/drei";

/** The optimized glTF models (meshopt-compressed geometry, WebP textures). */
export const MODELS = {
  desk: "/models/desk.glb",
  laptop: "/models/laptop.glb",
  plant: "/models/plant.glb",
  clock: "/models/clock.glb",
} as const;

/**
 * Where each model stands, in scene units. The desk top is y = 0, the wall is at z = -5 and the viewer looks
 * along -z. Scales turn the models' real-world sizes (a 1.8 m desk, a 36 cm laptop, a 40 cm clock) into the
 * scene's units, so the laptop screen keeps the size the camera was built around.
 */
export const PLACE = {
  desk: { scale: 9.6, position: [0, -7.064, -1.1] as const },
  /** the model's front faces +x; turned so it faces the viewer. The base is centred and sits on the desk. */
  laptop: { scale: 0.8626, rotationY: -Math.PI / 2, position: [0, 0.1127, 0.0396] as const },
  plant: { scale: 3.2, position: [-3.9, 0, -1.6] as const },
  clock: { scale: 3.5, position: [3.9, 3.9, -4.78] as const },
} as const;

/** Start downloading all four models as soon as the scene chunk loads. */
export const preloadModels = () => Object.values(MODELS).forEach((url) => useGLTF.preload(url, false));
