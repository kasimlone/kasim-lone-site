/* ============================================================
 *  Network Simulator — single-file engine
 *  Exposes: window.initSimulator({ container, mode })
 *           window.NetSim (utilities for challenges)
 * ============================================================ */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const GRID = 20;
  const DEVICE_W = 56;
  const DEVICE_H = 56;
  const WAP_RANGE = 150;
  const STORAGE_KEY = 'netsim-state-v1';
  const INTERNET_ID = '__internet__';
  // Playfield. Grows on demand as the user scrolls or drags toward an edge.
  let CANVAS_W = 1600;
  let CANVAS_H = 1000;
  const CANVAS_STEP = 600;     // how much to grow per expansion
  const EDGE_THRESHOLD = 80;   // px from edge that triggers growth
  const PLAY_TOP = 20;
  const PLAY_PAD = 20;

  // -------- Device definitions --------
  const DEVICE_DEFS = {
    computer:  { label: 'Computer', ports: 1, wireless: false, end: true,  iconColor: 'accent' },
    laptop:    { label: 'Laptop',   ports: 1, wireless: true,  end: true,  iconColor: 'accent' },
    tablet:    { label: 'Tablet',   ports: 0, wireless: true,  end: true,  iconColor: 'accent' },
    printer:   { label: 'Printer',  ports: 1, wireless: false, end: true,  iconColor: 'accent' },
    wap:       { label: 'WAP',      ports: 1, wireless: false, end: false, iconColor: 'accent', wap: true },
    hub:       { label: 'Hub',      ports: 4, wireless: false, end: false, iconColor: 'warn', configurable: [4,8,16], defaultPorts: 4 },
    switch:    { label: 'Switch',   ports: 8, wireless: false, end: false, iconColor: 'accent', configurable: [4,8,16,24], defaultPorts: 8 },
    router:    { label: 'Router',   ports: 4, wireless: false, end: false, iconColor: 'accent2', router: true },
    server:    { label: 'Server',   ports: 1, wireless: false, end: true,  iconColor: 'accent' },
  };

  const PALETTE = ['computer','laptop','tablet','printer','wap','switch','hub','router','server'];

  // -------- Icon library (SVG paths sized 48x48) --------
  function makeIcon(type) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'device-icon');
    const inner = [];
    switch (type) {
      case 'computer':
        inner.push(rect(8,10,32,22,2));
        inner.push(line(20,32,28,32));
        inner.push(line(16,38,32,38));
        break;
      case 'laptop':
        inner.push(path('M10 30 L38 30 L34 14 L14 14 Z'));
        inner.push(path('M6 32 L42 32 L40 38 L8 38 Z'));
        break;
      case 'tablet':
        inner.push(rect(14,8,20,32,3));
        inner.push(circle(24,36,1.2));
        break;
      case 'printer':
        inner.push(rect(12,18,24,14,2));
        inner.push(rect(16,10,16,10,1));
        inner.push(rect(16,28,16,8,1));
        inner.push(circle(32,22,1.4));
        break;
      case 'wap':
        inner.push(rect(12,28,24,8,2));
        inner.push(circle(24,32,1.2));
        inner.push(path('M14 22 Q24 12 34 22'));
        inner.push(path('M10 18 Q24 4 38 18'));
        break;
      case 'hub':
        inner.push(rect(6,18,36,12,2));
        for (let i=0;i<4;i++) inner.push(rect(10+i*8,22,4,4,0.5));
        break;
      case 'switch':
        inner.push(rect(4,18,40,12,2));
        for (let i=0;i<6;i++) inner.push(rect(7+i*6,22,3,4,0.5));
        break;
      case 'router':
        inner.push(rect(6,22,36,14,2));
        inner.push(line(14,22,14,12));
        inner.push(line(20,22,20,8));
        inner.push(line(28,22,28,8));
        inner.push(line(34,22,34,12));
        break;
      case 'server':
        inner.push(rect(14,6,20,36,2));
        inner.push(line(18,14,30,14));
        inner.push(line(18,20,30,20));
        inner.push(line(18,26,30,26));
        inner.push(circle(28,34,1.4));
        break;
    }
    inner.forEach(el => g.appendChild(el));
    return g;
  }
  function rect(x,y,w,h,r) {
    const e = document.createElementNS(SVG_NS,'rect');
    e.setAttribute('x',x); e.setAttribute('y',y); e.setAttribute('width',w); e.setAttribute('height',h);
    if (r) { e.setAttribute('rx',r); e.setAttribute('ry',r); }
    return e;
  }
  function line(x1,y1,x2,y2) {
    const e = document.createElementNS(SVG_NS,'line');
    e.setAttribute('x1',x1); e.setAttribute('y1',y1); e.setAttribute('x2',x2); e.setAttribute('y2',y2);
    return e;
  }
  function circle(cx,cy,r) {
    const e = document.createElementNS(SVG_NS,'circle');
    e.setAttribute('cx',cx); e.setAttribute('cy',cy); e.setAttribute('r',r);
    return e;
  }
  function path(d) {
    const e = document.createElementNS(SVG_NS,'path');
    e.setAttribute('d', d);
    return e;
  }

  // -------- Demo scenarios --------
  const SCENARIOS = {
    'switch-vs-hub': {
      devices: [
        { id:'c1', type:'computer', x:140, y:200, name:'PC 1' },
        { id:'c2', type:'computer', x:140, y:320, name:'PC 2' },
        { id:'sw', type:'switch',   x:340, y:200, name:'Switch 1', portCount:4 },
        { id:'hb', type:'hub',      x:340, y:340, name:'Hub 1',    portCount:4 },
        { id:'p1', type:'printer',  x:540, y:200, name:'Printer 1' },
        { id:'p2', type:'printer',  x:540, y:340, name:'Printer 2' },
      ],
      wires: [
        { id:'w1', fromDevice:'c1', fromPort:0, toDevice:'sw', toPort:0 },
        { id:'w2', fromDevice:'p1', fromPort:0, toDevice:'sw', toPort:1 },
        { id:'w3', fromDevice:'c2', fromPort:0, toDevice:'hb', toPort:0 },
        { id:'w4', fromDevice:'p2', fromPort:0, toDevice:'hb', toPort:1 },
      ],
      lans: []
    },
    'wap-coverage': {
      devices: [
        { id:'r1', type:'router',  x:200, y:240, name:'Router 1', internetOn:true },
        { id:'sw', type:'switch',  x:340, y:240, name:'Switch 1', portCount:4 },
        { id:'wp', type:'wap',     x:480, y:240, name:'WAP 1' },
        { id:'lp', type:'laptop',  x:480, y:380, name:'Laptop 1' },
      ],
      wires: [
        { id:'w1', fromDevice:'r1', fromPort:0, toDevice:'sw', toPort:0 },
        { id:'w2', fromDevice:'sw', fromPort:1, toDevice:'wp', toPort:0 },
      ],
      lans: []
    },
    'two-lans-internet': {
      devices: [
        { id:'r1', type:'router',  x:240, y:240, name:'Router A', internetOn:true },
        { id:'r2', type:'router',  x:620, y:240, name:'Router B', internetOn:true },
        { id:'s1', type:'switch',  x:240, y:380, name:'Switch A', portCount:4 },
        { id:'s2', type:'switch',  x:620, y:380, name:'Switch B', portCount:4 },
        { id:'c1', type:'computer',x:160, y:480, name:'PC A' },
        { id:'c2', type:'computer',x:540, y:480, name:'PC B' },
      ],
      wires: [
        { id:'w1', fromDevice:'r1', fromPort:0, toDevice:'s1', toPort:0 },
        { id:'w2', fromDevice:'s1', fromPort:1, toDevice:'c1', toPort:0 },
        { id:'w3', fromDevice:'r2', fromPort:0, toDevice:'s2', toPort:0 },
        { id:'w4', fromDevice:'s2', fromPort:1, toDevice:'c2', toPort:0 },
      ],
      lans: [
        { id:'L1', name:'LAN A', x:100, y:200, w:240, h:340 },
        { id:'L2', name:'LAN B', x:480, y:200, w:240, h:340 },
      ]
    }
  };

  // -------- Simulator core --------
  function initSimulator(opts) {
    const containerSel = opts.container;
    const mode = opts.mode || 'sandbox';
    const root = (typeof containerSel === 'string') ? document.querySelector(containerSel) : containerSel;
    if (!root) { console.error('initSimulator: container not found'); return null; }

    // State
    const state = {
      devices: [],
      wires: [],
      lans: [],
      looseEnds: [], // { wireId, end:'from'|'to', x, y }
      nextIds: { device:1, wire:1, lan:1 },
      cloudOffset: { x: 0, y: 0 },
    };

    let undoStack = [];
    let redoStack = [];
    let suppressSave = false;

    // UI state
    let deleteMode = false;
    let lanDrawMode = false;
    let activeWiring = null; // { fromDevice, fromPort, rubberEl }
    let activeDeviceDrag = null;
    let activeLanDraw = null;
    let activeLanDrag = null;
    let activeLanResize = null;
    let activeWanDrag = null;
    let activeCloudDrag = null;
    let wanGroupsByKey = {}; // key -> array of LAN ids belonging to that WAN group
    let wanBoxes = [];        // [{x,y,w,h}] of currently rendered WAN bounding boxes
    let activeLooseDrag = null;
    let labelInput = null;
    let openPopup = null;
    let longPressTimer = null;
    let openExplain = null;
    let lastSendHighlights = [];

    // Scrollable wrapper around the SVG so the playfield can exceed the viewport.
    const scrollWrap = document.createElement('div');
    scrollWrap.className = 'canvas-scroll';
    root.appendChild(scrollWrap);

    // Mount SVG at its natural pixel size — scrollWrap handles overflow.
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('id', 'canvas');
    svg.setAttribute('viewBox', `0 0 ${CANVAS_W} ${CANVAS_H}`);
    svg.setAttribute('width',  CANVAS_W);
    svg.setAttribute('height', CANVAS_H);
    svg.style.touchAction = 'none';
    svg.style.display = 'block';
    scrollWrap.appendChild(svg);

    // Visible bounding rect for the playfield (devices must stay inside this).
    const playRect = document.createElementNS(SVG_NS,'rect');
    playRect.setAttribute('x', PLAY_PAD);
    playRect.setAttribute('y', PLAY_TOP);
    playRect.setAttribute('width',  CANVAS_W - 2*PLAY_PAD);
    playRect.setAttribute('height', CANVAS_H - PLAY_TOP - PLAY_PAD);
    playRect.setAttribute('fill','none');
    playRect.setAttribute('stroke','var(--line)');
    playRect.setAttribute('stroke-width','1');
    playRect.setAttribute('stroke-dasharray','4 6');
    playRect.setAttribute('rx','12');
    svg.appendChild(playRect);

    // Defs: grid pattern + packet glow
    const defs = document.createElementNS(SVG_NS, 'defs');
    defs.innerHTML = `
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.9" fill="rgba(255,255,255,0.06)"/>
      </pattern>
    `;
    svg.appendChild(defs);

    const gridRect = document.createElementNS(SVG_NS, 'rect');
    gridRect.setAttribute('x', PLAY_PAD);
    gridRect.setAttribute('y', PLAY_TOP);
    gridRect.setAttribute('width',  CANVAS_W - 2*PLAY_PAD);
    gridRect.setAttribute('height', CANVAS_H - PLAY_TOP - PLAY_PAD);
    gridRect.setAttribute('fill','url(#grid)');
    gridRect.setAttribute('rx','12');
    svg.appendChild(gridRect);

    // Apply current CANVAS_W/H to all elements that depend on it.
    function applyCanvasSize() {
      svg.setAttribute('viewBox', `0 0 ${CANVAS_W} ${CANVAS_H}`);
      const z = currentZoom();
      svg.setAttribute('width',  CANVAS_W * z);
      svg.setAttribute('height', CANVAS_H * z);
      playRect.setAttribute('width',  CANVAS_W - 2*PLAY_PAD);
      playRect.setAttribute('height', CANVAS_H - PLAY_TOP - PLAY_PAD);
      gridRect.setAttribute('width',  CANVAS_W - 2*PLAY_PAD);
      gridRect.setAttribute('height', CANVAS_H - PLAY_TOP - PLAY_PAD);
    }
    // The zoom controls set this; default 1.
    let _zoomLevel = 1;
    function currentZoom() { return _zoomLevel; }

    // Grow the canvas if the user is near (or past) the right/bottom edge.
    function growCanvasIfNeeded(viewboxX, viewboxY) {
      let grew = false;
      if (viewboxX > CANVAS_W - EDGE_THRESHOLD) {
        CANVAS_W += CANVAS_STEP;
        grew = true;
      }
      if (viewboxY > CANVAS_H - EDGE_THRESHOLD) {
        CANVAS_H += CANVAS_STEP;
        grew = true;
      }
      if (grew) applyCanvasSize();
      return grew;
    }
    // Scroll-driven growth: when the user scrolls near the right/bottom edge, expand.
    scrollWrap.addEventListener('scroll', () => {
      const z = currentZoom();
      const rightVB  = (scrollWrap.scrollLeft + scrollWrap.clientWidth)  / z;
      const bottomVB = (scrollWrap.scrollTop  + scrollWrap.clientHeight) / z;
      growCanvasIfNeeded(rightVB, bottomVB);
    });

    // Layers
    const layerWan    = svgGroup('layer-wan');
    const layerLan    = svgGroup('layer-lan');
    const layerCoverage = svgGroup('layer-coverage');
    const layerWires  = svgGroup('layer-wires');
    const layerDevices = svgGroup('layer-devices');
    const layerCloud  = svgGroup('layer-cloud');
    const layerOverlay = svgGroup('layer-overlay'); // packets, rubber-band
    [layerWan, layerLan, layerCoverage, layerWires, layerCloud, layerDevices, layerOverlay].forEach(g => svg.appendChild(g));

    function svgGroup(id) { const g = document.createElementNS(SVG_NS,'g'); g.setAttribute('id',id); return g; }

    // Empty hint
    const emptyHint = document.createElement('div');
    emptyHint.className = 'empty-hint';
    emptyHint.textContent = 'Drag a device from the left to start building';
    root.appendChild(emptyHint);

    // Status bar lookup
    const statusBar = document.querySelector('.statusbar');
    function setStatus(text, cls) {
      if (!statusBar) return;
      statusBar.textContent = text || '';
      statusBar.className = 'statusbar' + (cls ? ' '+cls : '');
    }

    function internetCenterPos() {
      const off = state.cloudOffset || { x:0, y:0 };
      // Dock the cloud just above the routers it serves so uplinks stay short,
      // instead of pinning it at the top-centre of the canvas far from everything.
      // Anchor on ALL routers (not just internet-on ones) so toggling a
      // router's uplink off doesn't make the cloud jump to a new position.
      const anchors = state.devices.filter(d => d.type === 'router');
      let x = CANVAS_W / 2;
      let y = 80;
      if (anchors.length) {
        x = anchors.reduce((s, r) => s + r.x + devW(r) / 2, 0) / anchors.length;
        const topmost = anchors.reduce((m, r) => Math.min(m, r.y), Infinity);
        y = topmost - 110;
        // The internet lives OUTSIDE the network: if the cloud would sit on a
        // LAN or WAN box, bump it above that box's top edge.
        const boxes = [...state.lans, ...wanBoxes];
        for (let pass = 0; pass < 2; pass++) {
          boxes.forEach(b => {
            const overlapX = x + 50 > b.x && x - 50 < b.x + b.w;
            const overlapY = y + 52 > b.y && y - 34 < b.y + b.h;
            if (overlapX && overlapY) y = b.y - 56;
          });
        }
      }
      x = Math.max(120, Math.min(CANVAS_W - 120, x + off.x));
      y = Math.max(56, y + off.y);
      return { x, y };
    }

    function clampDevicePos(x, y) {
      // Grow the playfield if dragging near or past the right/bottom edge.
      growCanvasIfNeeded(x + DEVICE_W + EDGE_THRESHOLD, y + DEVICE_H + EDGE_THRESHOLD);
      const minX = PLAY_PAD;
      const minY = PLAY_TOP;
      const maxX = CANVAS_W - PLAY_PAD - DEVICE_W;
      const maxY = CANVAS_H - PLAY_PAD - DEVICE_H;
      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      };
    }

    function showToast(msg, kind) {
      const existing = root.querySelector('.sim-toast');
      if (existing) existing.remove();
      const t = document.createElement('div');
      t.className = 'sim-toast' + (kind ? ' '+kind : '');
      t.textContent = msg;
      root.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
      }, 1800);
    }

    // -------- helpers --------
    function snap(v) { return Math.round(v/GRID)*GRID; }
    function uid(kind) { const n = state.nextIds[kind]++; return kind[0]+n; }
    function findDevice(id) { return state.devices.find(d=>d.id===id); }
    function findWire(id) { return state.wires.find(w=>w.id===id); }
    function findLan(id) { return state.lans.find(l=>l.id===id); }
    function ddef(d) { return DEVICE_DEFS[d.type]; }
    function portCount(d) {
      const def = ddef(d);
      if (def.configurable) return d.portCount || def.defaultPorts;
      return def.ports;
    }

    // Width grows for hubs/switches/routers with many ports so ports stay readable.
    function devW(d) {
      if (!d) return DEVICE_W;
      const def = ddef(d);
      if (!def || (!def.configurable && !def.router)) return DEVICE_W;
      const n = portCount(d);
      if (n <= 4) return DEVICE_W;
      return Math.round(n * 11 + 12);
    }

    function portPos(d, idx) {
      const n = portCount(d);
      const w = devW(d);
      if (n === 0) return { x: d.x + w/2, y: d.y + DEVICE_H/2 };
      const def = ddef(d);
      if (def.configurable || def.router) {
        const usable = w - 8;
        const step = usable / Math.max(1, n);
        const x = d.x + 4 + step*(idx + 0.5);
        return { x, y: d.y + DEVICE_H };
      }
      return { x: d.x + w/2, y: d.y + DEVICE_H };
    }

    function isPortUsed(deviceId, portIdx) {
      return state.wires.some(w =>
        (w.fromDevice===deviceId && w.fromPort===portIdx) ||
        (w.toDevice===deviceId && w.toPort===portIdx));
    }
    function firstFreePort(d) {
      const n = portCount(d);
      for (let i=0;i<n;i++) if (!isPortUsed(d.id, i)) return i;
      return -1;
    }
    function defaultName(type) {
      const def = DEVICE_DEFS[type];
      let n = 1;
      const taken = new Set(state.devices.filter(d=>d.type===type).map(d=>d.name));
      while (taken.has(def.label+' '+n)) n++;
      return def.label+' '+n;
    }

    // -------- Undo/Redo + Persist --------
    function snapshot() {
      return JSON.stringify({ devices:state.devices, wires:state.wires, lans:state.lans,
                              looseEnds:state.looseEnds, nextIds:state.nextIds,
                              cloudOffset:state.cloudOffset });
    }
    function restore(snap) {
      const s = JSON.parse(snap);
      state.devices = s.devices || [];
      state.wires = s.wires || [];
      state.lans = s.lans || [];
      state.looseEnds = s.looseEnds || [];
      state.nextIds = s.nextIds || { device:1, wire:1, lan:1 };
      state.cloudOffset = s.cloudOffset || { x:0, y:0 };
    }
    function pushUndo() {
      undoStack.push(snapshot());
      if (undoStack.length > 50) undoStack.shift();
      redoStack.length = 0;
    }
    function undo() {
      if (!undoStack.length) return;
      redoStack.push(snapshot());
      restore(undoStack.pop());
      render(); save();
    }
    function redo() {
      if (!redoStack.length) return;
      undoStack.push(snapshot());
      restore(redoStack.pop());
      render(); save();
    }
    function save() {
      if (suppressSave || mode !== 'sandbox') return;
      try { localStorage.setItem(STORAGE_KEY, snapshot()); } catch(e){}
    }
    function loadPersist() {
      if (mode !== 'sandbox') return false;
      try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (s) { restore(s); return true; }
      } catch(e){}
      return false;
    }
    function clearAll() {
      if (!confirm('Clear all devices and wires?')) return;
      pushUndo();
      state.devices.length = 0;
      state.wires.length = 0;
      state.lans.length = 0;
      state.looseEnds.length = 0;
      state.nextIds = { device:1, wire:1, lan:1 };
      render(); save();
    }

    // -------- Routing graph + BFS --------
    function buildGraph() {
      // returns adjacency map: id -> [{id, viaWireId|null, viaWireless?, viaInternet?}]
      const adj = {};
      state.devices.forEach(d => adj[d.id] = []);
      adj[INTERNET_ID] = [];

      state.wires.forEach(w => {
        if (!w.fromDevice || !w.toDevice) return; // loose
        if (!adj[w.fromDevice] || !adj[w.toDevice]) return;
        adj[w.fromDevice].push({ id:w.toDevice, viaWireId:w.id });
        adj[w.toDevice].push({ id:w.fromDevice, viaWireId:w.id });
      });

      // Wireless: laptops/tablets in WAP range
      const waps = state.devices.filter(d => d.type === 'wap');
      waps.forEach(wap => {
        state.devices.forEach(d => {
          if (d.id === wap.id) return;
          if ((d.type === 'laptop' || d.type === 'tablet') && inWapRange(d, wap)) {
            adj[wap.id].push({ id:d.id, viaWireless:true });
            adj[d.id].push({ id:wap.id, viaWireless:true });
          }
        });
      });

      // Internet cloud
      state.devices.forEach(d => {
        if (d.type === 'router' && d.internetOn) {
          adj[d.id].push({ id: INTERNET_ID, viaInternet:true });
          adj[INTERNET_ID].push({ id: d.id, viaInternet:true });
        }
      });

      return adj;
    }
    function inWapRange(device, wap) {
      const dc = { x:device.x + DEVICE_W/2, y:device.y + DEVICE_H/2 };
      const wc = { x:wap.x + DEVICE_W/2, y:wap.y + DEVICE_H/2 };
      const dx = dc.x - wc.x, dy = dc.y - wc.y;
      return Math.hypot(dx, dy) <= WAP_RANGE;
    }
    function bfs(fromId, toId) {
      const adj = buildGraph();
      if (!adj[fromId] || !adj[toId]) return null;
      const visited = new Set([fromId]);
      const prev = { [fromId]: null };
      const queue = [fromId];
      while (queue.length) {
        const cur = queue.shift();
        if (cur === toId) {
          const path = [];
          let n = cur;
          while (n != null) {
            path.unshift({ id:n, edge: prev[n] ? prev[n].edge : null });
            n = prev[n] ? prev[n].from : null;
          }
          return path;
        }
        for (const nb of adj[cur]) {
          if (!visited.has(nb.id)) {
            visited.add(nb.id);
            prev[nb.id] = { from: cur, edge: nb };
            queue.push(nb.id);
          }
        }
      }
      return null;
    }
    function reachableFrom(id) {
      const adj = buildGraph();
      if (!adj[id]) return new Set();
      const v = new Set([id]);
      const q = [id];
      while (q.length) {
        const c = q.shift();
        for (const nb of adj[c]) if (!v.has(nb.id)) { v.add(nb.id); q.push(nb.id); }
      }
      v.delete(id);
      return v;
    }

    // -------- LAN membership --------
    function lanOf(d) {
      const cx = d.x + DEVICE_W/2, cy = d.y + DEVICE_H/2;
      for (const lan of state.lans) {
        if (cx >= lan.x && cx <= lan.x + lan.w && cy >= lan.y && cy <= lan.y + lan.h) return lan;
      }
      return null;
    }

    function autoGrowLans() {
      for (const lan of state.lans) {
        const members = state.devices.filter(d => lanOf(d) && lanOf(d).id === lan.id);
        if (members.length === 0) continue;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const d of members) {
          minX = Math.min(minX, d.x);
          minY = Math.min(minY, d.y);
          maxX = Math.max(maxX, d.x + DEVICE_W);
          maxY = Math.max(maxY, d.y + DEVICE_H);
        }
        const pad = 30;
        const nx = Math.min(lan.x, minX - pad);
        const ny = Math.min(lan.y, minY - pad);
        const nw = Math.max(lan.x + lan.w, maxX + pad) - nx;
        const nh = Math.max(lan.y + lan.h, maxY + pad) - ny;
        lan.x = nx; lan.y = ny; lan.w = nw; lan.h = nh;
      }
    }

    // -------- Render --------
    function clearLayer(g) { while (g.firstChild) g.removeChild(g.firstChild); }

    function render() {
      autoGrowLans();
      clearLayer(layerWan);
      clearLayer(layerLan);
      clearLayer(layerCoverage);
      clearLayer(layerWires);
      clearLayer(layerDevices);
      clearLayer(layerCloud);

      // WAN derivation
      renderWans();

      // LANs
      state.lans.forEach(renderLan);

      // Coverage circles for WAPs
      state.devices.filter(d=>d.type==='wap').forEach(wap => {
        const c = document.createElementNS(SVG_NS,'circle');
        c.setAttribute('class','wap-coverage');
        c.setAttribute('cx', wap.x + DEVICE_W/2);
        c.setAttribute('cy', wap.y + DEVICE_H/2);
        c.setAttribute('r', WAP_RANGE);
        layerCoverage.appendChild(c);
      });

      // Shared internet cloud at top-centre + dashed uplink per internet-on router.
      const anyRouter = state.devices.some(d => d.type === 'router');
      if (anyRouter) renderSharedInternetCloud();
      const onlineRouters = state.devices.filter(d => d.type === 'router' && d.internetOn);
      onlineRouters.forEach((r, i) => renderInternetUplink(r, i, onlineRouters.length));
      // Internet toggle on every router
      state.devices.filter(d=>d.type==='router').forEach(renderInternetToggle);

      // Wires
      state.wires.forEach(renderWire);

      // Devices
      state.devices.forEach(renderDevice);

      // Empty state
      const empty = state.devices.length === 0 && state.lans.length === 0;
      emptyHint.classList.toggle('hidden', !empty);
    }

    function renderLan(lan) {
      const g = document.createElementNS(SVG_NS,'g');
      g.setAttribute('class','lan-group');
      g.dataset.lanId = lan.id;

      const r = document.createElementNS(SVG_NS,'rect');
      r.setAttribute('class','lan-box');
      r.setAttribute('x', lan.x); r.setAttribute('y', lan.y);
      r.setAttribute('width', lan.w); r.setAttribute('height', lan.h);
      g.appendChild(r);

      const labelText = lan.name;
      const labelBg = document.createElementNS(SVG_NS,'rect');
      labelBg.setAttribute('class','lan-label-bg');
      labelBg.setAttribute('x', lan.x + 8);
      labelBg.setAttribute('y', lan.y - 10);
      labelBg.setAttribute('width', labelText.length * 7 + 14);
      labelBg.setAttribute('height', 18);
      labelBg.setAttribute('rx', 4);
      g.appendChild(labelBg);

      const lbl = document.createElementNS(SVG_NS,'text');
      lbl.setAttribute('class','lan-label');
      lbl.setAttribute('x', lan.x + 15);
      lbl.setAttribute('y', lan.y + 3);
      lbl.textContent = labelText;
      g.appendChild(lbl);

      // resize handle
      const h = document.createElementNS(SVG_NS,'rect');
      h.setAttribute('class','lan-handle');
      h.setAttribute('x', lan.x + lan.w - 8);
      h.setAttribute('y', lan.y + lan.h - 8);
      h.setAttribute('width', 10); h.setAttribute('height', 10);
      h.dataset.lanId = lan.id;
      h.dataset.role = 'lan-resize';
      g.appendChild(h);

      r.dataset.lanId = lan.id;
      r.dataset.role = 'lan-drag';
      labelBg.dataset.lanId = lan.id; labelBg.dataset.role = 'lan-drag';
      lbl.dataset.lanId = lan.id;

      // Double click label to rename
      lbl.addEventListener('dblclick', (e) => { e.stopPropagation(); editLanName(lan); });
      labelBg.addEventListener('dblclick', (e) => { e.stopPropagation(); editLanName(lan); });

      layerLan.appendChild(g);
    }

    function renderWans() {
      // Group LANs connected via routers (with internet on or direct router-router wire)
      // Build component map of LANs.
      const lanIds = state.lans.map(l => l.id);
      if (lanIds.length < 2) return;
      const parent = {};
      lanIds.forEach(id => parent[id] = id);
      function find(x){ return parent[x]===x ? x : (parent[x]=find(parent[x])); }
      function union(a,b){ a=find(a); b=find(b); if(a!==b) parent[a]=b; }

      // For each router, find LANs reachable from it through wires (no internet hop) — that's "its LANs"
      // Then if internet is on, union with all other internet-on routers' LAN sets.
      const routerLans = new Map(); // routerId -> Set<lanId>
      state.devices.filter(d=>d.type==='router').forEach(r => {
        const set = new Set();
        // BFS within wired graph (no internet/wireless)
        const seen = new Set([r.id]);
        const q = [r.id];
        while (q.length) {
          const cur = q.shift();
          const dev = findDevice(cur);
          if (dev) {
            const lan = lanOf(dev);
            if (lan) set.add(lan.id);
          }
          state.wires.forEach(w => {
            if (!w.fromDevice || !w.toDevice) return;
            let nb = null;
            if (w.fromDevice === cur) nb = w.toDevice;
            else if (w.toDevice === cur) nb = w.fromDevice;
            if (nb && !seen.has(nb)) { seen.add(nb); q.push(nb); }
          });
        }
        routerLans.set(r.id, set);
        if (set.size >= 2) {
          const arr = [...set];
          for (let i=1;i<arr.length;i++) union(arr[0], arr[i]);
        }
      });
      // Internet bridging
      const internetRouters = state.devices.filter(d=>d.type==='router' && d.internetOn);
      const allInternetLans = new Set();
      internetRouters.forEach(r => routerLans.get(r.id)?.forEach(id => allInternetLans.add(id)));
      if (allInternetLans.size >= 2) {
        const arr = [...allInternetLans];
        for (let i=1;i<arr.length;i++) union(arr[0], arr[i]);
      }

      // Group LANs by component
      const groups = {};
      lanIds.forEach(id => {
        const root = find(id);
        if (!groups[root]) groups[root] = [];
        groups[root].push(id);
      });

      wanGroupsByKey = {};
      wanBoxes = [];
      let wanIdx = 1;
      Object.values(groups).forEach(group => {
        if (group.length < 2) return;
        const key = 'wan-' + group.slice().sort().join('-');
        wanGroupsByKey[key] = group.slice();
        const lans = group.map(id => findLan(id)).filter(Boolean);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        lans.forEach(l => {
          minX = Math.min(minX, l.x);
          minY = Math.min(minY, l.y);
          maxX = Math.max(maxX, l.x + l.w);
          maxY = Math.max(maxY, l.y + l.h);
        });
        const pad = 24;
        const x = minX - pad, y = minY - pad - 20;
        const w = (maxX - minX) + pad*2;
        const h = (maxY - minY) + pad*2 + 20;
        wanBoxes.push({ x, y, w, h });
        const r = document.createElementNS(SVG_NS,'rect');
        r.setAttribute('class','wan-box');
        r.setAttribute('x', x); r.setAttribute('y', y);
        r.setAttribute('width', w); r.setAttribute('height', h);
        r.dataset.role = 'wan-drag';
        r.dataset.wanKey = key;
        layerWan.appendChild(r);
        const lblBg = document.createElementNS(SVG_NS,'rect');
        lblBg.setAttribute('class','wan-label-bg');
        lblBg.setAttribute('x', x + 8); lblBg.setAttribute('y', y - 10);
        lblBg.setAttribute('width', 40); lblBg.setAttribute('height', 18);
        lblBg.setAttribute('rx', 4);
        lblBg.dataset.role = 'wan-drag';
        lblBg.dataset.wanKey = key;
        layerWan.appendChild(lblBg);
        const lbl = document.createElementNS(SVG_NS,'text');
        lbl.setAttribute('class','wan-label');
        lbl.setAttribute('x', x + 15); lbl.setAttribute('y', y + 3);
        lbl.textContent = 'WAN';
        lbl.dataset.role = 'wan-drag';
        lbl.dataset.wanKey = key;
        layerWan.appendChild(lbl);
        wanIdx++;
      });
    }

    // Globe icon radius — the internet is drawn as a wire-frame globe.
    const GLOBE_R = 30;

    function renderSharedInternetCloud() {
      const pos = internetCenterPos();
      const px = pos.x, py = pos.y;
      const R = GLOBE_R;
      const g = document.createElementNS(SVG_NS,'g');
      g.setAttribute('class','cloud-group');

      // Outer sphere
      const body = document.createElementNS(SVG_NS,'circle');
      body.setAttribute('class','cloud-body');
      body.setAttribute('cx', px); body.setAttribute('cy', py);
      body.setAttribute('r', R);
      g.appendChild(body);

      const lines = document.createElementNS(SVG_NS,'g');
      lines.setAttribute('class','globe-lines');
      // Set fill/stroke inline as well as in CSS: SVG defaults to a solid black
      // fill, so a stale cached stylesheet would otherwise blot out the globe.
      lines.setAttribute('fill','none');
      lines.setAttribute('stroke','var(--accent-2)');
      lines.setAttribute('stroke-width','1.6');

      // Meridians: the straight centre line plus two curved ellipses
      const meridian = document.createElementNS(SVG_NS,'line');
      meridian.setAttribute('x1', px); meridian.setAttribute('y1', py - R);
      meridian.setAttribute('x2', px); meridian.setAttribute('y2', py + R);
      lines.appendChild(meridian);

      [R * 0.45, R * 0.82].forEach(rx => {
        const el = document.createElementNS(SVG_NS,'ellipse');
        el.setAttribute('cx', px); el.setAttribute('cy', py);
        el.setAttribute('rx', rx); el.setAttribute('ry', R);
        el.setAttribute('fill','none');
        lines.appendChild(el);
      });

      // Latitudes: equator plus one chord above and below
      [0, -R * 0.5, R * 0.5].forEach(dy => {
        const halfW = Math.sqrt(Math.max(0, R * R - dy * dy));
        const el = document.createElementNS(SVG_NS,'line');
        el.setAttribute('x1', px - halfW); el.setAttribute('y1', py + dy);
        el.setAttribute('x2', px + halfW); el.setAttribute('y2', py + dy);
        lines.appendChild(el);
      });

      g.appendChild(lines);

      const lbl = document.createElementNS(SVG_NS,'text');
      lbl.setAttribute('class','cloud-label');
      lbl.setAttribute('x', px); lbl.setAttribute('y', py + R + 16);
      lbl.textContent = 'Internet';
      g.appendChild(lbl);

      layerCloud.appendChild(g);
    }

    function renderInternetUplink(router, idx, total) {
      const cloud = internetCenterPos();
      // Start at the top edge of the router body so the line visibly leaves
      // the router itself (the toggle is just the on/off control).
      const cx = router.x + devW(router) / 2;
      const cy = router.y + 2;
      // Spread anchor along the cloud's bottom flat segment so the line touches its outer edge.
      const SPREAD = 56;
      const anchorX = total > 1
        ? cloud.x + (idx/(total-1) - 0.5) * SPREAD
        : cloud.x;
      const anchorY = cloud.y + GLOBE_R; // bottom edge of the globe
      // Gentle curve: leave the router upward, arrive at the cloud from below,
      // leaning the control points toward each other so wide horizontal gaps
      // produce a smooth diagonal rather than an S-kink.
      const lift = Math.max(26, (cy - anchorY) * 0.45);
      const leanX = (anchorX - cx) * 0.25;
      const cp1 = { x: cx + leanX,      y: cy - lift };
      const cp2 = { x: anchorX - leanX, y: anchorY + lift };
      const d = `M ${cx} ${cy} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${anchorX} ${anchorY}`;

      const halo = document.createElementNS(SVG_NS,'path');
      halo.setAttribute('class','uplink-halo');
      halo.setAttribute('d', d);
      layerCloud.appendChild(halo);

      const line = document.createElementNS(SVG_NS,'path');
      line.setAttribute('class','uplink-line uplink-flow');
      line.setAttribute('d', d);
      line.dataset.routerId = router.id;
      layerCloud.appendChild(line);
    }

    function routerToggleCenter(router) {
      const W = 22, H = 12;
      const x = router.x + DEVICE_W - W + 6;
      const y = router.y - H - 2;
      return { x: x + W/2, y: y + H/2 };
    }

    function renderInternetToggle(router) {
      const g = document.createElementNS(SVG_NS,'g');
      g.setAttribute('class','internet-toggle' + (router.internetOn ? '' : ' off'));
      g.dataset.role = 'internet-toggle';
      g.dataset.deviceId = router.id;
      const W = 22, H = 12, R = H/2;
      const x = router.x + DEVICE_W - W + 6;
      const y = router.y - H - 2;
      const track = document.createElementNS(SVG_NS,'rect');
      track.setAttribute('class','track');
      track.setAttribute('x', x); track.setAttribute('y', y);
      track.setAttribute('width', W); track.setAttribute('height', H);
      track.setAttribute('rx', R); track.setAttribute('ry', R);
      g.appendChild(track);
      const knob = document.createElementNS(SVG_NS,'circle');
      knob.setAttribute('class','knob');
      knob.setAttribute('cy', y + R);
      knob.setAttribute('cx', router.internetOn ? x + W - R : x + R);
      knob.setAttribute('r', R - 1.5);
      g.appendChild(knob);
      layerCloud.appendChild(g);
    }

    function renderWire(w) {
      const p1 = wireEndPos(w, 'from');
      const p2 = wireEndPos(w, 'to');
      if (!p1 || !p2) return;
      const STUB = 24;
      const dipY = Math.max(p1.y, p2.y) + STUB + 30;
      const s1y = p1.y + STUB;
      const s2y = p2.y + STUB;
      const pathStr =
        `M ${p1.x} ${p1.y} L ${p1.x} ${s1y} ` +
        `C ${p1.x} ${dipY}, ${p2.x} ${dipY}, ${p2.x} ${s2y} ` +
        `L ${p2.x} ${p2.y}`;
      const el = document.createElementNS(SVG_NS,'path');
      el.setAttribute('class','wire');
      el.setAttribute('d', pathStr);
      el.dataset.wireId = w.id;
      layerWires.appendChild(el);

      // Draw loose-end handle if any end is loose
      ['from','to'].forEach(end => {
        const did = end==='from' ? w.fromDevice : w.toDevice;
        if (!did) {
          const loose = state.looseEnds.find(l => l.wireId === w.id && l.end === end);
          if (loose) {
            const handle = document.createElementNS(SVG_NS,'circle');
            handle.setAttribute('cx', loose.x); handle.setAttribute('cy', loose.y);
            handle.setAttribute('r', 6);
            handle.setAttribute('fill', 'var(--bad)');
            handle.setAttribute('stroke', 'white');
            handle.setAttribute('stroke-width', 1.5);
            handle.style.cursor = 'grab';
            handle.dataset.role = 'loose-end';
            handle.dataset.wireId = w.id;
            handle.dataset.end = end;
            layerWires.appendChild(handle);
          }
        }
      });
    }
    function wireEndPos(w, end) {
      const did = end==='from' ? w.fromDevice : w.toDevice;
      const port = end==='from' ? w.fromPort : w.toPort;
      if (did) {
        const d = findDevice(did);
        if (!d) return null;
        return portPos(d, port);
      } else {
        const loose = state.looseEnds.find(l => l.wireId === w.id && l.end === end);
        return loose ? { x: loose.x, y: loose.y } : null;
      }
    }

    function renderDevice(d) {
      const g = document.createElementNS(SVG_NS,'g');
      g.setAttribute('class','device-group');
      g.setAttribute('transform', `translate(${d.x},${d.y})`);
      g.dataset.deviceId = d.id;

      // Inner wrapper so animations (shake) can transform without fighting the outer translate.
      const inner = document.createElementNS(SVG_NS,'g');
      inner.setAttribute('class','dev-inner');
      g.appendChild(inner);

      // Body — width grows with port count for hubs/switches/routers
      const w = devW(d);
      const body = document.createElementNS(SVG_NS,'rect');
      body.setAttribute('class','device-body');
      body.setAttribute('x', 0); body.setAttribute('y', 0);
      body.setAttribute('width', w); body.setAttribute('height', DEVICE_H);
      body.setAttribute('rx', 8);
      inner.appendChild(body);

      // Icon (centred horizontally for wider hubs/switches/routers)
      const iconG = makeIcon(d.type);
      const def = ddef(d);
      if (def.iconColor === 'warn') iconG.style.stroke = 'var(--warn)';
      if (def.iconColor === 'accent2') iconG.style.stroke = 'var(--accent-2)';
      const iconOffsetX = Math.max(4, (w - 48) / 2);
      iconG.setAttribute('transform', `translate(${iconOffsetX},4)`);
      inner.appendChild(iconG);

      // Status light
      const reach = reachableFrom(d.id);
      let lightClass = 'off';
      const hasWire = state.wires.some(w => (w.fromDevice===d.id || w.toDevice===d.id));
      const hasWireless = (d.type==='laptop' || d.type==='tablet') && state.devices.some(w => w.type==='wap' && inWapRange(d,w));
      if (reach.size > 0) lightClass = 'green';
      else if (hasWire || hasWireless) lightClass = 'amber';
      const light = document.createElementNS(SVG_NS,'circle');
      light.setAttribute('class','status-light '+lightClass);
      light.setAttribute('cx', w - 6);
      light.setAttribute('cy', 6); light.setAttribute('r', 3.5);
      inner.appendChild(light);

      // Ports
      const n = portCount(d);
      for (let i=0;i<n;i++) {
        const pp = portPos(d, i);
        const c = document.createElementNS(SVG_NS,'circle');
        c.setAttribute('class','port' + (isPortUsed(d.id,i) ? ' used' : ''));
        c.setAttribute('cx', pp.x - d.x);
        c.setAttribute('cy', pp.y - d.y);
        c.setAttribute('r', 4);
        c.dataset.role = 'port';
        c.dataset.deviceId = d.id;
        c.dataset.portIdx = i;
        inner.appendChild(c);
      }

      // Label
      const lbl = document.createElementNS(SVG_NS,'text');
      lbl.setAttribute('class','device-label');
      lbl.setAttribute('x', w/2);
      lbl.setAttribute('y', DEVICE_H + 14);
      lbl.textContent = d.name;
      lbl.dataset.role = 'label';
      lbl.dataset.deviceId = d.id;
      inner.appendChild(lbl);

      layerDevices.appendChild(g);
    }

    // -------- Action helpers --------
    function addDevice(type, x, y, extras) {
      pushUndo();
      const def = DEVICE_DEFS[type];
      const clamped = clampDevicePos(x - DEVICE_W/2, y - DEVICE_H/2);
      const d = {
        id: uid('device'),
        type,
        x: snap(clamped.x),
        y: snap(clamped.y),
        name: extras?.name || defaultName(type),
      };
      if (def.configurable) d.portCount = extras?.portCount || def.defaultPorts;
      if (def.router) d.internetOn = extras?.internetOn !== false;
      state.devices.push(d);
      render(); save();
      return d;
    }
    function removeDevice(id) {
      pushUndo();
      const dev = findDevice(id);
      if (!dev) return;
      // For each attached wire, dangle the free end where the device was
      const cx = dev.x + DEVICE_W/2, cy = dev.y + DEVICE_H/2;
      const attachedWires = state.wires.filter(w => w.fromDevice===id || w.toDevice===id);
      attachedWires.forEach(w => {
        if (w.fromDevice === id) {
          w.fromDevice = null; w.fromPort = null;
          state.looseEnds.push({ wireId: w.id, end:'from', x: cx + (Math.random()*40-20), y: cy + (Math.random()*40-20) });
        }
        if (w.toDevice === id) {
          w.toDevice = null; w.toPort = null;
          state.looseEnds.push({ wireId: w.id, end:'to', x: cx + (Math.random()*40-20), y: cy + (Math.random()*40-20) });
        }
      });
      // Remove wires whose both ends are loose
      state.wires = state.wires.filter(w => {
        if (!w.fromDevice && !w.toDevice) {
          state.looseEnds = state.looseEnds.filter(l => l.wireId !== w.id);
          return false;
        }
        return true;
      });
      state.devices = state.devices.filter(d => d.id !== id);
      render(); save();
    }
    function addWire(fromDevice, fromPort, toDevice, toPort) {
      pushUndo();
      const w = { id: uid('wire'), fromDevice, fromPort, toDevice, toPort };
      state.wires.push(w);
      render(); save();
      return w;
    }
    function removeWire(id) {
      pushUndo();
      state.wires = state.wires.filter(w => w.id !== id);
      state.looseEnds = state.looseEnds.filter(l => l.wireId !== id);
      render(); save();
    }
    function disconnectAll(deviceId) {
      pushUndo();
      state.wires = state.wires.filter(w => {
        if (w.fromDevice === deviceId || w.toDevice === deviceId) {
          state.looseEnds = state.looseEnds.filter(l => l.wireId !== w.id);
          return false;
        }
        return true;
      });
      render(); save();
    }
    function renameDevice(d, name) {
      pushUndo();
      d.name = name || d.name;
      render(); save();
    }

    // -------- Palette drag --------
    function setupPalette() {
      document.querySelectorAll('.palette-item').forEach(item => {
        item.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          const type = item.dataset.type;
          item.setPointerCapture(e.pointerId);

          // Floating ghost that follows the cursor
          const ghost = document.createElement('div');
          ghost.className = 'palette-ghost';
          const iconSrc = item.querySelector('svg');
          if (iconSrc) ghost.appendChild(iconSrc.cloneNode(true));
          ghost.style.left = e.clientX + 'px';
          ghost.style.top  = e.clientY + 'px';
          document.body.appendChild(ghost);
          document.body.classList.add('palette-dragging');

          const onMove = (ev) => {
            ghost.style.left = ev.clientX + 'px';
            ghost.style.top  = ev.clientY + 'px';
          };
          const cleanup = () => {
            ghost.remove();
            document.body.classList.remove('palette-dragging');
            item.removeEventListener('pointermove', onMove);
            item.removeEventListener('pointerup', onUp);
            item.removeEventListener('pointercancel', onUp);
          };
          const onUp = (ev) => {
            try { item.releasePointerCapture(e.pointerId); } catch (_) {}
            cleanup();
            const rect = svg.getBoundingClientRect();
            if (ev.clientX < rect.left || ev.clientX > rect.right ||
                ev.clientY < rect.top  || ev.clientY > rect.bottom) return;
            const pt = svgPoint(ev);
            dropDeviceAt(type, pt.x, pt.y);
          };
          item.addEventListener('pointermove', onMove);
          item.addEventListener('pointerup', onUp);
          item.addEventListener('pointercancel', onUp);
        });
      });
    }

    function dropDeviceAt(type, x, y) {
      const def = DEVICE_DEFS[type];
      if (def.configurable) {
        showPortCountModal(def, (count) => {
          addDevice(type, x, y, { portCount: count });
        });
      } else {
        addDevice(type, x, y);
      }
    }

    function showPortCountModal(def, callback) {
      const back = document.createElement('div');
      back.className = 'modal-backdrop';
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `<h3>How many ports?</h3><div class="opts"></div><div class="actions"><button class="btn ghost" data-action="cancel">Cancel</button></div>`;
      const opts = modal.querySelector('.opts');
      def.configurable.forEach(n => {
        const b = document.createElement('button');
        b.textContent = n;
        b.addEventListener('click', () => { document.body.removeChild(back); callback(n); });
        opts.appendChild(b);
      });
      modal.querySelector('[data-action="cancel"]').addEventListener('click', () => document.body.removeChild(back));
      back.appendChild(modal);
      back.addEventListener('click', (e) => { if (e.target === back) document.body.removeChild(back); });
      document.body.appendChild(back);
    }

    // -------- Canvas pointer handling --------
    svg.addEventListener('pointerdown', onCanvasDown);
    svg.addEventListener('pointermove', onCanvasMove);
    svg.addEventListener('pointerup',   onCanvasUp);
    svg.addEventListener('pointercancel', onCanvasUp);
    svg.addEventListener('contextmenu', (e) => {
      const t = e.target;
      if (t.closest('.device-group')) { e.preventDefault(); openContextMenu(e); }
    });
    svg.addEventListener('dblclick', (e) => {
      const lbl = e.target.closest('[data-role="label"]');
      if (lbl) { startLabelEdit(lbl); }
    });

    function svgPoint(e) {
      const r = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const scaleX = r.width  / vb.width;
      const scaleY = r.height / vb.height;
      return {
        x: (e.clientX - r.left) / scaleX,
        y: (e.clientY - r.top)  / scaleY,
      };
    }

    function onCanvasDown(e) {
      closePopup();
      const t = e.target;
      const role = t.dataset && t.dataset.role;
      const pt = svgPoint(e);

      // Delete mode
      if (deleteMode) {
        const dg = t.closest('.device-group');
        if (dg) { removeDevice(dg.dataset.deviceId); return; }
        if (t.classList.contains('wire')) { removeWire(t.dataset.wireId); return; }
        return;
      }

      // LAN draw mode
      if (lanDrawMode) {
        activeLanDraw = { startX: pt.x, startY: pt.y };
        return;
      }

      // Internet toggle
      const tog = t.closest('[data-role="internet-toggle"]');
      if (tog) {
        const d = findDevice(tog.dataset.deviceId);
        if (d) { pushUndo(); d.internetOn = !d.internetOn; render(); save(); }
        return;
      }

      // Loose end drag
      if (role === 'loose-end') {
        activeLooseDrag = { wireId: t.dataset.wireId, end: t.dataset.end };
        return;
      }

      // Port: start wiring
      if (role === 'port') {
        const did = t.dataset.deviceId;
        const idx = parseInt(t.dataset.portIdx, 10);
        if (isPortUsed(did, idx)) {
          t.classList.add('flash-bad');
          setTimeout(()=>t.classList.remove('flash-bad'), 400);
          setStatus(`${findDevice(did).name} port already used.`, 'warn');
          return;
        }
        const startPos = portPos(findDevice(did), idx);
        const rubber = document.createElementNS(SVG_NS,'path');
        rubber.setAttribute('class','wire rubber');
        rubber.setAttribute('d', `M ${startPos.x} ${startPos.y} L ${pt.x} ${pt.y}`);
        layerOverlay.appendChild(rubber);
        activeWiring = { fromDevice: did, fromPort: idx, start: startPos, rubberEl: rubber };
        return;
      }

      // LAN handle
      if (role === 'lan-resize') {
        activeLanResize = { lanId: t.dataset.lanId, startX: pt.x, startY: pt.y };
        const l = findLan(t.dataset.lanId);
        activeLanResize.origW = l.w; activeLanResize.origH = l.h;
        pushUndo();
        return;
      }
      if (role === 'wan-drag') {
        const key = t.dataset.wanKey;
        const lanIds = wanGroupsByKey[key] || [];
        if (!lanIds.length) return;
        const lans = lanIds.map(id => findLan(id)).filter(Boolean);
        const memberDevices = state.devices.filter(d => {
          const ln = lanOf(d);
          return ln && lanIds.includes(ln.id);
        });
        activeWanDrag = {
          startX: pt.x, startY: pt.y,
          lans: lans.map(l => ({ id: l.id, ox: l.x, oy: l.y })),
          members: memberDevices.map(d => ({ id: d.id, ox: d.x, oy: d.y, w: devW(d) })),
          origCloud: { x: state.cloudOffset.x, y: state.cloudOffset.y },
        };
        pushUndo();
        return;
      }
      if (role === 'lan-drag') {
        const l = findLan(t.dataset.lanId);
        activeLanDrag = { lanId: l.id, startX: pt.x, startY: pt.y, origX: l.x, origY: l.y,
                         members: state.devices.filter(d => lanOf(d) && lanOf(d).id === l.id)
                                  .map(d => ({ id: d.id, ox: d.x, oy: d.y })) };
        pushUndo();
        return;
      }

      // Cloud drag — grab any part of the internet cloud to reposition it
      if (t.closest && t.closest('.cloud-group')) {
        activeCloudDrag = {
          startX: pt.x, startY: pt.y,
          origX: state.cloudOffset.x, origY: state.cloudOffset.y,
        };
        pushUndo();
        return;
      }

      // Device drag (left-button only — right-button is handled by contextmenu)
      const dg = t.closest('.device-group');
      if (dg && e.button === 0) {
        const d = findDevice(dg.dataset.deviceId);
        activeDeviceDrag = { id: d.id, startX: pt.x, startY: pt.y, origX: d.x, origY: d.y, moved:false };
        // long-press for context menu
        longPressTimer = setTimeout(() => {
          openContextMenu({ clientX: e.clientX, clientY: e.clientY, target: dg });
          activeDeviceDrag = null;
        }, 550);
        return;
      }

      // Wire click for delete? already handled in delete mode.
    }

    function onCanvasMove(e) {
      const pt = svgPoint(e);
      if (activeWiring) {
        const { start, rubberEl } = activeWiring;
        rubberEl.setAttribute('d', `M ${start.x} ${start.y} L ${pt.x} ${pt.y}`);
        return;
      }
      if (activeDeviceDrag) {
        const dx = pt.x - activeDeviceDrag.startX;
        const dy = pt.y - activeDeviceDrag.startY;
        if (!activeDeviceDrag.moved && (Math.abs(dx)>3 || Math.abs(dy)>3)) {
          activeDeviceDrag.moved = true;
          clearTimeout(longPressTimer);
          pushUndo();
          svg.classList.add('dragging-device');
        }
        if (activeDeviceDrag.moved) {
          const d = findDevice(activeDeviceDrag.id);
          const cp = clampDevicePos(activeDeviceDrag.origX + dx, activeDeviceDrag.origY + dy);
          d.x = snap(cp.x);
          d.y = snap(cp.y);
          render();
        }
        return;
      }
      if (activeWanDrag) {
        const rawDx = pt.x - activeWanDrag.startX;
        const rawDy = pt.y - activeWanDrag.startY;
        // Grow canvas first if the group is heading past the current right/bottom edge.
        let projMaxX = 0, projMaxY = 0;
        activeWanDrag.members.forEach(m => {
          projMaxX = Math.max(projMaxX, m.ox + m.w + rawDx);
          projMaxY = Math.max(projMaxY, m.oy + DEVICE_H + rawDy);
        });
        growCanvasIfNeeded(projMaxX + EDGE_THRESHOLD, projMaxY + EDGE_THRESHOLD);
        // Compute the largest uniform delta that keeps every member device inside the playfield.
        let minDx = -Infinity, maxDx = Infinity, minDy = -Infinity, maxDy = Infinity;
        activeWanDrag.members.forEach(m => {
          minDx = Math.max(minDx, PLAY_PAD - m.ox);
          maxDx = Math.min(maxDx, (CANVAS_W - PLAY_PAD - m.w) - m.ox);
          minDy = Math.max(minDy, PLAY_TOP - m.oy);
          maxDy = Math.min(maxDy, (CANVAS_H - PLAY_PAD - DEVICE_H) - m.oy);
        });
        const dx = Math.max(minDx, Math.min(maxDx, rawDx));
        const dy = Math.max(minDy, Math.min(maxDy, rawDy));
        activeWanDrag.lans.forEach(m => {
          const l = findLan(m.id);
          if (l) { l.x = snap(m.ox + dx); l.y = snap(m.oy + dy); }
        });
        activeWanDrag.members.forEach(m => {
          const d = findDevice(m.id);
          if (d) { d.x = snap(m.ox + dx); d.y = snap(m.oy + dy); }
        });
        state.cloudOffset.x = activeWanDrag.origCloud.x + dx;
        state.cloudOffset.y = activeWanDrag.origCloud.y + dy;
        render();
        return;
      }
      if (activeCloudDrag) {
        state.cloudOffset.x = activeCloudDrag.origX + (pt.x - activeCloudDrag.startX);
        state.cloudOffset.y = activeCloudDrag.origY + (pt.y - activeCloudDrag.startY);
        render();
        return;
      }
      if (activeLanDrag) {
        const dx = pt.x - activeLanDrag.startX;
        const dy = pt.y - activeLanDrag.startY;
        const l = findLan(activeLanDrag.lanId);
        l.x = snap(activeLanDrag.origX + dx);
        l.y = snap(activeLanDrag.origY + dy);
        activeLanDrag.members.forEach(m => {
          const d = findDevice(m.id);
          if (d) {
            const cp = clampDevicePos(m.ox + dx, m.oy + dy);
            d.x = snap(cp.x);
            d.y = snap(cp.y);
          }
        });
        render();
        return;
      }
      if (activeLanResize) {
        const l = findLan(activeLanResize.lanId);
        l.w = Math.max(100, snap(activeLanResize.origW + (pt.x - activeLanResize.startX)));
        l.h = Math.max(100, snap(activeLanResize.origH + (pt.y - activeLanResize.startY)));
        render();
        return;
      }
      if (activeLanDraw) {
        // visual preview — render a temporary rect via overlay
        clearLayer(layerOverlay);
        const x = Math.min(activeLanDraw.startX, pt.x), y = Math.min(activeLanDraw.startY, pt.y);
        const w = Math.abs(pt.x - activeLanDraw.startX), h = Math.abs(pt.y - activeLanDraw.startY);
        const r = document.createElementNS(SVG_NS,'rect');
        r.setAttribute('class','lan-box');
        r.setAttribute('x',x); r.setAttribute('y',y); r.setAttribute('width',w); r.setAttribute('height',h);
        layerOverlay.appendChild(r);
        return;
      }
      if (activeLooseDrag) {
        const loose = state.looseEnds.find(l => l.wireId === activeLooseDrag.wireId && l.end === activeLooseDrag.end);
        if (loose) { loose.x = pt.x; loose.y = pt.y; render(); }
        return;
      }
    }

    function onCanvasUp(e) {
      clearTimeout(longPressTimer);
      const pt = svgPoint(e);

      if (activeWiring) {
        const t = document.elementFromPoint(e.clientX, e.clientY);
        const port = t && t.dataset && t.dataset.role === 'port' ? t : null;
        if (port) {
          const did = port.dataset.deviceId;
          const idx = parseInt(port.dataset.portIdx, 10);
          if (did === activeWiring.fromDevice && idx === activeWiring.fromPort) {
            // same port - cancel
          } else if (isPortUsed(did, idx)) {
            port.classList.add('flash-bad');
            setTimeout(()=>port.classList.remove('flash-bad'),400);
            setStatus(`${findDevice(did).name} port already used.`, 'warn');
          } else {
            addWire(activeWiring.fromDevice, activeWiring.fromPort, did, idx);
          }
        }
        activeWiring.rubberEl.remove();
        activeWiring = null;
      }

      if (activeDeviceDrag) {
        if (!activeDeviceDrag.moved) {
          // It was a click — show popup (send for end devices, otherwise context menu)
          const d = findDevice(activeDeviceDrag.id);
          if (d) buildDevicePopup(d, e.clientX, e.clientY, true);
        } else {
          save();
        }
        activeDeviceDrag = null;
        svg.classList.remove('dragging-device');
      }
      if (activeWanDrag) { activeWanDrag = null; save(); }
      if (activeCloudDrag) { activeCloudDrag = null; save(); }
      if (activeLanDrag) { activeLanDrag = null; save(); }
      if (activeLanResize) { activeLanResize = null; save(); }
      if (activeLanDraw) {
        const x = Math.min(activeLanDraw.startX, pt.x), y = Math.min(activeLanDraw.startY, pt.y);
        const w = Math.abs(pt.x - activeLanDraw.startX), h = Math.abs(pt.y - activeLanDraw.startY);
        clearLayer(layerOverlay);
        if (w > 40 && h > 40) {
          pushUndo();
          state.lans.push({
            id: uid('lan'),
            name: 'LAN ' + (state.lans.length + 1),
            x: snap(x), y: snap(y), w: snap(w), h: snap(h)
          });
          save();
        }
        activeLanDraw = null;
        lanDrawMode = false;
        svg.classList.remove('lan-draw');
        const btn = document.querySelector('[data-tool="new-lan"]');
        if (btn) btn.classList.remove('active');
        render();
      }
      if (activeLooseDrag) {
        // Try to drop on a port
        const t = document.elementFromPoint(e.clientX, e.clientY);
        const port = t && t.dataset && t.dataset.role === 'port' ? t : null;
        if (port) {
          const did = port.dataset.deviceId;
          const idx = parseInt(port.dataset.portIdx, 10);
          if (!isPortUsed(did, idx)) {
            const w = findWire(activeLooseDrag.wireId);
            if (activeLooseDrag.end === 'from') { w.fromDevice = did; w.fromPort = idx; }
            else { w.toDevice = did; w.toPort = idx; }
            state.looseEnds = state.looseEnds.filter(l => !(l.wireId === w.id && l.end === activeLooseDrag.end));
            pushUndo();
            save();
          }
        }
        activeLooseDrag = null;
        render();
      }
    }

    // -------- Context menu / device popup --------
    function closePopup() {
      if (openPopup) {
        if (openPopup._docDown) {
          document.removeEventListener('mousedown', openPopup._docDown, true);
          document.removeEventListener('contextmenu', openPopup._docDown, true);
        }
        openPopup.remove();
        openPopup = null;
      }
      if (labelInput) { labelInput.remove(); labelInput = null; }
    }
    function openContextMenu(e) {
      closePopup();
      const dg = e.target.closest ? e.target.closest('.device-group') : null;
      if (!dg) return;
      const d = findDevice(dg.dataset.deviceId);
      if (!d) return;
      buildDevicePopup(d, e.clientX, e.clientY, true);
    }
    function openDevicePopup(d, cx, cy) {
      closePopup();
      buildDevicePopup(d, cx, cy, false);
    }
    function buildDevicePopup(d, cx, cy, fullMenu) {
      closePopup();
      const popup = document.createElement('div');
      popup.className = 'popup';
      const rect = root.getBoundingClientRect();
      popup.style.left = (cx - rect.left) + 'px';
      popup.style.top = (cy - rect.top) + 'px';

      const isEnd = ddef(d).end;
      let html = `<label>${d.name}</label>`;
      if (isEnd) html += `<button data-act="send">Send data</button>`;
      if (isEnd) html += `<button data-act="request">Request</button>`;
      html += `<button data-act="rename">Rename</button>`;
      if (ddef(d).configurable) html += `<button data-act="ports">Change ports</button>`;
      html += `<button data-act="disconnect">Disconnect all</button>`;
      html += `<hr><button class="danger" data-act="delete">Delete</button>`;
      popup.innerHTML = html;
      popup.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const act = b.dataset.act;
        closePopup();
        if (act === 'send') sendDataPrompt(d);
        else if (act === 'request') requestDataPrompt(d);
        else if (act === 'rename') {
          const n = prompt('New name:', d.name);
          if (n) renameDevice(d, n.trim());
        }
        else if (act === 'ports') {
          showPortCountModal(ddef(d), (count) => {
            const removed = state.wires.filter(w => (w.fromDevice===d.id && w.fromPort>=count) || (w.toDevice===d.id && w.toPort>=count));
            if (removed.length && !confirm(`This will remove ${removed.length} wire(s). Continue?`)) return;
            pushUndo();
            removed.forEach(w => state.wires = state.wires.filter(x => x.id !== w.id));
            d.portCount = count;
            render(); save();
          });
        }
        else if (act === 'disconnect') disconnectAll(d.id);
        else if (act === 'delete') removeDevice(d.id);
      });
      root.appendChild(popup);
      openPopup = popup;
      // Flip above/left if the menu would overflow the viewport.
      const pr = popup.getBoundingClientRect();
      const rootR = root.getBoundingClientRect();
      if (pr.bottom > window.innerHeight - 8) {
        const newTop = Math.max(0, cy - rect.top - pr.height);
        popup.style.top = newTop + 'px';
      }
      if (pr.right > rootR.right - 8) {
        const newLeft = Math.max(0, cx - rect.left - pr.width);
        popup.style.left = newLeft + 'px';
      }
      const openedAt = performance.now();
      const onDocDown = (ev) => {
        if (performance.now() - openedAt < 50) return;
        if (openPopup && openPopup.contains(ev.target)) return;
        closePopup();
      };
      popup._docDown = onDocDown;
      document.addEventListener('mousedown', onDocDown, true);
      document.addEventListener('contextmenu', onDocDown, true);
    }

    function startLabelEdit(lblEl) {
      closePopup();
      const d = findDevice(lblEl.dataset.deviceId);
      if (!d) return;
      const rect = lblEl.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const input = document.createElement('input');
      input.className = 'label-edit-input';
      input.value = d.name;
      input.style.left = (rect.left - rootRect.left - 30) + 'px';
      input.style.top  = (rect.top - rootRect.top - 2) + 'px';
      input.style.width = '90px';
      const done = (commit) => {
        if (commit) renameDevice(d, input.value.trim() || d.name);
        if (input.parentNode) input.parentNode.removeChild(input);
        labelInput = null;
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') done(true);
        else if (e.key === 'Escape') done(false);
      });
      input.addEventListener('blur', () => done(true));
      root.appendChild(input);
      input.focus(); input.select();
      labelInput = input;
    }

    function editLanName(lan) {
      const n = prompt('LAN name:', lan.name);
      if (n) { pushUndo(); lan.name = n.trim(); render(); save(); }
    }

    // -------- Send data --------
    function sendDataPrompt(src) {
      const others = state.devices.filter(d => d.id !== src.id && ddef(d).end);
      if (!others.length) { setStatus('No other devices to send to.', 'warn'); return; }
      // Group by LAN
      const groups = new Map(); // lanName -> []
      others.forEach(d => {
        const l = lanOf(d);
        const key = l ? l.name : 'No LAN';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(d);
      });

      const popup = document.createElement('div');
      popup.className = 'popup';
      const rootRect = root.getBoundingClientRect();
      popup.style.left = '50%'; popup.style.top = '60px';
      popup.style.transform = 'translateX(-50%)';
      let html = `<label>Send from ${src.name} to:</label><select id="send-dest">`;
      for (const [name, list] of groups) {
        html += `<optgroup label="${name}">`;
        list.forEach(d => { html += `<option value="${d.id}">${d.name}</option>`; });
        html += `</optgroup>`;
      }
      html += `</select><div style="display:flex;gap:6px;margin-top:8px;">
        <button data-act="go" style="background:var(--accent);color:var(--bg);border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;flex:1">Send</button>
        <button data-act="cancel" style="background:transparent;border:1px solid var(--line);color:var(--ink);padding:6px 12px;border-radius:6px;cursor:pointer">Cancel</button>
      </div>`;
      popup.innerHTML = html;
      popup.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.act === 'cancel') { closePopup(); }
        else if (b.dataset.act === 'go') {
          const did = popup.querySelector('#send-dest').value;
          closePopup();
          runSendData(src, findDevice(did));
        }
      });
      root.appendChild(popup);
      openPopup = popup;
    }

    function requestDataPrompt(src) {
      const servers = state.devices.filter(d => d.type === 'server' && d.id !== src.id);
      if (!servers.length) { setStatus('No servers on the canvas.', 'warn'); return; }
      const popup = document.createElement('div');
      popup.className = 'popup';
      popup.style.left = '50%'; popup.style.top = '60px';
      popup.style.transform = 'translateX(-50%)';
      let html = `<label>Request from ${src.name} to server:</label><select id="req-dest">`;
      servers.forEach(d => {
        const l = lanOf(d);
        const suffix = l ? ` (${l.name})` : '';
        html += `<option value="${d.id}">${d.name}${suffix}</option>`;
      });
      html += `</select><div style="display:flex;gap:6px;margin-top:8px;">
        <button data-act="go" style="background:#a78bfa;color:var(--bg);border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;flex:1">Send request</button>
        <button data-act="cancel" style="background:transparent;border:1px solid var(--line);color:var(--ink);padding:6px 12px;border-radius:6px;cursor:pointer">Cancel</button>
      </div>`;
      popup.innerHTML = html;
      popup.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.act === 'cancel') { closePopup(); }
        else if (b.dataset.act === 'go') {
          const did = popup.querySelector('#req-dest').value;
          closePopup();
          runRequest(src, findDevice(did));
        }
      });
      root.appendChild(popup);
      openPopup = popup;
    }

    function clearAnimationHighlights() {
      lastSendHighlights.forEach(({ el, origClass }) => { if (el) el.setAttribute('class', origClass); });
      lastSendHighlights = [];
      layerOverlay.querySelectorAll('.packet-dot, .send-tooltip').forEach(n => n.remove());
      hideExplain();
    }

    function runSendData(src, dst) {
      clearAnimationHighlights();
      // Failure pre-checks:
      if (src.type === 'tablet' || src.type === 'laptop') {
        const inRange = state.devices.some(w => w.type === 'wap' && inWapRange(src, w));
        if (!inRange && src.type === 'tablet') {
          setStatus('Tablet has no wireless signal — move it closer to a WAP.', 'bad');
          showExplain('Wireless signal needed',
            "Tablets don't have ethernet ports, so they can only join a network through a Wireless Access Point. " +
            "Move this tablet inside a WAP's signal area, or add a WAP nearby.");
          return;
        }
      }
      const path = bfs(src.id, dst.id);
      if (!path) { diagnoseNoRoute(src, dst); return; }
      animatePath(path, src, dst);
    }

    function diagnoseNoRoute(src, dst) {
      const srcLan = lanOf(src), dstLan = lanOf(dst);
      let msg = 'No route — destination is not connected to your network.';
      let title = 'No route', body = "There's no chain of wires (or wireless links) joining these two devices. Add a wire or fix a broken segment.";
      if (srcLan && dstLan && srcLan.id !== dstLan.id) {
        msg = 'These devices are in different LANs with no router linking them.';
        title = 'Different LANs';
        body = "Each LAN is its own little network. To send data between two LANs you need a router on each side with their internet uplinks turned on, or a direct router-to-router wire.";
      }
      if (src.type === 'wap') {
        const wired = state.wires.some(w => w.fromDevice === src.id || w.toDevice === src.id);
        if (!wired) { msg = 'WAP is not connected to a switch or router — nothing for it to forward to.'; }
      }
      if (srcLan && dstLan && srcLan.id !== dstLan.id) {
        const routers = state.devices.filter(d=>d.type==='router');
        const offRouter = routers.find(r => !r.internetOn);
        if (offRouter) {
          msg = `Router has no internet connection — packet can't reach other networks.`;
          title = 'Internet uplink off';
          body = "A router needs its internet uplink switched on to talk to routers in other LANs. Click the small toggle on the router to turn it on.";
        }
      }
      setStatus(msg, 'bad');
      showExplain(title, body);
    }

    function runRequest(src, server) {
      clearAnimationHighlights();
      if (src.type === 'tablet' || src.type === 'laptop') {
        const inRange = state.devices.some(w => w.type === 'wap' && inWapRange(src, w));
        if (!inRange && src.type === 'tablet') {
          setStatus('Tablet has no wireless signal — move it closer to a WAP.', 'bad');
          showExplain('Wireless signal needed',
            "Tablets don't have ethernet ports, so they can only join a network through a Wireless Access Point. " +
            "Move this tablet inside a WAP's signal area, or add a WAP nearby.");
          return;
        }
      }
      const path = bfs(src.id, server.id);
      if (!path) { diagnoseNoRoute(src, server); return; }
      animatePath(path, src, server, {
        packetClass: 'request',
        silent: true,
        onComplete: () => {
          showToast(`Request received by ${server.name}`, 'request');
          setTimeout(() => {
            showToast('Server responded', 'good');
            const back = reversePathWithEdges(path);
            animatePath(back, server, src, {
              packetClass: 'response',
              silent: true,
              onComplete: () => showToast(`Response received from ${server.name}`, 'good'),
            });
          }, 2000);
        },
      });
    }

    // Reverses a BFS path so each node's `.edge` represents the edge used to *arrive at* it
    // in the new traversal direction — required for animatePath to render the packet on the
    // actual wire instead of a straight line.
    function reversePathWithEdges(path) {
      const r = path.slice().reverse();
      return r.map((n, i) => ({
        id: n.id,
        edge: i === 0 ? null : r[i-1].edge,
      }));
    }

    function animatePath(path, src, dst, opts) {
      opts = opts || {};
      function nodePos(nodeId) {
        if (nodeId === INTERNET_ID) return internetCenterPos();
        const d = findDevice(nodeId);
        return { x: d.x + devW(d)/2, y: d.y + DEVICE_H/2 };
      }
      function routerCloudPos(routerId) {
        // Routers no longer have their own cloud — packet meets the shared cloud directly.
        return internetCenterPos();
      }
      function showInternetLabel() {
        const pos = internetCenterPos();
        const fo = document.createElementNS(SVG_NS,'foreignObject');
        fo.setAttribute('x', pos.x - 60);
        fo.setAttribute('y', pos.y - 14);
        fo.setAttribute('width', 120);
        fo.setAttribute('height', 28);
        fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="tooltip" style="text-align:center">Internet</div>`;
        layerOverlay.appendChild(fo);
        setTimeout(() => fo.remove(), 1600);
      }

      // Helper: find the rendered uplink-line path element for a router (if any).
      function uplinkEl(routerId) {
        return layerCloud.querySelector(`path.uplink-line[data-router-id="${routerId}"]`);
      }
      function uplinkEnd(el) {
        const total = el.getTotalLength();
        return el.getPointAtLength(total);
      }

      // Build segments. Wire hops follow their wire path; internet hops follow the
      // router's curved dashed uplink (in either direction), with a straight bridge
      // along the cloud bottom between two routers' anchors.
      const segs = [];
      for (let i = 1; i < path.length; i++) {
        const a = path[i-1], b = path[i];
        if (b.id === INTERNET_ID) {
          const el = uplinkEl(a.id);
          if (el) {
            const endPt = uplinkEnd(el);
            segs.push({
              from: nodePos(a.id),
              to: { x: endPt.x, y: endPt.y },
              pathEl: el, pathReverse: false,
            });
          } else {
            segs.push({ from: nodePos(a.id), to: internetCenterPos(), edge: null });
          }
        } else if (a.id === INTERNET_ID) {
          const prevRouter = path[i-2];
          const elA = uplinkEl(prevRouter.id);
          const elB = uplinkEl(b.id);
          // Bridge across the cloud bottom from one anchor to the other.
          if (elA && elB) {
            const aEnd = uplinkEnd(elA);
            const bEnd = uplinkEnd(elB);
            segs.push({
              from: { x: aEnd.x, y: aEnd.y },
              to:   { x: bEnd.x, y: bEnd.y },
            });
          } else {
            segs.push({ from: internetCenterPos(), to: internetCenterPos() });
          }
          // Follow B's uplink in reverse back down to the router.
          if (elB) {
            const bEnd = uplinkEnd(elB);
            segs.push({
              from: { x: bEnd.x, y: bEnd.y },
              to: nodePos(b.id),
              pathEl: elB, pathReverse: true,
            });
          } else {
            segs.push({ from: internetCenterPos(), to: nodePos(b.id), edge: null });
          }
        } else {
          segs.push({ from: nodePos(a.id), to: nodePos(b.id), edge: b.edge, fromId: a.id, toId: b.id });
        }
      }

      const dot = document.createElementNS(SVG_NS,'circle');
      dot.setAttribute('class', 'packet-dot' + (opts.packetClass ? ' ' + opts.packetClass : ''));
      dot.setAttribute('r', 6);
      layerOverlay.appendChild(dot);

      let segIdx = 0;
      // Constant packet speed in viewBox-units-per-second (px/sec). Picked so a typical
      // ~360px segment takes ~2000ms — the previous fixed per-hop duration.
      const PACKET_SPEED = 180;
      const MIN_SEG_MS = 220; // floor so very short hops don't blink past

      function highlightWire(edge, cls) {
        if (!edge || !edge.viaWireId) return;
        const el = layerWires.querySelector(`[data-wire-id="${edge.viaWireId}"]`);
        if (el) {
          const orig = el.getAttribute('class');
          lastSendHighlights.push({ el, origClass: orig });
          el.setAttribute('class', orig + ' ' + cls);
        }
      }

      function hubFlashAll(hubId) {
        const dg = layerDevices.querySelector(`[data-device-id="${hubId}"]`);
        if (!dg) return;
        dg.querySelectorAll('.port').forEach(p => {
          p.classList.add('flash-active');
          setTimeout(()=>p.classList.remove('flash-active'), 800);
        });
        // tooltip
        const d = findDevice(hubId);
        const tip = document.createElementNS(SVG_NS,'g');
        tip.setAttribute('class','send-tooltip');
        const fo = document.createElementNS(SVG_NS,'foreignObject');
        fo.setAttribute('x', d.x - 20);
        fo.setAttribute('y', d.y - 36);
        fo.setAttribute('width', 200);
        fo.setAttribute('height', 30);
        fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="tooltip">Hubs send to everyone — only the right device keeps the data.</div>`;
        tip.appendChild(fo);
        layerOverlay.appendChild(tip);
        setTimeout(()=>tip.remove(), 1800);
      }

      function hubBroadcast(hubId, acceptedDeviceId) {
        const wires = state.wires.filter(w => w.fromDevice === hubId || w.toDevice === hubId);
        wires.forEach(w => {
          const otherId = w.fromDevice === hubId ? w.toDevice : w.fromDevice;
          if (!otherId || otherId === acceptedDeviceId) return;
          const wireEl = layerWires.querySelector(`[data-wire-id="${w.id}"]`);
          if (!wireEl) return;
          const copy = document.createElementNS(SVG_NS,'circle');
          copy.setAttribute('class','packet-dot copy');
          copy.setAttribute('r', 5);
          layerOverlay.appendChild(copy);
          const total = wireEl.getTotalLength();
          const reverse = w.fromDevice !== hubId;
          const dur = Math.max(MIN_SEG_MS, (total / PACKET_SPEED) * 1000);
          const start = performance.now();
          function step(t) {
            const k = Math.min(1, (t - start)/dur);
            const dist = reverse ? total * (1 - k) : total * k;
            const pt = wireEl.getPointAtLength(dist);
            copy.setAttribute('cx', pt.x); copy.setAttribute('cy', pt.y);
            if (k < 1) requestAnimationFrame(step);
            else {
              copy.remove();
              flashReject(otherId);
            }
          }
          requestAnimationFrame(step);
        });
      }

      function flashReject(deviceId) {
        const dev = findDevice(deviceId);
        if (!dev) return;
        const w = devW(dev);
        const x = dev.x, y = dev.y;
        // Red X overlay
        const xg = document.createElementNS(SVG_NS,'g');
        xg.setAttribute('class','reject-x');
        const l1 = document.createElementNS(SVG_NS,'line');
        l1.setAttribute('x1', x+6);   l1.setAttribute('y1', y+6);
        l1.setAttribute('x2', x+w-6); l1.setAttribute('y2', y+DEVICE_H-6);
        const l2 = document.createElementNS(SVG_NS,'line');
        l2.setAttribute('x1', x+w-6); l2.setAttribute('y1', y+6);
        l2.setAttribute('x2', x+6);   l2.setAttribute('y2', y+DEVICE_H-6);
        xg.appendChild(l1); xg.appendChild(l2);
        layerOverlay.appendChild(xg);
        // Shake the device's inner group
        const dg = layerDevices.querySelector(`[data-device-id="${deviceId}"]`);
        if (dg) {
          dg.classList.add('rejecting');
          setTimeout(() => dg && dg.classList.remove('rejecting'), 500);
        }
        // "Rejected" tag under the label
        const tag = document.createElementNS(SVG_NS,'g');
        tag.setAttribute('class','reject-tag');
        const tx = x + w/2, ty = y + DEVICE_H + 30;
        const bg = document.createElementNS(SVG_NS,'rect');
        bg.setAttribute('x', tx - 34); bg.setAttribute('y', ty - 10);
        bg.setAttribute('width', 68); bg.setAttribute('height', 16);
        bg.setAttribute('rx', 4);
        const txt = document.createElementNS(SVG_NS,'text');
        txt.setAttribute('x', tx); txt.setAttribute('y', ty + 2);
        txt.setAttribute('text-anchor','middle');
        txt.textContent = 'Rejected';
        tag.appendChild(bg); tag.appendChild(txt);
        layerOverlay.appendChild(tag);
        setTimeout(() => { xg.remove(); tag.remove(); }, 1100);
      }

      function nextSeg() {
        if (segIdx >= segs.length) {
          dot.remove();
          if (!opts.silent) showToast('Transmission complete', 'good');
          if (typeof opts.onComplete === 'function') opts.onComplete();
          return;
        }
        const seg = segs[segIdx];
        const p1 = seg.from;
        const p2 = seg.to;
        highlightWire(seg.edge, 'success');
        // Hub-vs-switch teaching (only on real device-to-device segments)
        if (seg.fromId && seg.fromId !== INTERNET_ID) {
          const fromDev = findDevice(seg.fromId);
          if (fromDev && fromDev.type === 'hub') {
            hubFlashAll(fromDev.id);
            hubBroadcast(fromDev.id, seg.toId);
          }
        }
        // Determine which SVG path the packet should follow this segment.
        // Priority: explicit seg.pathEl (internet uplink) → wire path → straight line.
        let pathEl = seg.pathEl || null;
        let pathReverse = !!seg.pathReverse;
        if (!pathEl) {
          const wireId = seg.edge && seg.edge.viaWireId;
          if (wireId) {
            const wireEl = layerWires.querySelector(`[data-wire-id="${wireId}"]`);
            const wireObj = findWire(wireId);
            if (wireEl && wireObj) {
              pathEl = wireEl;
              pathReverse = seg.fromId ? (wireObj.fromDevice !== seg.fromId) : false;
            }
          }
        }
        const total = pathEl ? pathEl.getTotalLength() : 0;
        // Constant-speed timing: duration scales with the segment's actual length.
        const segLen = pathEl
          ? total
          : Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const segMs = Math.max(MIN_SEG_MS, (segLen / PACKET_SPEED) * 1000);
        dot.setAttribute('cx', p1.x); dot.setAttribute('cy', p1.y);
        const start = performance.now();
        function frame(t) {
          const k = Math.min(1, (t - start)/segMs);
          if (pathEl) {
            const dist = pathReverse ? total * (1 - k) : total * k;
            const pt = pathEl.getPointAtLength(dist);
            dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
          } else {
            dot.setAttribute('cx', p1.x + (p2.x - p1.x)*k);
            dot.setAttribute('cy', p1.y + (p2.y - p1.y)*k);
          }
          if (k < 1) requestAnimationFrame(frame);
          else { segIdx++; nextSeg(); }
        }
        requestAnimationFrame(frame);
      }
      nextSeg();
    }

    function showExplain(title, body) {
      hideExplain();
      const panel = document.createElement('div');
      panel.className = 'explain-panel';
      panel.innerHTML = `<button class="close">&times;</button><h4>${title}</h4><p>${body}</p>`;
      panel.querySelector('.close').addEventListener('click', hideExplain);
      root.appendChild(panel);
      requestAnimationFrame(() => panel.classList.add('visible'));
      openExplain = panel;
    }
    function hideExplain() {
      if (openExplain) { openExplain.remove(); openExplain = null; }
    }

    // -------- Toolbar wiring --------
    function setupToolbar() {
      const tb = root.querySelector('.toolbar') || document.querySelector('.toolbar');
      if (!tb) return;
      tb.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const tool = b.dataset.tool;
        switch (tool) {
          case 'new-lan':
            lanDrawMode = !lanDrawMode;
            b.classList.toggle('active', lanDrawMode);
            svg.classList.toggle('lan-draw', lanDrawMode);
            if (lanDrawMode) { deleteMode = false; svg.classList.remove('delete-mode'); document.querySelector('[data-tool="delete"]')?.classList.remove('active'); }
            break;
          case 'delete':
            deleteMode = !deleteMode;
            b.classList.toggle('active', deleteMode);
            svg.classList.toggle('delete-mode', deleteMode);
            if (deleteMode) { lanDrawMode = false; svg.classList.remove('lan-draw'); document.querySelector('[data-tool="new-lan"]')?.classList.remove('active'); }
            break;
          case 'undo': undo(); break;
          case 'redo': redo(); break;
          case 'export': exportPNG(); break;
          case 'clear': clearAll(); break;
        }
      });

      const zoomBar = root.querySelector('.zoom-controls');
      const zoomLabel = root.querySelector('#zoom-level');
      const ZOOM_MIN = 0.4, ZOOM_MAX = 2.0, ZOOM_STEP = 0.1;
      function applyZoom() {
        applyCanvasSize();
        if (zoomLabel) zoomLabel.textContent = Math.round(_zoomLevel * 100) + '%';
      }
      applyZoom();
      if (zoomBar) {
        zoomBar.addEventListener('click', (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          if (b.dataset.tool === 'zoom-in')  _zoomLevel = Math.min(ZOOM_MAX, +(_zoomLevel + ZOOM_STEP).toFixed(2));
          if (b.dataset.tool === 'zoom-out') _zoomLevel = Math.max(ZOOM_MIN, +(_zoomLevel - ZOOM_STEP).toFixed(2));
          applyZoom();
        });
      }
    }

    // -------- Export PNG --------
    function exportPNG() {
      const rect = svg.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      const clone = svg.cloneNode(true);
      clone.setAttribute('width', w); clone.setAttribute('height', h);
      // Set explicit background
      const bg = document.createElementNS(SVG_NS,'rect');
      bg.setAttribute('width', w); bg.setAttribute('height', h); bg.setAttribute('fill', '#0f172a');
      clone.insertBefore(bg, clone.firstChild);
      const xml = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(b);
          a.download = 'network.png';
          a.click();
        });
      };
      img.src = url;
    }

    // -------- Keyboard --------
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault(); redo();
      } else if (e.key === 'Escape') {
        closePopup(); hideExplain(); clearAnimationHighlights();
        if (activeWiring) { activeWiring.rubberEl.remove(); activeWiring = null; }
      }
    });

    // -------- Deep link / scenario --------
    function loadScenario(name) {
      const s = SCENARIOS[name];
      if (!s) return false;
      suppressSave = true;
      state.devices = JSON.parse(JSON.stringify(s.devices));
      state.wires = JSON.parse(JSON.stringify(s.wires));
      state.lans = JSON.parse(JSON.stringify(s.lans || []));
      state.looseEnds = [];
      // bump nextIds
      state.nextIds = {
        device: state.devices.length + 1,
        wire: state.wires.length + 1,
        lan: state.lans.length + 1,
      };
      suppressSave = false;
      render(); save();
      return true;
    }
    function loadStateB64(b64) {
      try {
        const json = atob(b64);
        suppressSave = true;
        restore(json);
        suppressSave = false;
        render(); save();
        return true;
      } catch(e) { return false; }
    }

    function loadInitialState(obj) {
      suppressSave = true;
      state.devices = JSON.parse(JSON.stringify(obj.devices || []));
      state.wires = JSON.parse(JSON.stringify(obj.wires || []));
      state.lans = JSON.parse(JSON.stringify(obj.lans || []));
      state.looseEnds = [];
      state.nextIds = {
        device: (state.devices.length + 1),
        wire: (state.wires.length + 1),
        lan: (state.lans.length + 1),
      };
      undoStack.length = 0; redoStack.length = 0;
      suppressSave = false;
      render();
    }

    // -------- Init sequence --------
    setupPalette();
    setupToolbar();

    // Query params
    const params = new URLSearchParams(location.search);
    let loaded = false;
    if (params.has('scenario')) loaded = loadScenario(params.get('scenario'));
    else if (params.has('state')) loaded = loadStateB64(params.get('state'));
    if (!loaded && mode === 'sandbox') loadPersist();

    render();
    setStatus('Ready. Drag a device from the palette to begin.');

    // Public API
    const api = {
      state,
      render,
      loadScenario,
      loadInitialState,
      reset() { state.devices = []; state.wires = []; state.lans = []; state.looseEnds = []; state.nextIds = { device:1, wire:1, lan:1 }; render(); save(); },
      reachableFrom,
      bfs,
      lanOf,
      buildGraph,
      findDevice,
      inWapRange,
      portCount,
      DEVICE_DEFS,
      setStatus,
      INTERNET_ID,
    };
    return api;
  }

  window.initSimulator = initSimulator;
  window.NetSim = { DEVICE_DEFS, PALETTE, makeIcon, SCENARIOS };
})();
