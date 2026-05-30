(function (G) {
  G.createSoloSession = function () {
    return new G.PuzzlePlayerSession({ mode: "full" });
  };

  G.createDuoPanelSession = function (offsetX, panelW) {
    return new G.PuzzlePlayerSession({ mode: "panel", offsetX: offsetX, panelW: panelW });
  };

  G.createDuoSessions = function () {
    return { p1: G.createDuoPanelSession(0, 0), p2: G.createDuoPanelSession(0, 0) };
  };
})(window.MicatcherGameplay);
