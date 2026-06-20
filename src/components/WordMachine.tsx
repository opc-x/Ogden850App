import { useCallback } from 'react';
import { DIRECTIONS, OPERATORS } from './word-machine/wordMachineData';
import { MachineGraphic } from './word-machine/MachineGraphic';
import { WORD_MACHINE_STYLES } from './word-machine/wordMachineStyles';
import { useWordMachineState } from './word-machine/useWordMachineState';

export default function WordMachine() {
  const {
    activeOp,
    setActiveOp,
    activeDir,
    setActiveDir,
    comboKey,
    validCombo,
    handleSpeak,
    invalidExplanation,
  } = useWordMachineState();

  const selectOp = useCallback((op: string) => setActiveOp(op), [setActiveOp]);
  const selectDir = useCallback((dir: string) => setActiveDir(dir), [setActiveDir]);

  return (
    <div className="machine">
      <style>{WORD_MACHINE_STYLES}</style>
      <div className="machine-head">
        <span className="machine-kicker">短语动词组合计算器 (Phrasal Verbs Combinator)</span>
        <h3>动作 × 空间方向：以极简组装实操为核心</h3>

        <div className="machine-stats-grid">
          <div className="machine-stat-card">
            <div className="machine-stat-val">18</div>
            <div className="machine-stat-lbl">输入动作词 (Operators)</div>
          </div>
          <div className="machine-stat-card">
            <div className="machine-stat-val machine-stat-val-warm">20</div>
            <div className="machine-stat-lbl">输入方向词 (Directions)</div>
          </div>
          <div className="machine-stat-card">
            <div className="machine-stat-val machine-stat-val-gold">360</div>
            <div className="machine-stat-lbl">空间拼装交叉点 (Possible Combos)</div>
          </div>
          <div className="machine-stat-card">
            <div className="machine-stat-val" style={{ color: '#10b981' }}>60+</div>
            <div className="machine-stat-lbl">合规输出短语动作</div>
          </div>
        </div>

        <div className="preposition-note-box">
          <strong>💡 为什么只与 20 个方向介词进行组合，而不是全部 25 个？</strong><br />
          基本英语收录的 25 个介词中，有 <strong>20 个自带物理空间方位和运动轨迹的“方向词”</strong>（如 <code>up, down, through, out</code>），它们能与动作词结合。而剩下的 5 个介词（<strong><code>as, for, of, than, till</code></strong>）代表因果、比较、所属等纯逻辑和时间关系，不具备空间轨迹，因此不能拼装成物理短语动词。
        </div>
      </div>

      <div className="machine-row" style={{ marginTop: '1rem' }}>
        <span className="machine-row-label" style={{ fontWeight: '600', fontSize: '0.88rem', display: 'block', marginBottom: '0.35rem' }}>
          <span className="machine-step-num" style={{ background: 'var(--accent)', color: '#fff', padding: '0.15rem 0.45rem', borderRadius: '4px', marginRight: '0.35rem', fontSize: '0.75rem' }}>1</span>
          第一步：选择核心动作 (18 Operators)
        </span>
        <div className="chip-track" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {OPERATORS.map((op) => (
            <button
              key={op}
              type="button"
              style={{
                background: op === activeOp ? 'var(--accent)' : 'var(--bg-elevated)',
                color: op === activeOp ? '#fff' : 'var(--ink-secondary)',
                border: '1px solid var(--border-soft)',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontFamily: 'var(--mono)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
              onClick={() => selectOp(op)}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      <div className="machine-row" style={{ marginTop: '1.25rem' }}>
        <span className="machine-row-label" style={{ fontWeight: '600', fontSize: '0.88rem', display: 'block', marginBottom: '0.35rem' }}>
          <span className="machine-step-num" style={{ background: 'var(--accent-warm)', color: '#fff', padding: '0.15rem 0.45rem', borderRadius: '4px', marginRight: '0.35rem', fontSize: '0.75rem' }}>2</span>
          第二步：匹配合规物理方向 (20 Directions)
        </span>
        <div className="chip-track" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {DIRECTIONS.map((dir) => (
            <button
              key={dir}
              type="button"
              style={{
                background: dir === activeDir ? 'var(--accent-warm)' : 'var(--bg-elevated)',
                color: dir === activeDir ? '#fff' : 'var(--ink-secondary)',
                border: '1px solid var(--border-soft)',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontFamily: 'var(--mono)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              onClick={() => selectDir(dir)}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      <div className="machine-visualizer-card">
        <div className="machine-graphic-showcase" key={`scene-${activeOp}-${activeDir}`}>
          <MachineGraphic word={comboKey} />
        </div>

        <div className="machine-equation-bar" key={`eq-${activeOp}-${activeDir}`}>
          <span className="eq-pill" style={{ color: 'var(--accent)' }}>{activeOp}</span>
          <span style={{ color: 'var(--ink-faint)', fontWeight: '500' }}>+</span>
          <span className="eq-pill" style={{ color: 'var(--accent-warm)' }}>{activeDir}</span>
          <span style={{ color: 'var(--ink-faint)', fontWeight: '500' }}>→</span>

          <span style={{ background: 'var(--accent-soft)', padding: '0.25rem 0.75rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="eq-pill" style={{ color: 'var(--accent-deep)' }}>
              {validCombo ? validCombo.result : `${activeOp} ${activeDir}`}
            </span>
            <button className="speak-btn" onClick={handleSpeak} title="播放发音" type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
          </span>
        </div>

        <div className="machine-detail-panel" key={`result-${activeOp}-${activeDir}`}>
          {validCombo ? (
            <>
              <div className="machine-detail-title">{validCombo.cn}</div>
              <div className="machine-detail-desc">{validCombo.desc}</div>
              <div className="machine-detail-replace">
                💡 在标准英语中，通常需要记忆复杂的单独动词词根：
                <code style={{ background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.12)', padding: '0.15rem 0.45rem', borderRadius: '4px', margin: '0 0.35rem', fontFamily: 'var(--mono)', fontWeight: 'bold' }}>
                  {validCombo.replaces}
                </code>
                <div style={{ marginTop: '0.5rem', color: 'var(--ink-faint)', fontSize: '0.76rem', lineHeight: '1.4' }}>
                  <strong>直观意译原理</strong>: 在 Basic English 中，直接利用 <strong>{activeOp}</strong> 的基本物理动作伴随 <strong>{activeDir}</strong> 的物理轨迹，使语义“见图知意”，降低记忆负担。
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: '#dc2626', fontSize: '0.88rem', background: 'rgba(220,38,38,0.04)', border: '1px dashed rgba(220,38,38,0.15)', padding: '1.25rem', borderRadius: '10px', lineHeight: '1.6', whiteSpace: 'pre-line', maxWidth: '520px', margin: '0 auto' }}>
              {invalidExplanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
