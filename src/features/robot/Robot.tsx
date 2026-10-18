import "./robot.css";

/** Pixel's body: one drawing, shared by the website robot and the robot on the 3D desk. Colours are tokens. */
export function RobotBody() {
  return (
    <div className="sx-buddy-inner">
      <svg viewBox="0 0 64 76" width="56" height="67">
        <defs>
          <linearGradient id="bd-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="color-mix(in oklab, var(--ice) 28%, var(--panel-raised))" />
            <stop offset="1" stopColor="var(--panel-raised)" />
          </linearGradient>
        </defs>
        <line x1="32" y1="14" x2="32" y2="6" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" />
        <circle className="bd-tip" cx="32" cy="5" r="3.4" fill="var(--ice)" />
        <rect x="3" y="28" width="5" height="12" rx="2.5" fill="var(--folder-projects)" />
        <rect x="56" y="28" width="5" height="12" rx="2.5" fill="var(--folder-about)" />
        <rect x="7" y="14" width="50" height="40" rx="17" fill="url(#bd-head)" stroke="var(--line-strong)" strokeWidth="1.5" />
        <rect x="13" y="21" width="38" height="25" rx="11" fill="var(--bg)" />
        <g className="bd-eyes">
          <circle cx="24" cy="33.5" r="4.6" fill="var(--ice)" />
          <circle cx="40" cy="33.5" r="4.6" fill="var(--ice)" />
          <circle cx="24" cy="33.5" r="1.9" fill="var(--bg)" />
          <circle cx="40" cy="33.5" r="1.9" fill="var(--bg)" />
        </g>
        <g className="bd-happy" fill="none" stroke="var(--ice)" strokeWidth="3" strokeLinecap="round">
          <path d="M19.5 35 Q24 28 28.5 35" />
          <path d="M35.5 35 Q40 28 44.5 35" />
        </g>
        <rect x="21" y="57" width="22" height="12" rx="6" fill="var(--panel-raised)" stroke="var(--line-strong)" strokeWidth="1.5" />
        <circle cx="28" cy="63" r="1.8" fill="var(--folder-skills)" />
        <circle cx="32" cy="63" r="1.8" fill="var(--folder-experience)" />
        <circle cx="36" cy="63" r="1.8" fill="var(--folder-education)" />
      </svg>
    </div>
  );
}
