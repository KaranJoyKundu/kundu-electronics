export type ProjectKind = "bee" | "lfr" | "soccerbot" | "rc" | "drone";

const labels: Record<ProjectKind, string> = {
  bee: "BEE BIPED ROBOT",
  lfr: "LINE FOLLOWER ROBOT",
  soccerbot: "SOCCER BOT",
  rc: "RC SPEED BATTLE",
  drone: "DRONE BUILD",
};

export function ProjectArtwork({ kind }: { kind: ProjectKind }) {
  return (
    <div className={"project-artwork project-artwork-" + kind} role="img" aria-label={labels[kind] + " — original illustration"}>
      <svg viewBox="0 0 520 340" aria-hidden="true" focusable="false">
        <rect x="10" y="10" width="500" height="320" rx="24" fill="#e9f0e9" />
        <g fill="none" stroke="#244238" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
          {kind === "bee" ? <>
            <path d="M260 92v54M260 148l-59 37-38 75M260 148l59 37 38 75" />
            <path d="M201 185l-56 24-18 54M319 185l56 24 18 54" strokeWidth="8"/>
            <circle cx="260" cy="112" r="45" fill="#d5ad61" />
            <rect x="231" y="94" width="58" height="38" rx="6" fill="#203c36"/>
            <path d="M241 105h2M255 105h2M269 105h2M283 105h2M241 118h2M255 118h2M269 118h2M283 118h2" stroke="#c5e3b5" strokeWidth="7"/>
            <circle cx="201" cy="185" r="16" fill="#d5ad61"/>
            <circle cx="319" cy="185" r="16" fill="#d5ad61"/>
            <circle cx="163" cy="261" r="16" fill="#d5ad61"/>
            <circle cx="357" cy="261" r="16" fill="#d5ad61"/>
          </> : null}
          {kind === "lfr" ? <>
            <path d="M165 240h190l-18-90H183z" fill="#668c73"/>
            <circle cx="155" cy="244" r="48" fill="#293a34"/>
            <circle cx="365" cy="244" r="48" fill="#293a34"/>
            <path d="M190 150h140" strokeWidth="8"/>
            <circle cx="210" cy="150" r="12" fill="#e6c36f"/>
            <circle cx="243" cy="150" r="12" fill="#e6c36f"/>
            <circle cx="277" cy="150" r="12" fill="#e6c36f"/>
            <circle cx="310" cy="150" r="12" fill="#e6c36f"/>
          </> : null}
          {kind === "soccerbot" ? <>
            <path d="M160 234h200l-26-91H186z" fill="#477c68"/>
            <circle cx="150" cy="236" r="49" fill="#273832"/>
            <circle cx="370" cy="236" r="49" fill="#273832"/>
            <path d="M210 143h100M235 114h50" strokeWidth="8"/>
            <circle cx="426" cy="261" r="29" fill="#f7f1d9"/>
          </> : null}
          {kind === "rc" ? <>
            <path d="M142 220l34-86h168l34 86-25 33H167z" fill="#6b8b74"/>
            <circle cx="153" cy="243" r="40" fill="#26352f"/>
            <circle cx="367" cy="243" r="40" fill="#26352f"/>
            <path d="M207 163h106M190 193h140M260 135V75M260 75l45-23M260 75l-45-23" strokeWidth="7"/>
          </> : null}
          {kind === "drone" ? <>
            <path d="M260 164L138 82M260 164l122-82M260 164l-122 82M260 164l122 82" strokeWidth="15"/>
            <rect x="213" y="132" width="94" height="65" rx="23" fill="#60866e"/>
            <ellipse cx="138" cy="82" rx="61" ry="14" strokeWidth="7"/>
            <ellipse cx="382" cy="82" rx="61" ry="14" strokeWidth="7"/>
            <ellipse cx="138" cy="246" rx="61" ry="14" strokeWidth="7"/>
            <ellipse cx="382" cy="246" rx="61" ry="14" strokeWidth="7"/>
          </> : null}
        </g>
      </svg>
      <span className="project-artwork-caption">PROJECT PREVIEW · ORIGINAL ILLUSTRATION</span>
      <span className="project-artwork-index">{labels[kind]}</span>
    </div>
  );
}
