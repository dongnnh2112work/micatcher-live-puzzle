import { CAPTURE_COOLDOWN_MS, COLS, ROWS } from './constants';
import { normBoundsToBoardRect, pinchPointerOnCanvas, hoverIndexOnBoard, layoutMetrics } from './coordinates';
import {
  measureTwoHandPinch,
  frameBoundsFromTwoHands,
  isPinchActive,
  smoothPointer
} from './gestures';
import {
  generatePuzzleState,
  checkWinCondition,
  swapTiles,
  tileGridCenter,
  captureMirroredFrame,
  cropPuzzleImageFromFrame
} from './puzzle';
import type {
  GamePhase,
  NormBounds,
  Tile,
  ViewLayout,
  DragState,
  HandLandmarksInput,
  ScanTickResult,
  PlayTickResult,
  BoardRect
} from './types';

const emptyDrag = (): DragState => ({
  isDragging: false,
  tileIndex: null,
  grabOffsetX: 0,
  grabOffsetY: 0
});

/**
 * Một người chơi / một bảng puzzle — toàn bộ state & logic frame.
 * UI khác chỉ cần: gọi tickScan / tickPlay, đọc getters, vẽ theo kết quả hoặc dùng `canvas-draw.ts`.
 */
export class PuzzlePlayerSession {
  phase: GamePhase = 'SCANNING';
  tiles: Tile[] = [];
  puzzleImage: HTMLCanvasElement | null = null;
  boardBounds: NormBounds | null = null;

  private lastFrameBounds: NormBounds | null = null;
  private lastCaptureAt = 0;
  private drag: DragState = emptyDrag();
  private smoothCursor = { x: 0, y: 0 };

  constructor(public readonly layout: ViewLayout) {}

  reset(): void {
    this.phase = 'SCANNING';
    this.tiles = [];
    this.puzzleImage = null;
    this.boardBounds = null;
    this.lastFrameBounds = null;
    this.lastCaptureAt = 0;
    this.drag = emptyDrag();
    this.smoothCursor = { x: 0, y: 0 };
  }

  getBoardRect(canvasW: number, canvasH: number): BoardRect | null {
    if (!this.boardBounds) return null;
    return normBoundsToBoardRect(this.boardBounds, canvasW, canvasH, this.layout);
  }

  /**
   * Giai đoạn SCANNING — cần đúng 2 tay trong landmarks.
   * Khi `justCaptured`, phase chuyển PLAYING và `puzzleImage` / `tiles` đã sẵn sàng.
   */
  tickScan(
    landmarks: HandLandmarksInput,
    video: HTMLVideoElement,
    canvasW: number,
    canvasH: number,
    now: number = Date.now()
  ): ScanTickResult {
    const metrics = measureTwoHandPinch(landmarks);
    let justCaptured = false;
    let scanRect: BoardRect | null = null;

    if (metrics?.framing) {
      this.lastFrameBounds = frameBoundsFromTwoHands(landmarks!);
    }

    if (
      metrics?.pinching &&
      this.lastFrameBounds &&
      now - this.lastCaptureAt >= CAPTURE_COOLDOWN_MS
    ) {
      this.lastCaptureAt = now;
      const { offsetX, panelW } = layoutMetrics(this.layout, canvasW, canvasH);
      const fullFrame = captureMirroredFrame(video, canvasW, canvasH);
      const cropped = cropPuzzleImageFromFrame(fullFrame, this.lastFrameBounds, {
        canvasW,
        canvasH,
        offsetX,
        panelW
      });
      if (cropped) {
        this.puzzleImage = cropped;
        this.tiles = generatePuzzleState(COLS, ROWS);
        this.boardBounds = { ...this.lastFrameBounds };
        this.phase = 'PLAYING';
        justCaptured = true;
      }
    }

    if (this.lastFrameBounds && metrics?.framing) {
      scanRect = normBoundsToBoardRect(this.lastFrameBounds, canvasW, canvasH, this.layout);
    }

    return {
      frameBounds: this.lastFrameBounds,
      metrics,
      justCaptured,
      scanRect
    };
  }

  /**
   * Giai đoạn PLAYING / SOLVED — một tay primary (pickPrimaryHand).
   */
  tickPlay(
    hand: import('@mediapipe/tasks-vision').NormalizedLandmark[] | undefined,
    canvasW: number,
    canvasH: number
  ): PlayTickResult | null {
    if ((this.phase !== 'PLAYING' && this.phase !== 'SOLVED') || !this.puzzleImage || !this.boardBounds) {
      return null;
    }

    const boardRect = normBoundsToBoardRect(this.boardBounds, canvasW, canvasH, this.layout);
    let hoverIndex: number | null = null;
    let cursor: { x: number; y: number } | null = null;
    let justSolved = false;

    if (hand && hand.length > 8) {
      const raw = pinchPointerOnCanvas(hand, this.layout, canvasW, canvasH);
      const pinching = isPinchActive(hand, this.drag.isDragging);
      this.smoothCursor = smoothPointer(this.smoothCursor, raw, this.drag.isDragging);
      cursor = { ...this.smoothCursor };
      hoverIndex = hoverIndexOnBoard(cursor.x, cursor.y, boardRect, COLS, ROWS);

      if (this.phase === 'PLAYING') {
        const relX = cursor.x - boardRect.sx;
        const relY = cursor.y - boardRect.sy;

        if (pinching) {
          if (!this.drag.isDragging && hoverIndex !== null) {
            const { cx, cy } = tileGridCenter(hoverIndex, COLS, ROWS, boardRect.w, boardRect.h);
            this.drag = {
              isDragging: true,
              tileIndex: hoverIndex,
              grabOffsetX: relX - cx,
              grabOffsetY: relY - cy
            };
          }
        } else if (this.drag.isDragging) {
          const startIndex = this.drag.tileIndex;
          const endIndex = hoverIndex;
          if (startIndex !== null && endIndex !== null && startIndex !== endIndex) {
            this.tiles = swapTiles(this.tiles, startIndex, endIndex);
            if (checkWinCondition(this.tiles)) {
              this.phase = 'SOLVED';
              justSolved = true;
            }
          }
          this.drag = emptyDrag();
        }
      }
    }

    const drag =
      this.drag.isDragging && this.drag.tileIndex !== null
        ? {
            tileIndex: this.drag.tileIndex,
            x: (cursor?.x ?? 0) - boardRect.sx - this.drag.grabOffsetX,
            y: (cursor?.y ?? 0) - boardRect.sy - this.drag.grabOffsetY
          }
        : null;

    return {
      boardRect,
      hoverIndex,
      cursor,
      isDragging: this.drag.isDragging,
      drag,
      justSolved
    };
  }

  /** Sau khi người chơi lưu tên / bỏ qua — quay lại SCANNING (giữ layout). */
  finishSolved(): void {
    this.reset();
  }
}
