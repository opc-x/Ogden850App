import type { ReactNode } from "react";

type IconProps = { size?: number };

function Svg({ size = 16, children }: { size?: number; children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const PHASE_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  map: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <path d="M16.24 7.76l-2.12 2.12M9.88 14.12l-2.12 2.12" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  ),
  core: (p) => (
    <Svg {...p}>
      <path d="M12 2L3 12l9 10 9-10L12 2z" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </Svg>
  ),
  skeleton: (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.1" />
      <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" strokeDasharray="2 2" />
    </Svg>
  ),
  roots: (p) => (
    <Svg {...p}>
      <path d="M12 22V10" />
      <path d="M12 14c-3-1-5-3-5-6s2-4 5-4" fill="currentColor" fillOpacity="0.08" />
      <path d="M12 12c3-1 5-2.5 5-5.5s-2-4-5-4" fill="currentColor" fillOpacity="0.08" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  ),
  multiply: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 8l8 8M16 8L8 16" />
      <path d="M12 8v8M8 12h8" strokeWidth="1" strokeDasharray="2 2" />
    </Svg>
  ),
  practice: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </Svg>
  ),
  reference: (p) => (
    <Svg {...p}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 6h8M8 10h8M8 14h5" />
    </Svg>
  ),
  agent: (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M3 8h18M7 13l2.5 2.5L7 18M12 18h4" />
    </Svg>
  ),
};

export const SLUG_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  start: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
      <path d="M10 8l4 4-4 4" strokeWidth="2" />
    </Svg>
  ),
  sources: (p) => (
    <Svg {...p}>
      <path d="M16 3H4v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7l-4-4z" fill="currentColor" fillOpacity="0.1" />
      <path d="M16 3v4h4M8 11h8M8 15h5" />
    </Svg>
  ),
  operators: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="9" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
      <path d="M12 8l-2 2M12 16l2-2" />
    </Svg>
  ),
  directions: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" />
      <polygon points="12,7 15,12 12,17 9,12" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3v18M3 12h18" strokeWidth="1" strokeDasharray="2 2" />
    </Svg>
  ),
  grammar: (p) => (
    <Svg {...p}>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.1" />
      <path d="M9 9h6M9 13h6M9 17h4" />
      <circle cx="6.5" cy="9" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="13" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="17" r="0.5" fill="currentColor" />
    </Svg>
  ),
  "tier-guide": (p) => (
    <Svg {...p}>
      <path d="M3 21h18" />
      <rect x="5" y="16" width="3" height="5" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="11" width="3" height="10" rx="0.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="16" y="5" width="3" height="16" rx="0.5" fill="currentColor" fillOpacity="0.1" />
    </Svg>
  ),
  words: (p) => (
    <Svg {...p}>
      <circle cx="10" cy="10" r="6" fill="currentColor" fillOpacity="0.1" />
      <path d="M14.5 14.5l5.5 5.5M7 8h6M7 11h4" />
    </Svg>
  ),
  phrasal: (p) => (
    <Svg {...p}>
      <rect x="4" y="9" width="10" height="6" rx="3" transform="rotate(-45 9 12)" fill="currentColor" fillOpacity="0.1" />
      <rect x="10" y="9" width="10" height="6" rx="3" transform="rotate(-45 15 12)" />
      <path d="M11.5 12.5l1-1" strokeWidth="2.5" />
    </Svg>
  ),
  affixes: (p) => (
    <Svg {...p}>
      <circle cx="6" cy="12" r="2.5" fill="currentColor" />
      <path d="M8.5 12h7M12 8.5v7" />
      <circle cx="18" cy="8.5" r="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="18" cy="15.5" r="2" fill="currentColor" fillOpacity="0.1" />
    </Svg>
  ),
  compounds: (p) => (
    <Svg {...p}>
      <circle cx="9" cy="12" r="5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="15" cy="12" r="5" />
      <path d="M12 9a4.9 4.9 0 0 1 2 3 4.9 4.9 0 0 1-2 3 4.9 4.9 0 0 1-2-3 4.9 4.9 0 0 1 2-3z" fill="currentColor" />
    </Svg>
  ),
  practice: (p) => (
    <Svg {...p}>
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M15 5l3 3" />
    </Svg>
  ),
  "practice-lab": (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="8" height="18" rx="1.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M14 8h7M14 12h5M14 16h7" />
      <circle cx="6" cy="8" r="1.5" fill="currentColor" />
      <circle cx="6" cy="14" r="1.5" fill="#15803d" stroke="none" />
    </Svg>
  ),
  "practice-sbs": (p) => (
    <Svg {...p}>
      <path d="M4 6h16M4 12h10M4 18h14" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </Svg>
  ),
  "practice-bt": (p) => (
    <Svg {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Svg>
  ),
  begr: (p) => (
    <Svg {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fillOpacity="0.1" />
      <path d="M14 2v6h6M9 15h6M9 11h6" strokeWidth="1.5" />
    </Svg>
  ),
  survey: (p) => (
    <Svg {...p}>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.1" />
      <path d="M9 9h6M9 13h6" />
      <polyline points="7,9 8,9" />
      <polyline points="7,13 8,13" />
    </Svg>
  ),
  copyright: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" />
      <path d="M14.5 9.5a3.5 3.5 0 1 0 0 5" />
    </Svg>
  ),
  distill: (p) => (
    <Svg {...p}>
      <path d="M5 3h14l-5 6v7l-4 3v-10Z" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
};

export const PHASE_COLORS: Record<string, string> = {
  map: "#b45309",
  core: "#d97706",
  skeleton: "#0369a1",
  roots: "#15803d",
  multiply: "#c2410c",
  practice: "#7c3aed",
  reference: "#78716c",
  agent: "#78716c",
};

export function PhaseIcon({ id, size = 18 }: { id: string; size?: number }) {
  const Icon = PHASE_ICONS[id] ?? PHASE_ICONS.map;
  return <span className="nav-icon">{Icon({ size })}</span>;
}

export function SlugIcon({ slug, size = 15 }: { slug: string; size?: number }) {
  const Icon = SLUG_ICONS[slug] ?? SLUG_ICONS.start;
  return <span className="nav-icon nav-icon--sm">{Icon({ size })}</span>;
}
