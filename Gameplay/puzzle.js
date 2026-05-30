(function (G) {
  const { COLS, ROWS } = G;

  G.generatePuzzleState = function (cols, rows) {
    cols = cols || COLS;
    rows = rows || ROWS;
    const tiles = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        tiles.push({ currentX: x, currentY: y, origX: x, origY: y, id: y * cols + x });
      }
    }
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
  };

  G.checkWinCondition = function (tiles) {
    return tiles.every(function (tile, index) {
      return tile.id === index;
    });
  };

  G.swapTiles = function (tiles, indexA, indexB) {
    const next = tiles.slice();
    const tmp = next[indexA];
    next[indexA] = next[indexB];
    next[indexB] = tmp;
    return next;
  };

  G.tileGridCenter = function (gridIndex, cols, rows, boardW, boardH) {
    const drawCol = gridIndex % cols;
    const drawRow = Math.floor(gridIndex / cols);
    return {
      cx: (drawCol + 0.5) * (boardW / cols),
      cy: (drawRow + 0.5) * (boardH / rows),
    };
  };

  G.captureMirroredFrame = function (video, width, height) {
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context");
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  };

  G.cropPuzzleImageFromFrame = function (fullFrame, bounds, layout) {
    const W = layout.canvasW;
    const H = layout.canvasH;
    const offsetX = layout.offsetX;
    const panelW = layout.panelW;
    const c = bounds;
    const sxPanel = (1 - c.maxX) * panelW;
    const sy = c.minY * H;
    const sw = (1 - c.minX) * panelW - sxPanel;
    const sh = c.maxY * H - sy;
    const sxFull = offsetX + sxPanel;
    if (sw <= 0 || sh <= 0) return null;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = sw * 2;
    cropCanvas.height = sh * 2;
    const cropCtx = cropCanvas.getContext("2d");
    const tempC = document.createElement("canvas");
    tempC.width = W;
    tempC.height = H;
    tempC.getContext("2d").putImageData(fullFrame, 0, 0);
    if (cropCtx) {
      cropCtx.drawImage(tempC, sxFull, sy, sw, sh, 0, 0, cropCanvas.width, cropCanvas.height);
    }
    return cropCanvas;
  };

  G.renderPuzzleBoard = function (
    ctx,
    imageSource,
    tiles,
    cols,
    rows,
    destWidth,
    destHeight,
    dragInfo,
    hoverIndex
  ) {
    const destTileW = destWidth / cols;
    const destTileH = destHeight / rows;
    const srcTileW = imageSource.width / cols;
    const srcTileH = imageSource.height / rows;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, destWidth, destHeight);

    function drawTile(tile, dx, dy, w, h, isDragging) {
      const sx = tile.origX * srcTileW;
      const sy = tile.origY * srcTileH;
      ctx.save();
      if (isDragging) {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 10;
        ctx.strokeStyle = "#ccff00";
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
      }
      ctx.drawImage(imageSource, sx, sy, srcTileW, srcTileH, dx, dy, w, h);
      ctx.strokeRect(dx, dy, w, h);
      ctx.restore();
    }

    tiles.forEach(function (tile, currentIndex) {
      const drawCol = currentIndex % cols;
      const drawRow = Math.floor(currentIndex / cols);
      const dx = drawCol * destTileW;
      const dy = drawRow * destTileH;
      if (dragInfo && dragInfo.index === currentIndex) {
        ctx.fillStyle = "#222";
        ctx.fillRect(dx, dy, destTileW, destTileH);
        ctx.strokeStyle = "#333";
        ctx.strokeRect(dx, dy, destTileW, destTileH);
      } else if (dragInfo && hoverIndex === currentIndex) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        drawTile(tile, dx, dy, destTileW, destTileH);
        ctx.fillStyle = "rgba(204, 255, 0, 0.2)";
        ctx.fillRect(dx, dy, destTileW, destTileH);
        ctx.strokeStyle = "#ccff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(dx, dy, destTileW, destTileH);
        ctx.restore();
      } else {
        drawTile(tile, dx, dy, destTileW, destTileH);
      }
    });

    if (dragInfo) {
      const tile = tiles[dragInfo.index];
      const dragW = destTileW * 1.1;
      const dragH = destTileH * 1.1;
      drawTile(
        tile,
        dragInfo.x - dragW / 2,
        dragInfo.y - dragH / 2,
        dragW,
        dragH,
        true
      );
    }
  };
})(window.MicatcherGameplay);
