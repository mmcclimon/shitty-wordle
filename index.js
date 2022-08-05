import { readWords } from './src/dict.js';
import { Game } from './src/game.js';

const words = await readWords();
const game = new Game(words);
game.run();
