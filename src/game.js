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
          words = words.filter(w => w.includes(char));
          break;
        case CORRECT:
          idx = [0, 1, 2, 3, 4].find(
            i => guess.charAt(i) === char && results[i] === CORRECT,
          );
          words = words.filter(w => w.charAt(idx) === char);
      }
    }

    return words.filter(w => w !== guess);
  }

  #checkGuess (guess) {
    const seen = new Map();
    const results = [];

    guess.split('').forEach((char, idx) => {
      const prev = seen.get(char) ?? -1;
      const foundIdx = this.#target.indexOf(char, prev + 1);

      if (foundIdx !== -1) {
        seen.set(char, foundIdx);
      }

      /* eslint-disable indent */
      results[idx] = foundIdx === -1  ? WRONG
                   : foundIdx === idx ? CORRECT
                   : MISPLACED;
      /* eslint-enable indent */
    });

    return results;
  }
};

export { Game };
