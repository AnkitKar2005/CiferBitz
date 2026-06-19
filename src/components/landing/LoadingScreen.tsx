import { useEffect, useState, useRef } from "react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "load" | "done">("boot");
  const [lines, setLines] = useState<string[]>([]);
  const termRef = useRef<HTMLDivElement>(null);

  // Boot sequence text
  useEffect(() => {
    const bootLines = [
      "[SYS] Initializing CiferBitz Core v4.2.1...",
      "[SYS] Loading neural interface...",
      "[NET] Establishing encrypted connection...",
      "[GPU] Rendering engine: ONLINE",
      "[AI]  Intelligence modules: ACTIVE",
      "[SYS] All systems nominal.",
      "[SYS] Welcome to the future.",
    ];

    let i = 0;
    const iv = setInterval(() => {
      if (i >= bootLines.length) {
        clearInterval(iv);
        setPhase("load");
        return;
      }
      const currentLine = bootLines[i];
      setLines((prev) => [...prev, currentLine]);
      i++;
    }, 180);

    return () => clearInterval(iv);
  }, []);

  // Progress bar
  useEffect(() => {
    if (phase !== "load") return;
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setPhase("done");
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 50);
    return () => clearInterval(iv);
  }, [phase]);

  // Done → fade out
  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => onComplete(), 600);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      className="loading-screen"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.6s ease, visibility 0.6s",
        opacity: phase === "done" ? 0 : 1,
        visibility: phase === "done" ? "hidden" : "visible",
      }}
    >
      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, #FF1E1E, transparent)",
          boxShadow: "0 0 20px #FF1E1E",
          animation: "heroScan 3s linear infinite",
        }}
      />

      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,30,30,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,30,30,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "520px", width: "90%" }}>
        {/* Logo */}
        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            color: "#F5F5F5",
            letterSpacing: "4px",
            marginBottom: "8px",
            textShadow: "0 0 30px rgba(255,30,30,0.5), 0 0 60px rgba(255,30,30,0.2)",
            animation: "glitch 6s infinite",
          }}
        >
          CIFER<span style={{ color: "#FF1E1E" }}>BITZ</span>
        </div>
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "6px",
            color: "#FF1E1E",
            textTransform: "uppercase",
            opacity: 0.8,
            marginBottom: "40px",
          }}
        >
          Digital Innovation Lab
        </div>

        {/* Terminal window */}
        <div
          style={{
            background: "rgba(14,14,14,0.9)",
            border: "1px solid rgba(255,30,30,0.2)",
            borderRadius: "4px",
            overflow: "hidden",
            marginBottom: "32px",
            textAlign: "left",
          }}
        >
          {/* Terminal titlebar */}
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(255,30,30,0.06)",
              borderBottom: "1px solid rgba(255,30,30,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF1E1E", boxShadow: "0 0 6px rgba(255,30,30,0.8)" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,30,30,0.3)" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,30,30,0.15)" }} />
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.5rem",
                letterSpacing: "2px",
                color: "rgba(255,30,30,0.5)",
              }}
            >
              SYSTEM BOOT
            </span>
          </div>
          {/* Terminal body */}
          <div
            ref={termRef}
            style={{
              padding: "12px 14px",
              maxHeight: "180px",
              overflowY: "auto",
              fontFamily: "'Exo 2', monospace",
              fontSize: "0.72rem",
              lineHeight: 1.8,
              color: "#8F8F8F",
              scrollbarWidth: "none",
            }}
          >
            {lines.map((line, i) => {
              if (!line) return null;
              return (
              <div key={i} style={{ opacity: 0, animation: "fadeIn 0.3s ease forwards", animationDelay: `${i * 0.05}s` }}>
                <span style={{ color: line.startsWith("[SYS]") ? "#FF1E1E" : line.startsWith("[NET]") ? "#CC0000" : line.startsWith("[GPU]") ? "#ff5555" : line.startsWith("[AI]") ? "#FF1E1E" : "#8F8F8F" }}>
                  {line.substring(0, 5)}
                </span>
                {line.substring(5)}
              </div>
              );
            })}
            {phase === "load" && (
              <div style={{ color: "#FF1E1E", animation: "pulse 1s ease-in-out infinite" }}>
                {">"} Loading interface...
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "3px",
              color: "rgba(255,30,30,0.6)",
              textTransform: "uppercase",
            }}
          >
            <span>System Init</span>
            <span>{Math.min(100, Math.floor(progress))}%</span>
          </div>
          <div
            style={{
              height: "3px",
              background: "rgba(255,30,30,0.1)",
              borderRadius: "2px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, progress)}%`,
                background: "linear-gradient(90deg, #7A0000, #FF1E1E, #ff5555)",
                borderRadius: "2px",
                transition: "width 0.05s linear",
                boxShadow: "0 0 12px rgba(255,30,30,0.8), 0 0 30px rgba(255,30,30,0.4)",
              }}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: "16px",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.5rem",
              letterSpacing: "4px",
              color: "rgba(143,143,143,0.4)",
            }}
          >
            SYS-v4.2.1 // BOOTING
          </div>
        </div>
      </div>

      {/* HUD corners */}
      {(["tl","tr","bl","br"] as const).map((pos) => (
        <div
          key={pos}
          style={{
            position: "fixed",
            [pos.includes("t") ? "top" : "bottom"]: "12px",
            [pos.includes("l") ? "left" : "right"]: "12px",
            width: "40px",
            height: "40px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              [pos.includes("t") ? "top" : "bottom"]: 0,
              [pos.includes("l") ? "left" : "right"]: 0,
              width: "2px",
              height: "20px",
              background: "#FF1E1E",
              boxShadow: "0 0 8px rgba(255,30,30,0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              [pos.includes("t") ? "top" : "bottom"]: 0,
              [pos.includes("l") ? "left" : "right"]: 0,
              width: "20px",
              height: "2px",
              background: "#FF1E1E",
              boxShadow: "0 0 8px rgba(255,30,30,0.8)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
