(function (G) {
  const COLS = G.COLS;
  const ROWS = G.ROWS;

  G.PLAYER_COLORS = { p1: G.COL_P1, p2: G.COL_P2 };

  G.drawMirroredVideo = function (ctx, video, W, H) {
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();
  };

  G.drawScanOverlay = function (ctx, scan, label) {
    label = label || "Pinch to capture";
    if (!scan.scanRect || !scan.metrics || !scan.metrics.framing) return;
    const r = scan.scanRect;
    ctx.strokeStyle = "#ccff00";
    ctx.lineWidth = 4;
    ctx.strokeRect(r.sx, r.sy, r.w, r.h);
    ctx.fillStyle = "white";
    ctx.font = "bold 14px monospace";
    ctx.fillText(label, r.sx, r.sy - 8);
  };

  G.drawPlayLayer = function (ctx, session, play, cursorColor) {
    const boardRect = play.boardRect;
    const img = session.puzzleImage;
    if (!img) return;

    ctx.save();
    ctx.translate(boardRect.sx, boardRect.sy);
    G.renderPuzzleBoard(
      ctx,
      img,
      session.tiles,
      COLS,
      ROWS,
      boardRect.w,
      boardRect.h,
      play.drag ? { index: play.drag.tileIndex, x: play.drag.x, y: play.drag.y } : null,
      play.hoverIndex
    );
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, boardRect.w, boardRect.h);
    ctx.restore();

    if (play.cursor) {
      ctx.beginPath();
      ctx.arc(play.cursor.x, play.cursor.y, 10, 0, Math.PI * 2);
      if (play.isDragging) {
        ctx.fillStyle = cursorColor;
        ctx.fill();
      } else {
        ctx.strokeStyle = cursorColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  G.drawHandsOverlay = function (ctx, landmarks, layout, canvasW, canvasH, color, phase) {
    if (!landmarks || phase === "SOLVED") return;
    const m = G.layoutMetrics(layout, canvasW, canvasH);
    const hands = G.filterHandsForDisplay(landmarks);
    for (var i = 0; i < hands.length; i++) {
      const pts = G.mapHandToCanvas(hands[i], m.offsetX, m.panelW, m.canvasH);
      G.drawHandSkeletonPixels(ctx, pts, color, 3);
    }
  };

  G.drawDuoDivider = function (ctx, canvasW, canvasH) {
    ctx.strokeStyle = "rgba(204, 255, 0, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvasW / 2, 0);
    ctx.lineTo(canvasW / 2, canvasH);
    ctx.stroke();
  };
})(window.MicatcherGameplay);
