import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { tokens } from "@/styles/tokens";
import { site } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${site.name}: ${site.jobTitle}, ${site.city}`;

/** The favicon as a data URI, read from the same file the browser tab uses. */
const iconUri = () => `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), "src/app/icon.svg")).toString("base64")}`;

/** The 1200x630 card shown when the site is shared (Google, LinkedIn, WhatsApp, X, ...). */
export function renderOg() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: `linear-gradient(135deg, ${tokens.og.gradient[0]} 0%, ${tokens.og.gradient[1]} 55%, ${tokens.og.gradient[2]} 100%)`,
          color: tokens.og.text,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* the favicon itself, so the share card and the browser tab always match */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconUri()} width={96} height={96} alt="" />
          <div style={{ fontSize: 34, color: tokens.og.url }}>{site.url.replace(/^https?:\/\//, "")}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 104, lineHeight: 1.05 }}>{site.name}</div>
          <div style={{ fontSize: 46, color: tokens.og.role }}>{site.jobTitle}</div>
          <div style={{ fontSize: 32, color: tokens.og.stack }}>React · Next.js · TypeScript · Three.js</div>
        </div>

        <div style={{ fontSize: 28, color: tokens.og.footer }}>{`${site.city}, ${site.country} · Interactive 3D portfolio`}</div>
      </div>
    ),
    { ...ogSize },
  );
}
