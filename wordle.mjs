import { open } from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import { once } from 'node:events';

const WRONG = 0;
const MISPLACED = 1;
const CORRECT = 2;

const readWords = async function () {
  const words = [];

  const f = await open('/usr/share/dict/words');
  const rl = readline.createInterface({ input: f.createReadStream() })

  rl.on('line', line => {
    if (line.length !== 5 || line.match(/[A-Z]/)) {
      return;
    }

    words.push(line);
  })

  await once(rl, 'close');
  return words;
};

const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

const isWin = results => results.every(el => el === CORRECT);

const checkGuess = (target, guess) => {
  const seen = new Map();
  const results = [];

  guess.split('').forEach((char, idx) => {
    const prev = seen.get(char) ?? -1;
    const foundIdx = target.indexOf(char, prev + 1);

    if (foundIdx !== -1) {
      seen.set(char, foundIdx);
    }

    results[idx] = foundIdx === -1  ? WRONG
                 : foundIdx === idx ? CORRECT
                 : MISPLACED;
  });

  return results;
};


const filterWordList = (words, guess, results) => {
  const letters = new Map();

  guess.split('').forEach((char, idx) => {
    letters.set(char, Math.max(letters.get(char) ?? results[idx], results[idx]));
  })

  for (const [char, result] of letters) {
    let idx;
    switch (result) {
      case WRONG:
        words = words.filter(w => ! w.includes(char));
        break;
      case MISPLACED:
        // improve this
        words = words.filter(w => w.includes(char));
        break;
      case CORRECT:
        idx = [0,1,2,3,4].find(
          i => guess.charAt(i) === char && results[i] === CORRECT
        );
        words = words.filter(w => w.charAt(idx) === char);
    }
  }

  return words.filter(w => w !== guess);
};

const printGuess = (guess, results) => {
  let s = '';

  guess.split('').forEach((char, idx) => {
    switch (results[idx]) {
      case WRONG:
        s += char;
        break;
      case MISPLACED:
        s += '\x1b[38;5;172m' + char + '\x1b[0m';
        break;
      case CORRECT:
        s += '\x1b[38;5;34m' + char + '\x1b[0m';
        break;
    };
  })

  console.log(s)
};

const runLoop = (target, words) => {
  let attempts = 1;
  const guesses = [];

  while (words.length > 0) {
    const guess = randomElement(words);
    guesses.push(guess);
    const r = checkGuess(target, guess);

    printGuess(guess, r);

    if (isWin(r)) {
      console.log(`won in ${attempts}`)
      return;
    } else {
      words = filterWordList(words, guess, r);
      // console.log(`${guess} was wrong ${r}, list now ${words.length} long`)
    }

    if (guess === target) {
      console.log('dammit')
      break;
    }

    attempts++;
  }

  console.log(`whoa! lost game: target=${target}, guesses=${guesses}`);
};

let words = await readWords();
const target = randomElement(words);
runLoop(target, words);
