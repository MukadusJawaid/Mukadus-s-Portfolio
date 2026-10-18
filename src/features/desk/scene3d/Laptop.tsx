"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { folders } from "../data/folders";
import { screenRig } from "../data/scene3d";
import { useDeskStore } from "../store/useDeskStore";
import { useBuddyStore } from "../store/useBuddyStore";
import { MODELS, PLACE } from "./models";
import { drawScreen, hitTest, SH, SW, type Hit, type ScreenView } from "./screen";
import { makeCanvas } from "./textures";

const POPOVER_DELAY = 0.15;
/**
 * The screen canvas is redrawn at the size the screen actually appears on the display, in these steps (1 = 1280x800
 * pixels). Matching the pixels on screen one to one keeps text and folders sharp, which mipmaps of one big texture
 * cannot (they soften it); and the canvas stays small when the laptop is far away.
 */
const NONE: Hit = { t: "none" };

const LEVELS = [0.5, 0.75, 1, 1.5, 2, 2.5];

/**
 * A canvas of 1280x800 pixels times `f`, and the texture that shows it. A size change always makes a brand new
 * texture: resizing an existing one leaves the graphics card with the old texture memory, and the picture then
 * fills only a corner of the screen.
 */
function screenTexture(f: number, rx: number) {
  const made = makeCanvas(Math.round(SW * f), Math.round(SH * f));
  const texture = new THREE.CanvasTexture(made.c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(rx, 1);
  texture.offset.set((1 - rx) / 2, 0);
  return { ...made, texture };
}

/** the canvas element that received the pointer event */
const cursorOf = (e: ThreeEvent<PointerEvent>) => e.nativeEvent.target as HTMLElement;

/**
 * The gaming-laptop model with a live screen. The screen panel of the model shows a canvas: the desktop with
 * folder tiles, a file list on hover and an opened folder window. Pointer positions on the glass are mapped
 * through the panel's UV coordinates back to canvas pixels. The lid stays open.
 */
export function Laptop() {
  const { scene } = useGLTF(MODELS.laptop, false);
  const group = useRef<THREE.Group>(null);

  /** the canvas the screen is drawn on (created with the model; its size follows how big the screen appears) */
  const lod = useRef({ f: 1, candidate: 1, seen: 0, frame: 0 });
  const probe = useMemo(() => [new THREE.Vector3(), new THREE.Vector3()], []);
  const surface = useRef<{ c: HTMLCanvasElement; g: CanvasRenderingContext2D } | null>(null);
  const tex = useRef<THREE.CanvasTexture | null>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial | null>(null);
  /** the model's screen is wider than the canvas, so the canvas is centred with its edge colours carried outwards */
  const fit = useRef({ rx: 1, ox: 0 });

  const view = useRef<ScreenView>({ ch: 0, file: -1, hoverIcon: 0, popover: false, hoverRow: -1, hoverClose: false, hoverBack: false });
  const hoverSince = useRef(0);
  const wakeFrom = useRef(0);
  const dirty = useRef(true);

  // prepare the model once: find the screen, measure it, make only the screen clickable
  useEffect(() => {
    const host = group.current;
    if (!host) return;
    const made = screenTexture(1, 1);
    surface.current = made;
    tex.current = made.texture;
    let screenMesh: THREE.Mesh | undefined;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.raycast = () => {};
      m.castShadow = m.geometry.attributes.position.count < 20000;
      m.receiveShadow = true;
      // the screen is the model's single flat panel: a quad of 4 vertices
      if (m.geometry.attributes.position.count === 4) screenMesh = m;
    });
    if (!screenMesh) return;

    screenMesh.raycast = THREE.Mesh.prototype.raycast;
    const material = new THREE.MeshBasicMaterial({ map: made.texture, toneMapped: false, side: THREE.DoubleSide });
    screenMesh.material = material;
    screenMat.current = material;

    // measure the screen: the camera frames these four corners
    host.updateWorldMatrix(true, true);
    const pos = screenMesh.geometry.attributes.position;
    const pts = Array.from({ length: pos.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(screenMesh!.matrixWorld));
    const byX = [...pts].sort((a, b) => a.x - b.x);
    const left = byX.slice(0, 2).sort((a, b) => a.y - b.y);
    const right = byX.slice(2).sort((a, b) => a.y - b.y);
    screenRig.corners = [left[0], left[1], right[0], right[1]].map((v) => [v.x, v.y, v.z] as [number, number, number]);
    const aspect = left[0].distanceTo(right[0]) / left[0].distanceTo(left[1]);
    const rx = Math.max(1, aspect / (SW / SH));
    fit.current = { rx, ox: (1 - rx) / 2 };
    made.texture.repeat.set(rx, 1);
    made.texture.offset.set((1 - rx) / 2, 0);
    dirty.current = true;
  }, [scene]);

  // redraw whenever the app state changes
  useEffect(() => useDeskStore.subscribe(() => (dirty.current = true)), []);

  // the screen reads colours from the CSS tokens, so draw it again once the page has fully loaded
  useEffect(() => {
    const redraw = () => (dirty.current = true);
    if (document.readyState === "complete") redraw();
    else window.addEventListener("load", redraw, { once: true });
    return () => window.removeEventListener("load", redraw);
  }, []);

  const gl = useThree((st) => st.gl);

  useFrame(({ clock, camera, size }) => {
    // every few frames, measure how many device pixels the screen covers and pick the matching canvas size
    const L = lod.current;
    L.frame++;
    const early = L.frame < 90; // right after arriving, check every frame so the screen is sharp straight away
    if (early || L.frame % 8 === 0) {
      const c = screenRig.corners;
      probe[0].set(...c[0]).project(camera);
      probe[1].set(...c[2]).project(camera);
      const px = Math.hypot(((probe[0].x - probe[1].x) * size.width) / 2, ((probe[0].y - probe[1].y) * size.height) / 2) * gl.getPixelRatio();
      const need = px / fit.current.rx / SW;
      // zoomed far out (the screen is under about a quarter of the view width): sleep, with a big hello instead of tiny text.
      // Relative to the window, so the normal framing never sleeps and the folders stay clickable.
      const share = px / gl.getPixelRatio() / size.width;
      const far = share < (view.current.far ? 0.3 : 0.27);
      if (far !== !!view.current.far) {
        view.current.far = far;
        view.current.wake = far ? undefined : 0;
        wakeFrom.current = clock.elapsedTime;
        dirty.current = true;
      }
      // drawn over half again larger than it appears and shrunk by the graphics card: text edges come out crisp, where a
      // texture sampled 1:1 (or enlarged) looks soft
      const best = LEVELS.find((l) => l >= need * 1.6) ?? LEVELS[LEVELS.length - 1];
      // a size change must be seen twice in a row, so small camera moves do not make it flip back and forth
      if (best === L.f) L.seen = 0;
      else if (best === L.candidate && ++L.seen >= (early || best > L.f ? 1 : 2) && screenMat.current) {
        L.f = best;
        L.seen = 0;
        const next = screenTexture(best, fit.current.rx);
        gl.initTexture(next.texture);
        screenMat.current.map = next.texture;
        screenMat.current.needsUpdate = true;
        tex.current?.dispose();
        surface.current = next;
        tex.current = next.texture;
        dirty.current = true;
      } else if (best !== L.candidate) {
        L.candidate = best;
        L.seen = 1;
      }
    }

    const s = useDeskStore.getState();
    const v = view.current;
    if (v.wake !== undefined && v.wake < 1) {
      v.wake = Math.min(1, (clock.elapsedTime - wakeFrom.current) / 0.7);
      dirty.current = true;
    }
    if (v.hoverIcon > 0 && !v.popover && s.ch === 0 && clock.elapsedTime - hoverSince.current > POPOVER_DELAY) {
      v.popover = true;
      dirty.current = true;
    }
    if (!dirty.current) return;
    dirty.current = false;
    v.ch = s.ch;
    v.file = s.file;
    if (s.ch > 0) v.hoverIcon = 0;
    const sf = surface.current;
    if (!sf) return;
    sf.g.setTransform(L.f, 0, 0, L.f, 0, 0);
    drawScreen(sf.g, folders, v);
    if (tex.current) tex.current.needsUpdate = true;
  });

  /** canvas pixels under the pointer, or null when it is on the carried-out edge or the lid is not open */
  const toScreen = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    if (!e.uv) return null;
    const u = e.uv.x * fit.current.rx + fit.current.ox;
    if (u < 0 || u > 1) return null;
    return { x: u * SW, y: (1 - e.uv.y) * SH };
  };

  const leave = (e: ThreeEvent<PointerEvent>) => {
    const v = view.current;
    v.hoverIcon = 0;
    v.popover = false;
    v.hoverRow = -1;
    v.hoverClose = false;
    v.hoverBack = false;
    dirty.current = true;
    useBuddyStore.getState().setLaptop(false);
    cursorOf(e).style.cursor = "";
  };

  const move = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const p = toScreen(e);
    if (!p) return leave(e);
    const s = useDeskStore.getState();
    const v = view.current;
    const hit = view.current.far && s.ch === 0 ? NONE : hitTest(s.ch, folders[s.ch].files.length, p.x, p.y);
    const icon = hit.t === "icon" ? hit.i : 0;
    if (icon !== v.hoverIcon) {
      v.hoverIcon = icon;
      v.popover = false;
      hoverSince.current = performance.now() / 1000;
      dirty.current = true;
    }
    const row = hit.t === "file" ? hit.j : -1;
    const close = hit.t === "close";
    const back = hit.t === "back";
    if (row !== v.hoverRow || close !== v.hoverClose || back !== v.hoverBack) {
      v.hoverRow = row;
      v.hoverClose = close;
      v.hoverBack = back;
      dirty.current = true;
    }
    // over something clickable, Pixel replaces the arrow (mouse only); otherwise the usual hand
    const clickable = hit.t !== "none";
    const robot = matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    useBuddyStore.getState().setLaptop(clickable && robot);
    cursorOf(e).style.cursor = !clickable ? "" : robot ? "none" : "pointer";
  };

  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return; // that was a drag to orbit, not a click
    e.stopPropagation();
    const p = toScreen(e);
    if (!p) return;
    const st = useDeskStore.getState();
    const hit = view.current.far && st.ch === 0 ? NONE : hitTest(st.ch, folders[st.ch].files.length, p.x, p.y);
    if (hit.t === "icon") st.go(hit.i);
    else if (hit.t === "file") st.toggle(hit.j);
    else if (hit.t === "close" || hit.t === "back") st.go(0);
  };

  const { scale, rotationY, position } = PLACE.laptop;

  return (
    <group ref={group} position={[...position]} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={scene} onPointerMove={move} onPointerOut={leave} onClick={click} />
    </group>
  );
}
