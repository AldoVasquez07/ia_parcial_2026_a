function ensureObstacles() {
  const frontier = S.camX + canvas.width + 1800;
  let lastX = S.obstacles.length > 0
    ? Math.max(...S.obstacles.map(o => o.wx))
    : 300;

  while (lastX < frontier) {
    lastX += CFG.OBS_GAP_MIN + Math.random() * (CFG.OBS_GAP_MAX - CFG.OBS_GAP_MIN);
    S.obstacles.push({
      wx: lastX,
      w:  CFG.OBS_W_MIN + Math.random() * (CFG.OBS_W_MAX - CFG.OBS_W_MIN),
      h:  CFG.OBS_H_MIN + Math.random() * (CFG.OBS_H_MAX - CFG.OBS_H_MIN),
    });
  }
  S.obstacles = S.obstacles.filter(o => o.wx > S.camX - 200);
}