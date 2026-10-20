"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { figmaEmbed, type SiteProject } from "./data/projects";

type View = { key: string; label: string };

/** The "Session active" pill, kept at the right end of the window bar. Its layout is set here so it holds even if a style update is late. */
const LIVE_PILL: CSSProperties = {
  order: 3,
  marginLeft: "auto",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  flex: "none",
  padding: "2px clamp(7px, 2.4vw, 11px)",
  borderRadius: 999,
  fontSize: "clamp(9.5px, 2.7vw, 11.5px)",
  lineHeight: 1.4,
  whiteSpace: "nowrap",
  color: "var(--ok)",
  border: "1px solid color-mix(in oklab, var(--ok) 45%, transparent)",
  background: "color-mix(in oklab, var(--ok) 12%, transparent)",
};

/** The browser-style window of a project card: screenshots, a live site, or a Figma file, chosen with tabs. */
export function ProjectPreview({ project, index, title }: { project?: SiteProject; index: number; title: string }) {
  const views: View[] = [
    ...(project?.screens.length ? [{ key: "screens", label: "Screens" }] : []),
    ...(project?.live ? [{ key: "live", label: "Live" }] : []),
    ...(project?.figma ? [{ key: "figma", label: "Figma" }] : []),
  ];
  const [view, setView] = useState(views[0]?.key ?? "mock");
  const [shot, setShot] = useState(0);
  // an embedded page captures the mouse wheel, which stalls page scrolling, so it only takes input after a click
  const [interact, setInteract] = useState(false);
  // the live page stays invisible until it has loaded, so the still image shows instead of a white box
  const [cycle, setCycle] = useState(0);
  const [loadedCycle, setLoadedCycle] = useState(-1);
  const loaded = loadedCycle === cycle;
  // the hint pill shows for a few seconds as soon as the page has loaded, so it is clear the frame can be clicked
  const [hint, setHint] = useState(false);
  const runningRef = useRef(false);
  const interactRef = useRef(false);
  // an embedded site or Figma file loads by itself, but only for the card on top and once scrolling has paused
  const [armed, setArmed] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState(false);

  // the live site renders at a real desktop width and is scaled down to fit the frame
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // on a phone the page is rendered at tablet width, so the scaled-down site stays readable
  const frameW = box.w && box.w < 520 ? 720 : 1280;
  const scale = box.w ? box.w / frameW : 1;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showHint = () => {
    setHint(true);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(false), 5000);
  };
  useEffect(() => () => clearTimeout(hintTimer.current), []);

  // tapping or clicking anywhere outside the frame hands the scroll back to the page (a finger lifting must not do it, which
  // is what the old pointer-leave rule did on touch screens)
  const shotRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    interactRef.current = interact;
  }, [interact]);
  // a mouse that slips out of the frame for a moment (to the edge, or onto the scroll bar) does not end the session at once
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(leaveTimer.current), []);
  useEffect(() => {
    if (!interact) return;
    const away = (e: PointerEvent) => {
      if (!shotRef.current?.contains(e.target as Node)) setInteract(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [interact]);

  // one live site at a time: only the card on top of the stack (marked data-active by the page) runs its site, and only
  // once scrolling has paused. Loading a whole website mid-scroll is what makes it stutter, and a page left running behind
  // a stacked card keeps animating, so it is unloaded as soon as another card takes over.
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if ((!project?.live && !project?.figma) || !wrap.current) return;
    const card = wrap.current.closest(".sx-card");
    let lastScroll = 0;
    const onScroll = () => (lastScroll = performance.now());
    addEventListener("scroll", onScroll, { passive: true });
    const tick = setInterval(() => {
      const active = Boolean(card?.hasAttribute("data-active"));
      const idle = performance.now() - lastScroll > 450;
      if (active && idle && !runningRef.current) {
        // the first time this card is on top: load its page (once)
        runningRef.current = true;
        setCycle((c) => c + 1);
        setArmed({ live: true, figma: true });
        setShown(true);
      } else if (runningRef.current) {
        // after that the page stays loaded. Behind another card it is only hidden (no rendering cost, no reload), so coming
        // back to it is instant instead of loading the site all over again
        const show = active || interactRef.current;
        setShown((was) => (was === show ? was : show));
      }
    }, 250);
    return () => {
      removeEventListener("scroll", onScroll);
      clearInterval(tick);
    };
  }, [project?.live, project?.figma]);

  const url = view === "live" ? project?.live?.url : view === "figma" ? project?.figma?.url : undefined;

  return (
    <div className="sx-preview" ref={wrap}>
      <div
        className="sx-shot"
        ref={shotRef}
        // a mouse leaving the frame gives the wheel back to the page; the whole frame (bar included) activates the preview
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          clearTimeout(leaveTimer.current);
          leaveTimer.current = setTimeout(() => setInteract(false), 900);
        }}
        onPointerEnter={() => clearTimeout(leaveTimer.current)}
        onPointerDown={(e) => {
          if (armed[view] && !interact && !(e.target as HTMLElement).closest("a, .sx-gtabs")) setInteract(true);
        }}
      >
        <div className="sx-bar">
          <i />
          <i />
          <i />
          {interact && (
            <span className="sx-live-on sx-mono" role="status" style={LIVE_PILL}>
              <i /> Session active
            </span>
          )}
          {url && (
            <a className="sx-url sx-mono" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title} in a new tab`}>
              {url.replace(/^https?:\/\/(www\.)?/, "").split("?")[0]} <ArrowUpRight size={12} />
            </a>
          )}
        </div>

        {view === "screens" && project && (
          <div className="sx-stage">
            {project.screens.map((s, k) => (
              <Image key={s.src} src={s.src} alt={s.alt ?? `${title}, ${s.label}`} fill sizes="(min-width: 900px) 800px, 100vw" className={k === shot ? "on" : ""} />
            ))}
          </div>
        )}

        {(view === "live" || view === "figma") && project && (
          <div className="sx-stage" ref={stage} data-interact={interact ? "" : undefined}>
            {/* a still of the site always sits underneath, so the frame is never empty while the page loads or is paused */}
            {view === "live" && project.poster && <Image src={project.poster} alt="" fill sizes="(min-width: 900px) 800px, 100vw" className="on sx-poster" priority={false} />}
            {armed[view] ? (
              <>
              <iframe
                title={view === "live" ? project.live!.title : project.figma!.title}
                src={view === "live" ? project.live!.url : figmaEmbed(project.figma!.url)}
                loading="lazy"
                allow="fullscreen; clipboard-write"
                referrerPolicy="no-referrer"
                onLoad={() => {
                  setLoadedCycle(cycle);
                  showHint();
                }}
                style={{ width: frameW, height: box.h / scale, transform: `scale(${scale})`, pointerEvents: interact ? "auto" : "none", opacity: loaded ? 1 : 0, transition: "opacity .4s", display: shown ? undefined : "none" }}
              />
              {!interact && shown && (
                <button className={`sx-cover${hint ? " hint" : ""}`} onClick={() => setInteract(true)} aria-label="Click to interact with the preview">
                  <span>Click to interact</span>
                </button>
              )}
              </>
            ) : (
              !(view === "live" && project.poster) && (
                <div className="sx-skel" role="status">
                  <span className="sx-mono">Loading preview…</span>
                </div>
              )
            )}
          </div>
        )}

        {view === "mock" && (
          <>
            <div className="sx-mock">
              <div>
                <b />
                <b />
                <b />
                <b />
              </div>
              <div className="m">
                <u />
                <u />
                <u />
                <u />
              </div>
            </div>
            <span className="sx-big sx-mono">{String(index + 1).padStart(2, "0")}</span>
          </>
        )}

        {views.length > 1 || (view === "screens" && (project?.screens.length ?? 0) > 1) ? (
          <div className="sx-gtabs" role="group" aria-label="Preview views">
            {views.length > 1 &&
              views.map((v) => (
                <button key={v.key} className={v.key === view ? "on" : ""} onClick={() => setView(v.key)}>
                  {v.label}
                </button>
              ))}
            {view === "screens" &&
              project!.screens.length > 1 &&
              project!.screens.map((s, k) => (
                <button key={s.src} className={k === shot ? "on" : ""} onClick={() => setShot(k)}>
                  {s.label}
                </button>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
