import { useEffect, useRef, useCallback } from "react";

export default function CyberCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const plasmaRef = useRef<HTMLDivElement>(null);
  const mx = useRef(0);
  const my = useRef(0);
  const tx = useRef(0);
  const ty = useRef(0);
  const ax = useRef(0);
  const ay = useRef(0);
  const vx = useRef(0);
  const vy = useRef(0);
  const hovered = useRef(false);

  const spawnSparks = useCallback((x: number, y: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "cursor-spark";
      s.style.left = x + "px";
      s.style.top = y + "px";
      const a = Math.random() * Math.PI * 2;
      const d = 20 + Math.random() * 40;
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", Math.sin(a) * d + "px");
      s.style.setProperty(
        "--spark-color",
        `hsl(${Math.random() * 30}, 100%, ${55 + Math.random() * 20}%)`
      );
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    const light = lightRef.current;
    const after = afterRef.current;
    const plasma = plasmaRef.current;
    if (!cursor || !trail || !light || !after || !plasma) return;

    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      cursor.style.left = mx.current + "px";
      cursor.style.top = my.current + "px";
      light.style.left = mx.current + "px";
      light.style.top = my.current + "px";

      // velocity for afterimage offset
      vx.current = e.movementX;
      vy.current = e.movementY;
    };

    const animate = () => {
      // trail follow
      tx.current += (mx.current - tx.current) * 0.1;
      ty.current += (my.current - ty.current) * 0.1;
      trail.style.left = tx.current + "px";
      trail.style.top = ty.current + "px";

      // afterimage (slower follow)
      ax.current += (mx.current - ax.current) * 0.06;
      ay.current += (my.current - ay.current) * 0.06;
      after.style.left = ax.current + "px";
      after.style.top = ay.current + "px";

      // plasma ring follow
      const px = tx.current + (mx.current - tx.current) * 0.4;
      const py = ty.current + (my.current - ty.current) * 0.4;
      plasma.style.left = px + "px";
      plasma.style.top = py + "px";

      requestAnimationFrame(animate);
    };
    animate();

    // hover targets
    const targets = document.querySelectorAll(
      "a,button,.service-card,.tech-item,.team-card,.flip-stage,.hud-dot,.project-card,.testi-card,.price-card,.astat,.nav-cta,.btn-primary,.btn-secondary"
    );
    const enter = () => {
      hovered.current = true;
      cursor.classList.add("hover-active");
      trail.style.width = "76px";
      trail.style.height = "76px";
      trail.style.borderColor = "rgba(255,80,80,0.9)";
      after.style.opacity = "0.6";
      plasma.classList.add("plasma-expand");
    };
    const leave = () => {
      hovered.current = false;
      cursor.classList.remove("hover-active");
      trail.style.width = "46px";
      trail.style.height = "46px";
      trail.style.borderColor = "rgba(var(--red-rgb), 0.45)";
      after.style.opacity = "0.25";
      plasma.classList.remove("plasma-expand");
    };
    targets.forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });

    // click
    const onClick = (e: MouseEvent) => {
      cursor.classList.remove("click-pulse");
      void cursor.offsetWidth;
      cursor.classList.add("click-pulse");
      spawnSparks(e.clientX, e.clientY, 12);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onClick);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, [spawnSparks]);

  return (
    <>
      {/* Afterimage (ghost trail) */}
      <div ref={afterRef} id="cursor-after" aria-hidden="true">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M16 28c0-10 7-18 16-18s16 8 16 18c0 6-2 10-5 13v6c0 2-1 3-3 3h-2v-4h-3v4h-6v-4h-3v4h-2c-2 0-3-1-3-3v-6c-3-3-5-7-5-13z"
            fill="rgba(var(--red-rgb), 0.08)"
          />
        </svg>
      </div>

      {/* Plasma ring */}
      <div ref={plasmaRef} id="cursor-plasma" aria-hidden="true" />

      {/* Main skull cursor */}
      <div ref={cursorRef} id="cursor" aria-hidden="true">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M16 28c0-10 7-18 16-18s16 8 16 18c0 6-2 10-5 13v6c0 2-1 3-3 3h-2v-4h-3v4h-6v-4h-3v4h-2c-2 0-3-1-3-3v-6c-3-3-5-7-5-13z"
            fill="rgba(8,0,0,0.55)"
          />
          {/* Eye sockets with inner glow */}
          <ellipse
            className="sk-eye"
            cx="25"
            cy="30"
            rx="4.2"
            ry="5"
            fill="currentColor"
          />
          <ellipse
            className="sk-eye sk-eye-r"
            cx="39"
            cy="30"
            rx="4.2"
            ry="5"
            fill="currentColor"
          />
          {/* Eye glow cores */}
          <ellipse
            className="sk-eye-glow"
            cx="25"
            cy="30"
            rx="2"
            ry="2.5"
            fill="#fff"
            opacity="0.6"
          />
          <ellipse
            className="sk-eye-glow"
            cx="39"
            cy="30"
            rx="2"
            ry="2.5"
            fill="#fff"
            opacity="0.6"
          />
          {/* Nose */}
          <path d="M32 36l-2 5h4z" fill="currentColor" />
          {/* Jaw teeth */}
          <g className="sk-jaw">
            <line x1="26" y1="44" x2="26" y2="50" />
            <line x1="29" y1="44" x2="29" y2="49" />
            <line x1="32" y1="44" x2="32" y2="50" />
            <line x1="35" y1="44" x2="35" y2="49" />
            <line x1="38" y1="44" x2="38" y2="50" />
          </g>
          {/* Cranium cracks for extra detail */}
          <path
            className="sk-crack"
            d="M26 14 l-1 4 l2 3"
            strokeWidth="1"
            opacity="0.4"
          />
          <path
            className="sk-crack"
            d="M38 15 l1 3 l-1 4"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Trail ring */}
      <div ref={trailRef} id="cursor-trail" aria-hidden="true" />

      {/* Cursor glow light */}
      <div ref={lightRef} id="cursor-light" aria-hidden="true" />
    </>
  );
}
