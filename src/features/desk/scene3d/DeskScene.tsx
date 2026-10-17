"use client";

import { Component, memo, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Environment, Lightformer } from "@react-three/drei";
import { camera as cam } from "../data/scene3d";
import { useStageInsets } from "../lib/insets";
import { useViewportWidth } from "../lib/media";
import { TOP_PX } from "../lib/layout";
import { useDeskStore } from "../store/useDeskStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { CameraController } from "./CameraController";
import { Room } from "./Room";
import { palette } from "./palette";
import { tokens } from "@/styles/tokens";
import { readToken } from "../lib/tone";

type Props = { onReady: () => void; onFail: () => void };

/** If WebGL is unavailable or the scene throws, the stage falls back to a plain folder list. */
class Boundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Static lights, fog and reflections. Memoised: the environment re-bakes its reflections whenever
 * its children change identity, which stalls the frame. Nothing here depends on state, so it
 * renders once.
 */
const Lighting = memo(function Lighting() {
  const stage = readToken("--stage", tokens.stage);
  return (
    <>
      <color attach="background" args={[stage]} />
      <fog attach="fog" args={[stage, 18, 40]} />

      {/* balanced lighting: warm room light with soft shadows, cool fill, sky/ground bounce.
          The laptop screen adds its own glow (see Laptop). */}
      <hemisphereLight args={[palette.light.sky, palette.light.ground, 0.9]} />
      <ambientLight intensity={0.25} color={palette.light.ambient} />
      <directionalLight
        position={[-5, 10, 7]}
        intensity={1.05}
        color={palette.light.key}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-radius={4}
      />
      <directionalLight position={[7, 5, 4]} intensity={0.3} color={palette.light.fill} />

      <Environment resolution={128} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={1.6} position={[0, 6, -2]} scale={[10, 4, 1]} color={palette.light.envWarm} />
        <Lightformer form="rect" intensity={0.9} position={[-7, 3, 4]} scale={[4, 5, 1]} color={palette.light.envSoft} />
      </Environment>
    </>
  );
});

function Scene({ onSettled }: { onSettled: () => void }) {
  const open = useDeskStore((s) => s.ch > 0);
  // floating panels cover part of the stage: terminal (left) and details (right) on wide screens, details (bottom) on narrow ones
  const { left, right, bottom } = useStageInsets();
  const resizing = useLayoutStore((s) => s.resizing);
  // the brass nameplate sits at the edge of the frame and gets cut off on small screens, so it is dropped at 568px and below
  const showNameplate = useViewportWidth() > 568;

  return (
    <>
      <Lighting />
      <AdaptiveDpr pixelated={false} />
      <Room nameplate={showNameplate} />
      <CameraController focused={open} leftPx={left} rightPx={right} topPx={TOP_PX} bottomPx={bottom} resizing={resizing} onSettled={onSettled} />
    </>
  );
}

export default function DeskScene({ onReady, onFail }: Props) {
  return (
    <Boundary onFail={onFail}>
      <Canvas
        shadows
        // full device resolution when still; only drops while the visitor is actively dragging
        dpr={[1, 2]}
        performance={{ min: 0.75, debounce: 150 }}
        camera={{ fov: cam.fov, position: [0, 4, 11], near: 0.1, far: 80 }}
        gl={{ antialias: true, powerPreference: "high-performance", toneMappingExposure: 1.05 }}
        className="!absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        <Scene onSettled={onReady} />
      </Canvas>
    </Boundary>
  );
}
