(function (G) {
  const INDEX = 8;
  const THUMB = 4;
  const FRAME_THRESHOLD = G.FRAME_THRESHOLD;
  const PINCH_THRESHOLD = G.PINCH_THRESHOLD;
  const PINCH_RELEASE_THRESHOLD = G.PINCH_RELEASE_THRESHOLD;

  function pinchDistance(hand) {
    return Math.hypot(hand[INDEX].x - hand[THUMB].x, hand[INDEX].y - hand[THUMB].y);
  }

  G.measureTwoHandPinch = function (landmarks) {
    if (!landmarks || landmarks.length !== 2) return null;
    const d1 = pinchDistance(landmarks[0]);
    const d2 = pinchDistance(landmarks[1]);
    return {
      d1: d1,
      d2: d2,
      framing: d1 > FRAME_THRESHOLD && d2 > FRAME_THRESHOLD,
      pinching: d1 < PINCH_THRESHOLD && d2 < PINCH_THRESHOLD,
    };
  };

  G.frameBoundsFromTwoHands = function (landmarks) {
    const h1 = landmarks[0];
    const h2 = landmarks[1];
    const allX = [h1[INDEX].x, h1[THUMB].x, h2[INDEX].x, h2[THUMB].x];
    const allY = [h1[INDEX].y, h1[THUMB].y, h2[INDEX].y, h2[THUMB].y];
    return {
      minX: Math.min.apply(null, allX),
      maxX: Math.max.apply(null, allX),
      minY: Math.min.apply(null, allY),
      maxY: Math.max.apply(null, allY),
    };
  };

  G.isPinchActive = function (hand, wasDragging) {
    const dist = pinchDistance(hand);
    return wasDragging ? dist < PINCH_RELEASE_THRESHOLD : dist < PINCH_THRESHOLD;
  };

  G.smoothPointer = function (current, raw, wasDragging) {
    const distMove = Math.hypot(raw.x - current.x, raw.y - current.y);
    const alpha = wasDragging ? 0.26 : distMove > 100 ? 1 : 0.4;
    return {
      x: current.x * (1 - alpha) + raw.x * alpha,
      y: current.y * (1 - alpha) + raw.y * alpha,
    };
  };
})(window.MicatcherGameplay);
