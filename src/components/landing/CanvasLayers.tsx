import { useEffect, useRef } from "react";

export default function CanvasLayers() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const hexRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<HTMLCanvasElement>(null);

  // ─── BG CANVAS — moving grid + energy pulses ───
  useEffect(() => {
    const c = bgRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let animId: number;

    function resize() {
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    function draw() {
      if (!c || !ctx) return;
      const redRgb = document.body.classList.contains("light-mode") ? "211, 47, 47" : "255, 30, 30";
      ctx.clearRect(0, 0, c.width, c.height);
      // moving grid
      const gs = 60;
      const off = (t * 0.3) % gs;
      ctx.strokeStyle = `rgba(${redRgb}, 0.04)`;
      ctx.lineWidth = 1;
      for (let x = off; x < c.width + gs; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, c.height);
        ctx.stroke();
      }
      for (let y = off; y < c.height + gs; y += gs) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(c.width, y);
        ctx.stroke();
      }
      // perspective grid lines emanating from bottom center
      const cx = c.width / 2,
        cy = c.height;
      ctx.strokeStyle = `rgba(${redRgb}, 0.025)`;
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 80, cy);
        ctx.lineTo(cx + i * 800, -200);
        ctx.stroke();
      }
      // horizontal perspective lines
      for (let i = 0; i < 10; i++) {
        const y2 = c.height - i * i * 8 - ((t * 20) % c.height);
        if (y2 > 0 && y2 < c.height) {
          ctx.beginPath();
          ctx.moveTo(0, y2);
          ctx.lineTo(c.width, y2);
          ctx.stroke();
        }
      }
      // ambient glow blobs
      const positions = [
        { x: 0, y: 0.8 },
        { x: 1, y: 0.2 },
        { x: 0.5, y: 0.5 },
      ];
      positions.forEach((p, i) => {
        const gx = c.width * p.x,
          gy = c.height * p.y;
        const r = 300 + Math.sin(t * 0.5 + i) * 80;
        const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
        gr.addColorStop(
          0,
          `rgba(${redRgb}, ${0.025 + Math.sin(t * 0.7 + i) * 0.01})`
        );
        gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(gx, gy, r, 0, Math.PI * 2);
        ctx.fill();
      });
      t += 0.016;
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // ─── HEX CANVAS — animated honeycomb ───
  useEffect(() => {
    const c = hexRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let animId: number;

    function resize() {
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function hex(
      x: number,
      y: number,
      r: number,
      t: number,
      idx: number
    ) {
      if (!ctx) return;
      const redRgb = document.body.classList.contains("light-mode") ? "211, 47, 47" : "255, 30, 30";
      const phase = t * 0.6 + idx * 0.3;
      const alpha = 0.03 + Math.sin(phase) * 0.025;
      if (alpha <= 0) return;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + r * Math.cos(a);
        const py = y + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${redRgb}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      if (Math.sin(phase * 1.7) > 0.85) {
        ctx.fillStyle = `rgba(${redRgb}, ${alpha * 0.3})`;
        ctx.fill();
      }
    }

    let t = 0;
    function draw() {
      if (!c || !ctx) return;
      const redRgb = document.body.classList.contains("light-mode") ? "211, 47, 47" : "255, 30, 30";
      ctx.clearRect(0, 0, c.width, c.height);
      const r = 36;
      const w = r * Math.sqrt(3);
      const h = r * 1.5;
      let idx = 0;
      for (let row = -1; row < c.height / h + 2; row++) {
        for (let col = -1; col < c.width / w + 2; col++) {
          const x = col * w + (row % 2) * (w / 2);
          const y = row * h;
          const dy = (t * 8) % (h * 2);
          hex(x, y + dy, r, t, idx);
          idx++;
        }
      }
      t += 0.016;
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // ─── PARTICLE CANVAS — flying particles & streaks ───
  useEffect(() => {
    const c = particleRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let animId: number;

    function resize() {
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      size: number;
      type: "cross" | "dot";
    };
    type Streak = {
      x: number;
      y: number;
      w: number;
      h: number;
      vy: number;
      life: number;
      decay: number;
    };

    function mkParticle(): Particle {
      const side = Math.floor(Math.random() * 4);
      let x = 0,
        y = 0,
        vx = 0,
        vy = 0;
      if (!c) return { x, y, vx, vy, life: 1, decay: 0.003, size: 1, type: "dot" };
      if (side === 0) {
        x = Math.random() * c.width;
        y = -5;
        vx = (Math.random() - 0.5) * 0.5;
        vy = Math.random() * 1 + 0.3;
      } else if (side === 1) {
        x = c.width + 5;
        y = Math.random() * c.height;
        vx = -(Math.random() * 1 + 0.3);
        vy = (Math.random() - 0.5) * 0.5;
      } else if (side === 2) {
        x = Math.random() * c.width;
        y = c.height + 5;
        vx = (Math.random() - 0.5) * 0.5;
        vy = -(Math.random() * 1 + 0.3);
      } else {
        x = -5;
        y = Math.random() * c.height;
        vx = Math.random() * 1 + 0.3;
        vy = (Math.random() - 0.5) * 0.5;
      }
      return {
        x,
        y,
        vx,
        vy,
        life: 1,
        decay: Math.random() * 0.003 + 0.002,
        size: Math.random() * 2 + 0.5,
        type: Math.random() > 0.7 ? "cross" : "dot",
      };
    }

    function mkStreak(): Streak {
      return {
        x: c ? Math.random() * c.width : 0,
        y: -20,
        w: Math.random() * 1.5 + 0.3,
        h: Math.random() * 120 + 40,
        vy: Math.random() * 8 + 4,
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
      };
    }

    const particles: Particle[] = [];
    const streaks: Streak[] = [];

    for (let i = 0; i < 80; i++) particles.push(mkParticle());
    for (let i = 0; i < 12; i++) {
      const s = mkStreak();
      s.y = Math.random() * (c?.height ?? 0);
      streaks.push(s);
    }

    let mousex = (c?.width ?? 0) / 2;
    let mousey = (c?.height ?? 0) / 2;
    const onMove = (e: MouseEvent) => {
      mousex = e.clientX;
      mousey = e.clientY;
    };
    document.addEventListener("mousemove", onMove);

    function draw() {
      if (!c || !ctx) return;
      const redRgb = document.body.classList.contains("light-mode") ? "211, 47, 47" : "255, 30, 30";
      ctx.clearRect(0, 0, c.width, c.height);

      // streaks
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.h);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.5, `rgba(${redRgb}, ${s.life * 0.5})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(s.x - s.w / 2, s.y, s.w, s.h);
        s.y += s.vy;
        s.life -= s.decay;
        if (s.y > c.height || s.life <= 0) streaks[i] = mkStreak();
      }

      // floating particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        ctx.globalAlpha = p.life;
        if (p.type === "cross") {
          ctx.strokeStyle = `rgba(${redRgb}, ${p.life * 0.8})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 2, p.y);
          ctx.lineTo(p.x + p.size * 2, p.y);
          ctx.moveTo(p.x, p.y - p.size * 2);
          ctx.lineTo(p.x, p.y + p.size * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${redRgb}, ${p.life})`;
          ctx.shadowColor = `rgba(${redRgb}, 0.8)`;
          ctx.shadowBlur = p.size * 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (
          p.life <= 0 ||
          p.x < -10 ||
          p.x > c.width + 10 ||
          p.y < -10 ||
          p.y > c.height + 10
        )
          particles[i] = mkParticle();
      }
      ctx.globalAlpha = 1;

      // mouse glow particles
      for (let i = 0; i < 2; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 80 + 10;
        const mx2 = mousex + Math.cos(a) * r;
        const my2 = mousey + Math.sin(a) * r;
        ctx.fillStyle = `rgba(${redRgb}, 0.15)`;
        ctx.shadowColor = `rgba(${redRgb}, 0.6)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(mx2, my2, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <canvas id="bg-canvas" ref={bgRef} aria-hidden="true" />
      <canvas id="hex-canvas" ref={hexRef} aria-hidden="true" />
      <canvas id="particle-canvas" ref={particleRef} aria-hidden="true" />
    </>
  );
}
