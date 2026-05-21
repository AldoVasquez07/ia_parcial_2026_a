function startEvol() {
  resize();
  S = {
    ...S,
    running: true,
    paused: false,
    gen: 0,
    tick: 0,
    pop: Array.from({ length: CFG.POP }, () => makeAvatar(randomGene())),
    obstacles: [],
    camX: 0,
    camTarget: 0,
    bestHistory: [],
    avgHistory: [],
    jumpRateHistory: [],
  };
  ensureObstacles();

  document.getElementById('btn-start').disabled = true;
  document.getElementById('btn-pause').disabled = false;
  document.getElementById('btn-next').disabled  = false;

  log('Evolución iniciada. Gen 0: avatares sin sesgo de salto.', 'g');
  log('Observe cómo el GA descubre gradualmente el comportamiento de salto...', 'b');

  updatePhaseUI(0, 0);
  S.rafId = requestAnimationFrame(mainLoop);
}

function togglePause() {
  S.paused = !S.paused;
  const btn = document.getElementById('btn-pause');
  btn.textContent = S.paused ? '▶ RESUMIR' : '⏸ PAUSA';
  if (!S.paused) S.rafId = requestAnimationFrame(mainLoop);
}

function forceNextGen() {
  if (!S.running) return;
  evolve();
  updateCamera();
  render();
  updateLiveStats();
}

function resetAll() {
  S.running = false;
  S.paused  = false;
  cancelAnimationFrame(S.rafId);
  S = {
    ...S,
    gen: 0, tick: 0, pop: [], obstacles: [],
    camX: 0, camTarget: 0,
    bestHistory: [], avgHistory: [], jumpRateHistory: [],
  };

  document.getElementById('btn-start').disabled  = false;
  document.getElementById('btn-pause').disabled  = true;
  document.getElementById('btn-next').disabled   = true;
  document.getElementById('btn-pause').textContent  = '⏸ PAUSA';
  document.getElementById('gen-label').textContent  = 'GEN 0';
  document.getElementById('phase-badge').textContent = 'LISTO';
  document.getElementById('phase-badge').className   = 'phase-badge';
  ['s-gen', 's-alive', 's-best', 's-obs'].forEach(id => {
    document.getElementById(id).textContent = '0';
  });
  document.getElementById('prog-fill').style.width  = '0%';
  document.getElementById('genome-viz').innerHTML   = '';
  document.getElementById('gen-hist').innerHTML     = '';
  document.getElementById('log-list').innerHTML     = '';
  document.getElementById('jump-pct').textContent   = '0%';
  document.getElementById('jump-bar').style.width   = '0%';
  document.getElementById('phase-name').textContent = '—';
  document.getElementById('phase-desc').textContent = 'Presiona INICIAR para comenzar la evolución';
  const fc = document.getElementById('fc');
  fc.getContext('2d').clearRect(0, 0, fc.width, fc.height);
  resize();
  drawIdleScreen();
}

function setSpeed(v) {
  S.speed = +v;
  document.getElementById('speed-val').textContent = v + '×';
}

function setView(m) {
  S.view = m;
  document.getElementById('vt-all').className  = 'vtb' + (m === 'all'  ? ' active' : '');
  document.getElementById('vt-best').className = 'vtb' + (m === 'best' ? ' active' : '');
}

window.addEventListener('resize', () => {
  resize();
  if (!S.running) drawIdleScreen();
});

resize();
drawIdleScreen();