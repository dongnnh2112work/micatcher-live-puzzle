// screens-game.jsx — Scan, Countdown, Play, Solved (gameplay + UI overlays)

// ─────────── Scanning ───────────
const ScreenScan = ({
  mode = "solo",
  onBack,
  onJustCaptured,
  lang = "en",
  mascotPos = "right",
  soloSession,
  duoSessions,
}) => {
  const t = useT(lang);
  const isDuo = mode === "duo";
  const scanLabel = isDuo ? t.captureLeft : t.captureNow;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <GestureCamera
        mode={mode}
        soloSession={soloSession}
        duoSessions={duoSessions}
        playEnabled={false}
        onJustCaptured={onJustCaptured}
        scanLabel={scanLabel}
        lang={lang}
      >
        <MascotFloating position={mascotPos} />

        <div
          className="glass"
          style={{
            position: "absolute",
            top: 32,
            right: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 18px",
            borderRadius: 999,
            border: "1px solid rgba(61,224,255,0.3)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--cyan)",
              boxShadow: "0 0 12px var(--cyan)",
              animation: "pulse-glow 1.4s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: 13,
              color: "var(--cyan-soft)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            AI · Tracking
          </span>
        </div>

        <HintCard
          title="STEP 1 · CAPTURE"
          steps={[t.tutorialStep1, t.tutorialStep2]}
          color="#3de0ff"
        />
      </GestureCamera>

      <BackButton onClick={onBack} lang={lang} />
    </div>
  );
};

// ─────────── Countdown 3-2-1-GO ───────────
const ScreenCountdown = ({
  onDone,
  lang = "en",
  mode = "solo",
  soloSession,
  duoSessions,
}) => {
  const [count, setCount] = React.useState(3);
  const t = useT(lang);

  React.useEffect(() => {
    if (count <= 0) {
      const timeout = setTimeout(() => onDone && onDone(), 700);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setCount((c) => c - 1), 900);
    return () => clearTimeout(timeout);
  }, [count, onDone]);

  const label = count > 0 ? String(count) : t.go;
  const color = count === 0 ? "#ffd84a" : "#3de0ff";
  const glow = count === 0 ? "rgba(255,216,74,0.8)" : "rgba(61,224,255,0.8)";

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <GestureCamera
        mode={mode}
        soloSession={soloSession}
        duoSessions={duoSessions}
        playEnabled={false}
        showHands={false}
        lang={lang}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            zIndex: 8,
            pointerEvents: "none",
          }}
        />
        <MascotFloating position="bottom-right" wink={count === 0} />

        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--f-display)",
            fontSize: 32,
            fontWeight: 600,
            color: "var(--cyan-soft)",
            letterSpacing: "0.3em",
            zIndex: 12,
            opacity: count > 0 ? 1 : 0,
            transition: "opacity 0.4s",
            pointerEvents: "none",
          }}
        >
          {t.getReady}
        </div>

        <div
          key={count}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "var(--f-display)",
            fontSize: count === 0 ? 280 : 420,
            fontWeight: 700,
            color: "white",
            background: `linear-gradient(180deg, #fff 0%, ${color} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 80px ${glow}`,
            zIndex: 15,
            animation: "count-zoom 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            filter: `drop-shadow(0 0 40px ${glow})`,
            pointerEvents: "none",
          }}
        >
          {label}
        </div>

        <div
          key={`ring-${count}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 200,
            height: 200,
            marginLeft: -100,
            marginTop: -100,
            borderRadius: "50%",
            border: `4px solid ${color}`,
            zIndex: 14,
            animation: "burst-out 0.9s ease-out both",
            pointerEvents: "none",
            "--bx": "0px",
            "--by": "0px",
          }}
        />
      </GestureCamera>
    </div>
  );
};

// ─────────── Playing ───────────
const ScreenPlay = ({
  mode = "solo",
  onBack,
  onSolved,
  lang = "en",
  mascotPos = "right",
  soloSession,
  duoSessions,
  playTimes = { p1: 0, p2: 0 },
  duoRaceEnded = false,
}) => {
  const t = useT(lang);
  const isDuo = mode === "duo";
  const scanLabel = useT(lang).captureNow;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <GestureCamera
        mode={mode}
        soloSession={soloSession}
        duoSessions={duoSessions}
        playEnabled={!duoRaceEnded}
        duoRaceEnded={duoRaceEnded}
        onSolved={onSolved}
        scanLabel={scanLabel}
        lang={lang}
      >
        <MascotFloating position={mascotPos} />

        <div
          style={{
            position: "absolute",
            top: 130,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 24,
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          {!isDuo && <TimerPill seconds={playTimes.p1} color="#3de0ff" big />}
          {isDuo && (
            <>
              <TimerPill seconds={playTimes.p1} color="#3de0ff" label={t.p1} />
              <TimerPill seconds={playTimes.p2} color="#ffd84a" label={t.p2} />
            </>
          )}
        </div>

        <HintCard
          title="STEP 2 · SOLVE"
          steps={
            isDuo
              ? [t.duoRaceHint, t.tutorialStep3, t.tutorialStep4]
              : [t.tutorialStep3, t.tutorialStep4]
          }
          color="#3de0ff"
        />
      </GestureCamera>

      <BackButton onClick={onBack} lang={lang} />
    </div>
  );
};

// ─────────── Crystal burst effect ───────────
const CrystalBurst = ({ x = "50%", y = "50%" }) => {
  const pieces = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 200 + Math.random() * 200;
    const bx = Math.cos(angle) * dist;
    const by = Math.sin(angle) * dist;
    const size = 30 + Math.random() * 40;
    const color = ["#3de0ff", "#57f5d9", "#a6f0ff", "#ffd84a"][i % 4];
    return { bx, by, size, color, delay: Math.random() * 0.2 };
  });
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 30, pointerEvents: "none" }}>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: p.size,
            height: p.size * 1.6,
            transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
            background: `linear-gradient(180deg, #ffffff, ${p.color})`,
            clipPath: "polygon(50% 0%, 90% 30%, 80% 100%, 50% 95%, 20% 100%, 10% 30%)",
            boxShadow: `0 0 30px ${p.color}`,
            animation: `burst-out 1.4s cubic-bezier(0.2, 0.7, 0.3, 1) ${p.delay}s both`,
            "--bx": `${p.bx}px`,
            "--by": `${p.by}px`,
          }}
        />
      ))}
    </div>
  );
};

// ─────────── Solved ───────────
const SolvedCelebration = ({
  time,
  name,
  onNameChange,
  onSubmit,
  onReplay,
  color = "#3de0ff",
  compact = false,
  lang = "en",
  result = "win",
  winnerTime = null,
  showReplay = true,
}) => {
  const t = useT(lang);
  const isWin = result === "win";
  const glow = color === "#3de0ff" ? "rgba(61,224,255,0.6)" : "rgba(255,216,74,0.6)";
  const headline = isWin ? t.youWin : t.youLose;
  const displayWinTime = winnerTime != null ? winnerTime : time;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: compact ? 16 : 24,
        padding: compact ? 24 : 40,
        opacity: isWin ? 1 : 0.72,
      }}
    >
      <div
        style={{
          animation: isWin ? "scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both" : "none",
          filter: isWin ? `drop-shadow(0 0 40px ${glow})` : "grayscale(0.35) brightness(0.85)",
        }}
      >
        <Mascot size={compact ? 180 : 260} holdMic={isWin} wink={!isWin} />
      </div>

      <div
        style={{
          fontFamily: "var(--f-display)",
          fontSize: compact ? 32 : 56,
          fontWeight: 700,
          background: isWin
            ? `linear-gradient(180deg, #fff 0%, ${color} 100%)`
            : "linear-gradient(180deg, #fff 0%, #888 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.04em",
          textShadow: isWin ? `0 0 24px ${glow}` : "none",
          animation: isWin ? "scale-in 0.6s ease 0.2s both" : "none",
        }}
      >
        {headline}
      </div>

      {isWin ? (
        <TimerPill seconds={time} color={color} label={t.yourTime} big={!compact} />
      ) : (
        <div
          className="glass"
          style={{
            padding: "14px 22px",
            borderRadius: 999,
            border: `1px solid ${color}30`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {t.rivalWon}
          </div>
          <TimerPill seconds={displayWinTime} color={color} label={t.winnerTime} />
        </div>
      )}

      {isWin && (
        <div
          style={{
            marginTop: compact ? 8 : 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
            width: compact ? 320 : 460,
          }}
          className="glass"
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "8px 16px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange && onNameChange(e.target.value)}
              placeholder={t.namePh}
              maxLength={12}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${color}80`,
                padding: "10px 12px",
                fontSize: compact ? 18 : 22,
                fontFamily: "var(--f-display)",
                fontWeight: 600,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                outline: "none",
              }}
            />
          </div>
          <button
            type="button"
            onClick={onSubmit}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: color,
              color: color === "#3de0ff" ? "#002338" : "#2a1500",
              border: "none",
              display: "grid",
              placeItems: "center",
              margin: 4,
              boxShadow: `0 6px 20px ${glow}`,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {showReplay && (
        <button
          type="button"
          onClick={onReplay}
          style={{
            marginTop: 12,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.55)",
            fontSize: 15,
            textDecoration: "underline",
            textUnderlineOffset: 4,
            cursor: "pointer",
            fontFamily: "var(--f-body)",
          }}
        >
          {t.playAgain}
        </button>
      )}
    </div>
  );
};

const ScreenSolved = ({
  mode = "solo",
  times,
  duoOutcome,
  onBack,
  onReplay,
  lang = "en",
  soloSession,
  duoSessions,
}) => {
  const t = useT(lang);
  const isDuo = mode === "duo";
  const [name1, setName1] = React.useState("");

  const handleReplay = () => {
    if (soloSession) soloSession.finishSolved();
    if (duoSessions) {
      duoSessions.p1.finishSolved();
      duoSessions.p2.finishSolved();
    }
    onReplay && onReplay();
  };

  const time1 = times?.[0] ?? 0;
  const time2 = times?.[1] ?? 0;
  const winner = duoOutcome?.winner ?? 1;
  const winnerTime = duoOutcome?.winnerTime ?? (winner === 1 ? time1 : time2);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <GestureCamera
        mode={mode}
        soloSession={soloSession}
        duoSessions={duoSessions}
        playEnabled={false}
        showHands={false}
        lang={lang}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(2, 6, 30, 0.78)",
            backdropFilter: "blur(20px)",
            zIndex: 8,
            pointerEvents: "none",
          }}
        />

        {!isDuo && <CrystalBurst x="50%" y="42%" />}
        {isDuo && winner === 1 && <CrystalBurst x="25%" y="42%" />}
        {isDuo && winner === 2 && <CrystalBurst x="75%" y="42%" />}

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!isDuo && (
            <SolvedCelebration
              time={time1}
              name={name1}
              onNameChange={setName1}
              onSubmit={handleReplay}
              onReplay={handleReplay}
              color="#3de0ff"
              lang={lang}
            />
          )}
          {isDuo && duoOutcome && (
            <div style={{ display: "flex", gap: 40, width: "90%", justifyContent: "center" }}>
              <div
                style={{
                  flex: 1,
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                  filter: winner === 1 ? "none" : "brightness(0.75)",
                }}
              >
                <SolvedCelebration
                  result={winner === 1 ? "win" : "lose"}
                  time={time1}
                  winnerTime={winnerTime}
                  name={name1}
                  onNameChange={setName1}
                  onSubmit={handleReplay}
                  onReplay={handleReplay}
                  color="#3de0ff"
                  compact
                  lang={lang}
                  showReplay={winner === 1}
                />
              </div>
              <div style={{ flex: 1, filter: winner === 2 ? "none" : "brightness(0.75)" }}>
                <SolvedCelebration
                  result={winner === 2 ? "win" : "lose"}
                  time={time2}
                  winnerTime={winnerTime}
                  name={name1}
                  onNameChange={setName1}
                  onSubmit={handleReplay}
                  onReplay={handleReplay}
                  color="#ffd84a"
                  compact
                  lang={lang}
                  showReplay={winner === 2}
                />
              </div>
            </div>
          )}
        </div>
      </GestureCamera>
      <BackButton onClick={onBack} lang={lang} />
    </div>
  );
};

Object.assign(window, {
  ScreenScan,
  ScreenCountdown,
  ScreenPlay,
  ScreenSolved,
  SolvedCelebration,
  CrystalBurst,
});
