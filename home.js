const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const WAVE_HEIGHT = 50;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = WAVE_HEIGHT;
}
resize();
window.addEventListener('resize', resize);

let t = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = WAVE_HEIGHT / 2;

  ctx.strokeStyle = '#ff2020';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 6;
  ctx.lineCap = 'round';

  const amplitude = 20;
  const wavelength = 80;
  const frequency = (2 * Math.PI) / wavelength;
  const speed = 0.07;
  const halfW = canvas.width / 2;

  // Draw both sides in one path using the same formula: y = sin(dist * freq - t)
  // Left side: dist = cx - screenX, lineTo going left
  // Right side: dist = screenX - cx, lineTo going right
  // Both use identical sine so they are perfectly mirrored

  ctx.beginPath();
  // Start from left edge, draw to center
  for (let px = 0; px <= canvas.width; px++) {
    const dist = Math.abs(px - cx);
    const envelope = Math.min(1, dist / 60);
    const y = cy + Math.sin(dist * frequency - t) * amplitude * envelope;
    if (px === 0) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();

  // Center dot
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fill();

  t += speed;
  requestAnimationFrame(draw);
}

draw();