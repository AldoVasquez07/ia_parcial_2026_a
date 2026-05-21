function mainLoop() {
  if (!S.running || S.paused) return;
  S.rafId = requestAnimationFrame(mainLoop);

  const steps = Math.min(S.speed, 10);
  for (let i = 0; i < steps; i++) {
    if (!S.running) break;
    gameTick();
  }

  updateCamera();
  render();
  updateLiveStats();
}

function gameTick() {
  S.tick++;
  ensureObstacles();
  S.pop.forEach(a => stepAvatar(a));

  const alive = S.pop.filter(a => a.alive).length;
  if (alive === 0 || S.tick >= CFG.MAX_TICKS) {
    evolve();
  }
}