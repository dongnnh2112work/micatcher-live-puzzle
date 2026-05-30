export const PINCH_THRESHOLD = 0.05;
/** Mở tay rộng hơn một chút mới tính là thả — giảm giật quanh ngưỡng nắm. */
export const PINCH_RELEASE_THRESHOLD = 0.092;
export const FRAME_THRESHOLD = 0.1;
export const ROWS = 3;
export const COLS = 3;

/** Debounce giữa hai lần chụp (pinch đồng thời). */
export const CAPTURE_COOLDOWN_MS = 1000;

export const COL_P1 = '#ffffff';
export const COL_P2 = '#ef4444';

export const handLandmarkerBaseOptions = {
  modelAssetPath:
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  delegate: 'GPU' as const
};

export const handLandmarkerOptionsFull = {
  baseOptions: handLandmarkerBaseOptions,
  runningMode: 'VIDEO' as const,
  numHands: 2,
  minHandDetectionConfidence: 0.65,
  minHandPresenceConfidence: 0.55,
  minTrackingConfidence: 0.5
};
