import { makeSprite } from './engine/render.js';

// All the art is text: each letter is a palette color (src/engine/palette.js), '.' is see-through.

// ---------- Crops (12x12-ish) ----------
const CROP_ART = {
  strawberry: [
    '....G..G....',
    '.....GG.....',
    '...GGLLGG...',
    '..RRGRRGRR..',
    '.RRYRRRRYRR.',
    '.RRRRRYRRRR.',
    '.RYRRRRRRYR.',
    '..RRRYRRRR..',
    '..RRRRRRYR..',
    '...RYRRRR...',
    '....RRRR....',
    '.....RR.....',
  ],
  raspberry: [
    '.....GG.....',
    '...GGLLGG...',
    '...MMMMMM...',
    '..MRMMRMMR..',
    '..RMMRMMRM..',
    '..MRMMRMMR..',
    '..RMMRMMRM..',
    '...MRMMRM...',
    '....RMMR....',
    '.....MM.....',
  ],
  apple: [
    '......D.....',
    '.....D.GG...',
    '...RRDRGLG..',
    '..RRRRRRRR..',
    '.RRWRRRRRRR.',
    '.RWRRRRRRRR.',
    '.RRRRRRRRRR.',
    '.RRRRRRRRPR.',
    '..RRRRRRPR..',
    '..RRRRRRRR..',
    '...RRR.RRR..',
  ],
  broccoli: [
    '...GLGG.....',
    '..GLGGGLG...',
    '.GGGLGGGGG..',
    '.GLGGGLGGLG.',
    '.GGTGGGGTGG.',
    '..GGGGGGGG..',
    '...GTLLTG...',
    '.....LL.....',
    '.....LL.....',
    '....LLLL....',
  ],
  cherry: [
    '........GG..',
    '.......GLG..',
    '......DD....',
    '.....D.D....',
    '....D...D...',
    '...D.....D..',
    '..RRR...RRR.',
    '.RRWRR.RRWRR',
    '.RRRRR.RRRRR',
    '.RRRPR.RRRPR',
    '..RRR...RRR.',
  ],
  blackberry: [
    '.....GG.....',
    '...GGLLGG...',
    '...NPNPNP...',
    '..NPNNPNNP..',
    '..PNNPNNPN..',
    '..NPNNPNNP..',
    '..PNNPNNPN..',
    '...NPNNPN...',
    '....PNNP....',
    '.....NN.....',
  ],
  carrot: [
    '.......G.G..',
    '......GLG...',
    '.....GLGG...',
    '....OOOG....',
    '...OOOO.....',
    '...OODO.....',
    '..OOOO......',
    '..ODOO......',
    '.OOO........',
    '.OO.........',
    'O...........',
  ],
  tomato: [
    '.....G......',
    '...GGLGG....',
    '..RRGRGRR...',
    '.RRRRRRRRR..',
    'RROORRRRRRR.',
    'ROORRRRRRRR.',
    'RRRRRRRRRRR.',
    'RRRRRRRRRPR.',
    '.RRRRRRRPR..',
    '..RRRRRRR...',
  ],
  lettuce: [
    '...L.GL.L...',
    '..LGLLGLGL..',
    '.LGLLGLLGLL.',
    '.GLLGLLGLLG.',
    'LLGLLLLLGLLL',
    'LGLLGLLGLLGL',
    '.LLGLLLLGLL.',
    '..LLLGLLLL..',
    '...GGLLGG...',
  ],
};

// ---------- Growing stages ----------
const MOUND = [
  '....YYYY....',
  '...OOYYOO...',
  '..OODDDDOO..',
];

const SPROUT = [
  '..LL....LL..',
  '.LGGL..LGGL.',
  '..LGGLLGGL..',
  '....LGGL....',
  '.....GG.....',
  '.....GG.....',
];

const BUSH = [
  '......LL......',
  '.....LGGL.....',
  '..LL..GG..LL..',
  '.LGGL.GG.LGGL.',
  '..LGGLGGLGGL..',
  '...LGGGGGGL...',
  '.LL..LGGL..LL.',
  'LGGL..GG..LGGL',
  '.LGGLLGGLLGGL.',
  '...LGGGGGGL...',
  '.....GGGG.....',
  '......GG......',
];

const TREE = [
  '.....LLLLLL.....',
  '...LLGGGGGGLL...',
  '..LGGGLGGGGGGL..',
  '.LGGGGGGGGLGGGL.',
  '.LGGLGGGGGGGGGL.',
  'LGGGGGGGLGGGGGGL',
  'LGGGGGGGGGGGLGGL',
  '.GGGLGGGGGGGGGG.',
  '.TGGGGGGGLGGGGT.',
  '..TTGGGGGGGGTT..',
  '....TTDDDDTT....',
  '......DDDD......',
  '......DDDD......',
  '......DDDD......',
  '.....DDDDDD.....',
];

// ---------- Things ----------
const COIN = [
  '..YYY..',
  '.YWYYO.',
  'YWYYYYO',
  'YYYYYYO',
  'YYYYYYO',
  '.YYYYO.',
  '..OOO..',
];

const DROP = [
  '..S..',
  '..S..',
  '.SSS.',
  'SSWSS',
  'SWSSS',
  'SSSSB',
  '.BBB.',
];

const LOCK = [
  '..QQQ..',
  '.Q...Q.',
  '.Q...Q.',
  'YYYYYYY',
  'YYYKYYY',
  'YYYKYYY',
  'YYYYYYY',
  'OOOOOOO',
];

const ARROW = [
  '..KKKKK..',
  '..KYYYK..',
  '..KYYYK..',
  'KKKYYYKKK',
  'KYYYYYYYK',
  '.KYYYYYK.',
  '..KYYYK..',
  '...KYK...',
  '....K....',
];

const CAN = [
  '...BBBB.......',
  '..B....B......',
  '.BSSSSSSB....S',
  '.BSSWSSSB...SS',
  '.BSSSSSSBBBSS.',
  '.BSSSSSSBSS...',
  '.BSSSSSSB.....',
  '..BBBBBB......',
];

const CLOUD = [
  '....WWWW........',
  '..WWWWWWWW.WW...',
  '.WWWWWWWWWWWWW..',
  'WWWWWWWWWWWWWWWW',
  '.QQQQQQQQQQQQQQ.',
];

const RAINCLOUD = [
  '......QQQQ..........',
  '...QQQQQQQQQ.QQQ....',
  '..QQQQQQQQQQQQQQQQ..',
  '.QQQQQQQQQQQQQQQQQQ.',
  'QQQQQQQQQQQQQQQQQQQQ',
  '.EEEEEEEEEEEEEEEEEE.',
];

const SUN = [
  '...Y.Y...',
  '.Y.YYY.Y.',
  '..YYYYY..',
  'YYYYWYYYY',
  '.YYYYYYY.',
  'YYYYYYYYY',
  '..YYYYY..',
  '.Y.YYY.Y.',
  '...Y.Y...',
];

const SPARKLE = [
  '..W..',
  '..Y..',
  'WY.YW',
  '..Y..',
  '..W..',
];

const BARN = [
  '.........RRRR.........',
  '.......RRWWWWRR.......',
  '.....RRWWRRRRWWRR.....',
  '...RRWWRRRRRRRRWWRR...',
  '.RRWWRRRRRRRRRRRRWWRR.',
  'RWWRRRRRRWWWWRRRRRRWWR',
  '.RRRRRRRRWKKWRRRRRRRR.',
  '.RRRRRRRRWKKWRRRRRRRR.',
  '.RRRRRRRRWWWWRRRRRRRR.',
  '.RRRRRRRRRRRRRRRRRRRR.',
  '.RRRWWWWWWWWWWWWWWRRR.',
  '.RRRWWRRRRRRRRRRWWRRR.',
  '.RRRWRWRRRRRRRRWRWRRR.',
  '.RRRWRRWRRRRRRWRRWRRR.',
  '.RRRWRRRWRRRRWRRRWRRR.',
  '.RRRWRRRRWRRWRRRRWRRR.',
  '.RRRWRRRRRWWRRRRRWRRR.',
  '.RRRWRRRRWRRWRRRRWRRR.',
  '.RRRWRRRWRRRRWRRRWRRR.',
  '.RRRWWWWWWWWWWWWWWRRR.',
];

const FENCE = [
  '.W....W.',
  'WWWWWWWW',
  '.W....W.',
  '.W....W.',
  'WWWWWWWW',
  '.W....W.',
  '.W....W.',
];

const SPEAKER = [
  '....W..',
  '...WW..',
  'WWWWW..',
  'WWWWW..',
  'WWWWW..',
  '...WW..',
  '....W..',
];

const CHECK = [
  '.......G',
  '......GG',
  '.....GG.',
  'G...GG..',
  'GG.GG...',
  '.GGG....',
  '..G.....',
];

export const SPR = {
  speaker: makeSprite(SPEAKER),
  check: makeSprite(CHECK),
  mound: makeSprite(MOUND),
  sprout: makeSprite(SPROUT),
  bush: makeSprite(BUSH),
  tree: makeSprite(TREE),
  coin: makeSprite(COIN),
  drop: makeSprite(DROP),
  lock: makeSprite(LOCK),
  arrow: makeSprite(ARROW),
  can: makeSprite(CAN),
  cloud: makeSprite(CLOUD),
  rain: makeSprite(RAINCLOUD),
  sun: makeSprite(SUN),
  sparkle: makeSprite(SPARKLE),
  barn: makeSprite(BARN),
  fence: makeSprite(FENCE),
};

// CROP[id] = the crop, CROP_GOLD = golden strawberry, CROP_DARK[id] = locked silhouette
export const CROP = {};
export const CROP_DARK = {};
for (const [id, rows] of Object.entries(CROP_ART)) {
  CROP[id] = makeSprite(rows);
  CROP_DARK[id] = makeSprite(rows, {}, 'E');
}
export const CROP_GOLD = makeSprite(CROP_ART.strawberry, { R: 'Y', Y: 'O' });
