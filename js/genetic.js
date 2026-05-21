function tournament() {
  let best = null;
  for (let i = 0; i < CFG.K_TOURN; i++) {
    const c = S.pop[Math.floor(Math.random() * CFG.POP)];
    if (!best || c.fit > best.fit) best = c;
  }
  return best;
}

function blxCrossover(a, b) {
  const child = new Float32Array(CFG.GENES);
  for (let i = 0; i < CFG.GENES; i++) {
    const lo = Math.min(a[i], b[i]);
    const hi = Math.max(a[i], b[i]);
    const range = hi - lo;
    const ext = range * CFG.BLX_ALPHA;
    child[i] = Math.max(-1, Math.min(1,
      lo - ext + Math.random() * (range + 2 * ext)
    ));
  }
  return child;
}

function mutate(genome) {
  const m = new Float32Array(genome);
  for (let i = 0; i < CFG.GENES; i++) {
    if (Math.random() < CFG.MUTATION_RATE) {
      const u = 1 - Math.random();
      const v = Math.random();
      const gauss = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      m[i] = Math.max(-1, Math.min(1, m[i] + gauss * CFG.MUTATION_SIGMA));
    }
  }
  return m;
}

function evolve() {
  S.pop.forEach(a => finalizeFitness(a));
  S.pop.sort((a, b) => b.fit - a.fit);

  const bestFit = S.pop[0].fit;
  const avgFit  = S.pop.reduce((s, a) => s + a.fit, 0) / CFG.POP;
  const jumpRate = S.pop.filter(a => a.didJumpAtAll).length / CFG.POP;
  const bestObs  = S.pop[0].obsCrossed;

  S.bestHistory.push(bestFit);
  S.avgHistory.push(avgFit);
  S.jumpRateHistory.push(jumpRate);

  const eliteGenomes = S.pop.slice(0, CFG.ELITE).map(a => new Float32Array(a.g));
  const newPop = eliteGenomes.map(g => makeAvatar(new Float32Array(g)));

  while (newPop.length < CFG.POP) {
    const p1 = tournament();
    const p2 = tournament();
    const childGenome = mutate(blxCrossover(p1.g, p2.g));
    newPop.push(makeAvatar(childGenome));
  }

  S.gen++;
  S.pop = newPop;
  S.tick = 0;
  S.obstacles = [];
  S.camX = 0;
  S.camTarget = 0;
  resetAvatars();
  ensureObstacles();

  log(
    `Gen ${S.gen} — fit: ${bestFit.toFixed(0)} · avg: ${avgFit.toFixed(0)} · saltos: ${(jumpRate*100).toFixed(0)}%`,
    jumpRate > 0.5 ? 'g' : jumpRate > 0.2 ? 'n' : 'b'
  );
  updateSideUI();
  drawFitnessChart();
  updateGenHistory();
  updatePhaseUI(jumpRate, bestObs);
}