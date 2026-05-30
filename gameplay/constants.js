(function (G) {
  G.PINCH_THRESHOLD = 0.05;
  G.PINCH_RELEASE_THRESHOLD = 0.092;
  G.FRAME_THRESHOLD = 0.1;
  G.ROWS = 3;
  G.COLS = 3;
  G.CAPTURE_COOLDOWN_MS = 1000;
  G.COL_P1 = "#ffffff";
  G.COL_P2 = "#ef4444";

  G.handLandmarkerBaseOptions = {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    delegate: "GPU",
  };

  G.handLandmarkerOptionsFull = {
    baseOptions: G.handLandmarkerBaseOptions,
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.65,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.5,
  };

  G.VISION_WASM =
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
})(window.MicatcherGameplay = window.MicatcherGameplay || {});
