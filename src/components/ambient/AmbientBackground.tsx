import React, { useEffect, useRef, useState } from 'react';

interface Props {
  intensity?: 'calm' | 'warm' | 'magical' | 'celebration';
}

export const AmbientBackground: React.FC<Props> = ({ intensity = 'calm' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showRibbons, setShowRibbons] = useState(false);

  useEffect(() => {
    // Fade in ribbons after a short delay
    const timer = setTimeout(() => setShowRibbons(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle configuration based on intensity
    const particleCounts: Record<string, number> = {
      calm: 18,
      warm: 24,
      magical: 30,
      celebration: 35
    };

    const count = Math.min(particleCounts[intensity] || 18, width > 768 ? 35 : 16);

    interface Particle {
      x: number; y: number;
      size: number;
      speedY: number; speedX: number;
      opacity: number; opacityDir: number;
      hue: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.6,
        speedY: -(Math.random() * 0.25 + 0.05),
        speedX: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * 0.3 + 0.05,
        opacityDir: (Math.random() - 0.5) * 0.006,
        hue: Math.random() > 0.5 ? 350 : 32
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += p.opacityDir;
        if (p.opacity <= 0.04 || p.opacity >= 0.35) p.opacityDir *= -1;
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw soft sparkle
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `hsla(${p.hue}, 55%, 78%, ${p.opacity})`);
        grad.addColorStop(1, `hsla(${p.hue}, 55%, 78%, 0)`);
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Tiny bright center
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 1.2})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <>
      {/* Film grain */}
      <div className="grain-overlay" />

      {/* Morphing gradient blobs */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />

      {/* Subtle floating ribbons */}
      <div className={`ribbon ribbon-1 ${showRibbons ? 'visible' : ''}`} />
      <div className={`ribbon ribbon-2 ${showRibbons ? 'visible' : ''}`} />
      <div className={`ribbon ribbon-3 ${showRibbons ? 'visible' : ''}`} />

      {/* Sparkle particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
    </>
  );
};
