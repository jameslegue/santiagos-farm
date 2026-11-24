import * as THREE from '../vendor/three.module.min.js';
import { extrude, voxelGeometry, voxelMaterial } from './voxels.js';
import { ROWS } from '../src/sprites.js';
import { HEROES } from '../src/heroes.js';

// 3D models made from the 2D pixel art.

// Santiago's tractor. The 2D art is a side view, so we stack it: wheels on the outside,
// the red body in the middle, Santiago in the seat. Front points along +x.
const REAR = [7, 16.5, 7.4], FRONT = [24, 19.5, 4.4];
const inWheel = (c, r, [cx, cy, rad]) => (c - cx) ** 2 + (r - cy) ** 2 <= rad * rad;
const D = 17; // how wide the tractor is, in pixels

function tractorGeometry(rows) {
  const cells = new Map();
  const h = rows.length;
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '.') return;
    const y = h - 1 - r;
    const put = (k, col = ch) => cells.set(`${c},${y},${k - Math.floor(D / 2)}`, col);
    if (inWheel(c, r, REAR)) {
      for (const k of [0, 1, 2, 3, D - 4, D - 3, D - 2, D - 1]) put(k);
      if (ch === 'K' && inWheel(c, r, [7, 16.5, 1.5])) for (let k = 4; k < D - 4; k++) put(k); // axle
    } else if (inWheel(c, r, FRONT)) {
      for (const k of [3, 4, 5, D - 6, D - 5, D - 4]) put(k);
      if (inWheel(c, r, [24, 19.5, 1])) for (let k = 6; k < D - 6; k++) put(k, 'K');
    } else if (r <= 9 && c <= 12) {
      for (let k = 5; k < D - 5; k++) put(k); // Santiago and the steering wheel
    } else {
      for (let k = 4; k < D - 4; k++) put(k); // tractor body, stacks
    }
  }));
  const w = Math.max(...rows.map((r) => r.length));
  return voxelGeometry(cells, 0.085, -w / 2);
}

export function tractorModel() {
  const group = new THREE.Group();
  const frames = ROWS.TRACTOR.map((rows) => new THREE.Mesh(tractorGeometry(rows), voxelMaterial));
  frames.forEach((m) => group.add(m));
  return { group, frames };
}

// Plants are two flat pictures crossed in an X, so they look full from every side.
const cache = new Map();
function geo(key, make) { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); }

export function crossed(rows, size, key) {
  const g = new THREE.Group();
  const geom = geo(`x:${key}`, () => extrude(rows, { size, depth: () => 1 }));
  for (const rot of [Math.PI / 4, -Math.PI / 4]) {
    const m = new THREE.Mesh(geom, voxelMaterial);
    m.rotation.y = rot;
    g.add(m);
  }
  return g;
}

export function solid(rows, size, depth, key) {
  return new THREE.Mesh(geo(`s:${key}`, () => extrude(rows, { size, depth: () => depth })), voxelMaterial);
}

export const plantModel = {
  mound: () => solid(ROWS.MOUND, 0.15, 6, 'mound'),
  sprout: () => crossed(ROWS.SPROUT, 0.15, 'sprout'),
  bush: () => crossed(ROWS.BUSH, 0.18, 'bush'),
  tree: () => crossed(ROWS.TREE, 0.2, 'tree'),
};

export const cropModel = (id, gold) => solid(gold ? ROWS.CROP_GOLD : ROWS.CROP[id], 0.12, 3, gold ? 'gold' : id);
export const dropModel = () => solid(ROWS.DROP, 0.12, 3, 'drop');

// Heroes: head 6 blocks deep, body 4. Eyes only on the front.
export function heroModel(id) {
  const art = HEROES[id].art;
  return new THREE.Mesh(geo(`h:${id}`, () => extrude(art, {
    size: 0.13,
    depth: (r) => (r < 8 ? 6 : 4),
    color: (ch, r, c, layer, d) => {
      if (layer === d - 1 || ch !== 'K' || r > 7) return ch;
      return art[r][c - 1] && art[r][c - 1] !== 'K' && art[r][c - 1] !== '.' ? art[r][c - 1] : art[r][c + 1] || ch;
    },
  })), voxelMaterial);
}
