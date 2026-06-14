import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from "react";


type Scene = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
};

const SCENES: Scene[] = [
  {
    id: 0,
    title: "核心公式 (The Formula)",
    subtitle: "把复杂动词还原成物理动作与空间方向",
    description: "Ogden Basic English 的灵魂是：消除 4000+ 复杂动词。一切动作都是【身体位移/手势操作 (18 Operators)】与【物理空间方向 (20 Directions)】的乘法组合。"
  },
  {
    id: 1,
    title: "动作骨架 (The Skeleton)",
    subtitle: "18个物理手势与20个空间方位",
    description: "动作是一架机器。Operators (如 come, go, put, take) 是关节和齿轮，方向词 (如 in, out, up, down) 是滑轨和朝向。关节与滑轨卡合，就拼出了日常全部动作。"
  },
  {
    id: 2,
    title: "装载词根 (The Roots)",
    subtitle: "850词分层装配，绝非死记硬背",
    description: "850 词分成四大层级：最底层的 100个 Operations（语法骨架），200个 Picturable（可画图的实体词），400个 General（通用概念名词），和 150个 Qualities（修饰性质词）。"
  },
  {
    id: 3,
    title: "乘数倍增 (The Multiplier)",
    subtitle: "词缀与复合词的物理大爆发",
    description: "借助 6 个核心词缀 (-s, -er, -ing, -ed, -ly, un-) 和左右复合规则（如 sun + flower = sunflower），850 个词根可以瞬间自我繁殖，覆盖日常 90% 的表达需求。"
  }
];

export default function PlaybookPlay() {
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const progressTimer = useRef<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const duration = 20000; // 每个场景播放 20 秒
  const stepTime = 30; // 30ms 更新一次进度

  useEffect(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    if (isPlaying) {
      const increment = (stepTime / duration) * 100;
      progressTimer.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveScene((curr) => (curr + 1) % SCENES.length);
            return 0;
          }
          return prev + increment;
        });
      }, stepTime);
    }

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [isPlaying, activeScene]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleTabClick = (index: number) => {
    setActiveScene(index);
    setProgress(0);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setActiveScene((curr) => (curr + 1) % SCENES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveScene((curr) => (curr - 1 + SCENES.length) % SCENES.length);
    setProgress(0);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const totalScenes = SCENES.length;
    const targetSceneFloat = ratio * totalScenes;
    const targetSceneIndex = Math.min(totalScenes - 1, Math.floor(targetSceneFloat));
    const targetSceneProgress = (targetSceneFloat - targetSceneIndex) * 100;

    setActiveScene(targetSceneIndex);
    setProgress(targetSceneProgress);
  };

  const handleFullscreenToggle = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Video time variables
  const currentSecs = Math.floor(activeScene * 20 + (progress / 100) * 20);
  const totalSecs = SCENES.length * 20; // 80s

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Overall timeline percentage
  const overallProgress = ((activeScene * 20 + (progress / 100) * 20) / totalSecs) * 100;

  return (
    <div className="playbook-visualizer">
      {/* 顶部标题 */}
      <div className="visualizer-header">
        <div className="header-badge">PLAYBOOK</div>
        <h3>Ogden 850 学习法：核心逻辑视觉导图</h3>
        <p>
          点击下方视频型播放器，即可进入 Basic English 的<strong>物理乘积世界</strong>。
        </p>
      </div>

      {/* 视频型播放器 */}
      <div 
        className={`playbook-player-video ${isFullscreen ? "fullscreen" : ""}`} 
        ref={playerRef}
      >
        {/* macOS Window Controls Decorator */}
        <div className="player-decor-top">
          <div className="decor-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <span className="player-title">Ogden_Basic_English_Playbook.mp4</span>
          <span className="player-status-tag">1080p HD</span>
        </div>

        {/* 顶部进度段指示器 (Netflix / Stories style) */}
        <div className="player-segments">
          {SCENES.map((scene, idx) => {
            let fillWidth = "0%";
            if (idx < activeScene) {
              fillWidth = "100%";
            } else if (idx === activeScene) {
              fillWidth = `${progress}%`;
            }
            return (
              <button
                key={scene.id}
                type="button"
                className={`player-segment-btn ${activeScene === idx ? "active" : ""}`}
                onClick={() => handleTabClick(idx)}
                title={scene.title}
              >
                <div className="segment-progress-bar">
                  <div className="segment-progress-fill" style={{ width: fillWidth }} />
                </div>
                <div className="segment-label">
                  <span className="seg-num">0{idx + 1}</span>
                  <span className="seg-title">{scene.title.split(" ")[0]}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 核心动画屏幕 */}
        <div className="player-screen-canvas">
          {/* 场景 1: 核心公式 */}
          {activeScene === 0 && (
            <div className="scene-content scene-formula">
              <div className="scene-main-title">{SCENES[0].subtitle}</div>
              <div className="formula-box-row">
                <div className="formula-node glow-card node-roots">
                  <span className="node-num">850</span>
                  <span className="node-label">词根 (Roots)</span>
                </div>
                <div className="formula-operator">×</div>
                <div className="formula-node glow-card node-ops active-node">
                  <span className="node-num">18</span>
                  <span className="node-label">动作 (Operators)</span>
                </div>
                <div className="formula-operator">×</div>
                <div className="formula-node glow-card node-dirs">
                  <span className="node-num">20</span>
                  <span className="node-label">物理方向 (Dirs)</span>
                </div>
                <div className="formula-operator">=</div>
                <div className="formula-node result-node">
                  <span className="node-text">日常表达 90%</span>
                  <span className="node-label">代替 4000+ 复杂动词</span>
                </div>
              </div>

              <div className="animation-demo-box-dark">
                <div className="terminal-header">
                  <span className="term-dot" />
                  <span className="term-dot" />
                  <span className="term-dot" />
                  <span className="term-title">Verb Compiler</span>
                </div>
                <div className="demo-phrase-line">
                  <span className="phrase-word cross-through">enter the room</span>
                  <span className="phrase-arrow">➔</span>
                  <span className="phrase-word bold-word green">go</span>
                  <span className="phrase-word bold-word orange">in</span>
                  <span className="phrase-word">the room</span>
                </div>
                <div className="demo-phrase-caption">
                  物理化拆解：消灭普通动词 <i>enter</i>，拼装为动作 <i>go</i> 与方向 <i>in</i>
                </div>
              </div>
            </div>
          )}

          {/* 场景 2: 动作骨架 */}
          {activeScene === 1 && (
            <div className="scene-content scene-skeleton">
              <div className="scene-main-title">{SCENES[1].subtitle}</div>
              <div className="skeleton-visual-row">
                <div className="skeleton-panel glow-card node-ops">
                  <h5>18 动作 (Operators)</h5>
                  <div className="skeleton-chips">
                    <span className="sk-chip verb-chip">come / go</span>
                    <span className="sk-chip verb-chip">put / take</span>
                    <span className="sk-chip verb-chip">give / get</span>
                    <span className="sk-chip verb-chip">keep / let</span>
                    <span className="sk-chip verb-chip">make / do</span>
                  </div>
                </div>
                <div className="skeleton-connector-line">
                  <div className="arrow-pulse">➔</div>
                </div>
                <div className="skeleton-panel glow-card node-dirs">
                  <h5>20 方向 (Directions)</h5>
                  <div className="skeleton-chips">
                    <span className="sk-chip dir-chip">in / out</span>
                    <span className="sk-chip dir-chip">up / down</span>
                    <span className="sk-chip dir-chip">over / under</span>
                    <span className="sk-chip dir-chip">before / after</span>
                  </div>
                </div>
              </div>
              <div className="animation-demo-box-dark">
                <div className="physics-assembly">
                  <span className="assembly-item">take (拿)</span>
                  <span className="assembly-plus">+</span>
                  <span className="assembly-item">down (向下)</span>
                  <span className="assembly-equal">=</span>
                  <span className="assembly-result">take down (拿下来 ➔ remove)</span>
                </div>
              </div>
            </div>
          )}

          {/* 场景 3: 分层装词 */}
          {activeScene === 2 && (
            <div className="scene-content scene-roots">
              <div className="scene-main-title">{SCENES[2].subtitle}</div>
              <div className="pyramid-container">
                <div className="pyramid-tier tier-ops">
                  <span className="tier-tag">100 Operations (语法底座)</span>
                  <span className="tier-desc">连词/介词/代词 (and, but, to)</span>
                </div>
                <div className="pyramid-tier tier-picturable">
                  <span className="tier-tag">200 Picturable (实体名词)</span>
                  <span className="tier-desc">物理实体 (table, box, cat)</span>
                </div>
                <div className="pyramid-tier tier-general">
                  <span className="tier-tag">400 General (通用名词)</span>
                  <span className="tier-desc">抽象世界 (agreement, business)</span>
                </div>
                <div className="pyramid-tier tier-qualities">
                  <span className="tier-tag">150 Qualities (形容词)</span>
                  <span className="tier-desc">修饰世界 (good, red, cold)</span>
                </div>
              </div>
            </div>
          )}

          {/* 场景 4: 乘数倍增 */}
          {activeScene === 3 && (
            <div className="scene-content scene-multiplier">
              <div className="scene-main-title">{SCENES[3].subtitle}</div>
              <div className="multiplier-showcase">
                <div className="showcase-card-dark glow-card">
                  <h6>① 复合词乘法 (Compounding)</h6>
                  <div className="showcase-formula">
                    <span>sun (太阳)</span>
                    <span>+</span>
                    <span>flower (花)</span>
                    <span className="showcase-arrow">➔</span>
                    <span className="result-bold">sunflower (向日葵)</span>
                  </div>
                </div>
                <div className="showcase-card-dark glow-card">
                  <h6>② 派生词缀 (-s, -er, -ing, -ed, -ly, un-)</h6>
                  <div className="showcase-formula">
                    <span>un-</span>
                    <span>+</span>
                    <span>work (工作)</span>
                    <span>+</span>
                    <span>-able</span>
                    <span className="showcase-arrow">➔</span>
                    <span className="result-bold">unworkable (行不通的)</span>
                  </div>
                </div>
              </div>
              <div className="demo-phrase-caption" style={{ marginTop: "0.8rem", color: "rgba(255, 255, 255, 0.6)" }}>
                仅需 850 词根，通过词缀与拼合，瞬间增殖出数千个日常可用词汇
              </div>
            </div>
          )}

          {/* Subtitle / Closed Caption (CC) Overlay */}
          <div className="player-cc-overlay">
            <div className="cc-box">
              <p className="cc-speech">{SCENES[activeScene].description}</p>
            </div>
          </div>
        </div>

        {/* 播放器控制器 */}
        <div className="player-controls-bar">
          <div className="controls-left">
            <button type="button" className="control-icon-btn" onClick={handlePrev} title="上一步">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6L18 6v12z" />
              </svg>
            </button>
            <button type="button" className="control-icon-btn play-pause-main-btn" onClick={handlePlayPause} title={isPlaying ? "暂停" : "播放"}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button type="button" className="control-icon-btn" onClick={handleNext} title="下一步">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6z" />
              </svg>
            </button>

            {/* Volume Speaker Icon Toggle */}
            <button 
              type="button" 
              className="control-icon-btn volume-btn" 
              onClick={() => setIsMuted(!isMuted)} 
              title={isMuted ? "静音 (点击取消静音)" : "有音 (点击静音)"}
            >
              {isMuted ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 3.28-2 6.08-4.88 7.21v2.06c3.99-1.2 7-4.89 7-9.27s-3.01-8.07-7-9.27v2.06C17 5.92 19 8.72 19 12zM3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83z" opacity="0.4" />
                  <path d="M19.58 12L22 14.41 20.59 15.8 18.17 13.4 15.76 15.8 14.37 14.41 16.78 12 14.37 9.59 15.76 8.2 18.17 10.6 20.59 8.2 22 9.59z" fill="#ef4444" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89 1.13 4.88 3.93 4.88 7.21s-1.99 6.08-4.88 7.21v2.06c3.99-1.2 7-4.89 7-9.27s-3.01-8.07-7-9.27z" />
                </svg>
              )}
            </button>
          </div>

          {/* Scrubber Timeline */}
          <div className="player-timeline-wrapper">
            <div className="timeline-track-bar" onClick={handleTimelineClick}>
              <div className="timeline-progress-fill" style={{ width: `${overallProgress}%` }} />
              {/* Chapter markers at 25%, 50%, 75% */}
              <span className="chapter-marker" style={{ left: "25%" }} />
              <span className="chapter-marker" style={{ left: "50%" }} />
              <span className="chapter-marker" style={{ left: "75%" }} />
            </div>
            <div className="player-time-display">
              <span className="current-time">{formatTime(currentSecs)}</span>
              <span className="time-divider">/</span>
              <span className="total-time">{formatTime(totalSecs)}</span>
            </div>
          </div>

          <div className="controls-right">
            {/* Fullscreen Button */}
            <button 
              type="button" 
              className="control-icon-btn fullscreen-btn" 
              onClick={handleFullscreenToggle} 
              title={isFullscreen ? "退出全屏" : "网页全屏"}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
