// =====================================================================
// CODEREGON TRAIL — Shared Game Engine
// =====================================================================
// Game HTML files define these globals before loading this script:
//   window.TRAIL_DATA       — trail JSON (stops, events, partyMembers, deathMessages)
//   window.TRAIL_CONFIG     — { mountainColors: { far, near } }  (optional)
//   window.TRAIL_FLAVORS    — array of travel flavor strings      (optional)
//   window.drawCustomEventOverlay(time) — per-game event animations (optional)
// =====================================================================

const TRAIL_DATA = window.TRAIL_DATA;
const _TRAIL_CONFIG = window.TRAIL_CONFIG || {};
const _MC = _TRAIL_CONFIG.mountainColors || { far: '#AA00AA', near: '#FF55FF' };

// Mobile detection
var isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window && window.innerWidth < 900);
// Inject viewport meta for mobile
(function injectViewport() {
  if (!document.querySelector('meta[name="viewport"]')) {
    var m = document.createElement('meta');
    m.name = 'viewport';
    m.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(m);
  }
})();

// Google Analytics (GA4) — loaded dynamically so every game page is covered via engine.js
(function injectGA() {
  var GA_ID = 'G-LKPR91782L';
  if (window.gtag) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
})();

function trackEvent(name, params) {
  if (typeof window.gtag !== 'function') return;
  try { window.gtag('event', name, params || {}); } catch (e) {}
}

function getGameSlug() {
  var path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  var parts = path.split('/');
  return parts[parts.length - 1] || (TRAIL_DATA && TRAIL_DATA.framework) || 'unknown';
}

// Inject CSS
(function injectStyles() {
  var s = document.createElement('style');
  s.textContent = `
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  height: 100vh;
  overflow: hidden;
  background: #000;
  font-family: 'Courier New', monospace;
  color: #AAAAAA;
}
#game-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}
#canvas-area {
  height: 52vh;
  min-height: 0;
  position: relative;
  background: #000;
}
#game-canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  display: block;
}
#text-panel {
  flex: 1;
  min-height: 0;
  background: #000;
  border-top: 2px solid #555555;
  overflow-y: auto;
  padding: 8px 16px;
  font-size: 14px;
  line-height: 1.4;
  color: #FFFFFF;
}
#text-panel > div { max-width: 720px; margin: 0 auto; }
#text-panel.code-expanded {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 62px;
  z-index: 10;
}
#text-panel::-webkit-scrollbar { width: 8px; }
#text-panel::-webkit-scrollbar-track { background: #000; }
#text-panel::-webkit-scrollbar-thumb { background: #555555; }
#status-bar {
  height: 60px;
  min-height: 60px;
  background: #000;
  border-top: 2px solid #555555;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 15px;
  color: #AAAAAA;
  white-space: nowrap;
  overflow: hidden;
}
.blink {
  animation: blink-anim 1s step-end infinite;
}
@keyframes blink-anim {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
.shake { animation: shake 0.5s ease-in-out; }
.code-box {
  background: #000;
  border: 1px solid #555555;
  padding: 6px 8px;
  margin: 6px 0;
  max-height: 130px;
  overflow-y: auto;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.3;
  white-space: pre;
  color: #55FF55;
  cursor: pointer;
  transition: max-height 0.2s ease;
}
.code-box.expanded { max-height: none; }
.code-box.shiki-rendered { padding: 0; background: transparent; }
.code-box.shiki-rendered pre.shiki { margin: 0; padding: 6px 8px; font-size: 12px; line-height: 1.3; overflow: visible; }
.code-box.shiki-rendered code { font-family: 'Courier New', monospace; font-size: inherit; line-height: inherit; }
.code-box::-webkit-scrollbar { width: 6px; height: 6px; }
.code-box::-webkit-scrollbar-track { background: #000; }
.code-box::-webkit-scrollbar-thumb { background: #555555; }
.choice-item { cursor: pointer; padding: 2px 4px; }
.choice-item:hover { color: #FFFF55; }
.choice-selected { color: #FFFF55; background: #333300; }
.stop-opt { color: #55FFFF; cursor: pointer; padding: 2px 4px; }
.stop-opt:hover { color: #FFFF55; }
.choice-correct { color: #55FF55; }
.choice-wrong { color: #FF5555; }
.choice-dimmed { color: #555555; }
.health-green { color: #00AA00; }
.health-yellow { color: #FFFF55; }
.health-red { color: #FF5555; }
.health-dead { color: #555555; text-decoration: line-through; }
.text-cyan { color: #55FFFF; }
.text-yellow { color: #FFFF55; }
.text-green { color: #55FF55; }
.text-red { color: #FF5555; }
.text-magenta { color: #FF55FF; }
.text-gray { color: #555555; }
.text-white { color: #FFFFFF; }
.text-bright { color: #FFFFFF; font-weight: bold; }
#music-indicator {
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 11px;
  color: #555555;
  z-index: 10;
  pointer-events: none;
}
#mobile-controls {
  display: none;
  position: absolute;
  bottom: 66px;
  right: 8px;
  z-index: 20;
  gap: 6px;
}
#mobile-controls button {
  background: #111;
  border: 1px solid #555;
  color: #AAAAAA;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  width: 44px;
  height: 44px;
  cursor: pointer;
  border-radius: 4px;
  -webkit-tap-highlight-color: transparent;
}
#mobile-controls button:active {
  background: #333;
  color: #FFFF55;
}
#mobile-controls button[disabled] {
  opacity: 0.35;
  cursor: default;
}
#code-modal {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 62px;
  background: rgba(0, 0, 0, 0.96);
  z-index: 40;
  padding: 10px 14px;
  overflow-y: auto;
  border-top: 2px solid #555555;
}
#code-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
}
#code-modal-title {
  color: #FFFF55;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
#code-modal-close {
  background: #111;
  border: 1px solid #555;
  color: #AAAAAA;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  min-height: 34px;
  -webkit-tap-highlight-color: transparent;
}
#code-modal-close:active, #code-modal-close:hover {
  color: #FFFF55;
  background: #222;
}
#code-modal-file {
  border: 1px solid #555555;
  padding: 2px 4px;
  font-size: 11px;
  color: #AAAAAA;
  margin-bottom: 6px;
}
#code-modal-content .code-box {
  max-height: none !important;
}
@media (max-width: 600px), (hover: none) and (pointer: coarse) {
  #text-panel { font-size: 15px; padding: 10px 12px; }
  .choice-item { padding: 10px 8px !important; margin: 6px 0 !important; font-size: 15px; min-height: 44px; display: flex; align-items: center; }
  .stop-opt { padding: 10px 16px !important; font-size: 15px; display: inline-block; min-height: 44px; }
  #status-bar { font-size: 12px; height: 52px; min-height: 52px; padding: 0 8px; }
  #canvas-area { height: 35vh; }
  #text-panel > div { max-width: 100%; }
  .code-box { font-size: 11px; max-height: 100px; }
  #mobile-controls { display: flex; }
  #code-modal { bottom: 54px; }
}
  `;
  document.head.appendChild(s);
})();

// =====================================================================
// GAME STATE
// =====================================================================
const STATES = { TITLE: 'TITLE', SETUP: 'SETUP', TRAVEL: 'TRAVEL', STOP: 'STOP', EVENT: 'EVENT', RIVER: 'RIVER', DEATH: 'DEATH', WIN: 'WIN' };
const PROFESSIONS = [
  { name: 'Ralph Wiggum', desc: '"I\'m learnding!"', health: 999, supplies: 999, hintFree: true, forgiving: true, wrongDmg: 15, riverDmg: 20, drainInterval: 0, healOnCorrect: 10, partyMaxHp: 3 },
  { name: 'Vibe Coder', desc: '"It works on my machine"', health: 100, supplies: 5, hintFree: false, forgiving: false, wrongDmg: 15, riverDmg: 20, drainInterval: 3000, healOnCorrect: 10, partyMaxHp: 3 },
  { name: 'Engineer', desc: '"Let me check the docs"', health: 70, supplies: 2, hintFree: false, forgiving: false, wrongDmg: 20, riverDmg: 25, drainInterval: 2500, healOnCorrect: 5, partyMaxHp: 2 },
  { name: 'Staff Architect', desc: '"I designed this system"', health: 50, supplies: 0, hintFree: false, forgiving: false, wrongDmg: 25, riverDmg: 30, drainInterval: 2000, healOnCorrect: 0, partyMaxHp: 1 }
];

let gameState = STATES.TITLE;
let difficulty = 1;
let health = 100;
let maxHealthForGame = 100;
let supplies = 5;
let currentStop = 0;
let day = 1;
let score = 0;
let totalQuestions = 0;
let conceptScores = {};
let streak = 0;
let bestStreak = 0;
let hintsUsed = 0;
let scrollX = 0;
let travelTimer = null;
let animFrame = null;
let partyHealth = [];
let pendingEvents = [];
let currentEventIndex = 0;
let eventAnswered = false;
let eventHinted = false;
let dimmedChoice = -1;
let selectedEventChoice = -1;
let selectedStopChoice = 0;
let shuffledIndices = []; // maps display position -> original choice index
let selectedDifficulty = (function() {
  try { var d = parseInt(localStorage.getItem('coderegon-trail:difficulty')); return (d >= 0 && d <= 3) ? d : 1; }
  catch(e) { return 1; }
})();
let musicPlaying = false;
let audioCtx = null;
let musicInitialized = false;
let typewriterTimer = null;
let typewriterText = '';
let typewriterIndex = 0;
let showRiver = false;
let wagonWheelAngle = 0;
let travelFlavorIndex = 0;
let deathPending = false;
let currentEventType = '';  // event type for canvas overlay
let currentEventTitle = ''; // event title for canvas overlay

const travelFlavors = window.TRAIL_FLAVORS || [
  "The wagon creaks along the trail...",
  "Dust rises from the wheels as you press onward...",
  "The landscape shifts as new territory opens up...",
  "Fellow travelers share stories around the campfire...",
  "The trail stretches endlessly toward the horizon...",
  "Progress is steady. The destination draws closer..."
];

// =====================================================================
// CANVAS RENDERING (320x200 internal)
// =====================================================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const W = 320, H = 200;

// Seeded PRNG for consistent landscape
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

const rng = seededRandom(42);
const cloudPositions = [];
for (let i = 0; i < 5; i++) {
  cloudPositions.push({ x: rng() * 400, y: 10 + rng() * 30, w: 25 + rng() * 30, h: 8 + rng() * 6 });
}
const farMountains = [];
for (let i = 0; i < 6; i++) {
  farMountains.push({ x: i * 70 - 20 + rng() * 30, h: 40 + rng() * 35, w: 50 + rng() * 40 });
}
const nearMountains = [];
for (let i = 0; i < 8; i++) {
  nearMountains.push({ x: i * 55 - 30 + rng() * 20, h: 25 + rng() * 25, w: 30 + rng() * 25, snow: rng() > 0.3 });
}
const treesData = [];
for (let i = 0; i < 25; i++) {
  treesData.push({ x: rng() * 600, h: 12 + rng() * 16 });
}

function getSkyColors() {
  const progress = currentStop / Math.max(TRAIL_DATA.stops.length, 1);
  if (progress < 0.15) {
    return { top: '#5500AA', bottom: '#FF5555' };
  } else if (progress < 0.7) {
    return { top: '#5555FF', bottom: '#55FFFF' };
  } else {
    return { top: '#5500AA', bottom: '#FFAA00' };
  }
}

function drawPixelCloud(x, y, w, h) {
  ctx.fillStyle = '#FFFFFF';
  const ix = Math.floor(x), iy = Math.floor(y), iw = Math.floor(w), ih = Math.floor(h);
  ctx.fillRect(ix, iy, iw, ih);
  ctx.fillRect(ix + Math.floor(iw * 0.15), iy - Math.floor(ih * 0.5), Math.floor(iw * 0.3), Math.floor(ih * 0.6));
  ctx.fillRect(ix + Math.floor(iw * 0.4), iy - Math.floor(ih * 0.7), Math.floor(iw * 0.35), Math.floor(ih * 0.8));
  ctx.fillRect(ix + Math.floor(iw * 0.65), iy - Math.floor(ih * 0.3), Math.floor(iw * 0.2), Math.floor(ih * 0.4));
}

function drawMountain(x, h, w, color, snowCap) {
  const baseY = 110;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(Math.floor(x), baseY);
  ctx.lineTo(Math.floor(x + w / 2), Math.floor(baseY - h));
  ctx.lineTo(Math.floor(x + w), baseY);
  ctx.closePath();
  ctx.fill();
  if (snowCap) {
    ctx.fillStyle = '#FFFFFF';
    const peakX = x + w / 2;
    const peakY = baseY - h;
    ctx.beginPath();
    ctx.moveTo(Math.floor(peakX - w * 0.1), Math.floor(peakY + h * 0.18));
    ctx.lineTo(Math.floor(peakX), Math.floor(peakY));
    ctx.lineTo(Math.floor(peakX + w * 0.1), Math.floor(peakY + h * 0.18));
    ctx.closePath();
    ctx.fill();
  }
}

function drawTree(x, baseY, h) {
  const trunkW = 3, trunkH = Math.floor(h * 0.3);
  ctx.fillStyle = '#AA5500';
  ctx.fillRect(Math.floor(x - 1), Math.floor(baseY - trunkH), trunkW, trunkH);
  for (let i = 0; i < 3; i++) {
    const layerW = (h * 0.4) * (1 - i * 0.15);
    const layerY = baseY - trunkH - (i * h * 0.2);
    ctx.fillStyle = i === 1 ? '#00AA00' : '#005500';
    ctx.beginPath();
    ctx.moveTo(Math.floor(x - layerW / 2), Math.floor(layerY));
    ctx.lineTo(Math.floor(x + 0.5), Math.floor(layerY - h * 0.25));
    ctx.lineTo(Math.floor(x + layerW / 2), Math.floor(layerY));
    ctx.closePath();
    ctx.fill();
  }
}

function drawWagon(wx, wy) {
  // Wagon body (left/rear)
  ctx.fillStyle = '#AA5500';
  ctx.fillRect(Math.floor(wx - 26), Math.floor(wy - 8), 24, 10);
  // Wagon sides darker
  ctx.fillStyle = '#885500';
  ctx.fillRect(Math.floor(wx - 26), Math.floor(wy - 8), 24, 1);
  ctx.fillRect(Math.floor(wx - 26), Math.floor(wy + 1), 24, 1);
  // Canvas cover (white curved top)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(Math.floor(wx - 25), Math.floor(wy - 8));
  ctx.quadraticCurveTo(Math.floor(wx - 14), Math.floor(wy - 22), Math.floor(wx - 3), Math.floor(wy - 8));
  ctx.closePath();
  ctx.fill();
  // Canvas cover outline
  ctx.strokeStyle = '#AAAAAA';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(Math.floor(wx - 25), Math.floor(wy - 8));
  ctx.quadraticCurveTo(Math.floor(wx - 14), Math.floor(wy - 22), Math.floor(wx - 3), Math.floor(wy - 8));
  ctx.stroke();
  // Canvas ribs
  ctx.strokeStyle = '#AAAAAA';
  for (let ri = 0; ri < 3; ri++) {
    const rx = wx - 20 + ri * 5;
    ctx.beginPath();
    ctx.moveTo(Math.floor(rx), Math.floor(wy - 8));
    ctx.lineTo(Math.floor(rx), Math.floor(wy - 14 - ri % 2 * 2));
    ctx.stroke();
  }
  // Yoke
  ctx.fillStyle = '#AA5500';
  ctx.fillRect(Math.floor(wx - 2), Math.floor(wy - 4), 6, 2);
  // Oxen (right/front — leading the wagon)
  ctx.fillStyle = '#AA5500';
  ctx.fillRect(Math.floor(wx + 6), Math.floor(wy - 6), 8, 6);
  ctx.fillRect(Math.floor(wx + 16), Math.floor(wy - 6), 8, 6);
  // Oxen legs
  ctx.fillStyle = '#553300';
  ctx.fillRect(Math.floor(wx + 8), Math.floor(wy), 2, 4);
  ctx.fillRect(Math.floor(wx + 12), Math.floor(wy), 2, 4);
  ctx.fillRect(Math.floor(wx + 18), Math.floor(wy), 2, 4);
  ctx.fillRect(Math.floor(wx + 22), Math.floor(wy), 2, 4);
  // Oxen heads (facing right)
  ctx.fillStyle = '#885500';
  ctx.fillRect(Math.floor(wx + 23), Math.floor(wy - 7), 3, 3);
  ctx.fillRect(Math.floor(wx + 13), Math.floor(wy - 7), 3, 3);
  // Wheels
  const wheelR = 5;
  for (let wi = 0; wi < 2; wi++) {
    const wcx = wx - 21 + wi * 14;
    const wcy = wy + 4;
    // Outer rim
    ctx.fillStyle = '#553300';
    ctx.beginPath();
    ctx.arc(Math.floor(wcx), Math.floor(wcy), wheelR, 0, Math.PI * 2);
    ctx.fill();
    // Inner
    ctx.fillStyle = '#AA5500';
    ctx.beginPath();
    ctx.arc(Math.floor(wcx), Math.floor(wcy), wheelR - 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Spokes
    ctx.strokeStyle = '#553300';
    ctx.lineWidth = 1;
    for (let si = 0; si < 6; si++) {
      const angle = wagonWheelAngle + (si * Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(Math.floor(wcx), Math.floor(wcy));
      ctx.lineTo(Math.floor(wcx + Math.cos(angle) * (wheelR - 1)), Math.floor(wcy + Math.sin(angle) * (wheelR - 1)));
      ctx.stroke();
    }
    // Hub
    ctx.fillStyle = '#553300';
    ctx.fillRect(Math.floor(wcx - 1), Math.floor(wcy - 1), 2, 2);
  }
  // Purple flag (on wagon cover peak)
  ctx.fillStyle = '#AA00AA';
  ctx.fillRect(Math.floor(wx - 14), Math.floor(wy - 22), 1, -7);
  ctx.fillStyle = '#FF55FF';
  ctx.fillRect(Math.floor(wx - 13), Math.floor(wy - 29), 6, 4);
}

function drawLandmark(type, x, baseY) {
  switch (type) {
    case 'town':
      ctx.fillStyle = '#AA5500';
      ctx.fillRect(Math.floor(x), Math.floor(baseY - 18), 14, 18);
      ctx.fillRect(Math.floor(x + 18), Math.floor(baseY - 14), 12, 14);
      // Roofs
      ctx.fillStyle = '#555555';
      ctx.beginPath();
      ctx.moveTo(Math.floor(x - 2), Math.floor(baseY - 18));
      ctx.lineTo(Math.floor(x + 7), Math.floor(baseY - 25));
      ctx.lineTo(Math.floor(x + 16), Math.floor(baseY - 18));
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(Math.floor(x + 16), Math.floor(baseY - 14));
      ctx.lineTo(Math.floor(x + 24), Math.floor(baseY - 20));
      ctx.lineTo(Math.floor(x + 32), Math.floor(baseY - 14));
      ctx.closePath();
      ctx.fill();
      // Windows
      ctx.fillStyle = '#FFFF55';
      ctx.fillRect(Math.floor(x + 3), Math.floor(baseY - 13), 3, 3);
      ctx.fillRect(Math.floor(x + 9), Math.floor(baseY - 13), 3, 3);
      ctx.fillRect(Math.floor(x + 21), Math.floor(baseY - 10), 3, 3);
      // Door
      ctx.fillStyle = '#553300';
      ctx.fillRect(Math.floor(x + 5), Math.floor(baseY - 7), 4, 7);
      break;
    case 'camp':
      // Tent
      ctx.fillStyle = '#AAAAAA';
      ctx.beginPath();
      ctx.moveTo(Math.floor(x - 6), Math.floor(baseY));
      ctx.lineTo(Math.floor(x + 4), Math.floor(baseY - 14));
      ctx.lineTo(Math.floor(x + 14), Math.floor(baseY));
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#555555';
      ctx.beginPath();
      ctx.moveTo(Math.floor(x + 4), Math.floor(baseY));
      ctx.lineTo(Math.floor(x + 4), Math.floor(baseY - 14));
      ctx.lineTo(Math.floor(x + 14), Math.floor(baseY));
      ctx.closePath();
      ctx.fill();
      // Campfire
      ctx.fillStyle = '#FF5555';
      ctx.fillRect(Math.floor(x + 20), Math.floor(baseY - 5), 4, 3);
      ctx.fillStyle = '#FFFF55';
      ctx.fillRect(Math.floor(x + 21), Math.floor(baseY - 8), 2, 3);
      ctx.fillStyle = '#FFAA00';
      ctx.fillRect(Math.floor(x + 18), Math.floor(baseY - 2), 8, 2);
      break;
    case 'mountain':
      drawMountain(x - 20, 60, 50, _MC.far, true);
      drawMountain(x + 10, 45, 40, _MC.near, true);
      break;
    case 'river':
      ctx.fillStyle = '#AA5500';
      ctx.fillRect(Math.floor(x), Math.floor(baseY - 20), 3, 20);
      ctx.fillRect(Math.floor(x + 24), Math.floor(baseY - 20), 3, 20);
      ctx.strokeStyle = '#AAAAAA';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.floor(x + 1), Math.floor(baseY - 18));
      ctx.lineTo(Math.floor(x + 25), Math.floor(baseY - 18));
      ctx.stroke();
      // Sign
      ctx.fillStyle = '#AA5500';
      ctx.fillRect(Math.floor(x + 8), Math.floor(baseY - 25), 12, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(Math.floor(x + 10), Math.floor(baseY - 23), 2, 1);
      ctx.fillRect(Math.floor(x + 13), Math.floor(baseY - 23), 2, 1);
      ctx.fillRect(Math.floor(x + 16), Math.floor(baseY - 23), 2, 1);
      break;
    case 'forest':
      for (let i = 0; i < 6; i++) {
        drawTree(x + i * 7, baseY, 14 + (i % 3) * 3);
      }
      break;
    case 'desert':
      ctx.fillStyle = '#FFAA00';
      ctx.fillRect(Math.floor(x - 5), Math.floor(baseY - 3), 40, 3);
      ctx.beginPath();
      ctx.moveTo(Math.floor(x - 10), Math.floor(baseY));
      ctx.quadraticCurveTo(Math.floor(x + 5), Math.floor(baseY - 8), Math.floor(x + 20), Math.floor(baseY));
      ctx.fill();
      ctx.fillStyle = '#00AA00';
      ctx.fillRect(Math.floor(x + 25), Math.floor(baseY - 18), 3, 18);
      ctx.fillRect(Math.floor(x + 22), Math.floor(baseY - 14), 3, 6);
      ctx.fillRect(Math.floor(x + 28), Math.floor(baseY - 12), 3, 5);
      ctx.fillRect(Math.floor(x + 22), Math.floor(baseY - 14), 1, 1);
      ctx.fillRect(Math.floor(x + 30), Math.floor(baseY - 12), 1, 1);
      break;
  }
}

function drawRiver(time) {
  const riverY = 155;
  const riverH = 18;
  ctx.fillStyle = '#0000AA';
  ctx.fillRect(0, riverY, W, riverH);
  ctx.fillStyle = '#00AAAA';
  for (let wx = 0; wx < W; wx += 3) {
    const waveY = riverY + 3 + Math.sin((wx + time * 0.05) * 0.08) * 3;
    ctx.fillRect(wx, Math.floor(waveY), 2, 1);
    const waveY2 = riverY + 10 + Math.sin((wx + time * 0.03 + 50) * 0.1) * 2;
    ctx.fillRect(wx, Math.floor(waveY2), 2, 1);
  }
  // White foam
  ctx.fillStyle = '#55FFFF';
  for (let wx = 0; wx < W; wx += 12) {
    const foamY = riverY + 1 + Math.sin((wx + time * 0.04) * 0.06) * 1;
    ctx.fillRect(wx + 2, Math.floor(foamY), 3, 1);
  }
}

// =====================================================================
// EVENT CANVAS OVERLAYS — unique visuals per quiz event
// =====================================================================
function drawEventOverlay(time) {
  if (!currentEventType && !currentEventTitle) return;
  if (typeof window.drawCustomEventOverlay === 'function') {
    window.drawCustomEventOverlay(time);
    return;
  }
  // Generic fallback overlays by event type
  var t = (time || 0) * 0.001;
  if (currentEventType === 'weather') {
    ctx.fillStyle = 'rgba(0,0,50,0.45)';
    ctx.fillRect(0, 0, W, 110);
    var flashPhase = Math.sin(t * 1.7) + Math.sin(t * 3.1);
    if (flashPhase > 1.6) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#FFFF55';
      ctx.lineWidth = 2;
      ctx.beginPath();
      var lx = 80 + Math.sin(t * 2.3) * 60;
      ctx.moveTo(lx, 10); ctx.lineTo(lx - 5, 35); ctx.lineTo(lx + 8, 35);
      ctx.lineTo(lx - 3, 65); ctx.lineTo(lx + 10, 65); ctx.lineTo(lx + 2, 95);
      ctx.stroke();
    }
    ctx.strokeStyle = '#5555FF'; ctx.lineWidth = 1;
    for (var i = 0; i < 40; i++) {
      var rx = (i * 8.3 + t * 80) % W, ry = (i * 13.7 + t * 120) % 110;
      ctx.beginPath(); ctx.moveTo(Math.floor(rx), Math.floor(ry));
      ctx.lineTo(Math.floor(rx - 1), Math.floor(ry + 5)); ctx.stroke();
    }
  } else if (currentEventType === 'river') {
    ctx.fillStyle = '#55FFFF';
    for (var i = 0; i < 20; i++) {
      var sx = (i * 17 + t * 40) % W, sy = 157 + Math.sin(i * 3 + t * 5) * 3;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 4, 2);
    }
    ctx.fillStyle = '#AA5500';
    for (var i = 0; i < 3; i++) {
      var logX = (i * 110 + t * 25) % W, logY = 159 + Math.sin(t * 2 + i) * 2;
      ctx.fillRect(Math.floor(logX), Math.floor(logY), 8, 2);
    }
  } else if (currentEventType === 'encounter') {
    var px = 200, py = 142;
    ctx.fillStyle = '#AA5500'; ctx.fillRect(px, py - 12, 4, 8);
    ctx.fillStyle = '#FFAA00'; ctx.fillRect(px, py - 15, 4, 3);
    ctx.fillRect(px - 1, py - 4, 2, 5); ctx.fillRect(px + 3, py - 4, 2, 5);
    ctx.fillStyle = '#555555'; ctx.fillRect(px - 1, py - 17, 6, 2); ctx.fillRect(px, py - 19, 4, 2);
    var fx = 212, fy = 148;
    ctx.fillStyle = '#AA5500'; ctx.fillRect(fx - 3, fy, 2, 3); ctx.fillRect(fx + 3, fy, 2, 3);
    ctx.fillStyle = '#FF5555'; var flicker = Math.sin(t * 8) * 2;
    ctx.fillRect(fx - 1, fy - 3 + Math.floor(flicker * 0.3), 4, 3);
    ctx.fillStyle = '#FFFF55'; ctx.fillRect(fx, fy - 5 + Math.floor(flicker * 0.5), 2, 2);
  } else if (currentEventType === 'misfortune') {
    ctx.fillStyle = 'rgba(170,0,0,0.25)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#555555';
    for (var i = 0; i < 15; i++) {
      var sx = 140 + Math.sin(i * 2.7 + t) * 30, sy = 130 - ((t * 20 + i * 15) % 90);
      ctx.globalAlpha = 0.3 + Math.sin(t + i) * 0.15;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 2 + (i % 3), 2 + (i % 3));
    }
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#FF5555';
    for (var i = 0; i < 8; i++) {
      var fx = 130 + i * 5, fh = 4 + Math.sin(t * 6 + i * 1.5) * 3;
      ctx.fillRect(fx, Math.floor(140 - fh), 3, Math.floor(fh));
    }
  }
}

// =====================================================================
// DEATH SCREEN — Apple II green phosphor style
// =====================================================================
function drawDeathScene(time) {
  var t = (time || 0) * 0.001;
  var G = '#33FF33'; // Apple II green
  var GD = '#1a8a1a'; // darker green for details

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // Ground line
  ctx.fillStyle = GD;
  ctx.fillRect(0, 148, W, 1);

  // --- WAGON (left side / rear) ---
  var wx = 82, wy = 108;
  // Wagon bed
  ctx.fillStyle = G;
  ctx.fillRect(wx, wy + 20, 50, 16);
  // Bed slats (dark lines)
  ctx.fillStyle = GD;
  ctx.fillRect(wx, wy + 24, 50, 1);
  ctx.fillRect(wx, wy + 28, 50, 1);
  ctx.fillRect(wx, wy + 32, 50, 1);
  // Side rails
  ctx.fillStyle = G;
  ctx.fillRect(wx, wy + 18, 2, 18);
  ctx.fillRect(wx + 48, wy + 18, 2, 18);

  // Canvas cover (the bonnet)
  ctx.fillStyle = G;
  // Left arch
  ctx.fillRect(wx + 4, wy + 4, 2, 16);
  // Right arch
  ctx.fillRect(wx + 44, wy + 4, 2, 16);
  // Top cover
  ctx.fillRect(wx + 4, wy + 2, 42, 4);
  // Cover fill
  ctx.fillRect(wx + 6, wy + 6, 38, 12);
  // Cover shading
  ctx.fillStyle = GD;
  ctx.fillRect(wx + 8, wy + 8, 34, 2);
  ctx.fillRect(wx + 8, wy + 12, 34, 2);
  ctx.fillRect(wx + 8, wy + 16, 34, 1);

  // --- HITCH ---
  ctx.fillStyle = G;
  ctx.fillRect(wx + 50, wy + 28, 14, 2);

  // --- OX (right side / front, facing right) ---
  var ox = wx + 64, oy = 128;
  // Body
  ctx.fillStyle = G;
  ctx.fillRect(ox, oy, 24, 14);
  // Head (facing right)
  ctx.fillRect(ox + 22, oy - 2, 12, 10);
  // Horns
  ctx.fillRect(ox + 25, oy - 6, 3, 5);
  ctx.fillRect(ox + 33, oy - 6, 3, 5);
  // Snout
  ctx.fillStyle = GD;
  ctx.fillRect(ox + 28, oy + 4, 6, 3);
  // Eye
  ctx.fillStyle = '#000';
  ctx.fillRect(ox + 29, oy, 2, 2);
  // Legs
  ctx.fillStyle = G;
  ctx.fillRect(ox + 4, oy + 14, 4, 8);
  ctx.fillRect(ox + 10, oy + 14, 4, 8);
  ctx.fillRect(ox + 18, oy + 14, 4, 8);
  // Tail (on left/back)
  ctx.fillRect(ox - 6, oy + 2, 6, 2);
  ctx.fillRect(ox - 7, oy, 2, 4);

  // Wheels
  var wheelR = 8;
  var wheels = [wx + 8, wx + 42];
  var wa = -t * 0.5; // clockwise rotation for rightward travel
  ctx.strokeStyle = G;
  ctx.lineWidth = 1.5;
  for (var wi = 0; wi < wheels.length; wi++) {
    var cx = wheels[wi], cy = wy + 38;
    // Rim
    ctx.beginPath();
    ctx.arc(cx, cy, wheelR, 0, Math.PI * 2);
    ctx.stroke();
    // Spokes
    for (var sp = 0; sp < 6; sp++) {
      var angle = wa + sp * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * wheelR, cy + Math.sin(angle) * wheelR);
      ctx.stroke();
    }
    // Hub
    ctx.fillStyle = G;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.lineWidth = 1;

  // Subtle scanline effect
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (var sl = 0; sl < H; sl += 3) {
    ctx.fillRect(0, sl, W, 1);
  }

  // Subtle green glow/vignette
  var grd = ctx.createRadialGradient(W/2, H/2, 40, W/2, H/2, W * 0.7);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

function renderCanvas(time) {
  // Death screen: green phosphor Apple II style
  if (gameState === STATES.DEATH) {
    drawDeathScene(time);
    return;
  }

  const skyColors = getSkyColors();

  // Sky gradient (banded for EGA feel)
  const bands = 10;
  const skyBottom = 110;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const r1 = parseInt(skyColors.top.substr(1, 2), 16);
    const g1 = parseInt(skyColors.top.substr(3, 2), 16);
    const b1 = parseInt(skyColors.top.substr(5, 2), 16);
    const r2 = parseInt(skyColors.bottom.substr(1, 2), 16);
    const g2 = parseInt(skyColors.bottom.substr(3, 2), 16);
    const b2 = parseInt(skyColors.bottom.substr(5, 2), 16);
    const r = Math.floor(r1 + (r2 - r1) * t);
    const g = Math.floor(g1 + (g2 - g1) * t);
    const b = Math.floor(b1 + (b2 - b1) * t);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    const bandH = Math.ceil(skyBottom / bands) + 1;
    ctx.fillRect(0, Math.floor(i * (skyBottom / bands)), W, bandH);
  }

  // Clouds (parallax 0.2x)
  const cloudOffset = scrollX * 0.2;
  for (const c of cloudPositions) {
    let cx = ((c.x - cloudOffset) % (W + 80));
    if (cx < -40) cx += W + 80;
    drawPixelCloud(cx - 20, c.y, c.w, c.h);
  }

  // Far mountains (parallax 0.3x) - DARK MAGENTA signature Oregon Trail
  const farOffset = scrollX * 0.3;
  for (const m of farMountains) {
    let mx = ((m.x - farOffset) % (W + 100));
    if (mx < -50) mx += W + 100;
    drawMountain(mx - 25, m.h, m.w, _MC.far, false);
  }

  // Near mountains (parallax 0.4x) - LIGHT MAGENTA with snow caps
  const nearOffset = scrollX * 0.4;
  for (const m of nearMountains) {
    let mx = ((m.x - nearOffset) % (W + 80));
    if (mx < -40) mx += W + 80;
    drawMountain(mx - 20, m.h, m.w, _MC.near, m.snow);
  }

  // Grass
  ctx.fillStyle = '#00AA00';
  ctx.fillRect(0, 110, W, H - 110);

  // Bright grass highlights
  ctx.fillStyle = '#55FF55';
  const grassOffset = scrollX * 1.0;
  for (let i = 0; i < 50; i++) {
    let gx = ((i * 11 + 5 - grassOffset) % (W + 20));
    if (gx < -5) gx += W + 20;
    const gy = 113 + (i * 7 + i * i * 3) % 55;
    ctx.fillRect(Math.floor(gx), Math.floor(gy), 2, 2);
  }

  // Trees (parallax 0.6x)
  const treeOffset = scrollX * 0.6;
  const treeBaseY = 128;
  for (const t of treesData) {
    let tx = ((t.x - treeOffset) % (W + 60));
    if (tx < -20) tx += W + 60;
    drawTree(tx - 10, treeBaseY, t.h);
  }

  // Landmark for current stop (only at stops/events)
  if (gameState === STATES.STOP || gameState === STATES.EVENT || gameState === STATES.RIVER) {
    const stop = TRAIL_DATA.stops[currentStop];
    if (stop) {
      drawLandmark(stop.landmarkType, 240, 150);
    }
  }

  // Trail/ground strip
  if (!showRiver) {
    ctx.fillStyle = '#AA5500';
    ctx.fillRect(0, 152, W, 15);
    // Trail texture dots
    ctx.fillStyle = '#885500';
    for (let i = 0; i < 35; i++) {
      let dotX = ((i * 10 - scrollX * 1.0) % (W + 10));
      if (dotX < -3) dotX += W + 10;
      ctx.fillRect(Math.floor(dotX), 155 + (i % 4) * 2, 3, 1);
    }
    // Ruts
    ctx.fillStyle = '#775500';
    ctx.fillRect(0, 157, W, 1);
    ctx.fillRect(0, 162, W, 1);
  }

  // River (when active)
  if (showRiver) {
    drawRiver(time || 0);
  }

  // Wagon
  const wagonX = 65;
  const wagonY = showRiver ? 148 : 149;
  drawWagon(wagonX, wagonY);

  // Event-specific visual overlay
  if (gameState === STATES.EVENT || gameState === STATES.RIVER) {
    drawEventOverlay(time);
  }

  // Ground below trail
  ctx.fillStyle = '#885500';
  ctx.fillRect(0, showRiver ? 173 : 167, W, 15);
  ctx.fillStyle = '#553300';
  ctx.fillRect(0, showRiver ? 188 : 182, W, H - 182);
}

// =====================================================================
// MUSIC SYSTEM (Web Audio API Chiptune)
// =====================================================================
const NOTE_FREQ = {
  'C3': 130.81, 'D3': 146.83, 'G2': 98.00, 'A2': 110.00,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'G4': 392.00,
  'A4': 440.00, 'C5': 523.25, 'REST': 0
};

const melody = [
  { note: 'E4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'G4', dur: 1 },
  { note: 'E4', dur: 1 }, { note: 'D4', dur: 1 }, { note: 'C4', dur: 1 }, { note: 'REST', dur: 1 },
  { note: 'E4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'C5', dur: 1 },
  { note: 'A4', dur: 2 }, { note: 'G4', dur: 2 },
  { note: 'C4', dur: 1 }, { note: 'D4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'G4', dur: 1 },
  { note: 'A4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'D4', dur: 1 },
  { note: 'C4', dur: 1 }, { note: 'E4', dur: 1 }, { note: 'G4', dur: 1 }, { note: 'E4', dur: 1 },
  { note: 'D4', dur: 1 }, { note: 'C4', dur: 3 }
];

const bassLine = [
  { note: 'C3', dur: 4 }, { note: 'A2', dur: 4 }, { note: 'C3', dur: 4 }, { note: 'A2', dur: 4 },
  { note: 'C3', dur: 4 }, { note: 'G2', dur: 4 }, { note: 'D3', dur: 4 }, { note: 'C3', dur: 4 }
];

let musicScheduleTimer = null;
let nextMelodyTime = 0;
let nextBassTime = 0;

var masterGain = null;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(audioCtx.destination);
    musicInitialized = true;
  } catch (e) {
    console.warn('Web Audio not available:', e);
  }
}

function playNote(freq, startTime, duration, type, gainVal) {
  if (!audioCtx || freq === 0) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  // Envelope: attack then decay
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
  gain.gain.setValueAtTime(gainVal, startTime + duration * 0.75);
  gain.gain.linearRampToValueAtTime(0.001, startTime + duration * 0.95);
  osc.connect(gain);
  gain.connect(masterGain || audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function scheduleLoop() {
  if (!musicPlaying || !audioCtx) return;
  const bpm = 110;
  const quarterDur = 60 / bpm;
  const now = audioCtx.currentTime;

  // Schedule melody
  let t = now + 0.05;
  for (const note of melody) {
    const dur = note.dur * quarterDur;
    if (note.note !== 'REST') {
      playNote(NOTE_FREQ[note.note], t, dur, 'square', 0.06);
    }
    t += dur;
  }

  // Schedule bass
  let tb = now + 0.05;
  for (const note of bassLine) {
    const dur = note.dur * quarterDur;
    playNote(NOTE_FREQ[note.note], tb, dur, 'triangle', 0.08);
    tb += dur;
  }

  // Total loop duration in beats: melody has 32 quarter beats = 32 * quarterDur
  const totalBeats = 32;
  const loopDurationMs = totalBeats * quarterDur * 1000;

  musicScheduleTimer = setTimeout(scheduleLoop, loopDurationMs - 200);
}

function startMusic() {
  if (!musicInitialized) initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  if (masterGain) masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
  musicPlaying = true;
  scheduleLoop();
  updateMusicIndicator();
}

function stopMusic() {
  musicPlaying = false;
  if (musicScheduleTimer) {
    clearTimeout(musicScheduleTimer);
    musicScheduleTimer = null;
  }
  if (masterGain) masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  updateMusicIndicator();
}

function toggleMusic() {
  if (!musicInitialized) initAudio();
  if (musicPlaying) {
    stopMusic();
    try { localStorage.setItem('coderegon-trail:music', 'off'); } catch(e) {}
  } else {
    startMusic();
    try { localStorage.setItem('coderegon-trail:music', 'on'); } catch(e) {}
  }
  renderStatusBar();
}

function updateMusicIndicator() {
  const el = document.getElementById('music-indicator');
  if (!el) return;
  el.textContent = musicPlaying ? 'M: Music ON' : 'M: Music OFF';
  el.style.color = musicPlaying ? '#55FF55' : '#555555';
}

// =====================================================================
// SYNTAX HIGHLIGHTING — Shiki (CDN) with EGA fallback
// =====================================================================
const shikiCache = {};
let shikiReady = false;

const SHIKI_LANG_ALIASES = {
  'c#': 'csharp',
  'c++': 'cpp',
  'objective-c': 'objc',
  'shell': 'bash',
  'sh': 'bash',
  'zsh': 'bash',
  'plaintext': 'text',
  'txt': 'text',
};

function normalizeShikiLang(lang) {
  if (!lang) return 'typescript';
  const lower = String(lang).toLowerCase().trim();
  return SHIKI_LANG_ALIASES[lower] || lower;
}

(async function loadShiki() {
  try {
    const { codeToHtml } = await import('https://esm.sh/shiki@3.2.1/bundle/full');
    for (const stop of TRAIL_DATA.stops) {
      const lang = normalizeShikiLang(stop.code.language);
      try {
        shikiCache[stop.name] = await codeToHtml(stop.code.content, {
          lang,
          theme: 'github-dark',
        });
      } catch (langErr) {
        console.warn('Shiki: language "' + lang + '" failed for stop "' + stop.name + '", falling back to text:', langErr);
        shikiCache[stop.name] = await codeToHtml(stop.code.content, {
          lang: 'text',
          theme: 'github-dark',
        });
      }
    }
    shikiReady = true;
    if (gameState === STATES.STOP) renderStopScreen();
  } catch (e) {
    console.warn('Shiki failed to load, using basic highlighter:', e);
  }
})();

// Fallback EGA highlighter
const TS_KEYWORDS = new Set([
  'import', 'export', 'from', 'const', 'let', 'var', 'function', 'async',
  'await', 'return', 'if', 'else', 'for', 'while', 'new', 'typeof', 'instanceof',
  'interface', 'type', 'class', 'extends', 'implements', 'try', 'catch', 'throw',
  'default', 'switch', 'case', 'break', 'continue', 'true', 'false', 'null',
  'undefined', 'void', 'of', 'in', 'do', 'then', 'fi', 'done', 'echo', 'cat',
  'cd', 'pwd', 'set', 'git', 'IF', 'BLOCK', 'RETURN'
]);

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightCode(code) {
  return code.split('\n').map(function(line) {
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return '<span style="color:#555555">' + escHtml(line) + '</span>';
    }
    var result = '';
    var i = 0;
    while (i < line.length) {
      // String literal
      if (line[i] === "'" || line[i] === '"' || line[i] === '`') {
        var quote = line[i];
        var end = i + 1;
        while (end < line.length && line[end] !== quote) {
          if (line[end] === '\\') end++;
          end++;
        }
        end = Math.min(end + 1, line.length);
        result += '<span style="color:#FFFF55">' + escHtml(line.substring(i, end)) + '</span>';
        i = end;
        continue;
      }
      // Inline comment
      if (line[i] === '/' && i + 1 < line.length && line[i + 1] === '/') {
        result += '<span style="color:#555555">' + escHtml(line.substring(i)) + '</span>';
        break;
      }
      if (line[i] === '#') {
        result += '<span style="color:#555555">' + escHtml(line.substring(i)) + '</span>';
        break;
      }
      // Number
      if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
        var end2 = i;
        while (end2 < line.length && /[\d._]/.test(line[end2])) end2++;
        result += '<span style="color:#FF55FF">' + escHtml(line.substring(i, end2)) + '</span>';
        i = end2;
        continue;
      }
      // Identifier or keyword
      if (/[a-zA-Z_$]/.test(line[i])) {
        var end3 = i;
        while (end3 < line.length && /[\w$]/.test(line[end3])) end3++;
        var word = line.substring(i, end3);
        if (TS_KEYWORDS.has(word)) {
          result += '<span style="color:#55FFFF">' + escHtml(word) + '</span>';
        } else {
          result += '<span style="color:#55FF55">' + escHtml(word) + '</span>';
        }
        i = end3;
        continue;
      }
      // Punctuation / operators
      result += '<span style="color:#AAAAAA">' + escHtml(line[i]) + '</span>';
      i++;
    }
    return result;
  }).join('\n');
}

// =====================================================================
// TEXT PANEL RENDERING
// =====================================================================
var textPanel = document.getElementById('text-panel');
var statusBar = document.getElementById('status-bar');

// Mobile controls overlay
(function initMobileControls() {
  var mc = document.createElement('div');
  mc.id = 'mobile-controls';
  mc.innerHTML =
    '<button id="mc-code" title="View code" aria-label="View code for this stop">&lt;/&gt;</button>' +
    '<button id="mc-hint" title="Hint" aria-label="Use hint">?</button>' +
    '<button id="mc-music" title="Music" aria-label="Toggle music">\u266B</button>' +
    '<button id="mc-back" title="Back" aria-label="Back to trail select">\u2190</button>';
  document.getElementById('game-container').appendChild(mc);
  document.getElementById('mc-code').addEventListener('click', function(e) { e.stopPropagation(); toggleCodeModal(); });
  document.getElementById('mc-hint').addEventListener('click', function(e) { e.stopPropagation(); handleEventHint(); });
  document.getElementById('mc-music').addEventListener('click', function(e) { e.stopPropagation(); if (!musicInitialized) initAudio(); toggleMusic(); });
  document.getElementById('mc-back').addEventListener('click', function(e) { e.stopPropagation(); window.location.href = '../'; });
})();

// Code modal — lets players pull up the current stop's code while answering a question
(function initCodeModal() {
  var cm = document.createElement('div');
  cm.id = 'code-modal';
  cm.innerHTML =
    '<div id="code-modal-header">' +
      '<div id="code-modal-title"></div>' +
      '<button id="code-modal-close" aria-label="Close code viewer">Close (V)</button>' +
    '</div>' +
    '<div id="code-modal-file"></div>' +
    '<div id="code-modal-content"></div>';
  document.getElementById('game-container').appendChild(cm);
  cm.addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('code-modal-close').addEventListener('click', function(e) {
    e.stopPropagation();
    closeCodeModal();
  });
})();

var codeModalOpen = false;

function canShowCodeModal() {
  if (gameState !== STATES.EVENT && gameState !== STATES.RIVER) return false;
  return !!(TRAIL_DATA.stops[currentStop] && TRAIL_DATA.stops[currentStop].code);
}

function openCodeModal() {
  if (!canShowCodeModal()) return;
  var stop = TRAIL_DATA.stops[currentStop];
  var useShiki = shikiReady && shikiCache[stop.name];
  var codeHtml = useShiki ? shikiCache[stop.name] : highlightCode(stop.code.content);
  var codeBoxClass = 'code-box expanded' + (useShiki ? ' shiki-rendered' : '');
  var fileLink = TRAIL_DATA.repoUrl
    ? '<a href="' + TRAIL_DATA.repoUrl + '/blob/main/' + escHtml(stop.code.file) + '" target="_blank" style="color:#55AAFF; text-decoration:none;">' + escHtml(stop.code.file) + '</a>'
    : escHtml(stop.code.file);
  document.getElementById('code-modal-title').textContent = stop.name + ' — ' + stop.subtitle;
  document.getElementById('code-modal-file').innerHTML = '┌─ ' + fileLink + ' ───';
  document.getElementById('code-modal-content').innerHTML = '<div class="' + codeBoxClass + '">' + codeHtml + '</div>';
  document.getElementById('code-modal').style.display = 'block';
  codeModalOpen = true;
  trackEvent('trail_view_code', { game: getGameSlug(), stop: currentStop });
}

function closeCodeModal() {
  document.getElementById('code-modal').style.display = 'none';
  codeModalOpen = false;
}

function toggleCodeModal() {
  if (codeModalOpen) closeCodeModal();
  else openCodeModal();
}

// Touch: tap on canvas or text panel = space/enter
(function initTouchInput() {
  var tapTarget = document.getElementById('game-container');
  tapTarget.addEventListener('click', function(e) {
    // Don't intercept clicks on interactive elements
    var tag = e.target.tagName;
    if (tag === 'BUTTON' || tag === 'A') return;
    if (e.target.classList.contains('choice-item') || e.target.classList.contains('stop-opt')) return;
    if (e.target.closest && (e.target.closest('.choice-item') || e.target.closest('.stop-opt') || e.target.closest('.code-box') || e.target.closest('#mobile-controls') || e.target.closest('#code-modal'))) return;
    // Don't advance game when code modal is open
    if (codeModalOpen) return;
    // Don't intercept setup difficulty taps (handled by their own onclick)
    if (e.target.closest && e.target.closest('[onclick*="selectDifficulty"]')) return;

    // Simulate space bar press
    switch (gameState) {
      case STATES.TITLE:
        ensureAudio();
        gameState = STATES.SETUP;
        renderSetupScreen();
        renderStatusBar();
        break;
      case STATES.SETUP:
        ensureAudio();
        startGame();
        break;
      case STATES.TRAVEL:
        advanceFromTravel();
        break;
      case STATES.STOP:
        handleStopChoice(selectedStopChoice + 1);
        break;
      case STATES.EVENT:
      case STATES.RIVER:
        if (!eventAnswered) {
          var ev = pendingEvents[currentEventIndex];
          if (ev && ev.type === 'fortune') advanceFromEvent();
          // For quiz events, tapping the container does nothing — tap choices directly
        } else {
          if (checkDeath()) return;
          advanceFromEvent();
        }
        break;
      case STATES.DEATH:
        resetGame();
        renderTitleScreen();
        renderStatusBar();
        break;
      case STATES.WIN:
        resetGame();
        renderTitleScreen();
        renderStatusBar();
        break;
    }
  });

  // Swipe up/down on text panel for choice navigation
  var touchStartY = 0;
  var touchStartX = 0;
  var swipeHandled = false;
  textPanel.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    swipeHandled = false;
  }, { passive: true });
  textPanel.addEventListener('touchmove', function(e) {
    if (swipeHandled) return;
    var dy = e.touches[0].clientY - touchStartY;
    var dx = e.touches[0].clientX - touchStartX;
    if (Math.abs(dy) < 30 || Math.abs(dx) > Math.abs(dy)) return; // too small or horizontal
    swipeHandled = true;
    e.preventDefault(); // prevent scroll during choice navigation
    var dir = dy < 0 ? 1 : -1; // swipe up = next, swipe down = prev
    if (gameState === STATES.SETUP) {
      selectDifficulty((selectedDifficulty + dir + PROFESSIONS.length) % PROFESSIONS.length);
    } else if ((gameState === STATES.EVENT || gameState === STATES.RIVER) && !eventAnswered) {
      var ev = pendingEvents[currentEventIndex];
      if (ev && ev.choices.length > 0) {
        var n = ev.choices.length;
        selectedEventChoice = selectedEventChoice < 0 ? (dir > 0 ? 0 : n - 1) : (selectedEventChoice + dir + n) % n;
        if (eventHinted && dimmedChoice === selectedEventChoice) selectedEventChoice = (selectedEventChoice + dir + n) % n;
        updateChoiceHighlight();
      }
    } else if (gameState === STATES.STOP) {
      selectedStopChoice = selectedStopChoice === 0 ? 1 : 0;
      updateStopHighlight();
    }
  }, { passive: false });
})();

// Helper: returns mobile-friendly action text
function actionText(verb) {
  return isMobile ? 'Tap to ' + verb : 'Press SPACE BAR to ' + verb;
}

function setTextPanel(html) {
  textPanel.classList.remove('code-expanded');
  textPanel.innerHTML = html;
  textPanel.scrollTop = 0;
}

function toggleCodeExpand(el) {
  if (!el) return;
  el.classList.toggle('expanded');
  textPanel.classList.toggle('code-expanded', el.classList.contains('expanded'));
  var hint = document.getElementById('code-expand-hint');
  if (hint) hint.textContent = el.classList.contains('expanded') ? 'click code to collapse' : 'click code to expand';
}

function renderTitleScreen() {
  setTextPanel(
    '<div style="text-align:center; padding-top:20px;">' +
    '<div style="color:#FFFF55; font-size:16px; letter-spacing:2px;">THE CODEREGON TRAIL</div>' +
    '<div style="color:#AAAAAA; margin-top:8px;">' + escHtml(TRAIL_DATA.trailName) + '</div>' +
    (TRAIL_DATA.sourceInfo ? '<div style="color:#555555; margin-top:4px; font-size:10px;">Source: ' + TRAIL_DATA.sourceInfo.repo + ' @ ' + TRAIL_DATA.sourceInfo.commit + (TRAIL_DATA.sourceInfo.tag ? ' (' + TRAIL_DATA.sourceInfo.tag + ')' : '') + ' \u2014 ' + TRAIL_DATA.sourceInfo.snapshotDate + '</div>' : '') +
    '<div style="margin-top:30px;" class="blink">' + actionText('begin') + '</div>' +
    '</div>'
  );
}

function renderSetupScreen() {
  var profsHtml = '';
  for (var i = 0; i < PROFESSIONS.length; i++) {
    var p = PROFESSIONS[i];
    var sel = (i === selectedDifficulty);
    var color = sel ? '#FFFF55' : '#AAAAAA';
    var marker = sel ? '>' : ' ';
    var perks = 'HP:' + p.health + '  Hints:' + p.supplies + '  Party HP:' + p.partyMaxHp;
    if (p.hintFree) perks += '  (free hints!)';
    if (p.healOnCorrect === 0) perks += '  (no heal)';
    profsHtml += '<div style="color:' + color + '; cursor:pointer;" onclick="selectDifficulty(' + i + ')">' +
             marker + ' [' + (i + 1) + '] ' + p.name + '</div>';
    profsHtml += '<div style="color:' + (sel ? '#AAAAAA' : '#555555') + '; margin-left:28px; font-size:12px;">' + p.desc + '  ' + perks + '</div>';
  }

  var hearts = '\u2665\u2665\u2665';
  setTextPanel(
    '<div style="padding:8px 20px;">' +
    '<div style="color:#55FFFF; margin-bottom:10px;">Your party of key concepts:</div>' +
    '<div style="margin-left:16px;">' +
    TRAIL_DATA.partyMembers.map(function(m, i) {
      return '<div style="color:#55FF55;">' + (i + 1) + '. ' + escHtml(m.name) + '  <span style="color:#FF5555">' + hearts + '</span></div>';
    }).join('') +
    '</div>' +
    '<div style="color:#55FFFF; margin-top:14px; margin-bottom:6px;">What is your profession?</div>' +
    '<div style="margin-left:16px;">' + profsHtml + '</div>' +
    '<div style="margin-top:18px; text-align:center;" class="blink">' + (isMobile ? 'Tap to hit the trail!' : 'Press ENTER to hit the trail!') + '</div>' +
    '</div>'
  );
}

function renderTravelScreen() {
  var flavor = travelFlavors[travelFlavorIndex % travelFlavors.length];
  setTextPanel(
    '<div style="text-align:center; padding-top:30px;">' +
    '<div style="color:#FFFF55;">Day ' + day + '...</div>' +
    '<div style="color:#AAAAAA; margin-top:12px;">' + escHtml(flavor) + '</div>' +
    '<div style="margin-top:24px; color:#555555;" class="blink">' + actionText('continue') + '</div>' +
    '</div>'
  );
}

function renderStopScreen() {
  var stop = TRAIL_DATA.stops[currentStop];
  if (!stop) return;

  var useShiki = shikiReady && shikiCache[stop.name];
  var codeHtml = useShiki ? shikiCache[stop.name] : highlightCode(stop.code.content);
  var codeBoxClass = 'code-box' + (useShiki ? ' shiki-rendered' : '');
  var fileLink = TRAIL_DATA.repoUrl
    ? '<a href="' + TRAIL_DATA.repoUrl + '/blob/main/' + escHtml(stop.code.file) + '" target="_blank" style="color:#55AAFF; text-decoration:none;">' + escHtml(stop.code.file) + '</a>'
    : escHtml(stop.code.file);
  setTextPanel(
    '<div style="padding:4px 12px;">' +
    '<div style="color:#FFFF55; text-align:center; font-size:14px;">\u2550\u2550 ' + escHtml(stop.name) + ' \u2014 ' + escHtml(stop.subtitle) + ' \u2550\u2550</div>' +
    '<div style="color:#555555; text-align:center; font-size:11px; margin-bottom:4px;">[' + escHtml(stop.concept) + ']</div>' +
    '<div style="border:1px solid #555555; padding:2px 4px; margin:4px 0 2px 0; font-size:11px; color:#AAAAAA;">\u250C\u2500 ' + fileLink + ' \u2500\u2500\u2500</div>' +
    '<div class="' + codeBoxClass + '" onclick="toggleCodeExpand(this)">' + codeHtml + '</div>' +
    '<div style="color:#555555; font-size:10px; text-align:right; margin:-4px 0 4px 0; cursor:pointer;" onclick="toggleCodeExpand(this.previousElementSibling)" id="code-expand-hint">click code to expand</div>' +
    '<div style="color:#AAAAAA; margin:6px 0; line-height:1.4; font-size:13px;">' + escHtml(stop.narration) + '</div>' +
    '<div style="margin-top:8px;" id="stop-choices">' +
    '<span class="stop-opt' + (selectedStopChoice === 0 ? ' choice-selected' : '') + '" onclick="handleStopChoice(1)">[1] Continue</span>' +
    '<span class="stop-opt' + (selectedStopChoice === 1 ? ' choice-selected' : '') + '" style="margin-left:20px;" onclick="handleStopChoice(2)">[2] Examine code</span>' +
    '</div>' +
    '</div>'
  );
}

function renderEventScreen(event) {
  var isRiver = event.type === 'river';
  var isFortune = event.type === 'fortune';
  var typeLabel, headerColor;

  if (isRiver) {
    typeLabel = '\uD83C\uDF0A RIVER CROSSING';
    headerColor = '#5555FF';
  } else if (event.type === 'weather') {
    typeLabel = '\u26A1 WEATHER';
    headerColor = '#FFFF55';
  } else if (event.type === 'encounter') {
    typeLabel = '\uD83D\uDC64 ENCOUNTER';
    headerColor = '#FFFF55';
  } else if (event.type === 'misfortune') {
    typeLabel = '\u2620 MISFORTUNE';
    headerColor = '#FF5555';
  } else {
    typeLabel = '\u2728 FORTUNE';
    headerColor = '#55FF55';
  }

  var choicesHtml = '';
  if (event.choices.length > 0 && !eventAnswered) {
    var labels = ['A', 'B', 'C', 'D'];
    for (var i = 0; i < shuffledIndices.length; i++) {
      var origIdx = shuffledIndices[i];
      var dimmedClass = (eventHinted && dimmedChoice === i) ? ' choice-dimmed' : '';
      var selClass = (selectedEventChoice === i) ? ' choice-selected' : '';
      choicesHtml += '<div class="choice-item' + dimmedClass + selClass + '" onclick="handleEventChoice(' + i + ')" style="margin:4px 0;">  ' + labels[i] + '. ' + escHtml(event.choices[origIdx].text) + '</div>';
    }
    var hintAvail = (PROFESSIONS[difficulty] && PROFESSIONS[difficulty].hintFree) || supplies > 0;
    var hintLabel = (PROFESSIONS[difficulty] && PROFESSIONS[difficulty].hintFree) ? 'H = Free Hint' : 'H = Hint (-1 supply)';
    var codeLabel = isMobile ? 'Use </> button for code' : 'V = View code';
    choicesHtml += '<div style="margin-top:10px; color:#555555;">' + (isMobile ? 'Tap a choice or swipe \u2191\u2193' : 'Arrow keys + Enter to choose') + (hintAvail ? '  |  ' + (isMobile ? 'Use ? button for hint' : hintLabel) : '') + '  |  ' + codeLabel + '</div>';
  } else if (isFortune) {
    choicesHtml = '<div style="color:#55FF55; margin-top:8px;">+20 Health restored!</div>' +
                  '<div style="margin-top:10px;" class="blink">' + actionText('continue') + '</div>';
  }

  setTextPanel(
    '<div style="padding:4px 12px;">' +
    '<div style="color:' + headerColor + '; font-size:14px; text-align:center;">' + typeLabel + ' \u2014 ' + escHtml(event.title) + '</div>' +
    '<div style="color:#FFFFFF; margin:8px 0; line-height:1.4;">' + escHtml(event.text) + '</div>' +
    '<div id="event-choices">' + choicesHtml + '</div>' +
    '<div id="event-result"></div>' +
    '</div>'
  );
}

function showEventResult(event, displayIdx) {
  var origIdx = shuffledIndices[displayIdx];
  var choice = event.choices[origIdx];
  var correct = choice.correct;
  var isRiver = event.type === 'river';

  var resultHtml = '';
  var prof = PROFESSIONS[difficulty];
  if (correct) {
    var heal = prof.healOnCorrect || 0;
    var bonus = streak >= 3 ? ' (+5 streak bonus!)' : '';
    var healText = heal > 0 ? ' +' + heal + ' Health' : '';
    resultHtml = '<div style="color:#55FF55; margin-top:8px; font-size:14px;">CORRECT!' + healText + bonus + '</div>';
  } else {
    var dmg = isRiver ? prof.riverDmg : prof.wrongDmg;
    resultHtml = '<div style="color:#FF5555; margin-top:8px; font-size:14px;">WRONG! -' + dmg + ' Health</div>';
    document.getElementById('game-container').classList.add('shake');
    setTimeout(function() { document.getElementById('game-container').classList.remove('shake'); }, 500);
  }
  resultHtml += '<div style="color:#AAAAAA; margin-top:6px; line-height:1.4;">' + escHtml(choice.explanation) + '</div>';
  resultHtml += '<div style="margin-top:10px;" class="blink">' + actionText('continue') + '</div>';

  // Update choices display in shuffled order
  var labels = ['A', 'B', 'C', 'D'];
  var choicesHtml = '';
  for (var i = 0; i < shuffledIndices.length; i++) {
    var oi = shuffledIndices[i];
    var c = event.choices[oi];
    var cls = c.correct ? 'choice-correct' : (i === displayIdx ? 'choice-wrong' : 'text-gray');
    var marker = c.correct ? '\u2713' : (i === displayIdx ? '\u2717' : ' ');
    choicesHtml += '<div class="' + cls + '" style="margin:4px 0;">' + marker + ' ' + labels[i] + '. ' + escHtml(c.text) + '</div>';
  }

  var choicesEl = document.getElementById('event-choices');
  if (choicesEl) choicesEl.innerHTML = choicesHtml;
  var resultEl = document.getElementById('event-result');
  if (resultEl) resultEl.innerHTML = resultHtml;
}

function renderDeathScreen() {
  var deathMsg;
  if (techDebtDeath) {
    var techDebtMsgs = [
      'You have died of tech debt dysentery.',
    ];
    deathMsg = techDebtMsgs[Math.floor(Math.random() * techDebtMsgs.length)];
    techDebtDeath = false;
  } else {
    deathMsg = TRAIL_DATA.deathMessages[Math.floor(Math.random() * TRAIL_DATA.deathMessages.length)];
  }

  setTextPanel(
    '<div style="text-align:center; padding-top:16px;">' +
    '<div style="display:inline-block; border:2px solid #33FF33; padding:10px 24px; min-width:280px;">' +
    '<span id="death-text" style="color:#33FF33; font-size:16px;"></span>' +
    '</div>' +
    '<div style="color:#1a8a1a; margin-top:14px; font-size:13px;">Stops: ' + currentStop + '/' + TRAIL_DATA.stops.length + '  Score: ' + score + '/' + totalQuestions + '  Streak: ' + bestStreak + '</div>' +
    '<div style="color:#33FF33; margin-top:14px;" class="blink">' + actionText('try again') + '</div>' +
    '<div style="color:#555555; margin-top:6px; font-size:12px;">' + (isMobile ? 'Use \u2190 button for trail select' : 'Press Q to return to trail select') + '</div>' +
    '</div>'
  );

  // Typewriter animation
  typewriterText = deathMsg;
  typewriterIndex = 0;
  if (typewriterTimer) clearInterval(typewriterTimer);
  typewriterTimer = setInterval(function() {
    var el = document.getElementById('death-text');
    if (!el) { clearInterval(typewriterTimer); return; }
    typewriterIndex++;
    el.textContent = typewriterText.substring(0, typewriterIndex);
    if (typewriterIndex >= typewriterText.length) clearInterval(typewriterTimer);
  }, 50);
}

function renderWinScreen() {
  var survivors = partyHealth.filter(function(h) { return h > 0; }).length;
  var pctScore = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 100;

  var conceptNames = TRAIL_DATA.partyMembers.map(function(p) { return p.name; });

  var masteryHtml = '';
  var weakestName = '';
  var weakestPct = 101;
  for (var i = 0; i < conceptNames.length; i++) {
    var cs = conceptScores[conceptNames[i]] || { correct: 0, total: 0 };
    var pct = cs.total > 0 ? Math.round((cs.correct / cs.total) * 100) : 100;
    var scoreText, color;
    if (cs.total === 0) {
      scoreText = '<span style="color:#555555;">(no questions)</span>';
      color = '#555555';
    } else if (cs.correct === cs.total) {
      scoreText = '<span style="color:#55FF55;">' + cs.correct + '/' + cs.total + ' \u2713</span>';
      color = '#55FF55';
    } else {
      scoreText = '<span style="color:#FFFF55;">' + cs.correct + '/' + cs.total + '</span>';
      color = '#FFFF55';
    }
    if (cs.total > 0 && pct < weakestPct) { weakestPct = pct; weakestName = conceptNames[i]; }
    masteryHtml += '<div style="color:' + color + ';">    ' + conceptNames[i] + '  ' + scoreText + '</div>';
  }

  var tip = weakestPct < 100 ? '"Study up on ' + weakestName + '!"' : '"Perfect understanding!"';

  setTextPanel(
    '<div style="padding:8px 16px;">' +
    '<div style="color:#FFFF55; text-align:center; font-size:16px;">\u2605 YOU MADE IT TO ' + escHtml(TRAIL_DATA.stops[TRAIL_DATA.stops.length - 1].name).toUpperCase() + '! \u2605</div>' +
    '<div style="margin-top:10px; color:#AAAAAA;">' +
    '<div>  Trail:        <span style="color:#55FFFF;">' + escHtml(TRAIL_DATA.trailName) + '</span></div>' +
    '<div>  Survivors:    <span style="color:#55FF55;">' + survivors + '/' + partyHealth.length + '</span></div>' +
    '<div>  Quiz Score:   <span style="color:#FFFF55;">' + score + '/' + totalQuestions + ' (' + pctScore + '%)</span></div>' +
    '<div>  Best Streak:  <span style="color:#FF55FF;">' + bestStreak + '</span></div>' +
    '<div>  Hints Used:   <span style="color:#AAAAAA;">' + hintsUsed + '</span></div>' +
    '</div>' +
    '<div style="margin-top:10px; color:#FFFF55;">  Concept Mastery:</div>' +
    '<div>' + masteryHtml + '</div>' +
    '<div style="margin-top:10px; color:#55FF55; text-align:center;">' + tip + '</div>' +
    '<div style="margin-top:12px; text-align:center;">' +
    '<button onclick="copyProofToClipboard()" style="background:#003300; border:1px solid #55FF55; color:#55FF55; font-family:monospace; font-size:13px; padding:4px 14px; cursor:pointer;">[ Copy Proof of Understanding ]</button>' +
    '</div>' +
    (TRAIL_DATA.sourceInfo ? '<div style="margin-top:8px; color:#555555; font-size:10px; text-align:center;">Source: ' + TRAIL_DATA.sourceInfo.repo + ' @ ' + TRAIL_DATA.sourceInfo.commit + (TRAIL_DATA.sourceInfo.tag ? ' (' + TRAIL_DATA.sourceInfo.tag + ')' : '') + ' \u2014 ' + TRAIL_DATA.sourceInfo.snapshotDate + '</div>' : '') +
    '<div style="margin-top:8px; text-align:center; color:#555555; font-size:12px;">' + (isMobile ? 'Tap to play again  |  Use \u2190 for trail select' : 'Press C to copy  |  Press SPACE to play again  |  Press Q for trail select') + '</div>' +
    '</div>'
  );
}

// =====================================================================
// STATUS BAR
// =====================================================================
function renderStatusBar() {
  var repoLabel = TRAIL_DATA.repoUrl
    ? TRAIL_DATA.repoUrl.replace(/^https?:\/\/github\.com\//, '')
    : '';
  var repoLink = repoLabel
    ? '  |  <a href="' + TRAIL_DATA.repoUrl + '" target="_blank" style="color:#55AAFF; text-decoration:none;">' + repoLabel + '</a>'
    : '';

  if (gameState === STATES.TITLE) {
    var mToggle = isMobile ? '' : ' <span style="color:#555555;">(M)</span>';
    var titleMusic = musicPlaying
      ? 'Music: <span style="color:#55FF55;">On</span>' + mToggle
      : 'Music: <span style="color:#FF5555;">Off</span>' + mToggle;
    statusBar.innerHTML = '<span style="color:#555555;">The Coderegon Trail v1.0</span>  |  ' + titleMusic + (isMobile ? '' : '  |  <span style="color:#555555;">ESC: Trail Select</span>') + repoLink;
    return;
  }

  if (gameState === STATES.SETUP) {
    var sp = PROFESSIONS[selectedDifficulty];
    var spMaxH = sp.health;
    var spBarLen = 10;
    var spColor = spMaxH > 60 ? '#00AA00' : (spMaxH > 30 ? '#FFFF55' : '#FF5555');
    var spBar = '<span style="color:' + spColor + ';">';
    var spFilled = Math.min(Math.round((spMaxH / 100) * spBarLen), spBarLen);
    for (var si = 0; si < spFilled; si++) spBar += '\u2588';
    spBar += '</span><span style="color:#555555;">';
    for (var si2 = 0; si2 < spBarLen - spFilled; si2++) spBar += '\u2591';
    spBar += '</span>';
    var spHints = sp.hintFree ? '<span style="color:#55FF55;">\u221E</span>' : sp.supplies;
    var spPartyHp = '';
    for (var spi = 0; spi < sp.partyMaxHp; spi++) spPartyHp += '\u2665';
    var spHeal = sp.healOnCorrect > 0 ? '+' + sp.healOnCorrect : '<span style="color:#FF5555;">0</span>';
    var spDmg = '-' + sp.wrongDmg;
    statusBar.innerHTML =
      '<div style="line-height:1.3;">' +
      '<div>HP: ' + spBar + ' ' + spMaxH +
      '  Hints: ' + spHints +
      '  |  Heal: ' + spHeal +
      '  Dmg: <span style="color:#FF5555;">' + spDmg + '</span>' +
      '  Party: <span style="color:#55FF55;">' + spPartyHp + '</span>' +
      '  |  <span style="color:#555555;">' + (isMobile ? 'Swipe or tap' : '\u2190\u2192 to change') + '</span>' + repoLink + '</div>' +
      '</div>';
    return;
  }

  var maxH = maxHealthForGame;
  var healthPct = Math.max(0, health / maxH);
  var barLen = 10;
  var filled = Math.round(healthPct * barLen);
  var healthColor = health > maxH * 0.6 ? '#00AA00' : (health > maxH * 0.3 ? '#FFFF55' : '#FF5555');
  var healthBar = '<span style="color:' + healthColor + ';">';
  for (var i = 0; i < filled; i++) healthBar += '\u2588';
  healthBar += '</span><span style="color:#555555;">';
  for (var i2 = 0; i2 < barLen - filled; i2++) healthBar += '\u2591';
  healthBar += '</span>';

  var streakStars = '<span style="color:#FFFF55;">';
  for (var s = 0; s < Math.min(streak, 5); s++) streakStars += '\u2605';
  streakStars += '</span>';

  var mToggleHint = isMobile ? '' : ' <span style="color:#555555;">(M)</span>';
  var musicHint = musicPlaying
    ? 'Music: <span style="color:#55FF55;">On</span>' + mToggleHint
    : 'Music: <span style="color:#FF5555;">Off</span>' + mToggleHint;

  var profMaxHp = PROFESSIONS[difficulty] ? PROFESSIONS[difficulty].partyMaxHp : 3;
  var partyHtml = '';
  for (var pi = 0; pi < TRAIL_DATA.partyMembers.length; pi++) {
    var ph = partyHealth[pi];
    var pmMax = Math.min(TRAIL_DATA.partyMembers[pi].maxHealth, profMaxHp);
    var pName = TRAIL_DATA.partyMembers[pi].name;
    if (ph <= 0) {
      partyHtml += '<span style="color:#555555;text-decoration:line-through;">' + escHtml(pName) + '</span>';
    } else {
      var pips = '';
      for (var pp = 0; pp < ph; pp++) pips += '\u2665';
      for (var pp2 = 0; pp2 < pmMax - ph; pp2++) pips += '\u2661';
      var pColor = ph > pmMax * 0.5 ? '#55FF55' : (ph > 0 ? '#FFFF55' : '#555555');
      partyHtml += '<span style="color:#AAAAAA;">' + escHtml(pName) + '</span> <span style="color:' + pColor + ';">' + pips + '</span>';
    }
    if (pi < TRAIL_DATA.partyMembers.length - 1) partyHtml += '  <span style="color:#333;">|</span>  ';
  }

  statusBar.innerHTML =
    '<div style="line-height:1.3;">' +
    '<div>HP: ' + healthBar + ' ' + Math.max(0, health) +
    '  Hints: ' + supplies + '  ' + streakStars +
    '  |  Stop ' + Math.min(currentStop + 1, TRAIL_DATA.stops.length) + '/' + TRAIL_DATA.stops.length +
    '  |  ' + musicHint +
    '  ' + (isMobile ? '' : '|  <span style="color:#555555;">ESC: Quit</span>  ') + repoLink + '</div>' +
    '<div style="font-size:11px;margin-top:2px;">' + partyHtml + '</div>' +
    '</div>';
}

// =====================================================================
// GAME LOGIC
// =====================================================================
function resetGame() {
  gameState = STATES.TITLE;
  difficulty = 1;
  selectedDifficulty = (function() {
    try { var d = parseInt(localStorage.getItem('coderegon-trail:difficulty')); return (d >= 0 && d <= 3) ? d : 1; }
    catch(e) { return 1; }
  })();
  health = 100;
  maxHealthForGame = 100;
  supplies = 5;
  currentStop = 0;
  day = 1;
  score = 0;
  totalQuestions = 0;
  conceptScores = {};
  streak = 0;
  bestStreak = 0;
  hintsUsed = 0;
  scrollX = 0;
  showRiver = false;
  wagonWheelAngle = 0;
  travelFlavorIndex = 0;
  deathPending = false;
  partyHealth = TRAIL_DATA.partyMembers.map(function(p) { return p.maxHealth; });
  pendingEvents = [];
  currentEventIndex = 0;
  eventAnswered = false;
  eventHinted = false;
  dimmedChoice = -1;
  selectedEventChoice = -1;
  selectedStopChoice = 0;
  shuffledIndices = [];
  currentEventType = '';
  currentEventTitle = '';
  drainAccumulator = 0;
  techDebtDeath = false;
  if (travelTimer) { clearTimeout(travelTimer); travelTimer = null; }
  if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
}

function selectDifficulty(idx) {
  selectedDifficulty = Math.max(0, Math.min(PROFESSIONS.length - 1, idx));
  try { localStorage.setItem('coderegon-trail:difficulty', selectedDifficulty); } catch(e) {}
  renderSetupScreen();
  renderStatusBar();
}

function startGame() {
  difficulty = selectedDifficulty;
  var prof = PROFESSIONS[difficulty];
  health = prof.health;
  maxHealthForGame = prof.health;
  supplies = prof.supplies;
  var partyMaxHp = prof.partyMaxHp || 3;
  partyHealth = TRAIL_DATA.partyMembers.map(function(p) { return Math.min(p.maxHealth, partyMaxHp); });
  currentStop = 0;
  day = 1;
  score = 0;
  totalQuestions = 0;
  conceptScores = {};
  streak = 0;
  bestStreak = 0;
  hintsUsed = 0;
  scrollX = 0;
  deathPending = false;
  trackEvent('trail_start', {
    game: getGameSlug(),
    framework: TRAIL_DATA.framework,
    trail_name: TRAIL_DATA.trailName,
    difficulty: difficulty,
    total_stops: TRAIL_DATA.stops.length
  });
  enterTravel();
}

function enterTravel() {
  gameState = STATES.TRAVEL;
  showRiver = false;
  currentEventType = '';
  currentEventTitle = '';
  day += Math.floor(Math.random() * 7) + 1;
  travelFlavorIndex = Math.floor(Math.random() * travelFlavors.length);
  renderTravelScreen();
  renderStatusBar();

  if (travelTimer) clearTimeout(travelTimer);
  travelTimer = setTimeout(function() {
    if (gameState === STATES.TRAVEL) advanceFromTravel();
  }, 2500);
}

function advanceFromTravel() {
  if (travelTimer) { clearTimeout(travelTimer); travelTimer = null; }

  // Collect events for the current stop (triggerStop is 1-indexed relative to stop we just visited)
  // Events trigger BEFORE showing the stop
  pendingEvents = TRAIL_DATA.events.filter(function(e) { return e.triggerStop === currentStop; });
  currentEventIndex = 0;

  if (pendingEvents.length > 0) {
    showNextEvent();
  } else {
    enterStop();
  }
}

function showNextEvent() {
  if (currentEventIndex >= pendingEvents.length) {
    // After all events, check if we should die
    if (checkDeath()) return;
    enterStop();
    return;
  }

  var event = pendingEvents[currentEventIndex];
  eventAnswered = false;
  eventHinted = false;
  dimmedChoice = -1;
  selectedEventChoice = -1;
  currentEventType = event.type;
  currentEventTitle = event.title;

  // Shuffle choice order so correct answer isn't always first
  shuffledIndices = [];
  for (var si = 0; si < event.choices.length; si++) shuffledIndices.push(si);
  for (var si = shuffledIndices.length - 1; si > 0; si--) {
    var sj = Math.floor(Math.random() * (si + 1));
    var tmp = shuffledIndices[si]; shuffledIndices[si] = shuffledIndices[sj]; shuffledIndices[sj] = tmp;
  }

  if (event.type === 'river') {
    gameState = STATES.RIVER;
    showRiver = true;
  } else {
    gameState = STATES.EVENT;
    showRiver = false;
  }

  // Fortune events auto-apply health
  if (event.type === 'fortune') {
    health = Math.min(health + 20, maxHealthForGame);
    eventAnswered = true;
  }

  renderEventScreen(event);
  renderStatusBar();
}

function handleEventChoice(displayIdx) {
  if (eventAnswered) return;
  var event = pendingEvents[currentEventIndex];
  if (!event || event.choices.length === 0) return;
  if (displayIdx < 0 || displayIdx >= shuffledIndices.length) return;
  if (eventHinted && dimmedChoice === displayIdx) return;

  var prof = PROFESSIONS[difficulty];
  var forgiving = prof && prof.forgiving;
  var origIdx = shuffledIndices[displayIdx];
  var choice = event.choices[origIdx];
  var isRiver = event.type === 'river';

  if (forgiving && !choice.correct) {
    // Ralph Wiggum mode: dim the wrong answer, let them try again
    var items = document.querySelectorAll('.choice-item');
    if (items[displayIdx]) {
      items[displayIdx].classList.add('choice-dimmed');
      items[displayIdx].style.pointerEvents = 'none';
    }
    // Move selection to next available choice
    for (var ni = 0; ni < shuffledIndices.length; ni++) {
      var nextIdx = (displayIdx + 1 + ni) % shuffledIndices.length;
      if (!(eventHinted && dimmedChoice === nextIdx) && !items[nextIdx].classList.contains('choice-dimmed')) {
        selectedEventChoice = nextIdx;
        updateChoiceHighlight();
        break;
      }
    }
    return;
  }

  eventAnswered = true;

  totalQuestions++;

  // Track per-concept scores
  var concept = event.concept;
  if (!conceptScores[concept]) conceptScores[concept] = { correct: 0, total: 0 };
  conceptScores[concept].total++;
  if (choice.correct) conceptScores[concept].correct++;

  var prof = PROFESSIONS[difficulty];
  if (choice.correct) {
    var heal = prof.healOnCorrect || 0;
    var bonus = streak >= 3 ? 5 : 0;
    health = Math.min(health + heal + bonus, maxHealthForGame);
    score++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
  } else {
    var dmg = isRiver ? prof.riverDmg : prof.wrongDmg;
    health -= dmg;
    streak = 0;
    // Damage related party member
    var concept = event.concept;
    var memberIdx = -1;
    for (var mi = 0; mi < TRAIL_DATA.partyMembers.length; mi++) {
      if (TRAIL_DATA.partyMembers[mi].name === concept) { memberIdx = mi; break; }
    }
    if (memberIdx >= 0 && partyHealth[memberIdx] > 0) {
      partyHealth[memberIdx]--;
    }
  }

  showEventResult(event, displayIdx);
  renderStatusBar();
}

function handleEventHint() {
  var prof = PROFESSIONS[difficulty];
  var hintFree = prof && prof.hintFree;
  if (eventAnswered || eventHinted) return;
  if (!hintFree && supplies <= 0) return;
  var event = pendingEvents[currentEventIndex];
  if (!event || event.choices.length === 0) return;

  if (!hintFree) supplies--;
  hintsUsed++;
  eventHinted = true;

  // Find a wrong answer in display order (dimmedChoice is a display index)
  var wrongDisplayIndices = [];
  for (var i = 0; i < shuffledIndices.length; i++) {
    if (!event.choices[shuffledIndices[i]].correct) wrongDisplayIndices.push(i);
  }
  dimmedChoice = wrongDisplayIndices[Math.floor(Math.random() * wrongDisplayIndices.length)];

  renderEventScreen(event);
  renderStatusBar();
}

function updateChoiceHighlight() {
  var items = document.querySelectorAll('.choice-item');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle('choice-selected', i === selectedEventChoice);
  }
}

function updateStopHighlight() {
  var items = document.querySelectorAll('.stop-opt');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle('choice-selected', i === selectedStopChoice);
  }
}

function checkDeath() {
  if (health <= 0) {
    enterDeath();
    return true;
  }
  var allDead = true;
  for (var i = 0; i < partyHealth.length; i++) {
    if (partyHealth[i] > 0) { allDead = false; break; }
  }
  if (allDead) {
    enterDeath();
    return true;
  }
  return false;
}

function advanceFromEvent() {
  if (codeModalOpen) closeCodeModal();
  currentEventIndex++;
  if (currentEventIndex < pendingEvents.length) {
    if (checkDeath()) return;
    showNextEvent();
  } else {
    if (checkDeath()) return;
    enterStop();
  }
}

function enterStop() {
  gameState = STATES.STOP;
  showRiver = false;
  selectedStopChoice = 0;

  var stop = TRAIL_DATA.stops[currentStop];
  if (stop && stop.landmarkType === 'river') {
    showRiver = true;
  }

  trackEvent('trail_stop_reached', {
    game: getGameSlug(),
    framework: TRAIL_DATA.framework,
    stop_index: currentStop,
    stop_name: stop ? stop.name : '',
    total_stops: TRAIL_DATA.stops.length,
    progress_pct: Math.round(((currentStop + 1) / TRAIL_DATA.stops.length) * 100)
  });

  renderStopScreen();
  renderStatusBar();
}

function handleStopChoice(choice) {
  if (choice === 2) {
    var codeBox = textPanel.querySelector('.code-box');
    if (codeBox) toggleCodeExpand(codeBox);
    return;
  }

  currentStop++;
  if (currentStop >= TRAIL_DATA.stops.length) {
    enterWin();
  } else {
    enterTravel();
  }
}

function enterDeath() {
  if (codeModalOpen) closeCodeModal();
  gameState = STATES.DEATH;
  showRiver = false;
  trackEvent('trail_death', {
    game: getGameSlug(),
    framework: TRAIL_DATA.framework,
    stop_reached: currentStop,
    total_stops: TRAIL_DATA.stops.length,
    progress_pct: Math.round((currentStop / TRAIL_DATA.stops.length) * 100),
    score: score,
    total_questions: totalQuestions,
    difficulty: difficulty
  });
  renderDeathScreen();
  renderStatusBar();
}

function enterWin() {
  gameState = STATES.WIN;
  showRiver = false;
  saveCompletion();
  trackEvent('trail_win', {
    game: getGameSlug(),
    framework: TRAIL_DATA.framework,
    total_stops: TRAIL_DATA.stops.length,
    score: score,
    total_questions: totalQuestions,
    best_streak: bestStreak,
    difficulty: difficulty
  });
  renderWinScreen();
  renderStatusBar();
}

function getGameDir() {
  var path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  var parts = path.split('/');
  return parts[parts.length - 1] || TRAIL_DATA.framework;
}

function saveCompletion() {
  try {
    var key = 'coderegon-trail:' + getGameDir();
    var survivors = partyHealth.filter(function(h) { return h > 0; }).length;
    var pctScore = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 100;
    var prev = JSON.parse(localStorage.getItem(key) || 'null');
    var entry = {
      framework: TRAIL_DATA.framework,
      trailName: TRAIL_DATA.trailName,
      score: pctScore,
      survivors: survivors,
      total: partyHealth.length,
      bestStreak: bestStreak,
      completedAt: new Date().toISOString()
    };
    // Keep the best score across attempts
    if (!prev || pctScore >= prev.score) {
      localStorage.setItem(key, JSON.stringify(entry));
    }
  } catch (e) { /* localStorage unavailable */ }
}

// =====================================================================
// PROOF OF UNDERSTANDING
// =====================================================================
function generateHash() {
  var survivors = partyHealth.filter(function(h) { return h > 0; }).length;
  var identity = (TRAIL_DATA.trailTheme === 'pr')
    ? (TRAIL_DATA.prSource || TRAIL_DATA.framework)
    : TRAIL_DATA.framework;
  var raw = identity + score + totalQuestions + survivors + Date.now();
  try { return btoa(raw).substring(0, 6); } catch(e) { return 'xxxxxx'; }
}

function generateProofMarkdown() {
  var survivors = partyHealth.filter(function(h) { return h > 0; }).length;
  var pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 100;
  var isPR = TRAIL_DATA.trailTheme === 'pr';
  var identity = isPR
    ? (TRAIL_DATA.prSource || TRAIL_DATA.framework)
    : TRAIL_DATA.trailName;
  var date = new Date().toISOString().slice(0, 10);
  var hash = generateHash();

  var md = 'Coderegon Trail \u2014 ' + identity + '\n';
  md += 'Score: ' + score + '/' + totalQuestions + ' (' + pct + '%) | Survivors: ' + survivors + '/' + partyHealth.length + ' | Streak: ' + bestStreak + '\n';

  var concepts = [];
  for (var i = 0; i < TRAIL_DATA.partyMembers.length; i++) {
    var name = TRAIL_DATA.partyMembers[i].name;
    var cs = conceptScores[name] || { correct: 0, total: 0 };
    var label;
    if (cs.total === 0) {
      label = name;
    } else if (cs.correct === cs.total) {
      label = '\u2713 ' + name + ' ' + cs.correct + '/' + cs.total;
    } else {
      label = name + ' ' + cs.correct + '/' + cs.total;
    }
    concepts.push(label);
  }
  md += concepts.join(' \u00B7 ') + '\n';

  if (isPR && TRAIL_DATA.prUrl) {
    md += TRAIL_DATA.prUrl + '\n';
  }

  // Add shareable hub link
  var gameDir = getGameDir();
  var hubBase = window.location.href.replace(/\/[^\/]+\/index\.html.*$/, '/').replace(/\/[^\/]+\/$/, '/');
  if (hubBase && !isPR) {
    md += hubBase + '?game=' + gameDir + '\n';
  }

  md += hash + ' \u00B7 ' + date + '\n';
  return md;
}

function copyProofToClipboard() {
  var md = generateProofMarkdown();
  function showFeedback() {
    var fb = document.getElementById('copy-feedback');
    if (!fb) {
      fb = document.createElement('div');
      fb.id = 'copy-feedback';
      fb.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#003300;border:1px solid #55FF55;color:#55FF55;padding:6px 16px;font-family:monospace;font-size:13px;z-index:999;';
      document.body.appendChild(fb);
    }
    fb.textContent = 'Copied to clipboard!';
    setTimeout(function() { if (fb.parentNode) fb.parentNode.removeChild(fb); }, 2000);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(md).then(showFeedback).catch(function() {
      fallbackCopy(md); showFeedback();
    });
  } else {
    fallbackCopy(md); showFeedback();
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(ta);
}

// =====================================================================
// INPUT HANDLING
// =====================================================================
function ensureAudio() {
  if (!musicInitialized) {
    initAudio();
    // Auto-start music if user previously toggled it on
    try { if (localStorage.getItem('coderegon-trail:music') === 'on') startMusic(); } catch(e) {}
  }
}

document.addEventListener('keydown', function(e) {
  var key = e.key;

  // Music toggle always works
  if (key === 'm' || key === 'M') {
    if (!musicInitialized) initAudio();
    toggleMusic();
    return;
  }

  // Escape: close code modal if open, otherwise quit to hub
  if (key === 'Escape') {
    if (codeModalOpen) {
      e.preventDefault();
      closeCodeModal();
      return;
    }
    e.preventDefault();
    window.location.href = '../';
    return;
  }

  // Quit to hub — Q from title/death/win
  if ((key === 'q' || key === 'Q') && (gameState === STATES.TITLE || gameState === STATES.DEATH || gameState === STATES.WIN)) {
    e.preventDefault();
    window.location.href = '../';
    return;
  }

  // View code shortcut — V during a question pulls up the current stop's code
  if ((key === 'v' || key === 'V') && (gameState === STATES.EVENT || gameState === STATES.RIVER)) {
    e.preventDefault();
    toggleCodeModal();
    return;
  }

  // When the code modal is open, don't forward other keys to game logic
  if (codeModalOpen) return;

  // Start audio on first interaction
  if (!musicInitialized) ensureAudio();

  switch (gameState) {
    case STATES.TITLE:
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        gameState = STATES.SETUP;
        renderSetupScreen();
        renderStatusBar();
      }
      break;

    case STATES.SETUP:
      if (key === 'ArrowDown' || key === 'ArrowRight') {
        e.preventDefault();
        selectDifficulty((selectedDifficulty + 1) % PROFESSIONS.length);
      } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
        e.preventDefault();
        selectDifficulty((selectedDifficulty - 1 + PROFESSIONS.length) % PROFESSIONS.length);
      } else if (key === '1') selectDifficulty(0);
      else if (key === '2') selectDifficulty(1);
      else if (key === '3') selectDifficulty(2);
      else if (key === '4') selectDifficulty(3);
      else if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        startGame();
      }
      break;

    case STATES.TRAVEL:
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        advanceFromTravel();
      }
      break;

    case STATES.STOP:
      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        e.preventDefault();
        selectedStopChoice = (key === 'ArrowLeft') ? 0 : 1;
        updateStopHighlight();
      } else if (key === 'ArrowUp' || key === 'ArrowDown') {
        e.preventDefault();
        selectedStopChoice = selectedStopChoice === 0 ? 1 : 0;
        updateStopHighlight();
      } else if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        handleStopChoice(selectedStopChoice + 1);
      } else if (key === '1') {
        handleStopChoice(1);
      } else if (key === '2') {
        handleStopChoice(2);
      }
      break;

    case STATES.EVENT:
    case STATES.RIVER:
      if (!eventAnswered) {
        var ev = pendingEvents[currentEventIndex];
        if (ev && ev.choices.length > 0) {
          var numChoices = ev.choices.length;
          if (key === 'ArrowDown' || key === 'ArrowRight') {
            e.preventDefault();
            selectedEventChoice = selectedEventChoice < 0 ? 0 : (selectedEventChoice + 1) % numChoices;
            // Skip dimmed choice
            if (eventHinted && dimmedChoice === selectedEventChoice) selectedEventChoice = (selectedEventChoice + 1) % numChoices;
            updateChoiceHighlight();
          } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
            e.preventDefault();
            selectedEventChoice = selectedEventChoice < 0 ? numChoices - 1 : (selectedEventChoice - 1 + numChoices) % numChoices;
            if (eventHinted && dimmedChoice === selectedEventChoice) selectedEventChoice = (selectedEventChoice - 1 + numChoices) % numChoices;
            updateChoiceHighlight();
          } else if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            if (selectedEventChoice >= 0 && !(eventHinted && dimmedChoice === selectedEventChoice)) {
              handleEventChoice(selectedEventChoice);
            }
          } else if (key === '1' || key === 'a' || key === 'A') handleEventChoice(0);
          else if (key === '2' || key === 'b' || key === 'B') handleEventChoice(1);
          else if (key === '3' || key === 'c' || key === 'C') handleEventChoice(2);
          else if (key === 'h' || key === 'H') handleEventHint();
        }
        // Fortune: space/enter to continue
        if (ev && ev.type === 'fortune' && (key === ' ' || key === 'Enter')) {
          e.preventDefault();
          advanceFromEvent();
        }
      } else {
        if (key === ' ' || key === 'Enter') {
          e.preventDefault();
          if (checkDeath()) return;
          advanceFromEvent();
        }
      }
      break;

    case STATES.DEATH:
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        resetGame();
        renderTitleScreen();
        renderStatusBar();
      }
      break;

    case STATES.WIN:
      if (key === 'c' || key === 'C') {
        e.preventDefault();
        copyProofToClipboard();
        return;
      }
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        resetGame();
        renderTitleScreen();
        renderStatusBar();
      }
      break;
  }
});

// =====================================================================
// ANIMATION LOOP + TECH DEBT DRAIN
// =====================================================================
var lastTime = 0;
var drainAccumulator = 0;
var DRAIN_INTERVAL = 3000; // drain 1 HP every 3 seconds
var techDebtDeath = false;

function gameLoop(timestamp) {
  var dt = timestamp - lastTime;
  lastTime = timestamp;

  // Clamp dt to avoid huge jumps
  if (dt > 100) dt = 16;

  if (gameState === STATES.TRAVEL) {
    scrollX += dt * 0.03;
    wagonWheelAngle -= dt * 0.004;
  } else if (gameState === STATES.TITLE) {
    scrollX += dt * 0.01;
  } else {
    // Gentle idle scroll
    scrollX += dt * 0.002;
  }

  // Tech debt drain: HP ticks down during active gameplay (interval varies by profession)
  var profDrain = PROFESSIONS[difficulty] && PROFESSIONS[difficulty].drainInterval;
  var isActive = gameState === STATES.STOP || gameState === STATES.EVENT || gameState === STATES.RIVER;
  if (isActive && !deathPending && profDrain > 0) {
    drainAccumulator += dt;
    while (drainAccumulator >= profDrain) {
      drainAccumulator -= profDrain;
      health--;
      renderStatusBar();
      if (health <= 0) {
        techDebtDeath = true;
        enterDeath();
        break;
      }
    }
  }

  renderCanvas(timestamp);
  animFrame = requestAnimationFrame(gameLoop);
}

// =====================================================================
// INITIALIZATION
// =====================================================================
resetGame();
renderTitleScreen();
renderStatusBar();
updateMusicIndicator();
animFrame = requestAnimationFrame(gameLoop);
