import type { ReactNode } from 'react';

/** 57 个非介词 Operations 词 — 与 DirectionGraphic 风格统一的动态 SVG */
export const GRAMMAR_WORDS = [
  'a', 'the', 'all', 'any', 'every', 'little', 'much', 'no', 'other', 'some', 'such', 'that', 'this',
  'I', 'he', 'you', 'who',
  'and', 'because', 'but', 'or', 'if', 'though', 'while',
  'how', 'when', 'where', 'why',
  'again', 'ever', 'far', 'forward', 'here', 'near', 'now', 'out', 'still', 'then', 'there', 'together', 'well',
  'almost', 'enough', 'even', 'not', 'only', 'quite', 'so', 'very',
  'tomorrow', 'yesterday', 'north', 'south', 'east', 'west',
  'please', 'yes',
] as const;

export type GrammarWord = (typeof GRAMMAR_WORDS)[number];

export function isGrammarWord(word: string): word is GrammarWord {
  return (GRAMMAR_WORDS as readonly string[]).includes(word);
}

export default function GrammarWordVisual({ type }: { type: string }) {
  const strokeColor = 'var(--accent)';
  const strokeWarm = 'var(--accent-warm)';
  const mainColor = 'var(--ink)';
  const faintColor = 'var(--border)';
  const fillSoft = 'var(--accent-soft)';

  const inlineStyles = `
    @keyframes pulse-soft {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }
    @keyframes slide-right {
      0% { transform: translateX(-8px); opacity: 0; }
      20%, 80% { opacity: 1; }
      100% { transform: translateX(8px); opacity: 0; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.25; }
    }
    @keyframes dash-flow {
      to { stroke-dashoffset: -20; }
    }
    .ani-pulse { transform-origin: 50px 50px; animation: pulse-soft 2.5s infinite ease-in-out; }
    .ani-slide { animation: slide-right 2.5s infinite ease-in-out; }
    .ani-blink { animation: blink 2s infinite ease-in-out; }
    .ani-flow { stroke-dasharray: 5 3; animation: dash-flow 1.2s infinite linear; }
  `;

  const svg = (children: ReactNode) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg" aria-hidden>
      <style>{inlineStyles}</style>
      {children}
    </svg>
  );

  const label = (text: string, x = 50, y = 16) => (
    <text x={x} y={y} fontSize="7px" fontFamily="var(--mono)" fill={strokeWarm} fontWeight="bold" textAnchor="middle">
      {text}
    </text>
  );

  switch (type) {
    case 'a':
      return svg(<>
        {label('A')}
        <circle cx="22" cy="58" r="9" stroke={faintColor} strokeWidth="2" fill="none" />
        <circle cx="50" cy="58" r="9" stroke={strokeColor} strokeWidth="2.5" strokeDasharray="4 2" fill={fillSoft} fillOpacity="0.15" className="ani-pulse" />
        <circle cx="78" cy="58" r="9" stroke={faintColor} strokeWidth="2" fill="none" />
        <path d="M50 38 L50 46" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" className="ani-blink" />
        <text x="50" y="82" fontSize="6px" fontFamily="var(--mono)" fill={faintColor} textAnchor="middle">any one</text>
      </>);

    case 'the':
      return svg(<>
        {label('THE')}
        <circle cx="28" cy="58" r="8" stroke={faintColor} strokeWidth="1.5" fill="none" opacity="0.4" />
        <circle cx="50" cy="58" r="11" stroke={strokeColor} strokeWidth="3" fill={fillSoft} fillOpacity="0.2" />
        <circle cx="72" cy="58" r="8" stroke={faintColor} strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M50 30 L50 42" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 30 L44 36 M50 30 L56 36" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      </>);

    case 'all':
      return svg(<>
        {label('ALL')}
        {[20, 38, 56, 74].map((x, i) => (
          <rect key={i} x={x - 6} y="48" width="12" height="12" rx="2" fill={strokeColor} fillOpacity={0.35 + i * 0.12} stroke={strokeColor} strokeWidth="1.5" />
        ))}
        <path d="M12 72 H88" stroke={faintColor} strokeWidth="2" strokeLinecap="round" />
      </>);

    case 'any':
      return svg(<>
        {label('ANY')}
        <circle cx="30" cy="55" r="9" stroke={faintColor} strokeWidth="2" fill="none" />
        <circle cx="50" cy="55" r="9" stroke={faintColor} strokeWidth="2" fill="none" />
        <circle cx="70" cy="55" r="9" stroke={faintColor} strokeWidth="2" fill="none" />
        <text x="50" y="60" fontSize="14px" fontFamily="var(--mono)" fill={strokeColor} fontWeight="bold" textAnchor="middle">?</text>
      </>);

    case 'every':
      return svg(<>
        {label('EVERY')}
        {[22, 40, 58, 76].map((x) => (
          <g key={x}>
            <circle cx={x} cy="62" r="7" stroke={strokeColor} strokeWidth="2" fill={fillSoft} fillOpacity="0.15" />
            <path d={`M${x} 38 L${x} 50`} stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" />
            <path d={`M${x - 4} 42 L${x} 38 L${x + 4} 42`} stroke={strokeWarm} strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ))}
      </>);

    case 'little':
      return svg(<>
        {label('LITTLE')}
        <rect x="22" y="62" width="14" height="14" rx="2" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.2" />
        <rect x="58" y="48" width="24" height="28" rx="3" stroke={mainColor} strokeWidth="2.5" fill="none" />
        <text x="50" y="40" fontSize="6px" fontFamily="var(--mono)" fill={faintColor} textAnchor="middle">small</text>
      </>);

    case 'much':
      return svg(<>
        {label('MUCH')}
        {[18, 30, 42, 54, 66, 78].map((x, i) => (
          <rect key={x} x={x - 4} y={78 - i * 8} width="8" height={12 + i * 6} rx="1.5" fill={strokeColor} fillOpacity={0.2 + i * 0.1} stroke={strokeColor} strokeWidth="1.5" />
        ))}
      </>);

    case 'no':
      return svg(<>
        {label('NO')}
        <circle cx="50" cy="55" r="18" stroke={mainColor} strokeWidth="2.5" fill="none" />
        <path d="M36 41 L64 69 M64 41 L36 69" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
      </>);

    case 'other':
      return svg(<>
        {label('OTHER')}
        <circle cx="30" cy="58" r="10" stroke={faintColor} strokeWidth="2" fill="none" opacity="0.35" />
        <circle cx="50" cy="58" r="10" stroke={faintColor} strokeWidth="2" fill="none" opacity="0.35" />
        <circle cx="70" cy="58" r="10" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.2" />
        <path d="M70 42 L70 48" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      </>);

    case 'some':
      return svg(<>
        {label('SOME')}
        <circle cx="28" cy="58" r="9" fill={strokeColor} fillOpacity="0.35" stroke={strokeColor} strokeWidth="2" />
        <circle cx="50" cy="58" r="9" fill={strokeColor} fillOpacity="0.35" stroke={strokeColor} strokeWidth="2" />
        <circle cx="72" cy="58" r="9" stroke={faintColor} strokeWidth="2" fill="none" strokeDasharray="3 2" />
      </>);

    case 'such':
      return svg(<>
        {label('SUCH')}
        <rect x="20" y="50" width="18" height="18" rx="3" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.15" />
        <rect x="62" y="50" width="18" height="18" rx="3" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.15" />
        <path d="M42 59 H58" stroke={strokeWarm} strokeWidth="2" className="ani-flow" />
        <text x="50" y="59" fontSize="8px" fill={strokeWarm} textAnchor="middle">=</text>
      </>);

    case 'that':
      return svg(<>
        {label('THAT')}
        <circle cx="72" cy="55" r="12" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.15" />
        <path d="M22 50 L62 55" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 2" className="ani-flow" />
        <circle cx="22" cy="50" r="5" fill={mainColor} />
      </>);

    case 'this':
      return svg(<>
        {label('THIS')}
        <circle cx="32" cy="55" r="12" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.2" />
        <path d="M78 50 L38 55" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="78" cy="50" r="5" fill={mainColor} />
      </>);

    case 'I':
      return svg(<>
        {label('I')}
        <circle cx="50" cy="38" r="9" fill={mainColor} />
        <path d="M50 48 V72" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M38 58 H62" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="55" r="22" stroke={strokeColor} strokeWidth="1.5" fill="none" opacity="0.35" className="ani-pulse" />
      </>);

    case 'he':
      return svg(<>
        {label('HE')}
        <circle cx="50" cy="36" r="9" fill={mainColor} />
        <path d="M50 46 V70" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M36 56 H64" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M50 70 L40 82 M50 70 L60 82" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
      </>);

    case 'you':
      return svg(<>
        {label('YOU')}
        <circle cx="50" cy="32" r="9" fill={strokeColor} />
        <path d="M50 42 V66" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M36 52 H64" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="55" r="24" stroke={strokeWarm} strokeWidth="1.5" fill="none" strokeDasharray="4 3" className="ani-pulse" />
      </>);

    case 'who':
      return svg(<>
        {label('WHO')}
        <circle cx="42" cy="48" r="10" stroke={mainColor} strokeWidth="2.5" fill="none" />
        <path d="M50 56 L62 72" stroke={mainColor} strokeWidth="3" strokeLinecap="round" />
        <text x="72" y="42" fontSize="16px" fontFamily="var(--mono)" fill={strokeColor} fontWeight="bold">?</text>
      </>);

    case 'and':
      return svg(<>
        {label('AND')}
        <circle cx="28" cy="55" r="10" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.15" />
        <circle cx="72" cy="55" r="10" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.15" />
        <path d="M38 55 H62" stroke={strokeWarm} strokeWidth="3" strokeLinecap="round" className="ani-flow" />
        <text x="50" y="40" fontSize="7px" fontFamily="var(--mono)" fill={strokeWarm} textAnchor="middle">+</text>
      </>);

    case 'because':
      return svg(<>
        {label('BECAUSE')}
        <circle cx="25" cy="55" r="8" fill={strokeColor} />
        <path d="M35 55 H58" stroke={strokeWarm} strokeWidth="2.5" strokeLinecap="round" className="ani-slide" />
        <rect x="62" y="47" width="16" height="16" rx="3" stroke={mainColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.15" />
        <text x="25" y="40" fontSize="6px" fontFamily="var(--mono)" fill={faintColor} textAnchor="middle">cause</text>
        <text x="70" y="40" fontSize="6px" fontFamily="var(--mono)" fill={faintColor} textAnchor="middle">effect</text>
      </>);

    case 'but':
      return svg(<>
        {label('BUT')}
        <path d="M50 30 V70" stroke={faintColor} strokeWidth="2" />
        <path d="M25 45 H50" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M50 65 H75" stroke={mainColor} strokeWidth="3" strokeLinecap="round" strokeDasharray="5 3" />
      </>);

    case 'or':
      return svg(<>
        {label('OR')}
        <path d="M25 40 C40 40 40 70 50 70" stroke={strokeColor} strokeWidth="2.5" fill="none" />
        <path d="M75 40 C60 40 60 70 50 70" stroke={mainColor} strokeWidth="2.5" fill="none" strokeDasharray="4 2" />
        <circle cx="50" cy="70" r="4" fill={strokeWarm} />
      </>);

    case 'if':
      return svg(<>
        {label('IF')}
        <path d="M20 40 H45" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M45 40 C55 40 55 55 65 55" stroke={strokeColor} strokeWidth="2.5" fill="none" />
        <path d="M45 40 C55 40 55 70 75 70" stroke={faintColor} strokeWidth="2" fill="none" strokeDasharray="4 2" />
        <circle cx="20" cy="40" r="4" fill={mainColor} />
      </>);

    case 'though':
      return svg(<>
        {label('THOUGH')}
        <path d="M15 65 H85" stroke={faintColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M20 50 Q50 30 80 50" stroke={strokeColor} strokeWidth="2.5" fill="none" className="ani-flow" />
      </>);

    case 'while':
      return svg(<>
        {label('WHILE')}
        <path d="M25 45 H75" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" className="ani-flow" />
        <path d="M25 65 H75" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" className="ani-flow" style={{ animationDelay: '0.6s' }} />
        <text x="50" y="38" fontSize="6px" fontFamily="var(--mono)" fill={faintColor} textAnchor="middle">parallel</text>
      </>);

    case 'how':
      return svg(<>
        {label('HOW')}
        <text x="50" y="62" fontSize="22px" fontFamily="var(--mono)" fill={strokeColor} fontWeight="bold" textAnchor="middle">?</text>
        <path d="M30 72 Q50 82 70 72" stroke={mainColor} strokeWidth="2" fill="none" />
        <circle cx="50" cy="78" r="3" fill={mainColor} />
      </>);

    case 'when':
      return svg(<>
        {label('WHEN')}
        <circle cx="50" cy="52" r="20" stroke={mainColor} strokeWidth="2.5" fill="none" />
        <path d="M50 52 V38" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 52 H62" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="52" r="2" fill={strokeColor} />
      </>);

    case 'where':
      return svg(<>
        {label('WHERE')}
        <path d="M50 28 C38 28 30 38 30 50 C30 62 50 78 50 78 C50 78 70 62 70 50 C70 38 62 28 50 28 Z" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.12" />
        <circle cx="50" cy="48" r="6" fill={strokeColor} />
      </>);

    case 'why':
      return svg(<>
        {label('WHY')}
        <text x="50" y="58" fontSize="20px" fontFamily="var(--mono)" fill={strokeColor} fontWeight="bold" textAnchor="middle">?</text>
        <path d="M30 72 L50 58 L70 72" stroke={strokeWarm} strokeWidth="2" fill="none" />
        <text x="50" y="40" fontSize="6px" fontFamily="var(--mono)" fill={faintColor} textAnchor="middle">reason</text>
      </>);

    case 'again':
      return svg(<>
        {label('AGAIN')}
        <path d="M30 55 A20 20 0 1 1 55 35" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M55 35 L48 28 M55 35 L62 42" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </>);

    case 'ever':
      return svg(<>
        {label('EVER')}
        <path d="M15 55 H85" stroke={faintColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="25" cy="55" r="4" fill={strokeColor} className="ani-slide" />
        <path d="M70 45 L85 55 L70 65" stroke={strokeWarm} strokeWidth="2" fill="none" strokeLinecap="round" />
        <text x="78" y="40" fontSize="8px" fill={strokeWarm}>∞</text>
      </>);

    case 'far':
      return svg(<>
        {label('FAR')}
        <circle cx="22" cy="55" r="8" fill={mainColor} />
        <circle cx="78" cy="55" r="6" stroke={faintColor} strokeWidth="2" fill="none" opacity="0.4" />
        <path d="M32 55 H68" stroke={strokeColor} strokeWidth="2" strokeDasharray="4 3" className="ani-flow" />
      </>);

    case 'forward':
      return svg(<>
        {label('FWD')}
        <circle cx="25" cy="55" r="8" fill={mainColor} />
        <g className="ani-slide">
          <path d="M38 55 H72" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M64 47 L74 55 L64 63" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </>);

    case 'here':
      return svg(<>
        {label('HERE')}
        <circle cx="50" cy="55" r="6" fill={strokeColor} className="ani-pulse" />
        <circle cx="50" cy="55" r="16" stroke={strokeColor} strokeWidth="1.5" fill="none" opacity="0.4" className="ani-pulse" />
        <path d="M50 30 L50 42 M50 68 L50 80 M30 55 L42 55 M58 55 L70 55" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" />
      </>);

    case 'near':
      return svg(<>
        {label('NEAR')}
        <circle cx="38" cy="55" r="10" fill={mainColor} />
        <circle cx="62" cy="55" r="10" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.15" />
        <path d="M48 55 H52" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" />
      </>);

    case 'now':
      return svg(<>
        {label('NOW')}
        <path d="M15 65 H85" stroke={faintColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M50 65 V35" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="65" r="5" fill={strokeColor} className="ani-pulse" />
      </>);

    case 'out':
      return svg(<>
        {label('OUT')}
        <rect x="22" y="40" width="36" height="36" rx="4" stroke={mainColor} strokeWidth="2.5" fill="none" />
        <g className="ani-slide">
          <circle cx="48" cy="58" r="7" fill={strokeColor} />
          <path d="M62 58 H82" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M76 52 L84 58 L76 64" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </>);

    case 'still':
      return svg(<>
        {label('STILL')}
        <rect x="38" y="42" width="24" height="28" rx="3" stroke={mainColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.1" />
        <path d="M30 58 H38 M62 58 H70" stroke={faintColor} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <text x="50" y="60" fontSize="7px" fontFamily="var(--mono)" fill={strokeWarm} textAnchor="middle">||</text>
      </>);

    case 'then':
      return svg(<>
        {label('THEN')}
        <path d="M15 55 H85" stroke={faintColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="30" cy="55" r="5" fill={faintColor} />
        <circle cx="65" cy="55" r="6" fill={strokeColor} className="ani-pulse" />
        <path d="M42 55 H58" stroke={strokeWarm} strokeWidth="2" strokeLinecap="round" className="ani-flow" />
      </>);

    case 'there':
      return svg(<>
        {label('THERE')}
        <circle cx="72" cy="52" r="10" stroke={strokeColor} strokeWidth="2.5" fill={fillSoft} fillOpacity="0.15" className="ani-pulse" />
        <circle cx="22" cy="52" r="6" fill={mainColor} />
        <path d="M30 52 H60" stroke={strokeWarm} strokeWidth="2" strokeDasharray="4 2" className="ani-flow" />
      </>);

    case 'together':
      return svg(<>
        {label('TOGETHER')}
        <circle cx="36" cy="55" r="10" stroke={strokeColor} strokeWidth="2" fill={fillSoft} fillOpacity="0.15" />
        <circle cx="64" cy="55" r="10" stroke={strokeColor} strokeWidth="2" fill={fillSoft} fillOpacity="0.15" />
        <ellipse cx="50" cy="55" rx="22" ry="14" stroke={strokeWarm} strokeWidth="1.5" fill="none" strokeDasharray="3 2" className="ani-pulse" />
      </>);

    case 'well':
      return svg(<>
        {label('WELL')}
        <path d="M30 60 Q42 45 50 55 Q58 65 70 50" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M38 72 L44 78 L58 64" stroke={mainColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>);

    case 'almost':
      return svg(<>
        {label('ALMOST')}
        <rect x="20" y="55" width="60" height="10" rx="3" stroke={faintColor} strokeWidth="2" fill="none" />
        <rect x="20" y="55" width="52" height="10" rx="3" fill={strokeColor} fillOpacity="0.4" />
        <text x="78" y="63" fontSize="7px" fontFamily="var(--mono)" fill={strokeWarm}>≈</text>
      </>);

    case 'enough':
      return svg(<>
        {label('ENOUGH')}
        <rect x="20" y="55" width="60" height="10" rx="3" fill={strokeColor} fillOpacity="0.45" stroke={strokeColor} strokeWidth="2" />
        <path d="M72 50 L78 55 L72 60" stroke={mainColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>);

    case 'even':
      return svg(<>
        {label('EVEN')}
        <path d="M15 55 H85" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="55" r="5" fill={mainColor} />
        <circle cx="50" cy="55" r="5" fill={mainColor} />
        <circle cx="70" cy="55" r="5" fill={mainColor} />
      </>);

    case 'not':
      return svg(<>
        {label('NOT')}
        <rect x="30" y="45" width="40" height="22" rx="4" stroke={mainColor} strokeWidth="2.5" fill="none" />
        <path d="M32 43 L68 69" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
      </>);

    case 'only':
      return svg(<>
        {label('ONLY')}
        <circle cx="50" cy="55" r="12" stroke={strokeColor} strokeWidth="3" fill={fillSoft} fillOpacity="0.2" />
        <circle cx="25" cy="55" r="7" stroke={faintColor} strokeWidth="1.5" fill="none" opacity="0.25" />
        <circle cx="75" cy="55" r="7" stroke={faintColor} strokeWidth="1.5" fill="none" opacity="0.25" />
      </>);

    case 'quite':
      return svg(<>
        {label('QUITE')}
        <rect x="25" y="58" width="50" height="8" rx="2" stroke={faintColor} strokeWidth="1.5" fill="none" />
        <rect x="25" y="58" width="35" height="8" rx="2" fill={strokeColor} fillOpacity="0.5" />
      </>);

    case 'so':
      return svg(<>
        {label('SO')}
        <circle cx="35" cy="55" r="8" fill={mainColor} />
        <path d="M45 55 H55" stroke={strokeWarm} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M58 45 L72 55 L58 65" stroke={strokeColor} strokeWidth="3" fill="none" strokeLinecap="round" className="ani-slide" />
      </>);

    case 'very':
      return svg(<>
        {label('VERY')}
        <rect x="30" y="62" width="8" height="10" rx="1" fill={strokeColor} fillOpacity="0.3" />
        <rect x="42" y="54" width="8" height="18" rx="1" fill={strokeColor} fillOpacity="0.5" />
        <rect x="54" y="44" width="8" height="28" rx="1" fill={strokeColor} fillOpacity="0.7" />
        <rect x="66" y="36" width="8" height="36" rx="1" fill={strokeColor} />
      </>);

    case 'tomorrow':
      return svg(<>
        {label('TOMORROW')}
        <path d="M15 55 H70" stroke={faintColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="30" cy="55" r="5" fill={mainColor} />
        <g className="ani-slide">
          <path d="M72 55 H88" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M82 50 L90 55 L82 60" stroke={strokeColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </>);

    case 'yesterday':
      return svg(<>
        {label('YESTERDAY')}
        <path d="M30 55 H85" stroke={faintColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="70" cy="55" r="5" fill={mainColor} />
        <g className="ani-slide" style={{ animationDirection: 'reverse' }}>
          <path d="M12 55 H28" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 50 L10 55 L18 60" stroke={strokeColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </>);

    case 'north':
      return svg(<>
        {label('N')}
        <circle cx="50" cy="55" r="22" stroke={faintColor} strokeWidth="1.5" fill="none" />
        <path d="M50 78 L50 32" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M44 38 L50 28 L56 38" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>);

    case 'south':
      return svg(<>
        {label('S')}
        <circle cx="50" cy="55" r="22" stroke={faintColor} strokeWidth="1.5" fill="none" />
        <path d="M50 32 L50 78" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M44 72 L50 82 L56 72" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>);

    case 'east':
      return svg(<>
        {label('E')}
        <circle cx="50" cy="55" r="22" stroke={faintColor} strokeWidth="1.5" fill="none" />
        <path d="M28 55 L78 55" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M72 49 L82 55 L72 61" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>);

    case 'west':
      return svg(<>
        {label('W')}
        <circle cx="50" cy="55" r="22" stroke={faintColor} strokeWidth="1.5" fill="none" />
        <path d="M78 55 L28 55" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M34 49 L24 55 L34 61" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>);

    case 'please':
      return svg(<>
        {label('PLEASE')}
        <circle cx="50" cy="32" r="8" fill={mainColor} />
        <path d="M38 48 Q50 38 62 48" stroke={strokeColor} strokeWidth="2.5" fill="none" />
        <path d="M42 58 Q50 72 58 58" stroke={strokeColor} strokeWidth="2.5" fill="none" />
      </>);

    case 'yes':
      return svg(<>
        {label('YES')}
        <circle cx="50" cy="55" r="22" stroke={faintColor} strokeWidth="2" fill="none" />
        <path d="M36 55 L46 65 L66 42" stroke={strokeColor} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>);

    default:
      return svg(<>
        <rect x="25" y="36" width="50" height="28" rx="6" fill={fillSoft} fillOpacity="0.08" stroke={faintColor} strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="50" y="53" fontSize="8px" fontFamily="var(--mono)" fill={mainColor} fontWeight="900" textAnchor="middle">
          {type.toUpperCase()}
        </text>
      </>);
  }
}
