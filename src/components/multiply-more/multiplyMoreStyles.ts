export const MULTIPLY_MORE_STYLES = `
    .multiply-dashboard {
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      margin-top: 1rem;
    }
    .multiply-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin: 1.25rem 0;
    }
    .multiply-stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 0.75rem 0.5rem;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }
    .multiply-stat-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--accent-deep);
      line-height: 1.2;
    }
    .multiply-stat-val-warm {
      color: var(--accent-warm);
    }
    .multiply-stat-val-gold {
      color: #b45309;
    }
    .multiply-stat-lbl {
      font-size: 0.72rem;
      color: var(--ink-muted);
      margin-top: 0.25rem;
    }
    .morph-visualizer-container {
      display: grid;
      grid-template-columns: 1.2fr 1.8fr;
      gap: 1.5rem;
      align-items: center;
      margin-top: 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .morph-graphic-box {
      background: linear-gradient(135deg, var(--bg) 0%, rgba(254,243,199,0.06) 100%);
      border: 1px solid var(--border-soft);
      border-radius: 12px;
      display: grid;
      place-items: center;
      padding: 1rem;
      aspect-ratio: 1 / 1;
      animation: tabFadeIn 0.3s ease-out;
    }
    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .morph-word-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 1.35rem;
      font-family: var(--mono);
      font-weight: bold;
    }
    .speak-btn {
      background: var(--accent-soft);
      border: 1px solid var(--accent);
      color: var(--accent-deep);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: 0.5rem;
      padding: 0;
      transition: all 0.2s;
    }
    .speak-btn:hover {
      background: var(--accent);
      color: #fff;
      transform: scale(1.1);
    }
    .bypassing-box {
      margin-top: 2rem;
      border-top: 1px solid var(--border-soft);
      padding-top: 1.5rem;
    }
    .bypassing-dashboard {
      background: linear-gradient(135deg, var(--bg-elevated) 0%, rgba(220,38,38,0.02) 100%);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      animation: tabFadeIn 0.3s ease-out;
    }
    @media (max-width: 768px) {
      .morph-visualizer-container {
        grid-template-columns: 1fr;
      }
      .morph-graphic-box {
        aspect-ratio: 1.8 / 1;
        max-height: 160px;
      }
      .multiply-stats-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `;
