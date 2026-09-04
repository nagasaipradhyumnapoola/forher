import React, { useEffect, useRef } from 'react';
import { playHover } from '../../utils/audio';

/**
 * Bespoke pointer: an instant inner dot, a springy trailing ring that swells
 * over anything interactive, a soft sparkle trail, and a heart burst on click.
 * Desktop / fine-pointer only — touch devices keep their native behaviour, and
 * reduced-motion users get nothing (native cursor stays).
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  heart: boolean;
  rot: number;
}

export const CursorFX: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const canvas = canvasRef.current;
    if (!dot || !ring || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    document.documentElement.classList.add('cursor-hidden');

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Pre-rendered sparkle sprite (built once) — drawn with drawImage each frame
    // instead of creating a gradient per particle, so the trail stays smooth.
    const SP = 40;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SP;
    {
      const c = sprite.getContext('2d')!;
      const r = SP / 2;
      const g = c.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.3, 'rgba(233,150,190,0.8)');
      g.addColorStop(1, 'rgba(233,150,190,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(r, r, r, 0, Math.PI * 2);
      c.fill();
    }

    const mouse = { x: w / 2, y: h / 2 };
    const ringPos = { x: w / 2, y: h / 2 };
    let hovering = false;
    let wasHovering = false;
    let down = false;
    let visible = false;
    let lastSpawn = 0;
    const particles: Particle[] = [];

    const interactiveSel = 'a,button,[role="button"],input,textarea,select,label,.interactive-card,[data-cursor="hover"]';

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
      const now = performance.now();
      const target = e.target as Element | null;
      hovering = !!(target && target.closest && target.closest(interactiveSel));
      if (hovering && !wasHovering) playHover();
      wasHovering = hovering;
      // sparkle trail (throttled)
      if (now - lastSpawn > 42) {
        lastSpawn = now;
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.15,
          life: 0,
          maxLife: 480 + Math.random() * 340,
          size: 0.8 + Math.random() * 1.6,
          hue: Math.random() > 0.5 ? 338 : 320,
          heart: false,
          rot: 0,
        });
      }
    };

    const burst = (x: number, y: number) => {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
        const sp = 1.2 + Math.random() * 1.8;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0,
          maxLife: 420 + Math.random() * 320,
          size: 1.4 + Math.random() * 1.8,
          hue: Math.random() > 0.5 ? 338 : 320,
          heart: false,
          rot: 0,
        });
      }
    };

    const onDown = () => {
      down = true;
      burst(mouse.x, mouse.y);
    };
    const onUp = () => (down = false);
    const onLeave = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    let raf = 0;
    let prev = performance.now();
    const render = (now: number) => {
      const dt = Math.min(48, now - prev);
      prev = now;

      // dot: instant. ring: spring toward mouse.
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;
      dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%) scale(${down ? 0.6 : 1})`;
      const ringScale = (hovering ? 1.5 : 1) * (down ? 0.82 : 1);
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%) scale(${ringScale})`;
      ring.style.borderColor = hovering ? 'rgba(224,112,154,0.9)' : 'rgba(224,112,154,0.5)';
      ring.style.background = hovering ? 'rgba(224,112,154,0.09)' : 'transparent';

      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.vy -= 0.006 * (dt / 16); // gentle upward drift
        p.vx *= 0.97;
        p.vy *= 0.98;
        const k = 1 - p.life / p.maxLife;
        const alpha = k * 0.6;
        const d = p.size * 5;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x - d / 2, p.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('cursor-hidden');
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9998 }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          border: '1.25px solid rgba(224,112,154,0.5)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          transition: 'opacity 300ms ease, border-color 200ms ease, background 200ms ease',
          willChange: 'transform',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 7px var(--accent-glow)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          transition: 'opacity 300ms ease',
          willChange: 'transform',
        }}
      />
    </>
  );
};
