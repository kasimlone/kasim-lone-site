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

buildRevealList('cs-pros', [
  'Servers have a <strong>central location</strong>, which makes them easier to <strong>back up</strong>.',
  'Easier to <strong>administer</strong> — the whole network is managed from one place.',
  'Easier to <strong>keep secure</strong> — there is only one central location to protect.'
], 'pro');
buildRevealList('cs-cons', [
  'If the <strong>server fails</strong>, no-one can access the services that it offers.',
  'There is a <strong>cost</strong> in buying the server.'
], 'con');

buildRevealList('p2p-pros', [
  'Existing hardware such as a <strong>printer</strong> can be shared with other computers on the network.',
  'Files on <strong>any computer</strong> can be shared.',
  'No dedicated <strong>server hardware</strong> needs to be bought.',
  'No single point of failure — if one computer fails, files on the <strong>other computers are still available</strong>.'
], 'pro');
buildRevealList('p2p-cons', [
  'Harder to <strong>back up</strong> data — every computer needs its own backup system.',
  'Less <strong>secure</strong> — every computer needs to be secured individually.',
  'Hard to <strong>administer</strong> — there is no central point to the network.'
], 'con');

// ---------- Starter sequencing game ----------
(() => {
  const list = document.getElementById('seq-list');
  if (!list) return;
  const feedback = document.getElementById('seq-feedback');
  const scoreEl = document.getElementById('seq-score');

  const steps = [
    'The request is sent to the <strong>router</strong> on your LAN.',
    'The router forwards it onto the <strong>Internet</strong>.',
    'It is forwarded towards its destination by <strong>other routers</strong>.',
    'It reaches a <strong>web server</strong>.',
    'The web server <strong>processes the request</strong>.',
    'The server sends the <strong>web page back</strong> to your browser.'
  ];

  let next = 0;

  function shuffleArr(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  function updateScore() {
    scoreEl.textContent = `Placed ${next} / ${steps.length}`;
  }

  function render() {
    list.innerHTML = '';
    next = 0;
    updateScore();
    feedback.className = 'feedback';
    feedback.innerHTML = '💡 Click the step you think happens <strong>first</strong>.';
    shuffleArr(steps.map((text, order) => ({ text, order }))).forEach((step) => {
      const btn = document.createElement('button');
      btn.className = 'seq-item';
      btn.dataset.order = step.order;
      btn.innerHTML = `<span class="seq-num">?</span><span>${step.text}</span>`;
      btn.addEventListener('click', () => onClick(btn));
      list.appendChild(btn);
    });
  }

  function onClick(btn) {
    if (btn.classList.contains('placed')) return;
    if (+btn.dataset.order === next) {
      next++;
      btn.classList.add('placed');
      btn.querySelector('.seq-num').textContent = next;
      updateScore();
      if (next === steps.length) {
        feedback.className = 'feedback good';
        feedback.innerHTML = '✅ <strong>Perfect!</strong> That whole journey — request out, response back — is the <strong>client-server model</strong> in action.';
      } else {
        feedback.className = 'feedback';
        feedback.innerHTML = `👍 Step ${next} placed. What happens next?`;
      }
    } else {
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 350);
      feedback.className = 'feedback warn';
      feedback.innerHTML = '❌ Not that one yet — think about where the request is right now.';
    }
  }

  document.getElementById('seq-reveal').addEventListener('click', () => {
    const items = Array.from(list.querySelectorAll('.seq-item'));
    items.sort((a, b) => +a.dataset.order - +b.dataset.order);
    items.forEach((btn, i) => {
      btn.classList.add('placed');
      btn.querySelector('.seq-num').textContent = i + 1;
      list.appendChild(btn);
    });
    next = steps.length;
    updateScore();
    feedback.className = 'feedback good';
    feedback.innerHTML = '📖 Here is the full journey, in order. Notice it ends — and starts again — at <strong>your browser</strong>.';
  });
  document.getElementById('seq-reset').addEventListener('click', render);
  render();
})();

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

// ---------- Server cards (click to view real photo) ----------
document.querySelectorAll('.server-card').forEach((card) => {
  card.addEventListener('click', () => {
    const img = card.dataset.img;
    if (img) openLightbox(img, card.dataset.caption || '');
  });
});

// ---------- Local client-server demo ----------
(() => {
  const stage = document.getElementById('local-stage');
  if (!stage) return;
  const packet = document.getElementById('local-packet');
  const packetLabel = document.getElementById('local-packet-label');
  const server = document.getElementById('local-server');
  const sendBtn = document.getElementById('local-send');
  const failBtn = document.getElementById('local-serverfail');
  const repairBtn = document.getElementById('local-repair');
  const feedback = document.getElementById('local-feedback');

  const clientPos = {
    pc1: { x: 160, y: 75 },
    pc2: { x: 560, y: 75 },
    pc3: { x: 160, y: 255 },
    pc4: { x: 560, y: 255 }
  };
  const SERVER = { x: 360, y: 155 };
  const names = { pc1: 'PC 1', pc2: 'PC 2', pc3: 'PC 3', pc4: 'PC 4' };
  const devs = stage.querySelectorAll('.cl-dev');

  function link(id) { return stage.querySelector(`.cl-link[data-id="${id}"]`); }
  function serverDown() { return stage.classList.contains('server-down'); }
  function onlineIds() {
    return Object.keys(clientPos).filter((id) =>
      !stage.querySelector(`.cl-dev[data-id="${id}"]`).classList.contains('off'));
  }

  devs.forEach((d) => {
    d.addEventListener('click', () => {
      d.classList.toggle('off');
      const off = d.classList.contains('off');
      link(d.dataset.id).classList.toggle('dim', off);
      const offCount = 4 - onlineIds().length;
      if (serverDown()) return;
      if (off) {
        feedback.className = 'feedback warn';
        feedback.innerHTML = `📴 <strong>${names[d.dataset.id]}</strong> is off — but look: the other client${offCount < 3 ? 's' : ''} carry on <strong>as normal</strong>. Clients don't depend on each other. Try sending a file!`;
      } else {
        feedback.className = 'feedback';
        feedback.innerHTML = `✅ <strong>${names[d.dataset.id]}</strong> is back on and reconnects to the server straight away.`;
      }
    });
  });

  function setPacket(x, y, opacity = 1) {
    packet.setAttribute('transform', `translate(${x}, ${y})`);
    packet.setAttribute('opacity', opacity);
  }
  function animate(fromX, fromY, toX, toY, dur = 1400) {
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
  function glowClient(id, on) {
    stage.querySelector(`.cl-dev[data-id="${id}"]`).classList.toggle('glow', on);
  }

  async function send() {
    const online = onlineIds();
    if (!online.length) {
      feedback.className = 'feedback warn';
      feedback.innerHTML = '⚠️ Every client is switched off! Click a computer to turn one back on first.';
      return;
    }
    sendBtn.disabled = true;
    const id = online[0];
    const from = clientPos[id];

    glowClient(id, true);
    feedback.className = 'feedback';
    feedback.innerHTML = `📨 <strong>${names[id]}</strong> (a client) requests a file from the server…`;
    packetLabel.textContent = 'REQ';
    setPacket(from.x, from.y, 1);
    await new Promise(r => setTimeout(r, 1200));

    if (serverDown()) {
      const midX = (from.x + SERVER.x) / 2;
      const midY = (from.y + SERVER.y) / 2;
      await animate(from.x, from.y, midX, midY, 1200);
      feedback.className = 'feedback bad';
      feedback.innerHTML = '💥 The <strong>server has failed</strong> — the request goes nowhere. <strong>No client</strong> can get files, print or log on. Everyone depends on the server!';
      packet.setAttribute('opacity', '0.4');
      for (let i = 0; i < 4; i++) {
        await animate(midX, midY, midX + 6, midY - 4, 220);
        await animate(midX + 6, midY - 4, midX, midY, 220);
      }
      await new Promise(r => setTimeout(r, 800));
      packet.setAttribute('opacity', '0');
      glowClient(id, false);
      sendBtn.disabled = false;
      return;
    }

    await animate(from.x, from.y, SERVER.x, SERVER.y);
    server.classList.add('glow');
    glowClient(id, false);
    feedback.innerHTML = '🗄️ The <strong>server</strong> finds the file…';
    await new Promise(r => setTimeout(r, 1400));

    packetLabel.textContent = 'FILE';
    server.classList.remove('glow');
    feedback.innerHTML = `📥 …and sends it back down ${names[id]}'s own connection.`;
    await animate(SERVER.x, SERVER.y, from.x, from.y);
    glowClient(id, true);

    const offCount = 4 - onlineIds().length;
    feedback.className = 'feedback good';
    feedback.innerHTML = offCount > 0
      ? `✅ <strong>File delivered to ${names[id]}!</strong> The ${offCount} switched-off client${offCount > 1 ? 's' : ''} made no difference — the network works fine without them.`
      : `✅ <strong>File delivered to ${names[id]}!</strong> Client requests → server responds.`;
    await new Promise(r => setTimeout(r, 1500));
    packet.setAttribute('opacity', '0');
    glowClient(id, false);
    sendBtn.disabled = false;
  }

  function failServer() {
    if (serverDown()) return;
    stage.classList.add('server-down');
    feedback.className = 'feedback bad';
    feedback.innerHTML = '💥 <strong>The server has failed!</strong> Every connection is dead — no files, no printing, no logins for <strong>anyone</strong>. This is the big weakness of the client-server model. Try asking for a file…';
  }

  function repair() {
    stage.classList.remove('server-down');
    devs.forEach((d) => {
      d.classList.remove('off');
      link(d.dataset.id).classList.remove('dim');
    });
    feedback.className = 'feedback good';
    feedback.innerHTML = '🔧 Server repaired and all clients back online.';
  }

  sendBtn.addEventListener('click', send);
  failBtn.addEventListener('click', failServer);
  repairBtn.addEventListener('click', repair);
})();

// ---------- Client-server demo ----------
(() => {
  const stage = document.getElementById('cs-stage');
  if (!stage) return;
  const request = document.getElementById('cs-request');
  const response = document.getElementById('cs-response');
  const client = document.getElementById('cs-client');
  const server = document.getElementById('cs-server');
  const cloud = document.getElementById('cs-cloud');
  const sendBtn = document.getElementById('cs-send');
  const resetBtn = document.getElementById('cs-reset');
  const feedback = document.getElementById('cs-feedback');

  const CLIENT = { x: 115, y: 150 };
  const CLOUD = { x: 360, y: 150 };
  const SERVER = { x: 603, y: 150 };

  function setPacket(el, x, y, opacity = 1) {
    el.setAttribute('transform', `translate(${x}, ${y})`);
    el.setAttribute('opacity', opacity);
  }

  function animate(el, fromX, fromY, toX, toY, dur = 1000) {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 0.5 - Math.cos(Math.PI * t) / 2;
        setPacket(el, fromX + (toX - fromX) * eased, fromY + (toY - fromY) * eased);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  async function send() {
    sendBtn.disabled = true;
    client.classList.add('active');
    feedback.className = 'feedback';
    feedback.innerHTML = '💻 You type an address and press Enter. The <strong>client</strong> (your browser) builds a request…';
    setPacket(request, CLIENT.x, CLIENT.y, 1);
    await new Promise(r => setTimeout(r, 1400));

    feedback.innerHTML = '📤 The request travels across <strong>the Internet</strong>, passed from router to router…';
    await animate(request, CLIENT.x, CLIENT.y, CLOUD.x, CLOUD.y, 1800);
    cloud.classList.add('active');
    await new Promise(r => setTimeout(r, 600));
    cloud.classList.remove('active');
    await animate(request, CLOUD.x, CLOUD.y, SERVER.x, SERVER.y, 1800);
    request.setAttribute('opacity', '0');

    client.classList.remove('active');
    server.classList.add('active');
    feedback.innerHTML = '🗄️ The <strong>web server</strong> receives the request and <strong>processes</strong> it — finding the page you asked for…';
    await new Promise(r => setTimeout(r, 2000));

    feedback.innerHTML = '📥 The server sends the <strong>web page back</strong> along the same route…';
    setPacket(response, SERVER.x, SERVER.y, 1);
    server.classList.remove('active');
    await animate(response, SERVER.x, SERVER.y, CLOUD.x, CLOUD.y, 1800);
    cloud.classList.add('active');
    await new Promise(r => setTimeout(r, 600));
    cloud.classList.remove('active');
    await animate(response, CLOUD.x, CLOUD.y, CLIENT.x, CLIENT.y, 1800);

    client.classList.add('active');
    feedback.className = 'feedback good';
    feedback.innerHTML = '✅ <strong>Page delivered!</strong> Client requests → server responds. That\'s the client-server model.';
    await new Promise(r => setTimeout(r, 1500));
    response.setAttribute('opacity', '0');
    client.classList.remove('active');
    sendBtn.disabled = false;
  }

  function reset() {
    request.setAttribute('opacity', '0');
    response.setAttribute('opacity', '0');
    [client, server, cloud].forEach((el) => el.classList.remove('active'));
    feedback.className = 'feedback';
    feedback.innerHTML = '💡 Click <strong>"Request a web page"</strong> to watch the client-server model in action.';
    sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', send);
  resetBtn.addEventListener('click', reset);
})();

// ---------- Hardware-style cards (server types + cloud services) ----------
document.querySelectorAll('.hw-card').forEach((card) => {
  card.addEventListener('click', () => card.classList.toggle('active'));
});

// ---------- P2P demo ----------
(() => {
  const stage = document.getElementById('p2p-stage');
  if (!stage) return;
  const packet = document.getElementById('p2p-packet');
  const packetLabel = document.getElementById('p2p-packet-label');
  const fileBtn = document.getElementById('p2p-file');
  const scanBtn = document.getElementById('p2p-scan');
  const printBtn = document.getElementById('p2p-print');
  const repairBtn = document.getElementById('p2p-repair');
  const buttons = [fileBtn, scanBtn, printBtn];
  const feedback = document.getElementById('p2p-feedback');

  const peerPos = {
    pc1:    { x: 150, y: 95 },
    laptop: { x: 570, y: 95 },
    pc2:    { x: 150, y: 255 },
    pc3:    { x: 570, y: 255 }
  };
  const peers = stage.querySelectorAll('.peer');
  const links = stage.querySelectorAll('.p2p-link');
  const peerNames = { pc1: 'PC 1', laptop: 'the laptop', pc2: 'PC 2', pc3: 'PC 3' };

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function peerEl(id) { return stage.querySelector(`.peer[data-id="${id}"]`); }
  function isDown(id) { return peerEl(id).classList.contains('down'); }
  function linkFor(a, b) {
    return stage.querySelector(`.p2p-link[data-link="${[a, b].sort().join('-')}"]`);
  }
  function brokenCount() { return stage.querySelectorAll('.p2p-link.broken').length; }
  function downCount() { return stage.querySelectorAll('.peer.down').length; }

  // Click a computer → it goes down (and back up)
  peers.forEach((p) => {
    p.addEventListener('click', () => {
      p.classList.toggle('down');
      const id = p.dataset.id;
      if (p.classList.contains('down')) {
        feedback.className = 'feedback warn';
        feedback.innerHTML = `📴 <strong>${cap(peerNames[id])}</strong> has gone down, so ${p.dataset.share.split(' — ')[0]} is unavailable. But look — <strong>every other peer still works</strong>. No single point of failure, unlike client-server!`;
      } else {
        feedback.className = 'feedback good';
        feedback.innerHTML = `✅ <strong>${cap(peerNames[id])}</strong> is back online and sharing again.`;
      }
    });
  });

  // Click a cable → it breaks (and mends)
  links.forEach((l) => {
    l.addEventListener('click', () => {
      l.classList.toggle('broken');
      const [a, b] = l.dataset.link.split('-');
      if (l.classList.contains('broken')) {
        feedback.className = 'feedback warn';
        feedback.innerHTML = `✂️ The cable between <strong>${peerNames[a]}</strong> and <strong>${peerNames[b]}</strong> is broken — those two can't talk directly. Everything else still works. Try the demos!`;
      } else {
        feedback.className = 'feedback good';
        feedback.innerHTML = `🔧 The cable between <strong>${peerNames[a]}</strong> and <strong>${peerNames[b]}</strong> is repaired.`;
      }
    });
  });

  function glow(id, on) { peerEl(id).classList.toggle('glow', on); }
  function setPacket(x, y, opacity = 1) {
    packet.setAttribute('transform', `translate(${x}, ${y})`);
    packet.setAttribute('opacity', opacity);
  }
  function animate(fromX, fromY, toX, toY, dur = 1600) {
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
  async function bounce(x, y) {
    packet.setAttribute('opacity', '0.4');
    for (let i = 0; i < 4; i++) {
      await animate(x, y, x + 6, y - 4, 220);
      await animate(x + 6, y - 4, x, y, 220);
    }
    await new Promise(r => setTimeout(r, 800));
    packet.setAttribute('opacity', '0');
  }

  async function run(fromId, toId, reqLabel, resLabel, messages) {
    if (isDown(fromId)) {
      feedback.className = 'feedback warn';
      feedback.innerHTML = `⚠️ <strong>${cap(peerNames[fromId])}</strong> is switched off — click it to turn it back on first.`;
      return;
    }
    buttons.forEach((b) => b.disabled = true);
    const from = peerPos[fromId];
    const to = peerPos[toId];
    const linkBroken = linkFor(fromId, toId).classList.contains('broken');
    const targetDown = isDown(toId);

    glow(fromId, true);
    feedback.className = 'feedback';
    feedback.innerHTML = messages.start;
    packetLabel.textContent = reqLabel;
    setPacket(from.x, from.y, 1);
    await new Promise(r => setTimeout(r, 1300));

    feedback.innerHTML = messages.request;

    if (linkBroken) {
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      await animate(from.x, from.y, midX, midY, 1100);
      feedback.className = 'feedback bad';
      feedback.innerHTML = `💥 The cable between <strong>${peerNames[fromId]}</strong> and <strong>${peerNames[toId]}</strong> is broken — this request can't get through. But notice: <strong>only this link is lost</strong>. The rest of the network carries on — unlike when the server failed!`;
      await bounce(midX, midY);
      glow(fromId, false);
      buttons.forEach((b) => b.disabled = false);
      return;
    }

    await animate(from.x, from.y, to.x, to.y);
    glow(fromId, false);

    if (targetDown) {
      feedback.className = 'feedback bad';
      feedback.innerHTML = `💥 <strong>${cap(peerNames[toId])}</strong> is down, so ${messages.lost}. But <strong>everything else on the network still works</strong> — only the broken part is lost. In client-server, a dead server took out <em>everything</em>!`;
      await bounce(to.x, to.y);
      buttons.forEach((b) => b.disabled = false);
      return;
    }

    glow(toId, true);
    packet.setAttribute('opacity', '0');
    feedback.innerHTML = messages.working;
    await new Promise(r => setTimeout(r, 1800));

    feedback.innerHTML = messages.response;
    packetLabel.textContent = resLabel;
    setPacket(to.x, to.y, 1);
    await animate(to.x, to.y, from.x, from.y);
    glow(toId, false);
    glow(fromId, true);

    feedback.className = 'feedback good';
    const extra = (brokenCount() > 0 || downCount() > 0)
      ? ' Even with parts of the network broken, <strong>this bit still worked</strong>.'
      : '';
    feedback.innerHTML = messages.done + extra;
    await new Promise(r => setTimeout(r, 1500));
    packet.setAttribute('opacity', '0');
    glow(fromId, false);
    buttons.forEach((b) => b.disabled = false);
  }

  fileBtn.addEventListener('click', () => run('pc1', 'pc3', 'FILE?', 'FILE', {
    start: '🖥️ PC 1 (the <strong>client</strong> in this exchange) wants a file stored on <strong>PC 3\'s</strong> external drive…',
    request: '📤 The request travels <strong>directly to PC 3</strong> — no server in the middle!',
    working: '💾 PC 3 finds the file on its external drive…',
    response: '📥 The file travels straight back to PC 1…',
    done: '✅ <strong>File delivered!</strong> PC 3 acted like a mini server — in P2P, every peer can be both client <em>and</em> server.',
    lost: 'the files on its external drive can\'t be reached right now'
  }));

  scanBtn.addEventListener('click', () => run('pc1', 'laptop', 'SCAN?', 'IMG', {
    start: '🖥️ PC 1 needs to scan a photo — but the scanner is plugged into the <strong>laptop</strong>…',
    request: '📤 PC 1 sends its request <strong>directly to the laptop</strong> — no server in the middle!',
    working: '📠 The laptop runs its scanner and creates the image…',
    response: '📥 The scanned image travels straight back to PC 1…',
    done: '✅ <strong>Done!</strong> Two equal peers shared a resource directly. That\'s peer-to-peer.',
    lost: 'its scanner is unavailable'
  }));

  printBtn.addEventListener('click', () => run('pc3', 'pc2', 'PRINT?', 'OK', {
    start: '🖥️ PC 3 wants to print — but the printer is plugged into <strong>PC 2</strong>…',
    request: '📤 PC 3 sends the document <strong>directly to PC 2</strong> across the network…',
    working: '🖨️ PC 2 sends the document to its printer…',
    response: '📥 PC 2 confirms the job is printing…',
    done: '✅ <strong>Printed!</strong> Any peer can use any other peer\'s hardware — with no central server.',
    lost: 'its printer is unavailable'
  }));

  repairBtn.addEventListener('click', () => {
    peers.forEach((p) => p.classList.remove('down'));
    links.forEach((l) => l.classList.remove('broken'));
    feedback.className = 'feedback good';
    feedback.innerHTML = '🔧 All computers back on and every cable repaired.';
  });
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

// ---------- Plenary matching ----------
const termItems = [
  { id: 'client',  term: 'Client',              def: 'A computer that requests a service — e.g. your computer with a web browser.' },
  { id: 'server',  term: 'Server',              def: 'A powerful computer dedicated to providing a service, such as delivering web pages.' },
  { id: 'csmodel', term: 'Client-server model', def: 'A client requests a service from a server; the server sends the response.' },
  { id: 'p2p',     term: 'Peer-to-peer network',def: 'Resources like printers and storage are shared between equal computers — no central server.' },
  { id: 'peer',    term: 'Peer',                def: 'One of the equal computers in a P2P network — it can share and use resources.' },
  { id: 'cloud',   term: 'Cloud computing',     def: 'Applications and storage that are available on the Internet.' },
  { id: 'dc',      term: 'Data centre',         def: 'A building containing thousands of servers.' },
  { id: 'web',     term: 'Web server',          def: 'Processes requests for web pages and sends them back to the client.' }
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
