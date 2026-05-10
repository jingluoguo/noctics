import { useEffect, useRef } from 'react';

type Particle = {
  ax: number;
  ay: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  row: number;
  col: number;
  jx: number;
  jy: number;
  phase: number;
  rr: number;
};

export function MouseAura() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mediaCoarse = window.matchMedia('(pointer: coarse)');
    const mediaReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaCoarse.matches || mediaReduce.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };

    const particles: Particle[] = [];
    const ringConfig = [8, 14, 20];
    const rebuildParticles = () => {
      particles.length = 0;
      let idx = 0;
      for (let ring = 0; ring < ringConfig.length; ring += 1) {
        const count = ringConfig[ring];
        const radius = 30 + ring * 18;
        for (let c = 0; c < count; c += 1) {
          const t = c / count;
          const angle = Math.PI * 2 * t + ring * 0.18;
          const ax = mouse.x + Math.cos(angle) * radius;
          const ay = mouse.y + Math.sin(angle) * radius;
          particles.push({
            ax,
            ay,
            x: ax,
            y: ay,
            vx: 0,
            vy: 0,
            r: 1.2 + Math.random() * 1.2,
            row: ring,
            col: c,
            jx: (Math.random() - 0.5) * (1.6 + ring * 1.25),
            jy: (Math.random() - 0.5) * (1.6 + ring * 1.25),
            phase: Math.random() * Math.PI * 2,
            rr: (Math.random() - 0.5) * (2.6 + ring * 1.8)
          });
          idx += 1;
        }
      }
    };

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildParticles();
    };

    const onMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let i = 0;
      for (let ring = 0; ring < ringConfig.length; ring += 1) {
        const count = ringConfig[ring];
        const radius = 30 + ring * 18;
        for (let c = 0; c < count; c += 1) {
          const p = particles[i];
          const t = c / count;
          const angle = Math.PI * 2 * t + ring * 0.18;
          const ringRelax = ring / Math.max(1, ringConfig.length - 1);
          const drift =
            Math.sin(time * 0.00055 + p.phase) * (0.25 + ringRelax * 0.95) +
            Math.cos(time * 0.00032 + p.phase * 0.7) * (0.12 + ringRelax * 0.55);
          const targetRadius = radius + p.rr + drift;
          p.ax = mouse.x + Math.cos(angle) * targetRadius + p.jx;
          p.ay = mouse.y + Math.sin(angle) * targetRadius + p.jy;

          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;

          const forceRadius = 50 + ring * 6;
          if (dist < forceRadius) {
            const push = (1 - dist / forceRadius) * (0.35 + ringRelax * 0.55);
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
          }

          const spring = 0.066 - ring * 0.012;
          p.vx += (p.ax - p.x) * spring;
          p.vy += (p.ay - p.y) * spring;

          const damping = 0.79 + ring * 0.04;
          p.vx *= damping;
          p.vy *= damping;

          p.x += p.vx;
          p.y += p.vy;

          const edge = ringConfig.length <= 1 ? 0 : p.row / (ringConfig.length - 1);
          const edgeFade = 1 - edge * 0.75;
          const alpha = 0.16 + edgeFade * 0.42;

          ctx.beginPath();
          ctx.fillStyle = `rgba(160, 225, 255, ${alpha.toFixed(3)})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

          i += 1;
        }
      }

      const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 74);
      halo.addColorStop(0, 'rgba(124, 229, 255, 0.06)');
      halo.addColorStop(1, 'rgba(124, 229, 255, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 74, 0, Math.PI * 2);
      ctx.fill();

      raf = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    raf = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas className="mouse-ion-field" ref={canvasRef} aria-hidden="true" />;
}
