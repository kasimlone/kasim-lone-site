# Network Simulator Page — Plan

## Context
The user is building a Year 9 networking lessons site. They want an interactive page where students can build a network by dragging device icons onto a canvas and wiring them together. The goal is a hands-on simulator that reinforces lesson concepts: device roles, ports, wired vs wireless, and how WAPs provide wireless coverage. The directory is currently empty (greenfield).

The simulator should be approachable for 13–14 year olds: simple visuals, immediate feedback, no jargon walls. It should also be realistic enough to teach real concepts — particularly that devices have a finite number of ports and that wireless requires being in range of a WAP.

## Tech choice
Single static HTML file: vanilla JS + inline SVG, no build step. Easy to host anywhere (GitHub Pages, Vercel static, or alongside existing lesson HTML). SVG handles both icons and wire rendering cleanly; pointer events handle drag/drop naturally.

## Layout
- **Left palette** — draggable device icons: Computer, Laptop, Tablet, Printer, WAP, Switch, Hub, Router.
- **Main canvas (SVG)** — devices and wires render here. Pan not needed; fixed canvas size.
- **Toolbar** — Delete mode toggle, Clear all, Export/Import JSON (optional).
- **Status bar** — shows hovered/selected device info and validation messages (e.g. "Laptop has 1/1 ports used").

## Devices and port limits
| Device | Wired ports | Wireless |
|---|---|---|
| Computer | 1 | — |
| Laptop | 1 | yes |
| Tablet | 0 | yes only |
| Printer | 1 | — |
| WAP | 1 (uplink) | broadcasts |
| Hub | configurable (4 / 8 / 16) | — |
| Switch | configurable (4 / 8 / 16 / 24) | — |
| Router | 4 LAN (standard) + Internet uplink | — |
| Server | 1 | — |

**Port count selection for Hub / Switch:** when a student drags a hub or switch onto the canvas, a small inline popup asks "How many ports?" with the choices above (default 8 for switch, 4 for hub). The chosen count determines how many port dots render. They can also right-click an existing hub/switch to change its port count (existing wires beyond the new limit get removed with a confirmation).

**Router internet uplink:** every router renders with a small cloud icon attached above it labelled "Internet", joined by a dashed line. Each router has a toggle (small button on the router) to disconnect from the internet — when off, the dashed line greys out.

**Internet cloud as a real routing node:** the shared "Internet" cloud is a single backbone node in the routing graph. Any two routers whose internet uplink is on are peered through it. This means a packet from a device in LAN-A can reach a device in LAN-B via: source → switch → router-A → Internet → router-B → switch → destination. If either router's uplink is off, the send fails with *"Router has no internet connection — packet can't reach other networks."*

## Connection mechanics
**Drag-to-connect with visible ports.**
1. Each device renders with small port dots on its edges. Filled = in use, empty = free.
2. Pressing on a free port starts a wire — a rubber-band line follows the cursor.
3. Releasing over another device's free port creates the wire; releasing elsewhere cancels.
4. Wires anchor to specific ports and follow when devices are dragged.
5. Attempting to start a wire from a full port: port flashes red, status bar shows e.g. *"Switch port already used."*

**Hub vs switch visualisation during packet send:**
- When the packet passes through a **switch**, only the destination-side port lights up — the switch forwards intelligently.
- When the packet passes through a **hub**, *all* of the hub's connected ports flash briefly as the packet arrives, then only the destination keeps it. A small tooltip near the hub says *"Hubs send to everyone — only the right device keeps the data."*
- This single visual contrast is the main teaching moment for the hub-vs-switch distinction.

**Wireless (WAP):**
- Each WAP shows a translucent coverage circle.
- Any wireless-capable device (laptop, tablet) inside a WAP's circle gets an automatic dashed link.
- Links appear / disappear live as devices are dragged in / out of range.
- No manual wireless wiring step.

**Repositioning:** dragging a device (not from a port) moves it; all attached wires follow. Positions snap to a 20 px grid so builds stay tidy.

**Undo / Redo:** Ctrl-Z / Ctrl-Shift-Z (and toolbar buttons) revert and re-apply recent changes (add device, delete, wire, move, rename, port-count change, LAN create/resize). History stack capped at ~50 steps and stored in memory only (not persisted).

**Deleting:** Delete-mode toggle in toolbar; clicking a device or wire while in delete mode removes it.

**Loose cables when a device is deleted:** removing a device unplugs its end of every attached wire but leaves the wire plugged into the *other* device, with the free end dangling near where the deleted device used to be. The student can grab that free end and plug it into another port, or delete the wire itself. A wire whose both ends are loose is removed automatically.

**Right-click / long-press context menu** on any device: Rename, Send data (end-devices only), Disconnect all, Delete. Faster than the click-popup once students are fluent; long-press is the touch equivalent for iPad.

**Wire styling by type:** solid grey = wired ethernet, dashed teal (`--accent`) = wireless link, dashed indigo (`--accent-2`) = router-to-Internet uplink. Green during a successful packet animation, red on a failed segment — colour transitions overlay the base style.

**Device status light:** every device renders with a tiny LED dot in the corner.
- Off (grey): no live connections.
- Amber: wired but no working path to any other device.
- Green: has a reachable route to at least one other device.
Recomputed live as wires / devices / WAP coverage / internet toggles change — gives instant feedback before the student even hits Send data.

## LANs and WANs (grouping)
Students can group devices into LANs and see WANs form when routers link LANs.

- **Create LAN:** toolbar button "New LAN" → student drags a rectangle on the canvas. The rectangle is a labelled box (default "LAN 1", "LAN 2"… — renameable by double-clicking the label).
- **Membership:** any device whose centre sits inside a LAN box belongs to that LAN. Dragging a device into / out of a box updates membership live. LAN boxes can be moved as a group (drag the label/border), and all member devices move with them.
- **Resizing:** LAN boxes auto-grow to fit their devices with a small padding, and can also be resized manually via corner handles.
- **WAN auto-formation:** when a router has at least one wired link to a device inside LAN A *and* at least one wired link to a device inside LAN B (typically router-to-router or router-to-switch in each LAN), the simulator renders a larger dashed "WAN" box that encloses both LAN boxes and the linking router(s). The WAN box is read-only — it appears/disappears automatically as connections change.
- Multiple connected LANs all sit inside the same WAN box. A LAN with no external router link gets no WAN box around it.
- Visual styling: LAN = solid thin border with coloured label tab; WAN = larger dashed border with "WAN" label.

## Export PNG
Toolbar button "Export image" — renders the current canvas (devices, wires, LAN/WAN boxes, status lights, internet cloud) to a PNG via an offscreen `<canvas>` and triggers a download. Useful for homework submission and pasting into worksheets. Background is the dotted grid so the export reads cleanly on a white page too.

## Lesson deep-links
Both `index.html` and `challenges.html` accept query-string parameters so the lesson pages can embed *"try it"* links:
- `?scenario=<id>` loads a named pre-built network from a small map of demo scenarios bundled with the simulator (e.g. `switch-vs-hub`, `wap-coverage`, `two-lans-internet`).
- `?challenge=<id>` on the challenges page jumps straight to a specific challenge.
- `?state=<base64-json>` loads an arbitrary saved network (for sharing a build).
The lesson pages can link with e.g. `<a href="../Network Simulator/index.html?scenario=switch-vs-hub">Try it</a>`.

## Touch / iPad support
Use pointer events (`pointerdown` / `pointermove` / `pointerup`) throughout so drag, wire, and reposition all work identically on mouse, trackpad, and touch. No hover-only affordances — anything reachable via hover (port highlight, device popup) must also be reachable via a tap. Palette icons and toolbar buttons sized ≥ 44 px so they're comfortable on iPad.

## Send data (packet simulation)
The headline interactive feature — students can send a packet from any end-device and watch the route.

- **Trigger:** clicking a Computer, Laptop, Tablet, or Server opens a small popup with a "Send data" button (alongside Rename and Delete).
- **Choose destination:** a dropdown lists every other device on the canvas, grouped by LAN, with their custom names (e.g. *"Printer — Office LAN"*, *"Laptop 2 — Classroom LAN"*). Selecting one starts the simulation.
- **Route finding:** BFS over the network graph. Nodes = devices; edges = wires plus active wireless links (laptop/tablet within a WAP's coverage). Routers bridge LANs; switches/hubs pass through.
- **Success animation:** the path is drawn segment by segment in green, with a small glowing packet dot travelling from source to destination along each segment in turn. On arrival the destination device pulses green briefly. Status bar shows e.g. *"Packet delivered: Laptop 1 → WAP → Switch → Printer (4 hops)"*.
- **Failure animation:** the partial route is drawn, then the failing segment / destination flashes red. Status bar shows a plain-English reason:
  - *"No route — destination is not connected to your network."*
  - *"Tablet has no wireless signal — move it closer to a WAP."*
  - *"This device is in a different LAN with no router linking them."*
  - *"WAP is not connected to a switch or router — nothing for it to forward to."*
- The student can click "Send data" again any time; previous highlights clear automatically.
- **Expanded failure explanation:** alongside the one-line status, a small panel slides in with a 2-sentence plain-English explanation tied to the relevant networking concept (e.g. *"Tablets don't have ethernet ports, so they can only join a network through a Wireless Access Point. Move this tablet inside a WAP's signal area, or add a WAP nearby."*). One panel template per failure category; dismissable.

## Renaming devices
Every device shows a small label underneath (default *"Computer 1"*, *"Laptop 2"*, etc.). Double-clicking the label (or choosing Rename from the device popup) makes it editable inline. Names persist with the device in localStorage and are used in the "Send data" destination list and routing messages.

## Data model
```js
{
  devices: [{ id, type, x, y, name, portCount? }],   // portCount for hub/switch
  wires:   [{ id, fromDevice, fromPort, toDevice, toPort }],
  lans:    [{ id, name, x, y, w, h }]          // WANs are derived, not stored
}
```
Persist to `localStorage` on every change so refresh doesn't lose work.

## Validation (lightweight, educational)
Status bar messages only — never blocks the student. Examples:
- Port full warnings.
- "Tablet has no ethernet — connect through a WAP."
- Optional "Validate network" button that flags isolated devices.

## Visual design
- **Theme:** lifted directly from `networks-year-9/Lesson 1/styles.css` so the simulator feels like another lesson page. Reuse the same CSS custom properties:
  - `--bg: #0f172a`, `--bg-2: #111c36`, `--panel: #1a2547` — page / canvas / palette backgrounds.
  - `--ink: #e8eefc`, `--ink-dim: #9aa8c7` — primary / secondary text.
  - `--accent: #5eead4` (mint/teal) — primary accent, wire highlights, LAN border, success state.
  - `--accent-2: #818cf8` (indigo) — secondary accent, WAN border, "Internet" cloud link.
  - `--good: #34d399`, `--warn: #fbbf24`, `--bad: #f87171` — packet success / port-warning / failed-route states.
  - `--line: rgba(255,255,255,0.08)` — subtle dividers and inactive port outlines.
  - `--radius: 14px` for panels, `8px` for buttons; system font stack; "SF Mono" for any monospace labels.
  - Buttons styled as the existing `.btn` and `.btn.ghost` classes; toolbar inherits the `.panel` look.
- **Icons:** flat outline SVG, inline in the HTML. Single accent stroke colour pulled from the theme; ~48×48 px on the canvas, ~40×40 px in the palette. Devices designed to be instantly recognisable at small sizes:
  - **Computer** — monitor on a stand.
  - **Laptop** — open clamshell silhouette.
  - **Tablet** — rounded rectangle with thin bezel.
  - **Printer** — body with paper tray on top.
  - **WAP** — puck with radiating arcs above.
  - **Switch** — wide rectangle with a row of small port squares.
  - **Hub** — similar to switch but shorter, fewer ports, slightly different accent to distinguish.
  - **Router** — rectangle with two small antennas and the dashed line up to the "Internet" cloud.
  - **Internet cloud** — simple cloud outline labelled "Internet".
  - **Server** — tower shape with a stack of horizontal slots; default name *"Server 1"*, renameable to e.g. *"Web Server"* / *"File Server"*. Wired only, one port.
- **Canvas background:** faint dotted grid on the dark `--bg` colour — dots at ~20 px spacing in `rgba(255,255,255,0.06)`. Implemented as an SVG `<pattern>` so it scales and prints cleanly.
- **Empty-state hint:** when the canvas has no devices, centred faint text reads *"Drag a device from the left to start building"*. Fades out on the first drop and doesn't return until the canvas is cleared.
- **Wires:** smooth orthogonal or gently-curved paths in a neutral dark colour; dashed style for wireless links; green during a successful packet animation, red for a failed segment.
- **LAN box:** solid 1 px border in the theme accent colour, label tab in the top-left.
- **WAN box:** larger dashed border in a contrasting accent, label "WAN" top-left.

## Files to create
- `networks-year-9/Network Simulator/index.html` — the free-build sandbox page. Markup + theme styles + simulator code inline.
- `networks-year-9/Network Simulator/challenges.html` — the challenges page. Same simulator embedded, plus the task panel and challenge list sidebar.
- `networks-year-9/Network Simulator/simulator.js` — shared simulator code (devices, drag, wires, routing, packet animation, persistence) used by both pages so changes stay in sync. Exposes a small init API so each page can mount it into its own canvas container.
- `networks-year-9/Network Simulator/challenges.js` — array of challenge definitions + check predicates.
- `networks-year-9/Network Simulator/styles.css` — theme + simulator + challenge UI styles, lifted from `Lesson 1/styles.css` tokens for consistency.

## V1 scope
- Palette + drag-to-canvas + reposition.
- Port-count picker for hub/switch on drop.
- Port-aware drag-to-connect wiring with limit enforcement.
- WAP coverage + automatic wireless links.
- Router with "Internet" cloud uplink.
- LAN boxes (draw, name, group-move, membership by containment).
- Automatic WAN box when routers link LANs.
- Device naming (default + custom).
- Internet cloud as a real routing node + per-router internet on/off toggle.
- Hub-vs-switch visual distinction during packet animation.
- Server device in the palette.
- Undo / Redo and snap-to-grid.
- Pointer-event-based interactions for iPad / touch support.
- Send data packet simulation with success / failure animations, plain-English status messages, and an expanded explanation panel.
- Loose-cable behaviour when one end is disconnected (auto-removed when both ends are loose).
- Right-click / long-press context menu (Rename, Send data, Disconnect all, Delete).
- Wire styling by type (wired / wireless / internet uplink).
- Live device status lights (off / amber / green).
- Empty-state hint on a blank canvas.
- Export PNG of the current network.
- Deep-link query strings (`?scenario`, `?challenge`, `?state`) for embedding from lesson pages.
- Delete + clear.
- localStorage persistence.
- Status-bar feedback.

## Challenges (separate page)
A second page — `Network Simulator/challenges.html` — listing graded build tasks. Kept off the main sandbox so students aren't distracted unless they choose to practise.

**Page structure:**
- Left sidebar: list of challenges grouped by difficulty (*Starter*, *Intermediate*, *Advanced*). A small green tick appears next to ones the student has completed (tracked in `localStorage`).
- Main area: the **same simulator canvas component** as the sandbox page, plus a "Task" panel above it showing:
  - The brief (one or two sentences).
  - A "Check my answer" button.
  - A feedback area that shows ✅ on success or a specific corrective hint on failure.
- A "Reset task" button restores the starting state.

**Starting state per challenge:**
- *Build from scratch* challenges open with an empty canvas.
- *Fix it* challenges open with a pre-built network containing mistakes or missing devices — the JSON is bundled in the challenge definition and loaded into the simulator on open.

**Difficulty progression (initial set):**
- **Starter**
  1. *Connect this PC to the Internet.* (start: 1 PC. Need to add a router + wire it.)
  2. *Connect a PC to a printer so they can talk to each other.* (start: empty. Need a switch or direct wire.)
  3. *Add a laptop to this network wirelessly.* (start: PC + switch + WAP already wired. Need to drop a laptop in range.)
- **Intermediate**
  4. *Connect 5 computers to the same printer.* (start: empty. Forces a switch/hub choice.)
  5. *Give every device in this office wireless internet.* (start: router + switch + WAP missing one link. Several wireless devices placed.)
  6. *Fix this network — one PC can't reach the printer.* (start: pre-built with a port-full switch / wrong wire / missing patch.)
- **Advanced**
  7. *Connect two classrooms (separate LANs) so they can share a server.* (start: empty. Needs 2 LAN boxes, 2 routers, server, internet.)
  8. *This school network is broken — find and fix the three mistakes.* (start: pre-built with isolated WAP, no internet uplink, and over-port wire.)
  9. *Design a network for a small business: 10 staff PCs, 2 printers, 1 file server, wireless for laptops, internet for everyone.* (open-ended; checker validates the goal rather than a specific topology.)

**Auto-correction model:**
Each challenge defines a list of declarative checks against the current network state. Checks are written as small JS predicates so they're easy to author and easy for the checker to produce a *specific* hint when one fails. Available check types:
- `deviceExists(type, count?)` — *"You need at least 1 router."*
- `deviceNamed(name)` — for fix-it tasks that reference specific devices.
- `canReach(fromMatcher, toMatcher)` — runs the same BFS the simulator uses for Send data. *"PC 1 still can't reach the Printer."*
- `allCanReach(fromTypeMatcher, toMatcher)` — every device matching X must be able to reach Y. *"3 of 5 computers can reach the printer — check your switch wiring."*
- `inSameLan(matcher, matcher)` / `inDifferentLans(matcher, matcher)`
- `internetReachable(matcher)` — reaches the Internet cloud.
- `noPortOverflows()` — no device exceeds its port limit (relevant to fix-it tasks).
- `wirelessActive(matcher)` — laptop/tablet has a live wireless link.

The checker runs the predicates in order and surfaces the first failure's message. On full pass: success animation + tick is saved to `localStorage`.

**Authoring shape:** challenges live in a single `challenges.js` array (or inline in `challenges.html`), each entry roughly:
```js
{
  id, title, difficulty, brief,
  initialState: { devices, wires, lans } | null,
  checks: [
    { fn: canReach, args: [{type:'computer', name:'PC 1'}, {type:'printer'}],
      failMsg: "PC 1 can't reach the printer yet." },
    ...
  ]
}
```

**Navigation:** the sandbox page has a "Challenges" link in the header; the challenges page has a "Free build" link back. Both pages reuse the same simulator code (extracted to a shared script tag block or, if the user prefers separate files later, a small JS module).

## Out of scope for v1
- IP addressing / subnetting exercises.
- Help / legend overlay (still to discuss).
- Scoring / lesson integration beyond the per-challenge tick.

## Verification
- Open `index.html` in a browser.
- Drag each device type from palette to canvas — confirm correct icon + correct number of port dots.
- Drop a Switch — confirm the port-count picker appears and the chosen number of ports renders.
- Drop a Router — confirm the "Internet" cloud appears above it with a dashed link.
- Click "New LAN", draw a box, drag devices inside — confirm membership updates and the box can be renamed and moved as a group.
- Build two LANs, link them via a router — confirm a dashed WAN box auto-forms around both. Disconnect — confirm it disappears.
- Double-click a device label and rename it — confirm the new name persists after refresh and shows in the Send data dropdown.
- Click a Computer, choose Send data → another Computer through a Switch — confirm a green packet animates along the path and status bar reports the hops.
- Drag a Tablet outside any WAP coverage, try Send data — confirm a red failure animation and the *"no wireless signal"* message.
- Build two LANs without a linking router, try Send data across them — confirm the *"different LAN"* failure message.
- Build two LANs each with their own router and internet uplink enabled — confirm a cross-LAN Send succeeds with the route passing through the Internet cloud.
- Toggle one router's internet off and retry — confirm the *"Router has no internet connection"* failure.
- Send a packet through a Hub — confirm all hub ports flash and the tooltip appears. Through a Switch — confirm only the destination-side port flashes.
- Drop a Server, name it *"Web Server"*, send data to it from a Computer — confirm it appears in the destination list and delivers.
- Add a few devices, press Ctrl-Z — confirm the latest action is undone; Ctrl-Shift-Z redoes it.
- Drag a device — confirm its position snaps to the 20 px grid.
- Open the page on an iPad (or Chrome touch-emulation) — confirm drag-to-place, drag-to-connect, and Send data all work via touch.
- Open `challenges.html`, pick *"Connect this PC to the Internet"* — confirm a PC is pre-placed, add a router + wire, click Check, see ✅ and a green tick saved on the sidebar.
- Try a fix-it challenge with a deliberately wrong wire — Check should report a specific actionable failure (e.g. *"PC 1 still can't reach the printer."*).
- Reload the page — completed-challenge ticks should persist.
- Delete a device that has wires attached — confirm each wire stays plugged into its remaining device with a dangling free end; drag a free end onto another port to re-attach it.
- Confirm a wire whose both ends end up loose vanishes automatically.
- Right-click (or long-press on touch) a device — confirm the context menu appears with Rename / Send data / Disconnect all / Delete.
- Build a network and watch the status-light dots transition off → amber → green as connections complete.
- Open `index.html` on an empty canvas — confirm the empty-state hint appears and fades after the first drop.
- Click Export image — confirm a PNG of the current canvas downloads.
- Visit `index.html?scenario=switch-vs-hub` — confirm the pre-built demo network loads.
- Confirm the wire colours: solid grey for ethernet, dashed teal for wireless, dashed indigo for router-to-Internet.
- Trigger a wireless failure — confirm the expanded explanation panel slides in with the 2-sentence reason.
- Wire two computers through a switch; confirm wires follow when dragging devices.
- Try to add a second wire to a computer — confirm refusal with status message.
- Drop a WAP, connect its uplink to a switch, then drop a laptop inside and outside its coverage circle — confirm dashed wireless link appears/disappears.
- Refresh — confirm layout persists.
- Delete a device — confirm wires are removed.
