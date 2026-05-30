// decor.jsx — Cave scene decorations: stalactites, crystals, mountains, sparks

const Crystal = ({ x, y, size = 60, color = "#3de0ff", rotation = 0, delay = 0 }) => (
  <svg
    className="crystal-deco"
    width={size}
    height={size * 1.7}
    viewBox="0 0 60 100"
    style={{
      left: x,
      top: y,
      transform: `rotate(${rotation}deg)`,
      animationDelay: `${delay}s`,
    }}
  >
    <defs>
      <linearGradient id={`cg-${x}-${y}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e8feff" />
        <stop offset="40%" stopColor={color} />
        <stop offset="100%" stopColor="#0d7da3" />
      </linearGradient>
    </defs>
    <polygon
      points="30,0 50,30 45,90 30,100 15,90 10,30"
      fill={`url(#cg-${x}-${y})`}
      stroke={color}
      strokeWidth="0.5"
      opacity="0.95"
    />
    <polygon
      points="30,0 50,30 30,40 10,30"
      fill="rgba(255,255,255,0.25)"
    />
    <line x1="30" y1="0" x2="30" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
  </svg>
);

const Spark = ({ x, y, size = 6, delay = 0, duration = 3 }) => (
  <div
    className="spark"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

// Animated star — 4-point sparkle
const Sparkle4 = ({ x, y, size = 24, color = "#fff", delay = 0 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    style={{
      position: "absolute",
      left: x,
      top: y,
      animation: `spark-twinkle 2.5s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      filter: `drop-shadow(0 0 8px ${color})`,
      pointerEvents: "none",
    }}
  >
    <path
      d="M20 0 L23 17 L40 20 L23 23 L20 40 L17 23 L0 20 L17 17 Z"
      fill={color}
    />
  </svg>
);

// Stalactite SVG — used as top-left/right corner decor when bg images aren't available
const StalactiteFrame = ({ side = "left", opacity = 0.85 }) => (
  <svg
    viewBox="0 0 800 320"
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      top: 0,
      [side]: 0,
      width: 800,
      height: 320,
      transform: side === "right" ? "scaleX(-1)" : "none",
      opacity,
      pointerEvents: "none",
    }}
  >
    <defs>
      <linearGradient id={`stal-${side}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#000714" />
        <stop offset="60%" stopColor="#0d3a8e" />
        <stop offset="100%" stopColor="#1d6fd6" />
      </linearGradient>
    </defs>
    <path
      d="M0 0 L800 0 L800 60 L760 90 L740 60 L720 120 L680 80 L640 140 L600 90 L560 180 L520 110 L480 200 L440 130 L400 220 L360 140 L320 240 L280 150 L240 280 L200 160 L160 220 L120 130 L80 200 L40 110 L0 180 Z"
      fill={`url(#stal-${side})`}
    />
  </svg>
);

const CaveScene = ({ bgVariant = "main", intensity = 1 }) => {
  return (
    <div className="cave-bg">
      {/* Radial cave glow under everything */}
      <div
        className="cave-glow"
        style={{ opacity: 0.6 * intensity }}
      />

      {/* Background image (chosen variant or none) */}
      {bgVariant !== "none" && (
        <img
          src={getBgAsset(bgVariant)}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.65 * intensity,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Stalactites top corners */}
      <StalactiteFrame side="left" opacity={0.75 * intensity} />
      <StalactiteFrame side="right" opacity={0.75 * intensity} />

      {/* Mountain silhouette at bottom */}
      <img
        src={getAsset("cave.mountains")}
        alt=""
        aria-hidden="true"
        className="cave-mountains"
        style={{ opacity: 0.7 * intensity }}
      />

      {/* Side spire accents */}
      <img
        src={getAsset("cave.spire")}
        alt=""
        aria-hidden="true"
        className="cave-spire-l"
        style={{ opacity: 0.55 * intensity }}
      />
      <img
        src={getAsset("cave.spire")}
        alt=""
        aria-hidden="true"
        className="cave-spire-r"
        style={{ opacity: 0.55 * intensity }}
      />

      {/* Floating crystals */}
      <Crystal x={140} y={380} size={70} delay={0} rotation={-6} />
      <Crystal x={1720} y={420} size={64} delay={1.2} rotation={8} color="#57f5d9" />
      <Crystal x={90} y={760} size={88} delay={2.4} rotation={-12} />
      <Crystal x={1780} y={780} size={76} delay={1.8} rotation={14} color="#57f5d9" />
      <Crystal x={250} y={920} size={54} delay={0.6} rotation={4} />
      <Crystal x={1620} y={920} size={56} delay={3} rotation={-10} color="#57f5d9" />

      {/* Sparkles */}
      <Sparkle4 x={380} y={180} size={22} color="#ffd84a" delay={0} />
      <Sparkle4 x={1500} y={220} size={28} color="#3de0ff" delay={0.8} />
      <Sparkle4 x={1620} y={500} size={20} color="#fff" delay={1.5} />
      <Sparkle4 x={280} y={620} size={18} color="#a6f0ff" delay={2.1} />
      <Sparkle4 x={960} y={120} size={16} color="#fff" delay={2.8} />
      <Sparkle4 x={1100} y={920} size={20} color="#ffd84a" delay={1.1} />

      <Spark x={520} y={300} size={6} delay={0.5} />
      <Spark x={1380} y={380} size={4} delay={1.5} />
      <Spark x={820} y={920} size={5} delay={2.2} />
      <Spark x={1180} y={260} size={4} delay={3} />

      {/* Vignette over everything */}
      <div className="cave-vignette" />
    </div>
  );
};

// Header with logo + slogan
const KioskHeader = ({ compact = false, lang = "en" }) => {
  const sloganEn = "CATCH THE MIC — CATCH THE MOMENT";
  const sloganVi = "BẮT TRỌN MIC — BẮT TRỌN KHOẢNH KHẮC";
  return (
    <div className={`kiosk-header ${compact ? "compact" : ""}`}>
      <img src={getAsset("logo")} alt="Micatcher 2026" className="logo" />
      <div className="slogan">{lang === "vi" ? sloganVi : sloganEn}</div>
    </div>
  );
};

// Back button (returns to menu)
const BackButton = ({ onClick, lang = "en" }) => (
  <button
    type="button"
    className="btn-ghost"
    onClick={onClick}
    style={{ position: "absolute", top: 32, left: 32, zIndex: 40 }}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
    {lang === "vi" ? "Quay lại" : "Back to Menu"}
  </button>
);

Object.assign(window, { Crystal, Spark, Sparkle4, StalactiteFrame, CaveScene, KioskHeader, BackButton });
