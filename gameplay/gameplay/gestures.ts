import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { FRAME_THRESHOLD, PINCH_THRESHOLD, PINCH_RELEASE_THRESHOLD } from './constants';
import type { NormBounds, PinchMetrics } from './types';

const INDEX = 8;
const THUMB = 4;

function pinchDistance(hand: NormalizedLandmark[]): number {
  return Math.hypot(hand[INDEX].x - hand[THUMB].x, hand[INDEX].y - hand[THUMB].y);
}

/** Hai tay đang tạo khung (ngón giơ) hoặc đang nắm (pinch). */
export function measureTwoHandPinch(
  landmarks: NormalizedLandmark[][] | undefined
): PinchMetrics | null {
  if (!landmarks || landmarks.length !== 2) return null;
  const h1 = landmarks[0];
  const h2 = landmarks[1];
  const d1 = pinchDistance(h1);
  const d2 = pinchDistance(h2);
  return {
    d1,
    d2,
    framing: d1 > FRAME_THRESHOLD && d2 > FRAME_THRESHOLD,
    pinching: d1 < PINCH_THRESHOLD && d2 < PINCH_THRESHOLD
  };
}

/** Cập nhật khung từ hai tay khi đang framing. */
export function frameBoundsFromTwoHands(landmarks: NormalizedLandmark[][]): NormBounds {
  const h1 = landmarks[0];
  const h2 = landmarks[1];
  const allX = [h1[INDEX].x, h1[THUMB].x, h2[INDEX].x, h2[THUMB].x];
  const allY = [h1[INDEX].y, h1[THUMB].y, h2[INDEX].y, h2[THUMB].y];
  return {
    minX: Math.min(...allX),
    maxX: Math.max(...allX),
    minY: Math.min(...allY),
    maxY: Math.max(...allY)
  };
}

export function isPinchActive(
  hand: NormalizedLandmark[],
  wasDragging: boolean
): boolean {
  const dist = pinchDistance(hand);
  return wasDragging ? dist < PINCH_RELEASE_THRESHOLD : dist < PINCH_THRESHOLD;
}

/** Exponential smoothing cho con trỏ — giảm rung landmark. */
export function smoothPointer(
  current: { x: number; y: number },
  raw: { x: number; y: number },
  wasDragging: boolean
): { x: number; y: number } {
  const distMove = Math.hypot(raw.x - current.x, raw.y - current.y);
  const alpha = wasDragging ? 0.26 : distMove > 100 ? 1 : 0.4;
  return {
    x: current.x * (1 - alpha) + raw.x * alpha,
    y: current.y * (1 - alpha) + raw.y * alpha
  };
}
