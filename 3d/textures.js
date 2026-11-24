import * as THREE from '../vendor/three.module.min.js';
import { makeSprite } from '../src/engine/render.js';

// 8x8 pixel tiles for the blocks, in the same palette letters as the 2D game.
export const TILES = {
  grassTop: ['GLGGGLGG', 'GGGLGGGG', 'LGGGGGLG', 'GGGGLGGG', 'GLGGGGGL', 'GGGLGGGG', 'GGGGGLGG', 'LGGGGGGG'],
  grassSide: ['LLLLLLLL', 'GLGGLGGL', 'GGDGGGDG', 'DDDDDDDD', 'DDKDDDDD', 'DDDDDKDD', 'DKDDDDDD', 'DDDDDDDD'],
  dirt: ['DDDDDDDD', 'DDKDDDDD', 'DDDDDKDD', 'DKDDDDDD', 'DDDDDDDD', 'DDDDKDDD', 'DDDDDDDK', 'DKDDDDDD'],
  barn: ['RRRRRRRR', 'RRRRRRRR', 'PPPPPPPP', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRRRR', 'PPPPPPPP', 'RRRRRRRR'],
  trim: ['WWWWWWWW', 'WQQQQQQW', 'WQWWWWQW', 'WQWWWWQW', 'WQWWWWQW', 'WQWWWWQW', 'WQQQQQQW', 'WWWWWWWW'],
  door: ['WWWWWWWW', 'WRRRRRRW', 'WWRRRRWW', 'WRWRRWRW', 'WRRWWRRW', 'WRWRRWRW', 'WWRRRRWW', 'WWWWWWWW'],
  roof: ['PPPPPPPP', 'RRRPRRRP', 'RRRPRRRP', 'PPPPPPPP', 'RPRRRPRR', 'RPRRRPRR', 'PPPPPPPP', 'RRRPRRRP'],
  fence: ['GWGGGGWG', 'WWWWWWWW', 'GWGGGGWG', 'GWGGGGWG', 'WWWWWWWW', 'GWGGGGWG', 'GWGGGGWG', 'GWGGGGWG'],
  trunk: ['DDKDDDKD', 'DDKDDDKD', 'DKDDDKDD', 'DKDDDKDD', 'DDKDDDKD', 'DDKDDDKD', 'DKDDDKDD', 'DKDDDKDD'],
  leaf: ['GGLGTGGL', 'GLLGGLGG', 'GGGGTGGG', 'TGGLGGLG', 'GGLGGGGT', 'GTGGLGGG', 'LGGGGTGL', 'GGLGGGGG'],
  hay: ['YYOYYYOY', 'YOYYOYYY', 'YYYYYYOY', 'OYYOYYYY', 'YYYYYOYY', 'YOYYYYYO', 'YYYOYYYY', 'OYYYYOYY'],
  farmDry: ['DDDDDDDD', 'OOOOOOOO', 'DDDDDDDD', 'DDKDDDDD', 'DDDDDDDD', 'OOOOOOOO', 'DDDDDDDD', 'DDDDDKDD'],
  farmWet: ['PPPPPPPP', 'KKKKKKKK', 'PPPSPPPP', 'PPPPPPPP', 'PPPPPPSP', 'KKKKKKKK', 'PPPPPPPP', 'PSPPPPPP'],
};
export const TILE_NAMES = Object.keys(TILES);
export const TILE = Object.fromEntries(TILE_NAMES.map((n, i) => [n, i]));
export const TILE_COUNT = TILE_NAMES.length;

const crisp = (tex) => {
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// All the block tiles side by side in one texture (an "atlas").
export function makeAtlas() {
  const c = document.createElement('canvas');
  c.width = 8 * TILE_COUNT;
  c.height = 8;
  const x = c.getContext('2d');
  TILE_NAMES.forEach((n, i) => x.drawImage(makeSprite(TILES[n]), i * 8, 0));
  return crisp(new THREE.CanvasTexture(c));
}

// One tile repeated n times across a surface (for the dirt plots).
export function tileTexture(name, n) {
  const tex = crisp(new THREE.CanvasTexture(makeSprite(TILES[name])));
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(n, n);
  return tex;
}
