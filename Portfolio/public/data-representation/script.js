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

      const sr = parseInt(sampleSlider.value, 10);
      const bd = parseInt(depthSlider.value, 10);
      const levels = Math.pow(2, bd);
      const step = w / sr;

      // sampled steps
      ctx.strokeStyle = "#82AAFF";
      ctx.fillStyle = "rgba(130,170,255,0.15)";
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.beginPath();
      let prevY = h / 2;
      for (let i = 0; i <= sr; i++) {
        const x = i * step;
        const t = x / w;
        const raw = Math.sin(t * Math.PI * 4);
        // quantise to levels
        const q = Math.round(((raw + 1) / 2) * (levels - 1)) / (levels - 1);
        const y = h / 2 + (q * 2 - 1) * (h / 3);
        if (i === 0) { ctx.moveTo(x, y); prevY = y; }
        else { ctx.lineTo(x, prevY); ctx.lineTo(x, y); prevY = y; }
      }
      ctx.stroke();

      // sample dots
      ctx.fillStyle = "#FFCB6B";
      for (let i = 0; i <= sr; i++) {
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
      srVal.textContent = sr + " samples/s";
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
      bits.forEach((b, i) => {
        if (arr[i]) b.classList.add("on"); else b.classList.remove("on");
        const v = b.querySelector(".val");
        if (v) v.textContent = arr[i];
      });
      target.dispatchEvent(new Event("click"));
      // trigger display update by clicking a bit twice? Just recalc:
      let total = 0, bin = "";
      arr.forEach((a, i) => { const place = parseInt(bits[i].dataset.place, 10); if (a) total += place; bin += a; });
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
