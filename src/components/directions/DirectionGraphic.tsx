export function DirectionGraphic({ type }: { type: string }) {
  const strokeColor = "var(--accent)";
  const strokeWarm = "var(--accent-warm)";
  const mainColor = "var(--ink)";
  const faintColor = "var(--border)";
  const fillAccentSoft = "var(--accent-soft)";

  const inlineStyles = `
    .ani-ball {
      fill: ${strokeColor};
    }
    .ani-ball-secondary {
      fill: ${mainColor};
    }

    /* Radar Sonar for 'at' */
    @keyframes sonar-pulse {
      0% { r: 5; opacity: 0.8; }
      100% { r: 25; opacity: 0; }
    }
    .sonar-ring {
      stroke: ${strokeColor};
      stroke-width: 1.2;
      fill: none;
      transform-origin: 50px 50px;
      animation: sonar-pulse 2s infinite ease-out;
    }

    /* Breathing pulse for 'in' */
    @keyframes breathing {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    .ball-breath {
      transform-origin: 50px 50px;
      animation: breathing 2.5s infinite ease-in-out;
    }

    /* Gravity squash for 'on' */
    @keyframes gravity-squash {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.92); }
    }
    .ball-gravity {
      transform-origin: 50px 58px;
      animation: gravity-squash 2.5s infinite ease-in-out;
    }

    /* Shadow pulse for 'under' */
    @keyframes shadow-pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.15); opacity: 0.25; }
    }
    .shadow-under {
      transform-origin: 50px 67px;
      animation: shadow-pulse 2.5s infinite ease-in-out;
    }

    /* Gap pulse for 'over' */
    @keyframes gap-pulse {
      0%, 100% { stroke-dashoffset: 0; }
      50% { stroke-dashoffset: 6; }
    }
    .vector-gap {
      stroke-dasharray: 4 2;
      animation: gap-pulse 2s infinite linear;
    }

    /* Orbit path for 'about' */
    @keyframes orbit-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .about-orbit {
      transform-origin: 50px 50px;
      animation: orbit-rotate 4s infinite linear;
    }

    /* Collision Shockwave for 'against' */
    @keyframes impact-wave {
      0%, 35% { transform: scale(0.1); opacity: 0; }
      38% { opacity: 0.8; }
      70% { transform: scale(1.6); opacity: 0; }
      100% { opacity: 0; }
    }
    .shockwave {
      stroke: ${strokeWarm};
      stroke-width: 1.5;
      fill: none;
      transform-origin: 62px 50px;
      animation: impact-wave 3s infinite ease-out;
    }

    /* Vector trajectory for 'to' */
    @keyframes to-move {
      0% { cx: 20; opacity: 0; }
      15% { opacity: 1; }
      80% { cx: 65; opacity: 1; }
      90%, 100% { cx: 65; opacity: 0; }
    }
    .ball-to { animation: to-move 2.2s infinite ease-in-out; }

    /* Vector trajectory for 'from' */
    @keyframes from-move {
      0% { cx: 34; opacity: 0; }
      15% { opacity: 1; }
      80% { cx: 80; opacity: 1; }
      90%, 100% { cx: 80; opacity: 0; }
    }
    .ball-from { animation: from-move 2.2s infinite ease-in-out; }

    /* Altitude scaling for 'up' */
    @keyframes up-climb {
      0% { cy: 80; opacity: 0; }
      15% { opacity: 1; }
      80% { cy: 25; opacity: 1; }
      90%, 100% { cy: 25; opacity: 0; }
    }
    .ball-up { animation: up-climb 2.2s infinite ease-in-out; }

    /* Altitude scaling for 'down' */
    @keyframes down-drop {
      0% { cy: 20; opacity: 0; }
      15% { opacity: 1; }
      80% { cy: 75; opacity: 1; }
      90%, 100% { cy: 75; opacity: 0; }
    }
    .ball-down { animation: down-drop 2.2s infinite ease-in-out; }

    /* 3D pipe travel for 'through' */
    @keyframes through-pipe {
      0% { cx: 15; opacity: 0; }
      15% { opacity: 1; }
      85% { cx: 85; opacity: 1; }
      95%, 100% { cx: 85; opacity: 0; }
    }
    .ball-through { animation: through-pipe 2.5s infinite linear; }

    /* Flat crossing waves for 'across' */
    @keyframes across-travel {
      0% { cx: 15; opacity: 0; }
      15% { opacity: 1; }
      80% { cx: 85; opacity: 1; }
      90%, 100% { cx: 85; opacity: 0; }
    }
    .ball-across { animation: across-travel 2.4s infinite ease-in-out; }

    /* Parabolic bounce for 'off' */
    @keyframes off-bounce {
      0% { cx: 22; cy: 41; transform: scale(1); opacity: 0; }
      10% { opacity: 1; }
      35% { cx: 55; cy: 41; }
      55% { cx: 72; cy: 75; transform: scale(1.1, 0.8); } /* Impact squish */
      60% { cx: 75; cy: 62; transform: scale(0.9, 1.1); } /* rebound */
      70% { cx: 80; cy: 75; transform: scale(1); opacity: 1; }
      85%, 100% { opacity: 0; }
    }
    .ball-off {
      transform-origin: center;
      animation: off-bounce 2.8s infinite ease-in-out;
    }

    /* Against push */
    @keyframes against-push {
      0% { cx: 20; }
      35% { cx: 52; }
      80% { cx: 52; }
      90%, 100% { cx: 20; }
    }
    .ball-against { animation: against-push 3s infinite cubic-bezier(0.25, 1, 0.5, 1); }

    /* Chasing trailing speed dots for 'after' */
    @keyframes after-lead {
      0% { cx: 40; opacity: 0; }
      15% { opacity: 1; }
      80% { cx: 80; opacity: 1; }
      90%, 100% { cx: 80; opacity: 0; }
    }
    @keyframes after-follow {
      0% { cx: 20; opacity: 0; }
      15% { opacity: 1; }
      80% { cx: 60; opacity: 1; }
      90%, 100% { cx: 60; opacity: 0; }
    }
    .ball-after-lead { animation: after-lead 2.5s infinite ease-in-out; }
    .ball-after-follow { animation: after-follow 2.5s infinite ease-in-out; }

    /* Leading speed dots for 'before' */
    @keyframes before-lead {
      0% { cx: 45; opacity: 0; }
      15% { opacity: 1; }
      80% { cx: 82; opacity: 1; }
      90%, 100% { cx: 82; opacity: 0; }
    }
    @keyframes before-follow {
      0% { cx: 20; opacity: 0; }
      15% { opacity: 1; }
      80% { cx: 57; opacity: 1; }
      90%, 100% { cx: 57; opacity: 0; }
    }
    .ball-before-lead { animation: before-lead 2.5s infinite ease-in-out; }
    .ball-before-follow { animation: before-follow 2.5s infinite ease-in-out; }

    /* Parallel lockstep capsule for 'with' */
    @keyframes with-sync {
      0% { transform: translate(0, 0); opacity: 0; }
      15% { opacity: 1; }
      80% { transform: translate(40px, 0); opacity: 1; }
      90%, 100% { transform: translate(40px, 0); opacity: 0; }
    }
    .capsule-with { animation: with-sync 2.5s infinite ease-in-out; }

    /* Till neon wall progress */
    @keyframes till-prog {
      0% { stroke-dashoffset: 55; }
      80% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    .path-till {
      stroke-dasharray: 55;
      stroke-dashoffset: 55;
      animation: till-prog 2.8s infinite ease-in-out;
    }

    /* Seesaws than tilt */
    @keyframes seesaw-tilt {
      0%, 100% { transform: rotate(-6deg); }
      50% { transform: rotate(6deg); }
    }
    .seesaw-beam {
      transform-origin: 50px 65px;
      animation: seesaw-tilt 4s infinite ease-in-out;
    }

    /* Morphing window for 'as' */
    @keyframes morph-pulse {
      0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
      50% { opacity: 0.8; transform: scaleX(1.2); }
    }
    .lens-split {
      transform-origin: 46px 50px;
      animation: morph-pulse 3s infinite ease-in-out;
    }
  `;

  const baseSvgProps = {
    viewBox: "0 0 100 100",
    width: "100%",
    height: "100%",
    className: "vector-svg"
  };

  switch (type) {
    case "at":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <path d="M50 15 V85 M15 50 H85" stroke={faintColor} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="14" stroke={strokeWarm} strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="0" className="sonar-ring" />
          <circle cx="50" cy="50" r="0" className="sonar-ring" style={{ animationDelay: "1s" }} />
          <circle cx="50" cy="50" r="7" className="ani-ball ball-pulse-at" />
          <circle cx="50" cy="50" r="1.8" fill="#fff" />
        </svg>
      );
    case "in":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <defs>
            <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--accent-warm)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect x="25" y="25" width="50" height="50" rx="8" stroke={mainColor} strokeWidth="2.5" fill="url(#boxGrad)" />
          <rect x="28" y="28" width="44" height="44" rx="6" stroke={faintColor} strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
          <circle cx="50" cy="50" r="8.5" className="ani-ball ball-breath" />
        </svg>
      );
    case "on":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <path d="M15 60 H85" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M22 64 L18 69 M37 64 L33 69 M52 64 L48 69 M67 64 L63 69 M82 64 L78 69" stroke={faintColor} strokeWidth="1.5" />
          {/* Subtle weight lines at contact point */}
          <ellipse cx="50" cy="61" rx="7" ry="1.5" fill={strokeWarm} opacity="0.6" />
          <circle cx="50" cy="50" r="10" className="ani-ball ball-gravity" />
        </svg>
      );
    case "under":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <path d="M15 40 H85" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M20 36 L23 31 M40 36 L43 31 M60 36 L63 31 M80 36 L83 31" stroke={faintColor} strokeWidth="1.5" />
          <ellipse cx="50" cy="67" rx="8" ry="1.8" fill={mainColor} className="shadow-under" />
          <circle cx="50" cy="52" r="9.5" className="ani-ball" />
        </svg>
      );
    case "over":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <path d="M15 68 H85" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="30" r="9.5" className="ani-ball" />
          {/* Vertical gap guide */}
          <line x1="50" y1="42" x2="50" y2="60" stroke={strokeWarm} strokeWidth="1.5" className="vector-gap" />
          <path d="M47 57 L50 60 L53 57" stroke={strokeWarm} strokeWidth="1.5" fill="none" />
          <path d="M47 45 L50 42 L53 45" stroke={strokeWarm} strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "by":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          {/* Pillar reference */}
          <rect x="22" y="22" width="22" height="56" rx="4" stroke={mainColor} strokeWidth="2.5" fill="none" />
          <rect x="25" y="25" width="16" height="50" rx="2" stroke={faintColor} strokeWidth="0.8" strokeDasharray="2 1" fill="none" />
          {/* Proximity coordinate field */}
          <circle cx="68" cy="50" r="14" stroke={strokeWarm} strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity="0.4" />
          <circle cx="68" cy="50" r="9.5" className="ani-ball" />
          {/* Distance guide */}
          <path d="M49 50 H58" stroke={strokeWarm} strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
      );
    case "between":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <rect x="12" y="22" width="16" height="56" rx="3" stroke={faintColor} strokeWidth="1.8" fill="none" />
          <rect x="72" y="22" width="16" height="56" rx="3" stroke={faintColor} strokeWidth="1.8" fill="none" />
          <circle cx="50" cy="50" r="14" stroke={strokeWarm} strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity="0.4" />
          <circle cx="50" cy="50" r="10" className="ani-ball ball-breath" />
        </svg>
      );
    case "among":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          {/* Orbit rings */}
          <circle cx="50" cy="50" r="28" stroke={faintColor} strokeWidth="0.8" strokeDasharray="4 4" fill="none" />
          {/* Neighbor elements */}
          <circle cx="26" cy="32" r="5" className="ani-ball-secondary" />
          <circle cx="74" cy="30" r="5" className="ani-ball-secondary" />
          <circle cx="22" cy="68" r="5" className="ani-ball-secondary" />
          <circle cx="72" cy="70" r="5" className="ani-ball-secondary" />
          <circle cx="50" cy="22" r="5" className="ani-ball-secondary" />
          <circle cx="50" cy="78" r="5" className="ani-ball-secondary" />
          {/* Floating nested main ball */}
          <circle cx="49" cy="50" r="10.5" className="ani-ball ball-breath" />
        </svg>
      );

    case "to":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <rect x="66" y="32" width="22" height="36" rx="4" stroke={faintColor} strokeWidth="1.8" fill="none" />
          {/* Target ripple */}
          <circle cx="77" cy="50" r="12" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.5" />
          <path d="M15 50 H61" stroke={strokeWarm} strokeWidth="2" strokeDasharray="3 2" />
          <path d="M54 44 L62 50 L54 56" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="20" cy="50" r="7.5" className="ani-ball ball-to" />
        </svg>
      );
    case "from":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <rect x="12" y="32" width="22" height="36" rx="4" stroke={faintColor} strokeWidth="1.8" fill="none" />
          <circle cx="23" cy="50" r="12" stroke={faintColor} strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
          <path d="M38 50 H80" stroke={strokeWarm} strokeWidth="2" strokeDasharray="3 2" />
          <path d="M72 44 L80 50 L72 56" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="34" cy="50" r="7.5" className="ani-ball ball-from" />
        </svg>
      );
    case "up":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          {/* Altitude marks */}
          <line x1="30" y1="45" x2="70" y2="45" stroke={faintColor} strokeWidth="0.8" strokeDasharray="4 4" />
          <text x="75" y="47" fontSize="4.5px" fontFamily="var(--mono)" fill={faintColor}>alt 2</text>
          <line x1="30" y1="25" x2="70" y2="25" stroke={faintColor} strokeWidth="0.8" strokeDasharray="4 4" />
          <text x="75" y="27" fontSize="4.5px" fontFamily="var(--mono)" fill={faintColor}>alt 3</text>
          
          <path d="M50 82 V22" stroke={strokeWarm} strokeWidth="2.5" strokeDasharray="4 2" />
          <path d="M44 30 L50 22 L56 30" stroke={strokeWarm} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M25 82 H75" stroke={mainColor} strokeWidth="2" />
          <circle cx="50" cy="80" r="8" className="ani-ball ball-up" />
        </svg>
      );
    case "down":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          {/* Altitude marks */}
          <line x1="30" y1="50" x2="70" y2="50" stroke={faintColor} strokeWidth="0.8" strokeDasharray="4 4" />
          <text x="75" y="52" fontSize="4.5px" fontFamily="var(--mono)" fill={faintColor}>alt 2</text>
          <line x1="30" y1="75" x2="70" y2="75" stroke={faintColor} strokeWidth="0.8" strokeDasharray="4 4" />
          <text x="75" y="77" fontSize="4.5px" fontFamily="var(--mono)" fill={faintColor}>alt 1</text>

          <path d="M50 15 V75" stroke={strokeWarm} strokeWidth="2.5" strokeDasharray="4 2" />
          <path d="M44 67 L50 75 L56 67" stroke={strokeWarm} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M25 78 H75" stroke={mainColor} strokeWidth="2" />
          <circle cx="50" cy="20" r="8" className="ani-ball ball-down" />
        </svg>
      );
    case "through":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          {/* Tube representation in semi-3D (oval rims) */}
          <rect x="35" y="32" width="30" height="36" fill={fillAccentSoft} fillOpacity="0.1" stroke={faintColor} strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Entry & exit ovals */}
          <ellipse cx="35" cy="50" rx="3.5" ry="18" fill="none" stroke={mainColor} strokeWidth="2.5" />
          <ellipse cx="65" cy="50" rx="3.5" ry="18" fill="none" stroke={mainColor} strokeWidth="2.5" />
          <path d="M35 32 H65 M35 68 H65" stroke={mainColor} strokeWidth="2.5" />
          
          <path d="M10 50 H90" stroke={strokeWarm} strokeWidth="1.8" strokeDasharray="3 3" />
          <path d="M82 45 L90 50 L82 55" stroke={strokeWarm} strokeWidth="1.8" fill="none" />
          <circle cx="15" cy="50" r="7" className="ani-ball ball-through" />
        </svg>
      );
    case "across":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          {/* Wave grid river */}
          <rect x="40" y="12" width="20" height="76" fill={fillAccentSoft} fillOpacity="0.25" stroke={faintColor} strokeWidth="1.2" />
          <path d="M40 12 V88 M60 12 V88" stroke={mainColor} strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Wave ripples in river */}
          <path d="M42 25 Q45 23 48 25 T54 25 T58 25 M42 55 Q45 53 48 55 T54 55 T58 55" stroke={faintColor} strokeWidth="1" fill="none" />
          
          <path d="M10 50 H90" stroke={strokeWarm} strokeWidth="2" strokeDasharray="4 3" />
          <path d="M82 45 L90 50 L82 55" stroke={strokeWarm} strokeWidth="2" fill="none" />
          <circle cx="15" cy="50" r="7" className="ani-ball ball-across" />
        </svg>
      );
    case "off":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          {/* Table */}
          <path d="M10 41 H50 V82" stroke={mainColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Trajectory */}
          <path d="M22 41 H50 C55 41, 72 51, 75 75" stroke={strokeWarm} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          <circle cx="22" cy="41" r="7" className="ani-ball ball-off" />
        </svg>
      );
    case "about":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <rect x="42" y="42" width="16" height="16" rx="2" stroke={mainColor} strokeWidth="3" fill="none" />
          <circle cx="50" cy="50" r="28" stroke={strokeWarm} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          <g className="about-orbit">
            {/* orbit path line tail */}
            <path d="M50 22 A28 28 0 0 1 74.2 36" stroke={strokeColor} strokeWidth="2" fill="none" opacity="0.4" />
            <circle cx="50" cy="22" r="7.5" className="ani-ball" />
          </g>
        </svg>
      );

    case "against":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <rect x="62" y="15" width="16" height="70" rx="2" stroke={mainColor} strokeWidth="3" fill={faintColor} />
          {/* Collision Shockwave ring */}
          <circle cx="62" cy="50" r="0" className="shockwave" />
          <circle cx="62" cy="50" r="0" className="shockwave" style={{ animationDelay: "1.5s" }} />
          
          <g className="force-arrow">
            <path d="M60 50 H42" stroke={strokeWarm} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M48 44 L42 50 L48 56" stroke={strokeWarm} strokeWidth="2.5" fill="none" />
          </g>
          <circle cx="20" cy="50" r="9.5" className="ani-ball ball-against" />
        </svg>
      );
    case "after":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <path d="M10 50 H90" stroke={faintColor} strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="40" cy="50" r="8" className="ani-ball-secondary ball-after-lead" />
          <circle cx="20" cy="50" r="8" className="ani-ball ball-after-follow" />
          {/* Link curve */}
          <path d="M22 56 C30 63, 44 63, 52 56" stroke={strokeWarm} strokeWidth="1" strokeDasharray="2 1" fill="none" />
        </svg>
      );
    case "before":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <path d="M10 50 H90" stroke={faintColor} strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="45" cy="50" r="8" className="ani-ball ball-before-lead" />
          <circle cx="20" cy="50" r="8" className="ani-ball-secondary ball-before-follow" />
          {/* Link curve */}
          <path d="M22 44 C30 37, 44 37, 52 44" stroke={strokeWarm} strokeWidth="1" strokeDasharray="2 1" fill="none" />
        </svg>
      );
    case "with":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <path d="M10 38 H90 M10 62 H90" stroke={faintColor} strokeWidth="1.2" strokeDasharray="4 4" />
          <g className="capsule-with">
            {/* Pill Capsule boundary */}
            <rect x="8" y="24" width="30" height="52" rx="15" stroke={strokeWarm} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <circle cx="23" cy="38" r="7" className="ani-ball" />
            <circle cx="23" cy="62" r="7" className="ani-ball-secondary" />
          </g>
        </svg>
      );

    case "of":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <circle cx="50" cy="50" r="28" stroke={mainColor} strokeWidth="2.5" fill="none" />
          <path d="M50 50 L50 22 M50 50 L75 62 M50 50 L25 62" stroke={faintColor} strokeWidth="1.5" strokeDasharray="2 2" />
          {/* Highlighted sector slice (Part of Whole) */}
          <path d="M50 50 L50 22 A28 28 0 0 1 74.2 64 Z" fill={strokeColor} fillOpacity="0.45" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M68 32 C78 28, 80 18, 70 12" stroke={strokeWarm} strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
          <text x="75" y="10" fontSize="6px" fontFamily="var(--mono)" fill={strokeWarm} fontWeight="bold">OF</text>
        </svg>
      );
    case "for":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <circle cx="25" cy="50" r="8.5" className="ani-ball-secondary" />
          <rect x="62" y="36" width="24" height="28" rx="4" stroke={strokeColor} strokeWidth="3" fill={fillAccentSoft} fillOpacity="0.2" />
          <path d="M38 50 H56" stroke={strokeWarm} strokeWidth="3" strokeLinecap="round" />
          <path d="M50 44 L56 50 L50 56" stroke={strokeWarm} strokeWidth="3" fill="none" />
          <text x="38" y="38" fontSize="7px" fontFamily="var(--mono)" fill={strokeWarm} fontWeight="bold">FOR</text>
        </svg>
      );
    case "as":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <circle cx="28" cy="50" r="11" stroke={mainColor} strokeWidth="2.5" fill="none" />
          {/* Split morphing lens */}
          <path d="M46 22 V78" stroke={strokeWarm} strokeWidth="2.5" strokeDasharray="4 2" className="lens-split" />
          <polygon points="72,35 75,45 85,45 77,52 80,63 72,56 64,63 67,52 59,45 69,45" stroke={strokeColor} strokeWidth="2.5" fill="none" />
          <text x="40" y="18" fontSize="7px" fontFamily="var(--mono)" fill={strokeWarm} fontWeight="bold">AS</text>
        </svg>
      );
    case "till":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <path d="M15 50 H68" stroke={faintColor} strokeWidth="3.5" strokeLinecap="round" />
          {/* Neon stop wall */}
          <path d="M72 25 V75" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
          <path d="M15 50 H68" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" className="path-till" />
          <text x="64" y="18" fontSize="7px" fontFamily="var(--mono)" fill={strokeColor} fontWeight="bold">TILL</text>
        </svg>
      );
    case "than":
      return (
        <svg {...baseSvgProps}>
          <style>{inlineStyles}</style>
          <polygon points="50,65 45,78 55,78" fill={mainColor} />
          <g className="seesaw-beam">
            <line x1="15" y1="65" x2="85" y2="65" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="20" cy="53" r="11" stroke={strokeColor} strokeWidth="2.5" fill={fillAccentSoft} />
            <circle cx="80" cy="59" r="6" stroke={strokeColor} strokeWidth="2.5" fill="none" />
            <text x="17" y="55" fontSize="7px" fontFamily="var(--serif)" fontWeight="bold" fill={strokeColor}>A</text>
            <text x="78" y="61" fontSize="7px" fontFamily="var(--serif)" fontWeight="bold" fill={strokeColor}>B</text>
          </g>
          <text x="44" y="25" fontSize="7px" fontFamily="var(--mono)" fill={strokeWarm} fontWeight="bold">THAN</text>
        </svg>
      );

    default:
      return null;
  }
}
