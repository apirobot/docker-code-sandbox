echo "
const print = (data) => console.log(data);

const readline = () => {
  return new Promise((resolve) => {
    const _readline = require('readline');

    const _rl = _readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    _rl.on('line', (_stdin) => {
      resolve(_stdin);
    });
  })
};

$(cat "$1")" > "$1"

node "$1"
