/* ============================================================
 *  Challenges — definitions + predicate-based checker
 *  Exposes: window.NetChallenges = { list, runChecks }
 * ============================================================ */
(function () {
  'use strict';

  // ---- Matcher helpers ----
  // A matcher is either { type } or { name } or { id } (or combination).
  function matches(d, m) {
    if (!d) return false;
    if (m.id && d.id !== m.id) return false;
    if (m.type && d.type !== m.type) return false;
    if (m.name && d.name !== m.name) return false;
    return true;
  }
  function findOne(sim, m) { return sim.state.devices.find(d => matches(d, m)); }
  function findAll(sim, m) { return sim.state.devices.filter(d => matches(d, m)); }

  // ---- LAN helpers ----
  // Challenges refer to LANs by the name students give the box, so groups can be
  // checked without making them rename every single device.
  function lanByName(sim, name) {
    return sim.state.lans.find(l => (l.name || '').trim().toLowerCase() === name.toLowerCase());
  }
  function devicesInLan(sim, lanName, m) {
    const lan = lanByName(sim, lanName);
    if (!lan) return [];
    return sim.state.devices.filter(d => {
      const dl = sim.lanOf(d);
      return dl && dl.id === lan.id && (!m || matches(d, m));
    });
  }

  // ---- Predicate library ----
  const checks = {
    deviceExists(sim, args) {
      const [m, count] = args;
      const found = findAll(sim, m);
      const need = count || 1;
      return found.length >= need;
    },
    deviceNamed(sim, [name]) {
      return !!findOne(sim, { name });
    },
    canReach(sim, [fromM, toM]) {
      const a = findOne(sim, fromM), b = findOne(sim, toM);
      if (!a || !b) return false;
      return sim.reachableFrom(a.id).has(b.id);
    },
    allCanReach(sim, [fromM, toM]) {
      const list = findAll(sim, fromM);
      if (!list.length) return false;
      const t = findOne(sim, toM);
      if (!t) return false;
      return list.every(d => sim.reachableFrom(d.id).has(t.id));
    },
    inSameLan(sim, [aM, bM]) {
      const a = findOne(sim, aM), b = findOne(sim, bM);
      if (!a || !b) return false;
      const la = sim.lanOf(a), lb = sim.lanOf(b);
      return la && lb && la.id === lb.id;
    },
    inDifferentLans(sim, [aM, bM]) {
      const a = findOne(sim, aM), b = findOne(sim, bM);
      if (!a || !b) return false;
      const la = sim.lanOf(a), lb = sim.lanOf(b);
      return la && lb && la.id !== lb.id;
    },
    internetReachable(sim, [m]) {
      const d = findOne(sim, m);
      if (!d) return false;
      return sim.reachableFrom(d.id).has(sim.INTERNET_ID);
    },
    noPortOverflows(sim) {
      // wires reference valid ports; sim's own model never adds overflows on its own,
      // so just confirm wires' portIdx within range.
      for (const w of sim.state.wires) {
        if (w.fromDevice) {
          const d = sim.findDevice(w.fromDevice);
          if (!d || w.fromPort >= sim.portCount(d)) return false;
        }
        if (w.toDevice) {
          const d = sim.findDevice(w.toDevice);
          if (!d || w.toPort >= sim.portCount(d)) return false;
        }
      }
      return true;
    },
    wirelessActive(sim, [m]) {
      const d = findOne(sim, m);
      if (!d) return false;
      if (d.type !== 'laptop' && d.type !== 'tablet') return false;
      return sim.state.devices.some(w => w.type === 'wap' && sim.inWapRange(d, w));
    },
    cannotReach(sim, [fromM, toM]) {
      const froms = findAll(sim, fromM);
      const tos   = findAll(sim, toM);
      if (!froms.length || !tos.length) return true;
      return froms.every(a => {
        const reach = sim.reachableFrom(a.id);
        return tos.every(b => !reach.has(b.id));
      });
    },
    deviceAbsent(sim, [m]) {
      return findAll(sim, m).length === 0;
    },
    deviceCountExact(sim, [m, n]) {
      return findAll(sim, m).length === n;
    },
    deviceCountMax(sim, [m, n]) {
      return findAll(sim, m).length <= n;
    },
    allInternetReachable(sim, [m]) {
      const list = findAll(sim, m);
      if (!list.length) return false;
      return list.every(d => sim.reachableFrom(d.id).has(sim.INTERNET_ID));
    },
    allWirelessActive(sim, [m]) {
      const list = findAll(sim, m);
      if (!list.length) return false;
      return list.every(d =>
        sim.state.devices.some(w => w.type === 'wap' && sim.inWapRange(d, w)));
    },
    noneInternetReachable(sim, [m]) {
      const list = findAll(sim, m);
      if (!list.length) return false;
      return list.every(d => !sim.reachableFrom(d.id).has(sim.INTERNET_ID));
    },
    // ---- LAN-aware checks ----
    lanExists(sim, [name]) {
      return !!lanByName(sim, name);
    },
    lanHasCount(sim, [lanName, m, n]) {
      return devicesInLan(sim, lanName, m).length === n;
    },
    lanAllReach(sim, [lanName, m, targetM]) {
      const list = devicesInLan(sim, lanName, m);
      const t = findOne(sim, targetM);
      if (!list.length || !t) return false;
      return list.every(d => sim.reachableFrom(d.id).has(t.id));
    },
    lanAllInternet(sim, [lanName, m]) {
      const list = devicesInLan(sim, lanName, m);
      if (!list.length) return false;
      return list.every(d => sim.reachableFrom(d.id).has(sim.INTERNET_ID));
    },
    lanNoneInternet(sim, [lanName, m]) {
      const list = devicesInLan(sim, lanName, m);
      if (!list.length) return false;
      return list.every(d => !sim.reachableFrom(d.id).has(sim.INTERNET_ID));
    },
    lanNoneReach(sim, [lanName, m, targetM]) {
      const list = devicesInLan(sim, lanName, m);
      const t = findOne(sim, targetM);
      if (!list.length || !t) return false;
      return list.every(d => !sim.reachableFrom(d.id).has(t.id));
    },
    // Devices must be spread at least `minDx` apart horizontally. Used instead of
    // naming equipment: a room wider than one WAP's coverage forces the student
    // to work out for themselves that a second access point is needed.
    spreadAtLeast(sim, [m, minDx]) {
      const list = findAll(sim, m);
      if (list.length < 2) return false;
      const xs = list.map(d => d.x);
      return (Math.max(...xs) - Math.min(...xs)) >= minDx;
    },
    lanAllReachLan(sim, [fromLan, fromM, toLan, toM]) {
      const froms = devicesInLan(sim, fromLan, fromM);
      const tos   = devicesInLan(sim, toLan, toM);
      if (!froms.length || !tos.length) return false;
      return froms.every(a => {
        const reach = sim.reachableFrom(a.id);
        return tos.every(b => reach.has(b.id));
      });
    },
  };

  function runChecks(sim, challenge) {
    for (const c of challenge.checks) {
      const ok = checks[c.fn](sim, c.args || []);
      if (!ok) return { ok: false, msg: c.failMsg };
    }
    return { ok: true };
  }

  // ---- Challenge list ----
  // Every challenge starts from an EMPTY canvas and specifies only the END
  // DEVICES (computers, laptops, tablets, printers, servers) plus the outcomes
  // that must work. Choosing the network equipment — switches, hubs, routers,
  // WAPs, how many and where — is deliberately left to the student.
  const EMPTY = { devices: [], wires: [], lans: [] };
  const CHOOSE = 'Work out for yourself what network equipment is needed, how much of it, and how to wire it.';

  const list = [
    // ================= Starter =================
    {
      id: 'starter-1',
      title: 'Home network',
      difficulty: 'Starter',
      brief: 'A family wants to be able to print from any computer in the house and get online. Build the whole network from an empty canvas.',
      requirements: [
        'Exactly 3 computers',
        'Exactly 1 printer',
        'Every computer can reach the printer',
        'Every computer can reach the Internet',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'deviceCountExact', args:[{type:'computer'}, 3], failMsg:'You need exactly 3 computers.' },
        { fn:'deviceCountExact', args:[{type:'printer'}, 1], failMsg:'You need exactly 1 printer.' },
        { fn:'allCanReach', args:[{type:'computer'}, {type:'printer'}], failMsg:'Not every computer can reach the printer — check your wiring and that you have enough free ports.' },
        { fn:'allInternetReachable', args:[{type:'computer'}], failMsg:"Not every computer can reach the Internet yet. What piece of equipment connects a network to the outside world — and is its uplink switched on?" },
      ]
    },
    {
      id: 'starter-2',
      title: 'Café Wi-Fi',
      difficulty: 'Starter',
      brief: 'A café wants customers to get online. Remember: tablets have no network socket at all, and customers will not plug cables into their laptops.',
      requirements: [
        'Exactly 3 laptops and exactly 2 tablets',
        'None of them may be joined with a cable — every one connects wirelessly',
        'All 5 devices can reach the Internet',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'deviceCountExact', args:[{type:'laptop'}, 3], failMsg:'You need exactly 3 laptops.' },
        { fn:'deviceCountExact', args:[{type:'tablet'}, 2], failMsg:'You need exactly 2 tablets.' },
        { fn:'allWirelessActive', args:[{type:'laptop'}], failMsg:'At least one laptop has no wireless signal — what equipment broadcasts a signal, and is the laptop inside its coverage circle?' },
        { fn:'allWirelessActive', args:[{type:'tablet'}], failMsg:'At least one tablet has no wireless signal — move it inside a coverage circle.' },
        { fn:'allInternetReachable', args:[{type:'laptop'}], failMsg:"A laptop still can't reach the Internet — trace the path from the laptop all the way out." },
        { fn:'allInternetReachable', args:[{type:'tablet'}], failMsg:"A tablet still can't reach the Internet." },
      ]
    },
    {
      id: 'starter-3',
      title: 'Two rooms, one network',
      difficulty: 'Starter',
      brief: 'Two classrooms at opposite ends of a corridor need to share one server. Place the computers in two clearly separate groups — one group on the left of the canvas, one on the right — and join everything into a single network. This school has no internet connection at all.',
      requirements: [
        'Exactly 4 computers and exactly 1 server',
        'The computers form two groups at opposite ends of the canvas (at least 600 apart)',
        'All 4 computers can reach the server',
        'NO computer may reach the Internet',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'deviceCountExact', args:[{type:'computer'}, 4], failMsg:'You need exactly 4 computers.' },
        { fn:'deviceCountExact', args:[{type:'server'}, 1], failMsg:'You need exactly 1 server.' },
        { fn:'spreadAtLeast', args:[{type:'computer'}, 600], failMsg:'Your computers are all bunched together — spread the two rooms to opposite ends of the canvas.' },
        { fn:'allCanReach', args:[{type:'computer'}, {type:'server'}], failMsg:'Not every computer can reach the server — how do you join equipment in one room to equipment in the other?' },
        { fn:'noneInternetReachable', args:[{type:'computer'}], failMsg:'A computer can reach the Internet — this network is meant to be entirely local.' },
      ]
    },

    // ================= Intermediate =================
    {
      id: 'inter-1',
      title: 'ICT suite for 12',
      difficulty: 'Intermediate',
      brief: 'Wire up a full ICT suite. Think carefully about port counts before you start — and remember every device you add uses one up.',
      requirements: [
        'Exactly 12 computers',
        'Exactly 1 printer and exactly 1 server',
        'All 12 computers can reach the printer AND the server',
        'All 12 computers can reach the Internet',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'deviceCountExact', args:[{type:'computer'}, 12], failMsg:'You need exactly 12 computers.' },
        { fn:'deviceCountExact', args:[{type:'printer'}, 1], failMsg:'You need exactly 1 printer.' },
        { fn:'deviceCountExact', args:[{type:'server'}, 1], failMsg:'You need exactly 1 server.' },
        { fn:'allCanReach', args:[{type:'computer'}, {type:'printer'}], failMsg:'Not every computer can reach the printer — have you run out of ports somewhere?' },
        { fn:'allCanReach', args:[{type:'computer'}, {type:'server'}], failMsg:'Not every computer can reach the server.' },
        { fn:'allInternetReachable', args:[{type:'computer'}], failMsg:'Not every computer can reach the Internet.' },
      ]
    },
    {
      id: 'inter-2',
      title: 'Wireless across the school hall',
      difficulty: 'Intermediate',
      brief: 'The school hall is very wide, and wireless signal only reaches so far. Spread the wireless devices right across the canvas — from the far left to the far right — and make sure every single one still gets a signal and gets online.',
      requirements: [
        'Exactly 6 laptops and exactly 2 tablets',
        'The laptops must be spread right across the hall (at least 800 apart, left to right)',
        'Every laptop and tablet has a wireless signal',
        'Every laptop and tablet can reach the Internet',
        'Exactly 1 printer, which every laptop can reach',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'deviceCountExact', args:[{type:'laptop'}, 6], failMsg:'You need exactly 6 laptops.' },
        { fn:'deviceCountExact', args:[{type:'tablet'}, 2], failMsg:'You need exactly 2 tablets.' },
        { fn:'deviceCountExact', args:[{type:'printer'}, 1], failMsg:'You need exactly 1 printer.' },
        { fn:'spreadAtLeast', args:[{type:'laptop'}, 800], failMsg:'The laptops are too close together — spread them right across the width of the hall.' },
        { fn:'allWirelessActive', args:[{type:'laptop'}], failMsg:'A laptop is outside every coverage circle. One signal may not stretch across the whole hall — what could you do about that?' },
        { fn:'allWirelessActive', args:[{type:'tablet'}], failMsg:'A tablet has no wireless signal.' },
        { fn:'allInternetReachable', args:[{type:'laptop'}], failMsg:"A laptop has a signal but still can't reach the Internet — is everything wired back to the rest of the network?" },
        { fn:'allInternetReachable', args:[{type:'tablet'}], failMsg:"A tablet can't reach the Internet." },
        { fn:'allCanReach', args:[{type:'laptop'}, {type:'printer'}], failMsg:'Not every laptop can reach the printer.' },
      ]
    },
    {
      id: 'inter-3',
      title: 'Two offices, one company (WAN)',
      difficulty: 'Intermediate',
      brief: 'A company has an office in London and one in Manchester. Build both local networks and join them into a WAN. Use the "New LAN" tool to draw a box around each office, then double-click each label and rename the boxes to exactly "London" and "Manchester".',
      requirements: [
        'A LAN box named exactly "London" and another named exactly "Manchester"',
        'Exactly 3 computers inside each office box (6 in total)',
        'All 3 London computers can reach the Internet',
        'All 3 Manchester computers can reach the Internet',
        'Every London computer can reach every Manchester computer — that is what makes it a WAN',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'lanExists', args:['London'], failMsg:'No LAN box named "London" — draw one with New LAN, then double-click its label to rename it.' },
        { fn:'lanExists', args:['Manchester'], failMsg:'No LAN box named "Manchester".' },
        { fn:'lanHasCount', args:['London', {type:'computer'}, 3], failMsg:'The London box must contain exactly 3 computers (they must sit inside the box).' },
        { fn:'lanHasCount', args:['Manchester', {type:'computer'}, 3], failMsg:'The Manchester box must contain exactly 3 computers.' },
        { fn:'lanAllInternet', args:['London', {type:'computer'}], failMsg:"A London computer can't reach the Internet." },
        { fn:'lanAllInternet', args:['Manchester', {type:'computer'}], failMsg:"A Manchester computer can't reach the Internet." },
        { fn:'lanAllReachLan', args:['London', {type:'computer'}, 'Manchester', {type:'computer'}], failMsg:'The two offices cannot reach each other yet — how does data get from one LAN to a LAN in another city?' },
      ]
    },

    // ================= Advanced =================
    {
      id: 'adv-1',
      title: 'Secure records room',
      difficulty: 'Advanced',
      brief: 'A doctors\' surgery needs two networks in one building. The Records network holds patient data and must be completely cut off from the outside world. Reception needs the internet and a shared printer. Draw and name a LAN box for each, exactly "Records" and "Reception".',
      requirements: [
        'A LAN box named exactly "Records" and one named exactly "Reception"',
        'Records: exactly 3 computers and exactly 1 server',
        'All 3 Records computers can reach the Records server',
        'NO Records computer may reach the Internet',
        'Reception: exactly 4 computers and exactly 1 printer',
        'All 4 Reception computers can reach the printer and the Internet',
        'NO Reception computer may reach the Records server',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'lanExists', args:['Records'], failMsg:'No LAN box named "Records".' },
        { fn:'lanExists', args:['Reception'], failMsg:'No LAN box named "Reception".' },
        { fn:'lanHasCount', args:['Records', {type:'computer'}, 3], failMsg:'The Records box must contain exactly 3 computers.' },
        { fn:'lanHasCount', args:['Records', {type:'server'}, 1], failMsg:'The Records box must contain exactly 1 server.' },
        { fn:'lanHasCount', args:['Reception', {type:'computer'}, 4], failMsg:'The Reception box must contain exactly 4 computers.' },
        { fn:'lanHasCount', args:['Reception', {type:'printer'}, 1], failMsg:'The Reception box must contain exactly 1 printer.' },
        { fn:'lanAllReach', args:['Records', {type:'computer'}, {type:'server'}], failMsg:'A Records computer cannot reach the Records server.' },
        { fn:'lanNoneInternet', args:['Records', {type:'computer'}], failMsg:'A Records computer can reach the Internet — this network is supposed to be cut off. What is providing that route?' },
        { fn:'lanAllInternet', args:['Reception', {type:'computer'}], failMsg:'A Reception computer has no Internet.' },
        { fn:'lanAllReach', args:['Reception', {type:'computer'}, {type:'printer'}], failMsg:'A Reception computer cannot reach the printer.' },
        { fn:'lanNoneReach', args:['Reception', {type:'computer'}, {type:'server'}], failMsg:'A Reception computer can still reach the Records server — the two networks must stay completely separate.' },
      ]
    },
    {
      id: 'adv-2',
      title: 'Guest Wi-Fi done properly',
      difficulty: 'Advanced',
      brief: 'A business wants guest Wi-Fi that gets visitors online without letting them anywhere near the company file server. Draw and name two LAN boxes, exactly "Staff" and "Guest", and think hard about what internet access does to isolation.',
      requirements: [
        'A LAN box named exactly "Staff" and one named exactly "Guest"',
        'Staff: exactly 5 computers, exactly 1 server and exactly 1 printer',
        'All 5 Staff computers can reach the Staff server and the Staff printer',
        'NO Staff computer may reach the Internet',
        'Guest: exactly 4 laptops, all joined without cables',
        'All 4 Guest laptops have a wireless signal and can reach the Internet',
        'NO Guest laptop may reach the Staff server',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'lanExists', args:['Staff'], failMsg:'No LAN box named "Staff".' },
        { fn:'lanExists', args:['Guest'], failMsg:'No LAN box named "Guest".' },
        { fn:'lanHasCount', args:['Staff', {type:'computer'}, 5], failMsg:'The Staff box must contain exactly 5 computers.' },
        { fn:'lanHasCount', args:['Staff', {type:'server'}, 1], failMsg:'The Staff box must contain exactly 1 server.' },
        { fn:'lanHasCount', args:['Staff', {type:'printer'}, 1], failMsg:'The Staff box must contain exactly 1 printer.' },
        { fn:'lanHasCount', args:['Guest', {type:'laptop'}, 4], failMsg:'The Guest box must contain exactly 4 laptops.' },
        { fn:'lanAllReach', args:['Staff', {type:'computer'}, {type:'server'}], failMsg:'A Staff computer cannot reach the Staff server.' },
        { fn:'lanAllReach', args:['Staff', {type:'computer'}, {type:'printer'}], failMsg:'A Staff computer cannot reach the Staff printer.' },
        { fn:'lanNoneInternet', args:['Staff', {type:'computer'}], failMsg:'A Staff computer can reach the Internet — and that is exactly the route a guest could follow back to the server.' },
        { fn:'allWirelessActive', args:[{type:'laptop'}], failMsg:'A Guest laptop has no wireless signal.' },
        { fn:'lanAllInternet', args:['Guest', {type:'laptop'}], failMsg:'A Guest laptop has no Internet.' },
        { fn:'lanNoneReach', args:['Guest', {type:'laptop'}, {type:'server'}], failMsg:'A Guest laptop can still reach the Staff server.' },
      ]
    },
    {
      id: 'adv-3',
      title: 'Design a whole school network',
      difficulty: 'Advanced',
      brief: 'The biggest build. Design a school network with three areas, each drawn as its own named LAN box: "Lab A", "Lab B" and "Admin". The two labs share resources across the school, while Admin keeps its records server off the wider network entirely. Read every requirement before you place a single device.',
      requirements: [
        'Three LAN boxes named exactly "Lab A", "Lab B" and "Admin"',
        'Lab A: exactly 8 computers and exactly 1 printer',
        'Lab B: exactly 6 laptops, all joined without cables and spread across the room (at least 400 apart)',
        'Admin: exactly 3 computers and exactly 1 server',
        'All 8 Lab A computers reach the Lab A printer and the Internet',
        'All 6 Lab B laptops have a wireless signal and reach the Internet',
        'Every Lab A computer can reach every Lab B laptop',
        'All 3 Admin computers reach the Admin server, but NO Admin computer may reach the Internet',
        'NO Lab A or Lab B device may reach the Admin server',
        CHOOSE
      ],
      initialState: EMPTY,
      checks: [
        { fn:'lanExists', args:['Lab A'], failMsg:'No LAN box named "Lab A".' },
        { fn:'lanExists', args:['Lab B'], failMsg:'No LAN box named "Lab B".' },
        { fn:'lanExists', args:['Admin'], failMsg:'No LAN box named "Admin".' },
        { fn:'lanHasCount', args:['Lab A', {type:'computer'}, 8], failMsg:'Lab A must contain exactly 8 computers.' },
        { fn:'lanHasCount', args:['Lab A', {type:'printer'}, 1], failMsg:'Lab A must contain exactly 1 printer.' },
        { fn:'lanHasCount', args:['Lab B', {type:'laptop'}, 6], failMsg:'Lab B must contain exactly 6 laptops.' },
        { fn:'lanHasCount', args:['Admin', {type:'computer'}, 3], failMsg:'Admin must contain exactly 3 computers.' },
        { fn:'lanHasCount', args:['Admin', {type:'server'}, 1], failMsg:'Admin must contain exactly 1 server.' },
        { fn:'spreadAtLeast', args:[{type:'laptop'}, 400], failMsg:'The Lab B laptops are bunched together — spread them across the room.' },
        { fn:'lanAllReach', args:['Lab A', {type:'computer'}, {type:'printer'}], failMsg:'A Lab A computer cannot reach the Lab A printer — check for a bottleneck or a full set of ports.' },
        { fn:'lanAllInternet', args:['Lab A', {type:'computer'}], failMsg:'A Lab A computer has no Internet.' },
        { fn:'allWirelessActive', args:[{type:'laptop'}], failMsg:'A Lab B laptop has no wireless signal — one coverage circle may not be enough for the whole room.' },
        { fn:'lanAllInternet', args:['Lab B', {type:'laptop'}], failMsg:'A Lab B laptop has no Internet.' },
        { fn:'lanAllReachLan', args:['Lab A', {type:'computer'}, 'Lab B', {type:'laptop'}], failMsg:'Lab A and Lab B cannot reach each other.' },
        { fn:'lanAllReach', args:['Admin', {type:'computer'}, {type:'server'}], failMsg:'An Admin computer cannot reach the Admin server.' },
        { fn:'lanNoneInternet', args:['Admin', {type:'computer'}], failMsg:'An Admin computer can reach the Internet — Admin must stay isolated.' },
        { fn:'lanNoneReach', args:['Lab A', {type:'computer'}, {type:'server'}], failMsg:'A Lab A computer can still reach the Admin server.' },
        { fn:'lanNoneReach', args:['Lab B', {type:'laptop'}, {type:'server'}], failMsg:'A Lab B laptop can still reach the Admin server.' },
      ]
    },
  ];

  window.NetChallenges = { list, runChecks };
})();
