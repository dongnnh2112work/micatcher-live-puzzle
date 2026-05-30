(function (G) {
  G.layoutMetrics = function (layout, canvasW, canvasH) {
    if (layout.mode === "full") {
      return { offsetX: 0, panelW: canvasW, canvasH: canvasH };
    }
    return { offsetX: layout.offsetX, panelW: layout.panelW, canvasH: canvasH };
  };

  G.normBoundsToBoardRect = function (bounds, canvasW, canvasH, layout) {
    const m = G.layoutMetrics(layout, canvasW, canvasH);
    const sx = m.offsetX + (1 - bounds.maxX) * m.panelW;
    const ex = m.offsetX + (1 - bounds.minX) * m.panelW;
    const sy = bounds.minY * canvasH;
    const ey = bounds.maxY * canvasH;
    return { sx: sx, sy: sy, w: ex - sx, h: ey - sy };
  };

  G.panelNormToCanvas = function (lm, offsetX, panelW, fullH) {
    return { x: offsetX + (1 - lm.x) * panelW, y: lm.y * fullH };
  };

  G.mapHandToCanvas = function (hand, offsetX, panelW, fullH) {
    return hand.map(function (lm) {
      return G.panelNormToCanvas(lm, offsetX, panelW, fullH);
    });
  };

  G.pinchPointerOnCanvas = function (hand, layout, canvasW, canvasH) {
    const indexTip = hand[8];
    const thumbTip = hand[4];
    const m = G.layoutMetrics(layout, canvasW, canvasH);
    return {
      x: m.offsetX + (1 - (indexTip.x + thumbTip.x) / 2) * m.panelW,
      y: ((indexTip.y + thumbTip.y) / 2) * canvasH,
    };
  };

  G.hoverIndexOnBoard = function (cursorX, cursorY, board, cols, rows) {
    const relX = cursorX - board.sx;
    const relY = cursorY - board.sy;
    if (relX < 0 || relX > board.w || relY < 0 || relY > board.h) return null;
    const col = Math.floor(relX / (board.w / cols));
    const row = Math.floor(relY / (board.h / rows));
    if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
    return row * cols + col;
  };
})(window.MicatcherGameplay);
