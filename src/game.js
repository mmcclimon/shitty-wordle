import process from 'node:process';
import { checkGuess, isWin } from './checker.js';

const Score = Object.freeze({
  WRONG: 0,
  MISPLACED: 1,
  CORRECT: 2,
});

const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

const letterCount = (word, char) => word.split('').filter(c => c === char).length;

const formatGuess = (guess, results) => {
  let s = '';

  guess.split('').forEach((char, idx) => {
    switch (results[idx]) {
      case Score.WRONG:
        s += char;
        break;
      case Score.MISPLACED:
        s += '\x1b[38;5;172m' + char + '\x1b[0m';
        break;
      case Score.CORRECT:
        s += '\x1b[38;5;34m' + char + '\x1b[0m';
        break;
    };
  });

  return s;
};

const Game = class {
  #target;

  constructor (words, args = {}) {
    this.wordlist = words.slice();
    this.#target = randomElement(words);
    this.format = args.compact ? 'compact' : 'expanded';
    this.firstGuess = args.firstGuess || randomElement(this.wordlist);
  }

  run () {
    let attempts = 1;
    const guesses = [];
    const startT = process.hrtime.bigint();

    let guess = this.firstGuess;

    while (this.wordlist.length > 0) {
      const r = checkGuess(this.#target, guess);

      const formatted = formatGuess(guess, r);
      guesses.push(formatted);

      if (this.format === 'expanded') {
        console.log(formatted);
      }

      if (isWin(r)) {
        const endT = process.hrtime.bigint();
        const msec = Number(endT - startT) / 1e6;
        let msg = `win in ${attempts} (${msec.toFixed(2)}ms)`;

        if (this.format === 'compact') {
          msg += `: ${guesses.join(', ')}`;
        }

        console.log(msg);
        return attempts;
      } else {
        this.wordlist = this.#filterWordList(guess, r);
      }

      if (guess === this.#target) {
        console.log('dammit');
        break;
      }

      attempts++;
      guess = randomElement(this.wordlist);
    }

    console.log(`whoa! lost game: target=${this.#target}, guesses=${guesses}`);
  }

  #filterWordList (guess, results) {
    const guessChars = guess.split('');

    const charCounts = new Map();
    const inWordCounts = new Map();

    const filters = [];

    // grab all the correct letters
    guessChars.forEach((char, idx) => {
      charCounts.set(char, (charCounts.get(char) || 0) + 1);

      if (results[idx] > 0) {
        inWordCounts.set(char, (inWordCounts.get(char) || 0) + 1);
      }

      if (results[idx] === Score.CORRECT) {
        filters.push(w => w.charAt(idx) === char);
      }
    });

    // Our guess is LEVEE. We know that at most 1 E is correct, so we can
    // remove words with > 1 E
    for (const [char, count] of charCounts) {
      const inWord = inWordCounts.get(char) || 0;

      if (count > inWord) {
        filters.push(w => letterCount(w, char) <= inWord);
      }
    }

    // we need to do something with our misplaced letters; this does more work
    // than is strictly necessary
    guessChars.forEach((char, idx) => {
      if (results[idx] === Score.MISPLACED) {
        filters.push(w => w.charAt(idx) !== char &&  letterCount(w, char) > 0);
      }
    });

    const combinedFilter = filters.reduce((acc, f) => x => acc(x) && f(x));
    return this.wordlist.filter(combinedFilter);
  }
};

export { Game, Score };
