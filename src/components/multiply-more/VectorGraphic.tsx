export function VectorGraphic({ word }: { word: string }) {
  const strokeColor = "var(--accent)";
  const strokeWarm = "var(--accent-warm)";
  const mainColor = "var(--ink)";
  const faintColor = "var(--border)";
  const fillAccentSoft = "var(--accent-soft)";

  const styleTag = `
    .stroke-main { stroke: ${mainColor}; fill: none; stroke-width: 2.2; stroke-linecap: round; }
    .stroke-accent { stroke: ${strokeColor}; fill: none; stroke-width: 2.2; stroke-linecap: round; }
    .fill-soft { fill: ${fillAccentSoft}; fill-opacity: 0.4; }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    .ani-bounce { animation: bounce 1.8s infinite ease-in-out; }
    
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    .ani-spin { transform-origin: 50px 50px; animation: spin 4s infinite linear; }
    
    @keyframes ripple {
      0% { r: 5px; opacity: 0.8; }
      100% { r: 25px; opacity: 0; }
    }
    .ani-ripple { transform-origin: 50px 50px; animation: ripple 2s infinite ease-out; }
  `;

  let scene = null;

  switch (word) {
    // Affixes
    case "worker":
      scene = (
        <g>
          <circle cx="50" cy="50" r="14" stroke={mainColor} strokeWidth="2" fill="none" className="ani-spin" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="6" fill={strokeColor} />
          <line x1="30" y1="50" x2="70" y2="50" stroke={strokeWarm} strokeWidth="1.8" className="ani-spin" />
        </g>
      );
      break;
    case "working":
      scene = (
        <g>
          <circle cx="50" cy="50" r="18" stroke={faintColor} strokeWidth="1.5" fill="none" />
          <path d="M50 32 A18 18 0 0 1 68 50" stroke={strokeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" className="ani-spin" />
          <circle cx="50" cy="50" r="4" fill={mainColor} />
        </g>
      );
      break;
    case "worked":
      scene = (
        <g>
          <rect x="25" y="25" width="50" height="50" rx="6" className="stroke-main fill-soft" />
          <path d="M38 52 L46 60 L62 42" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
      break;
    case "works":
      scene = (
        <g>
          <path d="M20 70 V45 L35 55 V45 L50 55 V45 L65 55 V70 Z" className="stroke-main fill-soft" />
          <line x1="20" y1="70" x2="80" y2="70" stroke={mainColor} strokeWidth="2.5" />
          <path d="M72 40 V70" stroke={strokeColor} strokeWidth="4" />
        </g>
      );
      break;
    case "player":
      scene = (
        <g>
          <path d="M35 30 H65 V45 C65 55, 35 55, 35 45 Z" className="stroke-main fill-soft" />
          <path d="M50 53 V68 M40 68 H60" stroke={mainColor} strokeWidth="2.5" />
          <circle cx="50" cy="38" r="4" fill={strokeWarm} />
        </g>
      );
      break;
    case "playing":
      scene = (
        <g>
          <line x1="20" y1="75" x2="80" y2="75" stroke={mainColor} strokeWidth="2.5" />
          <g className="ani-bounce">
            <circle cx="50" cy="45" r="8.5" fill={strokeColor} />
          </g>
        </g>
      );
      break;
    case "played":
      scene = (
        <g>
          <circle cx="50" cy="50" r="16" fill={fillAccentSoft} />
          <path d="M50 34 A16 16 0 1 0 66 50" stroke={strokeColor} strokeWidth="2" fill="none" />
          <path d="M46 30 L50 34 L46 38" stroke={strokeColor} strokeWidth="2" fill="none" />
          <circle cx="50" cy="50" r="3" fill={mainColor} />
        </g>
      );
      break;
    case "plays":
      scene = (
        <g>
          <rect x="22" y="25" width="56" height="50" className="stroke-main fill-soft" />
          <path d="M22 25 Q35 55, 50 25 Q65 55, 78 25" stroke={strokeColor} strokeWidth="2.2" fill="none" />
        </g>
      );
      break;
    case "happily":
      scene = (
        <g>
          <circle cx="50" cy="50" r="20" className="stroke-main fill-soft" />
          <circle cx="42" cy="45" r="2.5" fill={mainColor} />
          <circle cx="58" cy="45" r="2.5" fill={mainColor} />
          <path d="M38 56 Q50 68, 62 56" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "unhappy":
      scene = (
        <g>
          <circle cx="50" cy="50" r="20" className="stroke-main fill-soft" />
          <circle cx="42" cy="45" r="2.5" fill={mainColor} />
          <circle cx="58" cy="45" r="2.5" fill={mainColor} />
          <path d="M38 62 Q50 50, 62 62" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "quickly":
      scene = (
        <g>
          <path d="M60 40 L40 60" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50 30 L65 35 L70 50" stroke={strokeColor} strokeWidth="2" fill="none" />
          <path d="M30 70 L35 65" stroke={strokeWarm} strokeWidth="2" strokeDasharray="3 2" />
        </g>
      );
      break;
    case "stopper":
      scene = (
        <g>
          <path d="M35 30 H65 V45 L70 70 H30 L35 45 Z" stroke={mainColor} strokeWidth="2.2" fill="none" />
          <rect x="42" y="32" width="16" height="15" rx="2" fill={strokeColor} />
        </g>
      );
      break;
    case "stopping":
      scene = (
        <g>
          <polygon points="50,22 69,31 69,53 50,62 31,53 31,31" className="stroke-main fill-soft" />
          <circle cx="50" cy="42" r="10" stroke="#dc2626" strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "stopped":
      scene = (
        <g>
          <polygon points="50,20 71,29 71,55 50,64 29,55 29,29" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
          <line x1="42" y1="36" x2="58" y2="48" stroke="#fff" strokeWidth="3" />
          <line x1="58" y1="36" x2="42" y2="48" stroke="#fff" strokeWidth="3" />
        </g>
      );
      break;
    case "changing":
      scene = (
        <g>
          <circle cx="50" cy="50" r="18" stroke={strokeColor} strokeWidth="2.2" strokeDasharray="25 10" fill="none" className="ani-spin" />
          <path d="M62 38 L68 44 L60 48" stroke={strokeColor} strokeWidth="2" fill="none" />
          <path d="M38 62 L32 56 L40 52" stroke={strokeColor} strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "changed":
      scene = (
        <g>
          <rect x="28" y="28" width="44" height="44" rx="10" className="stroke-main fill-soft" />
          <circle cx="50" cy="50" r="14" stroke={strokeColor} strokeWidth="2.2" fill="none" />
        </g>
      );
      break;
    case "safely":
      scene = (
        <g>
          <path d="M30 30 C30 30, 50 22, 50 22 C50 22, 70 30, 70 30 C70 50, 50 68, 50 68 C50 68, 30 50, 30 30 Z" className="stroke-accent fill-soft" />
          <path d="M42 46 L47 51 L58 38" stroke="#10b981" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
      break;
    case "sadly":
      scene = (
        <g>
          <circle cx="50" cy="50" r="20" className="stroke-main fill-soft" />
          <circle cx="42" cy="45" r="2.5" fill={mainColor} />
          <circle cx="58" cy="45" r="2.5" fill={mainColor} />
          <path d="M38 62 Q50 52, 62 62" stroke={mainColor} strokeWidth="2" fill="none" />
          <path d="M42 50 C40 53, 44 55, 42 58 C40 55, 44 53, 42 50" fill={strokeColor} />
        </g>
      );
      break;
    case "opening":
      scene = (
        <g>
          <path d="M30 50 H70 V75 H30 Z" className="stroke-main fill-soft" />
          <path d="M30 50 L20 38 M70 50 L80 38" stroke={strokeColor} strokeWidth="2.2" />
        </g>
      );
      break;
    case "closed":
      scene = (
        <g>
          <rect x="32" y="48" width="36" height="26" rx="4" className="stroke-main fill-soft" />
          <path d="M40 48 V36 C40 28, 60 28, 60 36 V48" stroke={strokeColor} strokeWidth="3" fill="none" />
        </g>
      );
      break;
    case "folded":
      scene = (
        <g>
          <rect x="25" y="32" width="50" height="36" rx="3" className="stroke-main fill-soft" />
          <path d="M25 32 L50 52 L75 32" stroke={strokeColor} strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "unfold":
      scene = (
        <g>
          <rect x="22" y="32" width="56" height="36" rx="2" className="stroke-main fill-soft" />
          <circle cx="34" cy="50" r="4" fill={strokeWarm} />
          <circle cx="66" cy="50" r="4" fill={strokeWarm} />
          <line x1="42" y1="50" x2="58" y2="50" stroke={strokeColor} strokeWidth="2.5" />
        </g>
      );
      break;

    // Compounds
    case "milkman":
      scene = (
        <g>
          <path d="M25 32 H45 V68 H25 Z" className="stroke-main fill-soft" />
          <line x1="35" y1="32" x2="35" y2="68" stroke={mainColor} strokeWidth="1.2" strokeDasharray="3 2" />
          <path d="M31 32 V25 H39 V32" stroke={mainColor} strokeWidth="2" fill="none" />
          <circle cx="65" cy="38" r="8" fill={strokeWarm} />
          <path d="M55 70 V52 C55 48, 75 48, 75 52 V70" stroke={strokeColor} strokeWidth="3" />
        </g>
      );
      break;
    case "postman":
      scene = (
        <g>
          <rect x="20" y="42" width="30" height="20" rx="2" className="stroke-main fill-soft" />
          <path d="M20 42 L35 52 L50 42" stroke={mainColor} strokeWidth="1.5" fill="none" />
          <circle cx="68" cy="38" r="7" fill={strokeColor} />
          <path d="M58 70 V50 C58 46, 78 46, 78 50 V70" stroke={mainColor} strokeWidth="2" />
        </g>
      );
      break;
    case "raincoat":
      scene = (
        <g>
          <path d="M30 35 L42 22 L58 22 L70 35 L62 42 L58 35 V75 H42 V35 L38 42 Z" className="stroke-accent fill-soft" />
          <line x1="25" y1="12" x2="20" y2="18" stroke={strokeWarm} strokeWidth="1.5" />
          <line x1="45" y1="10" x2="40" y2="16" stroke={strokeWarm} strokeWidth="1.5" />
          <line x1="65" y1="12" x2="60" y2="18" stroke={strokeWarm} strokeWidth="1.5" />
        </g>
      );
      break;
    case "sunlight":
      scene = (
        <g>
          <circle cx="50" cy="50" r="14" fill={strokeWarm} />
          <path d="M50 20 V30 M50 70 V80 M20 50 H30 M70 50 H80" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M29 29 L36 36 M64 64 L71 71 M29 71 L36 64 M64 29 L71 36" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
      break;
    case "bedroom":
      scene = (
        <g>
          <rect x="30" y="32" width="14" height="8" rx="1" stroke={mainColor} strokeWidth="1.5" fill="none" />
          <path d="M25 40 H75 V62 M75 48 H25 V68" stroke={strokeColor} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <rect x="25" y="45" width="50" height="18" fill={fillAccentSoft} />
        </g>
      );
      break;
    case "railway":
      scene = (
        <g>
          <line x1="22" y1="25" x2="22" y2="75" stroke={mainColor} strokeWidth="3" />
          <line x1="78" y1="25" x2="78" y2="75" stroke={mainColor} strokeWidth="3" />
          <line x1="22" y1="35" x2="78" y2="35" stroke={strokeWarm} strokeWidth="2" />
          <line x1="22" y1="50" x2="78" y2="50" stroke={strokeWarm} strokeWidth="2" />
          <line x1="22" y1="65" x2="78" y2="65" stroke={strokeWarm} strokeWidth="2" />
        </g>
      );
      break;
    case "sundown":
      scene = (
        <g>
          <path d="M15 70 Q50 50, 85 70" stroke={mainColor} strokeWidth="2.5" fill="none" />
          <circle cx="50" cy="52" r="10" fill={strokeWarm} />
          <path d="M50 18 V34 M46 30 L50 34 L54 30" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        </g>
      );
      break;
    case "daylight":
      scene = (
        <g>
          <circle cx="50" cy="45" r="15" fill={strokeWarm} />
          <path d="M50 15 V25 M20 45 H30 M80 45 H70 M50 75 V65" stroke={strokeColor} strokeWidth="2.2" />
          <circle cx="50" cy="45" r="28" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" fill="none" className="ani-ring" />
        </g>
      );
      break;
    case "backbone":
      scene = (
        <g>
          <circle cx="50" cy="22" r="4.5" fill={strokeColor} />
          <circle cx="50" cy="34" r="5" fill={strokeColor} />
          <circle cx="50" cy="46" r="5.5" fill={strokeColor} />
          <circle cx="50" cy="58" r="6" fill={strokeColor} />
          <circle cx="50" cy="70" r="6.5" fill={strokeColor} />
          <line x1="50" y1="18" x2="50" y2="75" stroke={mainColor} strokeWidth="2" strokeDasharray="2 2" />
        </g>
      );
      break;
    case "footstep":
      scene = (
        <g>
          <ellipse cx="38" cy="35" rx="5" ry="8" fill={strokeWarm} transform="rotate(-15 38 35)" />
          <ellipse cx="62" cy="55" rx="5" ry="8" fill={strokeColor} transform="rotate(15 62 55)" />
        </g>
      );
      break;
    case "input":
      scene = (
        <g>
          <rect x="42" y="30" width="38" height="40" rx="3" className="stroke-main fill-soft" />
          <g className="ani-through">
            <path d="M12 50 H42" stroke={strokeColor} strokeWidth="2.5" />
            <path d="M36 45 L42 50 L36 55" stroke={strokeColor} strokeWidth="2.5" fill="none" />
          </g>
        </g>
      );
      break;
    case "output":
      scene = (
        <g>
          <rect x="20" y="30" width="38" height="40" rx="3" className="stroke-main fill-soft" />
          <g className="ani-through">
            <path d="M38 50 H78" stroke={strokeColor} strokeWidth="2.5" />
            <path d="M72 45 L78 50 L72 55" stroke={strokeColor} strokeWidth="2.5" fill="none" />
          </g>
        </g>
      );
      break;
    case "someone":
      scene = (
        <g>
          <circle cx="50" cy="38" r="10" fill={strokeColor} />
          <path d="M32 72 V60 C32 54, 68 54, 68 60 V72" stroke={mainColor} strokeWidth="2.5" className="fill-soft" />
        </g>
      );
      break;
    case "anything":
      scene = (
        <g>
          <rect x="30" y="35" width="40" height="40" rx="4" className="stroke-main fill-soft" />
          <text x="50" y="60" fill={strokeColor} fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">?</text>
        </g>
      );
      break;
    case "everywhere":
      scene = (
        <g>
          <circle cx="50" cy="50" r="22" className="stroke-main fill-soft" />
          <ellipse cx="50" cy="50" rx="22" ry="8" stroke={mainColor} strokeWidth="1" fill="none" />
          <circle cx="34" cy="46" r="3.5" fill="#dc2626" />
          <circle cx="66" cy="54" r="3.5" fill="#dc2626" />
          <circle cx="50" cy="30" r="3.5" fill="#dc2626" />
        </g>
      );
      break;
    case "weekend":
      scene = (
        <g>
          <rect x="26" y="28" width="48" height="46" rx="4" className="stroke-main fill-soft" />
          <line x1="26" y1="42" x2="74" y2="42" stroke={mainColor} strokeWidth="2" />
          <rect x="36" y="48" width="28" height="18" fill={strokeColor} />
          <text x="50" y="61" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">S-S</text>
        </g>
      );
      break;
    case "yesterday":
      scene = (
        <g>
          <circle cx="50" cy="50" r="20" className="stroke-main fill-soft" />
          <path d="M50 34 V50 L38 50" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M34 50 A16 16 0 1 1 50 66" stroke={strokeWarm} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
        </g>
      );
      break;

    default:
      scene = (
        <g>
          <circle cx="50" cy="50" r="16" fill={fillAccentSoft} className="ani-ripple" />
          <circle cx="50" cy="50" r="6" fill={strokeColor} />
        </g>
      );
  }

  return (
    <svg viewBox="0 0 100 100" className="vector-svg" width="100%" height="100%" style={{ maxWidth: "160px", maxHeight: "160px" }}>
      <style>{styleTag}</style>
      {scene}
    </svg>
  );
}
