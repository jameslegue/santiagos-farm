// Santiago's seeds, in the order you unlock them (his numbers 1-9 from the seed packet drawing).
//   price - coins to unlock the packet (the first one is free)
//   grow  - seconds each growing stage takes after you water it (3 stages: seed, sprout, plant)
//   sell  - coins you get when you pick it
//   tree  - grows into a little tree instead of a bush
//   word  - what's written on the packet after the name
export const CROPS = [
  { id: 'strawberry', name: 'STRAWBERRY', word: 'SEED', legendary: true, price: 0, grow: 3, sell: 2 },
  { id: 'raspberry', name: 'RASPBERRY', word: 'SEED', price: 10, grow: 4, sell: 3 },
  { id: 'apple', name: 'APPLE', word: 'SEED', tree: true, price: 25, grow: 5, sell: 5 },
  { id: 'broccoli', name: 'BROCCOLI', word: 'SEED', price: 45, grow: 5, sell: 6 },
  { id: 'cherry', name: 'CHERRY', word: 'PIT', tree: true, price: 70, grow: 6, sell: 8 },
  { id: 'blackberry', name: 'BLACKBERRY', word: 'SEED', price: 100, grow: 6, sell: 10 },
  { id: 'carrot', name: 'CARROT', word: 'SEED', price: 140, grow: 7, sell: 12 },
  { id: 'tomato', name: 'TOMATO', word: 'SEED', price: 190, grow: 7, sell: 15 },
  { id: 'lettuce', name: 'LETTUCE', word: 'SEED', price: 250, grow: 8, sell: 20 },
];

// The Legendary Strawberry sometimes grows a golden strawberry.
export const GOLD_CHANCE = 1 / 6;
export const GOLD_SELL = 15;

export const cropById = (id) => CROPS.find((c) => c.id === id);
