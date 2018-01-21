function getInput(callback) {
  var mode = process.argv[2];
  if (mode !== '-e' && mode !== '-d') {
    kill("Error: Invalid mode.");
  }
  checkPassword(process.argv[3], process.argv[4], (filename, password) => {
    if (!password) kill("Error: Invalid password.");
    callback(mode, filename, password);
  });
}

function checkPassword(filename, password, callback) {
  if (!filename) kill("Error: Invalid filename.");
  if (!password) {
    getPassword('Password: ', (password) => {
      callback(filename, password)
    });
    return;
  }
  callback(filename, password);
}

function kill(message) {
  console.log(message);
  process.exit();
}

function getPassword(prompt, callback) {
  if (prompt) {
    process.stdout.write(prompt);
  }

  const BACKSPACE = 8;
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
        process.error();
        break;
      case BACKSPACE:
        // Remove last character
        password = password.slice(0, password.length - 1);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(prompt);
        process.stdout.write(password.split('').map(function () {
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

const { exec } = require('child_process');

function unlink(filename, callback) {
  exec(
    `unlink ${filename}.tar.gz`,
    callback
  );
}
function encrypt(filename, password, callback) {
  exec(
    `openssl enc -e -aes-256-cbc -k ${password} -in ${filename}.tar.gz -out ${filename}.data`,
    callback
  );
}
function decrypt(filename, password, callback) {
  exec(
    `openssl enc -d -aes-256-cbc -k ${password} -in ${filename}.data -out ${filename}.tar.gz`,
    callback
  );
}
function tar(filename, callback) {
  exec(
    `tar -czf ${filename}.tar.gz ${filename}`,
    callback
  );
}
function untar(filename, callback) {
  exec(
    `tar -xzf ${filename}.tar.gz`,
    callback
  );
}

getInput((mode, name, password) => {
  if (mode === '-e') {
    encryptFolder(name, password);
  } else if (mode === '-d') {
    decryptFolder(name, password);
  }
});

function encryptFolder(name, password) {
  tar(name, error => {
    if (error) {
      unlink(name);
      kill('Error: Invalid filename');
    }
    encrypt(name, password, error => {
      unlink(name);
    });
  });
}

function decryptFolder(name, password) {
  decrypt(name, password, error => {
    if (error) {
      unlink(name);
      kill('Error: Invalid password');
    }
    untar(name, error => {
      unlink(name);
    });
  });
}