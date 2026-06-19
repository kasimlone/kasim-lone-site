/* =========================================================
   BITMAP IMAGES — interactive lesson
   ========================================================= */

/* ---------- Helper: draw a colourful synthetic scene ----------
   We render a programmatic picture (sky, sun, mountains, ground,
   a smiley) into an offscreen canvas. This gives us a rich image
   to demo resolution and colour depth on, without needing any
   external image files. */
function makeSourceScene(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, size * 0.7);
  sky.addColorStop(0, '#5fb6ff');
  sky.addColorStop(1, '#ffd28a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size * 0.7);

  // Sun
  const sunR = size * 0.13;
  const sx = size * 0.72, sy = size * 0.25;
  const sunGrad = ctx.createRadialGradient(sx, sy, 4, sx, sy, sunR);
  sunGrad.addColorStop(0, '#fff7c2');
  sunGrad.addColorStop(1, '#ff9b3a');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sx, sy, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Back mountains
  ctx.fillStyle = '#8a7fbf';
  ctx.beginPath();
  ctx.moveTo(0, size * 0.55);
  ctx.lineTo(size * 0.25, size * 0.32);
  ctx.lineTo(size * 0.45, size * 0.55);
  ctx.lineTo(size * 0.65, size * 0.30);
  ctx.lineTo(size * 0.95, size * 0.55);
  ctx.lineTo(size, size * 0.55);
  ctx.lineTo(size, size * 0.7);
  ctx.lineTo(0, size * 0.7);
  ctx.closePath();
  ctx.fill();

  // Front mountains
  ctx.fillStyle = '#5d4f9c';
  ctx.beginPath();
  ctx.moveTo(0, size * 0.62);
  ctx.lineTo(size * 0.18, size * 0.42);
  ctx.lineTo(size * 0.38, size * 0.62);
  ctx.lineTo(size * 0.55, size * 0.48);
  ctx.lineTo(size * 0.78, size * 0.62);
  ctx.lineTo(size, size * 0.55);
  ctx.lineTo(size, size * 0.7);
  ctx.lineTo(0, size * 0.7);
  ctx.closePath();
  ctx.fill();

  // Ground gradient (green to dark green)
  const ground = ctx.createLinearGradient(0, size * 0.7, 0, size);
  ground.addColorStop(0, '#7ec850');
  ground.addColorStop(1, '#2f6f1c');
  ctx.fillStyle = ground;
  ctx.fillRect(0, size * 0.7, size, size * 0.3);

  // Tree trunk
  ctx.fillStyle = '#6b3a1c';
  ctx.fillRect(size * 0.18, size * 0.72, size * 0.04, size * 0.15);
  // Tree leaves
  ctx.fillStyle = '#1f8a2a';
  ctx.beginPath();
  ctx.arc(size * 0.20, size * 0.70, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // House
  ctx.fillStyle = '#f3eddb';
  ctx.fillRect(size * 0.55, size * 0.75, size * 0.18, size * 0.13);
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(size * 0.53, size * 0.75);
  ctx.lineTo(size * 0.64, size * 0.66);
  ctx.lineTo(size * 0.75, size * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5b3a1c';
  ctx.fillRect(size * 0.62, size * 0.80, size * 0.04, size * 0.08);

  // Flowers (random colour dots)
  const flowerColors = ['#e91e63', '#ffeb3b', '#ffffff', '#ff9800'];
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    const fx = (i * 53) % size;
    const fy = size * 0.85 + (i * 17) % (size * 0.12);
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  return c;
}

const SOURCE = makeSourceScene(256);
// High-resolution version used by the resolution demo, so the
// "full quality" end of the slider looks crisp instead of blocky.
const SOURCE_HI = makeSourceScene(512);

/* =========================================================
   1. MOSAIC SMILEY (Section 1)
   ========================================================= */
(function drawMosaic() {
  const canvas = document.getElementById('mosaicCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // 16 x 12 pixel smiley
  const W = 16, H = 12;
  const cell = canvas.width / W;
  const Y = '#FFD93B', K = '#222';
  const map = [
    '................',
    '....YYYYYYYY....',
    '..YYYYYYYYYYYY..',
    '.YYYYYYYYYYYYYY.',
    '.YYKKYYYYYYKKYY.',
    '.YYKKYYYYYYKKYY.',
    '.YYYYYYYYYYYYYY.',
    '.YYYYKYYYYKYYYY.',
    '.YYYYYKKKKYYYYY.',
    '.YYYYYYYYYYYYYY.',
    '..YYYYYYYYYYYY..',
    '....YYYYYYYY....',
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ch = map[y][x];
      ctx.fillStyle = ch === 'Y' ? Y : ch === 'K' ? K : '#ffffff';
      ctx.fillRect(x * cell, y * cell, cell, cell);
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 1;
      ctx.strokeRect(x * cell + 0.5, y * cell + 0.5, cell, cell);
    }
  }
})();

/* =========================================================
   2. ZOOM DEMO (Section 2)
   ========================================================= */
(function zoomDemo() {
  const canvas = document.getElementById('zoomCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const range = document.getElementById('zoomRange');
  const out = document.getElementById('zoomVal');

  function render() {
    const z = +range.value;
    out.textContent = z + '×';
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // sample a region centred on a busy part of the scene
    // (house roof / tree leaves / ground edge) so zooming reveals lots of detail
    const cx = SOURCE.width * 0.62, cy = SOURCE.height * 0.78;
    const sw = SOURCE.width / z;
    const sh = SOURCE.height / z;
    const sx = Math.max(0, Math.min(SOURCE.width - sw, cx - sw / 2));
    const sy = Math.max(0, Math.min(SOURCE.height - sh, cy - sh / 2));
    ctx.drawImage(SOURCE, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  }

  range.addEventListener('input', render);
  render();
})();

/* =========================================================
   3. PIXEL ART (Section 2)
   ========================================================= */
(function pixelArt() {
  const canvas = document.getElementById('pixelArt');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const GRID = 16;
  const cell = canvas.width / GRID;
  let currentColour = '#000000';
  const grid = Array.from({ length: GRID }, () => Array(GRID).fill(null));

  function drawGrid() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (grid[y][x]) {
          ctx.fillStyle = grid[y][x];
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
    ctx.strokeStyle = '#dde3ee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell + 0.5, 0);
      ctx.lineTo(i * cell + 0.5, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell + 0.5);
      ctx.lineTo(canvas.width, i * cell + 0.5);
      ctx.stroke();
    }
  }
  drawGrid();

  let painting = false;
  function paint(evt) {
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = Math.floor(((evt.clientX - rect.left) * scale) / cell);
    const y = Math.floor(((evt.clientY - rect.top) * scale) / cell);
    if (x < 0 || x >= GRID || y < 0 || y >= GRID) return;
    grid[y][x] = currentColour === 'erase' ? null : currentColour;
    drawGrid();
  }
  canvas.addEventListener('mousedown', e => { painting = true; paint(e); });
  canvas.addEventListener('mousemove', e => { if (painting) paint(e); });
  window.addEventListener('mouseup', () => painting = false);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); paint(e.touches[0]); });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); paint(e.touches[0]); });

  document.querySelectorAll('#palette .swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#palette .swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColour = btn.dataset.color;
    });
  });

  document.getElementById('clearArt').addEventListener('click', () => {
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) grid[y][x] = null;
    drawGrid();
  });
})();

/* =========================================================
   4. RESOLUTION DEMO (Section 3)
   ========================================================= */
(function resolutionDemo() {
  const canvas = document.getElementById('resCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const range = document.getElementById('resRange');
  const out = document.getElementById('resVal');
  const label = document.getElementById('resLabel');

  // Tiny offscreen canvas we resize to
  const small = document.createElement('canvas');
  const sctx = small.getContext('2d');

  function render() {
    const n = +range.value;
    small.width = small.height = n;
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(SOURCE_HI, 0, 0, n, n);
    // At low resolutions, keep nearest-neighbor scaling so pixels look chunky.
    // At high resolutions, enable smoothing so the "full quality" image is crisp.
    ctx.imageSmoothingEnabled = n >= canvas.width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
    out.textContent = `${n} × ${n}`;
    label.textContent = `${n} × ${n} pixels  ·  ${n * n} pixels total`;
  }

  range.addEventListener('input', render);
  render();
})();

/* =========================================================
   5. COLOUR DEPTH DEMO (Section 4)
   ========================================================= */
function bitSplit(depth) {
  if (depth <= 1) return { mode: 'mono' };
  if (depth === 2) return { mode: 'gray', bits: 2 };
  if (depth === 3) return { mode: 'gray', bits: 3 };
  // distribute across RGB, green gets most
  const b = Math.floor(depth / 3);
  let r = Math.floor((depth - b) / 2);
  let g = depth - r - b;
  return { mode: 'rgb', r, g, b };
}

function quantizeChannel(v, bits) {
  if (bits <= 0) return 0;
  const levels = (1 << bits) - 1;
  return Math.round(Math.round((v / 255) * levels) * (255 / levels));
}

function applyDepth(srcCanvas, dstCanvas, depth) {
  const dctx = dstCanvas.getContext('2d');
  dctx.imageSmoothingEnabled = false;
  dctx.drawImage(srcCanvas, 0, 0, dstCanvas.width, dstCanvas.height);
  const img = dctx.getImageData(0, 0, dstCanvas.width, dstCanvas.height);
  const data = img.data;
  const split = bitSplit(depth);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (split.mode === 'mono') {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114);
      const v = lum > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    } else if (split.mode === 'gray') {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114);
      const v = quantizeChannel(lum, split.bits);
      data[i] = data[i + 1] = data[i + 2] = v;
    } else {
      data[i]     = quantizeChannel(r, split.r);
      data[i + 1] = quantizeChannel(g, split.g);
      data[i + 2] = quantizeChannel(b, split.b);
    }
  }
  dctx.putImageData(img, 0, 0);
}

(function colourDepthDemo() {
  const canvas = document.getElementById('depthCanvas');
  if (!canvas) return;
  const range = document.getElementById('depthRange');
  const out = document.getElementById('depthVal');
  const label = document.getElementById('depthLabel');

  function render() {
    const d = +range.value;
    applyDepth(SOURCE, canvas, d);
    const colours = Math.pow(2, d);
    out.textContent = `${d}-bit`;
    label.textContent = `${d}-bit · ${colours.toLocaleString()} colours`;
  }
  range.addEventListener('input', render);
  render();
})();

/* =========================================================
   6. FILE SIZE CALCULATOR (Section 5)
   ========================================================= */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes.toLocaleString() + ' bytes';
  const kib = bytes / 1024;
  if (kib < 1024) return kib.toFixed(2) + ' KiB';
  const mib = kib / 1024;
  if (mib < 1024) return mib.toFixed(2) + ' MiB';
  return (mib / 1024).toFixed(2) + ' GiB';
}

(function fileSizeCalc() {
  const w = document.getElementById('fsWidth');
  const h = document.getElementById('fsHeight');
  const d = document.getElementById('fsDepth');
  const out = document.getElementById('fsOutput');
  if (!out) return;

  function calc() {
    const W = Math.max(1, +w.value | 0);
    const H = Math.max(1, +h.value | 0);
    const D = +d.value;
    const bits = W * H * D;
    const bytes = bits / 8;
    out.innerHTML = `
      <p><strong>Working out:</strong></p>
      <p>${W.toLocaleString()} × ${H.toLocaleString()} × ${D} = <strong>${bits.toLocaleString()} bits</strong></p>
      <p>${bits.toLocaleString()} ÷ 8 = <strong>${bytes.toLocaleString()} bytes</strong></p>
      <p>That's approximately <strong>${formatBytes(bytes)}</strong>.</p>
    `;
  }
  [w, h, d].forEach(el => el.addEventListener('input', calc));
  calc();
})();

/* =========================================================
   7. QUIZ
   ========================================================= */
(function quiz() {
  const answers = { q1: 'b', q2: 'b', q3: 'b', q4: 'a', q5: 'b' };
  const explain = {
    q1: 'Pixel = picture element.',
    q2: '200 × 100 × 8 = 160,000 bits ÷ 8 = 20,000 bytes.',
    q3: '2⁴ = 16 colours.',
    q4: 'Fewer pixels means each one has to be bigger — that produces blocky edges.',
    q5: 'Fewer bits per pixel means fewer colour shades, so smooth gradients become bands of solid colour.',
  };
  const btn = document.getElementById('markQuiz');
  const result = document.getElementById('quizResult');
  btn.addEventListener('click', () => {
    let score = 0;
    let feedback = [];
    Object.keys(answers).forEach(q => {
      const chosen = document.querySelector(`input[name="${q}"]:checked`);
      if (chosen && chosen.value === answers[q]) {
        score++;
      } else {
        feedback.push(`Q${q.slice(1)}: ${explain[q]}`);
      }
    });
    result.className = 'quiz-result ' + (score === 5 ? 'good' : 'bad');
    const summary = document.getElementById('summary');
    if (score === 5) {
      result.innerHTML = `🎉 Perfect — ${score}/5! You really know your bitmaps. Scroll down for the key points to remember.`;
      if (summary) {
        summary.hidden = false;
        summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      if (summary) summary.hidden = true;
      result.innerHTML = `You got <strong>${score}/5</strong>.<br>` +
        feedback.map(f => '• ' + f).join('<br>');
    }
  });
})();
