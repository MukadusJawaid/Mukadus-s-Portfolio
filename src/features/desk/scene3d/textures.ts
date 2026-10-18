import * as THREE from "three";
import { palette } from "./palette";

export function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function finish(c: HTMLCanvasElement, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

/** tiny deterministic PRNG so textures look the same on every load */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/** Wood planks with grain. */
export function woodTexture(base: string = palette.wood.plank, repeat: [number, number] = [1, 1]) {
  const { c, g } = makeCanvas(1024, 512);
  const r = rng(7);
  g.fillStyle = base;
  g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? "255,220,180" : "0,0,0"},${0.03 + r() * 0.05})`;
    g.fillRect(0, i * 86, 1024, 86);
    g.fillStyle = "rgba(0,0,0,.55)";
    g.fillRect(0, i * 86, 1024, 2);
  }
  for (let i = 0; i < 520; i++) {
    const y = r() * 512;
    const amp = 2 + r() * 6;
    const f = 0.004 + r() * 0.01;
    g.strokeStyle = `rgba(${r() > 0.45 ? "20,10,5" : "190,140,95"},${0.04 + r() * 0.1})`;
    g.lineWidth = 0.6 + r() * 1.4;
    g.beginPath();
    for (let x = 0; x <= 1024; x += 16) g.lineTo(x, y + Math.sin(x * f + i) * amp);
    g.stroke();
  }
  return finish(c, repeat);
}

const TYPE = '"Courier New", Courier, ui-monospace, monospace';

/** Engraved brass plate. Light parts of the texture are also used as a faint glow. */
export function nameplateTexture(name: string, role: string) {
  const { c, g } = makeCanvas(1024, 256);
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, palette.brass.plateTop);
  gr.addColorStop(0.5, palette.brass.plateMid);
  gr.addColorStop(1, palette.brass.plateBottom);
  g.fillStyle = gr;
  g.fillRect(0, 0, 1024, 256);
  const r = rng(5);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(255,244,210,${r() * 0.1})`;
    g.fillRect(0, r() * 256, 1024, 1);
  }
  g.strokeStyle = "rgba(70,44,10,.6)";
  g.lineWidth = 4;
  g.strokeRect(14, 14, 996, 228);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "rgba(52,30,6,.95)";
  g.font = `700 92px ${TYPE}`;
  g.fillText(name.toUpperCase(), 512, 100);
  g.font = `700 40px ${TYPE}`;
  g.fillText(role.toUpperCase().split("").join(" "), 512, 190);
  return finish(c);
}
