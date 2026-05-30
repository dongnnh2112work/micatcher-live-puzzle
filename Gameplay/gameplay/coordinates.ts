import type { NormBounds, BoardRect, ViewLayout } from './types';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/** panelW = full canvas W khi solo; = W/2 khi duo panel. */
export function layoutMetrics(layout: ViewLayout, canvasW: number, canvasH: number) {
  if (layout.mode === 'full') {
    return { offsetX: 0, panelW: canvasW, canvasH };
  }
  return { offsetX: layout.offsetX, panelW: layout.panelW, canvasH };
}

/** Bounds normalized → rect pixel trên canvas (đã mirror X). */
export function normBoundsToBoardRect(
  bounds: NormBounds,
  canvasW: number,
  canvasH: number,
  layout: ViewLayout
): BoardRect {
  const { offsetX, panelW } = layoutMetrics(layout, canvasW, canvasH);
  const sx = offsetX + (1 - bounds.maxX) * panelW;
  const ex = offsetX + (1 - bounds.minX) * panelW;
  const sy = bounds.minY * canvasH;
  const ey = bounds.maxY * canvasH;
  return { sx, sy, w: ex - sx, h: ey - sy };
}

export function panelNormToCanvas(
  lm: { x: number; y: number },
  offsetX: number,
  panelW: number,
  fullH: number
): { x: number; y: number } {
  return { x: offsetX + (1 - lm.x) * panelW, y: lm.y * fullH };
}

export function mapHandToCanvas(
  hand: NormalizedLandmark[],
  offsetX: number,
  panelW: number,
  fullH: number
): { x: number; y: number }[] {
  return hand.map((lm) => panelNormToCanvas(lm, offsetX, panelW, fullH));
}

/** Con trỏ pinch (giữa ngón trỏ + cái) trên canvas. */
export function pinchPointerOnCanvas(
  hand: NormalizedLandmark[],
  layout: ViewLayout,
  canvasW: number,
  canvasH: number
): { x: number; y: number } {
  const indexTip = hand[8];
  const thumbTip = hand[4];
  const { offsetX, panelW } = layoutMetrics(layout, canvasW, canvasH);
  return {
    x: offsetX + (1 - (indexTip.x + thumbTip.x) / 2) * panelW,
    y: ((indexTip.y + thumbTip.y) / 2) * canvasH
  };
}

export function hoverIndexOnBoard(
  cursorX: number,
  cursorY: number,
  board: BoardRect,
  cols: number,
  rows: number
): number | null {
  const relX = cursorX - board.sx;
  const relY = cursorY - board.sy;
  if (relX < 0 || relX > board.w || relY < 0 || relY > board.h) return null;
  const col = Math.floor(relX / (board.w / cols));
  const row = Math.floor(relY / (board.h / rows));
  if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
  return row * cols + col;
}
