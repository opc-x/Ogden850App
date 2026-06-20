import type { ReactNode } from "react";

/** 18 operator 空间示意图 — 与 OperatorsGrid 同源，带轻量动画 */
export default function OperatorVisual({ type }: { type: string }) {
  const strokeColor = "var(--accent)";
  const mainColor = "var(--ink)";
  const faintColor = "var(--border)";

  const inlineStyles = `
    @keyframes op-slide-right {
      0% { transform: translateX(-6px); opacity: 0.5; }
      40%, 70% { opacity: 1; }
      100% { transform: translateX(6px); opacity: 0.5; }
    }
    @keyframes op-slide-left {
      0% { transform: translateX(6px); opacity: 0.5; }
      40%, 70% { opacity: 1; }
      100% { transform: translateX(-6px); opacity: 0.5; }
    }
    @keyframes op-pulse {
      0%, 100% { opacity: 0.55; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }
    @keyframes op-flow {
      to { stroke-dashoffset: -16; }
    }
    @keyframes op-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .op-slide-r { animation: op-slide-right 2.4s infinite ease-in-out; }
    .op-slide-l { animation: op-slide-left 2.4s infinite ease-in-out; }
    .op-pulse { transform-origin: 50px 50px; animation: op-pulse 2.5s infinite ease-in-out; }
    .op-flow { stroke-dasharray: 5 3; animation: op-flow 1.2s infinite linear; }
    .op-bob { animation: op-bob 2.2s infinite ease-in-out; }
  `;

  const svg = (children: ReactNode) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg" aria-hidden>
      <style>{inlineStyles}</style>
      {children}
    </svg>
  );

  switch (type) {
    case "come":
      return svg(<>
        <circle cx="70" cy="50" r="8" fill={mainColor} className="op-pulse" />
        <path d="M15 50 H60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" className="op-flow" />
        <g className="op-slide-r">
          <path d="M50 40 L60 50 L50 60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </>);
    case "go":
      return svg(<>
        <circle cx="30" cy="50" r="8" fill={mainColor} className="op-pulse" />
        <path d="M30 50 H85" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" className="op-flow" />
        <g className="op-slide-r">
          <path d="M75 40 L85 50 L75 60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </>);
    case "put":
      return svg(<>
        <path d="M30 65 H70 V85 H30 Z" stroke={faintColor} strokeWidth="3" fill="none" />
        <g className="op-bob">
          <path d="M50 20 V60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
          <path d="M42 52 L50 60 L58 52" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </>);
    case "take":
      return svg(<>
        <path d="M30 65 H70 V85 H30 Z" stroke={faintColor} strokeWidth="3" fill="none" />
        <g className="op-bob">
          <path d="M50 70 V30" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
          <path d="M42 38 L50 30 L58 38" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </>);
    case "give":
      return svg(<>
        <circle cx="25" cy="55" r="8" fill={mainColor} />
        <circle cx="75" cy="55" r="8" fill={faintColor} className="op-pulse" />
        <path d="M35 50 C45 40 55 40 65 50" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" className="op-flow" />
      </>);
    case "get":
      return svg(<>
        <circle cx="75" cy="55" r="8" fill={mainColor} className="op-pulse" />
        <circle cx="25" cy="55" r="8" fill={faintColor} />
        <path d="M35 50 C45 40 55 40 65 50" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" className="op-flow" />
      </>);
    case "send":
      return svg(<>
        <circle cx="30" cy="50" r="10" fill={mainColor} />
        <path d="M48 50 H80" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" className="op-flow" />
        <g className="op-slide-r">
          <path d="M72 44 L80 50 L72 56" stroke={strokeColor} strokeWidth="4" fill="none" />
        </g>
      </>);
    case "keep":
      return svg(<>
        <circle cx="50" cy="50" r="12" fill={mainColor} className="op-pulse" />
        <path d="M50 25 A25 25 0 1 1 49.9 25" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" className="op-flow" />
      </>);
    case "let":
      return svg(<>
        <path d="M50 15 V40 M50 60 V85" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M20 50 H80" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeDasharray="8 4" className="op-flow" />
      </>);
    case "make":
      return svg(<>
        <rect x="25" y="65" width="50" height="15" rx="3" fill={faintColor} stroke={mainColor} strokeWidth="2" />
        <g className="op-bob">
          <rect x="35" y="45" width="30" height="15" rx="3" fill="none" stroke={strokeColor} strokeWidth="3" />
          <path d="M50 15 V35" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      </>);
    case "do":
      return svg(<>
        <circle cx="40" cy="40" r="16" stroke={mainColor} strokeWidth="3" strokeDasharray="6 4" fill="none" className="op-pulse" />
        <circle cx="64" cy="64" r="12" stroke={strokeColor} strokeWidth="3" strokeDasharray="4 4" fill="none" className="op-flow" />
      </>);
    case "see":
      return svg(<>
        <path d="M15 50 C30 25 70 25 85 50 C70 75 30 75 15 50 Z" stroke={mainColor} strokeWidth="4" fill="none" />
        <circle cx="50" cy="50" r="10" fill={strokeColor} className="op-pulse" />
      </>);
    case "say":
      return svg(<>
        <path d="M20 25 H80 V65 H45 L25 80 V65 H20 Z" stroke={mainColor} strokeWidth="4" fill="none" />
        <path d="M35 45 H65" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" className="op-flow" />
      </>);
    case "be":
      return svg(<>
        <circle cx="50" cy="50" r="20" fill="none" stroke={strokeColor} strokeWidth="5" className="op-pulse" />
        <circle cx="50" cy="50" r="8" fill={mainColor} />
      </>);
    case "have":
      return svg(<>
        <rect x="25" y="25" width="50" height="50" rx="6" stroke={mainColor} strokeWidth="4" fill="none" />
        <circle cx="50" cy="50" r="10" fill={strokeColor} className="op-pulse" />
      </>);
    case "seem":
      return svg(<>
        <path d="M50 15 V85" stroke={mainColor} strokeWidth="3" strokeDasharray="6 4" />
        <circle cx="28" cy="50" r="10" fill={mainColor} />
        <circle cx="72" cy="50" r="10" stroke={strokeColor} strokeWidth="3" fill="none" strokeDasharray="3 3" className="op-pulse" />
      </>);
    case "may":
      return svg(<>
        <path d="M15 50 H45" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M45 50 C55 35 65 30 80 30" stroke={strokeColor} strokeWidth="4" fill="none" className="op-flow" />
        <path d="M45 50 C55 65 65 70 80 70" stroke={strokeColor} strokeWidth="4" fill="none" strokeDasharray="4 2" />
      </>);
    case "will":
      return svg(<>
        <path d="M15 50 H80" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" className="op-flow" />
        <g className="op-slide-r">
          <path d="M70 40 L80 50 L70 60" stroke={strokeColor} strokeWidth="4" fill="none" />
        </g>
      </>);
    default:
      return svg(<circle cx="50" cy="50" r="20" fill="none" stroke={strokeColor} strokeWidth="3" className="op-pulse" />);
  }
}
