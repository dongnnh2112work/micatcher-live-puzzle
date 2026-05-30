import { COLS, ROWS } from './constants';
import type { NormBounds, Tile } from './types';

export type { Tile };

export function generatePuzzleState(cols: number = COLS, rows: number = ROWS): Tile[] {
  const tiles: Tile[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      tiles.push({ currentX: x, currentY: y, origX: x, origY: y, id: y * cols + x });
    }
  }
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

export function checkWinCondition(tiles: Tile[]): boolean {
  return tiles.every((tile, index) => tile.id === index);
}

export function swapTiles(tiles: Tile[], indexA: number, indexB: number): Tile[] {
  const next = [...tiles];
  [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
  return next;
}

/** Tâm ô lưới (tọa độ local trên bảng puzzle) — bù offset khi kéo. */
export function tileGridCenter(
  gridIndex: number,
  cols: number,
  rows: number,
  boardW: number,
  boardH: number
): { cx: number; cy: number } {
  const drawCol = gridIndex % cols;
  const drawRow = Math.floor(gridIndex / cols);
  return {
    cx: (drawCol + 0.5) * (boardW / cols),
    cy: (drawRow + 0.5) * (boardH / rows)
  };
}

/** Chụp frame video đã mirror (giống khi vẽ lên canvas). */
export function captureMirroredFrame(video: HTMLVideoElement, width: number, height: number): ImageData {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Crop vùng khung tay từ frame full → canvas ảnh puzzle (×2 resolution).
 * `bounds` là tọa độ normalized từ hai tay khi SCANNING.
 */
export function cropPuzzleImageFromFrame(
  fullFrame: ImageData,
  bounds: NormBounds,
  layout: { canvasW: number; canvasH: number; offsetX: number; panelW: number }
): HTMLCanvasElement | null {
  const { canvasW: W, canvasH: H, offsetX, panelW } = layout;
  const c = bounds;
  const sxPanel = (1 - c.maxX) * panelW;
  const sy = c.minY * H;
  const sw = (1 - c.minX) * panelW - sxPanel;
  const sh = c.maxY * H - sy;
  const sxFull = offsetX + sxPanel;

  if (sw <= 0 || sh <= 0) return null;

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = sw * 2;
  cropCanvas.height = sh * 2;
  const cropCtx = cropCanvas.getContext('2d');
  const tempC = document.createElement('canvas');
  tempC.width = W;
  tempC.height = H;
  tempC.getContext('2d')?.putImageData(fullFrame, 0, 0);
  if (cropCtx) {
    cropCtx.drawImage(tempC, sxFull, sy, sw, sh, 0, 0, cropCanvas.width, cropCanvas.height);
  }
  return cropCanvas;
}

/** Vẽ lưới puzzle lên ctx (gốc đã translate tới góc bảng). */
export function renderPuzzleBoard(
  ctx: CanvasRenderingContext2D,
  imageSource: ImageBitmap | HTMLCanvasElement,
  tiles: Tile[],
  cols: number,
  rows: number,
  destWidth: number,
  destHeight: number,
  dragInfo: { index: number; x: number; y: number } | null,
  hoverIndex: number | null
): void {
  const destTileW = destWidth / cols;
  const destTileH = destHeight / rows;
  const srcTileW = imageSource.width / cols;
  const srcTileH = imageSource.height / rows;
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, destWidth, destHeight);

  const drawTile = (tile: Tile, dx: number, dy: number, w: number, h: number, isDragging = false) => {
    const sx = tile.origX * srcTileW;
    const sy = tile.origY * srcTileH;
    ctx.save();
    if (isDragging) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 10;
      ctx.strokeStyle = '#ccff00';
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
    }
    ctx.drawImage(imageSource, sx, sy, srcTileW, srcTileH, dx, dy, w, h);
    ctx.strokeRect(dx, dy, w, h);
    ctx.restore();
  };

  tiles.forEach((tile, currentIndex) => {
    const drawCol = currentIndex % cols;
    const drawRow = Math.floor(currentIndex / cols);
    const dx = drawCol * destTileW;
    const dy = drawRow * destTileH;
    if (dragInfo && dragInfo.index === currentIndex) {
      ctx.fillStyle = '#222';
      ctx.fillRect(dx, dy, destTileW, destTileH);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(dx, dy, destTileW, destTileH);
    } else if (dragInfo && hoverIndex === currentIndex) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      drawTile(tile, dx, dy, destTileW, destTileH);
      ctx.fillStyle = 'rgba(204, 255, 0, 0.2)';
      ctx.fillRect(dx, dy, destTileW, destTileH);
      ctx.strokeStyle = '#ccff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx, dy, destTileW, destTileH);
      ctx.restore();
    } else {
      drawTile(tile, dx, dy, destTileW, destTileH);
    }
  });

  if (dragInfo) {
    const tile = tiles[dragInfo.index];
    const dragW = destTileW * 1.1;
    const dragH = destTileH * 1.1;
    drawTile(tile, dragInfo.x - dragW / 2, dragInfo.y - dragH / 2, dragW, dragH, true);
  }
}
