import * as THREE from '../vendor/three.module.min.js';
import { FACES } from './voxels.js';
import { makeAtlas, TILE, TILE_COUNT } from './textures.js';

// Every block the farm uses. tex = [top, sides, bottom] tiles.
export const BLOCKS3D = {
  grass: { id: 1, tex: ['grassTop', 'grassSide', 'dirt'] },
  dirt: { id: 2, tex: ['dirt', 'dirt', 'dirt'] },
  barn: { id: 3, tex: ['roof', 'barn', 'barn'] },
  trim: { id: 4, tex: ['trim', 'trim', 'trim'] },
  door: { id: 5, tex: ['door', 'door', 'door'] },
  roof: { id: 6, tex: ['roof', 'roof', 'roof'] },
  fence: { id: 7, tex: ['grassTop', 'fence', 'dirt'] },
  trunk: { id: 8, tex: ['trunk', 'trunk', 'trunk'] },
  leaf: { id: 9, tex: ['leaf', 'leaf', 'leaf'] },
  hay: { id: 10, tex: ['hay', 'hay', 'hay'] },
};
const BY_ID = [];
for (const b of Object.values(BLOCKS3D)) BY_ID[b.id] = b;

// The farm is a box of blocks. The level file lists rectangular chunks: [x, y, z, width, height, depth, type].
export class World {
  constructor(level) {
    [this.w, this.h, this.d] = level.size;
    this.grid = new Uint8Array(this.w * this.h * this.d);
    for (const [x0, y0, z0, w, h, d, type] of level.blocks) {
      const id = BLOCKS3D[type].id;
      for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) for (let z = z0; z < z0 + d; z++) this.set(x, y, z, id);
    }
    this.mesh = this.buildMesh();
  }

  inside(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.w && y < this.h && z < this.d; }
  get(x, y, z) { return this.inside(x, y, z) ? this.grid[(y * this.d + z) * this.w + x] : 0; }
  set(x, y, z, id) { if (this.inside(x, y, z)) this.grid[(y * this.d + z) * this.w + x] = id; }
  solid(x, y, z) { return this.get(x, y, z) > 0; }

  buildMesh() {
    const pos = [], uv = [], col = [], idx = [];
    const eps = 0.001;
    for (let y = 0; y < this.h; y++) for (let z = 0; z < this.d; z++) for (let x = 0; x < this.w; x++) {
      const b = BY_ID[this.get(x, y, z)];
      if (!b) continue;
      for (const f of FACES) {
        if (this.solid(x + f.dir[0], y + f.dir[1], z + f.dir[2])) continue; // hidden face
        const tile = TILE[f.dir[1] > 0 ? b.tex[0] : f.dir[1] < 0 ? b.tex[2] : b.tex[1]];
        const u0 = tile / TILE_COUNT + eps, u1 = (tile + 1) / TILE_COUNT - eps;
        const n = pos.length / 3;
        f.corners.forEach(([cx, cy, cz], i) => {
          pos.push(x + cx, y + cy, z + cz);
          uv.push(i === 0 || i === 3 ? u0 : u1, i < 2 ? eps : 1 - eps);
          col.push(f.shade, f.shade, f.shade);
        });
        idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: makeAtlas(), vertexColors: true }));
  }
}
