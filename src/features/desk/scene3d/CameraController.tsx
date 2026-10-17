"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import * as THREE from "three";
import { camera as cam, screenCorners } from "../data/scene3d";
import { useViewStore } from "../store/useViewStore";

type Props = {
  /** a folder is open: zoom into the screen */
  focused: boolean;
  /** pixels of the stage covered by floating panels on each side (terminal left, details right or bottom, bar on top) */
  leftPx: number;
  rightPx: number;
  topPx: number;
  bottomPx: number;
  /** the terminal edge is being dragged: follow it with the projection only, re-frame when it ends */
  resizing: boolean;
  /** called once frames are running smoothly and the first glide is about to start */
  onSettled: () => void;
};

type Tween = { t0: number; dur: number; ease: (t: number) => number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** fast start, gentle landing: no hesitation at the beginning of the glide */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const CORNERS = screenCorners().map(([x, y, z]) => new THREE.Vector3(x, y, z));
const MARGIN = 0.1;

/**
 * Closest camera distance at which the whole laptop screen fits the free area of the stage (not
 * covered by the terminal, the details drawer or the top bar). The screen is projected through a
 * real camera, so the result is correct for any window size. `freeW` / `freeH` are the fractions
 * of the stage width / height that are free.
 */
function fitScreenDistance(aspect: number, freeW: number, freeH: number) {
  const { polar, azimuth, target } = cam.focus;
  const t = new THREE.Vector3(...target);
  const dir = new THREE.Vector3(Math.sin(polar) * Math.sin(azimuth), Math.cos(polar), Math.sin(polar) * Math.cos(azimuth));
  const probe = new THREE.PerspectiveCamera(cam.fov, aspect, 0.1, 100);
  const ndc = new THREE.Vector3();

  const fits = (dist: number) => {
    probe.position.copy(t).addScaledVector(dir, dist);
    probe.lookAt(t);
    probe.updateMatrixWorld(true);
    probe.updateProjectionMatrix();
    let w = 0;
    let h = 0;
    for (const c of CORNERS) {
      ndc.copy(c).project(probe);
      w = Math.max(w, Math.abs(ndc.x));
      h = Math.max(h, Math.abs(ndc.y));
    }
    return w <= freeW * (1 - MARGIN) && h <= freeH * (1 - MARGIN);
  };

  let lo = cam.limits.minDistance;
  let hi = cam.limits.maxDistance;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

/**
 * Orbit, zoom and glide for the desk camera.
 * - Drag to orbit (slow and damped), wheel / pinch / the + − buttons to zoom. The laptop is always
 *   the pivot, so zooming and orbiting never make it drift.
 * - On load the camera starts far back and glides in. Opening a folder glides it in front of the
 *   laptop screen. The *projection* is shifted for the terminal, the details drawer and the top bar, so the
 *   laptop sits centred in the free space between them while it stays the camera's pivot.
 * - The recentre button restores the framing exactly.
 * - While the desk is idle the view sways very slightly around the current framing.
 */
export function CameraController({ focused, leftPx, rightPx, topPx, bottomPx, resizing, onSettled }: Props) {
  const ref = useRef<ComponentRef<typeof CameraControls>>(null);
  const size = useThree((s) => s.size);
  const clock = useThree((s) => s.clock);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  /** every shader is compiled (done off the main thread, so the page stays responsive) */
  const compiled = useRef(false);
  const perf = useThree((s) => s.performance);
  const first = useRef(true);
  const apply = useRef<(animate: boolean, opts?: { intro?: boolean }) => void>(() => {});
  const quietAt = useRef(0);
  /** "intro": glide in once smooth, "reveal": only show the scene once smooth, "done": nothing left to do */
  const mode = useRef<"intro" | "reveal" | "done">("done");
  const stable = useRef(0);
  const tween = useRef<Tween | null>(null);
  const shiftX = useRef(0);
  const shiftY = useRef(0);
  const sway = useRef<{ t0: number; base: number } | null>(null);

  useEffect(() => {
    if (resizing && !first.current) return;
    apply.current = (animate, opts = {}) => {
      const c = ref.current;
      if (!c) return;
      const aspect = size.width / size.height;
      const pose = focused ? cam.focus : cam.overview;
      const t = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
      const freeW = Math.max(0.3, 1 - (leftPx + rightPx) / size.width);
      const freeH = Math.max(0.25, 1 - (topPx + bottomPx) / size.height);
      const dist = focused
        ? fitScreenDistance(aspect, freeW, freeH)
        : THREE.MathUtils.clamp(((aspect < 0.9 ? 5 : pose.fitWidth) / freeW) / (2 * t * aspect), cam.limits.minDistance, cam.limits.maxDistance);

      const sp = Math.sin(pose.polar);
      const [tx, ty, tz] = pose.target;
      const toT = new THREE.Vector3(tx, ty, tz);
      const toP = new THREE.Vector3(
        tx + dist * sp * Math.sin(pose.azimuth),
        ty + dist * Math.cos(pose.polar),
        tz + dist * sp * Math.cos(pose.azimuth),
      );
      if (!animate) {
        tween.current = null;
        c.setLookAt(toP.x, toP.y, toP.z, toT.x, toT.y, toT.z, false);
      } else {
        // our own clock-driven glide: it always takes `dur` seconds and starts moving immediately
        const fromP = new THREE.Vector3();
        const fromT = new THREE.Vector3();
        c.getPosition(fromP);
        c.getTarget(fromT);
        tween.current = { t0: clock.elapsedTime, dur: opts.intro ? 2.2 : 1.1, ease: opts.intro ? easeOut : easeInOut, fromP, fromT, toP, toT };
      }
      sway.current = null;
      quietAt.current = clock.elapsedTime + 2;
    };

    if (first.current) {
      first.current = false;
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const c = ref.current;
      if (calm || focused || !c) {
        apply.current(false);
        mode.current = "reveal"; // no intro, only wait for smooth frames before showing the scene
      } else {
        // intro: start high and far back; the glide begins once frames run smoothly
        c.setLookAt(...cam.intro.from, ...cam.overview.target, false);
        mode.current = "intro";
      }
    } else {
      apply.current(true);
    }
  }, [focused, leftPx, rightPx, topPx, bottomPx, resizing, size.width, size.height, clock]);

  // compile every shader up front without blocking the page, so nothing stalls when it first comes into view
  useEffect(() => {
    let alive = true;
    const done = () => {
      if (alive) compiled.current = true;
    };
    gl.compileAsync(scene, camera).then(done, done);
    return () => {
      alive = false;
    };
  }, [gl, scene, camera]);

  // expose zoom / recentre to the overlay buttons
  useEffect(() => {
    const dolly = (k: number) => {
      const c = ref.current;
      if (!c) return;
      c.dollyTo(THREE.MathUtils.clamp(c.distance * k, cam.limits.minDistance, cam.limits.maxDistance), true);
      sway.current = null;
      quietAt.current = clock.elapsedTime + 3;
    };
    useViewStore.setState({ api: { zoomIn: () => dolly(0.72), zoomOut: () => dolly(1.38), reset: () => apply.current(true) } });
    return () => useViewStore.setState({ api: null });
  }, [clock]);

  useFrame((state, dt) => {
    const c = ref.current;
    if (!c) return;

    // shift the projection so the laptop (the pivot) sits in the middle of the free space between the
    // floating panels, while it stays the camera's pivot for orbiting and zooming
    const wantX = (rightPx - leftPx) / 2;
    const wantY = (bottomPx - topPx) / 2;
    const k = Math.min(dt, 0.05);
    shiftX.current = THREE.MathUtils.damp(shiftX.current, wantX, 6, k);
    shiftY.current = THREE.MathUtils.damp(shiftY.current, wantY, 6, k);
    const pc = state.camera as THREE.PerspectiveCamera;
    if (wantX === 0 && wantY === 0 && Math.abs(shiftX.current) < 0.3 && Math.abs(shiftY.current) < 0.3) {
      if (pc.view?.enabled) pc.clearViewOffset();
    } else {
      pc.setViewOffset(size.width, size.height, shiftX.current, shiftY.current, size.width, size.height);
    }

    // reveal as soon as the shaders are compiled and frames are flowing; never wait more than a few seconds
    if (mode.current !== "done") {
      stable.current = dt < 0.12 ? stable.current + 1 : 0;
      if ((compiled.current && stable.current >= 2) || state.clock.elapsedTime > 3) {
        if (mode.current === "intro") apply.current(true, { intro: true });
        mode.current = "done";
        onSettled();
      }
    }

    // run the glide
    const tw = tween.current;
    if (tw) {
      const p = Math.min(1, (state.clock.elapsedTime - tw.t0) / tw.dur);
      const e = tw.ease(p);
      const px = tw.fromP.x + (tw.toP.x - tw.fromP.x) * e;
      const py = tw.fromP.y + (tw.toP.y - tw.fromP.y) * e;
      const pz = tw.fromP.z + (tw.toP.z - tw.fromP.z) * e;
      c.setLookAt(px, py, pz, tw.fromT.x + (tw.toT.x - tw.fromT.x) * e, tw.fromT.y + (tw.toT.y - tw.fromT.y) * e, tw.fromT.z + (tw.toT.z - tw.fromT.z) * e, false);
      if (p >= 1) tween.current = null;
      sway.current = null;
      quietAt.current = state.clock.elapsedTime + 2;
      return;
    }
    if (focused) return;

    // idle sway: oscillates around wherever the camera was when it went quiet, so it never drifts off-centre
    const t = state.clock.elapsedTime;
    if (t < quietAt.current) {
      sway.current = null;
      return;
    }
    if (!sway.current) sway.current = { t0: t, base: c.azimuthAngle };
    c.rotateAzimuthTo(sway.current.base + 0.03 * Math.sin((t - sway.current.t0) * 0.5), false);
  });

  const touch = () => {
    tween.current = null;
    sway.current = null;
    quietAt.current = clock.elapsedTime + 3;
  };

  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.6}
      draggingSmoothTime={0.16}
      azimuthRotateSpeed={0.55}
      polarRotateSpeed={0.55}
      dollySpeed={0.6}
      minDistance={cam.limits.minDistance}
      maxDistance={cam.limits.maxDistance}
      minPolarAngle={cam.limits.minPolar}
      maxPolarAngle={cam.limits.maxPolar}
      minAzimuthAngle={cam.limits.minAzimuth}
      maxAzimuthAngle={cam.limits.maxAzimuth}
      dollyToCursor={false}
      onControlStart={touch}
      onControl={() => {
        touch();
        perf.regress(); // drop resolution while moving, restore when still
      }}
      onControlEnd={touch}
      // drag to orbit, wheel / pinch to zoom, no panning so the desk can't be lost
      mouseButtons={{ left: 1, middle: 0, right: 0, wheel: 16 }}
      touches={{ one: 64, two: 1024, three: 0 }}
    />
  );
}
