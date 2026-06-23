import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = ['#2f7d4f', '#5cb377', '#f59e0b', '#fbbf24', '#ffffff', '#86efac', '#fcd34d'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
  maxLife: number;
}

function spawnParticles(cx: number, cy: number, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = (Math.random() - 0.5) * Math.PI * 2;
    const speed = 1.4 + Math.random() * 4.2;
    const maxLife = 100 + Math.random() * 80;
    return {
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      w: 5 + Math.random() * 6,
      h: 7 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      life: maxLife,
      maxLife,
    };
  });
}

const LIFE_DECAY = 0.38;
const GRAVITY = 0.065;
const SHOW_MS = 4800;

interface CoachConfettiProps {
  burstKey: number;
  hits?: string[];
}

/** 叠在场景插画上 — 词根命中大弹窗 + 周围撒花 */
export function CoachConfetti({ burstKey, hits = [] }: CoachConfettiProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [show, setShow] = useState(false);
  const [roots, setRoots] = useState<string[]>([]);

  useEffect(() => {
    if (!burstKey || !hits.length) return;
    setRoots(hits);
    setShow(true);
    const hideTimer = window.setTimeout(() => setShow(false), SHOW_MS);
    return () => clearTimeout(hideTimer);
  }, [burstKey, hits]);

  useEffect(() => {
    if (!show || !roots.length) return;

    let cancelled = false;
    const waveTimers: number[] = [];

    const run = () => {
      if (cancelled) return;
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) {
        rafRef.current = requestAnimationFrame(run);
        return;
      }

      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(rect.width, 1);
      const ch = Math.max(rect.height, 1);
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = cw / 2;
      const cy = ch / 2;
      const waveSize = Math.min(50, 14 + roots.length * 4);
      let particles: Particle[] = [];

      const addWave = () => {
        if (!cancelled) particles.push(...spawnParticles(cx, cy, waveSize));
      };
      addWave();
      waveTimers.push(window.setTimeout(addWave, 380));
      waveTimers.push(window.setTimeout(addWave, 760));

      const tick = () => {
        if (cancelled) return;
        ctx.clearRect(0, 0, cw, ch);
        particles = particles.filter((p) => {
          p.life -= LIFE_DECAY;
          if (p.life <= 0) return false;
          p.vy += GRAVITY;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.997;
          p.rot += p.vr;
          const t = p.life / p.maxLife;
          const alpha = t * t;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
          return true;
        });
        if (particles.length > 0) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          ctx.clearRect(0, 0, cw, ch);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(run);
    return () => {
      cancelled = true;
      waveTimers.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [show, burstKey, roots]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 z-20 pointer-events-none overflow-visible rounded-2xl"
      aria-live="polite"
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 w-full h-full" />

      <AnimatePresence>
        {show && roots.length > 0 ? (
          <motion.div
            key={burstKey}
            initial={{ opacity: 0, scale: 0.82, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="absolute inset-0 flex items-center justify-center p-3"
          >
            <div
              className="w-[min(100%,15.5rem)] rounded-3xl border border-white/75 px-5 py-4 text-center backdrop-blur-lg"
              style={{
                background:
                  'linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(236,253,245,0.65) 45%, rgba(254,249,195,0.55) 100%)',
              }}
            >
              <p className="text-body-sm font-bold tracking-[0.2em] text-[#2f7d4f]/80 uppercase">
                Ogden 850
              </p>
              <p className="mt-1 text-xl font-black text-[#2f7d4f] leading-tight">词根命中</p>
              <p className="mt-0.5 text-body-sm text-slate-500">
                本句说出 {roots.length} 个词根
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {roots.map((root) => (
                  <span
                    key={root}
                    className="rounded-full border border-[#2f7d4f]/20 bg-white/80 px-2.5 py-1 text-sm font-bold text-slate-800"
                  >
                    {root}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
