// components.jsx — Reusable game components: camera, puzzle board, hand gesture, timer

// ─────────── i18n strings ───────────
const STRINGS = {
  en: {
    pickPlayers: "Choose how many players",
    solo: "Solo",
    duo: "Duo",
    soloDesc: "Full screen · single hand frame",
    duoDesc: "Split screen · first to solve wins",
    tutorial: "How to play",
    tutorialStep1: "Make a frame with your fingers",
    tutorialStep2: "Grab to capture the photo",
    tutorialStep3: "Grab a tile to lift it",
    tutorialStep4: "Drag and drop to swap",
    initializing: "Initializing camera…",
    loadingAI: "Loading AI…",
    captureNow: "GRAB TO CAPTURE",
    captureLeft: "PLAYER 1 · GRAB",
    captureRight: "PLAYER 2 · GRAB",
    getReady: "GET READY",
    go: "GO!",
    complete: "PUZZLE SOLVED",
    duoComplete: "BOTH SOLVED",
    youWin: "YOU WIN!",
    youLose: "GAME OVER",
    rivalWon: "Opponent finished first",
    winnerTime: "Winning time",
    duoRaceHint: "First to complete the puzzle wins",
    yourTime: "Your time",
    saveName: "Save your name",
    namePh: "Enter name",
    skip: "Skip and play again",
    playAgain: "Play again",
    p1: "Player 1",
    p2: "Player 2",
    cameraErr: "Camera access denied",
    cameraErrMsg: "Please allow camera permission to play.",
    retry: "Retry",
    backToMenu: "Back to menu",
    start: "Start playing",
    tagline: "An interactive moment for the MC contest",
  },
  vi: {
    pickPlayers: "Chọn số người chơi",
    solo: "1 Người",
    duo: "2 Người",
    soloDesc: "Toàn màn hình · khung tay đơn",
    duoDesc: "Chia đôi · ai xong trước thắng",
    tutorial: "Cách chơi",
    tutorialStep1: "Hai ngón tạo khung",
    tutorialStep2: "Nắm tay để chụp",
    tutorialStep3: "Nắm mảnh để nhấc",
    tutorialStep4: "Kéo thả để đổi chỗ",
    initializing: "Đang khởi tạo camera…",
    loadingAI: "Đang tải AI…",
    captureNow: "NẮM ĐỂ CHỤP",
    captureLeft: "NGƯỜI 1 · NẮM",
    captureRight: "NGƯỜI 2 · NẮM",
    getReady: "SẴN SÀNG",
    go: "BẮT ĐẦU!",
    complete: "ĐÃ HOÀN THÀNH",
    duoComplete: "CẢ HAI ĐÃ HOÀN THÀNH",
    youWin: "BẠN THẮNG!",
    youLose: "THUA CUỘC",
    rivalWon: "Đối thủ hoàn thành trước",
    winnerTime: "Thời gian thắng",
    duoRaceHint: "Ai ghép xong trước sẽ thắng",
    yourTime: "Thời gian",
    saveName: "Lưu tên của bạn",
    namePh: "Nhập tên",
    skip: "Bỏ qua và chơi lại",
    playAgain: "Chơi lại",
    p1: "Người 1",
    p2: "Người 2",
    cameraErr: "Camera bị từ chối",
    cameraErrMsg: "Vui lòng cho phép truy cập camera để chơi.",
    retry: "Thử lại",
    backToMenu: "Quay lại menu",
    start: "Bắt đầu",
    tagline: "Khoảnh khắc tương tác cho cuộc thi MC",
  },
};
const useT = (lang) => STRINGS[lang] || STRINGS.en;

// ─────────── Camera viewport mock ───────────
// Simulates a webcam feed with subtle warm gradient + scanlines.
const CameraMock = ({ children, split = false }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(135deg, #1a1230 0%, #16213e 30%, #0f3460 60%, #1d6fb9 100%)",
      borderRadius: 0,
      overflow: "hidden",
    }}
  >
    {/* Scanline texture */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 3px)",
        mixBlendMode: "overlay",
      }}
    />
    {/* Center dark vignette to simulate a person silhouette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 40% 60% at 50% 60%, rgba(0,0,0,0.45) 0%, transparent 70%)",
      }}
    />
    {/* "AI motion noise" subtle moving dots — pure CSS */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.04) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px, 60px 60px",
      }}
    />
    {split && (
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 4,
          marginLeft: -2,
          background:
            "linear-gradient(180deg, rgba(61,224,255,0.0) 0%, rgba(61,224,255,0.9) 20%, rgba(255,216,74,0.9) 80%, rgba(255,216,74,0.0) 100%)",
          boxShadow:
            "0 0 24px rgba(61,224,255,0.5), 0 0 24px rgba(255,216,74,0.5)",
          zIndex: 6,
        }}
      />
    )}
    {children}
  </div>
);

// ─────────── Scan frame ───────────
// Corner brackets + label
const ScanFrame = ({
  left, top, width, height,
  color = "#3de0ff",
  label = "",
  player = 1,
}) => {
  const glow = color === "#3de0ff" ? "rgba(61,224,255,0.6)" : "rgba(255,216,74,0.6)";
  const bracket = (anchor) => {
    const sz = 56;
    const w = 6;
    const base = { position: "absolute", width: sz, height: sz, borderColor: color, borderStyle: "solid", borderWidth: 0 };
    if (anchor === "tl") return { ...base, top: -3, left: -3, borderTopWidth: w, borderLeftWidth: w, borderTopLeftRadius: 8 };
    if (anchor === "tr") return { ...base, top: -3, right: -3, borderTopWidth: w, borderRightWidth: w, borderTopRightRadius: 8 };
    if (anchor === "bl") return { ...base, bottom: -3, left: -3, borderBottomWidth: w, borderLeftWidth: w, borderBottomLeftRadius: 8 };
    if (anchor === "br") return { ...base, bottom: -3, right: -3, borderBottomWidth: w, borderRightWidth: w, borderBottomRightRadius: 8 };
  };
  return (
    <div
      style={{
        position: "absolute",
        left, top, width, height,
        zIndex: 7,
        boxShadow: `inset 0 0 60px ${glow}, 0 0 40px ${glow}`,
        animation: "pulse-glow 2.4s ease-in-out infinite",
      }}
    >
      <div style={bracket("tl")} />
      <div style={bracket("tr")} />
      <div style={bracket("bl")} />
      <div style={bracket("br")} />
      {label && (
        <div
          style={{
            position: "absolute",
            top: -56,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display)",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "0.16em",
            color,
            textShadow: `0 0 12px ${glow}`,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      )}
      {/* Player tag at top-right of frame */}
      <div
        style={{
          position: "absolute",
          top: 16, right: 16,
          fontFamily: "var(--f-display)",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "0.18em",
          color: "white",
          background: color,
          padding: "4px 12px",
          borderRadius: 999,
          color: color === "#3de0ff" ? "#002338" : "#2a1500",
        }}
      >
        P{player}
      </div>
    </div>
  );
};

// ─────────── Timer pill ───────────
const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
};

const TimerPill = ({ seconds = 0, color = "#3de0ff", label, big = false }) => {
  const glow = color === "#3de0ff" ? "rgba(61,224,255,0.5)" : "rgba(255,216,74,0.5)";
  return (
    <div
      className="glass-strong"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: big ? "16px 28px" : "12px 22px",
        borderRadius: 999,
        border: `1px solid ${color}40`,
        boxShadow: `0 0 24px ${glow}`,
      }}
    >
      {label && (
        <span
          style={{
            fontFamily: "var(--f-display)",
            fontWeight: 700,
            fontSize: big ? 16 : 13,
            letterSpacing: "0.18em",
            color,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
      <svg width={big ? 28 : 22} height={big ? 28 : 22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 16 14" strokeLinecap="round" />
      </svg>
      <span
        style={{
          fontFamily: "var(--f-mono)",
          fontWeight: 700,
          fontSize: big ? 42 : 32,
          color: "white",
          letterSpacing: "0.04em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTime(seconds)}
      </span>
    </div>
  );
};

// ─────────── Puzzle board ───────────
// Renders a 3×3 board with one empty slot. `tiles` is an array of 9 numbers, 0=empty.
// Tile content is a div with a position-shifted background = the captured photo.
const PuzzleBoard = ({
  rect, // {left, top, width, height}
  tiles,
  color = "#3de0ff",
  lifted = null, // index that's currently lifted
  liftPos = null, // {x, y} relative inset 0..1
  imageOverlayIndex = null, // tile slot index that shows the logo instead of camera
  highlight = false,
}) => {
  const N = 3;
  const w = rect.width;
  const h = rect.height;
  const tileW = w / N;
  const tileH = h / N;
  const glow = color === "#3de0ff" ? "rgba(61,224,255,0.55)" : "rgba(255,216,74,0.55)";

  return (
    <div
      style={{
        position: "absolute",
        ...rect,
        zIndex: 8,
        boxShadow: `0 0 80px ${glow}, inset 0 0 60px ${glow}`,
        border: `3px solid ${color}`,
        borderRadius: 8,
        overflow: "visible",
      }}
    >
      {tiles.map((val, idx) => {
        if (val === 0) {
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: (idx % N) * tileW,
                top: Math.floor(idx / N) * tileH,
                width: tileW,
                height: tileH,
                background: "rgba(0, 0, 0, 0.45)",
                border: `1px dashed ${color}40`,
                boxShadow: `inset 0 0 30px ${glow}40`,
              }}
            />
          );
        }
        const isLifted = lifted === idx;
        const srcIdx = val - 1; // val 1..9 -> which slot in the original image
        const srcRow = Math.floor(srcIdx / N);
        const srcCol = srcIdx % N;
        // For "image overlay index" (e.g. one slot is the logo)
        const showLogo = imageOverlayIndex === srcIdx;
        const left = isLifted && liftPos ? liftPos.x : (idx % N) * tileW;
        const top = isLifted && liftPos ? liftPos.y : Math.floor(idx / N) * tileH;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left,
              top,
              width: tileW,
              height: tileH,
              transition: isLifted ? "none" : "left 0.3s ease, top 0.3s ease",
              transform: isLifted ? "scale(1.08)" : "scale(1)",
              zIndex: isLifted ? 10 : 1,
              boxShadow: isLifted
                ? `0 20px 40px rgba(0,0,0,0.6), 0 0 40px ${glow}, inset 0 0 30px ${glow}`
                : "inset 0 0 0 1px rgba(255,255,255,0.08)",
              border: isLifted ? `3px solid ${color}` : "1px solid rgba(0,0,0,0.4)",
              overflow: "hidden",
              cursor: "default",
              background: showLogo
                ? "linear-gradient(135deg, #0a1238 0%, #1452a8 100%)"
                : `linear-gradient(135deg,
                    hsl(${180 + srcIdx * 8}, ${40 + srcIdx * 3}%, ${30 + srcRow * 8}%) 0%,
                    hsl(${200 + srcIdx * 6}, ${50}%, ${20 + srcCol * 6}%) 100%)`,
            }}
          >
            {/* Simulated photo content per tile — colored shapes */}
            {!showLogo && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at ${30 + srcCol * 20}% ${20 + srcRow * 25}%,
                      rgba(255,255,255,0.18), transparent 60%)`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    color: "rgba(255,255,255,0.18)",
                    fontFamily: "var(--f-mono)",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {val}
                </div>
              </>
            )}
            {showLogo && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  background:
                    "radial-gradient(circle at 50% 50%, #1452a8 0%, #0a1238 80%)",
                }}
              >
                <img
                  src={getAsset("logo")}
                  alt=""
                  style={{
                    width: "78%",
                    height: "auto",
                    filter: "drop-shadow(0 0 8px rgba(255,216,74,0.6))",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─────────── Cursor dot ───────────
const CursorDot = ({ x, y, color = "#fff", filled = true }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: filled ? color : "transparent",
      border: `3px solid ${color}`,
      boxShadow: `0 0 20px ${color}`,
      zIndex: 12,
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
    }}
  />
);

// ─────────── Hint card (right side) ───────────
const HintCard = ({ title, steps = [], color = "#3de0ff" }) => (
  <div
    className="glass"
    style={{
      position: "absolute",
      top: 180,
      right: 32,
      width: 320,
      padding: "20px 24px",
      borderRadius: 18,
      borderColor: `${color}40`,
      zIndex: 25,
    }}
  >
    <div
      style={{
        fontFamily: "var(--f-display)",
        fontWeight: 700,
        fontSize: 18,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        marginBottom: 14,
        textShadow: `0 0 12px ${color}80`,
      }}
    >
      {title}
    </div>
    <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {steps.map((s, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            fontSize: 15,
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.86)",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 24, height: 24,
              borderRadius: "50%",
              background: color,
              color: color === "#3de0ff" ? "#002338" : "#2a1500",
              fontFamily: "var(--f-display)",
              fontWeight: 700,
              fontSize: 13,
              display: "grid",
              placeItems: "center",
            }}
          >
            {i + 1}
          </span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  </div>
);

Object.assign(window, {
  STRINGS, useT,
  CameraMock, ScanFrame, TimerPill, PuzzleBoard, CursorDot, HintCard, formatTime,
});
