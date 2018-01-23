const fs = require('fs');

function getInput(callback) {
  var mode = process.argv[2];
  if (mode !== '-e' && mode !== '-d') {
    kill("Error: Invalid mode.");
  }

  checkFilename(process.argv[3], mode, (error, filename) => {
    if (error) {
      kill("Error: Invalid filename.");
    }

    checkPassword(process.argv[4], password => {
      if (!password) {
        kill("Error: Invalid password.");
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
  } else if (mode === '-d') {
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

function getPassword(prompt, callback) {
  if (prompt) {
    process.stdout.write(prompt);
  }

  const BACKSPACE_WINDOWS = 8;
  const BACKSPACE_LINUX = 127;
  const EXIT = 3;
  const ESC = 27;
  const ENTER = 13;

  process.stdin.setRawMode(true);
  process.stdin.setEncoding('utf8');

  var password = '';
  process.stdin.on('data', char => {
    char = char.toString('utf8');
    var code = char.charCodeAt(0);

    switch (code) {
      case ENTER:
        // Password typing is finished
        process.stdout.write('\n');
        process.stdin.setRawMode(false);
        process.stdin.pause();
        callback(password);
        break;
      case EXIT:
      case ESC:
        // Close program
        process.stdout.write('\n');
        process.exit();
        break;
      case BACKSPACE_WINDOWS:
      case BACKSPACE_LINUX:
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

module.exports = {
  getInput: getInput
};
