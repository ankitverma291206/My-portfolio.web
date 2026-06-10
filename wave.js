/* wave.js — reads data-color from <canvas id="c">, draws per-page colored wave */
(function () {
  const canvas = document.getElementById('c');
  if (!canvas) return;
  const ctx   = canvas.getContext('2d');
  const color = canvas.dataset.color || '#ffffff';
  const H     = 50;

  function resize() { canvas.width = window.innerWidth; canvas.height = H; }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, H);
    const cx = canvas.width / 2;
    const cy = H / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.8;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 8;
    ctx.lineCap     = 'round';
    const freq  = (2 * Math.PI) / 80;
    const speed = 0.065;
    ctx.beginPath();
    for (let px = 0; px <= canvas.width; px++) {
      const dist = Math.abs(px - cx);
      const env  = Math.min(1, dist / 55);
      const y    = cy + Math.sin(dist * freq - t) * 18 * env;
      px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
    }
    ctx.stroke();
    /* center dot */
    ctx.shadowBlur = 20;
    ctx.fillStyle  = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    t += speed;
    requestAnimationFrame(draw);
  }
  draw();
})();
