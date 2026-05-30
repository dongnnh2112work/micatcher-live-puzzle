// gesture-camera.jsx — MediaPipe + gameplay loop (from Gameplay/gameplay export)

const G = () => window.MicatcherGameplay;

const CameraLoadingOverlay = ({ lang, message }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 6,
      display: "grid",
      placeItems: "center",
      background: "rgba(2, 6, 30, 0.72)",
      backdropFilter: "blur(12px)",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div className="spinner" style={{ margin: "0 auto 20px" }} />
      <div
        style={{
          fontFamily: "var(--f-mono)",
          fontSize: 14,
          color: "var(--cyan-soft)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {message || (lang === "vi" ? "Đang bật camera & AI…" : "Starting camera & AI…")}
      </div>
    </div>
  </div>
);

const CameraErrorOverlay = ({ lang }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 6,
      display: "grid",
      placeItems: "center",
      background: "rgba(2, 6, 30, 0.85)",
      padding: 48,
      textAlign: "center",
    }}
  >
    <div style={{ fontFamily: "var(--f-display)", fontSize: 28, color: "var(--magenta)", marginBottom: 12 }}>
      {lang === "vi" ? "Không mở được camera" : "Camera unavailable"}
    </div>
    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 480 }}>
      {lang === "vi"
        ? "Cho phép webcam và tải lại trang. Cần HTTPS hoặc localhost."
        : "Allow webcam access and reload. HTTPS or localhost required."}
    </div>
  </div>
);

/**
 * @param {object} props
 * @param {'solo'|'duo'} props.mode
 * @param {object} [props.soloSession] — PuzzlePlayerSession
 * @param {{p1,p2}} [props.duoSessions]
 * @param {boolean} [props.playEnabled] — tickPlay + vẽ puzzle
 * @param {function} [props.onJustCaptured] — ({ player?: 1|2 })
 * @param {function} [props.onSolved] — ({ player?: 1|2 })
 * @param {string} [props.scanLabel]
 * @param {string} [props.lang]
 */
const GestureCamera = ({
  mode = "solo",
  soloSession,
  duoSessions,
  playEnabled = true,
  duoRaceEnded = false,
  showHands = true,
  onJustCaptured,
  onSolved,
  scanLabel,
  lang = "en",
  children,
}) => {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [status, setStatus] = React.useState("loading");
  const playEnabledRef = React.useRef(playEnabled);
  const duoRaceEndedRef = React.useRef(duoRaceEnded);
  const onCaptureRef = React.useRef(onJustCaptured);
  const onSolvedRef = React.useRef(onSolved);

  React.useEffect(() => {
    playEnabledRef.current = playEnabled && !duoRaceEnded;
  }, [playEnabled, duoRaceEnded]);

  React.useEffect(() => {
    duoRaceEndedRef.current = duoRaceEnded;
  }, [duoRaceEnded]);

  React.useEffect(() => {
    onCaptureRef.current = onJustCaptured;
  }, [onJustCaptured]);

  React.useEffect(() => {
    onSolvedRef.current = onSolved;
  }, [onSolved]);

  React.useEffect(() => {
    const MicatcherG = G();
    if (!MicatcherG) {
      setStatus("error");
      return undefined;
    }

    let raf = 0;
    let cancelled = false;
    let landmarker = null;
    let lmLeft = null;
    let lmRight = null;

    (async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      try {
        await MicatcherG.waitForMediaPipe();
        if (mode === "duo") {
          const duo = await MicatcherG.createDuoHandLandmarkers();
          lmLeft = duo.left;
          lmRight = duo.right;
        } else {
          landmarker = await MicatcherG.createHandLandmarker();
        }
        await MicatcherG.startUserCamera(video);
        if (cancelled) return;
        setStatus("ready");

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2d required");

        const loop = () => {
          if (cancelled) return;
          if (video.readyState < 2) {
            raf = requestAnimationFrame(loop);
            return;
          }

          const W = video.videoWidth;
          const H = video.videoHeight;
          canvas.width = W;
          canvas.height = H;
          const t = performance.now();

          ctx.clearRect(0, 0, W, H);
          MicatcherG.drawMirroredVideo(ctx, video, W, H);

          if (mode === "solo" && soloSession) {
            const session = soloSession;
            const results = landmarker.detectForVideo(video, t);

            if (session.phase === "SCANNING") {
              const scan = session.tickScan(results.landmarks, video, W, H);
              MicatcherG.drawScanOverlay(ctx, scan, scanLabel);
              if (scan.justCaptured) onCaptureRef.current?.({ player: 1 });
            } else if (playEnabledRef.current) {
              const hand = MicatcherG.pickPrimaryHand(results.landmarks);
              const play = session.tickPlay(hand, W, H);
              if (play) {
                MicatcherG.drawPlayLayer(ctx, session, play, MicatcherG.PLAYER_COLORS.p1);
                if (play.justSolved) onSolvedRef.current?.({ player: 1 });
              }
            }

            if (showHands) {
              MicatcherG.drawHandsOverlay(
                ctx,
                results.landmarks,
                session.layout,
                W,
                H,
                MicatcherG.PLAYER_COLORS.p1,
                session.phase
              );
            }
          } else if (mode === "duo" && duoSessions) {
            const hw = W / 2;
            duoSessions.p1.layout = { mode: "panel", offsetX: 0, panelW: hw };
            duoSessions.p2.layout = { mode: "panel", offsetX: hw, panelW: hw };
            const crops = MicatcherG.prepareDuoCropBuffers(video, hw, H);
            const resL = lmLeft.detectForVideo(crops.left, t);
            const resR = lmRight.detectForVideo(crops.right, t);

            MicatcherG.drawDuoDivider(ctx, W, H);

            function tickPanel(session, landmarks, color, playerId) {
              if (duoRaceEndedRef.current) return;
              if (session.phase === "SCANNING") {
                const scan = session.tickScan(landmarks, video, W, H);
                MicatcherG.drawScanOverlay(ctx, scan, scanLabel);
                if (scan.justCaptured) onCaptureRef.current?.({ player: playerId });
              } else if (playEnabledRef.current) {
                const hand = MicatcherG.pickPrimaryHand(landmarks);
                const play = session.tickPlay(hand, W, H);
                if (play) {
                  MicatcherG.drawPlayLayer(ctx, session, play, color);
                  if (play.justSolved) onSolvedRef.current?.({ player: playerId });
                }
              }
              if (showHands) {
                MicatcherG.drawHandsOverlay(
                  ctx,
                  landmarks,
                  session.layout,
                  W,
                  H,
                  color,
                  session.phase
                );
              }
            }

            tickPanel(duoSessions.p1, resL.landmarks, MicatcherG.PLAYER_COLORS.p1, 1);
            tickPanel(duoSessions.p2, resR.landmarks, MicatcherG.PLAYER_COLORS.p2, 2);
          }

          raf = requestAnimationFrame(loop);
        };

        raf = requestAnimationFrame(loop);
      } catch (err) {
        console.error("[GestureCamera]", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      const video = videoRef.current;
      const stream = video && video.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((tr) => tr.stop());
      }
      if (landmarker && landmarker.close) landmarker.close();
      if (lmLeft && lmLeft.close) lmLeft.close();
      if (lmRight && lmRight.close) lmRight.close();
    };
  }, [mode, soloSession, duoSessions, scanLabel, showHands]);

  return (
    <div className="gesture-camera" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <video ref={videoRef} playsInline muted aria-hidden="true" style={{ display: "none" }} />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {status === "loading" && <CameraLoadingOverlay lang={lang} />}
      {status === "error" && <CameraErrorOverlay lang={lang} />}
      {children}
    </div>
  );
};

Object.assign(window, { GestureCamera, CameraLoadingOverlay, CameraErrorOverlay });
