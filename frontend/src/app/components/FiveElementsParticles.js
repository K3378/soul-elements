'use client';

import { useEffect, useRef } from 'react';

// Five Elements colors
const ELEMENTS = [
  { name: 'Wood', color: '#4ADE80', glow: 'rgba(74,222,128,0.3)', particles: 30 },
  { name: 'Fire', color: '#EF4444', glow: 'rgba(239,68,68,0.3)', particles: 25 },
  { name: 'Earth', color: '#C9A84C', glow: 'rgba(201,168,76,0.3)', particles: 35 },
  { name: 'Metal', color: '#E2E8F0', glow: 'rgba(226,232,240,0.2)', particles: 20 },
  { name: 'Water', color: '#3B82F6', glow: 'rgba(59,130,246,0.3)', particles: 30 },
];

export default function FiveElementsParticles({ intensity = 1 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const windRef = useRef({ x: 0, y: 0, target: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resize();

    // Initialize particles
    const particles = [];
    ELEMENTS.forEach((elem, ei) => {
      for (let i = 0; i < elem.particles * intensity; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 2 + Math.random() * 3,
          element: ei,
          color: elem.color,
          glow: elem.glow,
          life: Math.random() * Math.PI * 2,
          lifeSpeed: 0.01 + Math.random() * 0.02,
          opacity: 0.3 + Math.random() * 0.7,
          originX: Math.random() * w,
          originY: Math.random() * h,
          orbitRadius: 20 + Math.random() * 80,
          orbitSpeed: 0.001 + Math.random() * 0.003,
          orbitAngle: Math.random() * Math.PI * 2,
          sizeOsc: 0.5 + Math.random() * 0.5,
        });
      }
    });
    particlesRef.current = particles;

    // Mouse tracking
    function onMouseMove(e) {
      const px = e.clientX;
      const py = e.clientY;
      mouseRef.current.vx = px - mouseRef.current.x;
      mouseRef.current.vy = py - mouseRef.current.y;
      mouseRef.current.x = px;
      mouseRef.current.y = py;
    }
    function onMouseLeave() {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    // Touch support
    function onTouchMove(e) {
      const t = e.touches[0];
      mouseRef.current.vx = t.clientX - mouseRef.current.x;
      mouseRef.current.vy = t.clientY - mouseRef.current.y;
      mouseRef.current.x = t.clientX;
      mouseRef.current.y = t.clientY;
    }
    function onTouchEnd() {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    }
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // Wind simulation
    let windTimer = 0;

    function animate() {
      const W = w;
      const H = h;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mDist = 120;

      // Update wind
      windTimer += 0.005;
      windRef.current.target = Math.sin(windTimer) * 0.3 + Math.sin(windTimer * 0.7) * 0.2;
      windRef.current.x += (windRef.current.target - windRef.current.x) * 0.01;
      windRef.current.y = Math.sin(windTimer * 0.3) * 0.1;

      ctx.clearRect(0, 0, W, H);

      // Update and draw particles
      const p = particlesRef.current;
      const len = p.length;

      // First pass: update positions
      for (let i = 0; i < len; i++) {
        const pt = p[i];
        pt.life += pt.lifeSpeed;

        // Orbit behavior - particles drift around their origin
        pt.orbitAngle += pt.orbitSpeed;
        const targetX = pt.originX + Math.cos(pt.orbitAngle) * pt.orbitRadius;
        const targetY = pt.originY + Math.sin(pt.orbitAngle) * pt.orbitRadius * 0.6;

        // Spring toward orbit target
        pt.vx += (targetX - pt.x) * 0.002;
        pt.vy += (targetY - pt.y) * 0.002;

        // Wind
        pt.vx += windRef.current.x * 0.05;
        pt.vy += windRef.current.y * 0.02;

        // Mouse interaction - attraction/repulsion
        const dx = pt.x - mx;
        const dy = pt.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mDist && dist > 0) {
          const force = (mDist - dist) / mDist;
          const pushX = (dx / dist) * force * 0.8;
          const pushY = (dy / dist) * force * 0.8;
          pt.vx += pushX;
          pt.vy += pushY;
        }

        // Follow mouse gently if close enough
        if (dist < 300 && dist > mDist) {
          const follow = (300 - dist) / 300 * 0.02;
          pt.vx -= (dx / dist) * follow * 0.1;
          pt.vy -= (dy / dist) * follow * 0.1;
        }

        // Velocity damping
        pt.vx *= 0.98;
        pt.vy *= 0.98;

        // Clamp velocity
        const spd = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
        if (spd > 3) {
          pt.vx = (pt.vx / spd) * 3;
          pt.vy = (pt.vy / spd) * 3;
        }

        pt.x += pt.vx;
        pt.y += pt.vy;

        // Wrap around edges with margin
        const margin = 50;
        if (pt.x < -margin) pt.x = W + margin;
        if (pt.x > W + margin) pt.x = -margin;
        if (pt.y < -margin) pt.y = H + margin;
        if (pt.y > H + margin) pt.y = -margin;
      }

      // Second pass: draw connections + particles
      // Connection lines between nearby particles of same or generating elements
      const connDist = 100;
      for (let i = 0; i < len; i++) {
        const pt = p[i];

        // Draw connections to nearby particles
        for (let j = i + 1; j < len; j++) {
          const pt2 = p[j];
          const dx = pt.x - pt2.x;
          const dy = pt.y - pt2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connDist) {
            const alpha = (1 - dist / connDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.strokeStyle = `rgba(201,168,76,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < len; i++) {
        const pt = p[i];
        const sizeMod = 1 + Math.sin(pt.life) * pt.sizeOsc * 0.3;
        const size = pt.size * sizeMod;
        const alpha = pt.opacity * (0.6 + Math.sin(pt.life) * 0.2);

        // Glow
        const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size * 4);
        grad.addColorStop(0, pt.glow);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Inner glow ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = pt.color;
        ctx.globalAlpha = alpha * 0.3;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.8 }}
    />
  );
}
