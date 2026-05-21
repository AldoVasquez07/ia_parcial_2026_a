let S = {
  running: false,
  paused: false,
  gen: 0,
  tick: 0,
  pop: [],
  obstacles: [],
  camX: 0,
  camTarget: 0,
  bestHistory: [],
  avgHistory: [],
  jumpRateHistory: [],
  speed: 4,
  view: 'all',
  rafId: null,
  groundY: 0,
};

const canvas = document.getElementById('cv');
const ctx = canvas.getContext('2d');

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = Math.floor(rect.width - 16);
  canvas.height = Math.floor(rect.height - 62);
  S.groundY = canvas.height - 65;
}