import React, { useEffect, useRef, useState } from 'react';
import { onMood, currentMood, type Mood } from '../../utils/mood';

/**
 * Living backdrop: a slow aurora wash, morphing gradient blobs that parallax
 * to the pointer, drifting sparkle particles, and occasional falling petals /
 * hearts. Reacts to the app "mood" (calm → warm → magical → celebration).
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  opacityDir: number;
}
interface Petal {
  x: number;
  y: number;
  size: number;
  vy: number;
  vx: number;
  rot: number;
  vr: number;
  sway: number;
  swaySpeed: number;
  life: number;
  maxLife: number;
  heart: boolean;
}

// Satin ribbon bow — soft vertical shading (via currentColor stops so each
// placed bow can be tinted through CSS) plus a white sheen highlight.
let bowSeq = 0;
const Bow: React.FC = () => {
  const id = `bowg-${bowSeq++}`;
  return (
    <svg viewBox="0 0 100 78" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* tails */}
      <path d={`M50 40 C44 52 39 66 31 76 C43 69 47 56 50 46 Z`} fill={`url(#${id})`} />
      <path d={`M50 40 C56 52 61 66 69 76 C57 69 53 56 50 46 Z`} fill={`url(#${id})`} />
      {/* loops */}
      <path d="M50 35 C38 14 7 9 5 31 C3 50 38 45 50 39 Z" fill={`url(#${id})`} />
      <path d="M50 35 C62 14 93 9 95 31 C97 50 62 45 50 39 Z" fill={`url(#${id})`} />
      {/* loop sheen */}
      <path d="M46 21 C30 18 15 22 12 31 C22 24 35 23 46 25 Z" fill="rgba(255,255,255,0.5)" />
      <path d="M54 21 C70 18 85 22 88 31 C78 24 65 23 54 25 Z" fill="rgba(255,255,255,0.5)" />
      {/* knot */}
      <ellipse cx="50" cy="37" rx="8" ry="10" fill={`url(#${id})`} />
      <ellipse cx="47.5" cy="34" rx="2.6" ry="4" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
};

const MOOD_TUNE: Record<Mood, { particles: number; petalRate: number }> = {
  calm: { particles: 16, petalRate: 0.0016 },
  warm: { particles: 20, petalRate: 0.0026 },
  magical: { particles: 26, petalRate: 0.0045 },
  celebration: { particles: 30, petalRate: 0.01 },
};

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const moodRef = useRef<Mood>(currentMood());
  const [mood, setMoodState] = useState<Mood>(currentMood());
  const [showRibbons, setShowRibbons] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowRibbons(true), 900);
    const off = onMood((m) => {
      moodRef.current = m;
      setMoodState(m);
    });
    return () => {
      clearTimeout(t);
      off();
    };
  }, []);

  // Pointer parallax → CSS vars on the wrapper (blobs read them).
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia('(pointer: fine)').matches === false) return;
    let queued = false;
    let mx = 0;
    let my = 0;
    const onMoveRaw = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          wrap.style.setProperty('--mx', mx.toFixed(3));
          wrap.style.setProperty('--my', my.toFixed(3));
        });
      }
    };
    window.addEventListener('mousemove', onMoveRaw, { passive: true });
    return () => window.removeEventListener('mousemove', onMoveRaw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Downscale the drawing buffer on mobile for cheaper fill (CSS keeps it full-size).
    const scale = window.innerWidth < 768 ? 0.75 : 1;
    let width = (canvas.width = Math.round(window.innerWidth * scale));
    let height = (canvas.height = Math.round(window.innerHeight * scale));
    const isMobile = window.innerWidth < 768;
    const onResize = () => {
      width = canvas.width = Math.round(window.innerWidth * scale);
      height = canvas.height = Math.round(window.innerHeight * scale);
    };
    window.addEventListener('resize', onResize);

    // ── Pre-rendered sprites (built ONCE) — drawn with drawImage each frame.
    //    This removes all per-particle gradient creation, the main source of jank.
    const SP = 48;
    const sparkle = document.createElement('canvas');
    sparkle.width = sparkle.height = SP;
    {
      const c = sparkle.getContext('2d')!;
      const r = SP / 2;
      const g = c.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.28, 'rgba(250,190,215,0.8)');
      g.addColorStop(1, 'rgba(250,190,215,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(r, r, r, 0, Math.PI * 2);
      c.fill();
    }
    const PET = 64;
    const petalSprite = document.createElement('canvas');
    petalSprite.width = petalSprite.height = PET;
    {
      const c = petalSprite.getContext('2d')!;
      const cx = PET / 2;
      const s = PET * 0.42;
      const g = c.createLinearGradient(cx, cx - s, cx, cx + s);
      g.addColorStop(0, 'rgba(248,186,212,1)');
      g.addColorStop(1, 'rgba(236,148,186,1)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(cx, cx - s);
      c.bezierCurveTo(cx + s * 0.75, cx - s * 0.4, cx + s * 0.55, cx + s * 0.7, cx, cx + s);
      c.bezierCurveTo(cx - s * 0.55, cx + s * 0.7, cx - s * 0.75, cx - s * 0.4, cx, cx - s);
      c.closePath();
      c.fill();
    }

    const capFor = () => Math.round(MOOD_TUNE[moodRef.current].particles * scale);
    const particles: Particle[] = [];
    const seed = (n: number) => {
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.6,
          speedY: -(Math.random() * 0.25 + 0.05),
          speedX: (Math.random() - 0.5) * 0.18,
          opacity: Math.random() * 0.3 + 0.05,
          opacityDir: (Math.random() - 0.5) * 0.006,
        });
      }
    };
    seed(capFor());

    const petals: Petal[] = [];
    const petalCap = isMobile ? 16 : 30;
    const mkPetal = (): Petal => ({
      x: Math.random() * width,
      y: -20,
      size: 7 + Math.random() * 7,
      vy: 0.5 + Math.random() * 0.9,
      vx: (Math.random() - 0.5) * 0.5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
      life: 0,
      maxLife: 100000,
      heart: false,
    });

    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const want = capFor();
      if (particles.length < want) seed(want - particles.length);
      else if (particles.length > want) particles.length = want;

      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += p.opacityDir;
        if (p.opacity <= 0.04 || p.opacity >= 0.35) p.opacityDir *= -1;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        const d = p.size * 5;
        ctx.globalAlpha = p.opacity;
        ctx.drawImage(sparkle, p.x - d / 2, p.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;

      if (Math.random() < MOOD_TUNE[moodRef.current].petalRate * (isMobile ? 0.6 : 1) * 60) {
        if (petals.length < petalCap) petals.push(mkPetal());
      }
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.sway += p.swaySpeed;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.sway) * 0.5;
        p.rot += p.vr;
        if (p.y > height + 30) {
          petals.splice(i, 1);
          continue;
        }
        const alpha = 0.5 * Math.min(1, (height - p.y + 30) / 120) * Math.min(1, p.y / 60 + 0.2);
        const ps = p.size * 2.4;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(petalSprite, -ps / 2, -ps / 2, ps, ps);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
    // re-init when mood changes so density retunes cleanly
  }, [mood]);

  return (
    <div ref={wrapRef} className="ambient-wrap" data-mood={mood} aria-hidden="true">
      <div className="aurora" />
      <div className="grain-overlay" />
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />
      <div className={`ribbon ribbon-1 ${showRibbons ? 'visible' : ''}`} />
      <div className={`ribbon ribbon-2 ${showRibbons ? 'visible' : ''}`} />
      <div className={`ribbon ribbon-3 ${showRibbons ? 'visible' : ''}`} />
      <div className={`bow-decor bow-1 ${showRibbons ? 'visible' : ''}`}><Bow /></div>
      <div className={`bow-decor bow-2 ${showRibbons ? 'visible' : ''}`}><Bow /></div>
      <div className={`bow-decor bow-3 ${showRibbons ? 'visible' : ''}`}><Bow /></div>
      <div className={`bow-decor bow-4 ${showRibbons ? 'visible' : ''}`}><Bow /></div>
      <div className="vignette" />
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 2 }}
      />
    </div>
  );
};
