"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { folders } from "../data/folders";
import { laptop } from "../data/scene3d";
import { useDeskStore } from "../store/useDeskStore";
import { drawScreen, hitTest, SH, SW, type ScreenView } from "./screen";
import { makeCanvas } from "./textures";
import { palette } from "./palette";

const POPOVER_DELAY = 0.15;
/** the screen is drawn at 1.6x so text stays crisp when the camera zooms in */
const SCALE = 1.6;
const KEY_ROWS = 5;
const KEY_COLS = 14;

/** the canvas element that received the pointer event */
const cursorOf = (e: ThreeEvent<PointerEvent>) => e.nativeEvent.target as HTMLElement;

/** A flat rounded rectangle lying in the XY plane (rotate it to lie on the deck). */
function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return new THREE.ShapeGeometry(s, 12);
}

const ALU = { color: palette.laptop.body, roughness: 0.32, metalness: 0.92 } as const;

/**
 * A modern aluminium laptop. The screen is a live canvas: the desktop with folder tiles,
 * a file list on hover, and an opened folder window. Clicks on the glass are mapped through
 * the UV coordinates back to screen pixels.
 */
export function Laptop() {
  const { c: canvas, g } = useMemo(() => makeCanvas(SW * SCALE, SH * SCALE), []);
  const tex = useRef<THREE.CanvasTexture>(null);

  const view = useRef<ScreenView>({ ch: 0, file: -1, hoverIcon: 0, popover: false, hoverRow: -1, hoverClose: false, hoverBack: false });
  const hoverSince = useRef(0);
  const dirty = useRef(true);

  // redraw whenever the app state changes
  useEffect(() => useDeskStore.subscribe(() => (dirty.current = true)), []);

  // the screen reads colours from the CSS tokens, so draw it again once the page has fully loaded
  useEffect(() => {
    const redraw = () => (dirty.current = true);
    if (document.readyState === "complete") redraw();
    else window.addEventListener("load", redraw, { once: true });
    return () => window.removeEventListener("load", redraw);
  }, []);

  useFrame(({ clock }) => {
    const s = useDeskStore.getState();
    const v = view.current;
    if (v.hoverIcon > 0 && !v.popover && s.ch === 0 && clock.elapsedTime - hoverSince.current > POPOVER_DELAY) {
      v.popover = true;
      dirty.current = true;
    }
    if (!dirty.current) return;
    dirty.current = false;
    v.ch = s.ch;
    v.file = s.file;
    if (s.ch > 0) v.hoverIcon = 0;
    g.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    drawScreen(g, folders, v);
    if (tex.current) tex.current.needsUpdate = true;
  });

  const pad = useMemo(() => roundedRect(1.4, 0.88, 0.06), []);
  const padEdge = useMemo(() => roundedRect(1.43, 0.91, 0.07), []);

  const keys = useCallback((m: THREE.InstancedMesh | null) => {
    if (!m) return;
    const d = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let k = 0; k < KEY_COLS; k++) {
        d.position.set((k - (KEY_COLS - 1) / 2) * 0.235, 0.132, -0.85 + r * 0.235);
        d.updateMatrix();
        m.setMatrixAt(i++, d.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  const toScreen = (e: ThreeEvent<PointerEvent | MouseEvent>) => (e.uv ? { x: e.uv.x * SW, y: (1 - e.uv.y) * SH } : null);

  const move = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const p = toScreen(e);
    if (!p) return;
    const s = useDeskStore.getState();
    const v = view.current;
    const hit = hitTest(s.ch, folders[s.ch].files.length, p.x, p.y);
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
    cursorOf(e).style.cursor = hit.t === "none" ? "" : "pointer";
  };

  const leave = (e: ThreeEvent<PointerEvent>) => {
    const v = view.current;
    v.hoverIcon = 0;
    v.popover = false;
    v.hoverRow = -1;
    v.hoverClose = false;
    v.hoverBack = false;
    dirty.current = true;
    cursorOf(e).style.cursor = "";
  };

  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return; // that was a drag to orbit, not a click
    e.stopPropagation();
    const p = toScreen(e);
    if (!p) return;
    const st = useDeskStore.getState();
    const hit = hitTest(st.ch, folders[st.ch].files.length, p.x, p.y);
    if (hit.t === "icon") st.go(hit.i);
    else if (hit.t === "file") st.toggle(hit.j);
    else if (hit.t === "close" || hit.t === "back") st.go(0);
  };

  const { base, lid, screen } = laptop;

  return (
    <group position={[laptop.position.x, laptop.position.y, laptop.position.z]}>
      {/* aluminium base */}
      <RoundedBox args={[base.w, base.t, base.d]} radius={0.045} smoothness={4} position={[0, base.t / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...ALU} />
      </RoundedBox>
      {/* keyboard well, keys and trackpad */}
      <mesh position={[0, base.t + 0.002, -0.38]} receiveShadow>
        <boxGeometry args={[3.42, 0.006, 1.3]} />
        <meshStandardMaterial color={palette.laptop.keyWell} roughness={0.8} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, KEY_ROWS * KEY_COLS]} castShadow>
        <boxGeometry args={[0.205, 0.05, 0.205]} />
        <meshStandardMaterial color={palette.laptop.key} roughness={0.55} />
      </instancedMesh>
      {/* trackpad: a flush, slightly glassy panel with a fine recessed edge, not a raised block */}
      <mesh geometry={padEdge} position={[0, base.t + 0.0015, 0.82]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color={palette.laptop.padEdge} roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh geometry={pad} position={[0, base.t + 0.0025, 0.82]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color={palette.laptop.pad} roughness={0.38} metalness={0.7} />
      </mesh>

      {/* hinge */}
      <mesh position={[0, base.t + 0.02, -base.d / 2 + 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 3.3, 24]} />
        <meshStandardMaterial color={palette.laptop.hinge} roughness={0.4} metalness={0.8} />
      </mesh>

      {/* lid, leaning back */}
      <group position={[0, base.t + 0.02, -base.d / 2 + 0.02]} rotation={[laptop.lidAngle, 0, 0]}>
        <RoundedBox args={[lid.w, lid.h, lid.t]} radius={0.025} smoothness={4} position={[0, lid.h / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...ALU} />
        </RoundedBox>
        {/* glowing logo on the back */}
        <mesh position={[0, lid.h / 2, -lid.t / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.13, 32]} />
          <meshBasicMaterial color={palette.laptop.logo} toneMapped={false} />
        </mesh>
        {/* black bezel */}
        <mesh position={[0, lid.h / 2, lid.t / 2 + 0.001]}>
          <planeGeometry args={[lid.w - 0.1, lid.h - 0.1]} />
          <meshStandardMaterial color={palette.laptop.bezel} roughness={0.6} />
        </mesh>
        {/* the screen */}
        <mesh position={[0, lid.h / 2, lid.t / 2 + 0.003]} onPointerMove={move} onPointerOut={leave} onClick={click}>
          <planeGeometry args={[screen.w, screen.h]} />
          <meshBasicMaterial toneMapped={false}>
            <canvasTexture ref={tex} attach="map" args={[canvas]} colorSpace={THREE.SRGBColorSpace} anisotropy={16} />
          </meshBasicMaterial>
        </mesh>
        <mesh position={[0, lid.h - 0.07, lid.t / 2 + 0.004]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color={palette.laptop.camera} />
        </mesh>
        {/* the screen lights the keyboard and desk */}
        <pointLight position={[0, lid.h * 0.55, 1.8]} color={palette.light.screenGlow} intensity={2.2} distance={5} decay={2} />
      </group>
    </group>
  );
}
