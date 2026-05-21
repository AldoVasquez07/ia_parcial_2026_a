function randomGene() {
  const g = new Float32Array(CFG.GENES);
  for (let i = 0; i < CFG.GENES; i++) {
    if (i === 3) {
      g[i] = -Math.random() * 0.8;
    } else if (i === 2) {
      g[i] = Math.random() * 2 - 1.3;
    } else {
      g[i] = Math.random() * 2 - 1;
    }
  }
  return g;
}