import { COL_P1, COL_P2, COLS, ROWS } from './constants';
import { mapHandToCanvas, layoutMetrics } from './coordinates';
import { renderPuzzleBoard } from './puzzle';
import { drawHandSkeletonPixels, filterHandsForDisplay } from './hand-tracking';
import type { PuzzlePlayerSession } from './PuzzlePlayerSession';
import type { HandLandmarksInput, ViewLayout } from './types';
import type { ScanTickResult, PlayTickResult } from './types';

/** Vẽ video mirror full canvas (giống app gốc). */
export function drawMirroredVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  W: number,
  H: number
): void {
  ctx.save();
  ctx.translate(W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, W, H);
  ctx.restore();
}

/** Khung vàng + nhãn khi SCANNING. */
export function drawScanOverlay(
  ctx: CanvasRenderingContext2D,
  scan: ScanTickResult,
  label = 'Nắm để chụp'
): void {
  if (!scan.scanRect || !scan.metrics?.framing) return;
  const { sx, sy, w, h } = scan.scanRect;
  ctx.strokeStyle = '#ccff00';
  ctx.lineWidth = 4;
  ctx.strokeRect(sx, sy, w, h);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(label, sx, sy - 8);
}

/** Bảng puzzle + viền + con trỏ pinch. */
export function drawPlayLayer(
  ctx: CanvasRenderingContext2D,
  session: PuzzlePlayerSession,
  play: PlayTickResult,
  cursorColor: string
): void {
  const { boardRect, hoverIndex, cursor, drag, isDragging } = play;
  const img = session.puzzleImage;
  if (!img) return;

  ctx.save();
  ctx.translate(boardRect.sx, boardRect.sy);
  renderPuzzleBoard(
    ctx,
    img,
    session.tiles,
    COLS,
    ROWS,
    boardRect.w,
    boardRect.h,
    drag ? { index: drag.tileIndex, x: drag.x, y: drag.y } : null,
    hoverIndex
  );
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, boardRect.w, boardRect.h);
  ctx.restore();

  if (cursor) {
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2);
    if (isDragging) {
      ctx.fillStyle = cursorColor;
      ctx.fill();
    } else {
      ctx.strokeStyle = cursorColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

/** Khung xương tay (không vẽ khi SOLVED). */
export function drawHandsOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmarksInput,
  layout: ViewLayout,
  canvasW: number,
  canvasH: number,
  color: string,
  phase: string
): void {
  if (!landmarks || phase === 'SOLVED') return;
  const { offsetX, panelW, canvasH: H } = layoutMetrics(layout, canvasW, canvasH);
  for (const h of filterHandsForDisplay(landmarks)) {
    const pts = mapHandToCanvas(h, offsetX, panelW, H);
    drawHandSkeletonPixels(ctx, pts, color, 3);
  }
}

/** Đường chia đôi duo. */
export function drawDuoDivider(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void {
  ctx.strokeStyle = 'rgba(204, 255, 0, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvasW / 2, 0);
  ctx.lineTo(canvasW / 2, canvasH);
  ctx.stroke();
}

export const PLAYER_COLORS = { p1: COL_P1, p2: COL_P2 } as const;
