/**
 * Live Puzzle — gameplay export (không phụ thuộc React/Next).
 * Copy thư mục `export/gameplay` vào project UI mới + cài @mediapipe/tasks-vision.
 */

export * from './types';
export * from './constants';
export * from './puzzle';
export * from './coordinates';
export * from './gestures';
export * from './hand-tracking';
export * from './PuzzlePlayerSession';
export * from './canvas-draw';

import { PuzzlePlayerSession } from './PuzzlePlayerSession';

/** Session solo — toàn canvas. */
export function createSoloSession(): PuzzlePlayerSession {
  return new PuzzlePlayerSession({ mode: 'full' });
}

/** Session duo — một nửa màn (offsetX = 0 trái, W/2 phải). */
export function createDuoPanelSession(offsetX: number, panelW: number): PuzzlePlayerSession {
  return new PuzzlePlayerSession({ mode: 'panel', offsetX, panelW });
}
