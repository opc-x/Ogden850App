/** 与 OperatorVisual / DirectionGraphic 同源的设计令牌 */
export function conceptVisualTokens() {
  return {
    strokeColor: 'var(--accent)',
    strokeWarm: 'var(--accent-warm)',
    mainColor: 'var(--ink)',
    faintColor: 'var(--border)',
    fillSoft: 'var(--accent-soft)',
    inlineStyles: `
      @keyframes cv-pulse {
        0%, 100% { opacity: 0.45; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.06); }
      }
      @keyframes cv-flow {
        to { stroke-dashoffset: -18; }
      }
      @keyframes cv-bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      .cv-pulse { transform-origin: 50px 50px; animation: cv-pulse 2.5s infinite ease-in-out; }
      .cv-flow { stroke-dasharray: 5 3; animation: cv-flow 1.2s infinite linear; }
      .cv-bob { animation: cv-bob 2.2s infinite ease-in-out; }
    `,
    baseSvgProps: {
      viewBox: '0 0 100 100',
      width: '100%',
      height: '100%',
      className: 'vector-svg',
      'aria-hidden': true as const,
    },
  };
}
