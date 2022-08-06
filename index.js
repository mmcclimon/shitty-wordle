import { readWords } from './src/dict.js';
import { Game } from './src/game.js';

const words = await readWords();

for (let i = 0; i < 50; i++) {
  const game = new Game(words, { compact: true });
  game.run();
}
