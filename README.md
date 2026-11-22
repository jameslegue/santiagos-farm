# Santiago's Farm

An 8-bit farming game designed by Santiago. Built for phones (portrait), made for little hands - big tap targets, pictures over words.

It starts with a **Legendary Strawberry Seed** packet (straight from his drawing - `docs/seed-packet-drawing.jpg`). Plant it, water it, pick it, earn coins, and buy the next seed packet. Collect all 9 in his order:

| # | Seed | Superhero | Power |
|---|---|---|---|
| 1 | Strawberry (Legendary - sometimes grows golden!) | Strawberry Swing | Swings on vines |
| 2 | Raspberry | Razz-Bot | Rocket boots |
| 3 | Apple (tree) | Captain Apple | Flies super fast |
| 4 | Broccoli | Broc Smash | Super stomp |
| 5 | Cherry Pit (tree) | Cherry Cat | Super pounce |
| 6 | Blackberry | Night Berry | Glides in the dark |
| 7 | Carrot | Captain Carrot | X-ray eyes |
| 8 | Tomato | Ketchup Kid | Ketchup splat |
| 9 | Lettuce | Captain Iceberg | Ice power |

Each seed has its own superhero (original characters made for this game). The hero jumps out when you open their packet, zooms across the farm when their crop gets ripe, and lives on the **MY HEROES** page (SEEDS → HEROES).

Santiago drives his red tractor around the farm (like the picture on the wall - `docs/tractor-picture.jpg`) and does all the work.

## How to play
- Tap plots and Santiago drives his tractor to each one, in order (waiting plots glow yellow). When he's done he parks by the barn
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
- **Heroes are data:** `src/heroes.js` - name, power, how they cross the farm (fly, swing, stomp, run) and their pixel art
- `src/scenes/` - `title.js`, `farm.js` (tractor, plant/water/pick, rain, hero fly-bys), `heroes.js` (My Heroes page), `seeds.js` (packet picker + shop), `packet.js` (rip open a new packet)
- `src/ui/packet.js` - the seed packet look from his drawing (hang hole, circled number, green writing, LEGENDARY down the side)

## Roadmap
1. ✅ The farm - 9 seeds in his order, Legendary Strawberry packet, plant/water/pick, coins, buy packets, golden strawberries, rain, sound, offline install
2. ✅ Santiago on his red tractor - drives to each plot you tap
3. ✅ A superhero for every seed - packet reveal, farm fly-bys, My Heroes page
4. His next drawing - ideas to ask him about: the dog, cat and chickens from the tractor picture, a Christmas wreath on the tractor, animals, a bigger farm, sprinklers, a market to sell at, what the other seeds' rarities are
