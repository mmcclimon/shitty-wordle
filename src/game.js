const WRONG = 0;
const MISPLACED = 1;
const CORRECT = 2;

const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

const isWin = results => results.every(el => el === CORRECT);

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
  });

  console.log(s);
};

const Game = class {
  #target;

  constructor (words) {
    this.wordlist = words.slice();
    this.#target = randomElement(words);
  }

  run () {
    let attempts = 1;
    const guesses = [];

    while (this.wordlist.length > 0) {
      const guess = randomElement(this.wordlist);
      guesses.push(guess);
      const r = this.#checkGuess(guess);

      printGuess(guess, r);

      if (isWin(r)) {
        console.log(`won in ${attempts}`);
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
    const letters = new Map();

    guess.split('').forEach((char, idx) => {
      letters.set(char, Math.max(letters.get(char) ?? results[idx], results[idx]));
    });

    let words = this.wordlist;

    for (const [char, result] of letters) {
      let idx;
      switch (result) {
        case WRONG:
          words = words.filter(w => !w.includes(char));
          break;
        case MISPLACED:
          // improve this
          idx = [0, 1, 2, 3, 4].find(
            i => guess.charAt(i) === char && results[i] === MISPLACED,
          );
          words = words.filter(w => w.charAt(idx) !== char);
          break;
        case CORRECT:
          idx = [0, 1, 2, 3, 4].find(
            i => guess.charAt(i) === char && results[i] === CORRECT,
          );
          words = words.filter(w => w.charAt(idx) === char);
      }
    }

    guess.split('').forEach((char, idx) => {
      if (results[idx] === WRONG) {
        // console.log(`removing all words with ${char} at i=${idx}`);
        words = words.filter(w => w.charAt(idx) !== char);
      }
    });

    return words.filter(w => w !== guess);
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
    // console.log({ guessChars, targetChars, results });

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
