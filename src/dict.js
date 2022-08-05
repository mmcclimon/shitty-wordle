import { open } from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import { once } from 'node:events';

const readWords = async function () {
  const words = [];

  const f = await open('/usr/share/dict/words');
  const rl = readline.createInterface({ input: f.createReadStream() });

  rl.on('line', line => {
    if (line.length !== 5 || line.match(/[A-Z]/)) {
      return;
    }

    words.push(line);
  });

  await once(rl, 'close');
  return words;
};

export { readWords };
