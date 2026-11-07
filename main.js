import * as THREE from 'three';
import { TX, TX2 } from './classes/data.js'

const $ = id => document.getElementById(id);
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch (e) { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } } };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k, sm = k => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k) }, ph = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const env = (t, a, b, ri = .2, fa = .25) => t < a || t > b ? 0 : Math.min(sm((t - a) / ri), sm((b - t) / fa));

const a = TX, b = TX2;
Object.assign(TX.kanpe, TX2.kanpe);
Object.assign(TX.gaya, TX2.gaya);
for (const k in b) if (k !== 'kanpe' && k !== 'gaya') a[k] = b[k];
let lang = (q => ['ja', 'en', 'zh', 'ko'].includes(q) ? q : null)(new URLSearchParams(location.search).get('lang')) || ls.get('osn_lang', null) || (n => n.startsWith('ja') ? 'ja' : n.startsWith('zh') ? 'zh' : n.startsWith('ko') ? 'ko' : 'en')((navigator.language || 'ja').toLowerCase());
const t = (k, o) => {
  let s = TX[k];
  if (o) for (const [a, b] of Object.entries(o)) s = String(s).split('{' + a + '}').join(b);
  return s;
};
const tx = (k, o) => t(k, o);
let CIV = false;
const Ln = n => t(CIV ? 'LC' : 'L')[Math.min(n, 10)] || '';

const KT = { all: 'all', dive: 'dive', kuuki: 'kuuki', both: 'both', clear: 'clear', yari: 'yari', fui: 'fui', gaya: 'gaya', fly: 'fly', early: 'ky', late: 'ky', bored: 'ky', enjo: 'enjo' };
const TIER = { all: 0, dive: 0, kuuki: 1, both: 1, clear: 1, yari: 2, fui: 2, gaya: 2, fly: 2, ky: 3, enjo: 4 };
const tName = id => (t('tn') || {})[id] || id;
function resLine(kind, n) { if (kind === 'fly') return t('line_fly'); if (kind === 'enjo') return n ? t('line_enjo', { n }) : t('line_enjo0'); if (['both', 'dive', 'bored', 'all', 'kuuki', 'yari', 'fui', 'gaya'].includes(kind)) return t('line_' + kind, { n }); return t('line_push', { n }); }

// ===== 音（その場で作る） =====
let AC = null, bus = null, master = null, NB = null;
function ac() { try { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); bus = AC.createGain(); master = AC.createGain(); master.gain.value = .8; master.connect(bus); bus.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); } catch (e) { } return AC; }
function nbuf() { if (!NB) { NB = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++)d[i] = Math.random() * 2 - 1; } return NB; }
function tone(f, d, o = {}) { if (!ac()) return; const t0 = AC.currentTime + (o.at || 0); const os = AC.createOscillator(), g = AC.createGain(); os.type = o.type || 'square'; os.frequency.setValueAtTime(f, t0); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t0 + d); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(o.v || .12, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); os.connect(g).connect(master); os.start(t0); os.stop(t0 + d + .05); }
function noise(d, o = {}) { if (!ac()) return; const t0 = AC.currentTime + (o.at || 0); const s = AC.createBufferSource(); s.buffer = nbuf(); const f = AC.createBiquadFilter(); f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.f || 1000, t0); if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t0 + d); f.Q.value = o.q || 1; const g = AC.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(o.v || .3, t0 + (o.atk || .01)); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); s.connect(f).connect(g).connect(master); s.start(t0, Math.random()); s.stop(t0 + d + .05); }
const SFX = {
  talk(n, p = 1) { for (let i = 0; i < n; i++)tone((170 + Math.random() * 90) * p, .07, { type: 'square', v: .06, at: i * .078 }); },
  push() { noise(.15, { f: 500, v: .5 }); tone(130, .16, { type: 'sine', v: .4, to: 60 }); },
  thud() { noise(.22, { f: 300, v: .7 }); tone(90, .22, { type: 'sine', v: .5, to: 45 }); },
  whoosh() { noise(.5, { ft: 'bandpass', f: 400, fto: 2200, v: .25, atk: .2 }); },
  splash(big) { noise(big ? 1.3 : .8, { f: 2600, fto: 350, v: big ? .9 : .55 }); noise(.45, { ft: 'highpass', f: 3000, v: .3 }); tone(220, .22, { type: 'sine', v: .3, to: 80 }); },
  hiss() { noise(1.4, { ft: 'highpass', f: 4200, v: .13, atk: .15 }); },
  hop() { tone(300, .12, { type: 'triangle', v: .1, to: 620 }); noise(.18, { f: 1800, fto: 500, v: .18 }); },
  applause(n = 46, len = 2.2) { for (let i = 0; i < n; i++)noise(.06, { ft: 'bandpass', f: 1400 + Math.random() * 2200, q: 2, v: .22, at: Math.random() * len }); },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? .7 : .16, { type: 'square', v: .09, at: i * .13 })); },
  bad() { [392, 370, 349, 330].forEach((f, i) => tone(f, i === 3 ? 1 : .32, { type: 'sawtooth', v: .07, at: i * .36, to: i === 3 ? 280 : undefined })); },
  angry() { tone(160, .3, { type: 'sawtooth', v: .09, to: 110 }); },
  pop() { tone(820, .08, { type: 'sine', v: .13, to: 1250 }); },
  slide() { tone(520, .05, { type: 'triangle', v: .05, to: 720 }); },
  sigh() { noise(1.1, { ft: 'bandpass', f: 900, fto: 300, v: .18, atk: .3 }); },
  shutter() { noise(.05, { ft: 'highpass', f: 3500, v: .5 }); noise(.035, { ft: 'bandpass', f: 1800, q: 3, v: .35, at: .045 }); }
};

// ===== 観客の声（その場で合成：がやがや・笑い・えー・おおー・ああ・歓声・拍手） =====
const RND = Math.random, ru = (a, b) => a + RND() * (b - a), pick = a => a[Math.floor(RND() * a.length)];
const VOW = { a: [800, 1250], i: [320, 2300], u: [360, 1350], e: [520, 1900], o: [520, 880] }, VK = ['a', 'i', 'u', 'e', 'o', 'a', 'o'];
let crowdBus = null, murG = null, CB = null; const mood = { laugh: 0, clap: 0, cheer: 0, shock: 0, sad: 0, ooh: 0, flash: 0 };
function bpc(f, q, sr) { const w = 2 * Math.PI * Math.min(f, sr * .45) / sr, al = Math.sin(w) / (2 * q), a0 = 1 + al; return [al / a0, 0, -2 * Math.cos(w) / a0, (1 - al) / a0]; }
function vox(d, sr, segs, fem) {
  let ph = 0; const s1 = [0, 0, 0, 0], s2 = [0, 0, 0, 0]; const fs = fem ? 1.16 : 1;
  for (const g of segs) {
    const i0 = Math.max(0, Math.floor(g.t0 * sr)), i1 = Math.min(d.length, Math.floor(g.t1 * sr)); const n = i1 - i0; if (n <= 8) continue;
    const F = VOW[g.v]; const c1 = bpc(F[0] * fs, 4, sr), c2 = bpc(F[1] * fs, 6, sr); const br = g.br || 0, fa = g.fa, fb = g.fb, amp = g.amp, sm2 = g.smooth; const att = sr * .012, rel = sr * .05;
    for (let i = 0; i < n; i++) {
      const k = i / n; const f = sm2 ? fa * (1 + (g.bend || 0) * Math.sin(Math.PI * k)) + (fb - fa) * k : fa + (fb - fa) * k; ph += f / sr; ph -= Math.floor(ph); let x = 2 * ph - 1; if (br) x = x * (1 - br) + (RND() * 2 - 1) * br * 1.6;
      const e = (sm2 ? Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.15)), .7) : Math.min(1, i / att, (n - i) / rel)) * amp;
      const y1 = c1[0] * (x - s1[1]) - c1[2] * s1[2] - c1[3] * s1[3]; s1[1] = s1[0]; s1[0] = x; s1[3] = s1[2]; s1[2] = y1;
      const y2 = c2[0] * (x - s2[1]) - c2[2] * s2[2] - c2[3] * s2[3]; s2[1] = s2[0]; s2[0] = x; s2[3] = s2[2]; s2[2] = y2;
      d[i0 + i] += (y1 + .55 * y2) * e;
    }
  }
}
function lp1(d, sr, f) { const a = Math.exp(-2 * Math.PI * f / sr); let y = 0; for (let i = 0; i < d.length; i++) { y = (1 - a) * d[i] + a * y; d[i] = y; } }
function room(d, sr) { const D = [.029, .043, .067, .091].map(x => Math.floor(sr * x)), G = [.32, .24, .17, .11]; for (let i = d.length - 1; i >= 0; i--) { let a = 0; for (let k = 0; k < 4; k++)if (i >= D[k]) a += d[i - D[k]] * G[k]; d[i] += a; } }
function mkBuf(sec, fn, loop) {
  const sr = 22050, X = loop ? Math.floor(sr * .6) : 0; const n = Math.floor(sr * sec); const tmp = new Float32Array(n + X); fn(tmp, sr);
  let m = 1e-6; for (let i = 0; i < tmp.length; i++) { const a = Math.abs(tmp[i]); if (a > m) m = a; } const g = .9 / m;
  const b = AC.createBuffer(1, n, sr), d = b.getChannelData(0); for (let i = 0; i < n; i++)d[i] = tmp[i] * g;
  if (loop) for (let i = 0; i < X; i++) { const k = i / X; d[i] = d[i] * k + tmp[n + i] * g * (1 - k); } return b;
}
function bMur(d, sr) {
  const L = d.length / sr; for (let v = 0; v < 26; v++) {
    const fem = RND() < .5, f0 = fem ? ru(190, 260) : ru(100, 150); const segs = []; let t = ru(-.6, 1.4);
    while (t < L) { const te = t + ru(.6, 1.8); let q = t; while (q < te) { const len = ru(.09, .2), f = f0 * ru(.9, 1.12); segs.push({ t0: q, t1: q + len, v: pick(VK), fa: f, fb: f * ru(.92, 1.05), amp: ru(.5, 1), br: .18 }); q += len + ru(0, .04); } t = te + ru(.25, 1.1); }
    vox(d, sr, segs, fem);
  } lp1(d, sr, 1900); room(d, sr);
}
function bLaugh(n) {
  return (d, sr) => {
    for (let v = 0; v < n; v++) {
      const fem = RND() < .55, f0 = fem ? ru(230, 380) : ru(130, 210); const segs = []; let t = ru(0, .35); const end = ru(1.3, 2.7), rate = ru(4.2, 6.8);
      while (t < end) { const len = 1 / rate * ru(.55, .8), down = 1 - .25 * (t / end), f = f0 * down * ru(.95, 1.08); segs.push({ t0: t, t1: t + len, v: RND() < .85 ? 'a' : 'e', fa: f * 1.06, fb: f * .94, amp: ru(.6, 1) * (1 - .5 * t / end), br: .45 }); t += 1 / rate * ru(.9, 1.15); if (RND() < .07) t += ru(.15, .35); }
      vox(d, sr, segs, fem);
    } room(d, sr);
  };
}
function bVow(n, vw, lo, hi, bend, len) {
  return (d, sr) => {
    for (let v = 0; v < n; v++) {
      const fem = RND() < .5, f0 = (fem ? ru(200, 320) : ru(110, 180)) * (hi ? 1.25 : 1); const t0 = ru(0, .22), L = ru(len * .7, len);
      vox(d, sr, [{ t0, t1: t0 + L, v: vw, fa: f0, fb: f0 * lo, amp: ru(.6, 1), br: hi ? .3 : .12, smooth: 1, bend }], fem);
    } room(d, sr);
  };
}
function bCheer(d, sr) {
  bVow(18, 'a', .85, 1, .15, 1.6)(d, sr); for (let w = 0; w < 5; w++) {
    const t0 = ru(.1, .9), L = ru(.35, .7), i0 = Math.floor(t0 * sr), n = Math.floor(L * sr), fa = ru(1700, 2300); let ph = 0;
    for (let i = 0; i < n && i0 + i < d.length; i++) { const k = i / n; const f = fa * (1 + .35 * Math.sin(Math.PI * k)) - (k > .6 ? (k - .6) * 900 : 0); ph += f / sr; d[i0 + i] += Math.sin(2 * Math.PI * ph) * Math.sin(Math.PI * k) * .35; }
  }
}
function bClap(n) {
  return (d, sr) => {
    for (let p = 0; p < n; p++) {
      let t = ru(0, .3); const rate = ru(3.5, 6), end = ru(2.2, 3), c = bpc(ru(900, 2600), 1.2, sr), st = [0, 0, 0, 0];
      while (t < end) { const i0 = Math.floor(t * sr), L = Math.floor(sr * .03), amp = ru(.5, 1) * (t > end - .6 ? (end - t) / .6 : 1); for (let i = 0; i < L && i0 + i < d.length; i++) { const x = (RND() * 2 - 1) * Math.exp(-i / (sr * .006)); const y = c[0] * (x - st[1]) - c[2] * st[2] - c[3] * st[3]; st[1] = st[0]; st[0] = x; st[3] = st[2]; st[2] = y; d[i0 + i] += y * amp; } t += 1 / rate * ru(.85, 1.15); }
    } room(d, sr);
  };
}
function buildCrowd() {
  if (CB || !ac()) return; CB = {}; crowdBus = AC.createGain(); crowdBus.gain.value = .55; crowdBus.connect(master);
  CB.mur = mkBuf(5.4, bMur, true); murG = AC.createGain(); murG.gain.value = 0; murG.connect(crowdBus); const src = AC.createBufferSource(); src.buffer = CB.mur; src.loop = true; src.connect(murG); src.start();
  const jobs = [['gig', 2.2, bLaugh(7)], ['laugh', 3, bLaugh(22)], ['eh', 1.6, bVow(20, 'e', .78, 1, .12, 1.2)], ['ooh', 2, bVow(20, 'o', 1.05, 0, .18, 1.6)], ['aah', 2, bVow(18, 'a', .72, 0, .05, 1.5)], ['cheer', 2.2, bCheer], ['applause', 3.2, bClap(40)]];
  const next = () => { const j = jobs.shift(); if (!j) return; CB[j[0]] = mkBuf(j[1], j[2]); setTimeout(next, 0); }; setTimeout(next, 0);
}
function murSet(v) { if (murG && AC) murG.gain.setTargetAtTime(v, AC.currentTime, .35); }
const CMAP = { giggle: 'laugh', laugh: 'laugh', ooh: 'ooh', eh: 'shock', aah: 'sad', applause: 'clap', cheer: 'cheer' };
function cue(k, v) {
  const m = CMAP[k]; mood[m] = Math.max(mood[m], v * (k === 'giggle' ? .45 : 1)); if (k === 'cheer' || k === 'applause') mood.flash = Math.max(mood.flash, v);
  if (!AC || !CB) return; const b = CB[k === 'giggle' ? 'gig' : k]; if (!b) return; const src = AC.createBufferSource(); src.buffer = b; src.playbackRate.value = ru(.95, 1.05); const g = AC.createGain(); g.gain.value = v; src.connect(g).connect(crowdBus); src.start();
}
function resetMood() { for (const k in mood) mood[k] = 0; }

// ===== 3D =====
const can = $('c');
const R3 = new THREE.WebGLRenderer({ canvas: can });
R3.setPixelRatio(Math.min(2, devicePixelRatio || 1));
const S3 = new THREE.Scene();
S3.background = new THREE.Color(0x2b1b4d);
const cam = new THREE.PerspectiveCamera(55, 1, .05, 120);
S3.add(cam);
S3.add(new THREE.HemisphereLight(0xffffff, 0x5a3a6a, 1.05));
const sun = new THREE.DirectionalLight(0xfff0dd, 1.25); sun.position.set(3, 8, 5); S3.add(sun);
const GEO = {
  sph: new THREE.SphereGeometry(1, 20, 14),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
  box: new THREE.BoxGeometry(1, 1, 1),
  pl: new THREE.PlaneGeometry(1, 1)
};
const STD = c => new THREE.MeshStandardMaterial({ color: c, roughness: .6, metalness: 0 });
const BAS = c => new THREE.MeshBasicMaterial({ color: c });
function mesh(g, m, sx, sy, sz, x, y, z) { const o = new THREE.Mesh(g, m); o.scale.set(sx, sy, sz); o.position.set(x || 0, y || 0, z || 0); return o; }
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function txTex(lines, w, h, bg, fg, font) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((s, i) => g.fillText(s, w / 2, h * (i + .5) / lines.length));
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

// スタジオ
S3.add(mesh(GEO.box, STD(0x3a2a62), 40, .1, 40, 0, -.05, 0));
for (let i = -6; i <= 6; i++)S3.add(mesh(GEO.box, STD(i % 2 ? 0x45337a : 0x3a2a62), 1.4, .012, 40, i * 1.4, .01, 0));
const wallC = [0xffd23a, 0xff6a9a, 0x3ad0e0, 0x8ae04a, 0xff8a3a];
for (let i = 0; i < 13; i++)S3.add(mesh(GEO.box, STD(wallC[i % 5]), 1.6, 9, .2, (i - 6) * 1.65, 4.5, -10.5));
S3.add(mesh(GEO.box, STD(0x1d1236), 24, .3, 24, 0, 8.6, -2));
const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.3), new THREE.MeshBasicMaterial({ map: txTex(['熱湯風呂'], 512, 144, '#d8352a', '#fff', '900 104px "Hiragino Maru Gothic ProN",system-ui,sans-serif') })); sign.scale.setScalar(1.6); sign.position.set(0, 6.0, -10.38); S3.add(sign);
for (const sx of [-1, 1]) { const lt = mesh(GEO.cyl, STD(0x222222), .18, .4, .18, sx * 3.2, 5.2, -5.5); lt.rotation.x = .6; S3.add(lt); const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff6c0, transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide })); cone.position.set(sx * 2.2, 2.8, -2.6); cone.rotation.z = -sx * .3; S3.add(cone); }
// 台（立つところ）
S3.add(mesh(GEO.box, STD(0x9a6a3a), 3.2, 1, 3.2, 0, .5, 1.6));
S3.add(mesh(GEO.box, STD(0xc8945a), 3.24, .06, 3.24, 0, 1.0, 1.6));
for (let i = 0; i < 3; i++)S3.add(mesh(GEO.box, STD(0x7a4e28), 3.22, .04, .04, 0, .25 + i * .25, .0));
// 熱湯風呂
const TUB = { x0: -1.45, x1: 1.45, z0: -2.75, z1: -.1, top: .95, water: .78 };
const tubW = STD(0xf6f6f2), tubR = STD(0xd8352a);
S3.add(mesh(GEO.box, tubW, 3.1, .95, .14, 0, .475, TUB.z0 - .07), mesh(GEO.box, tubW, 3.1, .95, .14, 0, .475, TUB.z1 + .03), mesh(GEO.box, tubW, .14, .95, 2.75, TUB.x0 - .07, .475, (TUB.z0 + TUB.z1) / 2), mesh(GEO.box, tubW, .14, .95, 2.75, TUB.x1 + .07, .475, (TUB.z0 + TUB.z1) / 2));
S3.add(mesh(GEO.box, tubR, 3.14, .16, .16, 0, .62, TUB.z0 - .07), mesh(GEO.box, tubR, .16, .16, 2.8, TUB.x1 + .07, .62, (TUB.z0 + TUB.z1) / 2), mesh(GEO.box, tubR, .16, .16, 2.8, TUB.x0 - .07, .62, (TUB.z0 + TUB.z1) / 2));
const tubSign = new THREE.MeshBasicMaterial({ map: txTex(['熱湯'], 256, 128, '#ffffff', '#d8352a', '900 96px "Hiragino Maru Gothic ProN",system-ui,sans-serif') });
{ const a = new THREE.Mesh(GEO.pl, tubSign); a.scale.set(1.1, .5, 1); a.position.set(0, .3, TUB.z0 - .15); a.rotation.y = Math.PI; S3.add(a); }
S3.add(mesh(GEO.box, STD(0x8a2a10), 2.9, .05, 2.65, 0, .06, (TUB.z0 + TUB.z1) / 2));
const waterM = new THREE.MeshStandardMaterial({ color: 0xff7a4a, emissive: 0x8a2a08, roughness: .2, transparent: true, opacity: .9 });
const water = mesh(GEO.box, waterM, 2.9, .7, 2.65, 0, TUB.water - .35, (TUB.z0 + TUB.z1) / 2); S3.add(water);
// 人（つるっとしたマネキン）
function limb(len, r, M) { const g = new THREE.Group(); g.add(mesh(GEO.cyl, M, r, len, r, 0, -len / 2, 0)); g.add(mesh(GEO.sph, M, r * 1.15, r * 1.15, r * 1.15)); return g; }
const GLASS = new THREE.TorusGeometry(.027, .006, 6, 14);
function makeMan(trunkC, hairC) {
  const SK = STD(0xf2d3b8), TR = STD(trunkC), DK = BAS(0x1d1d1d);
  const g = new THREE.Group(); S3.add(g); const P = { torso: [], up: [], fore: [], thigh: [], shin: [], foot: [], trunk: [] };
  const pel = mesh(GEO.sph, SK, .17, .12, .12), trk = mesh(GEO.cyl, TR, .185, .17, .135, 0, -.02, 0); g.add(pel, trk); P.thigh.push(pel); P.trunk.push(trk);
  const spine = new THREE.Group(); spine.position.y = .05; g.add(spine);
  { const a = mesh(GEO.cyl, SK, .15, .42, .11, 0, .25, 0), b = mesh(GEO.sph, SK, .21, .12, .13, 0, .47, 0), c = mesh(GEO.sph, SK, .155, .1, .115, 0, .06, 0); spine.add(a, b, c); P.torso.push(a, b, c); }
  const neck = new THREE.Group(); neck.position.y = .55; spine.add(neck); neck.add(mesh(GEO.cyl, SK, .05, .12, .05, 0, .06, 0));
  const head = new THREE.Group(); head.position.y = .18; neck.add(head);
  head.add(mesh(GEO.sph, SK, .12, .14, .13), mesh(GEO.sph, STD(hairC), .127, .085, .136, 0, .065, .008), mesh(GEO.sph, SK, .022, .03, .03, 0, -.01, -.132));
  for (const sx of [-1, 1]) head.add(mesh(GEO.sph, DK, .018, .026, .01, sx * .047, .022, -.122));
  const brows = []; for (const sx of [-1, 1]) { const b = mesh(GEO.box, DK, .05, .012, .01, sx * .047, .062, -.124); head.add(b); brows.push([b, sx]); }
  const mouth = mesh(GEO.sph, BAS(0x6a1a1a), .04, .012, .012, 0, -.068, -.118); head.add(mouth);
  const gl = new THREE.Group(); for (const sx of [-1, 1]) { const r = new THREE.Mesh(GLASS, DK); r.position.set(sx * .047, .022, -.13); gl.add(r); } gl.add(mesh(GEO.box, DK, .03, .006, .006, 0, .026, -.132)); gl.visible = false; head.add(gl);
  const arm = sx => { const a = limb(.3, .046, SK); P.up.push(...a.children); a.position.set(sx * .215, .47, 0); spine.add(a); const e = limb(.27, .04, SK); P.fore.push(...e.children); e.position.y = -.3; a.add(e); e.add(mesh(GEO.sph, SK, .055, .06, .05, 0, -.29, 0)); return [a, e]; };
  const leg = sx => { const l = limb(.44, .066, SK); P.thigh.push(...l.children); l.position.set(sx * .095, -.07, 0); g.add(l); const k = limb(.43, .056, SK); P.shin.push(...k.children); k.position.y = -.44; l.add(k); const f = mesh(GEO.box, SK, .09, .06, .21, 0, -.45, -.05); k.add(f); P.foot.push(f); return [l, k]; };
  const [aL, eL] = arm(1), [aR, eR] = arm(-1), [lL, kL] = leg(1), [lR, kR] = leg(-1);
  return { g, spine, neck, head, mouth, brows, aL, eL, aR, eR, lL, kL, lR, kR, P, SK, TR, gl };
}
const MAN = makeMan(0xd8352a, 0x2a1a10), ME = makeMan(0x2a6ad8, 0x5a3a1a);
// 服：null＝水着、civ＝私服（一般の方）、suit＝スーツ（謝罪会見）
const LOOKM = { shirt: STD(0xf2f2ea), pants: STD(0x33466e), shoe: STD(0x3a2a20), suit: STD(0x262a33), suitP: STD(0x20232a), shoeB: STD(0x111111) };
function dress(m, kind) {
  const P = m.P, sk = m.SK; const sh = kind === 'civ' ? LOOKM.shirt : kind === 'suit' ? LOOKM.suit : sk, pa = kind === 'civ' ? LOOKM.pants : kind === 'suit' ? LOOKM.suitP : sk, fo = kind === 'civ' ? LOOKM.shoe : kind === 'suit' ? LOOKM.shoeB : sk;
  for (const x of P.torso) x.material = sh; for (const x of P.up) x.material = sh; for (const x of P.fore) x.material = kind === 'suit' ? sh : sk; for (const x of P.thigh) x.material = pa; for (const x of P.shin) x.material = pa; for (const x of P.foot) x.material = fo; for (const x of P.trunk) x.material = kind ? pa : m.TR; m.gl.visible = kind === 'civ'; m.dk = kind;
}
function setLook(v) { CIV = !!v; dress(MAN, CIV ? 'civ' : null); }
function dressME(k) { if (ME.dk !== k) dress(ME, k); }
// ===== テレビの収録スタジオ（観客・ガヤ芸人・スタッフ・カンペ・電飾） =====
const G1 = makeMan(0xffd23a, 0x1a1a1a), G2 = makeMan(0x1aa34a, 0x6a3a1a); G1.g.rotation.order = G2.g.rotation.order = 'YXZ';
const GP = [{ m: G1, x: -1.4, z: 1.2, yaw: -.75 }, { m: G2, x: 1.4, z: 1.2, yaw: .75 }];
S3.add(mesh(GEO.box, STD(0x2b1f55), .2, 9, 15, -8.3, 4.5, -3));
const onair = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .75), new THREE.MeshBasicMaterial({ map: txTex(['ON AIR'], 320, 110, '#d01818', '#ffffff', '900 74px system-ui,sans-serif') })); onair.position.set(-8.18, 4.3, -.6); onair.rotation.y = Math.PI / 2; S3.add(onair);
for (const z of [-2.6, 1.8]) { S3.add(mesh(GEO.box, STD(0x3a3a44), 13, .18, .18, 0, 7.7, z)); for (let x = -5.4; x <= 5.41; x += 1.8) { const c = mesh(GEO.cyl, STD(0x1a1a1e), .16, .34, .16, x, 7.45, z); c.rotation.x = z < 0 ? -.5 : .5; S3.add(c); } }
for (const [x, z, ry] of [[-1.6, -1.2, .35], [1.6, -1.2, -.35], [0, 1.2, 0]]) { const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 6.4, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: .05, depthWrite: false, side: THREE.DoubleSide })); cone.position.set(x, 4.5, z); cone.rotation.z = ry; S3.add(cone); }
// 観客（同じ形をたくさん並べる）
const AUD = [];
const SHIRT = [0xe8352a, 0x2a6ad8, 0xffd23a, 0x1aa34a, 0xff7ad8, 0xffffff, 0x7a3ad8, 0xff8a3a, 0x3ad0e0, 0x222222, 0xf2f2a0, 0x8a5a3a], SKIN = [0xf2d3b8, 0xe6c09c, 0xd8a882, 0xf6dcc8], HAIR = [0x1a1410, 0x2a1a10, 0x4a2a18, 0x6a4a2a, 0x8a6a40, 0x111111, 0xc89a5a], PANTS = [0x2a2a3a, 0x3a3a5a, 0x1f2a44, 0x555555, 0x6a4a2a];
function seat(x, y, z) { const dx = 0 - x, dz = -.3 - z; const B = new THREE.Matrix4(); B.makeRotationY(Math.atan2(-dx, -dz)); B.setPosition(x, y, z); AUD.push({ B, ph: RND() * 40, s: ru(.6, 1.25), side: RND() < .5 ? 1 : -1, c: pick(SHIRT), sk: pick(SKIN), hc: pick(HAIR), pc: pick(PANTS) }); }
for (let r = 0; r < 6; r++) {
  const top = .36 + r * .42, zc = -5.2 - r * .85; S3.add(mesh(GEO.box, STD(r % 2 ? 0x2a2050 : 0x332766), 13.4, top, .85, 0, top / 2, zc), mesh(GEO.box, STD(0xffd23a), 13.4, .03, .04, 0, top + .005, zc + .425));
  for (let x = -6.1; x <= 6.11; x += .72) { if (RND() < .06) continue; seat(x + ru(-.07, .07), top, zc + .12); }
}
for (let r = 0; r < 4; r++) {
  const top = .36 + r * .42, xc = -4.7 - r * .85; S3.add(mesh(GEO.box, STD(r % 2 ? 0x2a2050 : 0x332766), .85, top, 6.6, xc, top / 2, -.3), mesh(GEO.box, STD(0xffd23a), .04, .03, 6.6, xc + .425, top + .005, -.3));
  for (let z = -3.3; z <= 2.71; z += .72) { if (RND() < .06) continue; seat(xc + .12, top, z + ru(-.07, .07)); }
}
const aGeo = {
  torso: new THREE.CylinderGeometry(.16, .19, .5, 10).translate(0, .25, 0).scale(1, 1, .72), head: new THREE.SphereGeometry(.105, 12, 10).translate(0, .13, 0), hair: new THREE.SphereGeometry(.112, 12, 8, 0, Math.PI * 2, 0, Math.PI * .5).translate(0, .15, .012),
  arm: new THREE.CylinderGeometry(.042, .036, .44, 7).translate(0, -.22, 0), lap: new THREE.BoxGeometry(.34, .13, .42).translate(0, .065, -.2), shin: new THREE.BoxGeometry(.3, .4, .12).translate(0, -.2, -.38)
};
const aMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .75 });
const AI = {}; for (const k of ['torso', 'head', 'hair', 'armL', 'armR', 'lap', 'shin']) { const im = new THREE.InstancedMesh(aGeo[k.startsWith('arm') ? 'arm' : k], aMat, AUD.length); im.frustumCulled = false; S3.add(im); AI[k] = im; }
{ const c = new THREE.Color(); AUD.forEach((p, i) => { c.setHex(p.c); AI.torso.setColorAt(i, c); AI.armL.setColorAt(i, c); AI.armR.setColorAt(i, c); c.setHex(p.sk); AI.head.setColorAt(i, c); c.setHex(p.hc); AI.hair.setColorAt(i, c); c.setHex(p.pc); AI.lap.setColorAt(i, c); AI.shin.setColorAt(i, c); AI.lap.setMatrixAt(i, p.B); AI.shin.setMatrixAt(i, p.B); }); }
const _e = new THREE.Euler(), _m1 = new THREE.Matrix4(), _mt = new THREE.Matrix4(), _mh = new THREE.Matrix4(), _ma = new THREE.Matrix4();
function locM(x, y, z, rx, ry, rz) { _e.set(rx, ry, rz); _m1.makeRotationFromEuler(_e); _m1.setPosition(x, y, z); return _m1; }
const DEC = { laugh: .42, clap: .36, cheer: .45, shock: .9, sad: .2, ooh: .7, flash: .55 };
function updCrowd(dt, T) {
  for (const k in DEC) mood[k] = Math.max(0, mood[k] - dt * DEC[k]);
  for (let i = 0; i < AUD.length; i++) {
    const p = AUD[i], sv = p.s, w = T + p.ph;
    const L = clamp(mood.laugh * sv, 0, 1), C = clamp(mood.clap * sv, 0, 1), H = clamp(mood.cheer * sv, 0, 1), K = clamp(mood.shock * sv, 0, 1), S = clamp(mood.sad * sv, 0, 1), O = clamp(mood.ooh * sv, 0, 1);
    const bob = Math.sin(w * 1.3) * .006 + L * Math.abs(Math.sin(w * 11)) * .035 + H * (.1 + .08 * Math.sin(w * 9));
    const tx = L * (.1 + .15 * Math.sin(w * 4.5)) + K * .28 - S * .3 - O * .18;
    const hx = L * .35 * Math.abs(Math.sin(w * 5)) + K * .25 - S * .45 - O * .1 + H * .2; const ch = Math.sin(w * .37 + p.ph * 3); const hy = (ch > .75 ? (ch - .75) * 2.8 * p.side : 0) * (1 - L) * (1 - H);
    let ax = 1.05, az = .05; const bl = (x, z, k) => { ax += (x - ax) * k; az += (z - az) * k; };
    bl(.35, .02, S); bl(.75, -.45, L * .8); bl(2.2, -.55, K); bl(1.3, -(.25 + .25 * Math.abs(Math.sin(w * 13))), C); bl(2.9, .35 + .15 * Math.sin(w * 10), H);
    _mt.multiplyMatrices(p.B, locM(0, bob, 0, tx, 0, 0)); AI.torso.setMatrixAt(i, _mt);
    _mh.multiplyMatrices(_mt, locM(0, .55, 0, hx, hy, 0)); AI.head.setMatrixAt(i, _mh); AI.hair.setMatrixAt(i, _mh);
    _ma.multiplyMatrices(_mt, locM(.2, .47, 0, ax, 0, az)); AI.armL.setMatrixAt(i, _ma);
    _ma.multiplyMatrices(_mt, locM(-.2, .47, 0, ax, 0, -az)); AI.armR.setMatrixAt(i, _ma);
  }
  for (const k of ['torso', 'head', 'hair', 'armL', 'armR']) AI[k].instanceMatrix.needsUpdate = true;
}
// スタッフ
function crew(c, x, z, yaw) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; S3.add(g); const M = STD(c), SK = STD(0xe8c4a4), DK = STD(0x1a1a1a);
  g.add(mesh(GEO.cyl, M, .17, .56, .12, 0, 1.22, 0)); const hd = new THREE.Group(); hd.position.y = 1.62; g.add(hd); hd.add(mesh(GEO.sph, SK, .11, .13, .12), mesh(GEO.sph, DK, .115, .07, .125, 0, .06, -.01), mesh(GEO.box, DK, .03, .06, .04, .115, 0, 0), mesh(GEO.box, DK, .2, .015, .02, 0, .12, 0));
  for (const sx of [-1, 1]) g.add(mesh(GEO.cyl, STD(0x2a2a3a), .065, .92, .065, sx * .08, .46, 0));
  const arms = [-1, 1].map(sx => { const a = new THREE.Group(); a.position.set(sx * .2, 1.45, 0); g.add(a); a.add(mesh(GEO.cyl, M, .045, .5, .045, 0, -.25, 0), mesh(GEO.sph, SK, .05, .05, .05, 0, -.5, 0)); return a; }); return { g, hd, arms };
}
function tvCam(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S3.add(g); const DK = STD(0x2a2a2e), GR = STD(0x55565c);
  g.add(mesh(GEO.cyl, GR, .45, .08, .45, 0, .04, 0), mesh(GEO.cyl, GR, .07, 1.25, .07, 0, .66, 0)); const hd = new THREE.Group(); hd.position.y = 1.4; g.add(hd);
  hd.add(mesh(GEO.box, DK, .36, .36, .62, 0, 0, 0)); const lens = mesh(GEO.cyl, STD(0x111111), .13, .34, .13, 0, 0, .46); lens.rotation.x = Math.PI / 2; hd.add(lens); hd.add(mesh(GEO.box, STD(0x111111), .24, .16, .12, 0, .24, -.25));
  const tally = mesh(GEO.sph, BAS(0xff2020), .04, .04, .04, 0, .21, .25); hd.add(tally);
  const dx = 0 - x, dz = .3 - z, dy = 1.9 - 1.4; const yaw = Math.atan2(dx, dz); hd.rotation.set(-Math.atan2(dy, Math.hypot(dx, dz)), yaw, 0, 'YXZ');
  const op = crew(0x2a2a2a, x - Math.sin(yaw) * .75, z - Math.cos(yaw) * .75, yaw); op.arms.forEach(a => { a.rotation.x = -1.1; }); return { tally, op };
}
const CAMS = [tvCam(-2.7, -3.6), tvCam(2.75, -3.5)];
const BOOM = crew(0x2a2a2a, -2.55, 1.15, 1.2); BOOM.arms.forEach(a => { a.rotation.x = -2.6; a.rotation.z = .15; });
const BOOMV = []; {
  const a = V3(-2.35, 2.15, 1.05), b = V3(-.32, 3.38, .5); const d = b.clone().sub(a); const pole = mesh(GEO.cyl, STD(0x888888), .018, d.length(), .018); pole.position.copy(a).addScaledVector(d, .5); pole.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); S3.add(pole);
  const mic = mesh(GEO.sph, STD(0x6a6a6a), .07, .07, .2, b.x, b.y - .07, b.z); S3.add(mic); BOOMV.push(pole, mic);
}
const AD = crew(0x2b3a67, 1.1, -3.2, 0); AD.arms.forEach((a, i) => { a.rotation.x = -1.35; a.rotation.z = (i ? -1 : 1) * -.25; });
const kc = document.createElement('canvas'); kc.width = 400; kc.height = 280; const kg = kc.getContext('2d'); const kTex = new THREE.CanvasTexture(kc); kTex.colorSpace = THREE.SRGBColorSpace;
const KB = []; { const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .7), new THREE.MeshBasicMaterial({ map: kTex })); bd.position.set(1.1, 1.82, -2.84); bd.rotation.x = -.12; S3.add(bd); const fr = mesh(GEO.box, STD(0x8a6a3a), 1.04, .74, .02, 1.1, 1.82, -2.856); fr.rotation.x = -.12; S3.add(fr); KB.push(bd, fr); }
// スタッフのいつもの位置（全員ダイブのあと元にもどす）
const CREW = [CAMS[0].op, CAMS[1].op, BOOM, AD].map(c => ({ c, p: c.g.position.clone(), r: c.g.rotation.clone(), ar: c.arms.map(a => a.rotation.clone()) }));
function resetCrew() { for (const q of CREW) { q.c.g.position.copy(q.p); q.c.g.rotation.copy(q.r); q.c.arms.forEach((a, i) => a.rotation.copy(q.ar[i])); } for (const m of KB) m.visible = true; }
// 謝罪会見の場（スタジオのずっと後ろ。ふだんは映らない）
const PRESS = new THREE.Group(); PRESS.position.set(0, 0, 30); S3.add(PRESS);
PRESS.add(mesh(GEO.box, STD(0x2a2f3a), 14, .1, 9, 0, -.05, 1.5), mesh(GEO.box, STD(0x22304e), 14, 10, .2, 0, 5, 3.3), mesh(GEO.box, STD(0xf6f6f6), 3.0, .06, .7, 0, .7, 1.3), mesh(GEO.box, STD(0xeeeeee), 3.0, .68, .04, 0, .35, .97));
for (const x of [-.36, -.18, 0, .18, .36]) { const st = mesh(GEO.cyl, STD(0x222222), .012, .34, .012, x, .88, 1.42); st.rotation.x = .5; PRESS.add(st, mesh(GEO.sph, STD(0x333333), .04, .05, .04, x, 1.03, 1.5)); }
const pressSign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, .72), new THREE.MeshBasicMaterial({ color: 0xffffff })); pressSign.position.set(0, 2.75, 3.18); pressSign.rotation.y = Math.PI; PRESS.add(pressSign);
const PS = {}; function pressTex() { if (!PS[lang]) PS[lang] = txTex([t('pressSign')], 560, 92, '#22304e', '#ffffff', '900 62px "Hiragino Maru Gothic ProN",system-ui,sans-serif'); return PS[lang]; }
let kNow = '';
function setKanpe(key) {
  const id = lang + key;
  if (id === kNow) return;
  kNow = id;
  const txt = TX.kanpe[key] || '';
  kg.fillStyle = '#fbfaf2'; kg.fillRect(0, 0, 400, 280); kg.fillStyle = '#c33'; for (let i = 0; i < 7; i++) { kg.beginPath(); kg.arc(40 + i * 53, 16, 7, 0, 7); kg.fill(); }
  kg.fillStyle = ['bored', 'wrap', 'enjo', 'gachi', 'mada'].includes(key) ? '#c8102e' : '#111'; let fs = 104; const F = z => '900 ' + z + 'px "Hiragino Maru Gothic ProN",system-ui,sans-serif'; kg.font = F(fs); while (kg.measureText(txt).width > 360 && fs > 30) { fs -= 6; kg.font = F(fs); }
  kg.textAlign = 'center'; kg.textBaseline = 'middle'; kg.fillText(txt, 200, 152); kTex.needsUpdate = true;
}
// 電飾
const BULB = []; for (let i = 0; i < 10; i++)BULB.push([1.63, .55, .2 + i * .31]); for (let i = 0; i < 10; i++)BULB.push([-1.63, .55, .2 + i * .31]);
for (let i = 0; i < 28; i++) { BULB.push([-4.2 + i * (8.4 / 27), 7.25, -10.3]); BULB.push([-4.2 + i * (8.4 / 27), 4.75, -10.3]); }
for (let i = 1; i < 6; i++) { BULB.push([-4.2, 4.75 + i * (2.5 / 6), -10.3]); BULB.push([4.2, 4.75 + i * (2.5 / 6), -10.3]); }
for (let i = 0; i < 16; i++)BULB.push([-8.15, 1.2 + i * .35, -3.2]);
const iB = new THREE.InstancedMesh(new THREE.SphereGeometry(.075, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), BULB.length); iB.frustumCulled = false; S3.add(iB);
{ const c = new THREE.Color(0xffd040); BULB.forEach((p, i) => { _m1.makeTranslation(p[0], p[1], p[2]); iB.setMatrixAt(i, _m1); iB.setColorAt(i, c); }); }
const _c = new THREE.Color();
function updBulbs(T) {
  const f = mood.flash, st = Math.floor(T * (f > .2 ? 16 : 6)); for (let i = 0; i < BULB.length; i++) { if (f > .2) { const b = (i + st) % 2 ? 1 : .25; _c.setHSL((i * .07 + T * .8) % 1, 1, .45 * b + .1); } else { const b = (i + st) % 4 === 0 ? 1 : .3; _c.setRGB(b, .82 * b, .35 * b); } iB.setColorAt(i, _c); } iB.instanceColor.needsUpdate = true;
  const on = Math.sin(T * 3) > -.6; onair.material.color.setScalar(on ? 1 : .45); for (const c of CAMS) c.tally.visible = Math.sin(T * 2 + 1) > -.8;
}
// ワイプ（観客の顔）
const wcam = new THREE.PerspectiveCamera(34, 4 / 3, .05, 60); wcam.position.set(-.6, 2.6, -3.05); wcam.lookAt(-.2, 1.85, -6.9);
const _v2 = new THREE.Vector2();
function renderWipe(r, x, y, w, h) { if (w < 10 || h < 10) return; wcam.aspect = w / h; wcam.updateProjectionMatrix(); r.setScissorTest(true); r.setScissor(x, y, w, h); r.setViewport(x, y, w, h); r.render(S3, wcam); r.setScissorTest(false); r.getSize(_v2); r.setViewport(0, 0, _v2.x, _v2.y); }
// ガヤ芸人の動き（観客と同じ盛り上がりに合わせる）
function gayaPose(T, skip) {
  for (let i = 0; i < 2; i++) {
    if ((skip || 0) & (1 << i)) continue; const { m, x, z, yaw } = GP[i]; rest(m); stand(m, x, z); m.g.rotation.y = yaw; const w = T + i * 1.7;
    const L = clamp(mood.laugh * 1.25, 0, 1), K = clamp(mood.shock * 1.4, 0, 1), C = clamp(Math.max(mood.clap, mood.cheer) * 1.2, 0, 1), S = clamp(mood.sad * 1.2, 0, 1); const base = 1 - Math.max(L, K, C, S);
    m.g.position.y -= .12 * base; m.spine.rotation.x = -.35 * base; m.lL.rotation.x = m.lR.rotation.x = .55 * base; m.kL.rotation.x = m.kR.rotation.x = -1.0 * base; m.aL.rotation.x = m.aR.rotation.x = .85 * base; m.neck.rotation.x = .3 * base;
    if (L > .05) { m.g.position.y += Math.abs(Math.sin(w * 10)) * .05 * L; m.spine.rotation.x += (i ? -.55 : .15) * L + Math.sin(w * 5) * .12 * L; m.aL.rotation.x += .7 * L; m.aL.rotation.z += -.6 * L; m.aR.rotation.x += (i ? .7 : 1.5) * L; m.aR.rotation.z += (i ? .6 : -.1) * L; m.mouth.scale.set(.06, .04, .012); m.neck.rotation.x += .35 * L; }
    if (K > .05) { m.aL.rotation.z = lerp(m.aL.rotation.z, 2.6, K); m.aR.rotation.z = lerp(m.aR.rotation.z, -2.6, K); m.eL.rotation.z = -1.8 * K; m.eR.rotation.z = 1.8 * K; m.spine.rotation.x = lerp(m.spine.rotation.x, .2, K); m.mouth.scale.set(.05, .05, .012); }
    if (C > .05) { const cl = Math.abs(Math.sin(w * 12)); m.aL.rotation.x = lerp(m.aL.rotation.x, 1.4, C); m.aR.rotation.x = lerp(m.aR.rotation.x, 1.4, C); m.aL.rotation.z = lerp(m.aL.rotation.z, -.3 - .3 * cl, C); m.aR.rotation.z = lerp(m.aR.rotation.z, .3 + .3 * cl, C); m.g.position.y += Math.abs(Math.sin(w * 7)) * .06 * C; }
    if (S > .3) { m.aL.rotation.set(.9, 0, -.55); m.aR.rotation.set(.9, 0, .55); m.eL.rotation.x = 1.7; m.eR.rotation.x = 1.7; m.neck.rotation.x = -.3; m.head.rotation.y = Math.sin(T * 2.4 + i) * .35; }
  }
}

function rest(m) { for (const k of ['spine', 'neck', 'head', 'aL', 'eL', 'aR', 'eR', 'lL', 'kL', 'lR', 'kR']) m[k].rotation.set(0, 0, 0); m.g.rotation.set(0, 0, 0); m.g.visible = true; m.aL.rotation.z = .12; m.aR.rotation.z = -.12; m.mouth.scale.set(.04, .012, .012); for (const [b, sx] of m.brows) b.rotation.z = 0; }
const talkM = (m, T, on, wide) => { m.mouth.scale.y = on ? .012 + Math.abs(Math.sin(T * 24)) * .032 : .012; if (wide) m.mouth.scale.x = .06; };
const angryB = m => { for (const [b, sx] of m.brows) b.rotation.z = sx * .5; };
// 手前の手（自分の目線）
const hands = new THREE.Group(); cam.add(hands);
for (const sx of [-1, 1]) { const h = new THREE.Group(); const SK = STD(0xf2d3b8); const f = mesh(GEO.cyl, SK, .036, .42, .036, 0, 0, 0); f.rotation.x = Math.PI / 2; h.add(f); h.add(mesh(GEO.sph, SK, .06, .075, .035, 0, .02, -.23)); h.position.set(sx * .19, -.34, -.5); h.rotation.set(.1, -sx * .12, 0); hands.add(h); }
// しぶき・湯気・紙ふぶき
const DROPS = []; { const m = BAS(0xffd0b0); for (let i = 0; i < 140; i++) { const o = mesh(GEO.sph, m, .045, .045, .045); o.visible = false; S3.add(o); DROPS.push({ o, v: V3(0, 0, 0), on: false }); } }
function splash(x, z, n, pw) { let k = 0; for (const d of DROPS) { if (d.on) continue; d.on = true; d.o.visible = true; d.o.position.set(x + (Math.random() - .5) * .5, TUB.water + .02, z + (Math.random() - .5) * .5); const a = Math.random() * 6.28, s = (.6 + Math.random() * 1.6) * pw; d.v.set(Math.cos(a) * s, (2.2 + Math.random() * 2.8) * pw, Math.sin(a) * s); const sc = .03 + Math.random() * .05; d.o.scale.setScalar(sc); if (++k >= n) break; } }
const steamTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const STEAM = []; for (let i = 0; i < 46; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false })); S3.add(s); STEAM.push({ s, life: Math.random() * 3, max: 2.5 + Math.random() * 1.5, x: 0, z: 0, rise: .5 }); }
let steamBoost = 0;
const CONF = []; { const cols = [0xe8352a, 0xffd23a, 0x1aa34a, 0x2a7ad8, 0xff7ad8]; for (let i = 0; i < 90; i++) { const o = new THREE.Mesh(GEO.pl, new THREE.MeshBasicMaterial({ color: cols[i % 5], side: THREE.DoubleSide })); o.scale.set(.09, .13, 1); o.visible = false; S3.add(o); CONF.push({ o, v: V3(0, 0, 0), r: 0, on: false }); } }
function confetti(cx, cz) { for (const c of CONF) { c.on = true; c.o.visible = true; c.o.position.set(cx + (Math.random() - .5) * 5, 3.2 + Math.random() * 2.5, cz + (Math.random() - .5) * 4); c.v.set((Math.random() - .5) * .6, -(.7 + Math.random() * .7), (Math.random() - .5) * .6); c.r = Math.random() * 6; } }
function clearFx() { for (const d of DROPS) { d.on = false; d.o.visible = false; } for (const c of CONF) { c.on = false; c.o.visible = false; } steamBoost = 0; }
function updFx(dt) {
  for (const d of DROPS) { if (!d.on) continue; d.v.y -= 9.8 * dt; d.o.position.addScaledVector(d.v, dt); const p = d.o.position; if (p.y < TUB.water && p.x > TUB.x0 && p.x < TUB.x1 && p.z > TUB.z0 && p.z < TUB.z1 || p.y < 0) { d.on = false; d.o.visible = false; } }
  steamBoost = Math.max(0, steamBoost - dt * .5);
  for (const st of STEAM) {
    st.life += dt * (1 + steamBoost); if (st.life > st.max) { st.life = 0; st.max = 2.2 + Math.random() * 1.6; st.x = lerp(TUB.x0 + .2, TUB.x1 - .2, Math.random()); st.z = lerp(TUB.z0 + .2, TUB.z1 - .2, Math.random()); }
    const k = st.life / st.max; st.s.position.set(st.x + Math.sin(k * 5 + st.max) * .15, TUB.water + k * 1.9, st.z); st.s.scale.setScalar(.35 + k * .85); st.s.material.opacity = Math.sin(k * Math.PI) * (.2 + Math.min(steamBoost, 2) * .06);
  }
  for (const c of CONF) { if (!c.on) continue; c.o.position.addScaledVector(c.v, dt); c.r += dt * 5; c.o.rotation.set(c.r, c.r * .7, 0); if (c.o.position.y < 0) { c.on = false; c.o.visible = false; } }
  water.position.y = TUB.water - .35 + Math.sin(performance.now() / 400) * .008;
}

// ===== カメラ =====
let VA = 1;
function setCam(p, l, wide) { const k = wide && VA < .85 ? lerp(1.18, 1, clamp((VA - .45) / .4, 0, 1)) : 1; cam.position.copy(l).addScaledVector(p.clone().sub(l), k); cam.lookAt(l); }
function fitFov(a) { VA = a; cam.aspect = a; cam.fov = clamp(2 * Math.atan(Math.tan(27 * Math.PI / 180) / a) * 180 / Math.PI, 52, 80); cam.updateProjectionMatrix(); }
const FP = [V3(0, 2.85, 2.3), V3(0, 1.45, -1.55)], WIDE = [V3(3.6, 2.35, -.6), V3(0, 1.2, -1.0)];
const introCurve = new THREE.CatmullRomCurve3([V3(0, 5.2, -9.3), V3(5.0, 3.7, -3.7), V3(4.4, 3.2, 2.9), FP[0].clone()]);

// ===== 動き =====
const FEET = 1.0, HIP = .95, MZ = .32, TOE = .2;
function stand(m, x, z, feet) { m.g.position.set(x, (feet == null ? FEET : feet) + HIP, z); }
function idle(m, T) { m.spine.rotation.x = Math.sin(T * 2.1) * .02; m.aL.rotation.z = .14 + Math.sin(T * 2.1) * .02; m.aR.rotation.z = -.14 - Math.sin(T * 2.1) * .02; }
function glance(m, k, side) { m.head.rotation.y = side * 1.25 * k; m.spine.rotation.y = side * .45 * k; m.neck.rotation.y = side * .2 * k; }
function wiggle(m, T) { const p = T % 5.3; if (p < 1.1) { const e = env(p, 0, 1.1, .15, .2); m.g.rotation.z = Math.sin(p * 26) * .07 * e; m.g.rotation.y = Math.sin(p * 26) * .12 * e; m.spine.rotation.z = -Math.sin(p * 26) * .07 * e; } }
function tipHip(a, zt) { const y = HIP, z = MZ - TOE; return V3(0, FEET + y * Math.cos(a) + z * Math.sin(a), zt - y * Math.sin(a) + z * Math.cos(a)); }
function flail(m, u, s) { m.aL.rotation.z = 1.3 + Math.sin(u * 28 * s) * .8; m.aR.rotation.z = -1.3 - Math.cos(u * 28 * s) * .8; m.aL.rotation.x = Math.sin(u * 21) * .6; m.aR.rotation.x = Math.cos(u * 21) * .6; m.lL.rotation.x = Math.sin(u * 22) * .5; m.lR.rotation.x = -Math.sin(u * 22) * .5; m.kL.rotation.x = -.4; m.kR.rotation.x = -.4; }
function hotDance(m, u, x, z, yaw) {
  const per = .45, p = (u % per) / per; m.g.position.set(x, .05 + HIP + Math.sin(p * Math.PI) * .42, z); m.g.rotation.y = yaw + Math.sin(u * 5.5) * .7;
  m.aL.rotation.z = 2.3 + Math.sin(u * 17) * .5; m.aR.rotation.z = -2.3 - Math.cos(u * 17) * .5; m.eL.rotation.x = Math.abs(Math.sin(u * 13)) * .8; m.eR.rotation.x = Math.abs(Math.cos(u * 13)) * .8;
  const kb = 1 - Math.sin(p * Math.PI); m.lL.rotation.x = .5 * kb; m.lR.rotation.x = .5 * kb; m.kL.rotation.x = -1 * kb; m.kR.rotation.x = -1 * kb; m.head.rotation.z = Math.sin(u * 19) * .25; m.mouth.scale.set(.05, .04, .012);
}
// 押されて落ちる（u：押されてからの秒）
function fall(m, u, x, landZ, zt, popZ) {
  zt = zt == null ? TOE : zt;
  if (u < .42) { const a = .75 * (u / .42) ** 2; const h = tipHip(a, zt); m.g.position.set(x, h.y, h.z); m.g.rotation.x = -a; flail(m, u, 1); m.neck.rotation.x = .4; return; }
  if (u < .95) {
    const k = (u - .42) / .53; const P0 = tipHip(.75, zt), P2 = V3(x, .55, landZ), C = V3(x, P0.y + .35, (P0.z + landZ) / 2 + .1); const q = (1 - k) * (1 - k), r = 2 * (1 - k) * k, s = k * k;
    m.g.position.set(lerp(P0.x, x, k), q * P0.y + r * C.y + s * P2.y, q * P0.z + r * C.z + s * P2.z); m.g.rotation.x = -lerp(.75, 1.55, k); flail(m, u, 1.3); m.neck.rotation.x = .5; m.mouth.scale.set(.05, .04, .012); return;
  }
  if (u < 1.35) { m.g.position.set(x, .48 - Math.sin((u - .95) * 3) * .06, landZ); m.g.rotation.x = -1.55; m.aL.rotation.z = 2.6; m.aR.rotation.z = -2.6; return; }
  if (u < 1.6) { const k = sm((u - 1.35) / .25); m.g.position.set(x, lerp(.48, 1.75, k), lerp(landZ, popZ, k)); m.g.rotation.x = -1.55 * (1 - k); m.aL.rotation.z = 2.6; m.aR.rotation.z = -2.6; m.mouth.scale.set(.06, .05, .012); return; }
  return true;
}
// せりふの吹き出し
function headPos(m) { const p = V3(0, 0, 0); m.head.getWorldPosition(p); p.y += .36; return p; }

// ===== 場面（同じ計算を、遊ぶときと動画で使う） =====
const D = { intro: 3.4, line: 1.15, pushy: 2.8, early: 5.6, clear: 5.8, late: 5.6, both: 6, dive: 6.4, bored: 4.3, fly: 5.6, fui: 5.8, yari: 6.4, gaya: 6.2, all: 9.0, enjo: 7.4, kuuki: 5.4 };
function segDur(s) { return s.type === 'out' ? D[s.kind] : s.type === 'wait' ? (s.d == null ? Infinity : s.d) : D[s.type]; }
const EV = {
  intro: [[2.62, () => { SFX.talk(4, CIV ? 1.22 : 1); }]],
  line: [[.14, s => { if (CIV) SFX.talk(5, 1.22); else SFX.talk(s.n === 3 ? 7 : 4, s.n >= 4 ? .85 : 1); }]],
  pushy: [[.42, () => { SFX.angry(); SFX.talk(5, 1.2); }], [1.38, () => SFX.talk(6, .9)]],
  fall: [[.06, () => SFX.push()], [.28, () => SFX.whoosh()], [1.06, () => { SFX.splash(true); splash(0, -.6, 60, 1.1); steamBoost = 2; }], [1.6, () => { SFX.splash(false); splash(0, -.85, 25, .7); SFX.hiss(); SFX.talk(4, 1.25); }]],
  both: [[.32, () => SFX.push()], [.46, () => SFX.thud()], [.62, () => SFX.whoosh()], [1.3, () => { SFX.splash(true); splash(0, -.9, 90, 1.3); steamBoost = 2.5; }], [1.95, () => { SFX.splash(false); splash(0, -1.1, 30, .8); SFX.hiss(); SFX.talk(5, 1.25); }], [3.75, () => { SFX.angry(); SFX.talk(6); }], [4.45, () => { SFX.pop(); }]],
  dive: [[.1, () => SFX.whoosh()], [.6, () => SFX.whoosh()], [1.4, () => { SFX.splash(true); splash(0, -1.75, 110, 1.5); steamBoost = 3; }], [2.05, () => { SFX.splash(false); splash(0, -1.75, 30, .8); SFX.hiss(); }], [3.55, () => { SFX.talk(7, 1.15); }], [4.75, () => { SFX.talk(6, .9); SFX.fanfare(); confetti(0, -.8); }]],
  bored: [[1.0, () => { SFX.sigh(); }], [1.25, () => SFX.talk(6, .7)], [1.9, () => SFX.bad()]]
};
function hopEvents(a, b, x, z) { const r = []; for (let u = a; u < b; u += .45)r.push([u, () => { SFX.hop(); splash(x, z, 8, .5); steamBoost = Math.min(3, steamBoost + .6); }]); return r; }
function crowdEv(s) {
  const ty = s.type, k = s.kind;
  if (ty === 'intro') return CIV ? [[.05, () => murSet(.1)]] : [[.05, () => murSet(.17)], [2.66, () => cue('giggle', .5)]];
  if (ty === 'line') { if (CIV) return []; const n = s.n; return n === 3 ? [[.2, () => cue('ooh', .75)], [.75, () => cue('giggle', .5)]] : n === 4 ? [[.25, () => cue('laugh', .55)]] : [[.3, () => cue('giggle', n < 3 ? .45 : .3)]]; }
  if (ty === 'pushy') return [[.45, () => { cue('laugh', 1); cue('applause', .35); }], [1.42, () => cue('laugh', .6)]];
  if (ty !== 'out') return [];
  switch (k) {
    case 'early': return [[.08, () => cue('eh', .85)], [1.08, () => cue('laugh', .85)], [2.3, () => cue('laugh', .55)], [3.5, () => cue('laugh', .75)]];
    case 'late': return [[.08, () => cue('aah', .8)], [1.08, () => cue('laugh', .7)], [3.5, () => cue('laugh', .6)]];
    case 'clear': return [[.08, () => cue('ooh', .9)], [1.08, () => { cue('laugh', 1); cue('cheer', .8); }], [2.3, () => cue('laugh', .75)], [3.5, () => { cue('applause', 1); cue('cheer', .7); cue('laugh', .5); }]];
    case 'both': return [[.48, () => cue('eh', 1)], [1.32, () => { cue('laugh', 1); cue('cheer', .7); }], [2.6, () => cue('laugh', .8)], [3.8, () => cue('laugh', .8)], [4.5, () => { cue('applause', .85); cue('cheer', .5); }]];
    case 'dive': return [[.15, () => cue('eh', 1)], [1.42, () => { cue('laugh', 1); cue('cheer', 1); }], [2.6, () => cue('laugh', .9)], [3.6, () => cue('laugh', .9)], [4.8, () => { cue('applause', 1); cue('cheer', 1); }]];
    case 'bored': return [[1.05, () => cue('aah', .75)], [1.9, () => murSet(0)], [3.05, () => cue('giggle', .3)]];
    case 'fly': return [[.08, () => cue('eh', .9)], [1.08, () => cue('laugh', 1)], [2.3, () => cue('laugh', .6)], [3.5, () => cue('laugh', .85)]];
    case 'fui': return [[.08, () => cue('eh', .8)], [1.08, () => cue('laugh', 1)], [2.3, () => cue('laugh', .6)], [3.5, () => cue('laugh', .9)]];
    case 'yari': return [[.08, () => cue('ooh', .9)], [.95, () => cue('ooh', 1)], [1.62, () => cue('eh', 1)], [2.0, () => cue('laugh', 1)], [3.5, () => { cue('laugh', .9); cue('cheer', .5); }]];
    case 'gaya': return [[.25, () => cue('eh', .9)], [1.22, () => { cue('laugh', 1); cue('cheer', .6); }], [1.75, () => cue('laugh', .8)], [3.55, () => cue('laugh', .9)], [4.6, () => cue('applause', .6)]];
    case 'all': return [[.15, () => cue('eh', 1)], [1.42, () => { cue('laugh', 1); cue('cheer', 1); }], [2.3, () => cue('ooh', 1)], [2.95, () => cue('laugh', 1)], [3.4, () => cue('cheer', 1)], [3.85, () => cue('laugh', 1)], [4.45, () => cue('laugh', .9)], [6.3, () => cue('ooh', .9)], [7.0, () => { cue('applause', 1); cue('cheer', 1); cue('laugh', .7); }]];
    case 'enjo': return [[.1, () => cue('eh', 1)], [1.2, () => cue('aah', .9)], [1.45, () => murSet(.02)], [3.6, () => murSet(0)]];
    case 'kuuki': return [[.4, () => cue('ooh', .6)], [1.1, () => { cue('applause', 1); cue('cheer', .5); }], [2.6, () => cue('applause', .8)]];
  }
  return [];
}
function evList(s) { return [...evList0(s), ...crowdEv(s)]; }
function evList0(s) {
  if (s.type === 'intro') return EV.intro; if (s.type === 'line') return EV.line; if (s.type === 'pushy') return EV.pushy; if (s.type !== 'out') return [];
  const k = s.kind;
  if (k === 'early' || k === 'clear' || k === 'late' || k === 'fly' || k === 'fui') return [...EV.fall, ...hopEvents(2.05, 3.3, 0, -.85), [3.45, k === 'clear' ? () => { SFX.talk(6, 1.1); SFX.fanfare(); confetti(0, -.8); } : () => { SFX.angry(); SFX.talk(7); }]];
  if (k === 'yari') return [[.06, () => SFX.push()], [.28, () => SFX.whoosh()], [.92, () => { SFX.splash(false); splash(0, -1.45, 45, 1.05); steamBoost = 1.6; SFX.talk(3, 1.3); }], [1.0, () => SFX.whoosh()], [1.62, () => SFX.thud()], [2.25, () => SFX.talk(4, 1.25)], [3.45, () => { SFX.angry(); SFX.talk(7); }]];
  if (k === 'both') return [...EV.both, ...hopEvents(2.4, 3.6, 0, -1.2)];
  if (k === 'dive') return [...EV.dive, ...hopEvents(2.5, 4.2, 0, -1.75)];
  if (k === 'all') return [...EV.dive.slice(0, 4), ...hopEvents(2.5, 4.2, 0, -1.75), ...ALLJ.map(([at]) => [at, () => SFX.whoosh()]), ...ALLJ.map(([at, p]) => [at + .75, () => { SFX.splash(false); splash(p[0], p[1], 40, .95); steamBoost = Math.min(3, steamBoost + .8); }]), [4.45, () => { SFX.angry(); SFX.talk(6, 1.1); }], [5.65, () => SFX.talk(4)], [6.28, () => SFX.whoosh()], [6.95, () => { SFX.splash(true); splash(0, -.6, 120, 1.6); steamBoost = 3; }], [7.0, () => { SFX.fanfare(); confetti(0, -1.2); }], [7.6, () => SFX.talk(5, 1.2)]];
  if (k === 'gaya') return [[.15, () => SFX.push()], [.6, () => SFX.whoosh()], [1.2, () => { SFX.splash(true); splash(.85, -1.2, 70, 1.15); steamBoost = 2; }], [1.55, () => { SFX.splash(false); splash(.85, -1.2, 25, .7); SFX.hiss(); }], [1.72, () => SFX.talk(4)], ...hopEvents(1.95, 3.3, .85, -1.2), [3.45, () => { SFX.angry(); SFX.talk(6, .95); }]];
  if (k === 'enjo') return [...EV.fall.slice(0, 3), [1.6, () => { SFX.splash(false); splash(0, -.85, 25, .7); SFX.hiss(); SFX.talk(5, 1.4); }], [1.75, () => SFX.hop()], [2.25, () => SFX.thud()], [2.7, () => SFX.bad()], ...FLASH_T.map(at => [at, () => SFX.shutter()])];
  if (k === 'kuuki') return [[.2, () => SFX.sigh()], [.95, () => SFX.talk(6, 1.15)], [1.2, () => SFX.fanfare()]];
  return EV.bored;
}
function fireEv(s, t0, t1) { for (const [at, f] of evList(s)) if (at > t0 && at <= t1) f(s); }

// o：吹き出しや大きい文字など、画面に重ねるもの
function scene(s, t, T) {
  const o = scene0(s, t, T); o.tel = null; o.wipe = false; o.kp = CIV ? 'gachi' : 'def'; o.bg = null;
  const ty = s.type, k = s.kind;
  if (ty === 'line' || ty === 'wait') { if (!CIV && (s.n || 0) >= 7) o.kp = 'wrap'; }
  else if (ty === 'pushy') { o.kp = 'lol'; if (t > .42 && t < 2.4) o.tel = tx('tel_pushy'); o.wipe = t > .45; const ga = tx('gaya').pushy; if (t > .5 && t < 1.4) o.bg = [0, ga[0]]; else if (t > 1.45 && t < 2.5) o.bg = [1, ga[1]]; }
  else if (ty === 'out') {
    const ga = tx('gaya')[k] || [];
    if (k === 'early' || k === 'clear' || k === 'late' || k === 'fly' || k === 'fui' || (k === 'yari' && t < .6)) {
      const kk = k === 'yari' ? 'clear' : k, g2 = tx('gaya')[kk] || [];
      if (kk === 'fly') { if (t < 1.0) o.tel = tx('tel_fly1'); else if (t < 2.3) o.tel = tx('tel_fly2'); else if (t > 3.45) o.tel = tx('tel_fly'); }
      else if (kk === 'fui') { if (t < 1.2) o.tel = tx('tel_fui1'); else if (t < 2.3) o.tel = tx('tel_hot'); else if (t > 3.45) o.tel = tx('tel_fui'); }
      else { if (t < 1.0) o.tel = tx('tel_push'); else if (t < 2.3) o.tel = tx('tel_hot'); else if (t > 3.45) o.tel = tx('tel_' + kk); }
      o.wipe = t > 1.1; if (t > .15) o.kp = kk === 'fly' ? 'mada' : kk; if (t > .35 && t < 1.4) o.bg = [0, g2[0]]; else if (t > 3.7 && t < 5.2) o.bg = [1, g2[1]];
    }
    else if (k === 'yari') { if (t < 2.4) o.tel = tx('tel_yari1'); else if (t > 3.4) o.tel = tx('tel_yari'); o.wipe = t > 1.0; o.kp = 'yari'; if (t > 1.0 && t < 2.2) o.bg = [1, ga[0]]; else if (t > 3.6 && t < 5.0) o.bg = [0, ga[1]]; }
    else if (k === 'both') { if (t > .45 && t < 1.3) o.tel = tx('tel_both1'); else if (t >= 1.3 && t < 2.7) o.tel = tx('tel_both2'); o.wipe = t > 1.35; if (t > .5) o.kp = 'both'; if (t > 1.0 && t < 2.0) o.bg = [1, ga[0]]; else if (t > 2.2 && t < 3.4) o.bg = [0, ga[1]]; }
    else if (k === 'dive') { if (t > .1 && t < .9) o.tel = tx('tel_dive1'); else if (t >= .9 && t < 2.7) o.tel = tx('tel_dive2'); o.wipe = t > 1.45; if (t > 1.4) o.kp = 'dive'; if (t > 1.6 && t < 2.6) o.bg = [0, ga[0]]; else if (t > 2.6 && t < 3.4) o.bg = [1, ga[1]]; }
    else if (k === 'all') { if (t > .1 && t < .9) o.tel = tx('tel_dive1'); else if (t >= .9 && t < 2.3) o.tel = tx('tel_dive2'); else if (t >= 2.3 && t < 3.6) o.tel = tx('tel_all1'); else if (t >= 3.6 && t < 6.2) o.tel = tx('tel_all2'); else if (t > 7.0) o.tel = tx('tel_all'); o.wipe = t > 1.45; o.kp = t > 2.2 ? 'all' : t > 1.4 ? 'dive' : 'def'; if (t > 2.0 && t < 2.9) o.bg = [0, ga[0]]; else if (t > 2.9 && t < 3.8) o.bg = [1, ga[1]]; }
    else if (k === 'gaya') { if (t > .3 && t < 1.3) o.tel = tx('tel_gaya1'); else if (t >= 1.3 && t < 3.0) o.tel = tx('tel_gaya2'); else if (t > 3.4) o.tel = tx('tel_gaya'); o.wipe = t > 1.3; if (t > .4) o.kp = 'gaya'; if (t > 3.5 && t < 5.0) o.bg = [1, tx('gayaV')]; if (t > 1.1 && t < 2.5) { o.bp = ga[0]; o.bpAt = G1; } }
    else if (k === 'enjo') { if (t > .3 && t < 1.4) o.tel = tx('tel_enjo1'); else if (t > 3.0 && t < 3.6) o.tel = tx('tel_enjo2'); else if (t > 3.9) o.tel = tx('tel_enjo'); if (t > .4) o.kp = 'enjo'; if (t > 1.7 && t < 2.7) o.bg = [0, ga[0]]; else if (t > 2.7 && t < 3.5) o.bg = [1, ga[1]]; }
    else if (k === 'kuuki') { if (t > 1.1) o.tel = tx('tel_kuuki'); o.wipe = t > 1.2; if (t > .3) o.kp = 'seikai'; if (t > 2.5 && t < 3.6) o.bg = [0, ga[0]]; else if (t > 3.7 && t < 4.9) o.bg = [1, ga[1]]; }
    else if (k === 'bored') { if (t > 1.9 && t < 3.0) o.tel = tx('tel_bored1'); else if (t >= 3.0) o.tel = tx('tel_bored2'); o.kp = t > 1.6 ? 'bored' : 'wrap'; if (t > 2.2 && t < 3.4) o.bg = [0, ga[0]]; }
  }
  if (o.bg && !o.bg[1]) o.bg = null;
  { const hb = ty === 'out' && (((k === 'dive' || k === 'all') && t < .66) || (k === 'all' && t >= 3.05)); for (const m of BOOMV) m.visible = !hb; }
  resetCrew();
  let skip = 0; if (ty === 'out' && k === 'gaya' && t >= .15) skip |= 2; if (ty === 'out' && k === 'all') { if (t >= 2.15) skip |= 1; if (t >= 2.45) skip |= 2; }
  gayaPose(T, skip); if (ty === 'out') extras(k, t, T, o);
  { let fv = Math.abs(cam.position.x) < 1.3 && cam.position.z > 1.3; if (ty === 'out' && (k === 'gaya' || k === 'all' || (k === 'kuuki' && t >= 2.3))) fv = false; G1.g.visible = G2.g.visible = !fv; }
  setKanpe(o.kp); return o;
}
// 振り返り（3回目以外）：待ち始めて2秒ごろから、4.6秒ごとにチラッと見る
function glP(s, t) { if (s.fuiAt != null) return { p: t - s.fuiAt + .5, side: s.side || 1 }; const q = t + 2.6; return { p: q % 4.6, side: Math.floor(q / 4.6) % 2 ? 1 : -1 }; }
// 一般の方：腕をかかえて、ひざがふるえる
function civIdle(m, T) {
  const w = Math.sin(T * 31), w2 = Math.sin(T * 27 + 1);
  m.aL.rotation.set(.95, 0, -.55); m.eL.rotation.x = 1.5; m.aR.rotation.set(.95, 0, .55); m.eR.rotation.x = 1.5;
  m.lL.rotation.x = .1 + w * .035; m.kL.rotation.x = -.2 - w * .04; m.lR.rotation.x = .1 + w2 * .035; m.kR.rotation.x = -.2 - w2 * .04;
  m.g.position.y -= .03; m.g.position.x += w * .004; m.spine.rotation.x = .06; m.neck.rotation.x = .22;
}
function civLook(m, k, side) { m.head.rotation.y = side * 1.05 * k; m.neck.rotation.y = side * .25 * k; m.neck.rotation.x = .22 * (1 - k); for (const [b, sx] of m.brows) b.rotation.z = -sx * .45 * k; m.mouth.scale.set(.03, .022 + .01 * k, .012); }
function arcPos(a, c, b, r) { const q = (1 - r) * (1 - r), m = 2 * (1 - r) * r, n = r * r; return V3(q * a.x + m * c.x + n * b.x, q * a.y + m * c.y + n * b.y, q * a.z + m * c.z + n * b.z); }
function meDive(t) {
  if (t < 1.4) { const r = (t - .6) / .8; ME.g.position.copy(arcPos(V3(0, 2.95, .55), V3(0, 4.3, -.6), V3(0, .5, -1.75), r)); ME.g.rotation.x = -lerp(.9, 2.75, r); ME.aL.rotation.x = 2.95; ME.aR.rotation.x = 2.95; ME.aL.rotation.z = .1; ME.aR.rotation.z = -.1; }
  else if (t < 1.85) { ME.g.position.set(0, .4, -1.75); ME.g.rotation.x = -2.9; ME.aL.rotation.x = 2.9; ME.aR.rotation.x = 2.9; }
  else if (t < 2.05) { const r = sm((t - 1.85) / .2); ME.g.position.set(0, lerp(.4, 1.7, r), -1.75); ME.g.rotation.x = -2.9 * (1 - r); ME.aL.rotation.z = 2.6; ME.aR.rotation.z = -2.6; }
  else hotDance(ME, t - 2.05, 0, -1.75, -Math.PI / 2);
}
// 全員ダイブ：飛びこむ時刻と、湯船の中の場所（ガヤ2人・AD・音声・カメラ2人）
const ALLJ = [[2.15, [-.95, -.55]], [2.45, [.95, -.55]], [2.75, [1.0, -1.35]], [3.05, [-1.0, -1.35]], [3.3, [-.95, -2.3]], [3.55, [.95, -2.3]]];
const FLASH_T = [3.95, 4.15, 4.3, 4.62, 4.78, 5.05, 5.3, 5.42, 5.75, 6.05, 6.2, 6.55, 6.8];
function manJump(m, u, x0, z0, to, peak) {
  rest(m);
  if (u < .75) { const r = u / .75, a = V3(x0, FEET + HIP, z0), b = V3(to[0], .5, to[1]); m.g.position.copy(arcPos(a, V3((a.x + b.x) / 2, peak, (a.z + b.z) / 2), b, r)); m.g.rotation.y = Math.atan2(-(b.x - a.x), -(b.z - a.z)); m.g.rotation.x = -lerp(.2, 1.5, r); m.aL.rotation.z = 2.7; m.aR.rotation.z = -2.7; m.lL.rotation.x = .5; m.lR.rotation.x = .5; m.kL.rotation.x = -1; m.kR.rotation.x = -1; m.mouth.scale.set(.06, .05, .012); }
  else if (u < 1.05) { m.g.position.set(to[0], .4, to[1]); m.g.rotation.x = -1.5; m.aL.rotation.z = 2.6; m.aR.rotation.z = -2.6; }
  else hotDance(m, u - 1.05, to[0], to[1], -Math.PI / 2);
}
function crewJump(q, u, to) {
  if (u < 0) return; const g = q.c.g; g.rotation.order = 'YXZ'; const a = q.p, b = V3(to[0], -.3, to[1]);
  if (u < .75) { const r = u / .75; g.position.copy(arcPos(a, V3((a.x + b.x) / 2, 2.3, (a.z + b.z) / 2), b, r)); g.rotation.set(lerp(.1, .9, r), Math.atan2(b.x - a.x, b.z - a.z), 0); q.c.arms.forEach(x => x.rotation.set(2.8, 0, 0)); }
  else { const w = u - .75; g.position.set(b.x, -.3 - (w < .3 ? .3 * Math.sin(w / .3 * Math.PI) : 0) + Math.abs(Math.sin(w * 6)) * .14, b.z); g.rotation.set(0, Math.atan2(4.4 - b.x, 1.0 - b.z) + Math.sin(w * 4) * .4, 0); q.c.arms.forEach((x, i) => x.rotation.set(2.5 + Math.sin(w * 14 + i * 2) * .45, 0, 0)); }
}
// ガヤ・スタッフの動き（ガヤを押す・全員ダイブ）
function extras(k, t, T, o) {
  if (k === 'gaya') {
    const m = G2, x0 = GP[1].x, z0 = GP[1].z, u = t - .15; if (u < 0) return; rest(m);
    if (u < .5) { const r = u / .5; stand(m, lerp(x0, 1.0, r), lerp(z0, .2, r)); m.g.rotation.y = Math.atan2(-(1.0 - x0), -(.2 - z0)); m.g.rotation.x = -.4 * r; flail(m, u, 1.2); }
    else if (u < 1.05) { const r = (u - .5) / .55; m.g.position.copy(arcPos(V3(1.0, FEET + HIP, .2), V3(.95, FEET + HIP + .45, -.5), V3(.85, .5, -1.2), r)); m.g.rotation.y = Math.atan2(.15, 1.4); m.g.rotation.x = -lerp(.4, 1.55, r); flail(m, u, 1.4); m.mouth.scale.set(.06, .05, .012); }
    else if (u < 1.4) { m.g.position.set(.85, .42, -1.2); m.g.rotation.x = -1.55; m.aL.rotation.z = 2.6; m.aR.rotation.z = -2.6; }
    else if (t < 3.4) { hotDance(m, u - 1.4, .85, -1.2, -Math.PI / 2); if (!o.bg) o.bg = [1, tx('hot')[Math.floor((u - 1.4) / .6) % 3]]; }
    else { stand(m, .85, -1.2, .05); m.g.rotation.y = Math.atan2(.85, -3.5); angryB(m); m.aR.rotation.x = 1.5; m.aL.rotation.z = .7; m.eL.rotation.z = -1.9; m.g.position.y += Math.abs(Math.sin((t - 3.4) * 14)) * .05; talkM(m, T, t > 3.5 && t < 4.6); }
    return;
  }
  if (k === 'all') {
    if (t >= 2.15) manJump(G1, t - 2.15, GP[0].x, GP[0].z, ALLJ[0][1], 3.0);
    if (t >= 2.45) manJump(G2, t - 2.45, GP[1].x, GP[1].z, ALLJ[1][1], 3.0);
    crewJump(CREW[3], t - 2.75, ALLJ[2][1]); if (t >= 2.75) for (const m of KB) m.visible = false;
    crewJump(CREW[2], t - 3.05, ALLJ[3][1]); crewJump(CREW[0], t - 3.3, ALLJ[4][1]); crewJump(CREW[1], t - 3.55, ALLJ[5][1]);
  }
  if (k === 'yari' && t >= .6) for (const m of KB) m.visible = false;
}
function scene0(s, t, T) {
  const o = { bm: null, bp: null, bpAt: null, angry: false, big: null, dark: 0, flash: 0, say: s.say || 0 };
  rest(MAN); rest(ME); dressME(null); ME.g.visible = false; hands.visible = false; hands.position.z = 0;
  const type = s.type;
  if (type === 'title') {
    stand(MAN, 0, MZ); idle(MAN, T); wiggle(MAN, T); const a = Math.sin(T * .18) * .6; setCam(V3(Math.sin(a) * 5.4, 3.7, -.6 - Math.cos(a) * 5.4), V3(0, 1.4, -.4), true);
    const p = T % 4.2; if (p < 1.2) { MAN.aR.rotation.z = -2.6 + Math.sin(p * 14) * .3; MAN.aR.rotation.x = .2; } return o;
  }
  const idleP = () => { if (CIV) civIdle(MAN, T); else idle(MAN, T); };
  if (type === 'intro') {
    stand(MAN, 0, MZ); idleP();
    if (t < 1.0) setCam(introCurve.points[0], V3(0, 1.5, -.3), false);
    else if (t < 2.7) { const k = sm((t - 1) / 1.7); setCam(introCurve.getPoint(k), V3(0, lerp(1.5, FP[1].y, k), lerp(-.3, FP[1].z, k)), false); }
    else setCam(FP[0], FP[1]);
    if (!CIV && t < 2.4) { MAN.aL.rotation.z = .75; MAN.eL.rotation.z = -1.9; MAN.aR.rotation.z = -.75; MAN.eR.rotation.z = 1.9; }
    if (t >= 2.6) { if (CIV) civLook(MAN, env(t, 2.6, 3.5), 1); else glance(MAN, env(t, 2.6, 3.5), 1); talkM(MAN, T, t < 3.15); o.bm = Ln(1); }
    return o;
  }
  // ここから先は、目の前の背中が基本
  if (type === 'line' || type === 'wait') {
    stand(MAN, 0, MZ); idleP(); setCam(FP[0], FP[1]);
    if (type === 'line') { const side = s.n % 2 ? 1 : -1; if (CIV) civLook(MAN, env(t, .05, 1.05), side); else { glance(MAN, env(t, .05, 1.05), side); if (s.n === 3) { MAN.aR.rotation.z = -.12 - env(t, .05, 1.05) * 1.6; MAN.eR.rotation.z = env(t, .05, 1.05) * .6; } } talkM(MAN, T, t > .12 && t < .7); }
    else if (CIV) { const q = t + 1.2, p = q % 3.8; if (p < 1.2) civLook(MAN, env(p, 0, 1.2, .25, .3), Math.floor(q / 3.8) % 2 ? 1 : -1); }
    else if (s.n === 3) wiggle(MAN, T * 1.9);
    else { const g = glP(s, t); if (g.p < 1.1) glance(MAN, env(g.p, 0, 1.1, .2, .3), g.side); else wiggle(MAN, T); }
    o.bm = Ln(s.n);
    if (type === 'wait' && s.press != null) { const k = clamp(s.press, 0, 1); hands.visible = k > 0; hands.position.z = -.12 * k; }
    return o;
  }
  if (type === 'pushy') {
    stand(MAN, 0, MZ); setCam(FP[0], FP[1]);
    const yaw = t < .45 ? sm(t / .45) * Math.PI : t > 2.25 ? (1 - sm((t - 2.25) / .5)) * Math.PI : Math.PI; MAN.g.rotation.y = yaw;
    if (t > .4 && t < 1.35) { angryB(MAN); MAN.aL.rotation.z = .5; MAN.eL.rotation.x = 1.7; MAN.aR.rotation.z = -.5; MAN.eR.rotation.x = 1.7; MAN.g.position.y += Math.abs(Math.sin(t * 16)) * .04; talkM(MAN, T, true); o.bm = tx('pushy1'); o.angry = true; }
    else if (t >= 1.35) { MAN.head.rotation.z = .25; MAN.aR.rotation.x = .9; MAN.eR.rotation.x = .6; talkM(MAN, T, t < 2); o.bm = tx('pushy2'); }
    return o;
  }
  // 結末
  const k = s.kind;
  if (k === 'early' || k === 'clear' || k === 'late' || k === 'fly' || k === 'fui' || (k === 'yari' && t < .6)) {
    const kk = k === 'yari' ? 'clear' : k, u = t - .12;
    if (t < .5) { setCam(FP[0], FP[1]); hands.visible = true; hands.position.z = t < .12 ? -.42 * (t / .12) : -.42 * (1 - ph(t, .35, .5)); }
    else if (t < 3.3) { const d = ph(t, .5, 3.3); setCam(V3(3.7 - d * .3, 2.4, -.55 - d * .2), WIDE[1], true); }
    else setCam(V3(2.7, 1.95, -.85), V3(0, 1.45, -.85), true);
    if (u < 0) { stand(MAN, 0, MZ); idle(MAN, T); if (kk === 'fui') { glance(MAN, 1, s.side || 1); MAN.mouth.scale.set(.05, .05, .012); } }
    else if (t < 3.3) { if (fall(MAN, u, 0, -.55, TOE, -.85)) { hotDance(MAN, u - 1.6, 0, -.85, -Math.PI / 2); if (t < 3.25) o.bm = tx('hot')[Math.floor((u - 1.6) / .6) % 3]; } else if (kk === 'fui' && u < 1.0) { MAN.head.rotation.y = (s.side || 1) * 1.0; MAN.mouth.scale.set(.05, .05, .012); } }
    else {
      const q = t - 3.3; stand(MAN, 0, -.85, .05); MAN.g.rotation.y = -Math.PI / 2;
      if (kk === 'clear') { MAN.aR.rotation.x = 2.6; MAN.aR.rotation.z = -.3; MAN.aL.rotation.z = .5; MAN.mouth.scale.set(.06, .03, .012); MAN.g.position.y += Math.abs(Math.sin(q * 7)) * .05; if (q > .15) { o.bm = tx('clear'); o.big = tx('bigClear'); } }
      else { angryB(MAN); MAN.aR.rotation.x = 1.5; MAN.aL.rotation.z = .7; MAN.eL.rotation.z = -1.9; MAN.g.position.y += Math.abs(Math.sin(q * 14)) * .05; talkM(MAN, T, q > .15 && q < 1.2); if (q > .15) { o.bm = tx(kk); o.angry = true; } if (q > .6) { if (kk === 'fly') o.big = tx('bigFly'); else if (kk === 'fui') o.big = tx('bigFui'); } }
    }
    if (kk === 'fui' && t < .85) o.bm = tx('eh');
    return o;
  }
  if (k === 'yari') {
    const u = t - .12;
    if (t < 2.3) { const d = sm(ph(t, .6, 2.3)); setCam(V3(lerp(3.7, .3, d), lerp(2.4, 2.6, d), lerp(-.55, -2.2, d)), V3(0, lerp(1.2, 1.3, d), lerp(-1.0, -5.0, d)), true); }
    else setCam(V3(.3, 2.6, -2.2), V3(0, 1.3, -5.0), true);
    const P0 = tipHip(.75, TOE), Wp = V3(0, .85, -1.45), Lp = V3(0, 1.0, -5.05), YC = Math.atan2(-.3, -2.8);
    if (u < .8) { const r = clamp((u - .42) / .38, 0, 1); MAN.g.position.copy(arcPos(P0, V3(0, P0.y + .3, (P0.z + Wp.z) / 2), Wp, r)); MAN.g.rotation.x = -lerp(.75, 1.6, r); flail(MAN, u, 1.3); }
    else if (u < 1.5) { const r = (u - .8) / .7; MAN.g.position.copy(arcPos(Wp, V3(0, 3.0, (Wp.z + Lp.z) / 2), Lp, r)); MAN.g.rotation.x = -(1.6 + r * Math.PI * 2); flail(MAN, u, 1.6); MAN.mouth.scale.set(.06, .05, .012); if (u < 1.1) o.bm = tx('hot')[0]; }
    else if (u < 2.1) { MAN.g.position.set(0, .62, -5.05); MAN.g.rotation.x = -1.5; MAN.aL.rotation.z = 1.4; MAN.aR.rotation.z = -1.4; MAN.lL.rotation.x = .3; }
    else if (t < 3.3) { const w = u - 2.1; stand(MAN, 0, -5.0, .36); MAN.g.rotation.y = YC; MAN.g.position.y += Math.abs(Math.sin(w * 9)) * .12; MAN.aL.rotation.z = 2.3 + Math.sin(w * 17) * .4; MAN.aR.rotation.z = -2.3 - Math.cos(w * 17) * .4; MAN.mouth.scale.set(.05, .04, .012); o.bm = tx('hot')[Math.floor(w / .6) % 3]; }
    else { const q = t - 3.3; stand(MAN, 0, -5.0, .36); MAN.g.rotation.y = YC; angryB(MAN); MAN.aR.rotation.x = 1.5; MAN.aL.rotation.z = .7; MAN.eL.rotation.z = -1.9; MAN.g.position.y += Math.abs(Math.sin(q * 14)) * .05; talkM(MAN, T, q > .15 && q < 1.2); if (q > .15) { o.bm = tx('yari'); o.angry = true; } if (q > .6) o.big = tx('bigYari'); }
    return o;
  }
  if (k === 'both') {
    if (t < .62) { const r = ph(t, 0, .45); cam.up.set(0, 1, 0); setCam(V3(0, lerp(2.85, 2.55, r) + Math.abs(Math.sin(t * 22)) * .05, lerp(2.3, 1.0, r)), V3(0, lerp(1.45, 1.6, r), -1.4)); hands.visible = true; hands.position.z = t > .3 ? -.3 * ph(t, .3, .45) : 0; }
    else if (t < 3.6) { const d = ph(t, .62, 3.6); setCam(V3(3.9 - d * .3, 2.5, -.8), V3(0, 1.2, -1.1), true); }
    else setCam(V3(3.3, 2.1, -1.3), V3(0, 1.45, -1.3), true);
    const u = t - .45, u2 = t - .5;
    if (t < 3.6) {
      if (u < 0) { stand(MAN, 0, MZ); idle(MAN, T); } else if (fall(MAN, u, 0, -.45, TOE, -.75)) { hotDance(MAN, u - 1.6, -.15, -.75, -Math.PI / 2); if (t < 3.55) o.bm = tx('hot')[Math.floor((u - 1.6) / .6) % 3]; }
      if (t >= .62) { ME.g.visible = true; if (fall(ME, u2 + .1, 0, -1.4, TOE + .5, -1.75)) { hotDance(ME, u2 + .1 - 1.6 + .2, .15, -1.75, -Math.PI / 2); if (t < 3.55) o.bp = tx('meHot')[Math.floor((u2 - 1.4) / .7) % 2]; } }
    }
    else {
      const q = t - 3.6; ME.g.visible = true; stand(MAN, 0, -.75, .05); stand(ME, 0, -1.75, .05); MAN.g.rotation.y = -.35; angryB(MAN); MAN.aR.rotation.x = 1.5; MAN.aR.rotation.z = .2; MAN.aL.rotation.z = .7; MAN.eL.rotation.z = -1.9; talkM(MAN, T, q > .15 && q < 1.2);
      ME.g.rotation.y = -Math.PI / 2 - .4; ME.aR.rotation.z = -2.5; ME.eR.rotation.z = 1.4; ME.head.rotation.z = .2; ME.mouth.scale.set(.05, .02, .012);
      if (q > .15) { o.bm = tx('both'); o.angry = true; } if (q > .85) o.big = tx('bigBoth');
    }
    return o;
  }
  if (k === 'dive' || k === 'all') {
    if (t < .6) { const r = sm(t / .6); const q = (1 - r) * (1 - r), a = 2 * (1 - r) * r, b = r * r; setCam(V3(0, q * 2.85 + a * 4.0 + b * 3.6, q * 2.3 + a * 1.2 + b * -.3), V3(0, lerp(1.45, .85, r), lerp(-1.55, -1.8, r))); }
    else if (k === 'dive') { if (t < 3.4) { const d = ph(t, .6, 3.4); setCam(V3(4.2 - d * .4, 2.7, -.5), V3(0, 1.45, -.9), true); } else setCam(V3(3.6, 2.5, -.5), V3(0, 1.45, -.9), true); }
    else if (t < 2.1) { const d = ph(t, .6, 2.1); setCam(V3(4.2 - d * .4, 2.7, -.5), V3(0, 1.45, -.9), true); }
    else if (t < 6.1) { const d = sm(ph(t, 2.1, 3.0)); setCam(V3(lerp(3.8, 4.6, d), lerp(2.7, 3.5, d), lerp(-.5, .8, d)), V3(0, lerp(1.45, 1.0, d), lerp(-.9, -1.4, d)), true); }
    else setCam(V3(4.2, 3.0, 1.4), V3(0, 1.1, -1.2), true);
    if (t >= .6) { ME.g.visible = true; meDive(t); if (t >= 2.05 && t < (k === 'all' ? 3.4 : 4.6)) o.bp = tx('meHot')[Math.floor((t - 2.05) / .7) % 2]; }
    stand(MAN, 0, MZ);
    if (k === 'dive') {
      if (t < .25) idle(MAN, T); else if (t < 3.4) { MAN.neck.rotation.x = t < .9 ? .6 : -.45; MAN.head.rotation.x = t < .9 ? .3 : -.2; MAN.aL.rotation.z = .7; MAN.aR.rotation.z = -.7; MAN.eL.rotation.x = .8; MAN.eR.rotation.x = .8; MAN.mouth.scale.set(.05, .05, .012); }
      else {
        const q = t - 3.4; MAN.g.rotation.y = -Math.PI / 2 * sm(q / .35);
        if (q < 1.25) { MAN.aL.rotation.z = 2.5; MAN.aR.rotation.z = -2.5; MAN.g.position.y += Math.abs(Math.sin(q * 12)) * .06; talkM(MAN, T, q > .15 && q < 1); if (q > .12) o.bm = tx('dive'); o.angry = true; }
        else { MAN.aL.rotation.x = 1.3; MAN.aR.rotation.x = 1.3; MAN.aL.rotation.z = -.35 + Math.abs(Math.sin(q * 14)) * .3; MAN.aR.rotation.z = .35 - Math.abs(Math.sin(q * 14)) * .3; MAN.mouth.scale.set(.06, .03, .012); talkM(MAN, T, q < 2, true); o.bm = tx('dive2'); o.big = tx('bigDive'); }
      }
      return o;
    }
    if (t < .25) idle(MAN, T);
    else if (t < 4.3) { MAN.neck.rotation.x = t < .9 ? .6 : -.2; MAN.head.rotation.x = t < .9 ? .3 : 0; MAN.head.rotation.y = t > 2.1 ? Math.sin(t * 2.6) * .7 : 0; MAN.aL.rotation.z = .7 + (t > 2.1 ? .8 : 0); MAN.aR.rotation.z = -.7 - (t > 2.1 ? .8 : 0); MAN.eL.rotation.x = .8; MAN.eR.rotation.x = .8; MAN.mouth.scale.set(.05, .05, .012); }
    else if (t < 6.25) {
      const q = t - 4.3; MAN.g.rotation.y = -Math.PI / 2 * sm(q / .35); MAN.aL.rotation.z = 2.5; MAN.aR.rotation.z = -2.5; MAN.g.position.y += Math.abs(Math.sin(q * 12)) * .06; talkM(MAN, T, true);
      if (q < 1.35) { o.bm = tx('allM1'); o.angry = true; } else { o.bm = tx('allM2'); MAN.aR.rotation.x = 2.6; MAN.aR.rotation.z = -.3; }
    }
    else {
      const u = t - 6.25;
      if (u < .7) { const r = u / .7; MAN.g.position.copy(arcPos(V3(0, FEET + HIP, MZ), V3(0, 3.2, -.1), V3(0, .5, -.6), r)); MAN.g.rotation.x = -lerp(.2, 2.6, r); MAN.aL.rotation.z = 2.8; MAN.aR.rotation.z = -2.8; }
      else if (u < 1.05) { MAN.g.position.set(0, .4, -.6); MAN.g.rotation.x = -2.8; }
      else hotDance(MAN, u - 1.05, 0, -.6, -Math.PI / 2);
    }
    if (t >= 7.1) o.big = tx('bigAll');
    return o;
  }
  if (k === 'gaya') {
    if (t < .55) { setCam(V3(.2, 2.7, 3.0), V3(1.3, 1.4, .9)); hands.visible = true; hands.position.z = t < .15 ? -.42 * (t / .15) : -.42 * (1 - ph(t, .4, .55)); }
    else if (t < 3.3) { const d = ph(t, .55, 3.3); setCam(V3(3.9 - d * .3, 2.5, -.6), V3(.4, 1.2, -1.0), true); }
    else setCam(V3(2.9, 2.1, .9), V3(.3, 1.45, -.6), true);
    stand(MAN, 0, MZ);
    if (t < 1.55) { idle(MAN, T); wiggle(MAN, T); }
    else if (t < 2.3) { const q = t - 1.55; MAN.g.rotation.y = -.5 * sm(q / .3); MAN.neck.rotation.x = .5; MAN.head.rotation.x = .2; MAN.aL.rotation.z = .6; MAN.aR.rotation.z = -.6; MAN.mouth.scale.set(.05, .05, .012); }
    else { const q = t - 2.3; MAN.g.rotation.y = lerp(-.5, Math.PI, sm(q / .35)); MAN.aR.rotation.z = -1.2; MAN.aR.rotation.x = .9 + Math.sin(q * 9) * .25; MAN.eR.rotation.x = .4; MAN.aL.rotation.z = .5; talkM(MAN, T, q < 1.1); if (q < 1.7) { o.bm = tx('gayaM'); o.angry = true; } }
    if (t >= 3.4) o.big = tx('bigGaya');
    return o;
  }
  if (k === 'enjo') {
    if (t < 3.6) {
      const u = t - .12;
      if (t < .5) { setCam(FP[0], FP[1]); hands.visible = true; hands.position.z = t < .12 ? -.42 * (t / .12) : -.42 * (1 - ph(t, .35, .5)); }
      else { const d = ph(t, .5, 3.6); setCam(V3(3.7 - d * .4, 2.4, -.55 + d * .5), V3(0, 1.3, -.5), true); }
      if (u < 0) { stand(MAN, 0, MZ); civIdle(MAN, T); }
      else if (u < 1.6) { fall(MAN, u, 0, -.55, TOE, -.85); }
      else if (u < 2.4) { const r = (u - 1.6) / .8; MAN.g.position.copy(arcPos(V3(0, .05 + HIP, -.85), V3(.3, FEET + HIP + .6, -.3), V3(.55, FEET + HIP, .5), r)); MAN.g.rotation.y = Math.PI * .15; flail(MAN, u, 1.6); MAN.mouth.scale.set(.06, .05, .012); }
      else { stand(MAN, .55, .5); MAN.g.rotation.y = Math.atan2(-2.95, .5); civIdle(MAN, T * 1.6); MAN.neck.rotation.x = 0; for (const [b, sx] of MAN.brows) b.rotation.z = sx * .5; }
      if (t >= 1.75 && t < 3.0) { o.bm = tx('civHot'); o.angry = true; }
      o.dark = clamp((t - 2.7) * .8, 0, .65);
    }
    else {
      const q = t - 3.6; dressME('suit'); ME.g.visible = true; stand(ME, 0, 31.8, 0); setCam(V3(0, 1.72, 29.2), V3(0, 1.32, 31.8));
      const b = sm((q - .45) / .6); ME.spine.rotation.x = -1.2 * b; ME.neck.rotation.x = .25 * b; ME.aL.rotation.z = .03; ME.aR.rotation.z = -.03; ME.aL.rotation.x = .25 * b; ME.aR.rotation.x = .25 * b;
      const m = pressTex(); if (pressSign.material.map !== m) { pressSign.material.map = m; pressSign.material.needsUpdate = true; }
      for (const f of FLASH_T) { const d = t - f; if (d >= 0 && d < .09) o.flash = Math.max(o.flash, .85 * (1 - d / .09)); }
    }
    return o;
  }
  if (k === 'kuuki') {
    if (t < 2.3) setCam(FP[0], FP[1]); else setCam(V3(.9, 4.0, 4.4), V3(-.4, 1.25, -.6), true);
    stand(MAN, 0, MZ);
    if (t < .3) { civIdle(MAN, T); MAN.spine.rotation.x = -.1; }
    else if (t < 2.3) {
      const q = t - .3; MAN.g.rotation.y = Math.PI * sm(q / .6); const b = sm((q - .7) / .4) * (1 - sm((q - 1.6) / .35)); MAN.spine.rotation.x = -.95 * b; MAN.neck.rotation.x = .3 * b; MAN.aL.rotation.z = .05; MAN.aR.rotation.z = -.05;
      if (q > .6 && q < 2.0) { o.bm = tx('civThanks'); talkM(MAN, T, q < 1.4); }
    }
    else {
      const q = t - 2.3, xx = -q * 1.05, feet = xx > -1.65 ? FEET : Math.max(0, FEET - (-1.65 - xx) * 4); stand(MAN, xx, MZ, feet); MAN.g.rotation.y = Math.PI / 2;
      const w = Math.sin(q * 9); MAN.lL.rotation.x = w * .5; MAN.lR.rotation.x = -w * .5; MAN.kL.rotation.x = -Math.max(0, -w) * .6; MAN.kR.rotation.x = -Math.max(0, w) * .6; MAN.aL.rotation.x = -w * .3; MAN.aR.rotation.x = w * .3; MAN.g.position.y += Math.abs(w) * .03;
    }
    if (t >= 2.4) o.big = tx('bigKuuki');
    return o;
  }
  if (k === 'bored') {
    setCam(FP[0], FP[1]); stand(MAN, 0, MZ); MAN.g.rotation.y = sm(t / 1) * Math.PI;
    if (t > 1) { MAN.spine.rotation.x = -.18; MAN.neck.rotation.x = -.3; MAN.head.rotation.y = Math.sin(t * 2.6) * .3; MAN.aL.rotation.z = .04; MAN.aR.rotation.z = -.04; MAN.g.position.y -= .03; talkM(MAN, T, t > 1.25 && t < 2.3); o.bm = tx('bored'); o.dark = clamp((t - 1.6) * .5, 0, .45); }
    return o;
  }
  return o;
}

// ===== 遊ぶ流れ =====
let mode = 'title', G = null, lastNow = performance.now(), Tsec = 0;
const show = id => { for (const p of ['title', 'result']) $(p).hidden = p !== id; };
function setSeg(s) { G.seg = s; G.t = 0; }
// 一般の方は5回に1回くらい（はじめての1回目は必ず芸人。5回続けて出なければ次は出る）
function pickCiv() { if (window.__civ != null) return !!window.__civ; const plays = ls.get('osn_plays', 0), since = ls.get('osn_since', 0); if (plays < 1) return false; return since >= 5 || Math.random() < .2; }
function startGame() {
  ac(); buildCrowd(); resetMood(); clearFx();
  const civ = pickCiv(); setLook(civ); ls.set('osn_plays', ls.get('osn_plays', 0) + 1); ls.set('osn_since', civ ? 0 : ls.get('osn_since', 0) + 1);
  murSet(civ ? .1 : .17); $('bubG').hidden = true; $('telop').hidden = true; $('wipe').hidden = true;
  G = { say: 1, seg: null, t: 0, log: [{ type: 'intro' }], down: null, kind: null, sent: false, civ }; setSeg({ type: 'intro', say: 1 }); mode = 'play'; show(null);
  $('hud').hidden = false; $('btnArea').hidden = false; $('skipBtn').hidden = false; resetBtns(); updCnt(false); $('big').hidden = true; $('dark').style.opacity = 0; $('flash').style.opacity = 0;
}
function updCnt(pop) { $('hudCnt').textContent = t(CIV ? 'cntC' : 'cnt', { n: G.say }); if (pop) { $('hudCnt').classList.remove('pop'); void $('hudCnt').offsetWidth; $('hudCnt').classList.add('pop'); } }
function waitSeg() { setSeg({ type: 'wait', n: G.say, say: G.say }); $('skipBtn').hidden = true; jigT = 0; }
function nextSeg() {
  const s = G.seg;
  if (s.type === 'intro' || s.type === 'line') { waitSeg(); return; }
  if (s.type === 'pushy') { G.say = 4; updCnt(true); G.log.push({ type: 'line', n: 4 }); setSeg({ type: 'line', n: 4, say: 4 }); return; }
  if (s.type === 'out') { mode = 'end'; setTimeout(showResult, 250); }
}
const canAct = () => mode === 'play' && G && G.seg && G.seg.type === 'wait';
function endWith(kind, extra) { extra = extra || {}; G.kind = kind; G.log.push({ type: 'out', kind, side: extra.side }); setSeg({ type: 'out', kind, say: G.say, ...extra }); $('btnArea').hidden = true; $('skipBtn').hidden = true; try { gtag('event', 'osunayo_end', { kind, say: G.say, civ: CIV ? 1 : 0 }); } catch (e) { } }
function doNo() {
  if (!canAct()) return;
  G.log.push({ type: 'wait', n: G.say, act: 'no' }); SFX.pop();
  const pb = $('pushBtn'), nb = $('noBtn'); pb.classList.add('gone'); nb.classList.add('morph'); nb.textContent = t('push'); setTimeout(resetBtns, 300);
  if (G.say >= 10) { endWith(CIV ? 'kuuki' : 'bored'); return; }
  if (G.say === 3 && !CIV) { G.log.push({ type: 'pushy' }); setSeg({ type: 'pushy', say: 3 }); return; }
  G.say++; updCnt(true); G.log.push({ type: 'line', n: G.say }); setSeg({ type: 'line', n: G.say, say: G.say });
}
// 振り返っている間に押したら不意打ち（3回目と一般の方はなし）
function glSide() { const s = G.seg; if (CIV || !s || s.type !== 'wait' || s.n === 3) return null; const g = glP(s, G.t); return g.p < 1.1 && env(g.p, 0, 1.1, .2, .3) > .7 ? g.side : null; }
function doPush(ms) {
  if (!canAct()) return;
  const n = G.say; let kind, extra = {};
  if (CIV) kind = 'enjo';
  else if (n === 3) kind = ms >= 5000 ? 'all' : ms >= 2000 ? 'dive' : ms >= 1000 ? 'both' : 'clear';
  else { const gs = glSide(); if (gs != null) { kind = 'fui'; extra.side = gs; } else kind = n <= 2 ? 'early' : 'late'; }
  G.hold = ms; G.log.push({ type: 'wait', n, act: 'push', hold: ms, fui: kind === 'fui', side: extra.side });
  if (kind === 'clear') extra.mash = { n: 0, done: false };
  endWith(kind, extra);
}
function doGaya() { if (!canAct()) return; G.log.push({ type: 'wait', n: G.say, act: 'gaya' }); endWith('gaya'); }
function doFly() { if (!(mode === 'play' && G && G.seg && G.seg.type === 'intro')) return; G.log[0].at = G.t; G.introPush = true; endWith(CIV ? 'enjo' : 'fly'); }
// 3回目で押した直後の連打を数える（0.6秒で3回以上なら、やりすぎ）
document.addEventListener('pointerdown', () => { const s = G && G.seg; if (mode === 'play' && s && s.type === 'out' && s.mash && !s.mash.done) s.mash.n++; }, true);
// ボタン：いちばん上が「押す」、その下に「押さない」、さらにその下に「ガヤを押す」。上のボタンをずらすと下が見える
let off = 0, offN = 0, jigT = 0;
function maxOff() { return Math.min(170, Math.max(120, innerWidth / 2 - 60)); }
function placeBtn() { $('pushBtn').style.transform = 'translateX(' + off + 'px)'; $('noBtn').style.transform = 'translateX(' + offN + 'px)'; }
function resetBtns() { off = 0; offN = 0; const pb = $('pushBtn'), nb = $('noBtn'); pb.classList.remove('gone', 'down', 'jig'); nb.classList.remove('morph', 'down'); pb.textContent = t('push'); nb.textContent = t('no'); $('gayaBtn').textContent = t('gayaBtn'); pb.style.transition = ''; nb.style.transition = ''; placeBtn(); }
const pb = $('pushBtn'), nbB = $('noBtn');
function dragStart(el, which, e) {
  if (G && G.down) return; if (mode !== 'play') return; e.preventDefault(); ac(); try { el.setPointerCapture(e.pointerId); } catch (_) { }
  G.down = { el, which, id: e.pointerId, x: e.clientX, o: which === 'p' ? off : offN, t: performance.now(), drag: false, timer: null }; el.classList.add('down'); el.style.transition = 'none';
  if (which === 'p' && canAct() && G.say === 3 && !CIV) G.down.timer = setTimeout(() => { const d = G && G.down; if (d && !d.drag && d.which === 'p') { G.down = null; pb.classList.remove('down'); doPush(5000); } }, 5000);
}
function dragMove(e) {
  const d = G && G.down; if (!d || e.pointerId !== d.id) return; const dx = e.clientX - d.x;
  if (!d.drag && Math.abs(dx) > 10) { d.drag = true; d.el.classList.remove('down'); if (d.timer) clearTimeout(d.timer); }
  if (d.drag) {
    const m = maxOff(); let n = clamp(d.o + dx, -m, m); if (d.which === 'n') { n = off >= 0 ? clamp(n, -m, 0) : clamp(n, 0, m); }
    const cur = d.which === 'p' ? off : offN; if (Math.abs(n - cur) > 18) SFX.slide(); if (d.which === 'p') off = n; else offN = n; placeBtn();
  }
}
function dragEnd(e, cancel) {
  const d = G && G.down; if (!d || e.pointerId !== d.id) return; G.down = null; if (d.timer) clearTimeout(d.timer); d.el.classList.remove('down'); d.el.style.transition = 'transform .18s ease-out';
  if (d.drag || cancel) { if (d.which === 'p') off = Math.abs(off) < 46 ? 0 : Math.sign(off) * maxOff(); else offN = Math.abs(offN) < 46 ? 0 : Math.sign(offN) * maxOff(); placeBtn(); return; }
  if (d.which === 'p') { if (G.seg && G.seg.type === 'intro') doFly(); else doPush(performance.now() - d.t); }
  else if (Math.abs(off) >= 46) doNo();
}
for (const [el, w] of [[pb, 'p'], [nbB, 'n']]) { el.addEventListener('pointerdown', e => dragStart(el, w, e)); el.addEventListener('pointermove', dragMove); el.addEventListener('pointerup', e => dragEnd(e, false)); el.addEventListener('pointercancel', e => dragEnd(e, true)); el.addEventListener('contextmenu', e => e.preventDefault()); }
$('gayaBtn').addEventListener('click', e => { e.preventDefault(); if (Math.abs(offN) < 46 || Math.abs(off) < 46) return; doGaya(); });
$('skipBtn').onclick = () => { if (mode === 'play' && G.seg.type === 'intro') { waitSeg(); } };
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());

// ===== 画面の更新 =====
// 吹き出し：まず頭の上の位置を決め、あとで上の帯・ワイプ・大きい文字・テロップ・ボタン・ほかの吹き出しと重ならない所へずらす
function bubAt(el, txt, pos, cls) {
  if (!txt || !pos) { el.hidden = true; el.dataset.t = ''; el._prev = null; return; } const p = pos.clone().project(cam); if (p.z > 1) { el.hidden = true; el._prev = null; return; }
  const W = innerWidth, H = innerHeight; el._x = (p.x * .5 + .5) * W; el._y = (-p.y * .5 + .5) * H; el.hidden = false;
  if (el.dataset.t !== txt) { el.textContent = txt; el.dataset.t = txt; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  el.classList.toggle('angry', !!cls);
}
function ovl(a, b) { return Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t)); }
// w,h：吹き出しの大きさ。x0,y0：しっぽの先。いちばん重ならない置き場所をえらぶ（前と同じ置き場所を少しひいきして、ちらつかないようにする）
function placeBub(w, h, x0, y0, obs, W, H, prev) {
  const cx = x => clamp(x, w / 2 + 8, W - w / 2 - 8), cy = y => clamp(y, h + 70, H - 150);
  const cand = [[0, 0]]; if (prev && (prev[0] || prev[1])) cand.push(prev);
  for (let k = 1; k <= 4; k++) { cand.push([0, -k * (h + 10)]); cand.push([0, k * (h + 10)]); }
  for (const dx of [-1, 1]) for (let k = 0; k <= 2; k++)cand.push([dx * (w * .6 + 24), -k * (h + 10)]);
  let best = null, bs = 1e18;
  for (const c of cand) {
    const x = cx(x0 + c[0]), y = cy(y0 + c[1]); const R = { l: x - w / 2, t: y - h, r: x + w / 2, b: y + 12 }; let sc = 0; for (const o of obs) sc += ovl(R, o) * 100;
    sc += Math.hypot(x - x0, y - y0) + (prev && c === prev ? -30 : 0); if (sc < bs) { bs = sc; best = { x, y, c, R }; }
  }
  return best;
}
function rectOf(el, pad) { const r = el.getBoundingClientRect(); return { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad }; }
function layoutBubs() {
  const W = innerWidth, H = innerHeight, obs = [];
  for (const id of ['hud', 'wipe', 'big', 'telop', 'skipBtn']) if (!$(id).hidden) obs.push(rectOf(id === 'telop' || id === 'big' ? ($(id).firstElementChild || $(id)) : $(id), 6));
  if (!$('btnArea').hidden) for (const id of ['pushBtn', 'noBtn', 'gayaBtn']) obs.push(rectOf($(id), 6));
  for (const id of ['bubM', 'bubP', 'bubG']) { const el = $(id); if (el.hidden || el._x == null) continue; const b = placeBub(el.offsetWidth, el.offsetHeight, el._x, el._y, obs, W, H, el._prev); el._prev = b.c; el.style.left = b.x + 'px'; el.style.top = b.y + 'px'; obs.push({ l: b.R.l - 6, t: b.R.t - 6, r: b.R.r + 6, b: b.R.b }); }
}
let bigShown = '';
function fitLine(el, txt, max, min, pad) { let em = 0; for (const ch of txt) em += ch.charCodeAt(0) < 0x2e80 ? .62 : 1; el.style.fontSize = Math.max(min, Math.min(max, (innerWidth - pad) / Math.max(1, em))) + 'px'; }
function applyO(o) {
  const tl = $('telop'); if (o.tel) { if (tl.dataset.t !== o.tel) { fitLine(tl.firstChild, o.tel, 46, 20, 40); tl.firstChild.textContent = o.tel; tl.dataset.t = o.tel; tl.hidden = false; tl.classList.remove('pop'); void tl.offsetWidth; tl.classList.add('pop'); } } else if (!tl.hidden) { tl.hidden = true; tl.dataset.t = ''; }
  $('wipe').hidden = !o.wipe;
  const b = $('big'); if (o.big) { if (bigShown !== o.big) { fitLine(b, o.big, 58, 26, 28); b.innerHTML = '<span>' + esc(o.big) + '</span>'; b.hidden = false; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); bigShown = o.big; } } else { b.hidden = true; bigShown = ''; }
  $('dark').style.opacity = o.dark || 0; $('flash').style.opacity = o.flash || 0;
  const ga = o.bg ? (o.bg[0] ? G2 : G1) : null;
  bubAt($('bubM'), o.bm, o.bm ? headPos(MAN) : null, o.angry); bubAt($('bubP'), o.bp, o.bp ? headPos(o.bpAt || ME) : null, false); bubAt($('bubG'), ga && ga.g.visible ? o.bg[1] : null, ga && ga.g.visible ? headPos(ga) : null, false);
  layoutBubs();
}
function fit() { const w = innerWidth, h = innerHeight; R3.setSize(w, h, false); fitFov(w / h); }
addEventListener('resize', fit); fit();
const TITLE_SEG = { type: 'title' };
function frame(now) {
  const dt = Math.min(.1, (now - lastNow) / 1000); lastNow = now;
  Tsec += dt;
  if (mode === 'play' || mode === 'end') {
    const s = G.seg; const t0 = G.t; if (mode === 'play') G.t += dt;
    if (s.type === 'out' && s.mash && !s.mash.done && G.t >= .6) { s.mash.done = true; if (s.mash.n >= 3) { s.kind = 'yari'; G.kind = 'yari'; const L = G.log[G.log.length - 1]; if (L && L.type === 'out') L.kind = 'yari'; } }
    fireEv(s, t0, G.t); const o = scene(s, Math.min(G.t, segDur(s)), Tsec); applyO(o);
    if (mode === 'play' && s.type === 'wait') { jigT += dt; if (jigT > 4.5) { jigT = 0; if (!G.down && off === 0) { pb.classList.remove('jig'); void pb.offsetWidth; pb.classList.add('jig'); } } }
    $('btnArea').classList.toggle('off', !(s.type === 'wait'));
    if (mode === 'play' && G.t >= segDur(s)) nextSeg(); lastO = o;
  }
  else if (mode === 'result') { const o = scene(G.seg, segDur(G.seg), Tsec); applyO({ ...o, bm: null, bp: null, bg: null, big: null, tel: null, wipe: false, dark: 0 }); lastO = null; }
  else { if (CIV) setLook(false); scene(TITLE_SEG, 0, Tsec); applyO({}); lastO = null; }
  updCrowd(dt, Tsec); updBulbs(Tsec); updFx(dt); R3.render(S3, cam);
  if (lastO && lastO.wipe) { const r = $('wipe').getBoundingClientRect(); renderWipe(R3, r.left + 4, innerHeight - r.bottom + 4, r.width - 8, r.height - 8); }
  requestAnimationFrame(frame);
}
let lastO = null;
requestAnimationFrame(frame);

// ===== 結果 =====
function showResult() {
  mode = 'result'; murSet(.07); $('hud').hidden = true; $('btnArea').hidden = true; $('bubM').hidden = $('bubP').hidden = $('bubG').hidden = true; $('telop').hidden = true; $('wipe').hidden = true; $('big').hidden = true; $('dark').style.opacity = 0; $('flash').style.opacity = 0;
  const k = G.kind, id = KT[k];
  G.n = G.introPush ? 0 : (k === 'bored' || k === 'kuuki') ? 10 : sayAtEnd();
  $('rHead').textContent = t('head_' + k); $('rTitle').className = 'g' + TIER[id]; $('rTitle').innerHTML = '<small>' + esc(t('ttl')) + '</small>「' + esc(tName(id)) + '」'; $('rLine').textContent = resLine(k, G.n);
  show('result');
}
function sayAtEnd() { const w = [...G.log].reverse().find(x => x.type === 'wait'); return w ? w.n : G.say; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const once = (f) => { let b = 0; return (...a) => { const n = Date.now(); if (n - b < 450) return; b = n; f(...a); }; };
$('againBtn').onclick = once(() => startGame());
$('topBtn').onclick = once(() => { mode = 'title'; murSet(.05); show('title'); });
$('startBtn').onclick = once(() => startGame());

function applyLang() {
  $('tTitle').innerHTML = t('tTitle');
  $('tHow').innerHTML = t('how');
  $('startBtn').textContent = t('start');
  $('skipBtn').textContent = t('skip');
  $('hudTitle').textContent = t('hud');
  $('againBtn').textContent = t('again');
  $('topBtn').textContent = t('top');
  resetBtns();
}
applyLang();