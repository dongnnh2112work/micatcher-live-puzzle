import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/** Trạng thái vòng đời một người chơi / một bảng puzzle. */
export type GamePhase = 'SCANNING' | 'PLAYING' | 'SOLVED';

/** Khung tay (normalized 0–1, gốc MediaPipe trên video/crop). */
export type NormBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

/** Một ô puzzle (vị trí hiện tại trên lưới + ảnh gốc). */
export type Tile = {
  currentX: number;
  currentY: number;
  origX: number;
  origY: number;
  id: number;
};

/** Vùng bảng trên canvas pixel (đã mirror X). */
export type BoardRect = {
  sx: number;
  sy: number;
  w: number;
  h: number;
};

export type DragState = {
  isDragging: boolean;
  tileIndex: number | null;
  grabOffsetX: number;
  grabOffsetY: number;
};

/** Solo: toàn canvas. Duo: một nửa màn (offsetX + panelW). */
export type ViewLayout =
  | { mode: 'full' }
  | { mode: 'panel'; offsetX: number; panelW: number };

export type PinchMetrics = {
  d1: number;
  d2: number;
  framing: boolean;
  pinching: boolean;
};

export type ScanTickResult = {
  frameBounds: NormBounds | null;
  metrics: PinchMetrics | null;
  /** true khi vừa chụp xong và chuyển sang PLAYING */
  justCaptured: boolean;
  scanRect: BoardRect | null;
};

export type PlayTickResult = {
  boardRect: BoardRect;
  hoverIndex: number | null;
  cursor: { x: number; y: number } | null;
  isDragging: boolean;
  drag: {
    tileIndex: number;
    x: number;
    y: number;
  } | null;
  /** true nếu vừa đạt SOLVED trong frame này */
  justSolved: boolean;
};

/** Kết quả detect tay — truyền từ HandLandmarker vào session. */
export type HandLandmarksInput = NormalizedLandmark[][] | undefined;
