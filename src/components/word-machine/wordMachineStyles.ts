export const WORD_MACHINE_STYLES = `
    .machine-visualizer-card {
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius);
      padding: 2.25rem 2rem;
      margin-top: 1.5rem;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      animation: scaleIn 0.4s var(--ease-spring);
    }
    .machine-graphic-showcase {
      width: 100%;
      max-width: 500px;
      height: 280px;
      background: linear-gradient(135deg, var(--bg-elevated) 0%, rgba(180,83,9,0.03) 100%);
      border: 1px solid var(--border-soft);
      border-radius: 16px;
      display: grid;
      place-items: center;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 2px 8px rgba(26, 24, 20, 0.04);
    }
    .machine-graphic-showcase::after {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 16px;
      border: 1px solid rgba(180,83,9,0.06);
      pointer-events: none;
    }
    .machine-equation-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      background: var(--bg-elevated);
      padding: 0.6rem 1.5rem;
      border-radius: 99px;
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-sm);
    }
    .eq-pill {
      font-family: var(--mono);
      font-size: 1.15rem;
      font-weight: 700;
    }
    .machine-detail-panel {
      width: 100%;
      max-width: 600px;
      text-align: center;
    }
    .machine-detail-title {
      font-family: var(--serif);
      font-size: 1.75rem;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }
    .machine-detail-desc {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--ink-secondary);
      margin-bottom: 1.25rem;
    }
    .machine-detail-replace {
      background: rgba(220,38,38,0.03);
      border: 1px solid rgba(220,38,38,0.08);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      color: var(--ink-secondary);
    }
    .machine-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin: 1.25rem 0;
    }
    .machine-stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 0.75rem 0.5rem;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }
    .machine-stat-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--accent-deep);
      line-height: 1.2;
    }
    .machine-stat-val-warm {
      color: var(--accent-warm);
    }
    .machine-stat-val-gold {
      color: #b45309;
    }
    .machine-stat-lbl {
      font-size: 0.72rem;
      color: var(--ink-muted);
      margin-top: 0.25rem;
    }
    .preposition-note-box {
      background: rgba(180,83,9,0.03);
      border: 1px dashed var(--border-soft);
      border-left: 4px solid var(--accent-warm);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      margin: 1rem 0 1.25rem 0;
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--ink-secondary);
    }
    .speak-btn {
      background: var(--accent-soft);
      border: 1px solid var(--accent);
      color: var(--accent-deep);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-left: 0.5rem;
      padding: 0;
    }
    .speak-btn:hover {
      background: var(--accent);
      color: #fff;
      transform: scale(1.15);
    }
    @media (max-width: 768px) {
      .machine-stats-grid {
        grid-template-columns: 1fr 1fr;
      }
      .machine-graphic-showcase {
        height: 220px;
      }
    }
  `;
