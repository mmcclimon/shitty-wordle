const WRONG = 0;
const MISPLACED = 1;
const CORRECT = 2;

const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

const isWin = results => results.every(el => el === CORRECT);

const letterCount = (word, char) => word.split('').filter(c => c === char).length;

const formatGuess = (guess, results) => {
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
  });

  return s;
};

const Game = class {
  #target;

  constructor (words, args = {}) {
    this.wordlist = words.slice();
    this.#target = randomElement(words);
    this.format = args.compact ? 'compact' : 'expanded';
  }

  run () {
    let attempts = 1;
    const guesses = [];

    while (this.wordlist.length > 0) {
      const guess = randomElement(this.wordlist);
      const r = this.#checkGuess(guess);

      const formatted = formatGuess(guess, r);
      guesses.push(formatted);

      if (this.format === 'expanded') {
        console.log(formatted);
      }

      if (isWin(r)) {
        let msg = `win in ${attempts}`;
        if (this.format === 'compact') {
          msg += `: ${guesses.join(', ')}`;
        }

        console.log(msg);
        return;
      } else {
        this.wordlist = this.#filterWordList(guess, r);
      }

      if (guess === this.#target) {
        console.log('dammit');
        break;
      }

      attempts++;
    }

    console.log(`whoa! lost game: target=${this.#target}, guesses=${guesses}`);
  }

  #filterWordList (guess, results) {
    const guessChars = guess.split('');
    let words = this.wordlist;

    const charCounts = new Map();
    const inWordCounts = new Map();

    // grab all the correct letters
    guessChars.forEach((char, idx) => {
      charCounts.set(char, (charCounts.get(char) || 0) + 1);

      if (results[idx] > 0) {
        inWordCounts.set(char, (inWordCounts.get(char) || 0) + 1);
      }

      if (results[idx] === CORRECT) {
        words = words.filter(w => w.charAt(idx) === char);
      }
    });

    // Our guess is LEVEE. We know that at most 1 E is correct, so we can
    // remove words with > 1 E
    for (const [char, count] of charCounts) {
      const inWord = inWordCounts.get(char) || 0;

      if (count > inWord) {
        words = words.filter(w => letterCount(w, char) <= inWord);
      }
    }

    // we need to do something with our misplaced letters; this does more work
    // than is strictly necessary
    guessChars.forEach((char, idx) => {
      if (results[idx] === MISPLACED) {
        words = words.filter(w => letterCount(w, char) > 0 && w.charAt(idx) !== char);
      }
    });

    return words;
  }

  #checkGuess (guess) {
    const results = [null, null, null, null, null];

    // first mark correct letters, then go through everything else
    const guessChars  = guess.split('');
    const targetChars = this.#target.split('');

    targetChars.forEach((char, idx) => {
      if (guess.charAt(idx) === char) {
        results[idx] = CORRECT;
        guessChars[idx] = null;
        targetChars[idx] = null;
      }
    });

    // here, all the correct letters are marked, and we have some letters that
    // aren't in the word at all, and some that are in the wrong place

    guessChars.forEach((char, idx) => {
      if (char === null) {
        // already accounted for
        return;
      }

      const foundIdx = targetChars.indexOf(char);

      if (foundIdx !== -1) {
        results[idx] = MISPLACED;
        targetChars[foundIdx] = null;
      } else {
        results[idx] = WRONG;
      }
    });

    return results;
  }
};

export { Game };
