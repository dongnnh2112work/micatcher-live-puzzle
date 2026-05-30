// screens-intro.jsx — Menu, Tutorial, Loading, Error screens

// ─────────── Mode picker card ───────────
const ModeCard = ({ accent = "#3de0ff", icon, title, desc, onClick }) => {
  const isCyan = accent === "#3de0ff";
  const glow = isCyan ? "rgba(61,224,255,0.5)" : "rgba(255,216,74,0.5)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-strong"
      style={{
        position: "relative",
        width: 460,
        height: 320,
        padding: 32,
        borderRadius: 28,
        border: `2px solid ${accent}50`,
        cursor: "pointer",
        textAlign: "left",
        color: "inherit",
        font: "inherit",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 30px 80px rgba(0,0,0,0.6), 0 0 80px ${glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = `${accent}50`;
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Glow blob */}
      <div
        style={{
          position: "absolute",
          right: -80,
          bottom: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 80, height: 80,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
            border: `1px solid ${accent}60`,
            display: "grid",
            placeItems: "center",
            color: accent,
            flexShrink: 0,
            boxShadow: `inset 0 0 30px ${accent}30, 0 0 24px ${glow}`,
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--f-display)",
            fontWeight: 700,
            fontSize: 48,
            lineHeight: 1,
            color: "white",
            marginBottom: 12,
            textShadow: `0 0 24px ${glow}`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.4,
          }}
        >
          {desc}
        </div>
      </div>
    </button>
  );
};

const ScreenMenu = ({ onPickSolo, onPickDuo, onTutorial, lang = "en" }) => {
  const t = useT(lang);
  const iconSolo = (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
  const iconDuo = (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "180px 80px 80px",
      }}
    >
      <KioskHeader lang={lang} />

      {/* Tagline above cards */}
      <div
        style={{
          textAlign: "center",
          marginTop: 30,
          marginBottom: 10,
          animation: "scale-in 0.6s ease 0.1s both",
        }}
      >
        <div
          style={{
            fontFamily: "var(--f-display)",
            fontSize: 22,
            fontWeight: 500,
            color: "var(--cyan-soft)",
            letterSpacing: "0.05em",
            opacity: 0.9,
          }}
        >
          {t.pickPlayers}
        </div>
      </div>

      {/* Mode cards */}
      <div
        style={{
          display: "flex",
          gap: 48,
          animation: "scale-in 0.6s ease 0.25s both",
        }}
      >
        <ModeCard
          accent="#3de0ff"
          icon={iconSolo}
          title={t.solo}
          desc={t.soloDesc}
          onClick={onPickSolo}
        />
        <ModeCard
          accent="#ffd84a"
          icon={iconDuo}
          title={t.duo}
          desc={t.duoDesc}
          onClick={onPickDuo}
        />
      </div>

      {/* Tutorial link */}
      <button
        type="button"
        className="btn-ghost"
        onClick={onTutorial}
        style={{ marginTop: 20, animation: "scale-in 0.6s ease 0.4s both" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {t.tutorial}
      </button>
    </div>
  );
};

// ─────────── Tutorial overlay — animated hand gestures ───────────
const HandGestureFrame = ({ animated = true }) => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    style={{ animation: animated ? "hand-pinch-in 2.4s ease-in-out infinite" : "none" }}
  >
    <defs>
      <linearGradient id="hand-grad-1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a6f0ff" />
        <stop offset="100%" stopColor="#3de0ff" />
      </linearGradient>
    </defs>
    {/* L-shape index + thumb hand */}
    <g stroke="url(#hand-grad-1)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 60 L40 160 L100 160" /> {/* index finger horizontal */}
      <path d="M40 60 L100 60" /> {/* thumb */}
    </g>
    {/* Dotted frame they're framing */}
    <rect x="48" y="68" width="44" height="84" stroke="#3de0ff" strokeWidth="2" strokeDasharray="4 4" fill="rgba(61,224,255,0.08)" />
    <circle cx="40" cy="60" r="6" fill="#3de0ff" />
    <circle cx="40" cy="160" r="6" fill="#3de0ff" />
    <circle cx="100" cy="60" r="6" fill="#3de0ff" />
    <circle cx="100" cy="160" r="6" fill="#3de0ff" />
  </svg>
);

const HandGestureGrab = ({ animated = true }) => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    style={{ animation: animated ? "hand-grab 1.6s ease-in-out infinite" : "none" }}
  >
    <defs>
      <linearGradient id="hand-grad-2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffeb8a" />
        <stop offset="100%" stopColor="#ffd84a" />
      </linearGradient>
    </defs>
    {/* Closed fist symbol */}
    <g fill="url(#hand-grad-2)" stroke="#ffd84a" strokeWidth="3">
      <ellipse cx="100" cy="110" rx="50" ry="40" />
      {/* Knuckle bumps */}
      <circle cx="70" cy="92" r="10" />
      <circle cx="90" cy="86" r="10" />
      <circle cx="110" cy="86" r="10" />
      <circle cx="130" cy="92" r="10" />
    </g>
    {/* "Tap" indicator */}
    <circle cx="100" cy="110" r="55" stroke="#ffd84a" strokeWidth="2" fill="none" opacity="0.4" />
    <circle cx="100" cy="110" r="70" stroke="#ffd84a" strokeWidth="2" fill="none" opacity="0.2" />
  </svg>
);

const TutorialStep = ({ num, title, gesture, accent = "#3de0ff" }) => (
  <div
    className="glass"
    style={{
      flex: 1,
      padding: 28,
      borderRadius: 20,
      border: `1px solid ${accent}40`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      maxWidth: 340,
    }}
  >
    <div
      style={{
        width: 48, height: 48,
        borderRadius: "50%",
        background: accent,
        color: accent === "#3de0ff" ? "#002338" : "#2a1500",
        fontFamily: "var(--f-display)",
        fontWeight: 700,
        fontSize: 22,
        display: "grid",
        placeItems: "center",
      }}
    >
      {num}
    </div>
    <div style={{ height: 200, display: "grid", placeItems: "center" }}>
      {gesture}
    </div>
    <div
      style={{
        fontFamily: "var(--f-display)",
        fontWeight: 600,
        fontSize: 22,
        color: "white",
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      {title}
    </div>
  </div>
);

const ScreenTutorial = ({ onBack, onStart, lang = "en" }) => {
  const t = useT(lang);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "150px 80px 80px",
      }}
    >
      <KioskHeader compact lang={lang} />
      <BackButton onClick={onBack} lang={lang} />

      <h2
        style={{
          fontFamily: "var(--f-display)",
          fontWeight: 700,
          fontSize: 56,
          color: "white",
          marginTop: 20,
          marginBottom: 16,
          textAlign: "center",
          textShadow: "0 0 24px rgba(61,224,255,0.4)",
        }}
      >
        {t.tutorial.toUpperCase()}
      </h2>

      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 40,
          alignItems: "stretch",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <TutorialStep
          num="1"
          title={t.tutorialStep1}
          gesture={<HandGestureFrame />}
          accent="#3de0ff"
        />
        <TutorialStep
          num="2"
          title={t.tutorialStep2}
          gesture={<HandGestureGrab />}
          accent="#ffd84a"
        />
        <TutorialStep
          num="3"
          title={t.tutorialStep3}
          gesture={<HandGestureGrab />}
          accent="#ffd84a"
        />
        <TutorialStep
          num="4"
          title={t.tutorialStep4}
          gesture={
            <svg width="200" height="200" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="hand-drag" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#57f5d9" />
                  <stop offset="100%" stopColor="#3de0ff" />
                </linearGradient>
              </defs>
              {/* Two tile silhouettes, arrow between */}
              <rect x="20" y="80" width="60" height="60" rx="8" fill="url(#hand-drag)" opacity="0.3" stroke="#3de0ff" strokeWidth="2" />
              <rect x="120" y="80" width="60" height="60" rx="8" fill="url(#hand-drag)" stroke="#3de0ff" strokeWidth="3" />
              <path d="M50 110 L150 110" stroke="#3de0ff" strokeWidth="4" strokeDasharray="6 6" />
              <path d="M140 100 L155 110 L140 120" stroke="#3de0ff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          accent="#3de0ff"
        />
      </div>

      <button
        type="button"
        className="btn-primary"
        onClick={onStart}
        style={{ marginTop: 50 }}
      >
        {t.start}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// ─────────── Loading ───────────
const ScreenLoading = ({ lang = "en" }) => {
  const t = useT(lang);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <KioskHeader compact lang={lang} />
      <div
        className="glass-strong"
        style={{
          padding: "60px 80px",
          borderRadius: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div className="spinner" />
        <div
          style={{
            fontFamily: "var(--f-display)",
            fontSize: 22,
            color: "var(--cyan-soft)",
            letterSpacing: "0.08em",
          }}
        >
          {t.initializing}
        </div>
      </div>
    </div>
  );
};

// ─────────── Error ───────────
const ScreenError = ({ onRetry, onBack, lang = "en" }) => {
  const t = useT(lang);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <KioskHeader compact lang={lang} />
      <BackButton onClick={onBack} lang={lang} />
      <div
        className="glass-strong"
        style={{
          padding: "50px 60px",
          borderRadius: 24,
          maxWidth: 560,
          textAlign: "center",
          borderColor: "rgba(255,95,162,0.4)",
        }}
      >
        <div
          style={{
            width: 72, height: 72,
            borderRadius: "50%",
            background: "rgba(255,95,162,0.15)",
            border: "2px solid var(--magenta)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--magenta)" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div
          style={{
            fontFamily: "var(--f-display)",
            fontWeight: 700,
            fontSize: 32,
            color: "white",
            marginBottom: 12,
          }}
        >
          {t.cameraErr}
        </div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 32 }}>
          {t.cameraErrMsg}
        </div>
        <button type="button" className="btn-primary" onClick={onRetry} style={{ fontSize: 22, padding: "16px 36px" }}>
          {t.retry}
        </button>
      </div>
    </div>
  );
};

Object.assign(window, {
  ScreenMenu, ScreenTutorial, ScreenLoading, ScreenError,
  HandGestureFrame, HandGestureGrab,
});
