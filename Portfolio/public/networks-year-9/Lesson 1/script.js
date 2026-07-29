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

// ---------- URL anatomy ----------
const urlExplanations = {
  protocol: {
    name: 'Protocol',
    body: '<strong>https://</strong> tells the browser which set of rules (protocol) to use. HTTP / HTTPS are used for transferring web pages. HTTPS is the secure (encrypted) version.'
  },
  subdomain: {
    name: 'Subdomain',
    body: '<strong>www.</strong> is a subdomain, historically meaning "world wide web". A site can have other subdomains too, e.g. <em>news.</em>bbc.co.uk.'
  },
  domain: {
    name: 'Domain name',
    body: '<strong>bbc.co.uk</strong> is the domain, the human-friendly name for the site. DNS turns this into an IP address.'
  },
  directory: {
    name: 'Directory (folder)',
    body: '<strong>/news/</strong> is a folder (directory) on the web server, just like folders on your own computer.'
  },
  filename: {
    name: 'Filename',
    body: '<strong>article.html</strong> is the specific file the URL points to inside that folder.'
  }
};
const urlExplainer = document.getElementById('url-explainer');
const httpCallout = document.getElementById('http-callout');
document.querySelectorAll('.url-part').forEach((part) => {
  part.addEventListener('click', () => {
    document.querySelectorAll('.url-part').forEach((p) => p.classList.remove('active'));
    part.classList.add('active');
    const data = urlExplanations[part.dataset.key];
    urlExplainer.innerHTML = `<h3>${data.name}</h3><p>${data.body}</p>`;
    httpCallout.hidden = part.dataset.key !== 'protocol';
  });
});

// ---------- TLD matching game ----------
const tldPairs = [
  { tld: '.ac.uk',  meaning: 'UK academic / university' },
  { tld: '.co.uk',  meaning: 'UK company' },
  { tld: '.sch.uk', meaning: 'UK school' },
  { tld: '.gov.uk', meaning: 'UK government' },
  { tld: '.com',    meaning: 'Company (commercial)' },
  { tld: '.org',    meaning: 'Organisation' },
  { tld: '.fr',     meaning: 'France' },
  { tld: '.uk',     meaning: 'United Kingdom' }
];

const tldDomainsEl = document.getElementById('tld-domains');
const tldMeaningsEl = document.getElementById('tld-meanings');
const tldScoreEl = document.getElementById('tld-score');

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let tldSelected = null;
let tldMatched = 0;

function renderTLD() {
  tldDomainsEl.innerHTML = '';
  tldMeaningsEl.innerHTML = '';
  tldSelected = null;
  tldMatched = 0;
  updateTldScore();

  shuffle(tldPairs).forEach((p) => {
    const b = document.createElement('button');
    b.className = 'tld-btn';
    b.textContent = p.tld;
    b.dataset.tld = p.tld;
    b.addEventListener('click', () => onTldDomainClick(b));
    tldDomainsEl.appendChild(b);
  });
  shuffle(tldPairs).forEach((p) => {
    const b = document.createElement('button');
    b.className = 'tld-btn';
    b.textContent = p.meaning;
    b.dataset.tld = p.tld;
    b.addEventListener('click', () => onTldMeaningClick(b));
    tldMeaningsEl.appendChild(b);
  });
}

function updateTldScore() {
  tldScoreEl.textContent = `Matched ${tldMatched} / ${tldPairs.length}`;
}

function onTldDomainClick(btn) {
  if (btn.classList.contains('matched')) return;
  document.querySelectorAll('#tld-domains .tld-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  tldSelected = btn;
}

function onTldMeaningClick(btn) {
  if (btn.classList.contains('matched')) return;
  if (!tldSelected) {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 300);
    return;
  }
  if (btn.dataset.tld === tldSelected.dataset.tld) {
    btn.classList.add('matched');
    tldSelected.classList.add('matched');
    tldSelected.classList.remove('selected');
    tldSelected = null;
    tldMatched++;
    updateTldScore();
  } else {
    btn.classList.add('wrong');
    tldSelected.classList.add('wrong');
    const sel = tldSelected;
    setTimeout(() => {
      btn.classList.remove('wrong');
      sel.classList.remove('wrong', 'selected');
    }, 350);
    tldSelected = null;
  }
}

document.getElementById('tld-reveal').addEventListener('click', () => {
  document.querySelectorAll('#tld-domains .tld-btn, #tld-meanings .tld-btn').forEach((b) => b.classList.add('matched'));
  tldMatched = tldPairs.length;
  updateTldScore();
});
document.getElementById('tld-reset').addEventListener('click', renderTLD);
renderTLD();

// ---------- IP validation quiz ----------
const ipQuestions = [
  { ip: '142.250.187.195', valid: true,  reason: 'Four numbers, all between 0 and 255. Valid.' },
  { ip: '300.1.2.3',       valid: false, reason: '300 is bigger than 255, so this is not a valid IP address.' },
  { ip: '10.0.0.1.5',      valid: false, reason: 'This has five numbers. An IP address has exactly four.' },
  { ip: '172.16.0.5',      valid: true,  reason: 'Four numbers, all between 0 and 255. Valid.' }
];

const ipQuizEl = document.getElementById('ip-quiz');
ipQuestions.forEach((q) => {
  const card = document.createElement('div');
  card.className = 'ip-question';
  card.innerHTML = `
    <span class="ip-value">${q.ip}</span>
    <div class="ip-buttons">
      <button class="ip-btn" data-answer="valid">Valid</button>
      <button class="ip-btn" data-answer="invalid">Not valid</button>
    </div>
    <p class="ip-explain"></p>
  `;
  ipQuizEl.appendChild(card);

  const btns = card.querySelectorAll('.ip-btn');
  const explain = card.querySelector('.ip-explain');
  btns.forEach((b) => {
    b.addEventListener('click', () => {
      const picked = b.dataset.answer === 'valid';
      const correct = picked === q.valid;
      card.classList.add('answered', correct ? 'correct' : 'wrong');
      btns.forEach((x) => { x.disabled = true; });
      b.classList.add(correct ? 'picked-correct' : 'picked-wrong');
      explain.textContent = (correct ? '✓ Correct. ' : '✗ Not quite. ') + q.reason;
    });
  });
});

// ---------- DNS lookup simulator ----------
const dnsTable = {
  'www.google.co.uk':  '142.250.187.195',
  'www.google.com':    '142.250.190.36',
  'www.bbc.co.uk':     '151.101.0.81',
  'www.youtube.com':   '142.250.72.142',
  'www.wikipedia.org': '208.80.154.224',
  'www.school.sch.uk': '212.58.246.91'
};
const dnsInput = document.getElementById('dns-input');
const dnsMsg = document.getElementById('dns-msg');
const dnsResult = document.getElementById('dns-result');

function randomIP() {
  return [1,2,3,4].map(() => Math.floor(Math.random()*254)+1).join('.');
}

const dnsGoBtn = document.getElementById('dns-go');
dnsGoBtn.addEventListener('click', runDNS);
dnsInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runDNS(); });

// Bumped on every lookup so timers from an abandoned run can't
// overwrite the animation of a newer one.
let dnsSession = 0;

function runDNS() {
  const raw = dnsInput.value.trim().toLowerCase();
  if (!raw) {
    dnsResult.textContent = 'Type a domain name first (e.g. www.google.co.uk).';
    dnsResult.className = 'feedback bad';
    return;
  }
  const known = dnsTable[raw];
  const ip = known || randomIP();
  const simulated = !known;

  const my = ++dnsSession;
  dnsGoBtn.disabled = true;
  dnsResult.textContent = '';
  dnsResult.className = 'feedback';

  // Stage 1: query travels left → right
  dnsMsg.className = 'dns-msg';
  dnsMsg.textContent = `What's the IP for ${raw}?`;
  dnsMsg.style.transition = 'none';
  dnsMsg.style.left = '0%';
  // force reflow
  void dnsMsg.offsetWidth;
  dnsMsg.style.transition = '';
  dnsMsg.classList.add('visible');
  requestAnimationFrame(() => {
    dnsMsg.style.left = '100%';
  });

  // Stage 2: reply travels right → left
  setTimeout(() => {
    if (my !== dnsSession) return;
    dnsMsg.classList.add('reply');
    dnsMsg.textContent = `It's ${ip}`;
    dnsMsg.style.transition = 'none';
    dnsMsg.style.left = '100%';
    void dnsMsg.offsetWidth;
    dnsMsg.style.transition = '';
    requestAnimationFrame(() => {
      dnsMsg.style.left = '0%';
    });
  }, 2700);

  // Stage 3: show result
  setTimeout(() => {
    if (my !== dnsSession) return;
    dnsMsg.classList.remove('visible');
    dnsResult.innerHTML = `<strong>${raw}</strong> → <code>${ip}</code>` +
      (simulated ? ' <span class="muted">(made-up IP — this domain isn\'t in our little demo table, but a real DNS server knows millions)</span>' : '');
    dnsResult.className = 'feedback good';
    dnsGoBtn.disabled = false;
  }, 5800);
}

// ---------- Packet switching ----------
const packetInput = document.getElementById('packet-input');
const packetLayer = document.getElementById('packet-layer');
const packetStage = document.getElementById('packet-stage');
const arrivalsEl = document.getElementById('packet-arrivals');
const finalEl = document.getElementById('packet-final');
const finalImageEl = document.getElementById('packet-final-image');
const finalLabel = document.getElementById('packet-final-label');
const routeLabelTop = document.getElementById('route-label-top');
const routeLabelMid = document.getElementById('route-label-mid');
const routeLabelBot = document.getElementById('route-label-bot');
const routeTopEl = document.querySelector('.route-top');
const routeMidEl = document.querySelector('.route-mid');
const routeBotEl = document.querySelector('.route-bot');

// Simple SVG image (sunset over mountains) used for the image demo
const demoImageSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f59e0b"/>
      <stop offset="0.7" stop-color="#f472b6"/>
      <stop offset="1" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <rect width="180" height="100" fill="url(#sky)"/>
  <circle cx="120" cy="55" r="14" fill="#fef3c7"/>
  <polygon points="0,100 30,55 55,80 80,40 110,75 145,50 180,85 180,100" fill="#1e1b4b"/>
  <polygon points="0,100 25,70 60,90 95,65 130,95 160,72 180,90 180,100" fill="#0f0a2e"/>
</svg>`)}`;

// Mode switching
let currentMode = 'text';
document.querySelectorAll('.mode-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentMode = tab.dataset.mode;
    document.getElementById('packet-controls-text').hidden  = currentMode !== 'text';
    document.getElementById('packet-controls-image').hidden = currentMode !== 'image';
    document.getElementById('packet-controls-route').hidden = currentMode !== 'route';
    resetStage();
    applyRouteStyles();
    applyRouteModeView();
  });
});

const networkView = document.getElementById('network-view');
function applyRouteModeView() {
  if (currentMode === 'route') {
    packetStage.classList.add('route-mode');
    networkView.hidden = false;
    buildNetwork();
  } else {
    packetStage.classList.remove('route-mode');
    networkView.hidden = true;
    networkView.innerHTML = '';
  }
}

function applyRouteStyles() {
  routeTopEl.className = 'route route-top';
  routeMidEl.className = 'route route-mid';
  routeBotEl.className = 'route route-bot';
  routeLabelTop.className = 'route-label';
  routeLabelMid.className = 'route-label';
  routeLabelBot.className = 'route-label';
  routeLabelTop.textContent = '';
  routeLabelMid.textContent = '';
  routeLabelBot.textContent = '';

  if (currentMode === 'route') {
    routeTopEl.classList.add('slow');
    routeMidEl.classList.add('down');
    routeBotEl.classList.add('fast');
    routeLabelTop.classList.add('slow');
    routeLabelMid.classList.add('down');
    routeLabelBot.classList.add('fast');
    routeLabelTop.textContent = '🚦 Traffic, slow';
    routeLabelMid.textContent = '✗ Outage';
    routeLabelBot.textContent = '✓ Clear, fast';
  }
}

// Bumped at the start of every Send action. Any timer fired by an earlier
// send no-ops, so old packets can't repopulate the cleared sections.
let _sendSession = 0;
function sendTimeout(fn, ms) {
  const my = _sendSession;
  return setTimeout(() => {
    if (my !== _sendSession) return;
    fn();
  }, ms);
}

function resetStage() {
  _sendSession++;
  packetLayer.innerHTML = '';
  arrivalsEl.innerHTML = '';
  finalEl.textContent = '';
  finalImageEl.innerHTML = '';
  if (currentMode === 'image') {
    finalLabel.textContent = 'Reassembled image';
    finalEl.hidden = true;
    finalImageEl.hidden = false;
  } else if (currentMode === 'route') {
    finalLabel.textContent = 'Reassembled file';
    finalEl.hidden = true;
    finalImageEl.hidden = false;
  } else {
    finalLabel.textContent = 'Reassembled message';
    finalEl.hidden = false;
    finalImageEl.hidden = true;
  }
}

document.getElementById('packet-send').addEventListener('click', () => sendTextPackets());
packetInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendTextPackets(); });
document.getElementById('packet-send-image').addEventListener('click', () => sendImagePackets());
document.getElementById('packet-send-route').addEventListener('click', () => sendRoutePackets());

// Tunable speeds
const SPEEDS = {
  sendStagger: 350,
  baseTravelMs: 3200,
  arrivalStagger: 900,
  jitter: 400
};

function getRouteYs() {
  const stageRect = packetStage.getBoundingClientRect();
  return [
    50,
    stageRect.height / 2,
    stageRect.height - 50
  ];
}

// ---- Mode 1: text ----
function sendTextPackets() {
  resetStage();
  const msg = packetInput.value.trim();
  if (!msg) return;

  const totalPackets = Math.min(6, Math.max(3, Math.ceil(msg.length / 4)));
  const chunkSize = Math.ceil(msg.length / totalPackets);
  const packets = [];
  for (let i = 0; i < totalPackets; i++) {
    packets.push({ num: i + 1, data: msg.substr(i * chunkSize, chunkSize) });
  }

  animatePackets(packets, {
    routeForIndex: (idx) => idx % 3,
    renderPacketEl: (p) => {
      const el = document.createElement('div');
      el.className = 'packet';
      el.textContent = `#${p.num} "${p.data}"`;
      return el;
    },
    renderArrivalEl: (p) => {
      const a = document.createElement('span');
      a.className = 'arrived';
      a.textContent = `#${p.num} "${p.data}"`;
      return a;
    },
    onComplete: () => {
      finalEl.textContent = packets.map((p) => p.data).join('');
    }
  });
}

// ---- Mode 2: image ----
function sendImagePackets() {
  resetStage();

  const totalPackets = 6;
  const stripDisplayW = 22; // matches .packet-strip width
  const stripDisplayH = 40; // matches .packet-strip height
  const totalImgW = totalPackets * stripDisplayW; // 132px

  const stageRect = packetStage.getBoundingClientRect();
  const ys = getRouteYs();
  const startX = 90;
  const endX = stageRect.width - 80;
  const centerY = stageRect.height / 2;

  const packets = [];
  for (let i = 0; i < totalPackets; i++) packets.push({ num: i + 1 });

  // Phase 1: show the WHOLE original image at the sender
  const preview = document.createElement('div');
  preview.style.cssText = `
    position: absolute;
    left: ${startX}px;
    top: ${centerY}px;
    width: ${totalImgW}px;
    height: ${stripDisplayH}px;
    transform: translate(-50%, -50%);
    background-image: url("${demoImageSVG}");
    background-size: 100% 100%;
    border-radius: 4px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    transition: opacity 0.5s;
    z-index: 3;
  `;
  packetLayer.appendChild(preview);

  // Caption above the preview
  const caption = document.createElement('div');
  caption.style.cssText = `
    position: absolute;
    left: ${startX}px;
    top: ${centerY - 38}px;
    transform: translateX(-50%);
    color: var(--ink-dim);
    font-size: 0.85rem;
    white-space: nowrap;
    transition: opacity 0.3s;
    z-index: 3;
  `;
  caption.textContent = '1. Original image';
  packetLayer.appendChild(caption);

  // Phase 2: create the strip packets clustered together (hidden at first)
  const els = packets.map((p, idx) => {
    const el = document.createElement('div');
    el.className = 'packet image-packet';
    const num = document.createElement('span');
    num.className = 'packet-num';
    num.textContent = `#${p.num}`;
    const strip = document.createElement('div');
    strip.className = 'packet-strip';
    strip.style.backgroundImage = `url("${demoImageSVG}")`;
    strip.style.backgroundPosition = `-${idx * stripDisplayW}px 0`;
    el.appendChild(strip);
    el.appendChild(num);

    // Clustered position: side-by-side, forming the image
    const x = startX - totalImgW / 2 + idx * stripDisplayW + stripDisplayW / 2;
    el.style.left = x + 'px';
    el.style.top = centerY + 'px';
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s';
    packetLayer.appendChild(el);
    return el;
  });

  // Phase 2 fires: image "splits" — fade preview out, strips fade in (still clustered)
  sendTimeout(() => {
    preview.style.opacity = '0';
    caption.textContent = '2. Splitting into packets…';
    els.forEach((el) => { el.style.opacity = '1'; });
  }, 1400);

  // Phase 3: strips fan out vertically to their routes
  sendTimeout(() => {
    preview.remove();
    caption.textContent = '3. Sending across the network';
    els.forEach((el, idx) => {
      const y = ys[idx % 3];
      el.style.transition = 'top 0.7s ease-in-out';
      el.style.top = y + 'px';
    });
  }, 2600);

  // Phase 4: each packet travels to receiver (slow + staggered arrivals)
  const phase4Start = 3600;
  const travelBase = 3000;
  const arrivalStagger = 800;
  const order = shuffle(packets.map((_, i) => i));

  packets.forEach((p, idx) => {
    const sendDelay = phase4Start + idx * 250;
    const travel = travelBase + order.indexOf(idx) * arrivalStagger + Math.random() * 300;

    sendTimeout(() => {
      els[idx].style.transition = `left ${travel}ms ease-in-out, top ${travel}ms ease-in-out, opacity 0.4s`;
      els[idx].style.left = endX + 'px';
    }, sendDelay);

    sendTimeout(() => {
      const a = document.createElement('span');
      a.className = 'arrived image-arrived';
      const mini = document.createElement('div');
      mini.className = 'mini-strip';
      mini.style.backgroundImage = `url("${demoImageSVG}")`;
      mini.style.backgroundPosition = `-${idx * 18}px 0`;
      const lbl = document.createElement('span');
      lbl.className = 'mini-num';
      lbl.textContent = `#${p.num}`;
      a.appendChild(mini);
      a.appendChild(lbl);
      arrivalsEl.appendChild(a);
      els[idx].style.opacity = '0';
    }, sendDelay + travel);
  });

  const longest = phase4Start + (packets.length - 1) * 250 + travelBase + (packets.length - 1) * arrivalStagger + 500;
  sendTimeout(() => {
    caption.remove();
    finalImageEl.innerHTML = '';
    packets.forEach((p, idx) => {
      const s = document.createElement('div');
      s.className = 'image-strip';
      s.style.backgroundImage = `url("${demoImageSVG}")`;
      s.style.backgroundPosition = `-${idx * 30}px 0`;
      finalImageEl.appendChild(s);
      sendTimeout(() => s.classList.add('visible'), idx * 150);
    });
  }, longest);
}

// ---- Mode 3: fastest route — network of routers ----
const network = {
  // Positions are fractions of the stage's width/height
  nodes: {
    S:  { x: 0.05, y: 0.50, label: 'Sender',   emoji: '📤', kind: 'endpoint' },
    R1: { x: 0.25, y: 0.20, label: 'Router A', emoji: '🔀', kind: 'router' },
    R2: { x: 0.25, y: 0.80, label: 'Router B', emoji: '🔀', kind: 'router' },
    R3: { x: 0.50, y: 0.50, label: 'Router C', emoji: '🔀', kind: 'router' },
    R4: { x: 0.72, y: 0.20, label: 'Router D', emoji: '🔀', kind: 'router' },
    R5: { x: 0.72, y: 0.80, label: 'Router E', emoji: '🔀', kind: 'router' },
    D:  { x: 0.93, y: 0.50, label: 'Receiver', emoji: '📥', kind: 'endpoint' }
  },
  edges: [
    { from: 'S',  to: 'R1' },
    { from: 'S',  to: 'R2' },
    { from: 'R1', to: 'R3' },
    { from: 'R2', to: 'R3' },
    { from: 'R1', to: 'R4' },
    { from: 'R2', to: 'R5' },
    { from: 'R3', to: 'R4' },
    { from: 'R3', to: 'R5' },
    { from: 'R4', to: 'D'  },
    { from: 'R5', to: 'D'  }
  ]
};

// File icon SVG used for the fastest-route demo
const fileIconSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fef3c7"/>
      <stop offset="1" stop-color="#fcd34d"/>
    </linearGradient>
  </defs>
  <path d="M30 10 L150 10 L180 40 L180 92 L30 92 Z" fill="url(#pg)" stroke="#78350f" stroke-width="2"/>
  <path d="M150 10 L180 40 L150 40 Z" fill="#fbbf24" stroke="#78350f" stroke-width="2"/>
  <text x="105" y="32" text-anchor="middle" font-size="11" font-weight="bold" fill="#78350f">FILE.pdf</text>
  <rect x="45" y="48" width="110" height="3" rx="1" fill="#78350f"/>
  <rect x="45" y="58" width="125" height="3" rx="1" fill="#78350f"/>
  <rect x="45" y="68" width="95"  height="3" rx="1" fill="#78350f"/>
  <rect x="45" y="78" width="120" height="3" rx="1" fill="#78350f"/>
</svg>`)}`;

// Live edge status (dynamic during transmission)
let currentEdgeStatus = {};
function ekey(a, b) { return [a, b].sort().join('-'); }
function initEdgeStatus() {
  currentEdgeStatus = {};
  network.edges.forEach((e) => { currentEdgeStatus[ekey(e.from, e.to)] = 'ok'; });
}
function getEdgeStatus(a, b) { return currentEdgeStatus[ekey(a, b)] || 'ok'; }

function setEdgeStatus(a, b, status) {
  currentEdgeStatus[ekey(a, b)] = status;
  redrawEdge(a, b);
  const line = networkView.querySelector(`line[data-edge="${ekey(a,b)}"]`);
  if (line && line.animate) {
    line.animate(
      [{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }],
      { duration: 500, iterations: 2 }
    );
  }
}

function buildNetwork() {
  networkView.innerHTML = '';
  const rect = packetStage.getBoundingClientRect();
  const W = rect.width;
  const H = rect.height;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');

  network.edges.forEach((e) => {
    const a = network.nodes[e.from];
    const b = network.nodes[e.to];
    const x1 = a.x * W, y1 = a.y * H;
    const x2 = b.x * W, y2 = b.y * H;
    const k = ekey(e.from, e.to);

    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('data-edge', k);
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    svg.appendChild(line);

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('data-edge-label', k);
    text.setAttribute('x', (x1 + x2) / 2);
    text.setAttribute('y', (y1 + y2) / 2 - 8);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('class', 'net-edge-label');
    svg.appendChild(text);
  });

  networkView.appendChild(svg);

  network.edges.forEach((e) => redrawEdge(e.from, e.to));

  Object.entries(network.nodes).forEach(([id, n]) => {
    const node = document.createElement('div');
    node.className = 'net-node net-node-' + n.kind;
    node.dataset.node = id;
    node.style.left = (n.x * W) + 'px';
    node.style.top  = (n.y * H) + 'px';
    node.innerHTML = `<div class="net-emoji">${n.emoji}</div><div class="net-label">${n.label}</div>`;
    networkView.appendChild(node);
  });
}

function redrawEdge(a, b) {
  const k = ekey(a, b);
  const status = getEdgeStatus(a, b);
  const line = networkView.querySelector(`line[data-edge="${k}"]`);
  const lbl  = networkView.querySelector(`text[data-edge-label="${k}"]`);
  if (!line) return;

  if (status === 'down') {
    line.setAttribute('stroke', '#f87171');
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-dasharray', '6 6');
    line.setAttribute('opacity', '0.7');
    if (lbl) { lbl.textContent = '✗ Outage'; lbl.setAttribute('fill', '#f87171'); lbl.style.display = ''; }
  } else if (status === 'slow') {
    line.setAttribute('stroke', '#fbbf24');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-dasharray', '');
    line.setAttribute('opacity', '0.9');
    if (lbl) { lbl.textContent = '🚦 Congested'; lbl.setAttribute('fill', '#fbbf24'); lbl.style.display = ''; }
  } else {
    line.setAttribute('stroke', '#34d399');
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-dasharray', '');
    line.setAttribute('opacity', '0.9');
    if (lbl) { lbl.style.display = 'none'; }
  }
}

function nodePixelPos(id) {
  const rect = packetStage.getBoundingClientRect();
  const n = network.nodes[id];
  return { x: n.x * rect.width, y: n.y * rect.height };
}

function edgeTravelMs(from, to) {
  const s = getEdgeStatus(from, to);
  if (s === 'slow') return 3000;
  return 1500;
}

// Dijkstra — finds the lowest-cost path from start→dest given LIVE edge status.
// Down edges are excluded entirely; slow edges are heavily penalised.
function bestPathFrom(start, dest) {
  const nodes = Object.keys(network.nodes);
  const dist = {}; const prev = {};
  nodes.forEach((n) => { dist[n] = Infinity; });
  dist[start] = 0;
  const visited = new Set();

  while (visited.size < nodes.length) {
    let u = null, minD = Infinity;
    nodes.forEach((n) => {
      if (!visited.has(n) && dist[n] < minD) { u = n; minD = dist[n]; }
    });
    if (u === null || minD === Infinity) break;
    visited.add(u);
    if (u === dest) break;

    network.edges.forEach((e) => {
      let other = null;
      if (e.from === u) other = e.to;
      else if (e.to === u) other = e.from;
      if (!other || visited.has(other)) return;
      const status = getEdgeStatus(u, other);
      if (status === 'down') return; // strictly avoid outages
      const cost = status === 'slow' ? 12 : 1;
      if (dist[u] + cost < dist[other]) {
        dist[other] = dist[u] + cost;
        prev[other] = u;
      }
    });
  }

  if (dist[dest] === Infinity) return null;
  const path = [dest];
  let cur = dest;
  while (cur !== start) {
    cur = prev[cur];
    if (!cur) return null;
    path.unshift(cur);
  }
  return path;
}

// All candidate paths from Sender to Receiver
const allPaths = [
  ['S','R2','R5','D'],
  ['S','R1','R4','D'],
  ['S','R1','R3','R5','D'],
  ['S','R2','R3','R5','D'],
  ['S','R1','R3','R4','D'],
  ['S','R2','R3','R4','D']
];

function choosePath(idx) {
  const viable = allPaths.filter((path) => {
    for (let i = 1; i < path.length; i++) {
      if (getEdgeStatus(path[i-1], path[i]) === 'down') return false;
    }
    return true;
  });
  if (viable.length === 0) return allPaths[0];
  const scored = viable.map((path) => {
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      cost += getEdgeStatus(path[i-1], path[i]) === 'slow' ? 12 : 1;
    }
    return { path, cost };
  });
  scored.sort((a, b) => a.cost - b.cost);
  const minCost = scored[0].cost;
  const top = scored.filter((s) => s.cost === minCost);
  return top[idx % top.length].path;
}

function sendRoutePackets() {
  resetStage();
  initEdgeStatus();
  buildNetwork();

  const totalPackets = 10;
  const sendStagger = 1100;
  const decisionPause = 700;
  const packetDisplayW = 22; // matches .packet-strip width
  const stripDisplayH = 40;
  const totalImgW = totalPackets * packetDisplayW; // 220

  const senderPos = nodePixelPos('S');

  // --- Phase 1: show the whole file at the sender ---
  const preview = document.createElement('div');
  preview.style.cssText = `
    position: absolute;
    left: ${senderPos.x + 70}px;
    top: ${senderPos.y}px;
    width: ${totalImgW}px;
    height: ${stripDisplayH}px;
    transform: translate(-50%, -50%);
    background-image: url("${fileIconSVG}");
    background-size: 100% 100%;
    border-radius: 4px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    transition: opacity 0.5s;
    z-index: 3;
  `;
  packetLayer.appendChild(preview);

  const caption = document.createElement('div');
  caption.style.cssText = `
    position: absolute;
    left: ${senderPos.x + 70}px;
    top: ${senderPos.y - 38}px;
    transform: translateX(-50%);
    color: var(--ink-dim);
    font-size: 0.85rem;
    white-space: nowrap;
    z-index: 3;
  `;
  caption.textContent = '1. The file';
  packetLayer.appendChild(caption);

  // --- Phase 2: render the 10 packet strips clustered together (hidden first) ---
  const els = [];
  for (let i = 0; i < totalPackets; i++) {
    const el = document.createElement('div');
    el.className = 'packet image-packet';
    const numEl = document.createElement('span');
    numEl.className = 'packet-num';
    numEl.textContent = `#${i + 1}`;
    const strip = document.createElement('div');
    strip.className = 'packet-strip';
    strip.style.backgroundImage = `url("${fileIconSVG}")`;
    strip.style.backgroundSize = totalImgW + 'px 40px';
    strip.style.backgroundPosition = `-${i * packetDisplayW}px 0`;
    el.appendChild(strip);
    el.appendChild(numEl);
    const x = (senderPos.x + 70) - totalImgW / 2 + i * packetDisplayW + packetDisplayW / 2;
    el.style.left = x + 'px';
    el.style.top  = senderPos.y + 'px';
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s';
    packetLayer.appendChild(el);
    els.push(el);
  }

  // Phase 2 fires: file "splits" — preview fades, packet strips fade in (still clustered)
  sendTimeout(() => {
    preview.style.opacity = '0';
    caption.textContent = '2. Splitting into 10 packets…';
    els.forEach((el) => { el.style.opacity = '1'; });
  }, 1600);

  // Phase 3: clustered strips collapse to the sender, ready to dispatch
  sendTimeout(() => {
    preview.remove();
    caption.textContent = '3. Sending. Packets pick the fastest open route';
    els.forEach((el) => {
      el.style.transition = 'left 0.7s ease-in-out, top 0.7s ease-in-out';
      el.style.left = senderPos.x + 'px';
      el.style.top  = senderPos.y + 'px';
    });
  }, 2800);

  // --- Phase 4: schedule live network events while packets travel ---
  const dispatchStart = 4000;
  sendTimeout(() => setEdgeStatus('R2', 'R5', 'down'), dispatchStart + 2500);
  sendTimeout(() => setEdgeStatus('R2', 'R5', 'ok'),   dispatchStart + 6500);
  sendTimeout(() => setEdgeStatus('R1', 'R4', 'down'), dispatchStart + 8000);
  sendTimeout(() => setEdgeStatus('R1', 'R4', 'ok'),   dispatchStart + 12500);

  // --- Phase 5: dispatch packets one by one ---
  for (let i = 0; i < totalPackets; i++) {
    const idx = i;
    const num = i + 1;
    const el = els[i];
    const sendDelay = dispatchStart + i * sendStagger;

    sendTimeout(() => {
      // Per-hop dynamic routing: at every node, pick the best next-hop using
      // LIVE edge status. Down edges are never used.
      function hop(currentNode) {
        if (currentNode === 'D') {
          const a = document.createElement('span');
          a.className = 'arrived image-arrived';
          const mini = document.createElement('div');
          mini.className = 'mini-strip';
          mini.style.backgroundImage = `url("${fileIconSVG}")`;
          mini.style.backgroundSize = (totalPackets * 18) + 'px 30px';
          mini.style.backgroundPosition = `-${idx * 18}px 0`;
          const lbl = document.createElement('span');
          lbl.className = 'mini-num';
          lbl.textContent = `#${num}`;
          a.appendChild(mini);
          a.appendChild(lbl);
          arrivalsEl.appendChild(a);
          el.style.opacity = '0';
          return;
        }

        // Find best path from current node to D using live status
        let nextNode = null;
        if (currentNode === 'S') {
          // Use idx-based tiebreak at sender for visible variety
          const initial = choosePath(idx);
          nextNode = initial[1];
          // But re-verify the chosen edge isn't down
          if (getEdgeStatus(currentNode, nextNode) === 'down') {
            const p = bestPathFrom(currentNode, 'D');
            nextNode = (p && p.length > 1) ? p[1] : null;
          }
        } else {
          const p = bestPathFrom(currentNode, 'D');
          nextNode = (p && p.length > 1) ? p[1] : null;
        }

        if (!nextNode) return; // unreachable — give up

        // Glow the router that's "deciding"
        if (currentNode !== 'S') {
          const r = networkView.querySelector(`[data-node="${currentNode}"]`);
          if (r) {
            r.classList.add('thinking');
            sendTimeout(() => r.classList.remove('thinking'), 500);
          }
        }

        const ms = edgeTravelMs(currentNode, nextNode);
        const next = nodePixelPos(nextNode);
        el.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out, opacity 0.3s`;
        el.style.left = next.x + 'px';
        el.style.top  = next.y + 'px';

        sendTimeout(() => {
          const pause = nextNode === 'D' ? 0 : decisionPause;
          sendTimeout(() => hop(nextNode), pause);
        }, ms);
      }

      hop('S');
    }, sendDelay);
  }

  // --- Phase 6: reassemble the file once all packets should have arrived ---
  // Worst realistic case: last packet sent + 4-hop fast path
  const safetyMargin = dispatchStart + (totalPackets - 1) * sendStagger + 4 * 1500 + 3 * decisionPause + 800;
  sendTimeout(() => {
    caption.remove();
    finalImageEl.innerHTML = '';
    const stripW = 28;
    for (let i = 0; i < totalPackets; i++) {
      const s = document.createElement('div');
      s.className = 'image-strip';
      s.style.backgroundImage = `url("${fileIconSVG}")`;
      s.style.width = stripW + 'px';
      s.style.backgroundSize = (totalPackets * stripW) + 'px 100px';
      s.style.backgroundPosition = `-${i * stripW}px 0`;
      finalImageEl.appendChild(s);
      sendTimeout(() => s.classList.add('visible'), i * 150);
    }
  }, safetyMargin);
}

// Rebuild the network if the window is resized while it's visible
window.addEventListener('resize', () => {
  if (currentMode === 'route' && !networkView.hidden) buildNetwork();
});

// ---- Shared animator ----
function animatePackets(packets, opts) {
  const ys = getRouteYs();
  const stageRect = packetStage.getBoundingClientRect();
  const startX = 70;
  const endX = stageRect.width - 70;

  // Build arrival times to know overall finish
  const arrivals = packets.map((_, idx) => {
    const sendDelay = idx * SPEEDS.sendStagger;
    const travel = opts.travelMsForIndex
      ? opts.travelMsForIndex(idx)
      : (SPEEDS.baseTravelMs + Math.random() * SPEEDS.jitter);
    return { sendDelay, travel, total: sendDelay + travel };
  });

  // Shuffle arrival order visually by adding extra delay so order is mixed
  // (only for text/image modes; for route mode, real timing produces realistic order)
  if (!opts.travelMsForIndex) {
    const order = shuffle(packets.map((_, i) => i));
    arrivals.forEach((a, idx) => {
      a.travel = SPEEDS.baseTravelMs + order.indexOf(idx) * SPEEDS.arrivalStagger + Math.random() * SPEEDS.jitter;
      a.total = a.sendDelay + a.travel;
    });
  }

  packets.forEach((p, idx) => {
    const routeIdx = opts.routeForIndex(idx);
    const y = ys[routeIdx];
    const el = opts.renderPacketEl(p);
    el.style.left = startX + 'px';
    el.style.top = y + 'px';
    packetLayer.appendChild(el);

    const { sendDelay, travel } = arrivals[idx];

    sendTimeout(() => {
      el.style.transition = `left ${travel}ms ease-in-out, top ${travel}ms ease-in-out, opacity 0.4s`;
      el.style.left = endX + 'px';
    }, sendDelay);

    sendTimeout(() => {
      arrivalsEl.appendChild(opts.renderArrivalEl(p));
      el.style.opacity = '0';
    }, sendDelay + travel);
  });

  const longest = Math.max(...arrivals.map((a) => a.total)) + 500;
  sendTimeout(() => opts.onComplete && opts.onComplete(), longest);
}

applyRouteStyles();
