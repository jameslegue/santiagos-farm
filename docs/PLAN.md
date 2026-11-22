# Santiago's Farm - game plan

## Context
A game for Santiago (5-7), same idea as Sophia's Garden: he's the lead designer, we build in stages, he playtests each one. He plays on a **phone, held portrait**. Minimal reading - pictures, big buttons, a yellow arrow showing what to do.

His first drawing (`docs/seed-packet-drawing.jpg`) is a seed packet: **Legendary Strawberry Seed**, plus a numbered list of seeds. Read as a farming game where you unlock seeds in his order:

`1 Strawberry → 2 Raspberry → 3 Apple → 4 Broccoli → 5 Cherry Pit → 6 Blackberry → 7 Carrot → 8 Tomato → 9 Lettuce`

## Game loop
1. Title → first PLAY drops the Legendary Strawberry packet. Tap to rip it open.
2. Farm: 12 dirt plots. Tap dirt = plant. Tap the water drop = water (one growing step: seed → sprout → plant → ripe). Tap ripe = pick it, coins fly to the counter.
3. Coins fill the NEW SEED bar. When it's full, open SEEDS and buy the next packet → packet-opening moment again.
4. Extras: the Legendary Strawberry sometimes grows golden (worth more), a rain cloud waters everything now and then, plants keep growing while the game is closed.

## Stage 2 - the tractor
He wants to ride a tractor like the picture on our wall (`docs/tractor-picture.jpg`): red body, yellow wheels, big back wheel, black + red smokestacks. Santiago (red cap, blue shirt) drives it. Tap plots → they queue up (yellow outline) → he drives to each in order and plants/waters/picks on arrival → parks by the barn when idle. Also drives back and forth on the title screen.

## Approach
- Reuse Sophia's Garden engine (canvas 144x256, palette, pixel font, chiptune sound, save, PWA/offline).
- Tap-only input - no D-pad.
- Seeds are data (`src/crops.js`) so tuning prices/grow times is a one-line change.

## Open questions for Santiago
- Is strawberry the only Legendary? Do the others have rarities too (common/rare/epic)?
- What does he look like (hair, cap color, shirt)? Defaults: brown hair, red cap, blue shirt.
- The picture has a dog, a cat and chickens - want them on the farm? A wreath on the tractor for Christmas?
- What's special about the Cherry Pit (he circled it big)?
- Animals? A bigger farm? Selling at a market?

## Verification
- Playwright, iPhone portrait: title → packet → farm → plant/water/pick all 12 plots → buy the 2nd packet. No console errors.
- Then the real test: GitHub Pages on his phone (James turns on Pages in repo settings).
