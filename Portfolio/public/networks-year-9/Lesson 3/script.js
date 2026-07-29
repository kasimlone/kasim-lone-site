// ---------- Progress bar + side-nav + aim ----------
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

// ---------- Reveal lists helper ----------
function buildRevealList(parentId, items, kind) {
  const parent = document.getElementById(parentId);
  if (!parent) return;
  items.forEach((text) => {
    const btn = document.createElement('button');
    btn.className = 'reveal-item';
    btn.innerHTML = `<span class="reveal-hint">Click to reveal</span>`;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('revealed')) return;
      btn.classList.add('revealed', kind);
      btn.innerHTML = text;
    });
    parent.appendChild(btn);
  });
}

buildRevealList('starter-pros', [
  'Share resources such as <strong>printers</strong>, the internet connection and files on a <strong>file server</strong>.',
  'Access your user files from <strong>any computer</strong> in the school.',
  'Teachers can manage and update every computer <strong>remotely</strong> from one place.',
  'Easier to <strong>install software</strong> on lots of computers at once.'
], 'pro');
buildRevealList('starter-cons', [
  'More <strong>security risks</strong> — a virus or hacker could spread across the network.',
  'Networking hardware (cables, switches, routers) has to be <strong>bought and maintained</strong>.',
  'If the network fails, lots of computers can be affected at once.'
], 'con');

buildRevealList('bus-pros', [
  '<strong>Cheap</strong> to install — only one bus cable and two terminators are needed.',
  '<strong>Easy to add</strong> a new computer — just connect it to the main cable.',
  'Installing the cable is straightforward.'
], 'pro');
buildRevealList('bus-cons', [
  'If the cable is <strong>damaged or cut</strong>, every computer loses its connection.',
  '<strong>Bandwidth decreases</strong> with each computer added — the network slows down.',
  'Only one device can send data at a time.'
], 'con');

buildRevealList('star-pros', [
  'More <strong>reliable</strong> — if one cable fails, only that one computer is affected.',
  '<strong>Faster performance</strong> when a switch is used, because each device has its own link.',
  'Easy to find faults — if one device is offline, it must be its own cable.'
], 'pro');
buildRevealList('star-cons', [
  'Each device needs <strong>its own cable</strong>, so much more cable is needed — making it more <strong>expensive</strong>.',
  'A <strong>switch or hub is required</strong>, which adds to the cost.',
  'If the central switch fails, the whole network goes down.'
], 'con');

// ---------- LAN demo (file from PC1 → printer via switch) ----------
(() => {
  const svg = document.querySelector('.lan-svg');
  if (!svg) return;
  const feedback = document.getElementById('lan-feedback');
  const sendBtn = document.getElementById('lan-send');
  const resetBtn = document.getElementById('lan-reset');

  // device positions (matches SVG)
  const positions = {
    pc1:    { x: 100, y: 90 },
    pc2:    { x: 100, y: 230 },
    printer:{ x: 500, y: 90 },
    server: { x: 500, y: 230 },
    tablet: { x: 300, y: 260 },
    switch: { x: 300, y: 163 }
  };
  const devices = svg.querySelectorAll('.lan-device');
  const switchEl = svg.querySelector('.lan-switch');

  // packet element (created dynamically)
  let packet;
  function makePacket() {
    if (packet) packet.remove();
    packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    packet.setAttribute('r', '10');
    packet.setAttribute('class', 'lan-packet');
    packet.setAttribute('opacity', '0');
    svg.appendChild(packet);
  }

  function moveTo(p, dur = 900) {
    return new Promise((resolve) => {
      packet.style.transition = `cx ${dur}ms ease-in-out, cy ${dur}ms ease-in-out, opacity 0.3s`;
      packet.setAttribute('cx', p.x);
      packet.setAttribute('cy', p.y);
      setTimeout(resolve, dur);
    });
  }
  function setActive(id, on) {
    devices.forEach((d) => {
      if (d.dataset.id === id) d.classList.toggle('active', on);
    });
  }
  function switchActive(on) { switchEl.classList.toggle('active', on); }

  // Bumped by reset() so an in-flight send stops updating the stage.
  let run = 0;

  async function sendFile() {
    const my = ++run;
    makePacket();
    sendBtn.disabled = true;
    feedback.className = 'feedback';
    feedback.innerHTML = '📨 <strong>PC 1</strong> is preparing a file to send to the printer…';
    packet.setAttribute('cx', positions.pc1.x);
    packet.setAttribute('cy', positions.pc1.y);
    setActive('pc1', true);
    packet.setAttribute('opacity', '1');
    await new Promise(r => setTimeout(r, 1200));
    if (my !== run) return;
    feedback.innerHTML = '📤 The packet leaves PC 1 and travels along the cable towards the switch…';
    await moveTo(positions.switch, 2200);
    if (my !== run) return;
    switchActive(true);
    feedback.innerHTML = '🔀 The <strong>switch</strong> reads the destination address and works out which port the printer is connected to.';
    await new Promise(r => setTimeout(r, 1800));
    if (my !== run) return;
    switchActive(false);
    setActive('pc1', false);
    setActive('printer', true);
    feedback.innerHTML = '➡️ The switch forwards the packet down the printer\'s cable…';
    await moveTo(positions.printer, 2200);
    if (my !== run) return;
    feedback.className = 'feedback good';
    feedback.innerHTML = '✅ <strong>File delivered!</strong> The printer can now start printing the document.';
    await new Promise(r => setTimeout(r, 1400));
    if (my !== run) return;
    packet.setAttribute('opacity', '0');
    await new Promise(r => setTimeout(r, 500));
    if (my !== run) return;
    setActive('printer', false);
    sendBtn.disabled = false;
  }

  function reset() {
    run++;
    if (packet) packet.setAttribute('opacity', '0');
    devices.forEach((d) => d.classList.remove('active'));
    switchActive(false);
    feedback.className = 'feedback';
    feedback.textContent = '';
    sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', sendFile);
  resetBtn.addEventListener('click', reset);
})();

// ---------- WAN demo ----------
(() => {
  const wanSend = document.getElementById('wan-send');
  const packet = document.getElementById('wan-packet');
  if (!wanSend || !packet) return;
  wanSend.addEventListener('click', () => {
    wanSend.disabled = true;
    packet.setAttribute('cx', '155');
    packet.setAttribute('opacity', '1');
    requestAnimationFrame(() => {
      packet.setAttribute('cx', '545');
      setTimeout(() => {
        packet.setAttribute('opacity', '0');
        wanSend.disabled = false;
      }, 2200);
    });
  });
})();

// ---------- ISP flow steps ----------
document.querySelectorAll('.isp-step').forEach((step) => {
  step.addEventListener('click', () => step.classList.toggle('open'));
});

// ---------- Lightbox ----------
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
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
});

// ---------- NIC cards (click to view real photo) ----------
document.querySelectorAll('.nic-card').forEach((card) => {
  card.addEventListener('click', () => {
    const img = card.dataset.img;
    if (img) {
      openLightbox(img, card.dataset.caption || '');
    } else {
      card.classList.toggle('active');
    }
  });
});

// ---------- Bus topology ----------
(() => {
  const stage = document.getElementById('bus-stage');
  if (!stage) return;
  const segs = stage.querySelectorAll('.bus-seg');
  const packet = document.getElementById('bus-packet');
  const sendBtn = document.getElementById('bus-send');
  const breakBtn = document.getElementById('bus-break');
  const repairBtn = document.getElementById('bus-repair');
  const addBtn = document.getElementById('bus-add');
  const feedback = document.getElementById('bus-feedback');
  const svg = stage.querySelector('svg');

  // bus runs along y=170 from x=60 to x=660. PC1 drop at x=140, PC4 drop at x=560.
  // Segments: [60-200], [200-360], [360-520], [520-660]
  const PC1_X = 140;
  const PC4_X = 560;

  let extraCount = 0;

  segs.forEach((seg) => {
    seg.addEventListener('click', () => {
      seg.classList.toggle('broken');
      const broken = stage.querySelectorAll('.bus-seg.broken').length;
      if (broken > 0) {
        feedback.className = 'feedback warn';
        feedback.innerHTML = `✂️ Cable broken! Try sending data — every computer past the break will be cut off because they all share this one cable.`;
      } else {
        feedback.className = 'feedback';
        feedback.innerHTML = '✅ Cable repaired. Try sending data again.';
      }
    });
  });

  function isBlocked(fromX, toX) {
    const lo = Math.min(fromX, toX);
    const hi = Math.max(fromX, toX);
    // Each segment spans a range; check if any broken seg overlaps [lo,hi]
    return Array.from(segs).some((s) => {
      if (!s.classList.contains('broken')) return false;
      const x1 = +s.getAttribute('x1');
      const x2 = +s.getAttribute('x2');
      const segLo = Math.min(x1, x2);
      const segHi = Math.max(x1, x2);
      return !(segHi < lo || segLo > hi);
    });
  }

  function setPacket(x, y, opacity = 1) {
    packet.setAttribute('transform', `translate(${x}, ${y})`);
    packet.setAttribute('opacity', opacity);
  }

  function animate(fromX, fromY, toX, toY, dur = 1000) {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 0.5 - Math.cos(Math.PI * t) / 2;
        const x = fromX + (toX - fromX) * eased;
        const y = fromY + (toY - fromY) * eased;
        setPacket(x, y);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  async function sendData() {
    sendBtn.disabled = true;
    feedback.className = 'feedback';
    feedback.innerHTML = '📨 <strong>PC 1</strong> is preparing to broadcast a packet onto the shared bus cable…';
    setPacket(PC1_X, 70, 1);
    await new Promise(r => setTimeout(r, 1200));
    feedback.innerHTML = '⬇️ The packet drops down PC 1\'s connection onto the main bus cable…';
    await animate(PC1_X, 70, PC1_X, 170, 1400);

    if (isBlocked(PC1_X, PC4_X)) {
      const brokenSeg = Array.from(segs).find((s) => s.classList.contains('broken'));
      const bx = (parseFloat(brokenSeg.getAttribute('x1')) + parseFloat(brokenSeg.getAttribute('x2'))) / 2;
      feedback.innerHTML = '➡️ The packet travels along the bus — every device sees it pass by…';
      await animate(PC1_X, 170, bx - 30, 170, 2200);
      feedback.className = 'feedback bad';
      feedback.innerHTML = '💥 The packet hits the <strong>break in the cable</strong> — the signal stops here. <strong>PC 4 never gets the data.</strong> Every device past the break is cut off.';
      packet.setAttribute('opacity', '0.4');
      for (let i = 0; i < 4; i++) {
        await animate(bx - 30, 170, bx - 22, 165, 220);
        await animate(bx - 22, 165, bx - 30, 175, 220);
      }
      await new Promise(r => setTimeout(r, 800));
      packet.setAttribute('opacity', '0');
      sendBtn.disabled = false;
      return;
    }

    feedback.innerHTML = '➡️ The packet travels along the bus — every device on the cable sees it go past…';
    await animate(PC1_X, 170, PC4_X, 170, 3200);
    feedback.innerHTML = '⬇️ PC 4 recognises its own address and takes the packet off the bus.';
    await animate(PC4_X, 170, PC4_X, 270, 1200);
    feedback.className = 'feedback good';
    feedback.innerHTML = '✅ <strong>PC 4 received the data.</strong> Notice every computer on the bus <em>saw</em> the packet pass by — only the destination acts on it.';
    await new Promise(r => setTimeout(r, 1500));
    packet.setAttribute('opacity', '0');
    sendBtn.disabled = false;
  }

  function repair() {
    segs.forEach((s) => s.classList.remove('broken'));
    feedback.className = 'feedback';
    feedback.innerHTML = '🔧 All cable segments repaired.';
  }

  function breakRandom() {
    const idx = Math.floor(Math.random() * segs.length);
    segs[idx].classList.add('broken');
    feedback.className = 'feedback warn';
    feedback.innerHTML = '✂️ Cable damaged! Try sending the data now — devices past the break will be cut off.';
  }

  function addComputer() {
    if (extraCount >= 3) {
      feedback.className = 'feedback warn';
      feedback.innerHTML = '⚠️ The bus is getting crowded! Notice how each added computer <strong>shares the same cable</strong>, slowing everyone down.';
      return;
    }
    extraCount++;
    const xPositions = [320, 480, 620];
    const x = xPositions[extraCount - 1];
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'bus-extra');
    g.innerHTML = `
      <line x1="${x}" y1="170" x2="${x}" y2="250" stroke="#5eead4" stroke-width="2"/>
      <circle cx="${x}" cy="270" r="22" fill="#1a2547" stroke="#fbbf24" stroke-width="2"/>
      <text x="${x}" y="278" text-anchor="middle" font-size="20">💻</text>
      <text x="${x}" y="305" text-anchor="middle" fill="#fbbf24" font-size="11">New PC</text>
    `;
    svg.appendChild(g);
    feedback.className = 'feedback';
    feedback.innerHTML = `➕ Added a new computer — only needed a quick tap into the shared bus cable. <em>Easy to add devices</em> is a key advantage of bus networks.`;
  }

  sendBtn.addEventListener('click', sendData);
  breakBtn.addEventListener('click', breakRandom);
  repairBtn.addEventListener('click', repair);
  addBtn.addEventListener('click', addComputer);
})();

// ---------- Star topology ----------
(() => {
  const stage = document.getElementById('star-stage');
  if (!stage) return;
  const cables = stage.querySelectorAll('.star-cable');
  const packet = document.getElementById('star-packet');
  const sendBtn = document.getElementById('star-send');
  const breakBtn = document.getElementById('star-break');
  const repairBtn = document.getElementById('star-repair');
  const feedback = document.getElementById('star-feedback');

  const devicePos = {
    pc1:     { x: 160, y: 80 },
    printer: { x: 560, y: 80 },
    server:  { x: 620, y: 180 },
    pc2:     { x: 560, y: 280 },
    pc3:     { x: 160, y: 280 },
    pc4:     { x: 100, y: 180 }
  };
  const SWITCH = { x: 360, y: 180 };

  function updateOffline() {
    Object.keys(devicePos).forEach((id) => {
      const cable = stage.querySelector(`.star-cable[data-id="${id}"]`);
      const dev = stage.querySelector(`.star-dev[data-id="${id}"]`);
      if (cable && dev) {
        dev.classList.toggle('offline', cable.classList.contains('broken'));
      }
    });
  }

  cables.forEach((c) => {
    c.addEventListener('click', () => {
      c.classList.toggle('broken');
      updateOffline();
      const broken = stage.querySelectorAll('.star-cable.broken').length;
      if (broken > 0) {
        feedback.className = 'feedback warn';
        feedback.innerHTML = `✂️ ${broken} cable${broken > 1 ? 's' : ''} broken. Notice <strong>only those specific computers</strong> are affected — the rest of the network keeps working.`;
      } else {
        feedback.className = 'feedback good';
        feedback.innerHTML = '✅ All cables repaired.';
      }
    });
  });

  function setPacket(x, y, opacity = 1) {
    packet.setAttribute('transform', `translate(${x}, ${y})`);
    packet.setAttribute('opacity', opacity);
  }
  function animate(fromX, fromY, toX, toY, dur = 900) {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 0.5 - Math.cos(Math.PI * t) / 2;
        setPacket(fromX + (toX - fromX) * eased, fromY + (toY - fromY) * eased);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  async function send() {
    sendBtn.disabled = true;
    const fromCable = stage.querySelector('.star-cable[data-id="pc3"]');
    const toCable = stage.querySelector('.star-cable[data-id="printer"]');
    const fromBroken = fromCable.classList.contains('broken');
    const toBroken = toCable.classList.contains('broken');
    const from = devicePos.pc3;
    const to = devicePos.printer;

    setPacket(from.x, from.y, 1);
    feedback.className = 'feedback';
    feedback.innerHTML = '📨 <strong>PC 3</strong> prepares the packet to send to the printer…';
    await new Promise(r => setTimeout(r, 1200));
    feedback.innerHTML = '➡️ The packet travels along PC 3\'s own cable towards the central switch…';

    if (fromBroken) {
      const midX = (from.x + SWITCH.x) / 2;
      const midY = (from.y + SWITCH.y) / 2;
      await animate(from.x, from.y, midX, midY, 1600);
      feedback.className = 'feedback bad';
      feedback.innerHTML = '💥 PC 3\'s cable is broken — the data can\'t reach the switch. But notice the <strong>rest of the network is fine</strong>!';
      packet.setAttribute('opacity', '0.4');
      for (let i = 0; i < 4; i++) {
        await animate(midX, midY, midX + 6, midY - 4, 220);
        await animate(midX + 6, midY - 4, midX, midY, 220);
      }
      await new Promise(r => setTimeout(r, 800));
      packet.setAttribute('opacity', '0');
      sendBtn.disabled = false;
      return;
    }

    await animate(from.x, from.y, SWITCH.x, SWITCH.y, 2200);
    feedback.innerHTML = '🔀 The <strong>switch</strong> reads the destination address and works out which cable goes to the printer…';
    await new Promise(r => setTimeout(r, 1600));

    if (toBroken) {
      const midX = (SWITCH.x + to.x) / 2;
      const midY = (SWITCH.y + to.y) / 2;
      feedback.innerHTML = '➡️ Forwarding the packet down the printer\'s cable…';
      await animate(SWITCH.x, SWITCH.y, midX, midY, 1600);
      feedback.className = 'feedback bad';
      feedback.innerHTML = '💥 The printer\'s cable is broken — but <strong>only the printer is affected</strong>. Every other device on the network keeps working.';
      packet.setAttribute('opacity', '0.4');
      for (let i = 0; i < 4; i++) {
        await animate(midX, midY, midX + 6, midY - 4, 220);
        await animate(midX + 6, midY - 4, midX, midY, 220);
      }
      await new Promise(r => setTimeout(r, 800));
      packet.setAttribute('opacity', '0');
      sendBtn.disabled = false;
      return;
    }

    feedback.innerHTML = '➡️ The switch forwards the packet down the printer\'s own cable…';
    await animate(SWITCH.x, SWITCH.y, to.x, to.y, 2200);
    feedback.className = 'feedback good';
    feedback.innerHTML = '✅ <strong>Delivered!</strong> In a star, data only travels along the cables it needs — fast and direct, with no other devices in the way.';
    await new Promise(r => setTimeout(r, 1500));
    packet.setAttribute('opacity', '0');
    sendBtn.disabled = false;
  }

  function breakRandom() {
    const available = Array.from(cables).filter((c) => !c.classList.contains('broken'));
    if (!available.length) {
      feedback.className = 'feedback warn';
      feedback.innerHTML = '⚠️ Every cable is already broken!';
      return;
    }
    const c = available[Math.floor(Math.random() * available.length)];
    c.classList.add('broken');
    updateOffline();
    feedback.className = 'feedback warn';
    feedback.innerHTML = `✂️ A cable to <strong>${c.dataset.id.toUpperCase()}</strong> broke — only that device loses connection. Everything else still works.`;
  }

  function repair() {
    cables.forEach((c) => c.classList.remove('broken'));
    updateOffline();
    feedback.className = 'feedback good';
    feedback.innerHTML = '🔧 All cables repaired.';
  }

  sendBtn.addEventListener('click', send);
  breakBtn.addEventListener('click', breakRandom);
  repairBtn.addEventListener('click', repair);
})();

// ---------- Compare table ----------
document.querySelectorAll('.compare-row .cr-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.closest('.compare-row').classList.toggle('open');
  });
});
const cmpAll = document.getElementById('compare-all');
const cmpHide = document.getElementById('compare-hide');
if (cmpAll) cmpAll.addEventListener('click', () => {
  document.querySelectorAll('.compare-row').forEach((r) => r.classList.add('open'));
});
if (cmpHide) cmpHide.addEventListener('click', () => {
  document.querySelectorAll('.compare-row').forEach((r) => r.classList.remove('open'));
});

// ---------- Hardware cards (click to view real photo) ----------
document.querySelectorAll('.hw-card').forEach((card) => {
  card.addEventListener('click', () => {
    const img = card.dataset.img;
    if (img) openLightbox(img, card.dataset.caption || '');
    else card.classList.toggle('active');
  });
});

// Combined router/WAP image
document.querySelectorAll('.combo-img-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    openLightbox(btn.dataset.img, btn.dataset.caption || '');
  });
});

// ---------- Plenary matching ----------
const termItems = [
  { id: 'lan',     term: 'LAN',                    def: 'A local area network — computers in a small area like a school.' },
  { id: 'wan',     term: 'WAN',                    def: 'A wide area network — two or more LANs joined together.' },
  { id: 'bus',     term: 'Bus network',            def: 'Computers connect to a single bus cable with terminators at each end.' },
  { id: 'star',    term: 'Star network',           def: 'Each computer connects to a central switch or hub with its own cable.' },
  { id: 'switch',  term: 'Switch',                 def: 'Used to connect computers together on the same LAN.' },
  { id: 'router',  term: 'Router',                 def: 'Routes packets of data towards their destination.' },
  { id: 'ap',      term: 'Wireless Access Point',  def: 'Allows wireless devices to connect to a network.' },
  { id: 'topo',    term: 'Topology',               def: 'The arrangement and connections of computers on a network.' }
];
const termsEl  = document.getElementById('term-items');
const labelsEl = document.getElementById('term-labels');
const scoreEl  = document.getElementById('term-score');

function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
let termSelected = null;
let termMatched = 0;

function renderTerms() {
  termsEl.innerHTML = '';
  labelsEl.innerHTML = '';
  termSelected = null;
  termMatched = 0;
  updateScore();
  shuffle(termItems).forEach((t) => {
    const b = document.createElement('button');
    b.className = 'tld-btn';
    b.dataset.id = t.id;
    b.innerHTML = `<strong>${t.term}</strong>`;
    b.addEventListener('click', () => onTermClick(b));
    termsEl.appendChild(b);
  });
  shuffle(termItems).forEach((t) => {
    const b = document.createElement('button');
    b.className = 'tld-btn';
    b.dataset.id = t.id;
    b.textContent = t.def;
    b.addEventListener('click', () => onLabelClick(b));
    labelsEl.appendChild(b);
  });
}
function updateScore() {
  scoreEl.textContent = `Matched ${termMatched} / ${termItems.length}`;
}
function onTermClick(btn) {
  if (btn.classList.contains('matched')) return;
  termsEl.querySelectorAll('.tld-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  termSelected = btn;
}
function onLabelClick(btn) {
  if (btn.classList.contains('matched')) return;
  if (!termSelected) {
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), 300);
    return;
  }
  if (btn.dataset.id === termSelected.dataset.id) {
    btn.classList.add('matched');
    termSelected.classList.add('matched');
    termSelected.classList.remove('selected');
    termSelected = null;
    termMatched++;
    updateScore();
  } else {
    btn.classList.add('wrong');
    termSelected.classList.add('wrong');
    const sel = termSelected;
    setTimeout(() => {
      btn.classList.remove('wrong');
      sel.classList.remove('wrong', 'selected');
    }, 350);
    termSelected = null;
  }
}
document.getElementById('term-reveal').addEventListener('click', () => {
  termsEl.querySelectorAll('.tld-btn').forEach((b) => b.classList.add('matched'));
  labelsEl.querySelectorAll('.tld-btn').forEach((b) => b.classList.add('matched'));
  termMatched = termItems.length;
  updateScore();
});
document.getElementById('term-reset').addEventListener('click', renderTerms);
renderTerms();
