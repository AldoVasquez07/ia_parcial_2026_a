function stepAvatar(a) {
  if (!a.alive) return;
  a.ticksAlive++;

  const g = a.g;
  const walkSpd    = CFG.WALK_BASE + ((g[0] + 1) / 2) * (CFG.WALK_MAX - CFG.WALK_BASE);
  const jumpImp    = CFG.JUMP_MIN  + ((g[1] + 1) / 2) * (CFG.JUMP_MAX - CFG.JUMP_MIN);
  const detectDist = CFG.DETECT_MIN + ((g[2] + 1) / 2) * (CFG.DETECT_MAX - CFG.DETECT_MIN);
  const jumpWill   = g[3];
  const legAmp     = 0.3 + ((g[4] + 1) / 2) * 0.7;

  const onGround = a.wy <= 0.5;

  const nearObs = S.obstacles.find(o =>
    o.wx + o.w > a.wx - 10 && o.wx < a.wx + detectDist + 30
  );

  if (nearObs && onGround && a.jumpCooldown <= 0 && jumpWill > -0.1) {
    const dist = nearObs.wx - (a.wx + 10);
    if (dist > 0 && dist < detectDist) {
      const heightNorm   = nearObs.h / CFG.OBS_H_MAX;
      const heightSensor = (g[5] + 1) / 2;
      const shouldJump   = Math.abs(heightSensor - heightNorm) < 0.7 + jumpWill * 0.4;
      if (shouldJump) {
        a.vy = jumpImp;
        a.jumpCooldown = 22;
        a.jumpCount++;
        a.didJumpAtAll = true;
      }
    }
  }
  if (a.jumpCooldown > 0) a.jumpCooldown--;

  a.wx += walkSpd;

  a.vy -= CFG.GRAVITY;
  a.wy += a.vy;
  if (a.wy <= 0) { a.wy = 0; a.vy = 0; }

  a.legPhase += legAmp * 0.17;

  for (const o of S.obstacles) {
    const hitX = (a.wx + 10 > o.wx) && (a.wx - 10 < o.wx + o.w);
    const hitY = (a.wy < o.h) && (a.wy + 42 > 0);
    if (hitX && hitY) {
      a.alive = false;
      break;
    }
  }

  const cleared = S.obstacles.filter(o => o.wx + o.w < a.wx - 8).length;
  if (cleared > a.obsCrossed) a.obsCrossed = cleared;

  a.fit = (a.wx - 80) * CFG.FIT_DIST
        + a.obsCrossed * CFG.FIT_OBS
        + a.ticksAlive * CFG.FIT_TIME;
}

function finalizeFitness(a) {
  if (!a.alive && a.obsCrossed === 0) {
    a.fit = Math.max(0, a.fit - CFG.FIT_DEATH_PENALTY);
  }
  if (a.didJumpAtAll && a.obsCrossed > 0) {
    a.fit += a.jumpCount * 15;
  }
}