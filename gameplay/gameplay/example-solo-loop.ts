/**
 * Ví dụ tham chiếu — không chạy trực tiếp trong repo Next.
 * Copy logic vào UI mới (sau khi có phần tử video + canvas trong DOM).
 */
import {
  createSoloSession,
  createHandLandmarker,
  startUserCamera,
  pickPrimaryHand,
  drawMirroredVideo,
  drawScanOverlay,
  drawPlayLayer,
  drawHandsOverlay,
  PLAYER_COLORS
} from './index';

export async function runSoloGameplayLoop(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  hooks: {
    onPlayingStart?: () => void;
    onSolved?: () => void;
  } = {}
): Promise<() => void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2d required');

  const session = createSoloSession();
  const landmarker = await createHandLandmarker();
  await startUserCamera(video);

  let raf = 0;
  const loop = () => {
    if (video.readyState < 2) {
      raf = requestAnimationFrame(loop);
      return;
    }

    const W = video.videoWidth;
    const H = video.videoHeight;
    canvas.width = W;
    canvas.height = H;

    const results = landmarker.detectForVideo(video, performance.now());

    ctx.clearRect(0, 0, W, H);
    drawMirroredVideo(ctx, video, W, H);

    if (session.phase === 'SCANNING') {
      const scan = session.tickScan(results.landmarks, video, W, H);
      drawScanOverlay(ctx, scan);
      if (scan.justCaptured) hooks.onPlayingStart?.();
    } else {
      const hand = pickPrimaryHand(results.landmarks);
      const play = session.tickPlay(hand, W, H);
      if (play) {
        drawPlayLayer(ctx, session, play, PLAYER_COLORS.p1);
        if (play.justSolved) hooks.onSolved?.();
      }
    }

    drawHandsOverlay(ctx, results.landmarks, session.layout, W, H, PLAYER_COLORS.p1, session.phase);
    raf = requestAnimationFrame(loop);
  };

  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    const stream = video.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    landmarker.close();
  };
}
