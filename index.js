import { readWords } from './src/dict.js';
import { Game } from './src/game.js';

const words = await readWords();

const attempts = [];

for (let i = 0; i < 50; i++) {
  const game = new Game(words, {
    compact: true,
    firstGuess: 'later',
  });

  const took = game.run();
  attempts.push(took);
}

const avg = attempts.reduce((acc, el) => acc + el) / attempts.length;
console.log(`average number of guesses: ${avg}`);
