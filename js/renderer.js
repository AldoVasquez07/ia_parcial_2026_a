function worldToScreen(wx) { return wx - S.camX; }

function drawGround() {
  const gY = S.groundY;
  ctx.fillStyle = 'rgba(26,28,40,0.95)';
  ctx.fillRect(0, gY, canvas.width, canvas.height - gY);

  ctx.strokeStyle = 'rgba(96,165,250,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, gY); ctx.lineTo(canvas.width, gY); ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  const gridW = 90;
  const offset = (((-S.camX) % gridW) + gridW) % gridW;
  for (let x = offset; x < canvas.width; x += gridW) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, gY); ctx.stroke();
  }

  ctx.fillStyle = 'rgba(96,165,250,0.2)';
  ctx.font = '8px IBM Plex Mono';
  for (let x = offset; x < canvas.width; x += gridW) {
    ctx.fillText(Math.round((S.camX + x) / gridW), x + 2, gY + 12);
  }
}

function drawObstacles() {
  S.obstacles.forEach(o => {
    const sx = worldToScreen(o.wx);
    if (sx < -80 || sx > canvas.width + 80) return;

    const gy = S.groundY;
    ctx.fillStyle = 'rgba(248,113,113,0.12)';
    ctx.strokeStyle = 'rgba(248,113,113,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(sx, gy - o.h, o.w, o.h, 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = 'rgba(248,113,113,0.3)';
    ctx.beginPath();
    ctx.roundRect(sx, gy - o.h, o.w, 3, [2, 2, 0, 0]);
    ctx.fill();
  });
}

function drawAvatar(a, isBest) {
  if (!a.alive && S.view === 'best') return;
  const sx = worldToScreen(a.wx);
  if (sx < -100 || sx > canvas.width + 100) return;

  const feet = S.groundY - a.wy;
  const alpha = a.alive ? (isBest ? 1 : 0.42) : 0.08;
  const col = isBest ? '#fbbf24' : a.color;
  const lw  = isBest ? 2.2 : 1.5;
  const lp  = a.legPhase;
  const inAir = a.wy > 1;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = col;
  ctx.fillStyle   = col;
  ctx.lineCap     = 'round';
  ctx.lineWidth   = lw;

  const legSwing = inAir ? 0 : 1;
  const lL = Math.sin(lp) * 13 * legSwing;
  const lR = Math.sin(lp + Math.PI) * 13 * legSwing;
  const aL = Math.sin(lp + Math.PI * 0.5) * 9;
  const aR = Math.sin(lp - Math.PI * 0.5) * 9;

  const hip      = feet - 15;
  const torsoBot = feet - 15;
  const torsoTop = feet - 33;
  const midTorso = feet - 25;
  const headCY   = feet - 41;
  const headR    = isBest ? 8 : 7;

  ctx.beginPath(); ctx.moveTo(sx - 3, hip); ctx.lineTo(sx - 5, feet + lL); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx + 3, hip); ctx.lineTo(sx + 5, feet + lR); ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sx - 3, torsoBot);
  ctx.lineTo(sx - 7, torsoTop);
  ctx.lineTo(sx + 7, torsoTop);
  ctx.lineTo(sx + 3, torsoBot);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath(); ctx.moveTo(sx - 5, midTorso); ctx.lineTo(sx - 13, midTorso + 9 + aL); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx + 5, midTorso); ctx.lineTo(sx + 13, midTorso + 9 + aR); ctx.stroke();

  ctx.beginPath(); ctx.arc(sx, headCY, headR, 0, Math.PI * 2);
  ctx.fill();

  if (isBest) {
    ctx.globalAlpha = alpha * 0.25;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.arc(sx, headCY, 14, 0, Math.PI * 2); ctx.stroke();

    if (a.alive && !inAir) {
      const g = a.g;
      const detectDist = CFG.DETECT_MIN + ((g[2] + 1) / 2) * (CFG.DETECT_MAX - CFG.DETECT_MIN);
      const nearObs = S.obstacles.find(o =>
        o.wx + o.w > a.wx - 10 && o.wx < a.wx + detectDist + 30
      );
      if (nearObs && a.g[3] > -0.1) {
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(worldToScreen(nearObs.wx + nearObs.w / 2), S.groundY - nearObs.h / 2, nearObs.h * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  ctx.restore();
}

function drawHUD() {
  const alive = S.pop.filter(a => a.alive).length;
  const best  = getBest();
  ctx.save();
  ctx.font = '9px IBM Plex Mono';
  ctx.fillStyle = 'rgba(96,165,250,0.5)';
  ctx.fillText(`GEN ${S.gen}  ·  VIVOS: ${alive}/${CFG.POP}  ·  TICK: ${S.tick}`, 10, 16);
  if (best && best.alive) {
    ctx.fillStyle = 'rgba(251,191,36,0.6)';
    ctx.fillText(`★ FIT: ${best.fit.toFixed(0)}  OBS: ${best.obsCrossed}  SALTOS: ${best.jumpCount}`, 10, 30);
  }
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  drawObstacles();
  const best = getBest();
  if (S.view === 'all') {
    S.pop.forEach(a => { if (a !== best) drawAvatar(a, false); });
  }
  if (best) drawAvatar(best, true);
  drawHUD();
}

function drawIdleScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(74,222,128,0.4)';
  ctx.font = '700 18px Space Grotesk';
  ctx.fillText('Presiona INICIAR para evolucionar', canvas.width / 2, canvas.height / 2 - 16);
  ctx.font = '400 10px IBM Plex Mono';
  ctx.fillStyle = 'rgba(120,128,160,0.7)';
  ctx.fillText('Los avatares aprenderán a saltar obstáculos generación tras generación', canvas.width / 2, canvas.height / 2 + 10);
  ctx.fillStyle = 'rgba(74,222,128,0.2)';
  ctx.fillText('Gen 0: caminan sin saltar  →  Gen 5+: descubren el salto  →  Gen 10+: saltan con precisión', canvas.width / 2, canvas.height / 2 + 28);
  ctx.textAlign = 'left';
  ctx.restore();
}

function updateCamera() {
  const best = getBest();
  if (!best) return;
  S.camTarget = Math.max(0, best.wx - canvas.width * 0.22);
  S.camX += (S.camTarget - S.camX) * 0.1;
}