"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { Slides } from "./Slides";
import { MenuDrawer } from "./MenuDrawer";
import { ScrollTop } from "./ScrollTop";
import { useMenuStore } from "./useMenuStore";
import { TransitionLink } from "@/features/transition/TransitionLink";
import { ArrowUpRight, Code2, Database, Layers, Menu, Briefcase, Cpu, FolderKanban, GraduationCap, Mail, UserRound, Wrench, type LucideIcon } from "lucide-react";
import { folders } from "@/features/desk/data/folders";
import { owner, robot, shell } from "@/features/desk/data/scene3d";
import { folderTone } from "@/features/desk/lib/tone";
import type { DeskFile } from "@/features/desk/types";
import { deskSession } from "@/features/desk/lib/session";
import { siteProjectFor } from "./data/projects";
import "./site.css";

// loaded after the page is interactive: the robot is decoration, and the previews bring images and embedded sites with them
const MouseBuddy = dynamic(() => import("./MouseBuddy").then((m) => m.MouseBuddy), { ssr: false });
const ProjectPreview = dynamic(() => import("./ProjectPreview").then((m) => m.ProjectPreview), {
  ssr: false,
  loading: () => (
    <div className="sx-preview">
      <div className="sx-shot" aria-hidden />
    </div>
  ),
});

const folder = (id: string) => folders.find((f) => f.id === id)!;
const accent = (id: string) => ({ "--acc": folderTone(id) }) as CSSProperties;
const clean = (label: string) => label.replace(/\s*↗$/, "");

const projects = folder("projects").files;
const experience = folder("experience");
const skills = folder("skills").files;
const education = folder("education").files;
const about = folder("about").files;
const bio = about.find((f) => f.name === "bio.md")!;
// the first note repeats the degree already in the lead; the last one is shown on its own as the "open to work" note
const aboutPoints = bio.notes.slice(1, -1);
const aboutOpen = bio.notes.at(-1) ?? "";
const contact = about.find((f) => f.name === "contact.json")!;

/** "Dec 2025 – Present · Front-End Engineer" -> "Now"; "Jan 2024 – Dec 2025 · ..." -> "2024" */
const eraOf = (meta = "") => (/Present/.test(meta) ? "Now" : (meta.match(/\d{4}/)?.[0] ?? ""));
const emailOf = (links: typeof contact.links) => links.find((l) => l.slug === "email")?.url.replace("mailto:", "") ?? "";

const STATS = [
  ["2.5+", "years of experience"],
  ["10+", "client projects shipped"],
  ["6+", "languages in i18n apps"],
  ["1 mo", "idea to MVP, at best"],
] as const;

const NAV = [
  ["work", "Projects"],
  ["experience", "Experience"],
  ["skills", "Skills"],
  ["education", "Education"],
  ["about", "About"],
  ["contact", "Contact"],
] as const;

/** The skill pills. On mid-size screens only the first four show, with a button for the rest (see site.css). */
function Chips({ tags }: { tags: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={`sx-chips${open ? " open" : ""}`}>
        {tags.slice(0, 4).map((t) => (
          <span key={t} className="sx-chip">
            {t}
          </span>
        ))}
        {/* the rest: flows with the others on wide screens, and opens smoothly below the first four on mid-size ones */}
        <div className="sx-extra">
          <div className="sx-extra-in">
            {tags.slice(4).map((t, k) => (
              <span key={t} className="sx-chip" style={{ "--k": k } as CSSProperties}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      {tags.length > 4 && (
        <button type="button" className="sx-more" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Show less" : `Show ${tags.length - 4} more`}
        </button>
      )}
    </>
  );
}

const SKILL_ICONS: Record<string, LucideIcon> = {
  "languages.md": Code2,
  "frontend-stack.md": Layers,
  "backend-and-data.md": Database,
  "practices-and-tools.md": Wrench,
};

const NAV_ICONS: Record<(typeof NAV)[number][0], LucideIcon> = {
  work: FolderKanban,
  experience: Briefcase,
  skills: Cpu,
  education: GraduationCap,
  about: UserRound,
  contact: Mail,
};

/** The award entry of the education tabs: a bronze medal and the newspaper clipping with the name highlighted. */
function Award({ file }: { file: DeskFile }) {
  return (
    <a className="sx-award" href={file.links[0].url} target="_blank" rel="noopener noreferrer">
      <span className="sx-medal" aria-hidden>
        <i />
        <b>3</b>
      </span>
      <span className="sx-clip" aria-label="Newspaper clipping">
        <span className="sx-clip-top">
          <span className="sx-clip-paper">The Nation</span>
          <span>27 April 2024</span>
        </span>
        <span className="sx-clip-title">SSUET convocation held, 1,177 degrees awarded</span>
        <span className="sx-clip-lines" aria-hidden>
          <i />
          <i />
        </span>
        <span className="sx-clip-hit">
          …<mark>Mukadus Jawaid</mark> (Software Engineering)…
        </span>
        <span className="sx-clip-lines" aria-hidden>
          <i />
          <i />
        </span>
        <span className="sx-award-src">
          Read the article <ArrowUpRight size={14} />
        </span>
      </span>
    </a>
  );
}

const Section = ({ id, tone, alt, children, pattern }: { id: string; tone: string; alt?: boolean; pattern: "grid" | "dots" | "diag"; children: React.ReactNode }) => (
  <section id={id} className={`sx-band${alt ? " alt" : ""}`} style={accent(tone)} aria-labelledby={`${id}-h`}>
    <div className="sx-pat sx-pat-glow" />
    <div className={`sx-pat sx-pat-${pattern}`} />
    <div className="sx-wrap sx-above">{children}</div>
  </section>
);

const Heading = ({ id, label, title, lead }: { id: string; label: string; title: string; lead?: string }) => (
  <div className="sx-side">
    <div className="sx-label sx-rv">{label}</div>
    <h2 id={`${id}-h`} className="sx-rv" style={{ "--d": 1 } as CSSProperties}>
      {title}
    </h2>
    {lead && (
      <p className="sx-rv" style={{ "--d": 2 } as CSSProperties}>
        {lead}
      </p>
    )}
  </div>
);

export function Website() {
  const root = useRef<HTMLDivElement>(null);
  const [eduIndex, setEduIndex] = useState(0);

  // the highlight behind the active education tab slides to the chosen tab (small screens, where the tabs are pills)
  useEffect(() => {
    const place = () => {
      const row = document.querySelector<HTMLElement>(".sx-etabs");
      const tab = row?.querySelectorAll<HTMLElement>("button")[eduIndex];
      if (!row || !tab) return;
      row.style.setProperty("--tx", `${tab.offsetLeft}px`);
      row.style.setProperty("--ty", `${tab.offsetTop}px`);
      row.style.setProperty("--tw", `${tab.offsetWidth}px`);
      row.style.setProperty("--th", `${tab.offsetHeight}px`);
    };
    place();
    addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, [eduIndex]);

  // the way back to the desk should be instant: fetch its 3D code and models while the visitor reads, and remember to skip the intro
  useEffect(() => {
    deskSession.returning = true;
    const warm = () => void import("@/features/desk/scene3d/DeskScene");
    const id = window.setTimeout(warm, 5000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const $ = <T extends Element>(s: string) => el.querySelector<T>(s);
    const $$ = <T extends Element>(s: string) => [...el.querySelectorAll<T>(s)];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // reveal on scroll
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0 },
    );
    const all = $$(".sx-rv");
    all.forEach((n) => io.observe(n));
    // safety net: anything that has scrolled into view is revealed on the next scroll frame, even if the observer missed it
    let pending = all;

    const nav = $<HTMLElement>(".sx-nav")!;
    const bar = $<HTMLElement>(".sx-progress")!;
    const h1 = $<HTMLElement>(".sx-hero h1")!;
    const cards = $$<HTMLElement>(".sx-card");
    const edu = $<HTMLElement>("#education")!;
    const eduPin = $<HTMLElement>(".sx-pin2")!;
    const eduStage = $<HTMLElement>(".sx-edu-stage");
    const index = $$<HTMLElement>(".sx-index a");
    const exp = $<HTMLElement>("#experience")!;
    const pin = $<HTMLElement>(".sx-pin")!;
    const panesEl = $<HTMLElement>(".sx-panes");
    const spans = $$(".sx-ebig span");
    const rail = $$<HTMLButtonElement>(".sx-rail button");
    const panes = $$(".sx-pane");
    const navLinks = $$<HTMLAnchorElement>(".sx-links a[href^='#']:not(.sx-btn)");
    const ids = ["top", ...NAV.map(([id]) => id)];
    const secs = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    let act = -1;
    let lastPa = -1;
    let eduAct = 0;

    const setAct = (i: number) => {
      if (i === act) return;
      act = i;
      [spans, rail, panes].forEach((list) =>
        list.forEach((n, k) => {
          n.classList.toggle("on", k === i);
          n.classList.toggle("past", k < i);
        }),
      );
    };
    setAct(0);

    const jump = (i: number) => {
      const top = scrollY + exp.getBoundingClientRect().top;
      const span = exp.offsetHeight - pin.offsetHeight;
      scrollTo({ top: top + span * ((i + 0.5) / experience.files.length), behavior: reduce ? "auto" : "smooth" });
    };
    // phones: scroll the carousel so the given card sits in the middle, with a peek of its neighbours on both sides
    let slide = 0;
    const centreCard = (card: HTMLElement) => {
      if (!eduStage || getComputedStyle(eduStage).display !== "flex") return;
      const from = eduStage.scrollLeft;
      const to = card.offsetLeft - (eduStage.clientWidth - card.offsetWidth) / 2;
      cancelAnimationFrame(slide);
      if (reduce) return void (eduStage.scrollLeft = to);
      // our own quick glide (a third of a second); the browser's smooth scroll is slower, and snapping is paused while it runs
      const t0 = performance.now();
      eduStage.style.scrollSnapType = "none";
      const run = (now: number) => {
        const p = Math.min(1, (now - t0) / 340);
        eduStage.scrollLeft = from + (to - from) * (1 - Math.pow(1 - p, 3));
        if (p < 1) slide = requestAnimationFrame(run);
        else eduStage.style.removeProperty("scroll-snap-type");
      };
      slide = requestAnimationFrame(run);
    };
    const jumpEdu = (i: number) => {
      if (edu.offsetHeight - eduPin.offsetHeight <= 8) {
        // phones: the cards are a sideways carousel, so the tab scrolls to its card
        setEduIndex(i);
        const card = eduStage?.querySelectorAll<HTMLElement>(".sx-edu-card")[i];
        if (card) centreCard(card);
        eduAct = i;
        return;
      }
      const top = scrollY + edu.getBoundingClientRect().top;
      const span = edu.offsetHeight - eduPin.offsetHeight;
      scrollTo({ top: top + span * ((i + 0.5) / education.length), behavior: reduce ? "auto" : "smooth" });
    };
    // the carousel tells the tabs which card is in front
    const onStageScroll = () => {
      if (!eduStage || getComputedStyle(eduStage).display !== "flex") return;
      const cards = [...eduStage.querySelectorAll<HTMLElement>(".sx-edu-card")];
      let best = 0;
      let gap = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - eduStage.scrollLeft - eduStage.clientWidth / 2);
        if (d < gap) {
          gap = d;
          best = i;
        }
      });
      if (best !== eduAct) {
        eduAct = best;
        setEduIndex(best);
      }
    };
    eduStage?.addEventListener("scroll", onStageScroll, { passive: true });
    // the cards slide on by themselves, unless you are touching them or the section is off screen
    let eduHold = 0;
    const holdEdu = () => (eduHold = performance.now() + 9000);
    eduStage?.addEventListener("pointerdown", holdEdu, { passive: true });
    eduStage?.addEventListener("wheel", holdEdu, { passive: true });
    const eduAuto = window.setInterval(() => {
      if (!eduStage || reduce || performance.now() < eduHold || getComputedStyle(eduStage).display !== "flex") return;
      const box = eduStage.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      const cards = eduStage.querySelectorAll<HTMLElement>(".sx-edu-card");
      const next = (eduAct + 1) % cards.length;
      eduAct = next;
      setEduIndex(next); // tabs, dots and the front card change together with the slide
      centreCard(cards[next]);
    }, 3200);
    const eduTabs = $$<HTMLButtonElement>(".sx-etabs button");
    const onEdu = eduTabs.map((b, i) => {
      const fn = () => jumpEdu(i);
      b.addEventListener("click", fn);
      return fn;
    });
    const onRail = rail.map((b, i) => {
      const fn = () => jump(i);
      b.addEventListener("click", fn);
      return fn;
    });

    const frame = () => {
      const y = scrollY;
      const vh = innerHeight;
      nav.classList.toggle("on", y > 20);
      if (pending.length) {
        pending = pending.filter((n) => {
          if (n.classList.contains("in")) return false;
          const r = n.getBoundingClientRect();
          if (r.top < vh * 0.96 && r.bottom > 0) {
            n.classList.add("in");
            return false;
          }
          return true;
        });
      }
      bar.style.setProperty("--p", String(Math.min(1, y / Math.max(1, document.documentElement.scrollHeight - vh))));
      if (!reduce) {
        const p = Math.min(1, y / (vh * 0.7));
        h1.style.transform = `translateY(${-p * 50}px) scale(${1 - p * 0.05})`;
        // each project card shrinks and dims as the next one slides over it. All layout reads happen first, then
        // the writes, so the browser lays out once per frame instead of once per card.
        const rects = cards.map((c) => c.getBoundingClientRect());
        cards.forEach((c, i) => {
          const next = rects[i + 1];
          if (!next) return;
          const r = rects[i];
          const q = Math.max(0, Math.min(1, (r.top + r.height * 0.55 - next.top) / (r.height * 0.55)));
          c.style.setProperty("--dim", String((q * 0.35).toFixed(3)));
        });
      }
      const r = exp.getBoundingClientRect();
      const span = exp.offsetHeight - pin.offsetHeight;
      if (r.top <= vh && r.bottom >= 0) setAct(Math.floor(Math.max(0, Math.min(0.9999, -r.top / span)) * experience.files.length));
      if (panesEl) {
        if (span > 8 && matchMedia("(max-width: 768px)").matches) {
          // phones: a role taller than the screen slides up inside its window before the next role takes over
          const rel = Math.max(0, Math.min(0.9999, -r.top / span)) * experience.files.length;
          const panesTop = panesEl.getBoundingClientRect().top - pin.getBoundingClientRect().top;
          const pane = panesEl.querySelector<HTMLElement>(".sx-pane.on");
          const last = pane?.lastElementChild as HTMLElement | null;
          const natural = last ? last.offsetTop + last.offsetHeight + 36 : 0; // the role's real height, plus room so the last line clears the soft fade at the bottom
          const room = Math.max(260, innerHeight - panesTop - 96);
          panesEl.style.height = `${Math.min(room, Math.max(260, natural))}px`; // never taller than the content, so tall screens get no empty block
          const over = Math.max(0, natural - panesEl.clientHeight);
          const t = Math.max(0, Math.min(1, (rel - Math.floor(rel) - 0.15) / 0.7));
          panesEl.style.setProperty("--pshift", `${(-over * t).toFixed(1)}px`);
        } else {
          panesEl.style.removeProperty("height");
          panesEl.style.removeProperty("--pshift");
        }
      }

      const er = edu.getBoundingClientRect();
      if (er.top <= vh && er.bottom >= 0) {
        const eduSpan = edu.offsetHeight - eduPin.offsetHeight;
        const rel = eduSpan > 8 ? Math.max(0, Math.min(0.9999, -er.top / eduSpan)) * education.length : eduAct;
        const ei = Math.floor(rel);
        if (eduStage && eduSpan > 8 && matchMedia("(min-width: 769px) and (max-width: 992px)").matches) {
          // tablets: an entry taller than the screen scrolls up inside its window before the next entry takes over
          const stageTop = eduStage.getBoundingClientRect().top - eduPin.getBoundingClientRect().top; // where the window starts inside the pinned screen
          const card = eduStage.querySelector<HTMLElement>(".sx-edu-card.on");
          const room = Math.max(240, innerHeight - stageTop - 96);
          eduStage.style.height = `${Math.min(room, Math.max(240, card ? card.offsetHeight : 0))}px`; // never taller than the content
          const over = card ? Math.max(0, card.offsetHeight - eduStage.clientHeight) : 0;
          const t = Math.max(0, Math.min(1, (rel - ei - 0.15) / 0.7));
          eduStage.style.setProperty("--eshift", `${(-over * t).toFixed(1)}px`);
        } else if (eduStage) {
          eduStage.style.removeProperty("--eshift");
        }
        if (ei !== eduAct) {
          eduAct = ei;
          setEduIndex(ei);
        }
      }

      let pa = 0;
      cards.forEach((c, i) => {
        if (c.getBoundingClientRect().top < vh * 0.5) pa = i;
      });
      index.forEach((l, i) => l.classList.toggle("on", i === pa));
      if (pa !== lastPa) {
        // on phones the project list is one scrolling line: keep the current project in view
        lastPa = pa;
        const cur = index[pa];
        const row = cur?.parentElement;
        if (cur && row && row.scrollWidth > row.clientWidth + 2) row.scrollTo({ left: cur.offsetLeft - row.clientWidth / 2 + cur.offsetWidth / 2, behavior: "smooth" });
      }
      // only the card on top may run a live site (see ProjectPreview)
      const pr = cards[pa]?.getBoundingClientRect();
      const onScreen = Boolean(pr && pr.top < vh * 0.9 && pr.bottom > vh * 0.2);
      cards.forEach((c, i) => c.toggleAttribute("data-active", onScreen && i === pa));

      let a = "top";
      secs.forEach((s) => {
        if (s.getBoundingClientRect().top < vh * 0.45) a = s.id;
      });
      navLinks.forEach((l) => l.classList.toggle("act", l.getAttribute("href") === `#${a}`));
    };

    // In-page links glide to their section with our own animation. It re-reads the section's position every frame, so
    // it still lands correctly when sticky cards or lazily loaded previews shift the layout while it runs.
    let glide = 0;
    const stopGlide = () => cancelAnimationFrame(glide);
    const goTo = (id: string) => {
      const target = document.getElementById(id);
      if (!target) return;
      const topOf = () => (id === "top" ? 0 : target.getBoundingClientRect().top + scrollY - 64);
      const from = scrollY;
      if (reduce) {
        scrollTo({ top: topOf(), behavior: "instant" });
        return;
      }
      const duration = Math.min(1100, 380 + Math.abs(topOf() - from) * 0.11);
      const t0 = performance.now();
      stopGlide();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        scrollTo({ top: from + (topOf() - from) * e, behavior: "instant" });
        if (t < 1) glide = requestAnimationFrame(step);
        else history.replaceState(null, "", `#${id}`);
      };
      glide = requestAnimationFrame(step);
    };
    const onLinkClick = (e: Event) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>("a[href^='#']");
      const id = link?.getAttribute("href")?.slice(1);
      if (link && id && document.getElementById(id)) {
        e.preventDefault();
        goTo(id);
      }
    };
    el.addEventListener("click", onLinkClick);
    // the visitor taking over (wheel, touch, keys) cancels a glide in progress
    addEventListener("wheel", stopGlide, { passive: true });
    addEventListener("touchstart", stopGlide, { passive: true });
    addEventListener("keydown", stopGlide);
    const hero = $<HTMLElement>(".sx-hero")!;
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", String(((e.clientX - r.left) / r.width - 0.5).toFixed(3)));
      hero.style.setProperty("--my", String(((e.clientY - r.top) / r.height - 0.5).toFixed(3)));
    };
    if (!reduce) hero.addEventListener("pointermove", onMove);

    // while the page is scrolling, embedded sites are hidden (the still image shows instead): a page that keeps animating
    // inside a card is what makes scrolling stutter. They come back a moment after scrolling stops.
    let calm = 0;
    const markScrolling = () => {
      el.classList.add("scrolling");
      clearTimeout(calm);
      calm = window.setTimeout(() => el.classList.remove("scrolling"), 180);
    };
    addEventListener("scroll", markScrolling, { passive: true });

    let tick = false;
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        // one failed frame must never switch the scroll effects off for good
        try {
          frame();
        } catch (err) {
          console.error("site scroll frame failed", err);
        } finally {
          tick = false;
        }
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", frame);
    frame();

    return () => {
      io.disconnect();
      el.removeEventListener("click", onLinkClick);
      removeEventListener("scroll", markScrolling);
      clearTimeout(calm);
      removeEventListener("wheel", stopGlide);
      removeEventListener("touchstart", stopGlide);
      removeEventListener("keydown", stopGlide);
      stopGlide();
      hero.removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      eduStage?.removeEventListener("scroll", onStageScroll);
      eduStage?.removeEventListener("pointerdown", holdEdu);
      eduStage?.removeEventListener("wheel", holdEdu);
      clearInterval(eduAuto);
      cancelAnimationFrame(slide);
      removeEventListener("resize", frame);
      rail.forEach((b, i) => b.removeEventListener("click", onRail[i]));
      eduTabs.forEach((b, i) => b.removeEventListener("click", onEdu[i]));
    };
  }, []);

  return (
    <div ref={root} className="sx">
      <a className="sx-skip" href="#work">
        Skip to projects
      </a>

      <div className="sx-progress" aria-hidden />
      <MouseBuddy />
      <nav className="sx-nav" aria-label="Main">
        <div className="sx-wrap">
          <a className="sx-logo sx-mono" href="#top">
            <i />
            {shell.user}
          </a>
          <div className="sx-links">
            {NAV.slice(0, 5).map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
            <TransitionLink className="sx-btn sm sx-hide-xs" href="/" label="cd ~/desk">
              Open the desk
            </TransitionLink>
            <a className="sx-btn sm pri hide-sm" href="#contact">
              Contact me
            </a>
            <button type="button" className="sx-burger" aria-label="Open menu" aria-haspopup="dialog" aria-controls="sx-drawer" onClick={() => useMenuStore.getState().setOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <ScrollTop />
      <MenuDrawer items={NAV.map(([id, label]) => ({ id, label, Icon: NAV_ICONS[id] }))} />

      <main id="top">
        <header className="sx-hero" style={accent("intro")}>
          <div className="sx-pat sx-pat-glow" />
          <div className="sx-pat sx-pat-grid" />
          <div className="sx-pat sx-pat-dots" />
          <div className="sx-wrap sx-above sx-herogrid">
            <div>
              <div className="sx-pill sx-rv">
                <i />
                {experience.badge}
              </div>
              <h1 className="sx-rv" style={{ "--d": 1 } as CSSProperties}>
                Interfaces that feel <span>effortless to use.</span>
              </h1>
              <p className="sx-lede sx-rv" style={{ "--d": 2 } as CSSProperties}>
                I&apos;m {owner.name}, a frontend engineer in Karachi. I design and build fast, polished web products with React, Next.js and TypeScript, from first sketch to launch.
              </p>
              <div className="sx-cta sx-rv" style={{ "--d": 3 } as CSSProperties}>
                <a className="sx-btn pri" href="#work">
                  See my projects
                </a>
                <TransitionLink className="sx-btn" href="/" label="cd ~/desk">
                  Open the 3D desk
                </TransitionLink>
              </div>
              <dl className="sx-stats sx-rv" style={{ "--d": 4 } as CSSProperties}>
                {STATS.map(([n, l]) => (
                  <div key={l} style={{ "--k": STATS.findIndex((s) => s[1] === l) } as CSSProperties}>
                    <dt className="sx-mono">{n}</dt>
                    <dd>{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* a miniature of the laptop screen from the desk, with floating notes around it */}
            <div className="sx-device sx-rv" style={{ "--d": 2 } as CSSProperties} aria-hidden>
              <span className="sx-bot-anchor">
                <span className="sx-bubble">
                  <b>Hi, I&apos;m {robot.name}!</b>
                  Mukadus&apos;s little helper. Scroll down and I&apos;ll be your cursor for the tour.
                </span>
              </span>
              <div className="sx-win">
                <div className="sx-bar">
                  <i />
                  <i />
                  <i />
                  <span className="sx-mono">{shell.user} — desk</span>
                </div>
                <div className="sx-winbody">
                  <b>Hi, I&apos;m {owner.name}</b>
                  <small>Software engineer · React · Next.js · TypeScript</small>
                  <div className="sx-minitiles">
                    {folders.slice(1).map((f, k) => (
                      <span key={f.id} style={{ "--t": folderTone(f.id), "--k": k } as CSSProperties}>
                        <i />
                        {f.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sx-note n1 sx-mono">
                <span className="g">~</span> cd projects
                <br />
                <span className="d">3 files · wattwise.md</span>
              </div>
              <div className="sx-note n2">
                <b>80+</b> Lighthouse
              </div>
              <div className="sx-note n3">
                <i /> Open to work
              </div>
            </div>
          </div>
        </header>

        <Section id="work" tone="projects" alt pattern="dots">
          <div className="sx-split">
            <div className="sx-side">
              <Heading id="work" label="Projects" title="Things I've built" lead={folder("projects").line} />
              <nav className="sx-index sx-rv" style={{ "--d": 2 } as CSSProperties} aria-label="Project index">
                {projects.map((p, i) => (
                  <a key={p.name} href={`#p${i}`}>
                    {p.title}
                  </a>
                ))}
              </nav>
            </div>
            <div className="sx-stack">
              {projects.map((p, i) => (
                <article key={p.name} id={`p${i}`} className="sx-card" style={{ "--i": i, ...accent(i % 2 ? "about" : "projects") } as CSSProperties}>
                  <ProjectPreview project={siteProjectFor(p.name)} index={i} title={p.title ?? p.name} />
                  <div className="sx-pbody">
                    <div>
                      <h3>
                        {p.title}
                        {p.kind === "EARLY PROJECT" && <span className="sx-epill sx-mono">Early</span>}
                      </h3>
                      <div className="sx-meta">{p.meta}</div>
                      <p className="sx-d">{p.desc}</p>
                      {siteProjectFor(p.name)?.story && <p className="sx-d">{siteProjectFor(p.name)!.story}</p>}
                      <div className="sx-tags">
                        {p.tags.map((t) => (
                          <span key={t} className="sx-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sx-btns">
                      {p.links.map((l) => (
                        <a key={l.slug} className={`sx-btn sm${l.primary ? " pri" : ""}`} href={l.url} target="_blank" rel="noopener noreferrer">
                          {clean(l.t)} <ArrowUpRight size={15} />
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <section id="experience" className="sx-exp" style={{ "--n": experience.files.length, ...accent("experience") } as CSSProperties} aria-label="Experience">
          <div className="sx-pin">
            <div className="sx-pat sx-pat-glow" />
            <div className="sx-pat sx-pat-grid" />
            <div className="sx-wrap">
              <div className="sx-egrid">
                <div>
                  <div className="sx-label">Experience</div>
                  <h2 className="sx-ehead">Where I&apos;ve worked</h2>
                  <div className="sx-ebig" aria-hidden>
                    {experience.files.map((f) => (
                      <span key={f.name}>
                        <b>{eraOf(f.meta)}</b>
                        <em>{/Present/.test(f.meta ?? "") ? "Current role" : "Previous role"}</em>
                      </span>
                    ))}
                  </div>
                  <div className="sx-rail">
                    {experience.files.map((f, i) => (
                      <button key={f.name} data-i={i}>
                        <i />
                        {f.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sx-panes">
                  {experience.files.map((f) => (
                    <div key={f.name} className="sx-pane">
                      <div className="sx-role">
                        {f.meta?.split(" · ")[1] ?? f.title}
                        <span className="sx-rolepill sx-mono">{/Present/.test(f.meta ?? "") ? "Current role" : "Previous role"}</span>
                      </div>
                      <div className="sx-co">
                        {f.title} · {f.meta?.split(" · ")[0]}
                      </div>
                      <p>{f.desc}</p>
                      <ul>
                        {f.notes.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section id="skills" tone="skills" alt pattern="grid">
          <div className="sx-split">
            <Heading id="skills" label="Skills" title="What I build with" lead={folder("skills").line} />
            <Slides className="sx-cols sx-rv" style={{ "--d": 1 } as CSSProperties}>
              {skills.map((s) => (
                <div key={s.name} className="sx-col">
                  {(() => {
                    const Icon = SKILL_ICONS[s.name] ?? Cpu;
                    return (
                      <span className="sx-sicon" aria-hidden>
                        <Icon size={20} />
                      </span>
                    );
                  })()}
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <Chips tags={s.tags} />
                </div>
              ))}
            </Slides>
          </div>
        </Section>

        <section id="education" className="sx-band sx-edusc" style={{ "--n": education.length, ...accent("education") } as CSSProperties} aria-labelledby="education-h">
          <div className="sx-pin sx-pin2">
            <div className="sx-pat sx-pat-glow" />
            <div className="sx-pat sx-pat-diag" />
            <div className="sx-wrap sx-above">
          <div className="sx-split">
            <div className="sx-side">
              <Heading id="education" label="Education" title="Where I learned" lead={folder("education").line} />
              {/* the three entries live under the description; the active one is shown on the right */}
              <div className="sx-index sx-etabs sx-rv" style={{ "--d": 3 } as CSSProperties} role="tablist" aria-label="Education">
                <span className="sx-etab-pill" aria-hidden />
                {education.map((e, i) => (
                  <button key={e.name} role="tab" aria-selected={i === eduIndex} className={i === eduIndex ? "on" : ""} >
                    {e.kind.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="sx-edu-stage sx-rv" style={{ "--d": 1 } as CSSProperties}>
              {education.map((e, i) => (
                  <article key={e.name} className={`sx-edu-card${i === eduIndex ? " on" : ""}`} style={{ "--i": i } as CSSProperties} role="tabpanel">
                    <h3>{e.title}</h3>
                    {e.meta && <div className="sx-meta">{e.meta}</div>}
                    <p>{e.desc}</p>
                    <div className="sx-tags">
                      {e.tags.map((t) => (
                        <span key={t} className="sx-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                    {e.kind !== "AWARD" && e.links.length === 1 && (
                      <div className="sx-links-row">
                        <a className="sx-btn sm pri" href={e.links[0].url} target="_blank" rel="noopener noreferrer">
                          {clean(e.links[0].t)} <ArrowUpRight size={15} />
                        </a>
                      </div>
                    )}
                    {e.kind !== "AWARD" && e.links.length > 1 && (
                      <div className="sx-rel">
                        <div className="sx-rel-grid">
                          {e.links.map((l) => (
                            <a key={l.slug} className={l.primary ? "pri" : undefined} href={l.url} target="_blank" rel="noopener noreferrer">
                              <span className="t">{clean(l.t)}</span> <ArrowUpRight size={13} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {e.kind === "AWARD" && <Award file={e} />}
                    {e.kind !== "AWARD" && e.notes.length > 0 && (
                      <ul className="sx-edu-notes">
                        {e.notes.slice(0, 3).map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
            </div>
            {/* phones: a slider under the carousel (one dot per card; the current one stretches into a bar) */}
            <div className="sx-edots" aria-hidden>
              {education.map((e, i) => (
                <button key={e.name} type="button" tabIndex={-1} className={i === eduIndex ? "on" : undefined} onClick={() => document.querySelectorAll<HTMLButtonElement>(".sx-etabs button")[i]?.click()} />
              ))}
            </div>
          </div>
            </div>
          </div>
        </section>

        <Section id="about" tone="about" alt pattern="dots">
          <div className="sx-split">
            <Heading id="about" label="About" title="A bit about me" lead="Who I am, and how I like to work." />
            <div className="sx-about sx-rv" style={{ "--d": 1 } as CSSProperties}>
              <p>{bio.desc}</p>
              <ul className="sx-alist">
                {aboutPoints.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="sx-aopen">{aboutOpen}</p>
            </div>
          </div>
        </Section>

        <Section id="contact" tone="intro" pattern="grid">
          <div className="sx-split">
            <Heading id="contact" label="Contact" title="Let's build something" lead={contact.desc} />
            <div className="sx-big-links sx-rv" style={{ "--d": 1 } as CSSProperties}>
              {contact.links.map((l) => (
                <a key={l.slug} href={l.url} {...(l.slug === "email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
                  {clean(l.t)}
                  <span>{l.slug === "email" ? emailOf(contact.links) : l.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
                </a>
              ))}
            </div>
          </div>
        </Section>
      </main>

      <footer className="sx-foot">
        <div className="sx-wrap">
          <span>{owner.name}. Karachi, Pakistan.</span>
          <TransitionLink href="/" label="cd ~/desk">
            Prefer the 3D desk? Open it
          </TransitionLink>
        </div>
      </footer>
    </div>
  );
}
