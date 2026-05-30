// app.jsx — Main Micatcher Live Puzzle app

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "vibe": "safe",
  "bgVariant": "main",
  "mascotPos": "bottom-right",
  "lang": "en",
  "screen": "menu",
  "intensity": 1,
  "showBranding": true
}/*EDITMODE-END*/;

const SCREENS = [
  "menu",
  "tutorial",
  "loading",
  "scan-solo",
  "countdown-solo",
  "play-solo",
  "solved-solo",
  "scan-duo",
  "countdown-duo",
  "play-duo",
  "solved-duo",
  "error",
];

const BG_OPTIONS = ["main", "1", "2", "3", "4", "5", "6", "7", "8", "none"];
const MASCOT_OPTIONS = ["hidden", "top-left", "top-right", "bottom-left", "bottom-right"];

function useGameSessions() {
  const soloRef = React.useRef(null);
  const duoRef = React.useRef(null);
  if (!soloRef.current && window.MicatcherGameplay) {
    soloRef.current = window.MicatcherGameplay.createSoloSession();
  }
  if (!duoRef.current && window.MicatcherGameplay) {
    duoRef.current = {
      p1: window.MicatcherGameplay.createDuoPanelSession(0, 960),
      p2: window.MicatcherGameplay.createDuoPanelSession(960, 960),
    };
  }
  return { solo: soloRef.current, duo: duoRef.current };
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const lang = t.lang || "en";
  const gameSessions = useGameSessions();
  const capturedRef = React.useRef(new Set());
  const duoRaceEndedRef = React.useRef(false);
  const [duoRaceEnded, setDuoRaceEnded] = React.useState(false);
  const playStartRef = React.useRef(null);
  const [playTimes, setPlayTimes] = React.useState({ p1: 0, p2: 0 });
  const [duoOutcome, setDuoOutcome] = React.useState(null);

  const goto = (screen) => setTweak("screen", screen);

  const resetGame = (mode) => {
    capturedRef.current.clear();
    duoRaceEndedRef.current = false;
    setDuoRaceEnded(false);
    playStartRef.current = null;
    setPlayTimes({ p1: 0, p2: 0 });
    setDuoOutcome(null);
    if (mode === "duo" && gameSessions.duo) {
      gameSessions.duo.p1.reset();
      gameSessions.duo.p2.reset();
    } else if (gameSessions.solo) {
      gameSessions.solo.reset();
    }
  };

  const startScan = (mode) => {
    resetGame(mode);
    goto(mode === "duo" ? "scan-duo" : "scan-solo");
  };

  const handleCapture = ({ player }) => {
    capturedRef.current.add(player || 1);
    const need = t.screen === "scan-duo" ? 2 : 1;
    if (capturedRef.current.size >= need) {
      capturedRef.current.clear();
      goto(t.screen === "scan-duo" ? "countdown-duo" : "countdown-solo");
    }
  };

  const [solvedTimes, setSolvedTimes] = React.useState([0, 0]);

  const onGameSolved = ({ player }) => {
    const p = player || 1;

    if (t.screen === "play-duo") {
      if (duoRaceEndedRef.current) return;
      duoRaceEndedRef.current = true;
      setDuoRaceEnded(true);
      const elapsed = p === 1 ? playTimes.p1 : playTimes.p2;
      const outcome = {
        winner: p,
        times: { p1: playTimes.p1, p2: playTimes.p2 },
        winnerTime: elapsed,
      };
      setDuoOutcome(outcome);
      setSolvedTimes([playTimes.p1, playTimes.p2]);
      goto("solved-duo");
      return;
    }

    setSolvedTimes([playTimes.p1]);
    goto("solved-solo");
  };

  // ─────────── Auto-advance for loading + countdown ───────────
  React.useEffect(() => {
    if (t.screen === "loading") {
      const id = setTimeout(() => goto("scan-solo"), 1600);
      return () => clearTimeout(id);
    }
  }, [t.screen]);

  const screen = t.screen;
  const isPlayScreen = screen === "play-solo" || screen === "play-duo";

  React.useEffect(() => {
    if (!isPlayScreen) {
      playStartRef.current = null;
      return undefined;
    }
    if (!playStartRef.current) playStartRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - playStartRef.current) / 1000);
      setPlayTimes({ p1: elapsed, p2: elapsed });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlayScreen]);

  // ─────────── Stage scale for letterbox ───────────
  React.useEffect(() => {
    const apply = () => {
      const stage = document.querySelector(".kiosk");
      if (!stage) return;
      const w = window.innerWidth, h = window.innerHeight;
      const scale = Math.min(w / 1920, h / 1080);
      stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return (
    <>
      <div id="stage-host">
        <div className={`kiosk vibe-${t.vibe}`} data-screen-label={`Micatcher · ${screen}`}>
          {/* Cave environment */}
          <CaveScene bgVariant={t.bgVariant || "main"} intensity={t.intensity || 1} />

          {/* Screens */}
          {screen === "menu" && (
            <ScreenMenu
              lang={lang}
              onPickSolo={() => startScan("solo")}
              onPickDuo={() => startScan("duo")}
              onTutorial={() => goto("tutorial")}
            />
          )}
          {screen === "tutorial" && (
            <ScreenTutorial
              lang={lang}
              onBack={() => goto("menu")}
              onStart={() => goto("menu")}
            />
          )}
          {screen === "loading" && <ScreenLoading lang={lang} />}

          {screen === "scan-solo" && (
            <ScreenScan
              mode="solo"
              lang={lang}
              mascotPos={t.mascotPos}
              soloSession={gameSessions.solo}
              onBack={() => { resetGame("solo"); goto("menu"); }}
              onJustCaptured={handleCapture}
            />
          )}
          {screen === "countdown-solo" && (
            <ScreenCountdown
              mode="solo"
              lang={lang}
              soloSession={gameSessions.solo}
              onDone={() => goto("play-solo")}
            />
          )}
          {screen === "play-solo" && (
            <ScreenPlay
              mode="solo"
              lang={lang}
              mascotPos={t.mascotPos}
              soloSession={gameSessions.solo}
              playTimes={playTimes}
              onBack={() => { resetGame("solo"); goto("menu"); }}
              onSolved={onGameSolved}
            />
          )}
          {screen === "solved-solo" && (
            <ScreenSolved
              mode="solo"
              lang={lang}
              soloSession={gameSessions.solo}
              times={solvedTimes}
              onBack={() => { resetGame("solo"); goto("menu"); }}
              onReplay={() => startScan("solo")}
            />
          )}

          {screen === "scan-duo" && (
            <ScreenScan
              mode="duo"
              lang={lang}
              mascotPos={t.mascotPos}
              duoSessions={gameSessions.duo}
              onBack={() => { resetGame("duo"); goto("menu"); }}
              onJustCaptured={handleCapture}
            />
          )}
          {screen === "countdown-duo" && (
            <ScreenCountdown
              mode="duo"
              lang={lang}
              duoSessions={gameSessions.duo}
              onDone={() => goto("play-duo")}
            />
          )}
          {screen === "play-duo" && (
            <ScreenPlay
              mode="duo"
              lang={lang}
              mascotPos={t.mascotPos}
              duoSessions={gameSessions.duo}
              playTimes={playTimes}
              duoRaceEnded={duoRaceEnded}
              onBack={() => { resetGame("duo"); goto("menu"); }}
              onSolved={onGameSolved}
            />
          )}
          {screen === "solved-duo" && (
            <ScreenSolved
              mode="duo"
              lang={lang}
              duoSessions={gameSessions.duo}
              duoOutcome={duoOutcome}
              times={solvedTimes}
              onBack={() => { resetGame("duo"); goto("menu"); }}
              onReplay={() => startScan("duo")}
            />
          )}

          {screen === "error" && (
            <ScreenError
              lang={lang}
              onRetry={() => goto("loading")}
              onBack={() => goto("menu")}
            />
          )}

          {/* Branding footer */}
          {t.showBranding && (
            <div
              style={{
                position: "absolute",
                bottom: 24,
                right: 32,
                zIndex: 30,
                fontFamily: "var(--f-mono)",
                fontSize: 12,
                color: "rgba(166, 240, 255, 0.5)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                pointerEvents: "none",
                textAlign: "right",
              }}
            >
              <div>HOA SEN UNIVERSITY · 35 YEARS</div>
              <div style={{ opacity: 0.7 }}>Faculty of Marketing &amp; Communications</div>
            </div>
          )}
        </div>
      </div>

      {/* Screen selector dock — visible only in mockup */}
      <ScreenDock current={screen} onPick={goto} lang={lang} />

      <TweaksPanel>
        <TweakSection label="Screen" />
        <TweakSelect
          label="Current screen"
          value={screen}
          options={SCREENS}
          onChange={(v) => setTweak("screen", v)}
        />

        <TweakSection label="Aesthetic" />
        <TweakRadio
          label="Vibe"
          value={t.vibe}
          options={["safe", "creative", "bold"]}
          onChange={(v) => setTweak("vibe", v)}
        />
        <TweakSelect
          label="Background asset"
          value={t.bgVariant}
          options={BG_OPTIONS}
          onChange={(v) => setTweak("bgVariant", v)}
        />
        <TweakSlider
          label="FX intensity"
          value={t.intensity}
          min={0.3}
          max={1.4}
          step={0.05}
          onChange={(v) => setTweak("intensity", v)}
        />

        <TweakSection label="Mascot" />
        <TweakSelect
          label="Position"
          value={t.mascotPos}
          options={MASCOT_OPTIONS}
          onChange={(v) => setTweak("mascotPos", v)}
        />

        <TweakSection label="Locale" />
        <TweakRadio
          label="Language"
          value={t.lang}
          options={["en", "vi"]}
          onChange={(v) => setTweak("lang", v)}
        />
        <TweakToggle
          label="Show branding"
          value={t.showBranding}
          onChange={(v) => setTweak("showBranding", v)}
        />
      </TweaksPanel>
    </>
  );
}

// Bottom-of-screen dock to jump between screens — visible only when not in fullscreen
const ScreenDock = ({ current, onPick, lang = "en" }) => {
  const labels = {
    "menu": "Menu",
    "tutorial": "Tutorial",
    "loading": "Loading",
    "scan-solo": "Solo · Scan",
    "countdown-solo": "Solo · 3·2·1",
    "play-solo": "Solo · Play",
    "solved-solo": "Solo · Won",
    "scan-duo": "Duo · Scan",
    "countdown-duo": "Duo · 3·2·1",
    "play-duo": "Duo · Play",
    "solved-duo": "Duo · Won",
    "error": "Error",
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        right: 320,
        zIndex: 100,
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: 8,
        background: "rgba(0,0,0,0.6)",
        borderRadius: 12,
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ width: "100%", fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Mockup screen navigator
      </div>
      {SCREENS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          style={{
            fontFamily: "var(--f-mono)",
            fontSize: 11,
            padding: "6px 10px",
            borderRadius: 6,
            border: `1px solid ${s === current ? "var(--cyan)" : "rgba(255,255,255,0.12)"}`,
            background: s === current ? "rgba(61,224,255,0.15)" : "rgba(0,0,0,0.4)",
            color: s === current ? "var(--cyan)" : "rgba(255,255,255,0.6)",
            cursor: "pointer",
          }}
        >
          {labels[s] || s}
        </button>
      ))}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
