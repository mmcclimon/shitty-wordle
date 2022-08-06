import { Score } from './game.js';

const isWin = results => results.every(el => el === Score.CORRECT);

const checkGuess = (target, guess)  => {
  const results = Array(5).fill(null);

  // first mark correct letters, then go through everything else
  const targetChars = target.split('');

  targetChars.forEach((char, idx) => {
    if (guess.charAt(idx) === char) {
      results[idx] = Score.CORRECT;
      targetChars[idx] = null;
    }
  });

  // here, all the correct letters are marked, and we have some letters that
  // aren't in the word at all, and some that are in the wrong place
  Array.from(guess).forEach((char, idx) => {
    // accounted for above
    if (results[idx]) { return }

    const foundIdx = targetChars.indexOf(char);

    if (foundIdx !== -1) {
      results[idx] = Score.MISPLACED;
      targetChars[foundIdx] = null;
    } else {
      results[idx] = Score.WRONG;
    }
  });

  return results;
};

export { checkGuess, isWin };
