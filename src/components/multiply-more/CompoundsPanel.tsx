import { VectorGraphic } from './VectorGraphic';
import type { useMultiplyMoreState } from './useMultiplyMoreState';

type CompoundState = ReturnType<typeof useMultiplyMoreState>['compound'];

type Props = {
  compound: CompoundState;
  handleSpeak: (text: string) => void;
};

export function CompoundsPanel({ compound, handleSpeak }: Props) {
  const {
    wordAList, wordBList, activeA, setActiveA, activeB, setActiveB,
    selectedCompound, invalidCompoundDetails,
  } = compound;
  return (
        <div className="multiply-dashboard">
          <span className="multiply-kicker" style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-warm)", letterSpacing: "0.06em", fontWeight: "600" }}>
            2. 复合词拼接线 (Compound Word Assembler)
          </span>
          <h3 style={{ margin: "0.25rem 0 0.5rem 0" }}>词根拼接：以物理粘合实操为核心</h3>

          {/* Stats Header for Compounds - 完美匹配可选列表 */}
          <div className="multiply-stats-grid">
            <div className="multiply-stat-card">
              <div className="multiply-stat-val">16</div>
              <div className="multiply-stat-lbl">组装左词根 (Word A)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val multiply-stat-val-warm">13</div>
              <div className="multiply-stat-lbl">组装右词根 (Word B)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val multiply-stat-val-gold">208</div>
              <div className="multiply-stat-lbl">组合测试可能 (Possible Combos)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val" style={{ color: "#10b981" }}>17</div>
              <div className="multiply-stat-lbl">合规输出复合词</div>
            </div>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1.25rem", lineHeight: "1.5" }}>
            将两个 850 基础词根进行物理粘合。在下方选择左、右构件，进行实时拼接实操测试：
          </p>

          {/* 选择 Word A */}
          <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", fontWeight: "600", display: "block", marginBottom: "0.45rem" }}>
            第一步：选择左词根 (Word A)
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
            {wordAList.map((a) => (
              <button
                key={a}
                type="button"
                style={{
                  background: a === activeA ? "var(--accent)" : "var(--bg-elevated)",
                  color: a === activeA ? "#fff" : "var(--ink-secondary)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "5px",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.78rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveA(a)}
              >
                {a}
              </button>
            ))}
          </div>

          {/* 选择 Word B */}
          <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", fontWeight: "600", display: "block", marginBottom: "0.45rem" }}>
            第二步：选择右词根 (Word B)
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.25rem" }}>
            {wordBList.map((b) => (
              <button
                key={b}
                type="button"
                style={{
                  background: b === activeB ? "var(--accent-warm)" : "var(--bg-elevated)",
                  color: b === activeB ? "#fff" : "var(--ink-secondary)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "5px",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.78rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveB(b)}
              >
                {b}
              </button>
            ))}
          </div>

          {/* 拼接动画及展示 */}
          <div className="morph-visualizer-container">
            <div className="morph-graphic-box" key={`comp-img-${activeA}-${activeB}`}>
              <VectorGraphic word={selectedCompound ? selectedCompound.result : ""} />
            </div>

            <div className="morph-result" style={{ width: "100%", margin: 0 }} key={`comp-res-${activeA}-${activeB}`}>
              {selectedCompound ? (
                <>
                  <div className="morph-word-row" style={{ fontSize: "1.25rem" }}>
                    <span className="ani-merge-box-l" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "5px" }}>{selectedCompound.a}</span>
                    <span style={{ color: "var(--ink-faint)" }}>+</span>
                    <span className="ani-merge-box-r" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "5px" }}>{selectedCompound.b}</span>
                    <span style={{ color: "var(--ink-faint)" }}>→</span>
                    <span style={{ color: "var(--accent-warm)", background: "var(--accent-soft)", padding: "0.2rem 0.6rem", borderRadius: "5px", display: "inline-flex", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold" }}>{selectedCompound.result}</span>
                      <button className="speak-btn" onClick={() => handleSpeak(selectedCompound.result)} title="播放发音" type="button" style={{ background: "rgba(180,83,9,0.12)", border: "1px solid var(--accent-warm)", color: "var(--accent-warm)" }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      </button>
                    </span>
                  </div>
                  
                  <div style={{ marginTop: "0.75rem", fontSize: "0.95rem", color: "var(--ink)" }}>
                    中文释义：<strong>{selectedCompound.cn}</strong>
                  </div>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: "1.4" }}>
                    {selectedCompound.desc}
                  </p>
                </>
              ) : (
                <div style={{ color: "#dc2626", fontSize: "0.85rem", background: "rgba(220,38,38,0.04)", border: "1px dashed rgba(220,38,38,0.15)", padding: "1rem", borderRadius: "8px", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                  {invalidCompoundDetails}
                </div>
              )}
            </div>
          </div>
        </div>
  );
}
