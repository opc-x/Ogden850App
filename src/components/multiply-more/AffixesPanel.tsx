import { VectorGraphic } from './VectorGraphic';
import type { useMultiplyMoreState } from './useMultiplyMoreState';

type AffixState = ReturnType<typeof useMultiplyMoreState>['affix'];

type Props = {
  affix: AffixState;
  handleSpeak: (text: string) => void;
};

export function AffixesPanel({ affix, handleSpeak }: Props) {
  const {
    roots, affixes, activeRoot, setActiveRoot, activeAffix, setActiveAffix,
    validAffixEntry, bypassIdx, setBypassIdx, bypassCases, invalidAffixDetails,
  } = affix;
  return (
        <div className="multiply-dashboard">
          <span className="multiply-kicker" style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.06em", fontWeight: "600" }}>
            1. 词缀派生实验室 (Affix Derivation Lab)
          </span>
          <h3 style={{ margin: "0.25rem 0 0.5rem 0" }}>词缀拼装：以动作变形实操为核心</h3>
          
          {/* Stats Header for Affixes - 精确对应可选内容 */}
          <div className="multiply-stats-grid">
            <div className="multiply-stat-card">
              <div className="multiply-stat-val">11</div>
              <div className="multiply-stat-lbl">实验室词根 (Active Roots)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val multiply-stat-val-warm">6</div>
              <div className="multiply-stat-lbl">法定词缀 (Approved Affixes)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val multiply-stat-val-gold">66</div>
              <div className="multiply-stat-lbl">组合测试可能 (Total Combos)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val" style={{ color: "#10b981" }}>35</div>
              <div className="multiply-stat-lbl">成功组装派生词</div>
            </div>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1.25rem", lineHeight: "1.5" }}>
            通过严格限定的 6 个词缀派生变形。在下方选择词根和词缀拼装实操，并观察相应的拼写突变规则：
          </p>

          {/* 选词根 */}
          <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", fontWeight: "600", display: "block", marginBottom: "0.45rem" }}>
            第一步：选择拼装词根 (11 Roots)
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
            {roots.map((r) => (
              <button
                key={r}
                type="button"
                style={{
                  background: r === activeRoot ? "var(--accent)" : "var(--bg-elevated)",
                  color: r === activeRoot ? "#fff" : "var(--ink-secondary)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "5px",
                  padding: "0.25rem 0.55rem",
                  fontSize: "0.8rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveRoot(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* 选对应词缀 */}
          <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", fontWeight: "600", display: "block", marginBottom: "0.45rem" }}>
            第二步：选择要加的词缀 (6 Affixes)
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.25rem" }}>
            {affixes.map((a) => (
              <button
                key={a}
                type="button"
                style={{
                  background: a === activeAffix ? "var(--accent-warm)" : "var(--bg-elevated)",
                  color: a === activeAffix ? "#fff" : "var(--ink-secondary)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "5px",
                  padding: "0.25rem 0.55rem",
                  fontSize: "0.8rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveAffix(a)}
              >
                {a}
              </button>
            ))}
          </div>

          {/* 拼装实操结果 */}
          <div className="morph-visualizer-container">
            <div className="morph-graphic-box" key={`affix-img-${activeRoot}-${activeAffix}`}>
              <VectorGraphic word={validAffixEntry ? validAffixEntry.result : ""} />
            </div>

            <div className="morph-result" style={{ width: "100%", margin: 0 }} key={`affix-res-${activeRoot}-${activeAffix}`}>
              {validAffixEntry ? (
                <>
                  <div className="morph-word-row">
                    {activeAffix === "UN-" ? (
                      <>
                        <span className="morph-highlight">un</span>
                        <span>+</span>
                        <span>{activeRoot}</span>
                      </>
                    ) : (
                      <>
                        <span>{activeRoot}</span>
                        <span>+</span>
                        <span className="morph-highlight">{activeAffix.replace("-", "").toLowerCase()}</span>
                      </>
                    )}
                    <span>→</span>
                    <span style={{ background: "var(--accent-soft)", padding: "0.2rem 0.5rem", borderRadius: "5px", display: "inline-flex", alignItems: "center" }}>
                      <span style={{ color: "var(--accent-deep)", fontWeight: "bold" }}>{validAffixEntry.result}</span>
                      <button className="speak-btn" onClick={() => handleSpeak(validAffixEntry.result)} title="播放发音" type="button">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      </button>
                    </span>
                  </div>
                  
                  <div style={{ marginTop: "0.75rem", fontSize: "0.95rem", color: "var(--ink)" }}>
                    中文释义：<strong>{validAffixEntry.cn}</strong>
                  </div>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: "1.4" }}>
                    {validAffixEntry.desc}
                  </p>
                </>
              ) : (
                <div style={{ color: "#dc2626", fontSize: "0.85rem", background: "rgba(220,38,38,0.04)", border: "1px dashed rgba(220,38,38,0.15)", padding: "1rem", borderRadius: "8px", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                  {invalidAffixDetails}
                </div>
              )}
            </div>
          </div>

          {/* 禁用词缀拆解模拟器 */}
          <div className="bypassing-box">
            <span className="multiply-kicker" style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#dc2626", letterSpacing: "0.05em", fontWeight: "600" }}>
              💡 词缀禁令拆解模拟器 (Suffix Bypassing Simulator)
            </span>
            <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", margin: "0.25rem 0 0.75rem 0", lineHeight: "1.4" }}>
              基本英语中禁止使用任何复杂的英语后缀。点击下方查看它们如何用意译在 850 词内实现替换：
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.85rem" }}>
              {bypassCases.map((b, i) => (
                <button
                  key={b.suffix}
                  type="button"
                  style={{
                    background: i === bypassIdx ? "#dc2626" : "var(--bg-elevated)",
                    color: i === bypassIdx ? "#fff" : "var(--ink-secondary)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "5px",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    fontFamily: "var(--mono)",
                    cursor: "pointer"
                  }}
                  onClick={() => setBypassIdx(i)}
                >
                  {b.suffix} ({b.replaces})
                </button>
              ))}
            </div>

            <div className="bypassing-dashboard" key={`bypass-${bypassIdx}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.95rem" }}>
                <span style={{ color: "#dc2626", fontWeight: "bold", textDecoration: "line-through" }}>{bypassCases[bypassIdx].replaces}</span>
                <span style={{ color: "var(--ink-faint)" }}>➔</span>
                <span style={{ color: "var(--ink-muted)", fontSize: "0.8rem" }}>拆为 {bypassCases[bypassIdx].rootWord} + 禁用 {bypassCases[bypassIdx].suffix} ➔</span>
                
                <span style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)", padding: "0.15rem 0.5rem", borderRadius: "5px", fontFamily: "var(--mono)", fontWeight: "bold", display: "inline-flex", alignItems: "center" }}>
                  {bypassCases[bypassIdx].allowed}
                  <button className="speak-btn" onClick={() => handleSpeak(bypassCases[bypassIdx].allowed)} title="播放发音" type="button" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid #10b981", color: "#10b981" }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </button>
                </span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)", marginTop: "0.5rem" }}>
                * 以 <strong>{bypassCases[bypassIdx].formula}</strong> 的结构，直接拆解替代普通英语中的名词/动词后缀，完美合规。
              </div>
            </div>
          </div>
        </div>
  );
}
