import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { handLandmarkerOptionsFull } from './constants';

const MIN_WRIST_VISIBILITY = 0.5;
const VISION_WASM =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';

export async function createHandLandmarker(): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(VISION_WASM);
  return HandLandmarker.createFromOptions(vision, handLandmarkerOptionsFull);
}

export async function createDuoHandLandmarkers(): Promise<{
  left: HandLandmarker;
  right: HandLandmarker;
}> {
  const vision = await FilesetResolver.forVisionTasks(VISION_WASM);
  const [left, right] = await Promise.all([
    HandLandmarker.createFromOptions(vision, handLandmarkerOptionsFull),
    HandLandmarker.createFromOptions(vision, handLandmarkerOptionsFull)
  ]);
  return { left, right };
}

export function handPassesFilter(
  hand: NormalizedLandmark[] | undefined
): hand is NormalizedLandmark[] {
  if (!hand?.length || !hand[0]) return false;
  const vis = hand[0].visibility;
  if (vis === undefined || vis === null) return true;
  return vis >= MIN_WRIST_VISIBILITY;
}

export function pickPrimaryHand(
  landmarks: NormalizedLandmark[][] | undefined
): NormalizedLandmark[] | undefined {
  if (!landmarks?.length) return undefined;
  const candidates = landmarks.filter(handPassesFilter);
  const pool = candidates.length > 0 ? candidates : landmarks;
  let best = pool[0];
  let bestD = Math.abs(pool[0][0].x - 0.5);
  for (let i = 1; i < pool.length; i++) {
    const d = Math.abs(pool[i][0].x - 0.5);
    if (d < bestD) {
      bestD = d;
      best = pool[i];
    }
  }
  return best;
}

export function filterHandsForDisplay(
  landmarks: NormalizedLandmark[][] | undefined
): NormalizedLandmark[][] {
  if (!landmarks?.length) return [];
  return landmarks.filter(handPassesFilter);
}

export function drawHandSkeletonPixels(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[],
  color: string,
  lineWidth: number
): void {
  for (const conn of HandLandmarker.HAND_CONNECTIONS) {
    const a = landmarks[conn.start];
    const b = landmarks[conn.end];
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(lm.x, lm.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Camera user-facing — gợi ý constraints giống app gốc. */
export async function startUserCamera(video: HTMLVideoElement): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
  });
  video.srcObject = stream;
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => {
      video.play().then(() => resolve()).catch(reject);
    };
  });
  return stream;
}

/**
 * Duo: crop nửa video sang canvas phụ để detect (mirror logic giống GestureCameraDuo).
 * Trả về canvas trái/phải đã vẽ sẵn frame.
 */
export function prepareDuoCropBuffers(
  video: HTMLVideoElement,
  panelPixelW: number,
  panelPixelH: number
): { left: HTMLCanvasElement; right: HTMLCanvasElement } {
  const left = document.createElement('canvas');
  const right = document.createElement('canvas');
  left.width = panelPixelW;
  left.height = panelPixelH;
  right.width = panelPixelW;
  right.height = panelPixelH;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const vw2 = vw / 2;
  left.getContext('2d')?.drawImage(video, vw2, 0, vw2, vh, 0, 0, panelPixelW, panelPixelH);
  right.getContext('2d')?.drawImage(video, 0, 0, vw2, vh, 0, 0, panelPixelW, panelPixelH);
  return { left, right };
}
