import { useCallback, useState } from 'react';
import { GROUPS, type DirectionWord } from '../data/directionWords';
import { DirectionGraphic } from './directions/DirectionGraphic';

export { DirectionGraphic } from './directions/DirectionGraphic';
export { SUPPORTED_DIRECTION_WORDS } from '../data/directionWords';
export type { DirectionWord } from '../data/directionWords';

export default function DirectionsVisual() {
  const [selectedWord, setSelectedWord] = useState<DirectionWord>(GROUPS[0].words[0]);
  const selectWord = useCallback((item: DirectionWord) => setSelectedWord(item), []);

  return (
    <div className="operators-visualizer directions-visualizer">
      <div className="visualizer-header">
        <span className="machine-kicker">物理矢量骨架</span>
        <h3>20 个空间方向词与 5 个逻辑介词：几何滑轨</h3>
        <p>
          Ogden 认为，空间介词是句子的<strong>几何图解</strong>。
          Basic English 不使用复杂的动作词，而是用极其精简的 18 个 Operator（基础动作）配合这 20 个物理方向词，把动作在三维空间中的<strong>方向矢量、位移始末、接触状态</strong>拼接出来。
        </p>
      </div>

      <div className="visualizer-body">
        <div className="operators-grid-panel">
          {GROUPS.map((group) => (
            <div key={group.name} className="op-group-section">
              <div className="op-group-title">
                <h4>{group.name}</h4>
                <span className="op-group-subtitle">{group.desc}</span>
              </div>
              <div className="op-group-chips">
                {group.words.map((item) => {
                  const isSelected = selectedWord.word === item.word;
                  return (
                    <button
                      key={item.word}
                      type="button"
                      className={`op-chip${isSelected ? ' active' : ''}`}
                      onClick={() => selectWord(item)}
                    >
                      <span className="op-chip-en">{item.word}</span>
                      <span className="op-chip-cn">{item.cn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="operator-vector-card" key={selectedWord.word}>
          <div className="vector-card-head">
            <div className="vector-card-title-row">
              <span className="card-op-en" style={{ fontSize: '2.4rem', fontFamily: 'var(--serif)' }}>
                {selectedWord.word}
              </span>
              <span className="card-op-cn" style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--accent)' }}>
                {selectedWord.cn}
              </span>
            </div>
            <div className="vector-card-tag">
              {selectedWord.category === 'static' && '静态位置 (Static Place)'}
              {selectedWord.category === 'movement' && '动态位移 (Movement/Vector)'}
              {selectedWord.category === 'relation' && '相对关系 (Relationship)'}
              {selectedWord.category === 'logical' && '逻辑抽象 (Logical Relation)'}
            </div>
          </div>

          <div className="vector-card-graphic" style={{ background: 'linear-gradient(135deg, var(--bg) 0%, rgba(254,243,199,0.06) 100%)', minHeight: '150px' }}>
            <DirectionGraphic type={selectedWord.svgType} />
          </div>

          <div className="vector-card-info">
            <div className="vector-info-section">
              <h5 style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', fontWeight: '600', letterSpacing: '0.06em', margin: '0 0 0.25rem 0' }}>
                空间物理/逻辑模型 (Spatial/Logical Concept)
              </h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', lineHeight: '1.6', margin: '0' }}>
                {selectedWord.concept}
              </p>
            </div>

            <div className="vector-info-section">
              <h5 style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', fontWeight: '600', letterSpacing: '0.06em', margin: '0 0 0.25rem 0' }}>
                倍增组合应用 (BE850 Equation)
              </h5>
              <code className="vector-formula-code">{selectedWord.equation}</code>
            </div>

            <div className="vector-info-section">
              <h5 style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', fontWeight: '600', letterSpacing: '0.06em', margin: '0 0 0.25rem 0' }}>
                核心搭配示例 (Example Phrases)
              </h5>
              <ul className="vector-example-list" style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: '0', paddingLeft: '1.1rem' }}>
                {selectedWord.examples.map((ex) => (
                  <li key={ex} style={{ marginBottom: '0.25rem' }}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
