"use client";

import { memo, useCallback, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { owner } from "../data/scene3d";
import { Laptop } from "./Laptop";
import { leatherTexture, nameplateTexture, woodTexture } from "./textures";
import { palette } from "./palette";

const BRASS = { color: palette.brass.base, roughness: 0.28, metalness: 0.9 } as const;

/** A cosy study: teak desk, charcoal desk mat on tan leather, panelled wall, the laptop and a few props. */
export const Room = memo(function Room({ nameplate: showNameplate = true }: { nameplate?: boolean }) {
  const teak = useMemo(() => woodTexture(palette.wood.desk, [2.2, 1.4]), []);
  const panel = useMemo(() => woodTexture(palette.wood.panel, [0.3, 3]), []);
  const felt = useMemo(() => leatherTexture(palette.mat.felt), []);
  const tan = useMemo(() => leatherTexture(palette.mat.leather), []);
  const plate = useMemo(() => nameplateTexture(owner.name, owner.role), []);
  const mugBody = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, 0], [0.23, 0], [0.262, 0.03], [0.285, 0.2], [0.292, 0.5], [0.296, 0.535], [0.277, 0.548],
          [0.256, 0.53], [0.251, 0.46], [0.246, 0.08], [0, 0.06],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        48,
      ),
    [],
  );
  const SLAT_COUNT = 64;
  const slats = useCallback((m: THREE.InstancedMesh | null) => {
    if (!m) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < SLAT_COUNT; i++) {
      d.position.set(-11 + i * 0.35, 3, -4.92);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* teak desk top */}
      <mesh position={[0, -0.15, 0.4]} receiveShadow>
        <boxGeometry args={[18, 0.3, 11]} />
        <meshStandardMaterial map={teak} roughness={0.55} metalness={0.04} />
      </mesh>

      {/* tan leather blotter with an olive felt pad */}
      <RoundedBox args={[9.6, 0.02, 6.6]} radius={0.008} smoothness={3} position={[0, 0.01, 0.1]} receiveShadow>
        <meshStandardMaterial map={tan} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[9.0, 0.012, 6.0]} radius={0.006} smoothness={3} position={[0, 0.026, 0.1]} receiveShadow>
        <meshStandardMaterial map={felt} roughness={0.95} />
      </RoundedBox>

      {/* warm wood-panelled wall */}
      <mesh position={[0, 3, -5.0]}>
        <planeGeometry args={[28, 10]} />
        <meshStandardMaterial color={palette.wood.wall} roughness={1} />
      </mesh>
      <instancedMesh ref={slats} args={[undefined, undefined, SLAT_COUNT]} receiveShadow>
        <boxGeometry args={[0.27, 8, 0.14]} />
        <meshStandardMaterial map={panel} roughness={0.7} />
      </instancedMesh>
      <mesh position={[0, 0.5, -4.8]}>
        <boxGeometry args={[26, 0.06, 0.06]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, 0.34, -4.82]}>
        <boxGeometry args={[26, 0.04, 0.02]} />
        <meshBasicMaterial color={palette.brass.rail} toneMapped={false} />
      </mesh>

      {/* round wall clock */}
      <group position={[3.9, 3.9, -4.78]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 40]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
        <mesh position={[0, 0, 0.056]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.01, 40]} />
          <meshStandardMaterial color={palette.clock.face} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.18, 0.07]}>
          <boxGeometry args={[0.04, 0.36, 0.01]} />
          <meshStandardMaterial color={palette.clock.hands} />
        </mesh>
        <mesh position={[0.14, 0.02, 0.07]} rotation={[0, 0, 1.2]}>
          <boxGeometry args={[0.04, 0.28, 0.01]} />
          <meshStandardMaterial color={palette.clock.hands} />
        </mesh>
      </group>

      <Laptop />

      {showNameplate && (
        <>
        {/* brass nameplate with its own warm light so the engraving catches the eye */}
        <group position={[-2.1, 0.03, 2.75]} rotation={[0, 0.18, 0]}>
          <RoundedBox args={[2.1, 0.12, 0.55]} radius={0.02} smoothness={3} position={[0, 0.06, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={palette.nameplate.base} roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.27, 0.02]} rotation={[-0.45, 0, 0]} castShadow>
            <boxGeometry args={[1.9, 0.34, 0.03]} />
            <meshStandardMaterial map={plate} emissiveMap={plate} emissive={palette.brass.plateGlow} emissiveIntensity={0.55} roughness={0.35} metalness={0.7} />
          </mesh>
          <pointLight position={[0.1, 0.9, 1.1]} color={palette.light.nameplate} intensity={5} distance={3.5} decay={2} />
        </group>
        </>
      )}

      {/* glazed mug with coffee, on a saucer */}
      <group position={[3.2, 0.03, -0.6]} rotation={[0, 0.6, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.42, 0.04, 48]} />
          <meshPhysicalMaterial color={palette.mug.saucer} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
        <group position={[0, 0.04, 0]}>
          <mesh geometry={mugBody} castShadow receiveShadow>
            <meshPhysicalMaterial color={palette.mug.glaze} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.249, 40]} />
            <meshPhysicalMaterial color={palette.mug.coffee} roughness={0.08} clearcoat={1} />
          </mesh>
          <mesh position={[0.3, 0.28, 0]} rotation={[0, 0, -Math.PI * 0.65]} castShadow>
            <torusGeometry args={[0.15, 0.036, 16, 36, Math.PI * 1.3]} />
            <meshPhysicalMaterial color={palette.mug.glaze} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} />
          </mesh>
        </group>
      </group>

      {/* book stack */}
      <group position={[3.9, 0.03, 0.5]} rotation={[0, -0.35, 0]}>
        {(
          [
            [palette.book.red, 1.35, 0.17],
            [palette.book.gold, 1.25, 0.14],
            [palette.book.teal, 1.3, 0.13],
          ] as const
        ).map(([c, w, h], i, arr) => {
          const y = arr.slice(0, i).reduce((a, b) => a + b[2], 0) + h / 2;
          return (
            <mesh key={c} position={[0, y, 0]} rotation={[0, i * 0.12, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, h, 0.95]} />
              <meshStandardMaterial color={c} roughness={0.75} />
            </mesh>
          );
        })}
      </group>

      {/* potted plant */}
      <group position={[-3.9, 0.03, -1.6]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.26, 0.44, 24]} />
          <meshStandardMaterial color={palette.plant.pot} roughness={0.8} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.22, 0.78 + (i % 3) * 0.12, Math.sin(a) * 0.22]} rotation={[Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]} scale={[0.14, 0.5, 0.06]} castShadow>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial color={i % 2 ? palette.plant.leafA : palette.plant.leafB} roughness={0.7} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
});
