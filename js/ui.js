function updateLiveStats() {
  const alive = S.pop.filter(a => a.alive).length;
  const best  = getBest();
  const avg   = S.pop.reduce((s, a) => s + a.fit, 0) / CFG.POP;

  document.getElementById('s-gen').textContent   = S.gen;
  document.getElementById('s-alive').textContent = alive;
  document.getElementById('s-best').textContent  = best ? best.fit.toFixed(0) : '0';
  document.getElementById('s-obs').textContent   = best ? best.obsCrossed : '0';
  document.getElementById('gen-label').textContent = `GEN ${S.gen}`;

  const mx  = Math.max(...S.bestHistory, best ? best.fit : 0, 100);
  const pct = best ? Math.min(100, (best.fit / mx) * 100) : 0;
  document.getElementById('prog-fill').style.width = pct + '%';

  if (best) updateGenomeViz(best.g);

  const jumpRate = S.pop.filter(a => a.didJumpAtAll).length / CFG.POP;
  updatePhaseUI(jumpRate, best ? best.obsCrossed : 0);
}

function updatePhaseUI(jumpRate, bestObs) {
  const phase   = getPhase(jumpRate, bestObs);
  document.getElementById('phase-name').textContent  = phase.name;
  document.getElementById('phase-name').style.color  = phase.color;
  document.getElementById('phase-desc').textContent  = phase.desc;
  document.getElementById('phase-badge').textContent = phase.badge;
  document.getElementById('phase-badge').className   = 'phase-badge ' + phase.badgeClass;
  document.getElementById('jump-pct').textContent    = (jumpRate * 100).toFixed(0) + '%';
  document.getElementById('jump-bar').style.width    = (jumpRate * 100) + '%';
  document.getElementById('jump-bar').style.background = phase.color;
}

function getPhase(jumpRate, bestObs) {
  if (!S.running) return { name: '—', desc: 'Presiona INICIAR para comenzar', badge: 'LISTO', badgeClass: '', color: 'var(--tx2)' };
  if (S.gen <= 2 && jumpRate < 0.1)
    return { name: 'EXPLORACIÓN', desc: 'Los avatares caminan sin saltar. Morirán ante los primeros obstáculos.', badge: 'GEN ' + S.gen, badgeClass: '', color: 'var(--tx2)' };
  if (jumpRate < 0.2 && bestObs === 0)
    return { name: 'DESCUBRIMIENTO', desc: 'Algunos individuos comienzan a activar el gen de salto accidentalmente.', badge: 'GEN ' + S.gen, badgeClass: '', color: 'var(--ac2)' };
  if (jumpRate < 0.4 || bestObs < 2)
    return { name: 'APRENDIENDO', desc: 'El GA selecciona a los que saltan. Los genes de salto se propagan.', badge: 'GEN ' + S.gen, badgeClass: 'learning', color: 'var(--ac2)' };
  if (jumpRate < 0.7 || bestObs < 5)
    return { name: 'MEJORANDO', desc: 'La mayoría salta. El timing y la fuerza se van optimizando.', badge: 'GEN ' + S.gen, badgeClass: 'evolving', color: 'var(--ac3)' };
  return { name: 'DOMINANDO', desc: 'La población salta eficientemente. El fitness crece por timing preciso.', badge: 'GEN ' + S.gen, badgeClass: 'evolving', color: 'var(--ac)' };
}

function updateGenomeViz(genome) {
  const el     = document.getElementById('genome-viz');
  const labels = ['vel','salto','dist','will','amp','h0','h1','h2','h3','h4','t0','t1','t2','t3','t4','s0','s1','s2','s3','s4'];
  el.innerHTML = Array.from(genome).map((v, i) => {
    const hue  = Math.round(((v + 1) / 2) * 240);
    const isKey = i < 6;
    return `<span class="gene-block" style="background:hsl(${hue},70%,55%);${isKey ? 'border:1px solid rgba(255,255,255,0.3)' : ''}" title="${labels[i] || i}: ${v.toFixed(3)}"></span>`;
  }).join('');
}

function drawFitnessChart() {
  const fc   = document.getElementById('fc');
  const fctx = fc.getContext('2d');
  const dpr  = window.devicePixelRatio || 1;
  fc.width   = fc.offsetWidth * dpr;
  fc.height  = 70 * dpr;
  fctx.scale(dpr, dpr);
  const W = fc.offsetWidth, H = 70;
  fctx.clearRect(0, 0, W, H);
  if (S.bestHistory.length < 2) return;

  const mx = Math.max(...S.bestHistory, 1);

  const drawLine = (arr, color, width) => {
    fctx.strokeStyle = color;
    fctx.lineWidth   = width;
    fctx.lineJoin    = 'round';
    fctx.beginPath();
    arr.forEach((v, i) => {
      const px = i / (arr.length - 1) * W;
      const py = H - (v / mx) * (H - 16) - 4;
      i === 0 ? fctx.moveTo(px, py) : fctx.lineTo(px, py);
    });
    fctx.stroke();
  };

  drawLine(S.avgHistory,  'rgba(96,165,250,0.4)', 1);
  drawLine(S.bestHistory, '#4ade80', 1.8);

  if (S.jumpRateHistory.length >= 2) {
    fctx.strokeStyle = 'rgba(249,115,22,0.5)';
    fctx.lineWidth   = 1;
    fctx.setLineDash([3, 3]);
    fctx.beginPath();
    S.jumpRateHistory.forEach((v, i) => {
      const px = i / (S.jumpRateHistory.length - 1) * W;
      const py = H - v * (H - 16) - 4;
      i === 0 ? fctx.moveTo(px, py) : fctx.lineTo(px, py);
    });
    fctx.stroke();
    fctx.setLineDash([]);
  }

  fctx.fillStyle = '#4ade80';
  fctx.font      = `${8 * dpr}px IBM Plex Mono`;
  fctx.scale(1 / dpr, 1 / dpr);
  fctx.fillText(`max: ${S.bestHistory.at(-1).toFixed(0)}`, 3 * dpr, 10 * dpr);
}

function updateSideUI() {
  document.getElementById('s-gen').textContent = S.gen;
}

function updateGenHistory() {
  const el     = document.getElementById('gen-hist');
  const allFits = S.bestHistory;
  const mx     = Math.max(...allFits, 1);
  el.innerHTML = '';
  allFits.forEach((f, i) => {
    const pct = f / mx;
    let cls = 'gen-dot';
    if (pct > 0.85)      cls += ' great';
    else if (pct > 0.55) cls += ' good';
    else if (pct > 0.25) cls += ' ok';
    else                 cls += ' poor';
    const d = document.createElement('div');
    d.className = cls;
    d.title     = `Gen ${i + 1}: ${f.toFixed(0)} pts`;
    el.appendChild(d);
  });
}

function log(msg, cls = '') {
  const list = document.getElementById('log-list');
  const el   = document.createElement('div');
  el.className = 'log-entry ' + cls;
  el.textContent = msg;
  list.prepend(el);
  while (list.children.length > 30) list.removeChild(list.lastChild);
}