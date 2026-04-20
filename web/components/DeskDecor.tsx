/* Objets décoratifs fixes du bureau — purement cosmétiques, pointer-events: none */

export default function DeskDecor() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden hidden md:block"
    >
      {/* ── Tache de café (bas-gauche) ── */}
      <svg
        className="absolute"
        style={{ bottom: "6%", left: "4%", width: 64, height: 64, opacity: 0.25 }}
        viewBox="0 0 64 64"
      >
        <defs>
          <radialGradient id="coffee" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6B4226" stopOpacity="0.0" />
            <stop offset="60%" stopColor="#6B4226" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#6B4226" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6B4226" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="34" rx="28" ry="26" fill="url(#coffee)" />
        <ellipse cx="32" cy="34" rx="24" ry="22" fill="none" stroke="#6B4226" strokeWidth="1" opacity="0.4" />
      </svg>

      {/* ── Trombone (haut-droite) ── */}
      <svg
        className="absolute"
        style={{ top: "12%", right: "6%", width: 48, height: 28, opacity: 0.30, transform: "rotate(-15deg)" }}
        viewBox="0 0 48 28"
      >
        <path d="M6 14 Q6 4 18 4 Q30 4 30 12 Q30 20 18 20 L10 20 Q8 20 8 22 Q8 24 10 24 L36 24 Q42 24 42 18 Q42 12 36 12 L30 12"
          fill="none" stroke="#A89878" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* ── Règle métallique (bord gauche) ── */}
      <div
        className="absolute"
        style={{
          top: "30%",
          left: "1.5%",
          width: 18,
          height: 180,
          background: "linear-gradient(90deg, #3F4841 0%, #5A6358 30%, #4A5148 60%, #3F4841 100%)",
          opacity: 0.45,
          transform: "rotate(1deg)",
          boxShadow: "inset 1px 0 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Graduations */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * 18 + 12,
              left: i % 3 === 0 ? 0 : 4,
              width: i % 3 === 0 ? 10 : 6,
              height: 1,
              background: "rgba(232, 220, 192, 0.4)",
            }}
          />
        ))}
      </div>

      {/* ── Post-it "NE PAS OUBLIER" (bas-droite) ── */}
      <div
        className="absolute font-typewriter"
        style={{
          bottom: "8%",
          right: "5%",
          width: 96,
          background: "#D4C84A",
          padding: "8px 10px",
          fontSize: 8,
          color: "#2A2408",
          transform: "rotate(-3deg)",
          boxShadow: "2px 3px 8px rgba(0,0,0,0.35)",
          opacity: 0.75,
          lineHeight: 1.4,
        }}
      >
        NE PAS<br />OUBLIER<br />
        <span style={{ fontSize: 7, opacity: 0.6 }}>—dossier 2847</span>
      </div>

      {/* ── Stylo rouge (à côté du post-it) ── */}
      <svg
        className="absolute"
        style={{ bottom: "5%", right: "12%", width: 10, height: 80, opacity: 0.4, transform: "rotate(-8deg)" }}
        viewBox="0 0 10 80"
      >
        <rect x="2" y="0" width="6" height="70" rx="2" fill="#B0261C" />
        <rect x="2" y="68" width="6" height="8" rx="1" fill="#E8DCC0" />
        <rect x="3" y="0" width="4" height="6" rx="1" fill="#7A1A12" />
      </svg>

      {/* ── Cendrier (bas-droite extrême) ── */}
      <svg
        className="absolute"
        style={{ bottom: "3%", right: "2%", width: 52, height: 40, opacity: 0.28 }}
        viewBox="0 0 52 40"
      >
        <ellipse cx="26" cy="32" rx="22" ry="6" fill="#4A4A4A" />
        <ellipse cx="26" cy="28" rx="20" ry="10" fill="none" stroke="#5A5A5A" strokeWidth="3" />
        {/* mégots */}
        <line x1="16" y1="24" x2="18" y2="20" stroke="#D4A066" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="22" x2="34" y2="18" stroke="#D4A066" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
