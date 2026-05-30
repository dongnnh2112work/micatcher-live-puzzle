(function (G) {
  const MIN_WRIST_VISIBILITY = 0.5;

  G.waitForMediaPipe = function () {
    if (window.MPV) return Promise.resolve(window.MPV);
    return new Promise(function (resolve) {
      function onReady() {
        window.removeEventListener("mp-ready", onReady);
        resolve(window.MPV);
      }
      window.addEventListener("mp-ready", onReady);
    });
  };

  G.createHandLandmarker = async function () {
    const MPV = await G.waitForMediaPipe();
    const vision = await MPV.FilesetResolver.forVisionTasks(G.VISION_WASM);
    return MPV.HandLandmarker.createFromOptions(vision, G.handLandmarkerOptionsFull);
  };

  G.createDuoHandLandmarkers = async function () {
    const MPV = await G.waitForMediaPipe();
    const vision = await MPV.FilesetResolver.forVisionTasks(G.VISION_WASM);
    const left = await MPV.HandLandmarker.createFromOptions(
      vision,
      G.handLandmarkerOptionsFull
    );
    const right = await MPV.HandLandmarker.createFromOptions(
      vision,
      G.handLandmarkerOptionsFull
    );
    return { left: left, right: right };
  };

  G.handPassesFilter = function (hand) {
    if (!hand || !hand.length || !hand[0]) return false;
    const vis = hand[0].visibility;
    if (vis === undefined || vis === null) return true;
    return vis >= MIN_WRIST_VISIBILITY;
  };

  G.pickPrimaryHand = function (landmarks) {
    if (!landmarks || !landmarks.length) return undefined;
    const candidates = landmarks.filter(G.handPassesFilter);
    const pool = candidates.length > 0 ? candidates : landmarks;
    var best = pool[0];
    var bestD = Math.abs(pool[0][0].x - 0.5);
    for (var i = 1; i < pool.length; i++) {
      const d = Math.abs(pool[i][0].x - 0.5);
      if (d < bestD) {
        bestD = d;
        best = pool[i];
      }
    }
    return best;
  };

  G.filterHandsForDisplay = function (landmarks) {
    if (!landmarks || !landmarks.length) return [];
    return landmarks.filter(G.handPassesFilter);
  };

  G.drawHandSkeletonPixels = function (ctx, landmarks, color, lineWidth) {
    const MPV = window.MPV;
    if (!MPV || !MPV.HandLandmarker) return;
    const conns = MPV.HandLandmarker.HAND_CONNECTIONS;
    for (var i = 0; i < conns.length; i++) {
      const conn = conns[i];
      const a = landmarks[conn.start];
      const b = landmarks[conn.end];
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (var j = 0; j < landmarks.length; j++) {
      const lm = landmarks[j];
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(lm.x, lm.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  G.startUserCamera = async function (video) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });
    video.srcObject = stream;
    await new Promise(function (resolve, reject) {
      video.onloadedmetadata = function () {
        video.play().then(resolve).catch(reject);
      };
    });
    return stream;
  };

  G.prepareDuoCropBuffers = function (video, panelPixelW, panelPixelH) {
    const left = document.createElement("canvas");
    const right = document.createElement("canvas");
    left.width = panelPixelW;
    left.height = panelPixelH;
    right.width = panelPixelW;
    right.height = panelPixelH;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const vw2 = vw / 2;
    left.getContext("2d").drawImage(video, vw2, 0, vw2, vh, 0, 0, panelPixelW, panelPixelH);
    right.getContext("2d").drawImage(video, 0, 0, vw2, vh, 0, 0, panelPixelW, panelPixelH);
    return { left: left, right: right };
  };
})(window.MicatcherGameplay);
