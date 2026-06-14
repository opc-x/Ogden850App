import type { ReactNode } from "react";

/** 18 operator 空间示意图 — 与 OperatorsGrid 同源 */
export default function OperatorVisual({ type }: { type: string }) {
  const strokeColor = "var(--accent)";
  const mainColor = "var(--ink)";
  const faintColor = "var(--border)";

  const svg = (children: ReactNode) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg" aria-hidden>
      {children}
    </svg>
  );

  switch (type) {
    case "come":
      return svg(<>
        <circle cx="70" cy="50" r="8" fill={mainColor} />
        <path d="M15 50 H60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M50 40 L60 50 L50 60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>);
    case "go":
      return svg(<>
        <circle cx="30" cy="50" r="8" fill={mainColor} />
        <path d="M30 50 H85" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M75 40 L85 50 L75 60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>);
    case "put":
      return svg(<>
        <path d="M30 65 H70 V85 H30 Z" stroke={faintColor} strokeWidth="3" fill="none" />
        <path d="M50 20 V60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M42 52 L50 60 L58 52" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>);
    case "take":
      return svg(<>
        <path d="M30 65 H70 V85 H30 Z" stroke={faintColor} strokeWidth="3" fill="none" />
        <path d="M50 70 V30" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M42 38 L50 30 L58 38" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>);
    case "give":
      return svg(<>
        <circle cx="25" cy="55" r="8" fill={mainColor} />
        <circle cx="75" cy="55" r="8" fill={faintColor} />
        <path d="M35 50 C45 40 55 40 65 50" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
      </>);
    case "get":
      return svg(<>
        <circle cx="75" cy="55" r="8" fill={mainColor} />
        <circle cx="25" cy="55" r="8" fill={faintColor} />
        <path d="M35 50 C45 40 55 40 65 50" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
      </>);
    case "send":
      return svg(<>
        <circle cx="30" cy="50" r="10" fill={mainColor} />
        <path d="M48 50 H80" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M72 44 L80 50 L72 56" stroke={strokeColor} strokeWidth="4" fill="none" />
      </>);
    case "keep":
      return svg(<>
        <circle cx="50" cy="50" r="12" fill={mainColor} />
        <path d="M50 25 A25 25 0 1 1 49.9 25" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" />
      </>);
    case "let":
      return svg(<>
        <path d="M50 15 V40 M50 60 V85" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M20 50 H80" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeDasharray="8 4" />
      </>);
    case "make":
      return svg(<>
        <rect x="25" y="65" width="50" height="15" rx="3" fill={faintColor} stroke={mainColor} strokeWidth="2" />
        <rect x="35" y="45" width="30" height="15" rx="3" fill="none" stroke={strokeColor} strokeWidth="3" />
        <path d="M50 15 V35" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
      </>);
    case "do":
      return svg(<>
        <circle cx="40" cy="40" r="16" stroke={mainColor} strokeWidth="3" strokeDasharray="6 4" fill="none" />
        <circle cx="64" cy="64" r="12" stroke={strokeColor} strokeWidth="3" strokeDasharray="4 4" fill="none" />
      </>);
    case "see":
      return svg(<>
        <path d="M15 50 C30 25 70 25 85 50 C70 75 30 75 15 50 Z" stroke={mainColor} strokeWidth="4" fill="none" />
        <circle cx="50" cy="50" r="10" fill={strokeColor} />
      </>);
    case "say":
      return svg(<>
        <path d="M20 25 H80 V65 H45 L25 80 V65 H20 Z" stroke={mainColor} strokeWidth="4" fill="none" />
        <path d="M35 45 H65" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
      </>);
    case "be":
      return svg(<>
        <circle cx="50" cy="50" r="20" fill="none" stroke={strokeColor} strokeWidth="5" />
        <circle cx="50" cy="50" r="8" fill={mainColor} />
      </>);
    case "have":
      return svg(<>
        <rect x="25" y="25" width="50" height="50" rx="6" stroke={mainColor} strokeWidth="4" fill="none" />
        <circle cx="50" cy="50" r="10" fill={strokeColor} />
      </>);
    case "seem":
      return svg(<>
        <path d="M50 15 V85" stroke={mainColor} strokeWidth="3" strokeDasharray="6 4" />
        <circle cx="28" cy="50" r="10" fill={mainColor} />
        <circle cx="72" cy="50" r="10" stroke={strokeColor} strokeWidth="3" fill="none" strokeDasharray="3 3" />
      </>);
    case "may":
      return svg(<>
        <path d="M15 50 H45" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M45 50 C55 35 65 30 80 30" stroke={strokeColor} strokeWidth="4" fill="none" />
        <path d="M45 50 C55 65 65 70 80 70" stroke={strokeColor} strokeWidth="4" fill="none" strokeDasharray="4 2" />
      </>);
    case "will":
      return svg(<>
        <path d="M15 50 H80" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M70 40 L80 50 L70 60" stroke={strokeColor} strokeWidth="4" fill="none" />
      </>);
    default:
      return svg(<circle cx="50" cy="50" r="20" fill="none" stroke={strokeColor} strokeWidth="3" />);
  }
}
