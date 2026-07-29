// ---------- Progress bar + side-nav active state ----------
const progressBar = document.getElementById('progress-bar');
const sections = Array.from(document.querySelectorAll('.section'));
const navLinks = Array.from(document.querySelectorAll('#side-nav a'));

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const aimIndicator = document.getElementById('aim-indicator');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      const aim = e.target.dataset.aim;
      if (aim) {
        aimIndicator.textContent = aim;
        aimIndicator.classList.add('visible');
      } else {
        aimIndicator.classList.remove('visible');
      }
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach((s) => observer.observe(s));

// ---------- Flip cards ----------
document.querySelectorAll('.flip-card').forEach((card) => {
  card.addEventListener('click', () => {
    const pressed = card.getAttribute('aria-pressed') === 'true';
    card.setAttribute('aria-pressed', String(!pressed));
  });
});

// ---------- Cable types ----------
// SVG visuals for each cable type
const cableTypes = [
  {
    id: 'twisted',
    name: 'Twisted pair (copper)',
    info: 'Pairs of copper wires twisted together to reduce interference. The most common cable in homes and schools, used for <strong>Ethernet</strong>. Cheap and reliable but slower than fibre.',
    inside: { src: 'images/twisted-inside.jpg', caption: 'Inside a twisted-pair cable: bundles of thin copper wires twisted together.' },
    svg: `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="24" width="18" height="42" fill="#475569" rx="3"/>
      <rect x="180" y="24" width="18" height="42" fill="#475569" rx="3"/>
      <!-- Pair 1: two wires twisted around each other -->
      <path d="M20 30 Q 30 42, 40 30 T 60 30 T 80 30 T 100 30 T 120 30 T 140 30 T 160 30 T 180 30" fill="none" stroke="#fb923c" stroke-width="3"/>
      <path d="M20 38 Q 30 26, 40 38 T 60 38 T 80 38 T 100 38 T 120 38 T 140 38 T 160 38 T 180 38" fill="none" stroke="#fed7aa" stroke-width="3"/>
      <!-- Pair 2 -->
      <path d="M20 52 Q 30 64, 40 52 T 60 52 T 80 52 T 100 52 T 120 52 T 140 52 T 160 52 T 180 52" fill="none" stroke="#3b82f6" stroke-width="3"/>
      <path d="M20 60 Q 30 48, 40 60 T 60 60 T 80 60 T 100 60 T 120 60 T 140 60 T 160 60 T 180 60" fill="none" stroke="#bfdbfe" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'fibre',
    name: 'Fibre optic',
    info: 'Thin strands of <strong>glass</strong> that carry data as pulses of light. Extremely fast and can carry signals over very long distances. Used for the internet backbone and submarine cables.',
    inside: { src: 'images/fibre-inside.jpeg', caption: 'Inside a fibre-optic cable: colour-coded glass strands that carry pulses of light.' },
    svg: `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="glow" x1="0" x2="1">
          <stop offset="0" stop-color="#5eead4"/>
          <stop offset="0.5" stop-color="#fbbf24"/>
          <stop offset="1" stop-color="#5eead4"/>
        </linearGradient>
      </defs>
      <rect x="20" y="35" width="160" height="20" fill="#0f172a" rx="10" stroke="#5eead4" stroke-width="1"/>
      <rect x="22" y="40" width="156" height="10" fill="url(#glow)" rx="5" opacity="0.9"/>
      <circle cx="100" cy="45" r="3" fill="#fef3c7"/>
      <circle cx="60" cy="45" r="2.5" fill="#fef3c7" opacity="0.7"/>
      <circle cx="140" cy="45" r="2.5" fill="#fef3c7" opacity="0.7"/>
    </svg>`
  },
  {
    id: 'coax',
    name: 'Coaxial cable',
    info: 'A single copper core surrounded by insulation, a metal shield and an outer cover. Used for <strong>TV signals</strong> and some broadband connections.',
    inside: { src: 'images/coaxial-inside.jpg', caption: 'Inside a coaxial cable: a central copper wire, white insulation, a woven copper shield and an outer jacket.' },
    svg: `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
      <!-- Stepped cutaway: jacket → braided shield → insulation → copper core -->
      <rect x="112" y="25" width="80" height="40" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
      <rect x="76" y="30" width="44" height="30" rx="7" fill="#94a3b8"/>
      <g stroke="#64748b" stroke-width="1" opacity="0.8">
        <line x1="80" y1="32" x2="90" y2="58"/>
        <line x1="88" y1="32" x2="98" y2="58"/>
        <line x1="96" y1="32" x2="106" y2="58"/>
        <line x1="104" y1="32" x2="114" y2="58"/>
        <line x1="82" y1="58" x2="92" y2="32"/>
        <line x1="90" y1="58" x2="100" y2="32"/>
        <line x1="98" y1="58" x2="108" y2="32"/>
        <line x1="106" y1="58" x2="116" y2="32"/>
      </g>
      <rect x="44" y="36" width="40" height="18" rx="6" fill="#e2e8f0"/>
      <rect x="8" y="42" width="44" height="6" rx="3" fill="#f97316"/>
    </svg>`
  },
  {
    id: 'wireless',
    name: 'Wireless (Wi-Fi / radio)',
    info: 'Data sent through the <strong>air</strong> using radio waves or microwaves. No cable needed. Used for <strong>Wi-Fi</strong> and mobile phones. Easy and flexible, but signal can be weaker and less secure.',
    svg: `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
      <rect x="86" y="50" width="28" height="28" rx="4" fill="#1a2547" stroke="#5eead4" stroke-width="1.5"/>
      <circle cx="100" cy="64" r="3" fill="#5eead4"/>
      <path d="M75 50 Q 100 28, 125 50" fill="none" stroke="#5eead4" stroke-width="2" opacity="0.8"/>
      <path d="M62 50 Q 100 14, 138 50" fill="none" stroke="#5eead4" stroke-width="2" opacity="0.5"/>
      <path d="M49 50 Q 100 0,  151 50" fill="none" stroke="#5eead4" stroke-width="2" opacity="0.3"/>
    </svg>`
  }
];

const cableGrid = document.getElementById('cable-grid');
cableTypes.forEach((c) => {
  const btn = document.createElement('button');
  btn.className = 'cable-card';
  const insideHTML = c.inside
    ? `<div class="cable-inside-row"><button class="cable-inside-btn" data-cable-inside="${c.id}">🔍 See inside</button></div>`
    : '';
  btn.innerHTML = `
    <div class="cable-svg">${c.svg}</div>
    <div class="cable-name">${c.name}</div>
    <div class="cable-info">${c.info}</div>
    ${insideHTML}
  `;
  btn.addEventListener('click', (e) => {
    if (e.target.closest('.cable-inside-btn')) {
      e.stopPropagation();
      openLightbox(c.inside.src, c.inside.caption);
      return;
    }
    btn.classList.toggle('active');
  });
  cableGrid.appendChild(btn);
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption || '';
  lightboxCaption.textContent = caption || '';
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
  document.body.style.overflow = '';
}
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
});

document.getElementById('wireless-reveal').addEventListener('click', (e) => {
  document.getElementById('wireless-answer').hidden = false;
  e.target.remove();
});

document.getElementById('fact-reveal').addEventListener('click', (e) => {
  document.getElementById('fact-answer').hidden = false;
  e.target.remove();
});

// ---------- Wireless pros / cons ----------
const pros = [
  'No need to buy or use cables.',
  'No need to install wires through buildings.',
  'Easy to connect to different networks.',
  'Allows devices to be mobile, such as smartphones and tablets.'
];
const cons = [
  'Harder to connect if a password is needed.',
  'Poor signal in some areas of buildings.',
  'Typically slower than cables.',
  'Security issues. Hackers can listen to the wireless signal.'
];

function buildRevealList(parentId, items, kind) {
  const parent = document.getElementById(parentId);
  items.forEach((text) => {
    const btn = document.createElement('button');
    btn.className = 'reveal-item';
    btn.innerHTML = `<span class="reveal-hint">Click to reveal</span><span class="reveal-text" style="display:none"></span>`;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('revealed')) return;
      btn.classList.add('revealed', kind);
      btn.innerHTML = text;
    });
    parent.appendChild(btn);
  });
}
buildRevealList('pros-list', pros, 'pro');
buildRevealList('cons-list', cons, 'con');

// ---------- Bandwidth bars ----------
// Animate bars on scroll into view using log scale so they're comparable
const bwFills = document.querySelectorAll('.bw-fill');
const bwSpeeds = Array.from(bwFills).map((el) => parseFloat(el.dataset.speed));
const bwMax = Math.max(...bwSpeeds);
const bwObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      bwFills.forEach((el) => {
        const speed = parseFloat(el.dataset.speed);
        // log scale so the year-2000 modem is still visible next to 160 Tb/s
        const logPct = (Math.log10(speed) / Math.log10(bwMax)) * 100;
        el.style.width = logPct + '%';
      });
      bwObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
const bwSection = document.getElementById('bandwidth');
if (bwSection) bwObserver.observe(bwSection);

// ---------- Worked-example expandable steps ----------
document.querySelectorAll('.calc-step').forEach((step) => {
  step.addEventListener('click', () => {
    step.classList.toggle('open');
    const hint = step.querySelector('.step-hint');
    hint.textContent = step.classList.contains('open') ? 'Hide ▴' : 'Click to reveal ▾';
  });
});

// ---------- Download time calculator ----------
const fileSizeEl = document.getElementById('file-size');
const fileUnitEl = document.getElementById('file-unit');
const bwSpeedEl  = document.getElementById('bw-speed');
const bwUnitEl   = document.getElementById('bw-unit');
const calcOutput = document.getElementById('calc-output');
const calcReveal = document.getElementById('calc-reveal');

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return '?';
  if (seconds < 1) return (seconds * 1000).toFixed(0) + ' milliseconds';
  if (seconds < 60) return seconds.toFixed(seconds < 10 ? 2 : 1) + ' seconds';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins} min ${secs} sec`;
  const hrs = Math.floor(mins / 60);
  const rmins = mins % 60;
  if (hrs < 24) return `${hrs} hr ${rmins} min`;
  const days = Math.floor(hrs / 24);
  return `${days} days ${hrs % 24} hr`;
}

function formatNum(n) {
  if (!isFinite(n)) return '?';
  if (n >= 1000 || n < 0.01) return n.toExponential(2);
  return parseFloat(n.toPrecision(4)).toString();
}

function updateCalc() {
  const fsRaw = parseFloat(fileSizeEl.value);
  const bsRaw = parseFloat(bwSpeedEl.value);
  if (!fsRaw || !bsRaw || fsRaw <= 0 || bsRaw <= 0) {
    calcOutput.innerHTML = `<span class="calc-eq">Enter a positive file size and bandwidth.</span>`;
    return;
  }

  const fileMB = fsRaw * parseFloat(fileUnitEl.value); // → MB
  const bwMbps = bsRaw * parseFloat(bwUnitEl.value);   // → Mb/s
  const bwMBps = bwMbps / 8;
  const seconds = fileMB / bwMBps;

  const fsUnitLabel = fileUnitEl.options[fileUnitEl.selectedIndex].text;
  const bsUnitLabel = bwUnitEl.options[bwUnitEl.selectedIndex].text;

  calcOutput.innerHTML = `
    <div><span class="calc-eq">File size:</span> ${formatNum(fsRaw)} ${fsUnitLabel} = <strong>${formatNum(fileMB)} MB</strong></div>
    <div><span class="calc-eq">Bandwidth:</span> ${formatNum(bsRaw)} ${bsUnitLabel} = <strong>${formatNum(bwMbps)} Mb/s</strong></div>
    <div><span class="calc-eq">Convert to MB/s:</span> ${formatNum(bwMbps)} ÷ 8 = <strong>${formatNum(bwMBps)} MB/s</strong></div>
    <div><span class="calc-eq">Time:</span> ${formatNum(fileMB)} MB ÷ ${formatNum(bwMBps)} MB/s = <strong>${formatNum(seconds)} seconds</strong></div>
    <span class="calc-final">⏱ ${formatTime(seconds)}</span>
  `;
}

function hideCalcOutput() {
  calcOutput.hidden = true;
  calcReveal.hidden = false;
  calcReveal.textContent = '🔍 Reveal working & answer';
}

[fileSizeEl, bwSpeedEl, fileUnitEl, bwUnitEl].forEach((el) => {
  el.addEventListener('input', hideCalcOutput);
  el.addEventListener('change', hideCalcOutput);
});

document.querySelectorAll('.preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    fileSizeEl.value = btn.dataset.fs;
    fileUnitEl.value = btn.dataset.fu;
    bwSpeedEl.value  = btn.dataset.bs;
    bwUnitEl.value   = btn.dataset.bu;
    hideCalcOutput();
  });
});

calcReveal.addEventListener('click', () => {
  updateCalc();
  calcOutput.hidden = false;
  calcReveal.hidden = true;
});

// ---------- Motorway lanes race ----------
const LANE_BIT_SEQ = '10110101001011010110';
const LANE_BIT_W = 18;
const LANE_BIT_GAP = 4;
const LANE_PITCH = LANE_BIT_W + LANE_BIT_GAP;
const LANE_SPEED_PXPS = 140;

function distributeBits(total, lanes) {
  const base = Math.floor(total / lanes);
  const rem = total % lanes;
  return Array.from({ length: lanes }, (_, i) => base + (i < rem ? 1 : 0));
}

function buildRoadRow(row) {
  const lanes = +row.dataset.lanes;
  const total = +row.dataset.bits;
  const dist = distributeBits(total, lanes);
  const roadEl = row.querySelector('.road');
  roadEl.innerHTML = '';
  let bitIdx = 0;
  dist.forEach((count) => {
    const lane = document.createElement('div');
    lane.className = 'lane';
    const cars = document.createElement('div');
    cars.className = 'cars';
    cars.style.width = (count * LANE_PITCH) + 'px';
    for (let i = 0; i < count; i++) {
      const ch = LANE_BIT_SEQ[bitIdx % LANE_BIT_SEQ.length];
      bitIdx++;
      const bit = document.createElement('span');
      bit.className = 'bit ' + (ch === '1' ? 'one' : 'zero');
      bit.textContent = ch;
      cars.appendChild(bit);
    }
    lane.appendChild(cars);
    roadEl.appendChild(lane);
  });
}

const roadRows = document.querySelectorAll('.road-row[data-bits]');
roadRows.forEach(buildRoadRow);

const laneResults = document.getElementById('lane-results');
let raceTimers = [];

function resetRace() {
  raceTimers.forEach(clearTimeout);
  raceTimers = [];
  laneResults.innerHTML = '';
  roadRows.forEach((row) => {
    row.querySelectorAll('.cars').forEach((cars) => {
      const w = parseFloat(cars.style.width);
      cars.style.transition = 'none';
      cars.style.transform = `translateX(-${w}px)`;
      void cars.offsetWidth;
    });
  });
}

function startRace() {
  resetRace();
  // Rebuild in case the analogy was opened/resized after load
  roadRows.forEach(buildRoadRow);
  roadRows.forEach((row) => {
    row.querySelectorAll('.cars').forEach((cars) => {
      const w = parseFloat(cars.style.width);
      cars.style.transition = 'none';
      cars.style.transform = `translateX(-${w}px)`;
    });
  });

  const summaries = [];
  roadRows.forEach((row) => {
    const lanes = +row.dataset.lanes;
    const total = +row.dataset.bits;
    const roadW = row.querySelector('.road').getBoundingClientRect().width;
    const dist = distributeBits(total, lanes);
    const maxCount = Math.max(...dist);
    const slowestMs = ((roadW + maxCount * LANE_PITCH) / LANE_SPEED_PXPS) * 1000;

    row.querySelectorAll('.cars').forEach((cars) => {
      const myW = parseFloat(cars.style.width);
      const ms = ((roadW + myW) / LANE_SPEED_PXPS) * 1000;
      cars.style.transition = `transform ${ms}ms linear`;
      requestAnimationFrame(() => {
        cars.style.transform = `translateX(${roadW}px)`;
      });
    });

    summaries.push({ lanes, ms: slowestMs });
  });

  const ranking = summaries.slice().sort((a, b) => a.ms - b.ms);
  const medals = ['🥇 1st', '🥈 2nd', '🥉 3rd'];
  ranking.forEach((s, i) => {
    const t = setTimeout(() => {
      const li = document.createElement('div');
      li.className = 'race-result';
      li.innerHTML = `<strong>${medals[i] || ''}</strong> &nbsp; ${s.lanes} lane${s.lanes > 1 ? 's' : ''} &nbsp; <span style="color: var(--ink-dim);">finished in ${(s.ms / 1000).toFixed(1)}s</span>`;
      laneResults.appendChild(li);
    }, s.ms);
    raceTimers.push(t);
  });
}

const laneStartBtn = document.getElementById('lane-start');
const laneResetBtn = document.getElementById('lane-reset');
if (laneStartBtn) laneStartBtn.addEventListener('click', startRace);
if (laneResetBtn) laneResetBtn.addEventListener('click', resetRace);


// ---------- Buffering simulator ----------
const bufLoaded  = document.getElementById('buffer-loaded');
const bufPlayed  = document.getElementById('buffer-played');
const bufStatus  = document.getElementById('buffer-status');
const bufFrame   = document.getElementById('buffer-frame');
const bufLog     = document.getElementById('buffer-log');

let bufState = {
  loaded: 0,    // % of video loaded
  played: 0,    // % of video played
  loadRate: 0,  // % per tick
  playRate: 0.6,
  timer: null,
  paused: false,
  scenario: null
};

function bufReset() {
  if (bufState.timer) clearInterval(bufState.timer);
  bufState = { loaded: 0, played: 0, loadRate: 0, playRate: 0.6, timer: null, paused: false, scenario: null };
  bufLoaded.style.width = '0%';
  bufPlayed.style.width = '0%';
  bufFrame.className = 'buffer-frame';
  bufFrame.textContent = '▶';
  bufStatus.className = 'buffer-status';
  bufStatus.textContent = 'Ready';
  bufLog.textContent = '';
  bufLog.className = 'feedback';
}

function bufSet(status, klass, msg) {
  bufStatus.textContent = status;
  bufStatus.className = 'buffer-status ' + (klass || '');
  if (msg) bufLog.innerHTML = msg;
}

function startBuffer(scenario) {
  bufReset();
  bufState.scenario = scenario;
  bufState.loadRate = scenario === 'good' ? 1.4 : 0.7; // baseline

  bufSet('Buffering…', 'good', '📥 Loading the first few seconds into the buffer before playback…');
  bufFrame.textContent = '⏳';
  bufFrame.className = 'buffer-frame paused';

  let tick = 0;
  bufState.timer = setInterval(() => {
    tick++;

    // For the "bad" scenario, drop the load rate at specific times to simulate
    // an unstable connection.
    if (scenario === 'bad') {
      if (tick === 35) bufState.loadRate = 0.05;
      if (tick === 70) bufState.loadRate = 0.6;
      if (tick === 110) bufState.loadRate = 0.0;
      if (tick === 150) bufState.loadRate = 0.9;
    }

    bufState.loaded = Math.min(100, bufState.loaded + bufState.loadRate);

    // Start playing once we have 10% buffered
    const playing = bufState.played > 0 || bufState.loaded >= 10;
    if (playing && !bufState.paused) {
      // Pause if the play head catches up to the loaded edge
      if (bufState.played + 0.1 >= bufState.loaded && bufState.loaded < 100) {
        bufState.paused = true;
        bufSet('Buffering…', 'bad', '⚠️ Buffer empty! Connection too slow. Pausing to refill the buffer.');
        bufFrame.textContent = '⏳';
        bufFrame.className = 'buffer-frame paused';
      } else {
        bufState.played = Math.min(bufState.loaded, bufState.played + bufState.playRate);
        if (bufFrame.textContent !== '▶') {
          bufFrame.textContent = '▶';
          bufFrame.className = 'buffer-frame playing';
          bufSet('Playing', 'good',
            scenario === 'good'
              ? '✅ Fast connection. The buffer fills faster than the video plays, so playback is smooth.'
              : '▶ Playing using buffered video. If the connection drops, we have a few seconds in reserve.'
          );
        }
      }
    }

    // Resume from pause once buffer is sufficiently ahead again
    if (bufState.paused && bufState.loaded - bufState.played > 5) {
      bufState.paused = false;
    }

    bufLoaded.style.width = bufState.loaded + '%';
    bufPlayed.style.width = bufState.played + '%';

    if (bufState.played >= 100) {
      clearInterval(bufState.timer);
      bufFrame.textContent = '✓';
      bufFrame.className = 'buffer-frame';
      bufSet('Finished', 'good', '🎉 Video finished playing.');
    }
  }, 100);
}

document.getElementById('buffer-good').addEventListener('click', () => startBuffer('good'));
document.getElementById('buffer-bad').addEventListener('click',  () => startBuffer('bad'));
document.getElementById('buffer-stop').addEventListener('click', bufReset);

// ---------- Plenary: media labelling ----------
const mediaItems = [
  { id: 'twisted',  label: 'Copper cable (twisted pair)',
    svg: cableTypes[0].svg },
  { id: 'fibre',    label: 'Fibre optic cable',
    svg: cableTypes[1].svg },
  { id: 'coax',     label: 'Coaxial cable',
    svg: cableTypes[2].svg },
  { id: 'wireless', label: 'Wi-Fi (wireless)',
    svg: cableTypes[3].svg }
];

const itemsEl  = document.getElementById('media-items');
const labelsEl = document.getElementById('media-labels');
const mediaScoreEl = document.getElementById('media-score');

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let mediaSelected = null;
let mediaMatched = 0;

function renderMedia() {
  itemsEl.innerHTML = '';
  labelsEl.innerHTML = '';
  mediaSelected = null;
  mediaMatched = 0;
  updateMediaScore();

  shuffle(mediaItems).forEach((m) => {
    const b = document.createElement('button');
    b.className = 'tld-btn';
    b.dataset.id = m.id;
    b.innerHTML = `<span class="mini-cable">${m.svg}</span><span>What is this?</span>`;
    b.addEventListener('click', () => onMediaItemClick(b));
    itemsEl.appendChild(b);
  });
  shuffle(mediaItems).forEach((m) => {
    const b = document.createElement('button');
    b.className = 'tld-btn';
    b.dataset.id = m.id;
    b.textContent = m.label;
    b.addEventListener('click', () => onMediaLabelClick(b));
    labelsEl.appendChild(b);
  });
}

function updateMediaScore() {
  mediaScoreEl.textContent = `Matched ${mediaMatched} / ${mediaItems.length}`;
}

function onMediaItemClick(btn) {
  if (btn.classList.contains('matched')) return;
  document.querySelectorAll('#media-items .tld-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  mediaSelected = btn;
}

function onMediaLabelClick(btn) {
  if (btn.classList.contains('matched')) return;
  if (!mediaSelected) {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 300);
    return;
  }
  if (btn.dataset.id === mediaSelected.dataset.id) {
    btn.classList.add('matched');
    mediaSelected.classList.add('matched');
    mediaSelected.classList.remove('selected');
    mediaSelected = null;
    mediaMatched++;
    updateMediaScore();
  } else {
    btn.classList.add('wrong');
    mediaSelected.classList.add('wrong');
    const sel = mediaSelected;
    setTimeout(() => {
      btn.classList.remove('wrong');
      sel.classList.remove('wrong', 'selected');
    }, 350);
    mediaSelected = null;
  }
}

document.getElementById('media-reveal').addEventListener('click', () => {
  document.querySelectorAll('#media-items .tld-btn, #media-labels .tld-btn').forEach((b) => b.classList.add('matched'));
  mediaMatched = mediaItems.length;
  updateMediaScore();
});
document.getElementById('media-reset').addEventListener('click', renderMedia);
renderMedia();
