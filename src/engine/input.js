// Taps on the game screen (in game pixels), plus Enter/Space on a keyboard.
export class Input {
  constructor(canvas, onGesture = () => {}) {
    this.taps = [];
    this.enter = false;
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onGesture();
      const b = canvas.getBoundingClientRect();
      this.taps.push({
        x: ((e.clientX - b.left) * canvas.width) / b.width,
        y: ((e.clientY - b.top) * canvas.height) / b.height,
      });
    });
    addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); onGesture(); this.enter = true; }
    });
  }

  get tapped() { return this.taps.length > 0 || this.enter; }

  tapIn(x, y, w, h) { return this.taps.some((t) => t.x >= x && t.x < x + w && t.y >= y && t.y < y + h); }

  endStep() { this.taps.length = 0; this.enter = false; }
}
