const fs = require('fs');

function getInput(callback) {
  var mode = process.argv[2];
  if (mode !== '-e' && mode !== '-d' && mode !== '-s' && mode !== '-v') {
    kill('Error: Invalid mode');
  }

  checkFilename(process.argv[3], mode, (error, filename) => {
    if (error) {
      kill('Error: Invalid filename');
    }

    checkPassword(process.argv[4], password => {
      if (!password) {
        kill('Error: Invalid password');
      }
      callback(mode, filename, password);
    });
  });
}

function checkFilename(filename, mode, callback) {
  if (!filename) {
    callback(true);
    return;
  }

  if (mode === '-e') {
    var filepath = filename;
  } else if (mode === '-d' || mode === '-s' || mode === '-v') {
    var filepath = filename + '.data';
  }

  fs.exists(filepath, exists => {
    if (!exists) {
      callback(true);
      return;
    }
    callback(false, filename);
  });
}

function checkPassword(password, callback) {
  if (!password) {
    getPassword('Password: ', password => {
      callback(password)
    });
    return;
  }
  callback(password);
}

function kill(message) {
  console.log(message);
  process.exit();
}

const consts = {
  BACKSPACE_WINDOWS: 8,
  BACKSPACE_LINUX: 127,
  EXIT: 3,
  ESC: 27,
  ENTER: 13
};

process.stdin.callback = null;
process.stdin.on('data', char => {
  char = char.toString('utf8');
  var code = char.charCodeAt(0);
  if (process.stdin.callback) {
    process.stdin.callback(char, code);
  }
});
process.stdin.pause();

function getPassword(prompt, callback) {
  if (prompt) {
    process.stdout.write(prompt);
  }

  var password = '';
  onKey((char, code) => {
    switch (code) {
      case consts.ENTER:
        // Password typing is finished
        process.stdout.write('\n');
        process.stdin.setRawMode(false);
        process.stdin.pause();
        callback(password);
        break;
      case consts.EXIT:
      case consts.ESC:
        // Close program
        process.stdout.write('\n');
        process.exit();
        break;
      case consts.BACKSPACE_WINDOWS:
      case consts.BACKSPACE_LINUX:
        // Remove last character
        password = password.slice(0, password.length - 1);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(prompt);
        process.stdout.write(password.split('').map(() => {
          return '*';
        }).join(''));
        break;
      default:
        // Add new character
        process.stdout.write('*');
        password += char;
    }
  });
}

function onKey(callback) {
  process.stdin.setRawMode(true);
  process.stdin.setEncoding('utf8');
  process.stdin.callback = callback;
  process.stdin.resume();
}

module.exports = {
  getInput: getInput,
  onKey: onKey,
  consts: consts
};
