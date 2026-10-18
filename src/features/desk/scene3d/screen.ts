import { folders as allFolders } from "../data/folders";
import { owner, robot } from "../data/scene3d";
import type { Folder } from "../types";
import { palette } from "./palette";
import { readToken } from "../lib/tone";

/** The laptop screen is drawn into a 1280x800 canvas that is used as a texture. */
export const SW = 1280;
export const SH = 800;

type Rect = { x: number; y: number; w: number; h: number };
export type Hit = { t: "none" } | { t: "icon"; i: number } | { t: "file"; j: number } | { t: "close" } | { t: "back" };

export type ScreenView = {
  ch: number;
  file: number;
  hoverIcon: number;
  /** the file list for a hovered folder appears after a short rest, not instantly */
  popover: boolean;
  hoverRow: number;
  hoverClose: boolean;
  hoverBack: boolean;
  /** the screen is small in the view: big, simple greeting instead of small text */
  far?: boolean;
  /** 0 to 1 while the screen wakes up after being zoomed in on */
  wake?: number;
};

const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

/** one tile per folder on the desk (everything after the intro), spread evenly across the screen */
const TILE_COUNT = allFolders.length - 1;
const TILE_GAP = 232;
const tileX = (i: number) => SW / 2 + (i - (TILE_COUNT + 1) / 2) * TILE_GAP;
const TILE_Y = 436;
const TILE = 176;
const tileRect = (i: number): Rect => ({ x: tileX(i) - 108, y: TILE_Y - 100, w: 216, h: 290 });

const WIN: Rect = { x: 80, y: 84, w: 1120, h: 664 };
const closeRect: Rect = { x: WIN.x + 14, y: WIN.y + 12, w: 40, h: 40 };
/** "All folders" button in the window title bar: back to the desktop */
const backRect: Rect = { x: WIN.x + WIN.w - 206, y: WIN.y + 10, w: 184, h: 44 };
const LIST_X = WIN.x + 22;
const LIST_W = 480;
const rowRect = (j: number): Rect => ({ x: LIST_X, y: WIN.y + 86 + j * 82, w: LIST_W, h: 74 });

const inside = (r: Rect, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export function hitTest(ch: number, fileCount: number, x: number, y: number): Hit {
  if (ch === 0) {
    for (let i = 1; i <= TILE_COUNT; i++) if (inside(tileRect(i), x, y)) return { t: "icon", i };
    return { t: "none" };
  }
  if (inside(closeRect, x, y)) return { t: "close" };
  if (inside(backRect, x, y)) return { t: "back" };
  for (let j = 0; j < fileCount; j++) if (inside(rowRect(j), x, y)) return { t: "file", j };
  return { t: "none" };
}

/** Shortens a file name from the middle ("diploma-graphic…design.md") until it fits `max` pixels, keeping its ending. */
function fitEnd(g: CanvasRenderingContext2D, name: string, max: number) {
  if (g.measureText(name).width <= max) return name;
  const dot = name.lastIndexOf(".");
  const tail = dot > 0 ? name.slice(Math.max(0, dot - 6)) : name.slice(-6);
  let head = name.slice(0, Math.max(1, name.length - tail.length));
  while (head.length > 1 && g.measureText(head + "…" + tail).width > max) head = head.slice(0, -1);
  return head + "…" + tail;
}

function rrect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(" ");
  let line = "";
  let n = 0;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y + n * lh);
      line = w;
      if (++n >= maxLines) return y + n * lh;
    } else line = test;
  }
  if (line && n < maxLines) g.fillText(line, x, y + n++ * lh);
  return y + n * lh;
}

/** mix a hex colour toward white (t > 0) or black (t < 0) */
function shade(hex: string, t: number) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex; // the token has not resolved yet: draw it as given
  const n = parseInt(hex.slice(1), 16);
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(t >= 0 ? v + (255 - v) * t : v * (1 + t)));
  return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
}

function folderGlyph(g: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  g.save();
  g.translate(cx, cy);
  g.scale(scale, scale);
  g.fillStyle = "rgba(255,255,255,.55)";
  rrect(g, -46, -38, 40, 18, 7);
  g.fill();
  g.fillStyle = "rgba(255,255,255,.95)";
  rrect(g, -46, -28, 92, 66, 10);
  g.fill();
  g.fillStyle = "rgba(0,0,0,.08)";
  g.fillRect(-46, 18, 92, 20);
  g.restore();
}

function wallpaper(g: CanvasRenderingContext2D) {
  const bg = g.createLinearGradient(0, 0, SW, SH);
  bg.addColorStop(0, palette.screen.wallpaper[0]);
  bg.addColorStop(0.55, palette.screen.wallpaper[1]);
  bg.addColorStop(1, palette.screen.wallpaper[2]);
  g.fillStyle = bg;
  g.fillRect(0, 0, SW, SH);
  const blob = (x: number, y: number, r: number, c: string) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, c);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, SW, SH);
  };
  for (const b of palette.screen.blobs) blob(b.x, b.y, b.r, b.color);
}

function menuBar(g: CanvasRenderingContext2D) {
  g.fillStyle = "rgba(8,8,24,.42)";
  g.fillRect(0, 0, SW, 42);
  g.textBaseline = "middle";
  g.fillStyle = palette.white;
  g.font = `700 21px ${SANS}`;
  g.fillText("◆  " + owner.name, 22, 22);
  g.textAlign = "right";
  g.font = `500 19px ${SANS}`;
  g.fillStyle = "rgba(255,255,255,.78)";
  g.fillText(owner.role + "  ·  Karachi", SW - 22, 22);
  g.textAlign = "left";
}

function pixelFace(g: CanvasRenderingContext2D, cx: number, cy: number) {
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = "#9ee7ff";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(0, -62);
  g.lineTo(0, -82);
  g.stroke();
  g.fillStyle = "#9ee7ff";
  g.beginPath();
  g.arc(0, -88, 8, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#f4f7ff";
  rrect(g, -64, -62, 128, 104, 34);
  g.fill();
  g.fillStyle = "#14203f";
  rrect(g, -48, -42, 96, 58, 22);
  g.fill();
  g.fillStyle = "#7fe3ff";
  g.beginPath();
  g.arc(-22, -13, 9, 0, Math.PI * 2);
  g.arc(22, -13, 9, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function overview(g: CanvasRenderingContext2D, folders: Folder[], v: ScreenView) {
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  {
    g.fillStyle = palette.white;
    g.font = `700 66px ${SANS}`;
    g.fillText(`Hi, I'm ${owner.name}`, SW / 2, 216);
    g.fillStyle = "rgba(255,255,255,.8)";
    g.font = `500 28px ${SANS}`;
    g.fillText("Software engineer · React · Next.js · TypeScript", SW / 2, 264);
    g.fillStyle = "rgba(255,255,255,.55)";
    g.font = `400 22px ${SANS}`;
    g.fillText("Hover a folder to peek inside, click to open it", SW / 2, 302);
  }

  for (let i = 1; i <= TILE_COUNT; i++) {
    const f = folders[i];
    const hot = v.hoverIcon === i;
    const cx = tileX(i);
    const color = readToken(`--folder-${f.id}`);
    const s = hot ? 1.08 : 1;
    const cy = TILE_Y - (hot ? 8 : 0);
    g.save();
    g.translate(cx, cy);
    g.scale(s, s);
    g.shadowColor = hot ? color : "rgba(0,0,0,.5)";
    g.shadowBlur = hot ? 44 : 28;
    g.shadowOffsetY = hot ? 10 : 16;
    const gr = g.createLinearGradient(0, -TILE / 2, 0, TILE / 2);
    gr.addColorStop(0, shade(color, 0.28));
    gr.addColorStop(1, shade(color, -0.12));
    g.fillStyle = gr;
    rrect(g, -TILE / 2, -TILE / 2, TILE, TILE, 42);
    g.fill();
    g.shadowColor = "transparent";
    g.strokeStyle = "rgba(255,255,255,.35)";
    g.lineWidth = 2;
    rrect(g, -TILE / 2 + 1, -TILE / 2 + 1, TILE - 2, TILE - 2, 41);
    g.stroke();
    folderGlyph(g, 0, 4, 1.15);
    g.restore();

    g.textAlign = "center";
    g.fillStyle = palette.white;
    g.font = `700 px ${SANS}`;
    g.fillText(f.id[0].toUpperCase() + f.id.slice(1), cx, TILE_Y + 138);
    g.fillStyle = "rgba(255,255,255,.62)";
    g.font = `500 21px ${SANS}`;
    g.fillText(`${f.files.length} files`, cx, TILE_Y + 168);
  }

  if (v.hoverIcon > 0 && v.popover) {
    const f = folders[v.hoverIcon];
    const color = readToken(`--folder-${f.id}`);
    const pw = 380;
    const ph = 60 + f.files.length * 42;
    const px = Math.min(SW - pw - 24, Math.max(24, tileX(v.hoverIcon) - pw / 2));
    const py = TILE_Y + 140;
    g.shadowColor = "rgba(0,0,0,.5)";
    g.shadowBlur = 30;
    g.shadowOffsetY = 12;
    g.fillStyle = "rgba(16,16,36,.92)";
    rrect(g, px, py, pw, ph, 22);
    g.fill();
    g.shadowColor = "transparent";
    g.strokeStyle = "rgba(255,255,255,.2)";
    g.lineWidth = 2;
    rrect(g, px, py, pw, ph, 22);
    g.stroke();
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.fillStyle = color;
    g.font = `700 19px ${MONO}`;
    g.fillText(`~/root/${f.id}`, px + 26, py + 28);
    g.fillStyle = palette.white;
    g.font = `500 22px ${SANS}`;
    f.files.forEach((file, k) => {
      g.fillStyle = color;
      g.beginPath();
      g.arc(px + 32, py + 70 + k * 42, 5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = palette.white;
      g.fillText(file.name.length > 28 ? file.name.slice(0, 27) + "…" : file.name, px + 52, py + 71 + k * 42);
    });
  }
  g.textAlign = "left";
}

function windowView(g: CanvasRenderingContext2D, folders: Folder[], v: ScreenView) {
  const f = folders[v.ch];
  const color = readToken(`--folder-${f.id}`);

  g.shadowColor = "rgba(0,0,0,.55)";
  g.shadowBlur = 50;
  g.shadowOffsetY = 20;
  g.fillStyle = "rgba(14,14,34,.88)";
  rrect(g, WIN.x, WIN.y, WIN.w, WIN.h, 30);
  g.fill();
  g.shadowColor = "transparent";
  g.strokeStyle = "rgba(255,255,255,.18)";
  g.lineWidth = 2;
  rrect(g, WIN.x, WIN.y, WIN.w, WIN.h, 30);
  g.stroke();

  // traffic lights, the red one closes the window
  const dots: [string, number][] = [
    [readToken(v.hoverClose ? "--window-close-hover" : "--window-close"), 0],
    [readToken("--window-minimize"), 1],
    [readToken("--window-zoom"), 2],
  ];
  dots.forEach(([c, k]) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(WIN.x + 34 + k * 30, WIN.y + 32, 10, 0, Math.PI * 2);
    g.fill();
  });
  if (v.hoverClose) {
    g.strokeStyle = "rgba(80,0,0,.8)";
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(WIN.x + 29, WIN.y + 27);
    g.lineTo(WIN.x + 39, WIN.y + 37);
    g.moveTo(WIN.x + 39, WIN.y + 27);
    g.lineTo(WIN.x + 29, WIN.y + 37);
    g.stroke();
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "rgba(255,255,255,.85)";
  g.font = `600 23px ${SANS}`;
  g.fillText(f.id[0].toUpperCase() + f.id.slice(1), WIN.x + WIN.w / 2, WIN.y + 32);
  // back to the folders
  g.fillStyle = v.hoverBack ? "rgba(255,255,255,.26)" : "rgba(255,255,255,.12)";
  rrect(g, backRect.x, backRect.y, backRect.w, backRect.h, 22);
  g.fill();
  g.strokeStyle = "rgba(255,255,255,.22)";
  g.lineWidth = 2;
  rrect(g, backRect.x, backRect.y, backRect.w, backRect.h, 22);
  g.stroke();
  g.fillStyle = palette.white;
  g.font = `600 20px ${SANS}`;
  g.fillText("‹  All folders", backRect.x + backRect.w / 2, backRect.y + backRect.h / 2 + 1);
  g.textAlign = "left";
  g.fillStyle = "rgba(255,255,255,.1)";
  g.fillRect(WIN.x, WIN.y + 64, WIN.w, 2);
  g.fillRect(WIN.x + 22 + LIST_W + 20, WIN.y + 66, 2, WIN.h - 66);

  f.files.forEach((file, j) => {
    const r = rowRect(j);
    const sel = v.file === j;
    const hov = v.hoverRow === j;
    if (sel) {
      g.fillStyle = color;
      rrect(g, r.x, r.y, r.w, r.h, 18);
      g.fill();
    } else if (hov) {
      g.fillStyle = "rgba(255,255,255,.1)";
      rrect(g, r.x, r.y, r.w, r.h, 18);
      g.fill();
    }
    g.fillStyle = sel ? "rgba(255,255,255,.28)" : `${color}`;
    rrect(g, r.x + 14, r.y + 16, 42, 42, 12);
    g.fill();
    g.fillStyle = palette.white;
    g.font = `700 17px ${MONO}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(file.name.split(".").pop()!.slice(0, 3).toUpperCase(), r.x + 35, r.y + 38);
    g.textAlign = "left";
    // long names shrink a little, then lose their middle, so the ending (".md") always stays inside the row
    const room = r.w - 72 - 22;
    let size = 27;
    g.font = `600 ${size}px ${SANS}`;
    while (size > 21 && g.measureText(file.name).width > room) g.font = `600 ${--size}px ${SANS}`;
    g.fillText(fitEnd(g, file.name, room), r.x + 72, r.y + 29);
    g.fillStyle = sel ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.55)";
    g.font = `500 18px ${SANS}`;
    g.fillText(`${file.kind.toLowerCase()} · ${file.size}`, r.x + 72, r.y + 54);
  });

  // preview pane
  const px = WIN.x + 22 + LIST_W + 48;
  const pw = WIN.w - (px - WIN.x) - 28;
  g.textBaseline = "alphabetic";
  if (v.file >= 0) {
    const file = f.files[v.file];
    g.fillStyle = color;
    g.font = `700 18px ${MONO}`;
    g.fillText(file.kind, px, WIN.y + 112);
    g.fillStyle = palette.white;
    g.font = `700 34px ${SANS}`;
    let y = wrap(g, file.name, px, WIN.y + 158, pw, 40, 2);
    if (file.meta) {
      g.fillStyle = "rgba(255,255,255,.6)";
      g.font = `500 20px ${SANS}`;
      y = wrap(g, file.meta, px, y + 6, pw, 26, 2);
    }
    g.fillStyle = "rgba(255,255,255,.9)";
    g.font = `400 24px ${SANS}`;
    y = wrap(g, file.desc, px, y + 26, pw, 34, 5);
    let tx = px;
    let ty = y + 14;
    g.font = `600 18px ${MONO}`;
    for (const t of file.tags.slice(0, 6)) {
      const w = g.measureText(t).width + 26;
      if (tx + w > px + pw) {
        tx = px;
        ty += 44;
      }
      g.fillStyle = "rgba(255,255,255,.12)";
      rrect(g, tx, ty, w, 34, 17);
      g.fill();
      g.fillStyle = palette.white;
      g.fillText(t, tx + 13, ty + 24);
      tx += w + 10;
    }
  } else {
    g.fillStyle = "rgba(255,255,255,.9)";
    g.font = `700 34px ${SANS}`;
    g.fillText("Select a file", px, WIN.y + 158);
    g.fillStyle = "rgba(255,255,255,.6)";
    g.font = `400 24px ${SANS}`;
    wrap(g, f.line, px, WIN.y + 204, pw, 34, 4);
  }
  g.fillStyle = "rgba(255,255,255,.45)";
  g.font = `500 18px ${SANS}`;
  g.fillText(`${f.files.length} items`, WIN.x + 28, WIN.y + WIN.h - 22);
  if (f.badge) {
    g.font = `600 19px ${SANS}`;
    const w = g.measureText(f.badge).width + 34;
    const x = WIN.x + WIN.w - 28 - w;
    const y = WIN.y + WIN.h - 56;
    g.fillStyle = `${color}38`;
    rrect(g, x, y, w, 36, 18);
    g.fill();
    g.strokeStyle = `${color}99`;
    g.lineWidth = 2;
    rrect(g, x, y, w, 36, 18);
    g.stroke();
    g.fillStyle = palette.white;
    g.textBaseline = "middle";
    g.fillText(f.badge, x + 17, y + 19);
  }
}

/** Seen from far away the screen is asleep: no tiny folders, just a big hello from the robot. */
function sleeping(g: CanvasRenderingContext2D) {
  g.fillStyle = "#070b16";
  g.fillRect(0, 0, SW, SH);
  const glow = g.createRadialGradient(SW / 2, SH / 2 - 40, 20, SW / 2, SH / 2 - 40, 520);
  glow.addColorStop(0, "rgba(90,140,255,.22)");
  glow.addColorStop(1, "rgba(90,140,255,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, SW, SH);
  pixelFace(g, SW / 2, SH / 2 - 120);
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.fillStyle = palette.white;
  g.font = `800 104px ${SANS}`;
  g.fillText(`Hi, I'm ${robot.name}!`, SW / 2, SH / 2 + 80);
  g.fillStyle = "rgba(255,255,255,.7)";
  g.font = `600 44px ${SANS}`;
  g.fillText(`${owner.name}'s little helper. Zoom in to wake the screen.`, SW / 2, SH / 2 + 150);
  g.textAlign = "left";
}

export function drawScreen(g: CanvasRenderingContext2D, folders: Folder[], v: ScreenView) {
  if (v.ch === 0 && v.far) {
    sleeping(g);
    return;
  }
  wallpaper(g);
  menuBar(g);
  if (v.ch === 0) overview(g, folders, v);
  else windowView(g, folders, v);
  // waking up: the picture fades in from black, like a computer coming out of sleep
  if (v.wake !== undefined && v.wake < 1) {
    g.fillStyle = `rgba(0,0,0,${1 - v.wake * v.wake})`;
    g.fillRect(0, 0, SW, SH);
  }
  g.textAlign = "left";
}
