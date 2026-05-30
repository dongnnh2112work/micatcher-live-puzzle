// mascot.jsx — SVG mascot inspired by Micatcher KV
// A stylized "Mic-bot" with cyan top, gold bottom, big eye, headphones, melting drip.
// Note: this is a placeholder until the official mascot PNG (Vietnamese filename
// blocked from copy) can be dropped into assets/mascot.png.

const Mascot = ({ size = 220, holdMic = false, wink = false, style }) => (
  <svg
    viewBox="0 0 400 520"
    width={size}
    height={size * 1.3}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Cyan top gradient */}
      <linearGradient id="m-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d6f7ff" />
        <stop offset="40%" stopColor="#8fe6ff" />
        <stop offset="100%" stopColor="#3de0ff" />
      </linearGradient>
      {/* Gold bottom gradient */}
      <linearGradient id="m-bot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff2a0" />
        <stop offset="50%" stopColor="#ffd84a" />
        <stop offset="100%" stopColor="#ffae00" />
      </linearGradient>
      {/* Outline trim */}
      <linearGradient id="m-trim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff7eb0" />
        <stop offset="50%" stopColor="#ffb347" />
        <stop offset="100%" stopColor="#ffd84a" />
      </linearGradient>
      {/* Drip */}
      <linearGradient id="m-drip" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffae00" />
        <stop offset="50%" stopColor="#ff7eb0" />
        <stop offset="100%" stopColor="#ff5fa2" stopOpacity="0.6" />
      </linearGradient>
      <radialGradient id="m-eye" cx="0.35" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#5fb3e8" />
        <stop offset="40%" stopColor="#0a1238" />
        <stop offset="100%" stopColor="#000a1f" />
      </radialGradient>
    </defs>

    {/* Drip from bottom */}
    <path
      d="M180 440 Q175 480 178 500 Q180 510 184 510 Q190 510 192 500 Q198 470 198 450 Z"
      fill="url(#m-drip)"
      opacity="0.95"
    />

    {/* Body — egg shape */}
    <g transform="rotate(-8 200 240)">
      {/* Outline trim glow */}
      <path
        d="M120 180 Q120 60 200 60 Q280 60 280 180 L280 360 Q280 440 200 440 Q120 440 120 360 Z"
        fill="url(#m-trim)"
        transform="translate(-6 -2)"
      />
      {/* Top cyan half */}
      <path
        d="M120 180 Q120 60 200 60 Q280 60 280 180 L280 280 L120 280 Z"
        fill="url(#m-top)"
      />
      {/* Bottom gold half */}
      <path
        d="M120 280 L280 280 L280 360 Q280 440 200 440 Q120 440 120 360 Z"
        fill="url(#m-bot)"
      />
      {/* Yellow belt */}
      <rect x="115" y="268" width="170" height="22" fill="url(#m-trim)" />
      <rect x="195" y="295" width="22" height="22" rx="4" fill="none" stroke="#3de0ff" strokeWidth="3" />

      {/* Highlight stripe */}
      <path
        d="M256 90 Q268 200 256 380"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />

      {/* Eye */}
      <ellipse cx="200" cy="180" rx="62" ry="62" fill="url(#m-eye)" />
      {wink ? (
        <path
          d="M150 180 Q200 165 250 180"
          stroke="#0a1238"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx="218" cy="160" r="14" fill="white" />
          <circle cx="225" cy="155" r="5" fill="white" opacity="0.9" />
        </>
      )}

      {/* Mouth dot */}
      <circle cx="170" cy="240" r="9" fill="#ff5fa2" />

      {/* Left headphone */}
      <circle cx="108" cy="240" r="32" fill="url(#m-bot)" stroke="url(#m-trim)" strokeWidth="3" />
      <circle cx="108" cy="240" r="16" fill="#0a1238" opacity="0.4" />
    </g>

    {/* Microphone (when holding/celebrating) */}
    {holdMic && (
      <g transform="translate(40 130) rotate(-25)">
        <rect x="-4" y="0" width="8" height="120" rx="3" fill="#ffd84a" />
        <ellipse cx="0" cy="-12" rx="22" ry="28" fill="url(#m-bot)" stroke="url(#m-trim)" strokeWidth="2" />
        <path d="M-14 -25 L14 -25 M-18 -12 L18 -12 M-14 1 L14 1" stroke="#2a1500" strokeWidth="2" opacity="0.6" />
      </g>
    )}
  </svg>
);

// Floating mascot wrapper — used in background of game screens
const MascotFloating = ({ position = "right", scale = 1, holdMic = false, wink = false }) => {
  const pos = {
    left:        { left: "4%",  top: "55%", transform: "rotate(-4deg)" },
    right:       { right: "4%", top: "55%", transform: "rotate(4deg) scaleX(-1)" },
    "top-left":  { left: "6%",  top: "8%", transform: "rotate(-8deg) scale(0.85)" },
    "top-right": { right: "6%", top: "8%", transform: "rotate(8deg) scale(0.85) scaleX(-1)" },
    "bottom-right": { right: "3%", bottom: "8%", transform: "rotate(-6deg)" },
    "bottom-left":  { left: "3%",  bottom: "8%", transform: "rotate(6deg) scaleX(-1)" },
    hidden: null,
  };
  if (position === "hidden") return null;
  const p = pos[position] || pos.right;
  return (
    <div
      style={{
        position: "absolute",
        ...p,
        opacity: 0.55,
        pointerEvents: "none",
        animation: "float-y 5s ease-in-out infinite",
        zIndex: 5,
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <Mascot size={260} holdMic={holdMic} wink={wink} />
      </div>
    </div>
  );
};

Object.assign(window, { Mascot, MascotFloating });
