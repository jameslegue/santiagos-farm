import * as THREE from '../vendor/three.module.min.js';
import { World } from './world.js';
import { Controls } from './controls.js';
import { Hud } from './hud.js';
import { tractorModel, plantModel, cropModel, dropModel, heroModel } from './models.js';
import { tileTexture } from './textures.js';
import { CROPS, cropById, GOLD_CHANCE, GOLD_SELL } from '../src/crops.js';
import { HEROES } from '../src/heroes.js';
import { CROP } from '../src/sprites.js';
import { PAL } from '../src/engine/palette.js';
import { load, save } from '../src/engine/save.js';
import { sfx, unlock, setMuted } from '../src/engine/audio.js';
import { playSong } from '../src/engine/music.js';

// The 3D farm shares its save with the 2D game: same coins, seeds and plots.

// ---------- setup ----------
const view = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: false });
const scene = new THREE.Scene();
scene.background = new THREE.Color(PAL.S);
scene.fog = new THREE.Fog(PAL.S, 34, 80);
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 200);
const hud = new Hud(document.getElementById('hud'));

// Draw the 3D view at a low resolution and blow it up, so it stays chunky and 8-bit (and fast on phones).
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(Math.min(w, h) / 200 < 1 ? 1 : 200 / Math.min(w, h));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 75 : 60;
  camera.updateProjectionMatrix();
  hud.resize();
}
addEventListener('resize', resize);
resize();

const settings = load('settings', { muted: false });
setMuted(settings.muted);
let started = false;
const controls = new Controls(view, document.createElement('button'), document.getElementById('joy'), document.getElementById('knob'), () => {
  unlock();
  if (!started) { started = true; playSong('farm'); }
});

const level = await (await fetch('farm.json', { cache: 'no-cache' })).json();
const world = new World(level);
scene.add(world.mesh);
const GROUND = level.start[1];

// ---------- save ----------
const p = load('progress', {
  started: false, coins: 0, unlocked: 1, sel: CROPS[0].id,
  plots: Array.from({ length: 12 }, () => null), tut: 0, harvested: 0, golds: 0,
});
const saveNow = () => save('progress', p);
if (!p.started) {
  p.started = true;
  saveNow();
  setTimeout(() => { hud.popup('LEGENDARY STRAWBERRY SEED!', 'Y'); sfx.reveal(); }, 600);
}

// ---------- the dirt plots ----------
const PS = level.plots.size;
const plotPos = (i) => ({ x: level.plots.x[i % 3], z: level.plots.z[Math.floor(i / 3)] });
const dryMat = new THREE.MeshBasicMaterial({ map: tileTexture('farmDry', PS) });
const wetMat = new THREE.MeshBasicMaterial({ map: tileTexture('farmWet', PS) });
const plotGeo = new THREE.BoxGeometry(PS, 0.2, PS);
const plots = p.plots.map((_, i) => {
  const { x, z } = plotPos(i);
  const soil = new THREE.Mesh(plotGeo, dryMat);
  soil.position.set(x, GROUND + 0.02, z);
  const plant = new THREE.Group();
  plant.position.set(x, GROUND + 0.12, z);
  scene.add(soil, plant);
  return { soil, plant, sig: '', crop: null, drop: null };
});

// Rebuild a plot's plant only when it changes.
function syncPlot(i) {
  const pl = p.plots[i];
  const v = plots[i];
  const sig = pl ? `${pl.crop}|${pl.stage}|${pl.wet}|${pl.gold}` : '';
  v.soil.material = pl && pl.wet ? wetMat : dryMat;
  if (sig === v.sig) return;
  v.sig = sig;
  v.plant.clear();
  v.crop = v.drop = null;
  if (!pl) return;
  const crop = cropById(pl.crop);
  const body = pl.stage === 0 ? plantModel.mound() : pl.stage === 1 ? plantModel.sprout() : crop.tree ? plantModel.tree() : plantModel.bush();
  v.plant.add(body);
  const top = pl.stage < 2 ? 1.2 : crop.tree ? 3.1 : 2.3;
  if (pl.stage === 3) {
    v.crop = cropModel(pl.crop, pl.gold);
    v.crop.position.y = top;
    v.plant.add(v.crop);
  } else if (!pl.wet) {
    v.drop = dropModel();
    v.drop.position.y = top + 0.3;
    v.plant.add(v.drop);
  }
}

// ---------- Santiago on his tractor ----------
const tractor = tractorModel();
scene.add(tractor.group);
const tr = { x: level.start[0], z: level.start[2], vx: 0, vz: 0, facing: Math.PI, roll: 0, plot: -1 };
const RADIUS = 1.0, SPEED = 6;

function blocked(x, z) {
  for (let cx = Math.floor(x - RADIUS); cx <= Math.floor(x + RADIUS); cx++) {
    for (let cz = Math.floor(z - RADIUS); cz <= Math.floor(z + RADIUS); cz++) {
      if (!world.solid(cx, GROUND, cz)) continue;
      const nx = Math.max(cx, Math.min(x, cx + 1)), nz = Math.max(cz, Math.min(z, cz + 1));
      if ((x - nx) ** 2 + (z - nz) ** 2 < RADIUS * RADIUS) return true;
    }
  }
  return false;
}

// ---------- farming (same rules as the 2D game) ----------
function work(i) {
  const pl = p.plots[i];
  const { x, z } = plotPos(i);
  if (!pl) {
    p.plots[i] = { crop: p.sel, stage: 0, wet: false, readyAt: 0, gold: false };
    p.tut = Math.max(p.tut, 1);
    sfx.plant();
  } else if (pl.stage === 3) {
    const value = pl.gold ? GOLD_SELL : cropById(pl.crop).sell;
    p.coins += value;
    p.harvested = (p.harvested || 0) + 1;
    if (pl.gold) p.golds = (p.golds || 0) + 1;
    p.tut = 3;
    (pl.gold ? sfx.gold : sfx.coin)();
    hud.popup(`+${value}`, pl.gold ? 'Y' : 'W');
    const fly = cropModel(pl.crop, pl.gold);
    fly.position.set(x, GROUND + 2.3, z);
    scene.add(fly);
    flying.push({ m: fly, t: 0 });
    p.plots[i] = null;
  } else if (!pl.wet) {
    pl.wet = true;
    pl.readyAt = Date.now() + cropById(pl.crop).grow * 1000;
    p.tut = Math.max(p.tut, 2);
    sfx.water();
  } else return;
  saveNow();
  syncPlot(i);
}
const flying = [];

// ---------- heroes ----------
let hero = null;
let heroWait = 0;
function callHero(id, force = false) {
  if (!force && (hero || heroWait > 0)) return;
  if (hero) scene.remove(hero.m);
  const h = HEROES[id];
  const ground = h.move === 'run' || h.move === 'stomp';
  hero = { m: heroModel(id), move: h.move, t: 0, ground };
  hero.m.scale.setScalar(h.move === 'stomp' ? 1.6 : 1.3);
  scene.add(hero.m);
  heroWait = 8;
  sfx.hero();
  hud.popup(h.name + '!', 'Y');
}
function updateHero(dt) {
  heroWait -= dt;
  if (!hero) return;
  const h = hero;
  h.t += dt;
  // Cross the screen just in front of the camera, so you always see them, whichever way you're looking.
  const side = -12 + h.t * (h.ground ? 6 : 8);
  const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
  const x = camTarget.x + fx * 5 + rx * side;
  const z = camTarget.z + fz * 5 + rz * side;
  let y;
  if (h.move === 'swing') { const k = (h.t * 1.4) % 1; y = GROUND + 2 + Math.sin(k * Math.PI) * 3; }
  else if (h.move === 'fly') y = GROUND + 4 + Math.sin(h.t * 3) * 0.6;
  else if (h.move === 'stomp') {
    const hop = Math.abs(Math.sin(h.t * 4));
    y = GROUND + hop * 2.5;
    if (hop < 0.08 && h.landed !== Math.round(h.t * 4 / Math.PI)) { h.landed = Math.round(h.t * 4 / Math.PI); sfx.stomp(); }
  } else y = GROUND + Math.abs(Math.sin(h.t * 10)) * 0.5;
  h.m.position.set(x, y, z);
  h.m.rotation.y = camYaw; // always facing you
  if (h.move === 'fly' || h.move === 'swing') h.m.rotation.z = -0.25;
  if (side > 12) { scene.remove(h.m); hero = null; }
}

// ---------- seed buttons ----------
const seedBtn = document.getElementById('seed');
const buyBtn = document.getElementById('buy');
const icon = (id) => CROP[id].toDataURL();
function refreshButtons() {
  seedBtn.querySelector('img').src = icon(p.sel);
  const next = CROPS[p.unlocked];
  const can = next && p.coins >= next.price;
  buyBtn.style.display = can ? 'flex' : 'none';
  if (can) { buyBtn.querySelector('img').src = icon(next.id); buyBtn.querySelector('span').textContent = `NEW! ${next.price}`; }
}
const press = (btn, fn) => btn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  unlock();
  if (!started) { started = true; playSong('farm'); }
  btn.classList.add('on');
  setTimeout(() => btn.classList.remove('on'), 120);
  fn();
});
press(seedBtn, () => {
  // tap to switch to the next seed you have
  const have = CROPS.slice(0, p.unlocked);
  const k = have.findIndex((c) => c.id === p.sel);
  p.sel = have[(k + 1) % have.length].id;
  sfx.select();
  hud.popup(`${cropById(p.sel).name} ${cropById(p.sel).word}`, 'G');
  saveNow();
  refreshButtons();
});
press(buyBtn, () => {
  const next = CROPS[p.unlocked];
  if (!next || p.coins < next.price) return;
  p.coins -= next.price;
  p.unlocked++;
  p.sel = next.id;
  saveNow();
  sfx.reveal();
  hud.popup(`NEW SEED: ${next.name}!`, 'Y');
  setTimeout(() => callHero(next.id, true), 900);
  refreshButtons();
});
refreshButtons();

// ---------- camera ----------
let camYaw = 0.6; // a little to the side, so you can see Santiago in the seat
let camPitch = 0.6;
const camTarget = new THREE.Vector3(tr.x, GROUND + 1, tr.z);

// ---------- every frame ----------
let time = 0;
let saveTimer = 0;
function step(dt) {
  time += dt;
  const look = controls.takeLook(dt);
  camYaw += look.yaw;
  camPitch = Math.max(0.15, Math.min(1.25, camPitch + look.pitch));

  // Driving: the joystick is relative to where the camera is looking.
  const inp = controls.move();
  const fwd = { x: -Math.sin(camYaw), z: -Math.cos(camYaw) };
  const right = { x: Math.cos(camYaw), z: -Math.sin(camYaw) };
  const mx = fwd.x * inp.y + right.x * inp.x, mz = fwd.z * inp.y + right.z * inp.x;
  const accel = 30 * dt;
  tr.vx += Math.max(-accel, Math.min(accel, mx * SPEED - tr.vx));
  tr.vz += Math.max(-accel, Math.min(accel, mz * SPEED - tr.vz));
  if (Math.hypot(mx, mz) > 0.1) {
    let d = Math.atan2(mx, mz) - tr.facing;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    tr.facing += d * Math.min(1, dt * 8);
  }
  if (!blocked(tr.x + tr.vx * dt, tr.z)) tr.x += tr.vx * dt; else tr.vx = 0;
  if (!blocked(tr.x, tr.z + tr.vz * dt)) tr.z += tr.vz * dt; else tr.vz = 0;
  const speed = Math.hypot(tr.vx, tr.vz);
  tr.roll += speed * dt * 3;
  tractor.frames[0].visible = Math.floor(tr.roll) % 2 === 0;
  tractor.frames[1].visible = !tractor.frames[0].visible;
  tractor.group.position.set(tr.x, GROUND + (speed > 0.5 && Math.floor(time * 12) % 2 ? 0.04 : 0), tr.z);
  tractor.group.rotation.y = tr.facing - Math.PI / 2;

  // Drive onto a plot and Santiago does the job: plant, water or pick.
  let on = -1;
  for (let i = 0; i < 12; i++) {
    const { x, z } = plotPos(i);
    if (Math.abs(tr.x - x) < PS / 2 && Math.abs(tr.z - z) < PS / 2) on = i;
  }
  if (on !== tr.plot && on >= 0) work(on);
  tr.plot = on;

  // Growing happens by the clock, like the 2D game.
  const now = Date.now();
  p.plots.forEach((pl, i) => {
    if (pl && pl.wet && pl.stage < 3 && now >= pl.readyAt) {
      pl.stage++;
      pl.wet = false;
      if (pl.stage === 3) {
        if (cropById(pl.crop).legendary && Math.random() < GOLD_CHANCE) pl.gold = true;
        sfx.grow();
        callHero(pl.crop);
      }
      saveNow();
    }
    syncPlot(i);
    const v = plots[i];
    if (v.crop) { v.crop.rotation.y = time * 2 + i; v.crop.position.y = (cropById(pl.crop).tree ? 3.1 : 2.3) + Math.sin(time * 3 + i) * 0.15; }
    if (v.drop) v.drop.position.y = 1.5 + Math.sin(time * 4 + i) * 0.15 + (pl.stage === 2 ? (cropById(pl.crop).tree ? 1.9 : 1.1) : 0);
  });

  for (const f of flying) {
    f.t += dt;
    f.m.position.y += dt * 5;
    f.m.rotation.y += dt * 10;
    f.m.scale.setScalar(Math.max(0.01, 1 - f.t * 1.2));
    if (f.t > 0.8) scene.remove(f.m);
  }
  while (flying.length && flying[0].t > 0.8) flying.shift();
  updateHero(dt);
  if ((saveTimer += dt) > 5) { saveTimer = 0; saveNow(); }
  refreshButtons();

  // Third-person camera that won't go inside the barn or trees.
  camTarget.lerp(new THREE.Vector3(tr.x, GROUND + 1, tr.z), 1 - Math.exp(-10 * dt));
  const dir = new THREE.Vector3(Math.sin(camYaw) * Math.cos(camPitch), Math.sin(camPitch), Math.cos(camYaw) * Math.cos(camPitch));
  let dist = 10;
  for (let d = 0.5; d <= 10; d += 0.25) {
    const c = camTarget.clone().addScaledVector(dir, d);
    if (world.solid(Math.floor(c.x), Math.floor(c.y), Math.floor(c.z))) { dist = Math.max(1.5, d - 0.4); break; }
  }
  camera.position.copy(camTarget).addScaledVector(dir, dist);
  camera.lookAt(camTarget);

  hud.draw(dt, { coins: p.coins });
}

let last = performance.now();
function frame(t) {
  let dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  while (dt > 0) { const s = Math.min(dt, 1 / 60); step(s); dt -= s; }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.__farm3d = { p, tr, callHero, setYaw: (y) => { camYaw = y; }, setPitch: (v) => { camPitch = v; } };
