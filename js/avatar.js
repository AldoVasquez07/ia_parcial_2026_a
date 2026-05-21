function makeAvatar(genome) {
  const hue = Math.floor(Math.random() * 360);
  return {
    g: genome,
    wx: 80,
    wy: 0,
    vx: 0,
    vy: 0,
    alive: true,
    fit: 0,
    obsCrossed: 0,
    ticksAlive: 0,
    jumpCooldown: 0,
    legPhase: 0,
    color: `hsl(${hue},65%,58%)`,
    jumpCount: 0,
    didJumpAtAll: false,
  };
}

function resetAvatars() {
  S.pop.forEach(a => {
    a.wx = 80; a.wy = 0; a.vx = 0; a.vy = 0;
    a.alive = true; a.fit = 0;
    a.obsCrossed = 0; a.ticksAlive = 0;
    a.jumpCooldown = 0; a.legPhase = 0;
    a.jumpCount = 0; a.didJumpAtAll = false;
  });
}

function getBest() {
  if (!S.pop.length) return null;
  return S.pop.reduce((b, a) => a.fit > b.fit ? a : b, S.pop[0]);
}