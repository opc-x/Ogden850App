export function MachineGraphic({ word }: { word: string }) {
  const strokeColor = "var(--accent)";
  const strokeWarm = "var(--accent-warm)";
  const mainColor = "var(--ink)";
  const faintColor = "var(--border)";
  const fillAccentSoft = "var(--accent-soft)";

  const styleTag = `
    .stroke-main { stroke: ${mainColor}; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .stroke-accent { stroke: ${strokeColor}; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .stroke-warm { stroke: ${strokeWarm}; fill: none; stroke-width: 1.8; stroke-linecap: round; }
    .fill-soft { fill: ${fillAccentSoft}; fill-opacity: 0.45; }
    .fill-accent { fill: ${strokeColor}; }
    .fill-warm { fill: ${strokeWarm}; }
    
    @keyframes rise-anim {
      0% { transform: translateY(12px); opacity: 0; }
      15% { opacity: 1; }
      85% { transform: translateY(-12px); opacity: 1; }
      100% { opacity: 0; }
    }
    .ani-rise { animation: rise-anim 2.5s infinite ease-in-out; }

    @keyframes drop-anim {
      0% { transform: translateY(-12px); opacity: 0; }
      15% { opacity: 1; }
      85% { transform: translateY(12px); opacity: 1; }
      100% { opacity: 0; }
    }
    .ani-drop { animation: drop-anim 2.5s infinite ease-in-out; }

    @keyframes flight-anim {
      0% { transform: translate(-22px, 15px) rotate(-12deg); opacity: 0; }
      15% { opacity: 1; }
      85% { transform: translate(25px, -18px) rotate(-12deg); opacity: 1; }
      100% { opacity: 0; }
    }
    .ani-flight { animation: flight-anim 2.8s infinite cubic-bezier(0.25, 1, 0.5, 1); }

    @keyframes clock-back {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }
    .ani-clock-back { transform-origin: 50px 50px; animation: clock-back 3.5s infinite linear; }

    @keyframes calendar-move {
      0% { transform: translateX(0); opacity: 1; }
      65% { transform: translateX(18px); opacity: 0.8; }
      100% { transform: translateX(18px); opacity: 0; }
    }
    .ani-calendar-push { animation: calendar-move 2.5s infinite ease-in-out; }

    @keyframes search-light {
      0%, 100% { transform: rotate(-25deg); }
      50% { transform: rotate(25deg); }
    }
    .ani-lighthouse { transform-origin: 50px 20px; animation: search-light 3.5s infinite ease-in-out; }

    @keyframes spin-gear {
      100% { transform: rotate(360deg); }
    }
    .ani-gear { transform-origin: 50px 50px; animation: spin-gear 5s infinite linear; }

    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-8deg); }
      75% { transform: rotate(8deg); }
    }
    .ani-wiggle { transform-origin: 50px 50px; animation: wiggle 0.6s infinite ease-in-out; }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .ani-bounce { animation: bounce 1.6s infinite ease-in-out; }

    @keyframes float-y {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
    .ani-float { animation: float-y 3s infinite ease-in-out; }

    @keyframes pulse-scale {
      0%, 100% { transform: scale(0.95); opacity: 0.7; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    .ani-pulse { transform-origin: 50px 50px; animation: pulse-scale 2.2s infinite ease-in-out; }

    @keyframes wave {
      0%, 100% { transform: translateY(0) scaleY(1); }
      50% { transform: translateY(2px) scaleY(0.96); }
    }
    .ani-wave { animation: wave 2.2s infinite ease-in-out; }

    @keyframes explosion-anim {
      0% { transform: scale(0.2); opacity: 0; }
      15% { opacity: 1; }
      80% { transform: scale(1.25); opacity: 0; }
      100% { opacity: 0; }
    }
    .ani-explosion { transform-origin: 50px 50px; animation: explosion-anim 2.2s infinite ease-out; }
  `;

  let scene = null;

  switch (word) {
    // 1. GET 组合
    case "get up":
      scene = (
        <g>
          {/* Bed outline */}
          <path d="M15 72 h70 v-15 h-8 v-8 h-12 v8 h-42 v8 h-8 z" className="stroke-main fill-soft" />
          <circle cx="28" cy="53" r="4" fill={faintColor} />
          {/* Rising person */}
          <g className="ani-rise">
            <circle cx="50" cy="35" r="6" fill={strokeColor} />
            <path d="M50 41 v12 M42 46 h16 M44 60 l6-7 6 7" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M50 25 l-3-3 m6 0 l-3 3" stroke={strokeWarm} strokeWidth="1.5" />
          </g>
          {/* Rising Sun */}
          <g className="ani-float">
            <circle cx="78" cy="22" r="7" fill="#f59e0b" />
            <path d="M78 11 v3 M78 30 v3 M67 22 h3 M86 22 h3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      );
      break;
    case "get off":
      scene = (
        <g>
          {/* Bus stationary */}
          <rect x="15" y="25" width="48" height="36" rx="4" className="stroke-main fill-soft" />
          <line x1="15" y1="50" x2="63" y2="50" stroke={mainColor} strokeWidth="1.5" />
          <rect x="22" y="32" width="10" height="10" rx="1" fill={faintColor} />
          <rect x="36" y="32" width="10" height="10" rx="1" fill={faintColor} />
          <circle cx="27" cy="65" r="5" className="stroke-main" fill={mainColor} />
          <circle cx="51" cy="65" r="5" className="stroke-main" fill={mainColor} />
          {/* Person stepping off */}
          <g className="ani-drop">
            <circle cx="75" cy="40" r="5" fill={strokeColor} />
            <path d="M75 45 v12 M70 50 h10 M71 63 l4-6 4 6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Landing ground line */}
          <line x1="10" y1="72" x2="90" y2="72" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
      break;
    case "get on":
      scene = (
        <g>
          {/* Bus */}
          <rect x="38" y="25" width="48" height="36" rx="4" className="stroke-main fill-soft" />
          <line x1="38" y1="50" x2="86" y2="50" stroke={mainColor} strokeWidth="1.5" />
          <rect x="46" y="32" width="10" height="10" rx="1" fill={faintColor} />
          <rect x="62" y="32" width="10" height="10" rx="1" fill={faintColor} />
          <circle cx="50" cy="65" r="5" className="stroke-main" fill={mainColor} />
          <circle cx="74" cy="65" r="5" className="stroke-main" fill={mainColor} />
          {/* Steps */}
          <path d="M38 52 h-8 v7 h-8 v7" stroke={mainColor} strokeWidth="2" fill="none" />
          {/* Person walking up */}
          <g className="ani-rise">
            <circle cx="16" cy="38" r="5" fill={strokeColor} />
            <path d="M16 43 v10 M11 48 h10 M12 60 l4-7 4 7" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
          <line x1="10" y1="72" x2="90" y2="72" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
      break;
    case "get back":
      scene = (
        <g>
          {/* Target object (e.g. golden key) */}
          <g className="ani-pulse">
            <circle cx="25" cy="45" r="8" fill="none" stroke={strokeWarm} strokeWidth="2" strokeDasharray="3 2" />
            <path d="M22 45 h10 m-7-3 v6 m7-3 h4 v3 h2 v-3 h2 v-3 h-8" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
          {/* Boomerang returning path */}
          <path d="M75 30 C55 20, 30 30, 32 46 C34 58, 60 70, 72 56" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          {/* Hand grabbing back */}
          <g className="ani-bounce">
            <path d="M85 54 h-12 c-2 0-3-1-3-3 s1-3 3-3 h8 m-8 0 c-1.5 0-2.5-1-2.5-2 s1-2 2.5-2 h5" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        </g>
      );
      break;
    case "get out":
      scene = (
        <g>
          {/* Room with open door */}
          <rect x="15" y="20" width="38" height="55" rx="3" className="stroke-main fill-soft" />
          {/* Swung door */}
          <path d="M53 20 l12 8 v55 l-12-8 z" fill="var(--bg-elevated)" stroke={mainColor} strokeWidth="2" />
          {/* Person exiting */}
          <g className="ani-flight" style={{ animationName: "rise-anim" }}>
            <circle cx="58" cy="45" r="5" fill={strokeColor} />
            <path d="M58 50 v10 M52 55 h12 M54 67 l4-7 4 7" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Direction arrow */}
          <path d="M35 48 h32 m-6-5 l6 5 l-6 5" stroke={strokeWarm} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      );
      break;
    case "get in":
      scene = (
        <g>
          {/* Room with door */}
          <rect x="48" y="20" width="38" height="55" rx="3" className="stroke-main fill-soft" />
          {/* Open door */}
          <path d="M48 20 l-12 8 v55 l-12-8 z" fill="var(--bg-elevated)" stroke={mainColor} strokeWidth="2" />
          {/* Person entering */}
          <g className="ani-flight" style={{ animationName: "rise-anim" }}>
            <circle cx="28" cy="45" r="5" fill={strokeColor} />
            <path d="M28 50 v10 M22 55 h12 M24 67 l4-7 4 7" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Direction arrow */}
          <path d="M15 48 h30 m-6-5 l6 5 l-6 5" stroke={strokeWarm} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      );
      break;
    case "get over":
      scene = (
        <g>
          {/* Brick wall */}
          <rect x="42" y="48" width="16" height="32" fill="var(--border-soft)" stroke={mainColor} strokeWidth="2" />
          <line x1="42" y1="58" x2="58" y2="58" stroke={mainColor} strokeWidth="1.5" />
          <line x1="42" y1="68" x2="58" y2="68" stroke={mainColor} strokeWidth="1.5" />
          <line x1="50" y1="48" x2="50" y2="80" stroke={mainColor} strokeWidth="1.5" />
          {/* Curved path */}
          <path d="M18 72 Q50 15, 82 72" stroke={strokeWarm} strokeWidth="1.8" strokeDasharray="3 3" fill="none" />
          {/* Jumping person */}
          <g className="ani-rise" style={{ animationName: "flight-anim" }}>
            <circle cx="42" cy="36" r="5.5" fill={strokeColor} />
            <path d="M42 41.5 v8 M37 45 h10 M39 56 l3-6 3 6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
          <line x1="10" y1="80" x2="90" y2="80" stroke={mainColor} strokeWidth="2" />
        </g>
      );
      break;
    case "get down":
      scene = (
        <g>
          {/* Horizontal low ceiling or beam */}
          <rect x="10" y="20" width="80" height="12" fill="var(--border-soft)" stroke={mainColor} strokeWidth="2" />
          <line x1="10" y1="32" x2="90" y2="32" stroke={strokeWarm} strokeWidth="1.5" />
          {/* Ducking figure */}
          <g className="ani-drop">
            <circle cx="50" cy="53" r="5" fill={strokeColor} />
            <path d="M50 58 v6 M45 61 h10 M44 72 l6-8 6 8" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {/* Action indicators */}
            <path d="M50 38 v10 m-4-6 l4 6 l4-6" stroke={strokeWarm} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
          <line x1="10" y1="78" x2="90" y2="78" stroke={mainColor} strokeWidth="2.5" />
        </g>
      );
      break;
    case "get through":
      scene = (
        <g>
          {/* 3D-like Arch tunnel */}
          <path d="M25 75 V40 C25 25, 75 25, 75 40 V75" stroke={mainColor} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M35 75 V46 C35 34, 65 34, 65 46 V75" stroke={faintColor} strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
          {/* Ground */}
          <line x1="15" y1="75" x2="85" y2="75" stroke={mainColor} strokeWidth="2" />
          {/* Arrow / Person passing through */}
          <g className="ani-rise" style={{ animationName: "flight-anim" }}>
            <circle cx="50" cy="50" r="6" fill={strokeColor} />
            <path d="M35 50 h30 m-6-5 l6 5 l-6 5" stroke={strokeWarm} strokeWidth="2" fill="none" />
          </g>
        </g>
      );
      break;

    // 2. PUT 组合
    case "put off":
      scene = (
        <g>
          {/* Calendar Box */}
          <rect x="20" y="25" width="40" height="40" rx="3" className="stroke-main fill-soft" />
          <line x1="20" y1="36" x2="60" y2="36" stroke={mainColor} strokeWidth="2" />
          <circle cx="28" cy="30" r="2" fill={mainColor} />
          <circle cx="52" cy="30" r="2" fill={mainColor} />
          <circle cx="32" cy="48" r="4" fill="#ef4444" />
          {/* Calendar page flying / postponed */}
          <g className="ani-calendar-push">
            <rect x="48" y="25" width="40" height="40" rx="3" stroke={strokeColor} strokeWidth="2" fill="none" />
            <line x1="48" y1="36" x2="88" y2="36" stroke={strokeColor} strokeWidth="2" />
            <circle cx="68" cy="48" r="4" fill={strokeWarm} />
            <path d="M36 48 h30 m-6-4 l6 4 l-6 4" stroke={strokeColor} strokeWidth="1.8" fill="none" />
          </g>
        </g>
      );
      break;
    case "put on":
      scene = (
        <g>
          {/* Hanger / Coat rack */}
          <line x1="50" y1="20" x2="50" y2="75" stroke={mainColor} strokeWidth="2.2" />
          <line x1="32" y1="75" x2="68" y2="75" stroke={mainColor} strokeWidth="2.5" />
          {/* Hat and Jacket descending */}
          <g className="ani-drop">
            {/* Hat */}
            <path d="M40 32 h20 l-4-7 h-12 z" fill={strokeColor} stroke={strokeColor} strokeWidth="1.5" />
            <ellipse cx="50" cy="32" rx="14" ry="2" fill={strokeColor} />
            {/* Coat */}
            <path d="M30 42 h40 l-8 25 h-24 z" className="stroke-accent fill-soft" />
            <line x1="50" y1="42" x2="50" y2="67" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        </g>
      );
      break;
    case "put out":
      scene = (
        <g>
          {/* Campfire flame */}
          <g className="ani-pulse">
            <path d="M50 40 C42 55, 45 72, 50 75 C55 72, 58 55, 50 40 Z" fill="#f59e0b" opacity="0.8" />
            <path d="M50 48 C45 58, 47 72, 50 75 C53 72, 55 58, 50 48 Z" fill="#ef4444" />
          </g>
          <path d="M35 75 l30-10 m-30 0 l30 10" stroke={mainColor} strokeWidth="3.2" strokeLinecap="round" />
          {/* Bucket pouring water or snuffer dome descending */}
          <g className="ani-drop">
            <path d="M32 20 l12-8 h12 l4 8" stroke={strokeColor} strokeWidth="2" fill="none" />
            <path d="M42 20 c0 5, -5 10, -5 15 s5 5, 5 10" stroke="#3b82f6" strokeWidth="2.2" strokeDasharray="3 3" fill="none" />
          </g>
        </g>
      );
      break;
    case "put up":
      scene = (
        <g>
          <line x1="15" y1="75" x2="85" y2="75" stroke={mainColor} strokeWidth="2" />
          {/* Billboard / signpost being erected */}
          <g className="ani-rise">
            <rect x="28" y="25" width="44" height="26" rx="2" className="stroke-accent fill-soft" />
            <line x1="38" y1="32" x2="62" y2="32" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="38" y1="42" x2="54" y2="42" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="50" y1="51" x2="50" y2="75" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="42" y1="62" x2="35" y2="75" stroke={strokeWarm} strokeWidth="1.5" />
            <line x1="58" y1="62" x2="65" y2="75" stroke={strokeWarm} strokeWidth="1.5" />
          </g>
        </g>
      );
      break;
    case "put down":
      scene = (
        <g>
          {/* Table surface */}
          <line x1="15" y1="70" x2="85" y2="70" stroke={mainColor} strokeWidth="3.2" strokeLinecap="round" />
          <line x1="25" y1="70" x2="25" y2="85" stroke={mainColor} strokeWidth="2" />
          <line x1="75" y1="70" x2="75" y2="85" stroke={mainColor} strokeWidth="2" />
          {/* Box placed down */}
          <g className="ani-drop">
            <rect x="38" y="38" width="24" height="24" rx="2" className="stroke-accent fill-soft" />
            {/* Box lid & tape */}
            <line x1="38" y1="42" x2="62" y2="42" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="50" y1="38" x2="50" y2="62" stroke={strokeWarm} strokeWidth="1.5" />
          </g>
        </g>
      );
      break;
    case "put together":
      scene = (
        <g>
          {/* Left puzzle piece */}
          <g className="ani-calendar-push" style={{ animationName: "calendar-move" }}>
            <path d="M15 35 h15 v8 a4 4 0 0 0 8 0 v-8 h15 v30 h-38 z" className="stroke-main fill-soft" />
          </g>
          {/* Right puzzle piece */}
          <g className="ani-calendar-push" style={{ animationName: "calendar-move", animationDirection: "reverse", transform: "scaleX(-1) translateX(-100px)" }}>
            <path d="M47 35 h15 v8 a4 4 0 0 1 8 0 v-8 h15 v30 h-38 z" stroke={strokeColor} strokeWidth="2.2" fill={fillAccentSoft} fillOpacity="0.4" />
          </g>
          {/* Together sparkle */}
          <g className="ani-pulse">
            <polygon points="50,22 53,28 60,30 54,34 56,41 50,37 44,41 46,34 40,30 47,28" fill="#fbbf24" />
          </g>
        </g>
      );
      break;
    case "put in":
      scene = (
        <g>
          {/* Piggy bank / Box with slot */}
          <rect x="25" y="45" width="50" height="35" rx="6" className="stroke-main fill-soft" />
          <ellipse cx="50" cy="54" rx="12" ry="3" fill={mainColor} />
          {/* Coin entering */}
          <g className="ani-drop">
            <circle cx="50" cy="30" r="7" fill="#fbbf24" stroke={strokeWarm} strokeWidth="1.5" />
            <path d="M50 25 v10" stroke={strokeWarm} strokeWidth="1" />
          </g>
        </g>
      );
      break;
    case "put back":
      scene = (
        <g>
          {/* Bookshelf */}
          <line x1="15" y1="75" x2="85" y2="75" stroke={mainColor} strokeWidth="3" />
          <rect x="20" y="30" width="10" height="45" className="stroke-main" fill={faintColor} />
          <rect x="30" y="30" width="12" height="45" className="stroke-main" fill={faintColor} />
          <rect x="68" y="30" width="12" height="45" className="stroke-main" fill={faintColor} />
          {/* Book being pushed back */}
          <g className="ani-calendar-push" style={{ animationName: "calendar-move" }}>
            <rect x="42" y="30" width="14" height="45" stroke={strokeColor} strokeWidth="2.2" fill={fillAccentSoft} fillOpacity="0.6" />
            <path d="M49 40 v15" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        </g>
      );
      break;

    // 3. TAKE 组合
    case "take off":
      scene = (
        <g>
          {/* Runway */}
          <line x1="10" y1="75" x2="90" y2="75" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="15" y1="75" x2="85" y2="50" stroke={faintColor} strokeWidth="1" strokeDasharray="3 3" />
          {/* Airplane lifting off */}
          <g className="ani-flight">
            {/* Plane fuselage */}
            <path d="M25 40 L50 34 L55 36 L52 42 L25 43 Z" fill={strokeColor} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
            {/* Wings */}
            <path d="M38 37 L30 20 L35 20 L44 36" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill={strokeColor} />
            <path d="M38 40 L30 54 L35 54 L42 41" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill={strokeColor} />
            {/* Tail */}
            <path d="M25 40 L18 28 L23 28 L27 40" stroke={strokeColor} strokeWidth="2" fill={strokeColor} />
            {/* Wind trails */}
            <path d="M12 45 h6 M10 49 h4 M15 53 h5" stroke={strokeWarm} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      );
      break;
    case "take in":
      scene = (
        <g>
          {/* Box absorbing light/circles */}
          <rect x="35" y="35" width="30" height="30" rx="3" className="stroke-main fill-soft" />
          {/* Absorbed particles path */}
          <path d="M15 50 h20 M85 50 h-20 M50 15 v20 M50 85 v-20" stroke={strokeWarm} strokeWidth="1" strokeDasharray="3 2" />
          <g className="ani-rise" style={{ animationName: "rise-anim" }}>
            <circle cx="50" cy="50" r="5" fill={strokeColor} />
          </g>
          <g className="ani-drop" style={{ animationName: "drop-anim" }}>
            <circle cx="50" cy="50" r="3" fill={strokeColor} />
          </g>
        </g>
      );
      break;
    case "take up":
      scene = (
        <g>
          {/* Hobby: Easel and painting canvas */}
          <path d="M30 75 L45 25 L50 25 L65 75 M48 25 v50" stroke={mainColor} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="25" y1="65" x2="70" y2="65" stroke={mainColor} strokeWidth="3" />
          {/* Canvas with painting */}
          <rect x="32" y="32" width="31" height="24" fill="var(--bg-elevated)" stroke={strokeColor} strokeWidth="2" />
          <circle cx="47" cy="42" r="5" fill="#f59e0b" />
          <path d="M36 50 q10-10 20 0" stroke="#10b981" strokeWidth="2" fill="none" />
          {/* Palette and brush rising */}
          <g className="ani-rise">
            <ellipse cx="78" cy="48" rx="8" ry="6" fill="#fef3c7" stroke={strokeWarm} strokeWidth="1.5" />
            <circle cx="75" cy="46" r="1.5" fill="#ef4444" />
            <circle cx="78" cy="50" r="1.5" fill="#3b82f6" />
            <line x1="84" y1="40" x2="76" y2="48" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      );
      break;
    case "take over":
      scene = (
        <g>
          {/* Crown on a stand */}
          <rect x="35" y="65" width="30" height="10" fill={faintColor} stroke={mainColor} strokeWidth="1.5" />
          <g className="ani-pulse">
            <path d="M38 65 L34 46 L44 54 L50 42 L56 54 L66 46 L62 65 Z" fill="#fbbf24" stroke={strokeWarm} strokeWidth="2" strokeLinejoin="round" />
            <circle cx="50" cy="42" r="1.5" fill="#ef4444" />
          </g>
          {/* Grabbing hand vector */}
          <g className="ani-flight" style={{ animationName: "flight-anim" }}>
            <path d="M78 35 h-12 c-2 0-3-1-3-3 s1-3 3-3 h8" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        </g>
      );
      break;
    case "take back":
      scene = (
        <g>
          {/* Shop counter */}
          <rect x="15" y="62" width="45" height="15" fill="var(--border-soft)" stroke={mainColor} strokeWidth="2" />
          {/* Package being pulled back */}
          <g className="ani-calendar-push" style={{ animationName: "calendar-move", animationDirection: "reverse" }}>
            <rect x="52" y="42" width="18" height="18" rx="1" className="stroke-accent fill-soft" />
            <line x1="52" y1="51" x2="70" y2="51" stroke={strokeColor} strokeWidth="1.5" />
          </g>
          {/* Large return arrow */}
          <path d="M72 32 H42 Q32 32, 32 45 T42 58 H62" stroke={strokeWarm} strokeWidth="2" strokeDasharray="3 2" fill="none" />
          <path d="M48 27 L40 32 L48 37" stroke={strokeWarm} strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "take away":
      scene = (
        <g>
          {/* Tray with cover */}
          <line x1="25" y1="65" x2="75" y2="65" stroke={mainColor} strokeWidth="2.5" />
          {/* Food cloche being taken away */}
          <g className="ani-flight">
            <path d="M35 55 A15 15 0 0 1 65 55 Z" fill={fillAccentSoft} stroke={strokeColor} strokeWidth="2.2" />
            <circle cx="50" cy="38" r="3" fill={strokeColor} />
            <line x1="32" y1="56" x2="68" y2="56" stroke={strokeColor} strokeWidth="2.5" />
          </g>
          {/* Moving trails */}
          <path d="M15 48 h12 M12 55 h8" stroke={strokeWarm} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
      break;
    case "take out":
      scene = (
        <g>
          {/* Tissue box */}
          <rect x="25" y="55" width="50" height="25" rx="3" className="stroke-main fill-soft" />
          <ellipse cx="50" cy="55" rx="16" ry="4" fill={faintColor} stroke={mainColor} strokeWidth="1" />
          {/* Tissue paper being extracted */}
          <g className="ani-rise">
            <path d="M42 53 C40 30, 60 25, 52 15 C48 25, 45 42, 45 53" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M48 42 C45 35, 55 35, 50 22" fill="none" stroke={strokeWarm} strokeWidth="1.5" />
          </g>
        </g>
      );
      break;
    case "take down":
      scene = (
        <g>
          {/* Construction scaffold */}
          <line x1="20" y1="75" x2="80" y2="75" stroke={mainColor} strokeWidth="2.5" />
          <line x1="30" y1="40" x2="30" y2="75" stroke={mainColor} strokeWidth="1.5" />
          <line x1="70" y1="40" x2="70" y2="75" stroke={mainColor} strokeWidth="1.5" />
          <line x1="30" y1="48" x2="70" y2="48" stroke={mainColor} strokeWidth="1.5" />
          {/* Beam being lowered */}
          <g className="ani-drop">
            <rect x="35" y="25" width="30" height="6" fill={fillAccentSoft} stroke={strokeColor} strokeWidth="2" />
            <line x1="50" y1="10" x2="50" y2="25" stroke={strokeWarm} strokeWidth="1.5" strokeDasharray="2 2" />
          </g>
        </g>
      );
      break;

    // 4. GIVE 组合
    case "give up":
      scene = (
        <g>
          {/* Flagpole */}
          <line x1="25" y1="20" x2="25" y2="80" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="25" cy="18" r="3" fill={mainColor} />
          {/* White flag waving and rising */}
          <g className="ani-rise">
            <path d="M26 24 h28 q6 4, 12 0 t12 0 v20 q-6 4-12 0 t-12 0 z" fill="#ffffff" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
            <line x1="32" y1="30" x2="48" y2="38" stroke={strokeWarm} strokeWidth="1.5" />
          </g>
          <line x1="10" y1="80" x2="90" y2="80" stroke={mainColor} strokeWidth="2" />
        </g>
      );
      break;
    case "give in":
      scene = (
        <g>
          {/* Person kneeling / bowing down under weight */}
          <g className="ani-drop">
            {/* Weight / Pressure */}
            <path d="M20 22 h60 L70 32 H30 Z" fill={fillAccentSoft} stroke={mainColor} strokeWidth="2" />
            <line x1="50" y1="32" x2="50" y2="44" stroke={strokeWarm} strokeWidth="2" strokeDasharray="3 3" />
            {/* Kneeling figure */}
            <circle cx="50" cy="50" r="5" fill={strokeColor} />
            <path d="M50 55 C46 58, 42 66, 42 74" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M50 55 H58 L64 74" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
          <line x1="15" y1="75" x2="85" y2="75" stroke={mainColor} strokeWidth="2.5" />
        </g>
      );
      break;
    case "give back":
      scene = (
        <g>
          {/* Coin / Key being handed back */}
          <g className="ani-calendar-push" style={{ animationName: "calendar-move" }}>
            <circle cx="55" cy="48" r="6" fill="#fbbf24" stroke={strokeWarm} strokeWidth="1.5" />
            <path d="M55 45 v6" stroke={strokeWarm} strokeWidth="1.5" />
          </g>
          {/* Giving hand */}
          <path d="M22 55 h18 c1.5 0 2-1 2-2 s-0.5-2-2-2 h-8 m8 0 c1 0 1.5-1 1.5-2 s-0.5-2-1.5-2 h-5" stroke={mainColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Receiving hand */}
          <path d="M78 55 h-18 c-1.5 0-2-1-2-2 s0.5-2 2-2 h8 m-8 0 c-1 0-1.5-1-1.5-2 s0.5-2 1.5-2 h5" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      );
      break;
    case "give out":
      scene = (
        <g>
          {/* Hand distributing cards/stars */}
          <path d="M50 82 v-15" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="62" r="5" fill={mainColor} />
          {/* Distribution vectors */}
          <g className="ani-explosion">
            <circle cx="28" cy="32" r="4" fill="#fbbf24" />
            <circle cx="72" cy="32" r="4" fill="#fbbf24" />
            <circle cx="50" cy="24" r="4" fill="#fbbf24" />
            <line x1="50" y1="56" x2="32" y2="36" stroke={strokeColor} strokeWidth="2" strokeDasharray="3 3" />
            <line x1="50" y1="56" x2="68" y2="36" stroke={strokeColor} strokeWidth="2" strokeDasharray="3 3" />
            <line x1="50" y1="56" x2="50" y2="30" stroke={strokeColor} strokeWidth="2" strokeDasharray="3 3" />
          </g>
        </g>
      );
      break;
    case "give away":
      scene = (
        <g>
          {/* Beautifully wrapped gift box */}
          <g className="ani-bounce">
            <rect x="32" y="42" width="36" height="30" rx="3" className="stroke-accent fill-soft" />
            {/* Ribbons */}
            <line x1="50" y1="42" x2="50" y2="72" stroke={strokeWarm} strokeWidth="2.5" />
            <line x1="32" y1="57" x2="68" y2="57" stroke={strokeWarm} strokeWidth="2.5" />
            {/* Big bow */}
            <path d="M50 42 C44 32, 36 40, 50 42 C64 40, 56 32, 50 42 Z" fill={strokeColor} stroke={strokeColor} strokeWidth="1" />
          </g>
          {/* Hands presenting */}
          <path d="M15 65 h12 M85 65 h-12" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
      break;

    // 5. GO 组合
    case "go on":
      scene = (
        <g>
          {/* Winding road leading to green light */}
          <path d="M50 78 L50 62 T50 36" stroke={mainColor} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M50 78 L50 62 T50 36" stroke={fillAccentSoft} strokeWidth="2" strokeDasharray="4 4" fill="none" />
          {/* Traffic light */}
          <rect x="74" y="20" width="12" height="28" rx="2" className="stroke-main" fill={faintColor} />
          <circle cx="80" cy="26" r="3" fill="#ef4444" opacity="0.2" />
          <circle cx="80" cy="34" r="3" fill="#f59e0b" opacity="0.2" />
          <circle cx="80" cy="42" r="3" fill="#10b981" className="ani-pulse" />
          {/* Car driving forward */}
          <g className="ani-rise">
            <rect x="42" y="46" width="16" height="12" rx="2" fill={strokeColor} />
            <circle cx="46" cy="58" r="2" fill={mainColor} />
            <circle cx="54" cy="58" r="2" fill={mainColor} />
          </g>
        </g>
      );
      break;
    case "go through":
      scene = (
        <g>
          {/* Storm cloud on left, sunny on right */}
          <path d="M15 32 C15 25, 30 22, 35 28 C40 22, 55 25, 55 32 Z" fill="#6b7280" opacity="0.3" />
          <circle cx="78" cy="28" r="8" fill="#fbbf24" className="ani-pulse" />
          {/* Walkway with arch */}
          <rect x="42" y="38" width="16" height="37" fill="none" stroke={mainColor} strokeWidth="2" />
          <path d="M10 75 h80" stroke={mainColor} strokeWidth="2" />
          {/* Person walking through */}
          <g className="ani-flight" style={{ animationName: "calendar-move" }}>
            <circle cx="30" cy="50" r="5" fill={strokeColor} />
            <path d="M30 55 v10 M25 60 h10 M26 72 l4-7 4 7" stroke={strokeColor} strokeWidth="2" />
          </g>
        </g>
      );
      break;
    case "go out":
      scene = (
        <g>
          {/* Open doorway with starry sky outside */}
          <rect x="15" y="22" width="45" height="53" fill="#1e1b4b" stroke={mainColor} strokeWidth="2.2" />
          <circle cx="45" cy="36" r="1.5" fill="#fff" />
          <circle cx="32" cy="42" r="1" fill="#fff" />
          {/* Person stepping outside */}
          <g className="ani-flight" style={{ animationName: "calendar-move" }}>
            <circle cx="50" cy="46" r="5.5" fill={strokeColor} />
            <path d="M50 51.5 v12 M44 57 h12 M46 72 l4-8 4 8" stroke={strokeColor} strokeWidth="2" />
          </g>
        </g>
      );
      break;
    case "go off":
      scene = (
        <g>
          {/* Bomb with burning fuse */}
          <g className="ani-wiggle">
            <circle cx="50" cy="56" r="18" fill={mainColor} stroke={mainColor} strokeWidth="2" />
            <path d="M56 39 c4-6, 12-4, 15-8" stroke={strokeWarm} strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Spark */}
            <circle cx="72" cy="30" r="3" fill="#fbbf24" className="ani-pulse" />
          </g>
          {/* Explosion effects */}
          <g className="ani-explosion">
            <circle cx="50" cy="50" r="32" stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="6 3" />
            <polygon points="50,15 54,34 71,20 58,40 78,50 58,60 71,80 54,66 50,85 46,66 29,80 42,60 22,50 42,40 29,20 46,34" fill="#ef4444" opacity="0.4" />
          </g>
        </g>
      );
      break;
    case "go back":
      scene = (
        <g>
          {/* Road with U-Turn arrow */}
          <path d="M22 65 h56 C84 65, 84 45, 78 45 H32" stroke={mainColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M38 38 L30 45 L38 52" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Moving car returning */}
          <g className="ani-flight" style={{ animationName: "calendar-move", animationDirection: "reverse" }}>
            <rect x="42" y="39" width="16" height="12" rx="2" fill={strokeWarm} />
          </g>
        </g>
      );
      break;
    case "go down":
      scene = (
        <g>
          {/* Water waves */}
          <path d="M10 50 q10-4, 20 0 t20 0 t20 0 t20 0" stroke="#3b82f6" strokeWidth="2.5" fill="none" className="ani-wave" />
          <path d="M10 55 q10-4, 20 0 t20 0 t20 0 t20 0" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
          {/* Submarine sinking */}
          <g className="ani-drop">
            <rect x="35" y="58" width="30" height="15" rx="7" fill={fillAccentSoft} stroke={strokeColor} strokeWidth="2.2" />
            <path d="M50 58 v-8 h5" stroke={strokeColor} strokeWidth="2" fill="none" />
            <circle cx="42" cy="65" r="2.5" fill={strokeWarm} />
            <circle cx="58" cy="65" r="2.5" fill={strokeWarm} />
          </g>
        </g>
      );
      break;
    case "go up":
      scene = (
        <g>
          {/* Rising Hot air balloon */}
          <g className="ani-rise">
            <path d="M35 36 C35 22, 65 22, 65 36 C65 48, 35 48, 35 36 Z" fill={fillAccentSoft} stroke={strokeColor} strokeWidth="2.2" />
            <rect x="46" y="52" width="8" height="6" fill={mainColor} />
            <line x1="39" y1="45" x2="46" y2="52" stroke={mainColor} strokeWidth="1" />
            <line x1="61" y1="45" x2="54" y2="52" stroke={mainColor} strokeWidth="1" />
            {/* Fire glow */}
            <circle cx="50" cy="49" r="2" fill="#ef4444" className="ani-pulse" />
          </g>
          {/* Clouds */}
          <path d="M72 30 C72 26, 88 26, 88 30 Z M12 60 C12 56, 28 56, 28 60 Z" fill="none" stroke={faintColor} strokeWidth="1.5" />
        </g>
      );
      break;
    case "go in":
      scene = (
        <g>
          {/* Building doorway */}
          <rect x="46" y="22" width="38" height="53" rx="2" className="stroke-main fill-soft" />
          <path d="M46 75 h38" stroke={mainColor} strokeWidth="2.5" />
          {/* Person going in */}
          <g className="ani-flight" style={{ animationName: "calendar-move" }}>
            <circle cx="28" cy="48" r="5" fill={strokeColor} />
            <path d="M28 53 v10 M23 58 h10 M24 71 l4-6 4 6" stroke={strokeColor} strokeWidth="2" />
          </g>
        </g>
      );
      break;

    // 6. COME 组合
    case "come in":
      scene = (
        <g>
          {/* Welcome Doormat */}
          <rect x="18" y="65" width="28" height="10" fill="var(--border-soft)" stroke={mainColor} strokeWidth="1.5" />
          <text x="21" y="72" fontSize="5" fontFamily="var(--sans)" fill={mainColor} fontWeight="bold">WELCOME</text>
          {/* Open doorway */}
          <rect x="48" y="20" width="36" height="55" fill="none" stroke={strokeWarm} strokeWidth="2.2" />
          {/* Person entering toward user */}
          <g className="ani-rise" style={{ animationName: "flight-anim" }}>
            <circle cx="38" cy="42" r="5.5" fill={strokeColor} />
            <path d="M38 47.5 v12 M33 53 h10 M34 68 l4-8 4 8" stroke={strokeColor} strokeWidth="2" />
          </g>
        </g>
      );
      break;
    case "come out":
      scene = (
        <g>
          {/* Hatching Egg */}
          <g className="ani-bounce">
            <path d="M30 65 C30 40, 70 40, 70 65 Z" fill="none" stroke={mainColor} strokeWidth="2" />
            <path d="M30 65 l8-8 l8 8 l8-8 l8 8 l8-8 l8 8" stroke={mainColor} strokeWidth="2" fill="none" />
            {/* Chick emerging */}
            <circle cx="50" cy="42" r="7.5" fill="#fef3c7" stroke={strokeWarm} strokeWidth="2" />
            <polygon points="50,42 53,45 47,45" fill="#f59e0b" />
            <circle cx="48" cy="39" r="1" fill={mainColor} />
            <circle cx="52" cy="39" r="1" fill={mainColor} />
          </g>
        </g>
      );
      break;
    case "come back":
      scene = (
        <g>
          {/* Boomerang flying back to hand */}
          <path d="M22 62 h12 M18 69 h10" stroke={mainColor} strokeWidth="2.2" strokeLinecap="round" />
          <g className="ani-calendar-push" style={{ animationName: "calendar-move", animationDirection: "reverse" }}>
            <path d="M42 36 L52 24 L56 34 L46 42 Z" fill={fillAccentSoft} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
            <path d="M48 22 C62 30, 68 46, 54 58" stroke={strokeWarm} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          </g>
        </g>
      );
      break;
    case "come up":
      scene = (
        <g>
          {/* Seedling sprout growing out of ground */}
          <line x1="15" y1="75" x2="85" y2="75" stroke={mainColor} strokeWidth="2.5" />
          <g className="ani-rise">
            <path d="M50 75 V42" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            {/* Leaves */}
            <path d="M50 50 Q36 40, 42 34 Q50 44, 50 50" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
            <path d="M50 50 Q64 40, 58 34 Q50 44, 50 50" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
          </g>
          {/* Golden sun */}
          <circle cx="78" cy="24" r="6" fill="#fbbf24" className="ani-pulse" />
        </g>
      );
      break;
    case "come about":
      scene = (
        <g>
          {/* Rotating gears lighting up bulb */}
          <g className="ani-gear" style={{ transformOrigin: "32px 62px", animationDuration: "6s" }}>
            <circle cx="32" cy="62" r="12" stroke={mainColor} strokeWidth="2" fill="none" strokeDasharray="4 2" />
          </g>
          <g className="ani-gear" style={{ transformOrigin: "60px 62px", animationDuration: "6s", animationDirection: "reverse" }}>
            <circle cx="60" cy="62" r="16" stroke={mainColor} strokeWidth="2" fill="none" strokeDasharray="4 2" />
          </g>
          {/* Glowing bulb */}
          <g className="ani-pulse">
            <path d="M44 32 C44 22, 56 22, 56 32 C56 38, 44 38, 44 32 Z" fill="#fef3c7" stroke={strokeColor} strokeWidth="2" />
            <rect x="47" y="39" width="6" height="4" fill={strokeWarm} />
            <line x1="50" y1="12" x2="50" y2="18" stroke={strokeWarm} strokeWidth="1.5" />
          </g>
        </g>
      );
      break;
    case "come from":
      scene = (
        <g>
          {/* Globe pin and flight path */}
          <circle cx="50" cy="54" r="22" fill="none" stroke={mainColor} strokeWidth="2" />
          <ellipse cx="50" cy="54" rx="22" ry="7" stroke={faintColor} strokeWidth="1" fill="none" />
          {/* Origin Pin */}
          <g className="ani-bounce">
            <path d="M32 42 C32 36, 38 36, 38 42 C38 48, 35 52, 35 52 C35 52, 32 48, 32 42 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            <circle cx="35" cy="42" r="1.5" fill="#fff" />
          </g>
          {/* Flight line coming from Pin */}
          <path d="M35 52 C45 42, 62 42, 72 58" stroke={strokeColor} strokeWidth="1.8" strokeDasharray="3 2" fill="none" />
          <path d="M66 56 L72 58 L70 51" stroke={strokeColor} strokeWidth="1.8" fill="none" />
        </g>
      );
      break;
    case "come down":
      scene = (
        <g>
          {/* Raincloud */}
          <path d="M25 38 C25 28, 42 26, 48 32 C54 26, 75 28, 75 38 Z" fill="var(--border-soft)" stroke={mainColor} strokeWidth="2.2" />
          {/* Falling Rain */}
          <g className="ani-drop">
            <line x1="35" y1="44" x2="35" y2="60" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="3 3" />
            <line x1="50" y1="46" x2="50" y2="64" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="3 3" />
            <line x1="65" y1="44" x2="65" y2="60" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="3 3" />
          </g>
          {/* Umbrella */}
          <path d="M42 66 A8 8 0 0 1 58 66 Z" fill={strokeColor} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="50" y1="66" x2="50" y2="76" stroke={strokeWarm} strokeWidth="1.5" />
        </g>
      );
      break;

    // 7. KEEP 组合
    case "keep on":
      scene = (
        <g>
          {/* Runner running continuously */}
          <ellipse cx="50" cy="50" rx="35" ry="20" stroke={faintColor} strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
          <g className="ani-flight" style={{ animationName: "calendar-move", animationDuration: "4s" }}>
            <circle cx="50" cy="30" r="5.5" fill={strokeColor} />
            <path d="M50 35.5 v10 M44 40 h12 M45 52 l5-6 5 6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Golden trail */}
          <path d="M22 42 h20" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
      break;
    case "keep off":
      scene = (
        <g>
          {/* Crossed sign: KEEP OFF THE GRASS */}
          <rect x="35" y="24" width="30" height="20" rx="2" fill="var(--bg-elevated)" stroke={mainColor} strokeWidth="2" />
          <line x1="38" y1="34" x2="62" y2="34" stroke="#ef4444" strokeWidth="2" />
          <line x1="50" y1="44" x2="50" y2="72" stroke={mainColor} strokeWidth="2.2" />
          {/* Grass blades */}
          <path d="M15 72 l2-8 2 8 M20 72 l1-6 2 6 M75 72 l2-8 2 8 M80 72 l1-6 2 6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="72" x2="90" y2="72" stroke={mainColor} strokeWidth="2" />
        </g>
      );
      break;
    case "keep up":
      scene = (
        <g>
          {/* Juggler / Hand keeping balloon in air */}
          <g className="ani-bounce">
            <circle cx="50" cy="30" r="7" fill={strokeColor} />
            <path d="M50 37 v12" stroke={strokeColor} strokeWidth="1.2" />
          </g>
          {/* Hand tapping upwards */}
          <path d="M42 66 h16 L50 54 Z" fill={fillAccentSoft} stroke={strokeWarm} strokeWidth="2" />
          <path d="M50 66 v12" stroke={mainColor} strokeWidth="2.2" />
        </g>
      );
      break;
    case "keep in":
      scene = (
        <g>
          {/* Wire bird cage */}
          <rect x="30" y="28" width="40" height="44" rx="6" className="stroke-main fill-soft" />
          <line x1="38" y1="28" x2="38" y2="72" stroke={mainColor} strokeWidth="1.5" />
          <line x1="50" y1="28" x2="50" y2="72" stroke={mainColor} strokeWidth="1.5" />
          <line x1="62" y1="28" x2="62" y2="72" stroke={mainColor} strokeWidth="1.5" />
          <circle cx="50" cy="22" r="3" fill="none" stroke={mainColor} strokeWidth="1.5" />
          {/* Trapped bird */}
          <g className="ani-pulse">
            <circle cx="50" cy="48" r="4.5" fill={strokeColor} />
            <path d="M46 51 h9 L58 48 Z" fill={strokeColor} />
            <polygon points="46,47 42,49 46,51" fill={strokeWarm} />
          </g>
        </g>
      );
      break;
    case "keep back":
      scene = (
        <g>
          {/* Police / Boundary barrier */}
          <line x1="50" y1="22" x2="50" y2="78" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          {/* Stand-back indicator */}
          <g className="ani-calendar-push" style={{ animationName: "calendar-move" }}>
            <circle cx="28" cy="50" r="6" fill={strokeColor} />
            <path d="M28 56 v12" stroke={strokeColor} strokeWidth="2" />
            <path d="M38 50 h-8" stroke={strokeWarm} strokeWidth="1.5" strokeDasharray="2 2" />
          </g>
        </g>
      );
      break;
    case "keep out":
      scene = (
        <g>
          {/* Padlocked closed fence */}
          <line x1="15" y1="68" x2="85" y2="68" stroke={mainColor} strokeWidth="3" />
          <rect x="25" y="32" width="50" height="36" fill="none" stroke={mainColor} strokeWidth="2" strokeDasharray="3 3" />
          {/* Padlock */}
          <g className="ani-bounce">
            <rect x="42" y="48" width="16" height="14" rx="2" fill={strokeColor} stroke={strokeWarm} strokeWidth="1.5" />
            <path d="M46 48 v-6 a4 4 0 0 1 8 0 v-6" stroke={strokeWarm} strokeWidth="2.2" fill="none" />
            <circle cx="50" cy="54" r="1.5" fill={mainColor} />
          </g>
        </g>
      );
      break;

    // 8. SEND 组合
    case "send out":
      scene = (
        <g>
          {/* Wireless radio tower transmitting signals */}
          <line x1="50" y1="42" x2="50" y2="76" stroke={mainColor} strokeWidth="2.2" />
          <polygon points="50,42 42,76 58,76" fill="none" stroke={mainColor} strokeWidth="2" />
          <circle cx="50" cy="38" r="4.5" fill={strokeColor} />
          {/* Signal rings */}
          <g className="ani-explosion">
            <circle cx="50" cy="38" r="15" stroke={strokeWarm} strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
            <circle cx="50" cy="38" r="28" stroke={strokeWarm} strokeWidth="1" fill="none" />
          </g>
        </g>
      );
      break;
    case "send off":
      scene = (
        <g>
          {/* Winged letter envelope flying away */}
          <g className="ani-flight">
            <rect x="30" y="38" width="26" height="18" rx="1" fill="var(--bg-elevated)" stroke={strokeColor} strokeWidth="2" />
            <path d="M30 38 l13 9 l13-9" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            {/* Wings */}
            <path d="M30 44 C20 40, 18 50, 26 50 C22 56, 30 50, 30 46" fill={strokeWarm} />
            <path d="M56 44 C66 40, 68 50, 60 50 C64 56, 56 50, 56 46" fill={strokeWarm} />
          </g>
        </g>
      );
      break;
    case "send back":
      scene = (
        <g>
          {/* Return package */}
          <rect x="46" y="42" width="22" height="20" rx="1" className="stroke-accent fill-soft" />
          <line x1="46" y1="52" x2="68" y2="52" stroke={strokeColor} strokeWidth="1.5" />
          {/* Return loop arrow */}
          <path d="M54 35 H28 C20 35, 20 55, 28 55 H45" stroke={strokeWarm} strokeWidth="2" strokeDasharray="3 2" fill="none" />
          <path d="M34 30 L28 35 L34 40" stroke={strokeWarm} strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "send away":
      scene = (
        <g>
          {/* Rocket blasting off */}
          <g className="ani-flight" style={{ transform: "rotate(35deg) translate(5px, -15px)" }}>
            <path d="M42 58 L50 28 L58 58 L50 50 Z" fill={fillAccentSoft} stroke={strokeColor} strokeWidth="2.2" />
            {/* Flame trails */}
            <polygon points="44,58 50,72 56,58" fill="#f59e0b" className="ani-pulse" />
          </g>
          <line x1="10" y1="78" x2="90" y2="78" stroke={mainColor} strokeWidth="2.5" />
        </g>
      );
      break;

    // 9. MAKE 组合
    case "make up":
      scene = (
        <g>
          {/* Assembling components / Completed puzzle */}
          <rect x="25" y="25" width="50" height="50" rx="4" className="stroke-main fill-soft" />
          {/* Puzzle lines */}
          <line x1="50" y1="25" x2="50" y2="75" stroke={mainColor} strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="25" y1="50" x2="75" y2="50" stroke={mainColor} strokeWidth="1.5" strokeDasharray="3 3" />
          {/* The missing piece snapping in */}
          <g className="ani-bounce">
            <rect x="52" y="27" width="21" height="21" fill={strokeColor} opacity="0.85" />
            <path d="M62 38 v6" stroke={strokeWarm} strokeWidth="2" />
          </g>
        </g>
      );
      break;
    case "make out":
      scene = (
        <g>
          {/* Fuzzy distant writing */}
          <text x="35" y="42" fontSize="5" opacity="0.3" fill={mainColor} fontFamily="var(--mono)">850 OGDEN</text>
          {/* Magnifying Glass focusing */}
          <g className="ani-float">
            <circle cx="50" cy="46" r="14" stroke={strokeColor} strokeWidth="2.5" fill="none" />
            <line x1="60" y1="56" x2="75" y2="71" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
            {/* Clarified readable writing inside lens */}
            <text x="40" y="50" fontSize="8" fill={strokeWarm} fontWeight="bold" fontFamily="var(--mono)">BASIC</text>
          </g>
        </g>
      );
      break;
    case "make off":
      scene = (
        <g>
          {/* Running robber with loot bag */}
          <g className="ani-flight" style={{ animationDuration: "1.8s" }}>
            <circle cx="55" cy="32" r="5" fill={strokeColor} />
            {/* Loot bag */}
            <circle cx="42" cy="46" r="8" fill={strokeWarm} />
            <path d="M46 42 L55 42 L52 54 L44 54 Z" stroke={strokeColor} strokeWidth="2" fill={strokeColor} />
            {/* Legs running */}
            <path d="M50 54 L44 68 M53 54 L60 68" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          </g>
          <line x1="10" y1="75" x2="90" y2="75" stroke={mainColor} strokeWidth="2" />
        </g>
      );
      break;

    // 10. SEE 组合
    case "see through":
      scene = (
        <g>
          {/* Box with hidden core */}
          <rect x="42" y="32" width="35" height="36" fill={fillAccentSoft} fillOpacity="0.05" stroke={mainColor} strokeWidth="2.2" />
          {/* Core key inside */}
          <circle cx="60" cy="50" r="3.5" fill="#f59e0b" className="ani-pulse" />
          {/* Lens showing x-ray view */}
          <g className="ani-flight" style={{ animationName: "calendar-move" }}>
            <circle cx="32" cy="50" r="14" stroke={strokeColor} strokeWidth="2.2" fill="none" />
            <line x1="42" y1="60" x2="52" y2="70" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
            <line x1="32" y1="42" x2="32" y2="58" stroke={strokeColor} strokeWidth="1" />
          </g>
        </g>
      );
      break;
    case "see about":
      scene = (
        <g>
          {/* Clipboard checklist */}
          <rect x="28" y="24" width="44" height="52" rx="3" className="stroke-main fill-soft" />
          <rect x="44" y="20" width="12" height="6" fill={mainColor} />
          {/* Checks being made */}
          <g className="ani-rise">
            <path d="M36 38 l4 4 l8-8" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M36 54 l4 4 l8-8" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
          <line x1="48" y1="38" x2="64" y2="38" stroke={faintColor} strokeWidth="1.5" />
          <line x1="48" y1="54" x2="64" y2="54" stroke={faintColor} strokeWidth="1.5" />
        </g>
      );
      break;

    // 11. LET 组合
    case "let out":
      scene = (
        <g>
          {/* Cage with open door */}
          <rect x="20" y="32" width="38" height="38" rx="2" className="stroke-main fill-soft" />
          <path d="M58 32 L72 22" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
          {/* Flying bird escaping */}
          <g className="ani-flight">
            <circle cx="68" cy="38" r="4.5" fill={strokeColor} />
            <path d="M68 38 C60 30, 62 44, 76 44" stroke={strokeWarm} strokeWidth="1.5" fill="none" />
          </g>
        </g>
      );
      break;
    case "let in":
      scene = (
        <g>
          {/* House open door */}
          <rect x="48" y="32" width="38" height="38" rx="2" className="stroke-main fill-soft" />
          <path d="M48 32 L34 22" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          {/* Dog / Cat entering */}
          <g className="ani-flight" style={{ animationName: "calendar-move" }}>
            <circle cx="24" cy="52" r="5" fill={strokeColor} />
            <rect x="18" y="52" width="12" height="8" rx="1" fill={strokeColor} />
            <line x1="20" y1="60" x2="20" y2="65" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="28" y1="60" x2="28" y2="65" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        </g>
      );
      break;
    case "let go":
      scene = (
        <g>
          {/* Hand releasing helium balloon */}
          <path d="M25 78 h20 L35 62 Z" fill={faintColor} stroke={mainColor} strokeWidth="2" />
          <g className="ani-rise">
            <circle cx="58" cy="30" r="10" fill="#ef4444" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M58 40 Q50 52, 35 62" stroke={strokeWarm} strokeWidth="1.5" fill="none" />
          </g>
        </g>
      );
      break;

    // 12. DO 组合
    case "do with":
      scene = (
        <g>
          <line x1="15" y1="75" x2="85" y2="75" stroke={mainColor} strokeWidth="3" />
          {/* Hammer hitting nail */}
          <g className="ani-wiggle" style={{ transformOrigin: "25px 75px" }}>
            <rect x="25" y="32" width="18" height="10" fill={strokeColor} stroke={strokeColor} strokeWidth="1.5" />
            <line x1="34" y1="42" x2="34" y2="75" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Nail in board */}
          <rect x="58" y="60" width="3" height="15" fill={strokeWarm} />
          <ellipse cx="59" cy="60" rx="4" ry="1.5" fill={strokeWarm} />
        </g>
      );
      break;
    case "do without":
      scene = (
        <g>
          {/* Smiling face next to empty plate */}
          <circle cx="50" cy="50" r="24" fill="none" stroke={mainColor} strokeWidth="2.5" />
          <circle cx="42" cy="42" r="2.5" fill={strokeColor} />
          <circle cx="58" cy="42" r="2.5" fill={strokeColor} />
          <path d="M38 52 q12 10, 24 0" stroke={strokeWarm} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Empty plate */}
          <ellipse cx="50" cy="76" rx="20" ry="4" fill="none" stroke={faintColor} strokeWidth="1.5" />
        </g>
      );
      break;

    // 13. SAY 组合
    case "say against":
      scene = (
        <g>
          {/* Megaphone shouting */}
          <g className="ani-wiggle">
            <path d="M25 45 L50 32 V58 Z" fill={fillAccentSoft} stroke={strokeColor} strokeWidth="2.2" />
            <rect x="18" y="44" width="8" height="6" fill={strokeColor} />
            <path d="M42 58 l-5 12" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
          </g>
          {/* Warning / Protest symbol */}
          <g className="ani-pulse">
            <circle cx="72" cy="45" r="12" fill="none" stroke="#ef4444" strokeWidth="2.5" />
            <line x1="64" y1="37" x2="80" y2="53" stroke="#ef4444" strokeWidth="2.5" />
          </g>
        </g>
      );
      break;

    // 14. BE 组合
    case "be back":
      scene = (
        <g>
          {/* Clock face ticking backwards */}
          <circle cx="50" cy="50" r="25" fill="none" stroke={mainColor} strokeWidth="2.5" />
          <path d="M50 25 V50 H65" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <g className="ani-clock-back">
            <circle cx="50" cy="25" r="4" fill={strokeWarm} />
            <path d="M50 20 L46 25 L50 30" stroke={strokeWarm} strokeWidth="1.5" fill="none" />
          </g>
        </g>
      );
      break;
    case "be in":
      scene = (
        <g>
          {/* Cozy glowing house interior */}
          <rect x="22" y="24" width="56" height="52" rx="4" className="stroke-main fill-soft" />
          <circle cx="50" cy="46" r="10" fill="#fef3c7" className="ani-pulse" />
          {/* Glowing lamp */}
          <line x1="50" y1="24" x2="50" y2="40" stroke={strokeWarm} strokeWidth="1.5" />
          <polygon points="46,40 54,40 58,48 42,48" fill={strokeColor} />
        </g>
      );
      break;
    case "be out":
      scene = (
        <g>
          {/* Extinguished campfire with smoke */}
          <path d="M30 72 l40-10 M30 62 l40 10" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
          {/* Gray smoke rising */}
          <g className="ani-rise">
            <path d="M44 55 Q40 45, 48 35" stroke={faintColor} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M52 55 Q56 45, 48 35" stroke={faintColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
          <line x1="10" y1="72" x2="90" y2="72" stroke={mainColor} strokeWidth="2" />
        </g>
      );
      break;
    case "be up":
      scene = (
        <g>
          {/* Rising Sun and alarm clock showing awake */}
          <circle cx="50" cy="24" r="8" fill="#fbbf24" className="ani-pulse" />
          <g className="ani-wiggle">
            <circle cx="50" cy="62" r="15" fill="none" stroke={strokeColor} strokeWidth="2.2" />
            <path d="M50 52 v10 h8" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
            <path d="M38 48 l-5-5 M62 48 l5-5" stroke={strokeWarm} strokeWidth="2.5" />
          </g>
        </g>
      );
      break;
    case "be down":
      scene = (
        <g>
          {/* Thermometer showing freezing temperature */}
          <rect x="46" y="15" width="8" height="48" rx="4" fill="none" stroke={mainColor} strokeWidth="2" />
          <circle cx="50" cy="65" r="9" fill="#3b82f6" stroke={mainColor} strokeWidth="2" />
          {/* Sinking temperature column */}
          <g className="ani-drop">
            <rect x="48" y="32" width="4" height="25" fill="#3b82f6" />
          </g>
          {/* Sad face */}
          <path d="M18 52 q12-10, 24 0" stroke={strokeWarm} strokeWidth="2.2" fill="none" />
        </g>
      );
      break;
    case "be over":
      scene = (
        <g>
          {/* Crossing finish line */}
          <line x1="50" y1="15" x2="50" y2="85" stroke={strokeColor} strokeWidth="3" strokeDasharray="4 2" />
          {/* Runner crossing */}
          <g className="ani-flight" style={{ animationName: "calendar-move" }}>
            <circle cx="32" cy="42" r="5.5" fill={strokeWarm} />
            <path d="M32 47.5 v14 M26 53 h12 M28 72 l4-8 4 8" stroke={strokeWarm} strokeWidth="2" />
          </g>
          {/* Checkered flag */}
          <polygon points="50,15 65,22 50,29" fill={strokeColor} />
        </g>
      );
      break;

    // 15. HAVE 组合
    case "have on":
      scene = (
        <g>
          {/* Coat hanger with jacket */}
          <path d="M50 28 L35 40 h30 Z" stroke={mainColor} strokeWidth="2" fill="none" />
          <path d="M50 28 c0-4, 5-4, 5-1" stroke={mainColor} strokeWidth="2" fill="none" />
          <rect x="34" y="40" width="32" height="34" rx="2" fill={fillAccentSoft} stroke={strokeColor} strokeWidth="2.2" />
          <line x1="50" y1="40" x2="50" y2="74" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="48" r="2" fill={strokeWarm} />
          <circle cx="50" cy="56" r="2" fill={strokeWarm} />
        </g>
      );
      break;

    // 16. SEEM 组合
    case "seem like":
      scene = (
        <g>
          {/* Heart shaped cloud representing appearance */}
          <g className="ani-float">
            <path d="M50 35 C45 22, 28 22, 28 38 C28 54, 50 68, 50 68 C50 68, 72 54, 72 38 C72 22, 55 22, 50 35 Z" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeDasharray="3 3" />
            <path d="M50 40 C46 29, 34 29, 34 42 C34 54, 50 64, 50 64 C50 64, 66 54, 66 42 C66 29, 54 29, 50 40 Z" fill={fillAccentSoft} opacity="0.45" />
          </g>
        </g>
      );
      break;

    default:
      // Generic beautiful placeholder (pulsing target circle)
      scene = (
        <g>
          <circle cx="50" cy="50" r="24" stroke={strokeColor} strokeWidth="2.2" strokeDasharray="4 2" fill="none" className="ani-pulse" />
          <circle cx="50" cy="50" r="10" fill={strokeWarm} />
        </g>
      );
  }

  return (
    <svg viewBox="0 0 100 100" className="vector-svg" width="100%" height="100%" style={{ maxWidth: "250px", maxHeight: "250px" }}>
      <style>{styleTag}</style>
      {scene}
    </svg>
  );
}
