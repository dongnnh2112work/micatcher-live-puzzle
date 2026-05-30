(function (G) {
  const CAPTURE_COOLDOWN_MS = G.CAPTURE_COOLDOWN_MS;
  const COLS = G.COLS;
  const ROWS = G.ROWS;

  function emptyDrag() {
    return { isDragging: false, tileIndex: null, grabOffsetX: 0, grabOffsetY: 0 };
  }

  G.PuzzlePlayerSession = function PuzzlePlayerSession(layout) {
    this.layout = layout;
    this.phase = "SCANNING";
    this.tiles = [];
    this.puzzleImage = null;
    this.boardBounds = null;
    this._lastFrameBounds = null;
    this._lastCaptureAt = 0;
    this._drag = emptyDrag();
    this._smoothCursor = { x: 0, y: 0 };
  };

  G.PuzzlePlayerSession.prototype.reset = function () {
    this.phase = "SCANNING";
    this.tiles = [];
    this.puzzleImage = null;
    this.boardBounds = null;
    this._lastFrameBounds = null;
    this._lastCaptureAt = 0;
    this._drag = emptyDrag();
    this._smoothCursor = { x: 0, y: 0 };
  };

  G.PuzzlePlayerSession.prototype.finishSolved = function () {
    this.reset();
  };

  G.PuzzlePlayerSession.prototype.getBoardRect = function (canvasW, canvasH) {
    if (!this.boardBounds) return null;
    return G.normBoundsToBoardRect(this.boardBounds, canvasW, canvasH, this.layout);
  };

  G.PuzzlePlayerSession.prototype.tickScan = function (
    landmarks,
    video,
    canvasW,
    canvasH,
    now
  ) {
    now = now || Date.now();
    const metrics = G.measureTwoHandPinch(landmarks);
    var justCaptured = false;
    var scanRect = null;

    if (metrics && metrics.framing) {
      this._lastFrameBounds = G.frameBoundsFromTwoHands(landmarks);
    }

    if (
      metrics &&
      metrics.pinching &&
      this._lastFrameBounds &&
      now - this._lastCaptureAt >= CAPTURE_COOLDOWN_MS
    ) {
      this._lastCaptureAt = now;
      const m = G.layoutMetrics(this.layout, canvasW, canvasH);
      const fullFrame = G.captureMirroredFrame(video, canvasW, canvasH);
      const cropped = G.cropPuzzleImageFromFrame(fullFrame, this._lastFrameBounds, {
        canvasW: canvasW,
        canvasH: canvasH,
        offsetX: m.offsetX,
        panelW: m.panelW,
      });
      if (cropped) {
        this.puzzleImage = cropped;
        this.tiles = G.generatePuzzleState(COLS, ROWS);
        this.boardBounds = Object.assign({}, this._lastFrameBounds);
        this.phase = "PLAYING";
        justCaptured = true;
      }
    }

    if (this._lastFrameBounds && metrics && metrics.framing) {
      scanRect = G.normBoundsToBoardRect(
        this._lastFrameBounds,
        canvasW,
        canvasH,
        this.layout
      );
    }

    return {
      frameBounds: this._lastFrameBounds,
      metrics: metrics,
      justCaptured: justCaptured,
      scanRect: scanRect,
    };
  };

  G.PuzzlePlayerSession.prototype.tickPlay = function (hand, canvasW, canvasH) {
    if (
      (this.phase !== "PLAYING" && this.phase !== "SOLVED") ||
      !this.puzzleImage ||
      !this.boardBounds
    ) {
      return null;
    }

    const boardRect = G.normBoundsToBoardRect(
      this.boardBounds,
      canvasW,
      canvasH,
      this.layout
    );
    var hoverIndex = null;
    var cursor = null;
    var justSolved = false;

    if (hand && hand.length > 8) {
      const raw = G.pinchPointerOnCanvas(hand, this.layout, canvasW, canvasH);
      const pinching = G.isPinchActive(hand, this._drag.isDragging);
      this._smoothCursor = G.smoothPointer(
        this._smoothCursor,
        raw,
        this._drag.isDragging
      );
      cursor = { x: this._smoothCursor.x, y: this._smoothCursor.y };
      hoverIndex = G.hoverIndexOnBoard(
        cursor.x,
        cursor.y,
        boardRect,
        COLS,
        ROWS
      );

      if (this.phase === "PLAYING") {
        const relX = cursor.x - boardRect.sx;
        const relY = cursor.y - boardRect.sy;

        if (pinching) {
          if (!this._drag.isDragging && hoverIndex !== null) {
            const center = G.tileGridCenter(
              hoverIndex,
              COLS,
              ROWS,
              boardRect.w,
              boardRect.h
            );
            this._drag = {
              isDragging: true,
              tileIndex: hoverIndex,
              grabOffsetX: relX - center.cx,
              grabOffsetY: relY - center.cy,
            };
          }
        } else if (this._drag.isDragging) {
          const startIndex = this._drag.tileIndex;
          const endIndex = hoverIndex;
          if (
            startIndex !== null &&
            endIndex !== null &&
            startIndex !== endIndex
          ) {
            this.tiles = G.swapTiles(this.tiles, startIndex, endIndex);
            if (G.checkWinCondition(this.tiles)) {
              this.phase = "SOLVED";
              justSolved = true;
            }
          }
          this._drag = emptyDrag();
        }
      }
    }

    const drag =
      this._drag.isDragging && this._drag.tileIndex !== null
        ? {
            tileIndex: this._drag.tileIndex,
            x: (cursor ? cursor.x : 0) - boardRect.sx - this._drag.grabOffsetX,
            y: (cursor ? cursor.y : 0) - boardRect.sy - this._drag.grabOffsetY,
          }
        : null;

    return {
      boardRect: boardRect,
      hoverIndex: hoverIndex,
      cursor: cursor,
      isDragging: this._drag.isDragging,
      drag: drag,
      justSolved: justSolved,
    };
  };
})(window.MicatcherGameplay);
