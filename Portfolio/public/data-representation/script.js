// Shared script for data representation topic pages.
(function () {
  // Progress bar + active side-nav
  const bar = document.getElementById("progress-bar");
  const navLinks = document.querySelectorAll("#side-nav a");
  const sections = document.querySelectorAll("main .section");

  function onScroll() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    if (bar) bar.style.width = Math.min(100, Math.max(0, scrolled)) + "%";
    let current = "";
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.4) current = s.id;
    });
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("active", href === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Flip cards
  document.querySelectorAll(".flip-card").forEach((el) => {
    el.addEventListener("click", () => el.classList.toggle("flipped"));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.classList.toggle("flipped"); }
    });
    el.setAttribute("tabindex", "0");
  });

  // Reveal buttons
  document.querySelectorAll(".reveal-block").forEach((block) => {
    const btn = block.querySelector(".reveal-btn");
    const ans = block.querySelector(".answer");
    if (!btn || !ans) return;
    btn.addEventListener("click", () => {
      const hidden = ans.hasAttribute("hidden");
      if (hidden) { ans.removeAttribute("hidden"); btn.textContent = "Hide"; }
      else { ans.setAttribute("hidden", ""); btn.textContent = btn.dataset.label || "Reveal"; }
    });
  });

  // Binary bit row toggle (interactive)
  document.querySelectorAll(".bit-row").forEach((row) => {
    if (row.classList.contains("readonly")) return;
    const bits = row.querySelectorAll(".bit");
    const target = row.dataset.target ? document.getElementById(row.dataset.target) : null;

    function updateDisplay() {
      let total = 0;
      let bin = "";
      bits.forEach((b) => {
        const on = b.classList.contains("on");
        const place = parseInt(b.dataset.place, 10);
        if (on) total += place;
        bin += on ? "1" : "0";
      });
      if (target) {
        const denEl = target.querySelector('[data-out="denary"]');
        const binEl = target.querySelector('[data-out="binary"]');
        if (denEl) denEl.textContent = total;
        if (binEl) binEl.textContent = bin;
      }
    }

    bits.forEach((b) => {
      b.addEventListener("click", () => {
        b.classList.toggle("on");
        const v = b.querySelector(".val");
        if (v) v.textContent = b.classList.contains("on") ? "1" : "0";
        updateDisplay();
      });
    });
    updateDisplay();
  });

  // ASCII lookup
  const asciiInput = document.querySelector("#ascii-input");
  const asciiOut = document.querySelector("#ascii-out");
  if (asciiInput && asciiOut) {
    function updateAscii() {
      const c = asciiInput.value.charAt(0);
      if (!c) { asciiOut.innerHTML = '<span class="k">Type a character above.</span>'; return; }
      const code = c.charCodeAt(0);
      const bin = code.toString(2).padStart(8, "0");
      const hex = code.toString(16).toUpperCase().padStart(2, "0");
      asciiOut.innerHTML =
        `<div><span class="k">Character:</span> <span class="v">${c === " " ? "␣ (space)" : c}</span></div>` +
        `<div><span class="k">Denary (ASCII):</span> <span class="v">${code}</span></div>` +
        `<div><span class="k">Binary (8-bit):</span> <span class="b">${bin}</span></div>` +
        `<div><span class="k">Hexadecimal:</span> <span class="b">${hex}</span></div>`;
    }
    asciiInput.addEventListener("input", updateAscii);
    updateAscii();
  }

  // Reverse ASCII (denary → char)
  const asciiDenInput = document.querySelector("#ascii-den");
  const asciiDenOut = document.querySelector("#ascii-den-out");
  if (asciiDenInput && asciiDenOut) {
    function updateDen() {
      const v = parseInt(asciiDenInput.value, 10);
      if (isNaN(v) || v < 0 || v > 255) { asciiDenOut.innerHTML = '<span class="k">Enter a number 0–255.</span>'; return; }
      const c = String.fromCharCode(v);
      const bin = v.toString(2).padStart(8, "0");
      asciiDenOut.innerHTML =
        `<div><span class="k">Character:</span> <span class="v">${v < 32 ? "(non-printable)" : c}</span></div>` +
        `<div><span class="k">Binary:</span> <span class="b">${bin}</span></div>`;
    }
    asciiDenInput.addEventListener("input", updateDen);
    updateDen();
  }

  // Colour depth sliders + resolution
  const colourDepthSlider = document.querySelector("#img-cd");
  const resSlider = document.querySelector("#img-res");
  if (colourDepthSlider && resSlider) {
    const cdVal = document.querySelector("#img-cd-val");
    const resVal = document.querySelector("#img-res-val");
    const coloursVal = document.querySelector("#img-colours");
    const sizeVal = document.querySelector("#img-size");
    const swatchGrid = document.querySelector("#img-swatches");

    function update() {
      const cd = parseInt(colourDepthSlider.value, 10);
      const res = parseInt(resSlider.value, 10);
      cdVal.textContent = cd + " bits";
      resVal.textContent = res + " × " + res;
      const colours = Math.pow(2, cd);
      coloursVal.textContent = colours.toLocaleString();
      const bits = res * res * cd;
      const bytes = bits / 8;
      let display;
      if (bytes < 1000) display = Math.round(bytes) + " bytes";
      else if (bytes < 1e6) display = (bytes / 1000).toFixed(2) + " KB";
      else display = (bytes / 1e6).toFixed(2) + " MB";
      sizeVal.textContent = display + "  (" + bits.toLocaleString() + " bits)";

      if (swatchGrid) {
        swatchGrid.innerHTML = "";
        const showCount = Math.min(colours, 16);
        for (let i = 0; i < showCount; i++) {
          const hue = Math.round((i / showCount) * 360);
          const div = document.createElement("div");
          div.style.width = "100%"; div.style.aspectRatio = "1";
          div.style.background = `hsl(${hue}, 70%, 55%)`;
          div.style.borderRadius = "4px";
          swatchGrid.appendChild(div);
        }
        if (colours > 16) {
          const more = document.createElement("div");
          more.textContent = "+" + (colours - 16).toLocaleString();
          more.style.fontFamily = "var(--font-mono)";
          more.style.color = "var(--zinc-400)";
          more.style.display = "flex"; more.style.alignItems = "center"; more.style.justifyContent = "center";
          swatchGrid.appendChild(more);
        }
      }
    }
    colourDepthSlider.addEventListener("input", update);
    resSlider.addEventListener("input", update);
    update();
  }

  // Sound sampling wave
  const sampleSlider = document.querySelector("#snd-sr");
  const depthSlider = document.querySelector("#snd-bd");
  const durSlider = document.querySelector("#snd-dur");
  if (sampleSlider && depthSlider && durSlider) {
    const srVal = document.querySelector("#snd-sr-val");
    const bdVal = document.querySelector("#snd-bd-val");
    const durVal = document.querySelector("#snd-dur-val");
    const sizeVal = document.querySelector("#snd-size");
    const canvas = document.querySelector("#snd-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    function drawWave() {
      if (!ctx) return;
      const w = canvas.width = canvas.clientWidth * window.devicePixelRatio;
      const h = canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      // analogue wave
      ctx.strokeStyle = "#546E7A";
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = x / w;
        const y = h / 2 + Math.sin(t * Math.PI * 4) * (h / 3);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const srReal = parseInt(sampleSlider.value, 10);
      const bd = parseInt(depthSlider.value, 10);
      const levels = Math.pow(2, bd);
      // Map real sample rate (500..48000 Hz) to a display-friendly number of
      // samples across the visible wave (roughly 4..80). Log-scaled so the
      // low-rate end still shows chunky steps.
      const srDisp = Math.max(4, Math.min(80, Math.round(4 + (Math.log(srReal) - Math.log(500)) / (Math.log(48000) - Math.log(500)) * 76)));
      const step = w / srDisp;

      // sampled steps
      ctx.strokeStyle = "#82AAFF";
      ctx.fillStyle = "rgba(130,170,255,0.15)";
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.beginPath();
      let prevY = h / 2;
      for (let i = 0; i <= srDisp; i++) {
        const x = i * step;
        const t = x / w;
        const raw = Math.sin(t * Math.PI * 4);
        const q = Math.round(((raw + 1) / 2) * (levels - 1)) / (levels - 1);
        const y = h / 2 + (q * 2 - 1) * (h / 3);
        if (i === 0) { ctx.moveTo(x, y); prevY = y; }
        else { ctx.lineTo(x, prevY); ctx.lineTo(x, y); prevY = y; }
      }
      ctx.stroke();

      // sample dots
      ctx.fillStyle = "#FFCB6B";
      for (let i = 0; i <= srDisp; i++) {
        const x = i * step;
        const t = x / w;
        const raw = Math.sin(t * Math.PI * 4);
        const q = Math.round(((raw + 1) / 2) * (levels - 1)) / (levels - 1);
        const y = h / 2 + (q * 2 - 1) * (h / 3);
        ctx.beginPath();
        ctx.arc(x, y, 3 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function update() {
      const sr = parseInt(sampleSlider.value, 10);
      const bd = parseInt(depthSlider.value, 10);
      const dur = parseInt(durSlider.value, 10);
      srVal.textContent = sr.toLocaleString() + " Hz";
      bdVal.textContent = bd + " bits";
      durVal.textContent = dur + " s";
      const bits = sr * dur * bd;
      const bytes = bits / 8;
      let disp;
      if (bytes < 1000) disp = Math.round(bytes) + " B";
      else if (bytes < 1e6) disp = (bytes / 1000).toFixed(2) + " KB";
      else disp = (bytes / 1e6).toFixed(2) + " MB";
      sizeVal.textContent = disp;
      drawWave();
    }
    sampleSlider.addEventListener("input", update);
    depthSlider.addEventListener("input", update);
    durSlider.addEventListener("input", update);
    window.addEventListener("resize", drawWave);
    update();
  }

  // Compression slider
  const compSlider = document.querySelector("#comp-slider");
  if (compSlider) {
    const layer = document.querySelector("#comp-layer");
    const info = document.querySelector("#comp-info");
    const sliderVal = document.querySelector("#comp-slider-val");
    function update() {
      const v = parseInt(compSlider.value, 10); // 0..100 lossy %
      if (layer) {
        const blur = (v / 100) * 8;
        const contrast = 1 - (v / 100) * 0.3;
        const saturate = 1 - (v / 100) * 0.4;
        layer.style.filter = `blur(${blur}px) contrast(${contrast}) saturate(${saturate})`;
      }
      const origKB = 824;
      const newKB = Math.max(30, Math.round(origKB * (1 - v / 120)));
      if (info) info.innerHTML = `${v}% lossy · <strong style="color:var(--syntax-fn)">${newKB} KB</strong> <span style="color:var(--zinc-400)">(orig 824 KB)</span>`;
      if (sliderVal) sliderVal.textContent = v + "% lossy";
    }
    compSlider.addEventListener("input", update);
    update();
  }

  // Hex colour picker
  const rIn = document.querySelector("#rgb-r");
  const gIn = document.querySelector("#rgb-g");
  const bIn = document.querySelector("#rgb-b");
  if (rIn && gIn && bIn) {
    const swatch = document.querySelector("#rgb-swatch");
    const hexOut = document.querySelector("#rgb-hex");
    function toHex(v) {
      v = Math.max(0, Math.min(255, parseInt(v, 10) || 0));
      return v.toString(16).toUpperCase().padStart(2, "0");
    }
    function update() {
      const r = parseInt(rIn.value, 10) || 0;
      const g = parseInt(gIn.value, 10) || 0;
      const b = parseInt(bIn.value, 10) || 0;
      const hex = "#" + toHex(r) + toHex(g) + toHex(b);
      if (swatch) swatch.style.background = hex;
      if (hexOut) hexOut.textContent = hex;
    }
    [rIn, gIn, bIn].forEach((el) => el.addEventListener("input", update));
    update();
  }

  // Denary <-> Binary practice
  const denInput = document.querySelector("#den-practice");
  if (denInput) {
    const out = document.querySelector("#den-practice-out");
    function update() {
      const v = parseInt(denInput.value, 10);
      if (isNaN(v) || v < 0 || v > 255) { out.innerHTML = '<span class="k">Enter 0–255.</span>'; return; }
      out.innerHTML = `<span class="k">Binary:</span> <span class="b" style="color:var(--syntax-string)">${v.toString(2).padStart(8, "0")}</span>`;
    }
    denInput.addEventListener("input", update);
    update();
  }

  // Binary practice input
  const binInput = document.querySelector("#bin-practice");
  if (binInput) {
    const out = document.querySelector("#bin-practice-out");
    function update() {
      const s = (binInput.value || "").trim();
      if (!/^[01]{1,8}$/.test(s)) { out.innerHTML = '<span class="k">Enter up to 8 binary digits.</span>'; return; }
      const v = parseInt(s, 2);
      out.innerHTML = `<span class="k">Denary:</span> <span class="b" style="color:var(--syntax-fn)">${v}</span>`;
    }
    binInput.addEventListener("input", update);
    update();
  }

  // Hex practice
  const hexIn = document.querySelector("#hex-practice");
  if (hexIn) {
    const out = document.querySelector("#hex-practice-out");
    function update() {
      const s = (hexIn.value || "").trim().toUpperCase();
      if (!/^[0-9A-F]{1,2}$/.test(s)) { out.innerHTML = '<span class="k">Enter 1 or 2 hex digits (0-9, A-F).</span>'; return; }
      const v = parseInt(s, 16);
      const bin = v.toString(2).padStart(8, "0");
      out.innerHTML =
        `<span class="k">Denary:</span> <span class="b" style="color:var(--syntax-fn)">${v}</span> &nbsp; ` +
        `<span class="k">Binary:</span> <span class="b" style="color:var(--syntax-string)">${bin}</span>`;
    }
    hexIn.addEventListener("input", update);
    update();
  }

  // Binary shift buttons
  document.querySelectorAll("[data-shift]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const bits = target.querySelectorAll(".bit");
      let arr = Array.from(bits).map((b) => b.classList.contains("on") ? 1 : 0);
      const dir = btn.dataset.shift;
      if (dir === "L") { arr.shift(); arr.push(0); }
      else if (dir === "R") { arr.pop(); arr.unshift(0); }
      let total = 0, bin = "";
      bits.forEach((b, i) => {
        if (arr[i]) b.classList.add("on"); else b.classList.remove("on");
        const v = b.querySelector(".val");
        if (v) v.textContent = arr[i];
        const place = parseInt(b.dataset.place, 10);
        if (arr[i]) total += place;
        bin += arr[i];
      });
      const disp = target.dataset.target ? document.getElementById(target.dataset.target) : null;
      if (disp) {
        const denEl = disp.querySelector('[data-out="denary"]');
        const binEl = disp.querySelector('[data-out="binary"]');
        if (denEl) denEl.textContent = total;
        if (binEl) binEl.textContent = bin;
      }
    });
  });
})();

/* ============================================================
   RICHER IMAGE DEMOS — synthetic scene, mosaic, zoom, pixel art
   real-time resolution/colour-depth quantisation, size calc, quiz
   ============================================================ */

/* Cached source scene — reused by zoom, resolution and colour-depth demos */
function _makeSourceScene(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, size * 0.7);
  sky.addColorStop(0, '#5fb6ff');
  sky.addColorStop(1, '#ffd28a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size * 0.7);

  const sunR = size * 0.13;
  const sx = size * 0.72, sy = size * 0.25;
  const sunGrad = ctx.createRadialGradient(sx, sy, 4, sx, sy, sunR);
  sunGrad.addColorStop(0, '#fff7c2');
  sunGrad.addColorStop(1, '#ff9b3a');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sx, sy, sunR, 0, Math.PI * 2);
  ctx.fill();

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

  const ground = ctx.createLinearGradient(0, size * 0.7, 0, size);
  ground.addColorStop(0, '#7ec850');
  ground.addColorStop(1, '#2f6f1c');
  ctx.fillStyle = ground;
  ctx.fillRect(0, size * 0.7, size, size * 0.3);

  ctx.fillStyle = '#6b3a1c';
  ctx.fillRect(size * 0.18, size * 0.72, size * 0.04, size * 0.15);
  ctx.fillStyle = '#1f8a2a';
  ctx.beginPath();
  ctx.arc(size * 0.20, size * 0.70, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

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

let _SOURCE = null, _SOURCE_HI = null;
function getSource(hi) {
  if (hi) return _SOURCE_HI || (_SOURCE_HI = _makeSourceScene(512));
  return _SOURCE || (_SOURCE = _makeSourceScene(256));
}

/* Load a photograph once, then run a callback for every subscriber.
   Subscribers can register even before the image has loaded — they'll be
   called as soon as it's ready. */
const _photoWaiters = [];
let _PHOTO = null;
function onPhotoReady(cb) {
  if (_PHOTO) { cb(_PHOTO); return; }
  _photoWaiters.push(cb);
}
(function preloadPhoto() {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    _PHOTO = img;
    _photoWaiters.forEach(cb => cb(img));
    _photoWaiters.length = 0;
  };
  // relative path from any topic page under /data-representation/*/
  img.src = 'cat.png';
})();

/* Mosaic smiley */
(function drawMosaic() {
  const canvas = document.getElementById('mosaicCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 16, H = 12;
  const cellW = canvas.width / W, cellH = canvas.height / H;
  const Y = '#FFD93B', K = '#222', BG = '#0b0f14';
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
      ctx.fillStyle = ch === 'Y' ? Y : ch === 'K' ? K : BG;
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
      ctx.strokeStyle = 'rgba(63,63,70,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x * cellW + 0.5, y * cellH + 0.5, cellW, cellH);
    }
  }
})();

/* Zoom demo — drag to pan, grid overlay above threshold */
(function zoomDemo() {
  const canvas = document.getElementById('zoomCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const range = document.getElementById('zoomRange');
  const out = document.getElementById('zoomVal');
  const status = document.getElementById('zoomStatus');
  // Fraction of the source image that's centred in view (0..1)
  let cx = 0.5, cy = 0.55;
  let SRC = null;

  const GRID_THRESHOLD = 10;

  function render() {
    if (!SRC) return;
    const z = +range.value;
    out.textContent = z + '×';
    ctx.imageSmoothingEnabled = z < 3;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // window in source-image pixels
    const sw = SRC.naturalWidth / z;
    const sh = SRC.naturalHeight / z;
    const cxPx = cx * SRC.naturalWidth;
    const cyPx = cy * SRC.naturalHeight;
    const sx = Math.max(0, Math.min(SRC.naturalWidth - sw, cxPx - sw / 2));
    const sy = Math.max(0, Math.min(SRC.naturalHeight - sh, cyPx - sh / 2));
    ctx.drawImage(SRC, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    // Grid overlay past the threshold — one line per source pixel
    if (z >= GRID_THRESHOLD) {
      const pxOnScreenX = canvas.width / sw;   // canvas pixels per source pixel
      const pxOnScreenY = canvas.height / sh;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      // vertical
      for (let i = 0; i <= sw; i++) {
        const x = Math.round(i * pxOnScreenX) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      // horizontal
      for (let j = 0; j <= sh; j++) {
        const y = Math.round(j * pxOnScreenY) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    if (status) {
      status.textContent = z >= GRID_THRESHOLD
        ? 'each square in the grid is one pixel — drag to explore'
        : (z > 1 ? 'drag the picture to look around' : 'ready — zoom in to see pixels');
    }
  }

  range.addEventListener('input', render);

  // Drag to pan
  let dragging = false, lastX = 0, lastY = 0;
  function startDrag(x, y) { dragging = true; lastX = x; lastY = y; canvas.style.cursor = 'grabbing'; }
  function endDrag() { dragging = false; canvas.style.cursor = 'grab'; }
  function moveDrag(x, y) {
    if (!dragging || !SRC) return;
    const z = +range.value;
    const rect = canvas.getBoundingClientRect();
    const dx = (x - lastX) / rect.width;
    const dy = (y - lastY) / rect.height;
    cx = Math.max(0, Math.min(1, cx - dx / z));
    cy = Math.max(0, Math.min(1, cy - dy / z));
    lastX = x; lastY = y;
    render();
  }

  canvas.style.cursor = 'grab';
  canvas.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
  canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; startDrag(t.clientX, t.clientY); });
  canvas.addEventListener('touchend', endDrag);
  canvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; moveDrag(t.clientX, t.clientY); });

  onPhotoReady(img => { SRC = img; render(); });
})();

/* Pixel art */
(function pixelArt() {
  const canvas = document.getElementById('pixelArt');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const GRID = 16;
  const cell = canvas.width / GRID;
  let currentColour = '#0f1419';
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
    ctx.strokeStyle = '#c8cfda';
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

  const clearBtn = document.getElementById('clearArt');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) grid[y][x] = null;
    drawGrid();
  });
})();

/* Resolution demo — resize the real photo */
(function resolutionDemo() {
  const canvas = document.getElementById('resCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const range = document.getElementById('resRange');
  const out = document.getElementById('resVal');
  const label = document.getElementById('resLabel');
  let SRC = null;

  const small = document.createElement('canvas');
  const sctx = small.getContext('2d');

  function render() {
    if (!SRC) return;
    const w = +range.value;
    const aspect = canvas.height / canvas.width;
    const h = Math.max(1, Math.round(w * aspect));
    small.width = w;
    small.height = h;
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(SRC, 0, 0, w, h);
    ctx.imageSmoothingEnabled = w >= canvas.width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
    out.textContent = w + ' × ' + h;
    label.textContent = w + ' × ' + h + ' pixels · ' + (w * h).toLocaleString() + ' pixels total';
  }
  range.addEventListener('input', render);
  onPhotoReady(img => { SRC = img; render(); });
})();

/* Real colour-depth quantisation */
function _bitSplit(depth) {
  if (depth <= 1) return { mode: 'mono' };
  if (depth === 2) return { mode: 'gray', bits: 2 };
  if (depth === 3) return { mode: 'gray', bits: 3 };
  const b = Math.floor(depth / 3);
  let r = Math.floor((depth - b) / 2);
  let g = depth - r - b;
  return { mode: 'rgb', r, g, b };
}
function _quantizeChannel(v, bits) {
  if (bits <= 0) return 0;
  const levels = (1 << bits) - 1;
  return Math.round(Math.round((v / 255) * levels) * (255 / levels));
}
function _applyDepth(srcCanvas, dstCanvas, depth) {
  const dctx = dstCanvas.getContext('2d');
  dctx.imageSmoothingEnabled = false;
  dctx.drawImage(srcCanvas, 0, 0, dstCanvas.width, dstCanvas.height);
  const img = dctx.getImageData(0, 0, dstCanvas.width, dstCanvas.height);
  const data = img.data;
  const split = _bitSplit(depth);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (split.mode === 'mono') {
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      const v = lum > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    } else if (split.mode === 'gray') {
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      const v = _quantizeChannel(lum, split.bits);
      data[i] = data[i + 1] = data[i + 2] = v;
    } else {
      data[i]     = _quantizeChannel(r, split.r);
      data[i + 1] = _quantizeChannel(g, split.g);
      data[i + 2] = _quantizeChannel(b, split.b);
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
  let SRC = null;
  function render() {
    if (!SRC) return;
    const d = +range.value;
    _applyDepth(SRC, canvas, d);
    const colours = Math.pow(2, d);
    out.textContent = d + '-bit';
    label.textContent = d + '-bit · ' + colours.toLocaleString() + ' colours';
  }
  range.addEventListener('input', render);
  onPhotoReady(img => { SRC = img; render(); });
})();

/* Human-readable byte formatting */
function _formatBytes(bytes) {
  if (bytes < 1024) return bytes.toLocaleString() + ' bytes';
  const kib = bytes / 1024;
  if (kib < 1024) return kib.toFixed(2) + ' KiB';
  const mib = kib / 1024;
  if (mib < 1024) return mib.toFixed(2) + ' MiB';
  return (mib / 1024).toFixed(2) + ' GiB';
}

/* Image file-size calculator */
(function fileSizeCalc() {
  const w = document.getElementById('imgFsWidth');
  const h = document.getElementById('imgFsHeight');
  const d = document.getElementById('imgFsDepth');
  const out = document.getElementById('imgFsOutput');
  if (!out) return;
  function calc() {
    const W = Math.max(1, +w.value | 0);
    const H = Math.max(1, +h.value | 0);
    const D = +d.value;
    const bits = W * H * D;
    const bytes = bits / 8;
    out.innerHTML =
      '<p><strong>Working out:</strong></p>' +
      '<p>' + W.toLocaleString() + ' × ' + H.toLocaleString() + ' × ' + D + ' = <strong>' + bits.toLocaleString() + ' bits</strong></p>' +
      '<p>' + bits.toLocaleString() + ' ÷ 8 = <strong>' + bytes.toLocaleString() + ' bytes</strong></p>' +
      '<p>That\'s approximately <strong>' + _formatBytes(bytes) + '</strong>.</p>';
  }
  [w, h, d].forEach(el => el.addEventListener('input', calc));
  calc();
})();

/* Generic quiz runner — used by both Images and Sound */
function _runQuiz(formId, answers, explain, summaryId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const btn = form.querySelector('.mark-quiz');
  const result = form.querySelector('.quiz-result');
  if (!btn || !result) return;
  btn.addEventListener('click', () => {
    let score = 0;
    let feedback = [];
    Object.keys(answers).forEach(q => {
      const chosen = form.querySelector('input[name="' + q + '"]:checked');
      if (chosen && chosen.value === answers[q]) score++;
      else feedback.push('Q' + q.slice(1) + ': ' + explain[q]);
    });
    const total = Object.keys(answers).length;
    result.className = 'quiz-result ' + (score === total ? 'good' : 'bad');
    const summary = summaryId ? document.getElementById(summaryId) : null;
    if (score === total) {
      result.innerHTML = '🎉 Perfect — ' + score + '/' + total + '! You\'ve nailed it.';
      if (summary) { summary.hidden = false; summary.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    } else {
      if (summary) summary.hidden = true;
      result.innerHTML = 'You got <strong>' + score + '/' + total + '</strong>.<br>' + feedback.map(f => '• ' + f).join('<br>');
    }
  });
}

/* Image quiz */
_runQuiz('imgQuizForm',
  { q1: 'b', q2: 'b', q3: 'b', q4: 'a', q5: 'b' },
  {
    q1: 'Pixel = picture element.',
    q2: '200 × 100 × 8 = 160,000 bits ÷ 8 = 20,000 bytes.',
    q3: '2⁴ = 16 colours.',
    q4: 'Fewer pixels means each one has to be bigger — that produces blocky edges.',
    q5: 'Fewer bits per pixel means fewer colour shades, so smooth gradients become bands of solid colour.',
  },
  'imgSummary'
);

/* ============================================================
   RICHER SOUND DEMOS — Web Audio playback, resampling, quiz
   ============================================================ */

let _audioCtx = null;
function _getAudio() {
  if (_audioCtx) return _audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  _audioCtx = new AC();
  return _audioCtx;
}

/* Play a clean 440 Hz sine for ~1.5 s */
(function pureToneDemo() {
  const btn = document.getElementById('playTone');
  if (!btn) return;
  const status = document.getElementById('toneStatus');
  btn.addEventListener('click', () => {
    const ctx = _getAudio();
    if (!ctx) { if (status) status.textContent = 'Web Audio not supported in this browser.'; return; }
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.55);
    if (status) status.textContent = '♪ playing 440 Hz sine — a clean analogue-style wave';
    setTimeout(() => { if (status) status.textContent = 'ready'; }, 1600);
  });
})();

/* Sampling / bit depth playback demo */
(function samplingDemo() {
  const playOrig = document.getElementById('playOrig');
  const playSampled = document.getElementById('playSampled');
  const stopAll = document.getElementById('stopSound');
  if (!playOrig || !playSampled) return;
  const status = document.getElementById('sampleStatus');
  const srRange = document.getElementById('snd-sr');
  const bdRange = document.getElementById('snd-bd');

  const NOTES = [329.63, 392.00, 493.88, 659.25]; // E4, G4, B4, E5
  const PHRASE_LEN = 3.0;

  let currentSource = null;

  function stop() {
    if (currentSource) { try { currentSource.stop(); } catch (e) {} currentSource = null; }
    if (status) status.textContent = 'stopped';
  }

  function buildBuffer(ctx, rate, depth) {
    const totalSamples = Math.floor(rate * PHRASE_LEN);
    const noteSamples = Math.floor(totalSamples / NOTES.length);
    const buf = ctx.createBuffer(1, totalSamples, rate);
    const data = buf.getChannelData(0);
    const levels = depth >= 16 ? 0 : Math.pow(2, depth); // 0 = no quantisation
    for (let i = 0; i < totalSamples; i++) {
      const noteIdx = Math.min(NOTES.length - 1, Math.floor(i / noteSamples));
      const localI = i - noteIdx * noteSamples;
      const t = i / rate;
      const noteT = localI / noteSamples;
      // gentle attack/release envelope
      const env = Math.min(1, noteT * 12) * Math.min(1, (1 - noteT) * 6);
      const freq = NOTES[noteIdx];
      let sample = Math.sin(2 * Math.PI * freq * t) * 0.35 * env;
      if (levels > 0) {
        const normalised = (sample + 1) / 2; // 0..1
        const q = Math.round(normalised * (levels - 1)) / (levels - 1);
        sample = q * 2 - 1;
      }
      data[i] = sample;
    }
    return buf;
  }

  function play(rate, depth, label) {
    const ctx = _getAudio();
    if (!ctx) { if (status) status.textContent = 'Web Audio not supported.'; return; }
    if (ctx.state === 'suspended') ctx.resume();
    stop();
    const buf = buildBuffer(ctx, rate, depth);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    currentSource = src;
    src.onended = () => { if (currentSource === src) currentSource = null; };
    if (status) status.textContent = '♪ ' + label;
  }

  playOrig.addEventListener('click', () => {
    play(44100, 16, 'playing original — 44.1 kHz, 16-bit (CD quality)');
  });
  playSampled.addEventListener('click', () => {
    const rate = Math.max(2000, +srRange.value);
    const depth = Math.max(1, +bdRange.value);
    play(rate, depth, 'playing sampled — ' + rate.toLocaleString() + ' Hz, ' + depth + '-bit');
  });
  if (stopAll) stopAll.addEventListener('click', stop);
})();

/* Sound file-size calculator */
(function soundFileSizeCalc() {
  const r = document.getElementById('sndFsRate');
  const t = document.getElementById('sndFsDur');
  const d = document.getElementById('sndFsDepth');
  const out = document.getElementById('sndFsOutput');
  if (!out) return;
  function calc() {
    const R = Math.max(1, +r.value | 0);
    const T = Math.max(1, +t.value | 0);
    const D = +d.value;
    const bits = R * T * D;
    const bytes = bits / 8;
    out.innerHTML =
      '<p><strong>Working out:</strong></p>' +
      '<p>' + R.toLocaleString() + ' Hz × ' + T + ' s × ' + D + ' bits = <strong>' + bits.toLocaleString() + ' bits</strong></p>' +
      '<p>' + bits.toLocaleString() + ' ÷ 8 = <strong>' + bytes.toLocaleString() + ' bytes</strong></p>' +
      '<p>That\'s approximately <strong>' + _formatBytes(bytes) + '</strong>.</p>';
  }
  [r, t, d].forEach(el => el.addEventListener('input', calc));
  calc();
})();

/* Sound quiz */
_runQuiz('sndQuizForm',
  { q1: 'b', q2: 'c', q3: 'a', q4: 'b', q5: 'c' },
  {
    q1: 'Sample rate = the number of samples taken per second, measured in Hertz.',
    q2: 'Bit depth = the number of bits stored per sample. It controls the accuracy of each measurement.',
    q3: 'Doubling the sample rate doubles the data captured per second — file size doubles too.',
    q4: 'Telephone systems use a very low sample rate (~8 kHz), so the digital wave is far from the analogue original.',
    q5: 'Convert analogue to digital: sample the wave, measure the amplitude at regular intervals, store each sample as binary.',
  },
  'sndSummary'
);
