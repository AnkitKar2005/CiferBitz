import { useEffect, useRef, useCallback, useState } from "react";
import "./Landing.css";
import CanvasLayers from "./CanvasLayers";
import CyberCursor from "./CyberCursor";
import LoadingScreen from "./LoadingScreen";

// ─── Icon helper ───
function Ic({
  d,
  fill,
  stroke,
  extraPaths,
  viewBox = "0 0 24 24",
}: {
  d?: string;
  fill?: string;
  stroke?: boolean;
  extraPaths?: string[];
  viewBox?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width="100%"
      height="100%"
      fill={fill ?? "none"}
      stroke={stroke !== false ? "currentColor" : undefined}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d && <path d={d} />}
      {extraPaths?.map((ep, i) => <path key={i} d={ep} />)}
    </svg>
  );
}

// ─── Counter hook ───
function useCounter(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const iv = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(current);
      if (current >= target) clearInterval(iv);
    }, 20);
    return () => clearInterval(iv);
  }, [active, target]);
  return val;
}



function NavClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = pad(time.getHours());
  const m = pad(time.getMinutes());
  const s = pad(time.getSeconds());
  const day = pad(time.getDate());
  const month = time.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = time.getFullYear();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      letterSpacing: '1px',
      color: 'var(--gray)',
      fontFamily: "'Rajdhani', sans-serif",
      background: 'rgba(var(--bg-rgb), 0.4)',
      border: '1px solid rgba(var(--red-rgb), 0.2)',
      padding: '8px 16px',
      boxShadow: 'inset 0 0 10px rgba(var(--red-rgb), 0.05)',
      clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
      lineHeight: 1
    }}>
      <span style={{ color: 'var(--white)', fontFamily: "'Orbitron', sans-serif" }}>
        {day}&nbsp;<span style={{ color: 'var(--red)' }}>{month}</span>&nbsp;{year}
      </span>
      <span style={{ color: 'var(--red)', opacity: 0.8, margin: '0 12px' }}>//</span>
      <span style={{ color: 'var(--white)', fontFamily: "'Orbitron', sans-serif" }}>
        {h}&nbsp;<span style={{ color: 'var(--red)', opacity: 0.8 }}>:</span>&nbsp;{m}&nbsp;<span style={{ color: 'var(--red)', opacity: 0.8 }}>:</span>&nbsp;<span style={{ color: 'var(--red)' }}>{s}</span>
      </span>
    </div>
  );
}

function StatCard({
  n,
  suffix = "+",
  label,
}: {
  n: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const val = useCounter(n, active);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="astat" ref={ref}>
      <div className="n">{val}{suffix}</div>
      <div className="l">{label}</div>
    </div>
  );
}

function FloatStat({
  n,
  label,
  cls,
}: {
  n: number;
  label: string;
  cls: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const val = useCounter(n, active);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setActive(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div className={`float-stat ${cls}`} ref={ref}>
      <div className="num">{val}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const sectionsRef = useRef<string[]>([
    "hero", "about", "services", "projects", "tech", "contact",
  ]);
  const [activeDot, setActiveDot] = useState(0);
  const [loading, setLoading] = useState(true);

  // ─── navbar scroll effect ───
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const handler = () => {
      nav.classList.toggle("scrolled", window.scrollY > 60);
      let idx = 0;
      sectionsRef.current.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight / 2) idx = i;
      });
      setActiveDot(idx);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ─── scroll reveal ───
  useEffect(() => {
    const els = document.querySelectorAll(".reveal,.reveal-left,.reveal-right");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ─── contact section in-view ───
  useEffect(() => {
    const c = document.getElementById("contact");
    if (!c) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) c.classList.add("in-view"); },
      { threshold: 0.2 }
    );
    obs.observe(c);
    return () => obs.disconnect();
  }, []);

  // ─── 3D tilt on service cards ───
  const tiltRef = useRef<NodeListOf<HTMLElement> | null>(null);
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".service-card");
    tiltRef.current = cards;
    const handlers: Array<{ el: HTMLElement; mm: (e: MouseEvent) => void; ml: () => void }> = [];
    cards.forEach((card) => {
      const mm = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-8px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
      };
      const ml = () => { card.style.transform = ""; };
      card.addEventListener("mousemove", mm);
      card.addEventListener("mouseleave", ml);
      handlers.push({ el: card, mm, ml });
    });
    return () => {
      handlers.forEach(({ el, mm, ml }) => {
        el.removeEventListener("mousemove", mm);
        el.removeEventListener("mouseleave", ml);
      });
    };
  }, []);

  // ─── flip card 3D tilt ───
  const flipStageRef = useRef<HTMLDivElement>(null);
  const flipCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = flipStageRef.current;
    const card = flipCardRef.current;
    if (!stage || !card) return;
    const front = card.querySelector<HTMLElement>(".flip-front");
    const back = card.querySelector<HTMLElement>(".flip-back");

    const mm = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rotX = (0.5 - y) * 14;
      const rotY = (x - 0.5) * 18 + 180;
      card.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      const mx = (x * 100).toFixed(1) + "%";
      const my = (y * 100).toFixed(1) + "%";
      [front, back].forEach((f) => {
        if (f) { f.style.setProperty("--mx", mx); f.style.setProperty("--my", my); }
      });
    };
    const ml = () => {
      card.style.transform = "";
      [front, back].forEach((f) => {
        if (f) { f.style.removeProperty("--mx"); f.style.removeProperty("--my"); }
      });
    };
    stage.addEventListener("mousemove", mm);
    stage.addEventListener("mouseleave", ml);
    return () => {
      stage.removeEventListener("mousemove", mm);
      stage.removeEventListener("mouseleave", ml);
    };
  }, []);

  // ─── contact particles ───
  useEffect(() => {
    const pc = document.getElementById("contactParticles");
    if (!pc) return;
    for (let i = 0; i < 22; i++) {
      const sp = document.createElement("span");
      const size = (Math.random() * 3 + 1.5).toFixed(1);
      sp.style.width = sp.style.height = size + "px";
      sp.style.left = Math.random() * 100 + "%";
      sp.style.bottom = (-Math.random() * 30) + "%";
      sp.style.animationDuration = (8 + Math.random() * 10) + "s";
      sp.style.animationDelay = (Math.random() * 8) + "s";
      sp.style.opacity = (0.3 + Math.random() * 0.5).toFixed(2);
      pc.appendChild(sp);
    }
    return () => { if (pc) pc.innerHTML = ""; };
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="landing-body">
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <CyberCursor />

      {/* Canvas backgrounds */}
      <CanvasLayers />

      {/* Overlays */}
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="glitch-overlay" aria-hidden="true" />

      {/* HUD corners */}
      <div className="hud-corner hud-tl" aria-hidden="true" />
      <div className="hud-corner hud-tr" aria-hidden="true" />
      <div className="hud-corner hud-bl" aria-hidden="true" />
      <div className="hud-corner hud-br" aria-hidden="true" />

      {/* Side HUD dots */}
      <div className="side-hud" aria-hidden="true">
        {sectionsRef.current.map((id, i) => (
          <div
            key={id}
            className={`hud-dot${activeDot === i ? " active" : ""}`}
            onClick={() => scrollTo(id)}
          >
            <span className="hud-tooltip">{id.charAt(0).toUpperCase() + id.slice(1)}</span>
          </div>
        ))}
      </div>

      {/* Energy bar */}
      <div className="energy-bar" aria-hidden="true">
        <div className="energy-label">SYS</div>
        <div className="energy-track"><div className="energy-fill" /></div>
        <div className="energy-label">PWR</div>
      </div>

      {/* ═════ CONTENT ═════ */}
      <div id="content">

        {/* ─── NAVBAR ─── */}
        <nav ref={navRef} id="navbar" role="navigation" aria-label="Main navigation">
          <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); scrollTo("hero"); }}>
            <span className="logo-bracket">[</span>CIFER<span>BITZ</span><span className="logo-bracket">]</span>
          </a>
          <ul className="nav-links">
            {[["about", "About"], ["services", "Services"], ["projects", "Work"], ["tech", "Stack"], ["pricing", "Pricing"], ["contact", "Contact"]].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>{label}</a>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <NavClock />
            <a className="nav-cta" href="#contact" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>
              <span>HIRE US</span>
            </a>
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <section id="hero" aria-labelledby="hero-title">
          <div className="hero-scan" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-tag"><div className="dot" aria-hidden="true" /> PREMIUM ENGINEERING STUDIO</div>
              <h1 className="hero-headline" id="hero-title">
                <span className="line"><span>Engineering</span></span>
                <span className="line"><span>Exceptional <span className="accent">Digital</span></span></span>
                <span className="line"><span>Experiences.</span></span>
              </h1>
              <p className="hero-sub">CiferBitz partners with ambitious companies to build scalable enterprise software, AI integrations, and high-performance web applications.</p>
              <div className="hero-btns">
                <a className="btn-primary" href="#contact" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>START A PROJECT</a>
                <a className="btn-secondary" href="#services" onClick={(e) => { e.preventDefault(); scrollTo("services"); }}>OUR SERVICES</a>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="holo-frame" />
              <div className="orbit-ring orbit-ring-1"><div className="orbit-ring-dot" /></div>
              <div className="orbit-ring orbit-ring-2"><div className="orbit-ring-dot" /></div>
              <div className="orbit-ring orbit-ring-3"><div className="orbit-ring-dot" /></div>
              <div className="logo-center">
                <div className="logo-text">CIFER<span className="r">BITZ</span></div>
                <div className="logo-sub-text">Software Engineering Studio</div>
              </div>
              <FloatStat n={200} label="Projects Done" cls="fs-1" />
              <FloatStat n={98} label="Client Satisfaction %" cls="fs-2" />
              <FloatStat n={50} label="Team Members" cls="fs-3" />
            </div>
          </div>
        </section>

        {/* ─── TICKER ─── */}
        <div className="ticker-wrap" aria-hidden="true">
          <div className="ticker-track">
            {["Software Development", "Web Development", "AI Solutions", "Mobile Applications", "SaaS Platforms", "Automation Systems", "UI/UX Design", "Cloud Infrastructure", "CiferBitz © 2024"].flatMap((t, i) => [
              <span key={`a${i}`}>{t}</span>,
              <span key={`s${i}`} className="sep">///</span>,
            ])}
            {["Software Development", "Web Development", "AI Solutions", "Mobile Applications", "SaaS Platforms", "Automation Systems", "UI/UX Design", "Cloud Infrastructure", "CiferBitz © 2024"].flatMap((t, i) => [
              <span key={`b${i}`}>{t}</span>,
              <span key={`t${i}`} className="sep">///</span>,
            ])}
          </div>
        </div>

        {/* ─── ABOUT ─── */}
        <section id="about" aria-labelledby="about-title">
          <div className="section-header reveal">
            <div className="section-tag">// ABOUT US</div>
            <h2 className="section-title" id="about-title">Your Engineering <span className="accent">Partner</span></h2>
            <div className="section-line" />
          </div>
          <div className="about-grid">
            <div className="about-text reveal-left">
              <p>CiferBitz is a <strong>specialized software engineering studio</strong> combining modern technology with thoughtful design. We don't just write code — we build comprehensive digital solutions tailored to your business needs.</p>
              <p>From complex enterprise systems to scalable SaaS platforms, our team of <strong>experienced engineers and designers</strong> deliver high-quality solutions that drive tangible business growth.</p>
              <p>Every line of code we write and interface we design is engineered with one purpose: to <strong>ensure your product is robust</strong>, scalable, and built for long-term success.</p>
              <div className="about-stats">
                <StatCard n={8} label="Years in Operation" />
                <StatCard n={200} label="Projects Delivered" />
                <StatCard n={50} label="Team Members" />
                <StatCard n={40} label="Countries Served" />
              </div>
            </div>
            <div className="about-visual reveal-right" aria-hidden="true">
              <div className="tech-circle-wrap" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                <div className="tech-orbit orbit-a" style={{ position: "relative" }}>
                  <div className="orbit-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="1" /><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" /><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" /></svg>
                  </div>
                  <div className="orbit-icon orbit-icon-b">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
                  </div>
                  <div className="tech-orbit orbit-b">
                    <div className="orbit-icon" style={{ left: "calc(50% - 20px)" }}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></svg>
                    </div>
                    <div className="core-badge" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>CIFER<br />BITZ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SERVICES ─── */}
        <section id="services" aria-labelledby="services-title">
          <div className="section-header reveal">
            <div className="section-tag">// SERVICES</div>
            <h2 className="section-title" id="services-title">Our <span className="accent">Expertise</span></h2>
            <div className="section-line" />
          </div>
          <div className="services-grid">
            {[
              { n: "01", title: "Software Development", desc: "Custom enterprise software engineered for scalability, performance, and reliability.", tags: ["Enterprise", "Scalable", "API"], icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg> },
              { n: "02", title: "Web Development", desc: "High-performance web applications built with modern frameworks and intuitive user experiences.", tags: ["Next.js", "React", "PWA"], icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> },
              { n: "03", title: "Mobile Applications", desc: "Cross-platform mobile applications that deliver native-like performance and seamless usability.", tags: ["iOS", "Android", "React Native"], icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg> },
              { n: "04", title: "AI & Automation", desc: "Practical AI and machine learning solutions to automate workflows and provide data-driven insights.", tags: ["GPT", "ML", "LLM"], icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></svg> },
              { n: "05", title: "SaaS Platforms", desc: "End-to-end SaaS platform development, taking your product from initial MVP to enterprise scale.", tags: ["Multi-tenant", "Cloud", "SaaS"], icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg> },
              { n: "06", title: "UI/UX Design Systems", desc: "Comprehensive design systems and user interfaces that ensure consistent and engaging brand experiences.", tags: ["Figma", "Design System", "UX"], icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg> },
            ].map((s, i) => (
              <div key={s.n} className="service-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="sc-num">{s.n}</div>
                <div className="sc-icon">{s.icon}</div>
                <div className="sc-title">{s.title}</div>
                <p className="sc-desc">{s.desc}</p>
                <div className="sc-tags">{s.tags.map(t => <span key={t} className="sc-tag">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PROJECTS ─── */}
        <section id="projects" aria-labelledby="projects-title">
          <div className="section-header reveal">
            <div className="section-tag">// PORTFOLIO</div>
            <h2 className="section-title" id="projects-title">Selected <span className="accent">Work</span></h2>
            <div className="section-line" />
          </div>
          <div className="projects-grid">
            {[
              { tag: "WEB / SAAS", title: "DineSmart — QR Ordering System", desc: "Full-stack contactless ordering platform with real-time tracking, admin dashboards, and live menu control.", tech: ["React", "Node.js", "SQL", "REST APIs"], github: "https://github.com/CiferBitz/Dine_Smart" },
              { tag: "AI / ML", title: "RL Mini Game Environment", desc: "Custom reinforcement learning environment simulating agent interactions using Q-Learning and policy gradients.", tech: ["Python", "Gymnasium", "Stable-Baselines3", "PyTorch"], github: "https://github.com/CiferBitz/rl-mini-game-env" },
              { tag: "AI / VISION", title: "Text Mining & Translation System", desc: "Dual-platform application utilizing a 7-stage automated OCR pipeline to achieve the high accuracy required for reliable multi-engine text extraction and seamless translation.", tech: ["Flask", "Tkinter", "Tesseract", "EasyOCR"], github: "https://github.com/CiferBitz/OCR" },
              { tag: "AI / APP", title: "ChatBot — Assistant", desc: "Modern dark-themed chatbot GUI built with Python, supporting multiple LLM providers and web search integration.", tech: ["Python", "Tkinter", "LLMs", "DuckDuckGo"], github: "https://github.com/CiferBitz/ChatBot" },
            ].map((p, i) => (
              <a href={p.github} target="_blank" rel="noopener noreferrer" key={p.tag} className="project-card reveal" style={{ transitionDelay: `${i * 0.1}s`, textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="project-thumb">
                  <div className="thumb-bg" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></svg>
                  </div>
                  <div className="project-tag-overlay">{p.tag}</div>
                </div>
                <div className="project-body">
                  <div className="project-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {p.title}
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </div>
                  <p className="project-desc">{p.desc}</p>
                  <div className="project-tech">{p.tech.map((t, ti) => <span key={ti} className="pt">{t}{ti < p.tech.length - 1 ? " •" : ""}</span>)}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ─── TECH STACK ─── */}
        <section id="tech" aria-labelledby="tech-title">
          <div className="section-header reveal">
            <div className="section-tag">// TECHNOLOGY</div>
            <h2 className="section-title" id="tech-title">Technology <span className="accent">Stack</span></h2>
            <div className="section-line" />
          </div>
          <div className="tech-grid">
            {[
              { name: "React", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="1" /><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" /><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" /></svg> },
              { name: "Next.js", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="m12 2 10 18H2Z" /></svg> },
              { name: "Node.js", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="1" /><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" /><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" /></svg> },
              { name: "TypeScript", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M11 3 8 9l4 13 4-13-3-6M2 9h20" /></svg> },
              { name: "Tailwind", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg> },
              { name: "MongoDB", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.8.66c.21 7.4-3 9.81-9.84 9.84-3.04.05-7.16 0-7.16 0L11 20Z" /></svg> },
              { name: "Firebase", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg> },
              { name: "AI APIs", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></svg> },
              { name: "AWS Cloud", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg> },
              { name: "Docker", icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6M12 10v4M12 2v3" /></svg> },
            ].map((t, i) => (
              <div key={t.name} className="tech-item reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <div className="tech-icon">{t.icon}</div>
                <div className="tech-name">{t.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section id="testimonials" aria-labelledby="testi-title">
          <div className="section-header reveal">
            <div className="section-tag">// TESTIMONIALS</div>
            <h2 className="section-title" id="testi-title">Client <span className="accent">Feedback</span></h2>
            <div className="section-line" />
          </div>
          <div className="testi-grid">
            {[
              { initials: "AK", name: "ALEX KUMAR", role: "CTO, NeuralVentures", text: "CiferBitz delivered an exceptional platform that exceeded our expectations. The custom AI integration has significantly streamlined our weekly operations." },
              { initials: "SM", name: "SARAH MILLS", role: "Founder, HyperScale", text: "A highly professional and technically proficient team. They delivered a robust, scalable product well within our critical timelines." },
              { initials: "RJ", name: "RYAN JONES", role: "CEO, DataForge Inc.", text: "Our engagement metrics improved significantly after CiferBitz rebuilt our web platform. The performance improvements and thoughtful UX redesign were excellent." },
            ].map((t, i) => (
              <div key={t.initials} className="testi-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="stars" aria-label="5 stars">★★★★★</div>
                <div className="testi-quote" aria-hidden="true">"</div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-author">
                  <div className="testi-avatar" aria-hidden="true">{t.initials}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section id="pricing" aria-labelledby="pricing-title">
          <div className="section-header reveal">
            <div className="section-tag">// PRICING</div>
            <h2 className="section-title" id="pricing-title">Pricing <span className="accent">Plans</span></h2>
            <div className="section-line" />
          </div>
          <div className="pricing-grid">
            <div className="price-card reveal">
              <div className="price-tier">Starter</div>
              <div className="price-amount"><span className="currency">₹</span><span className="amount">15,000</span><span className="period">/project</span></div>
              <p className="price-desc">Perfect for startups and MVPs needing a fast, polished digital presence.</p>
              <div className="price-divider" />
              <ul className="price-features">
                <li>Landing Page + Web App</li><li>Mobile Responsive Design</li><li>Basic API Integration</li>
                <li>3 Revision Rounds</li><li>30-Day Support</li>
                <li className="dim">AI/ML Features</li><li className="dim">Custom Backend</li>
              </ul>
              <a className="btn-secondary" href="#contact" style={{ display: "block", textAlign: "center" }} onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>GET STARTED</a>
            </div>
            <div className="price-card featured reveal" style={{ transitionDelay: "0.1s" }}>
              <div className="price-badge">MOST POPULAR</div>
              <div className="price-tier">Professional</div>
              <div className="price-amount"><span className="currency">₹</span><span className="amount">75,000</span><span className="period">/project</span></div>
              <p className="price-desc">For companies ready to build serious digital products that scale.</p>
              <div className="price-divider" />
              <ul className="price-features">
                <li>Full-Stack Web Application</li><li>Mobile App (iOS + Android)</li><li>Custom Backend + Database</li>
                <li>AI Feature Integration</li><li>Admin Dashboard</li><li>Unlimited Revisions</li><li>90-Day Premium Support</li>
              </ul>
              <a className="btn-primary" href="#contact" style={{ display: "block", textAlign: "center" }} onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>LAUNCH NOW</a>
            </div>
            <div className="price-card reveal" style={{ transitionDelay: "0.2s" }}>
              <div className="price-tier">Enterprise</div>
              <div className="price-amount"><span className="currency">₹</span><span className="amount">2L+</span><span className="period">/contract</span></div>
              <p className="price-desc">Full-scale digital transformation for enterprise clients with complex needs.</p>
              <div className="price-divider" />
              <ul className="price-features">
                <li>Complete Product Ecosystem</li><li>Advanced AI/ML Systems</li><li>SaaS Platform Architecture</li>
                <li>Cloud Infrastructure</li><li>Dedicated Team Allocation</li><li>Automation Pipelines</li><li>365-Day Support Contract</li>
              </ul>
              <a className="btn-secondary" href="#contact" style={{ display: "block", textAlign: "center" }} onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>LET'S TALK</a>
            </div>
          </div>
        </section>

        {/* ─── TEAM ─── */}
        <section id="team" aria-labelledby="team-title">
          <div className="section-header reveal">
            <div className="section-tag">// THE TEAM</div>
            <h2 className="section-title" id="team-title">Leadership <span className="accent">Team</span></h2>
            <div className="section-line" />
          </div>
          <div className="team-grid">
            {[
              { initials: "AK", name: "ANKIT KAR", role: "Founder and CEO", bio: "Leading CiferBitz with a vision to build scalable enterprise software and cutting-edge digital experiences." },
              { initials: "SB", name: "SUBHRAKANTA BEHERA", role: "Founder", bio: "Full-stack developer with a deep interest in AI/ML, building scalable web applications and intelligent systems." },
            ].map((m, i) => (
              <div key={m.initials} className="team-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="team-avatar" aria-hidden="true">{m.initials}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <p className="team-bio">{m.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section id="contact" aria-labelledby="contact-title">
          <div className="contact-aurora" aria-hidden="true" />
          <div className="contact-mesh" aria-hidden="true" />
          <div className="contact-particles" id="contactParticles" aria-hidden="true" />
          <div className="section-header reveal">
            <div className="section-tag">// CONTACT</div>
            <h2 className="section-title" id="contact-title">Get in <span className="accent">Touch</span></h2>
            <div className="section-line" />
          </div>
          <div className="contact-wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "48px", maxWidth: "1100px", margin: "0 auto" }}>
            <div className="contact-info reveal-left reveal-stagger">
              <h3 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.4rem", fontWeight: 900, marginBottom: "20px" }}>
                Ready to Start<br /><span style={{ color: "var(--red)" }}>Your Project?</span>
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--gray)", lineHeight: 1.8, marginBottom: "32px" }}>Whether you have a fully formed idea or just an initial concept, CiferBitz partners with you to build high-quality software solutions. Hover the card to flip it and reach out to our team.</p>
              {[
                { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 5L2 7" /></svg>, label: "Digital Channel", val: "ciferbitz@gmail.com" },
                { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>, label: "Office Location", val: "Bhubaneswar, Odisha, India" },
                { icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>, label: "Response Time", val: "Within 24 Hours" },
              ].map((d, i) => (
                <div key={i} className="contact-detail" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 0", borderBottom: "1px solid rgba(var(--red-rgb), 0.08)" }}>
                  <div className="icon" style={{ width: 44, height: 44, borderRadius: 8, background: "linear-gradient(135deg,rgba(var(--red-rgb), .18),rgba(122,0,0,.08))", border: "1px solid rgba(var(--red-rgb), .32)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{d.icon}</div>
                  <div><div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.55rem", letterSpacing: "3px", color: "var(--red)", textTransform: "uppercase" }}>{d.label}</div><div style={{ fontSize: "0.9rem", color: "var(--white)", marginTop: 3 }}>{d.val}</div></div>
                </div>
              ))}
            </div>
            <div className="reveal-right">
              <div className="flip-stage" id="flipStage" ref={flipStageRef}>
                <div className="flip-card" id="flipCard" ref={flipCardRef}>
                  {/* FRONT */}
                  <div className="flip-face flip-front">
                    <div>
                      <div className="fc-brand">
                        <div className="mark" style={{ padding: '4px' }}>
                          <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }} />
                        </div>
                        <div className="name">CIFER<span>BITZ</span></div>
                      </div>
                      <div style={{ marginTop: 36 }}>
                        <div className="fc-tag">// LET'S TALK</div>
                        <div className="fc-title">Engineering <span className="accent">Tomorrow</span>, Together.</div>
                        <div className="fc-sub">Drop a signal — strategy, scope, or a single sentence. We answer within 24 hours.</div>
                      </div>
                    </div>
                    <div className="fc-hint">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                      HOVER TO FLIP — REACH US
                    </div>
                  </div>
                  {/* BACK */}
                  <div className="flip-face flip-back">
                    <div>
                      <div className="fc-tag">// DIRECT CHANNELS</div>
                      <div className="fc-list" style={{ marginTop: 18 }}>
                        {[
                          { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 5L2 7" /></svg>, label: "Email", val: "ciferbitz@gmail.com", href: "mailto:ciferbitz@gmail.com" },
                          { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>, label: "Phone", val: "+91 8658809082 / 9692758949", href: "tel:+918658809082" },
                          { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>, label: "Location", val: "Bhubaneswar, Odisha, India", href: "https://maps.google.com/?q=Bhubaneswar,Odisha,India" },
                        ].map((r, i) => (
                          <a key={i} href={r.href} target={r.label === "Location" ? "_blank" : undefined} rel="noopener noreferrer" className="fc-row" style={{ textDecoration: 'none' }}>
                            <div className="ico">{r.icon}</div>
                            <div><div className="lbl">{r.label}</div><div className="val">{r.val}</div></div>
                          </a>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="fc-social" style={{ marginBottom: 16 }}>
                        {[
                          { label: "LinkedIn", href: "https://www.linkedin.com/company/ciferbitz/about/", icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> },
                          { label: "GitHub", href: "https://github.com/CiferBitz", icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /></svg> },
                        ].map((s) => (
                          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>{s.icon}</a>
                        ))}
                      </div>
                      <div className="fc-cta">
                        <a href="mailto:ciferbitz@gmail.com" className="pri">Get in Touch</a>
                        <a href="https://www.linkedin.com/company/ciferbitz/about/" target="_blank" rel="noopener noreferrer" className="sec">Book a Call</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer>
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">CIFER<span>BITZ</span></div>
              <p>Engineering the digital frontier. Building tomorrow's products today. Futuristic by design, powerful by engineering.</p>
              <div className="social-row">
                {[
                  { label: "LinkedIn", href: "https://www.linkedin.com/company/ciferbitz/about/", icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> },
                  { label: "GitHub", href: "https://github.com/CiferBitz", icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /></svg> },
                ].map((s) => (
                  <a key={s.label} className="social-btn" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>{s.icon}</a>
                ))}
              </div>
            </div>
            <div className="footer-col">
              <div className="section-tag" style={{ marginBottom: "20px", fontSize: "0.55rem", padding: "4px 12px" }}>// SERVICES</div>
              <ul>{["Software Dev", "Web Dev", "Mobile Apps", "AI Solutions", "SaaS Platforms", "UI/UX Design"].map(l => <li key={l}><a href="#" onClick={(e) => e.preventDefault()}>{l}</a></li>)}</ul>
            </div>
            <div className="footer-col">
              <div className="section-tag" style={{ marginBottom: "20px", fontSize: "0.55rem", padding: "4px 12px" }}>// COMPANY</div>
              <ul>{["About Us", "Our Work", "Team", "Blog", "Careers", "Contact"].map(l => <li key={l}><a href="#" onClick={(e) => e.preventDefault()}>{l}</a></li>)}</ul>
            </div>
            <div className="footer-col">
              <div className="section-tag" style={{ marginBottom: "20px", fontSize: "0.55rem", padding: "4px 12px" }}>// LEGAL</div>
              <ul>{["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"].map(l => <li key={l}><a href="#" onClick={(e) => e.preventDefault()}>{l}</a></li>)}</ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 <span className="ft-accent">CiferBitz</span>. All rights reserved. Engineered in the future.</p>
            <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.6rem", letterSpacing: "3px", color: "rgba(143,143,143,0.3)" }}>SYS-v4.2.1 // ONLINE</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
