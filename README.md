# Santiago's Farm

An 8-bit farming game designed by Santiago. Built for phones (portrait), made for little hands - big tap targets, pictures over words.

It starts with a **Legendary Strawberry Seed** packet (straight from his drawing - `docs/seed-packet-drawing.jpg`). Plant it, water it, pick it, earn coins, and buy the next seed packet. Collect all 9 in his order:

1. Strawberry (Legendary - sometimes grows a golden one!)
2. Raspberry
3. Apple (tree)
4. Broccoli
5. Cherry Pit (tree)
6. Blackberry
7. Carrot
8. Tomato
9. Lettuce

## How to play
- Tap dirt to plant your seed
- Tap the water drop to water it - it grows a step each time
- Tap the fruit when it's ready to pick it and get coins
- Tap **SEEDS** to pick which seed to plant, or buy the next packet when the bar fills up
- A yellow arrow shows what to do next. Every so often a rain cloud waters everything for you
- Plants keep growing while the game is closed

## Run it
No build step. Serve the folder and open it:

```
python3 -m http.server 8000
```

Then go to http://localhost:8000. (Opening `index.html` directly won't work - browsers block modules from `file://`.)

On a phone: host on GitHub Pages (repo Settings → Pages → deploy from branch), open the link, then "Add to Home Screen".

Testing shortcuts: `?reset` wipes the save, `?coins=500` sets coins.

Offline: `sw.js` caches the game so it works from the home screen with no signal. It always tries the network first, so updates show up right away. If you add new files, add them to the list in `sw.js` too.

## How it's built
Same engine as Sophia's Garden - plain JavaScript modules + an HTML canvas at 144x256, scaled up in whole pixels so it stays crisp. One 16-color palette (`src/engine/palette.js`), all art is text grids of palette letters (`src/sprites.js`).

- **Seeds are data:** `src/crops.js` - order, price, grow time and sell value for each seed. Tweak the numbers there to make the game faster/slower.
- `src/scenes/` - `title.js`, `farm.js` (plant/water/pick, rain), `seeds.js` (packet picker + shop), `packet.js` (rip open a new packet)
- `src/ui/packet.js` - the seed packet look from his drawing (hang hole, circled number, green writing, LEGENDARY down the side)

## Roadmap
1. ✅ The farm - 9 seeds in his order, Legendary Strawberry packet, plant/water/pick, coins, buy packets, golden strawberries, rain, sound, offline install
2. His next drawing - ideas to ask him about: a farmer (him?) or a pet, animals, a bigger farm, sprinklers, a market to sell at, what the other seeds' rarities are
