const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

function remove(fullPath) {
  if (fs.lstatSync(fullPath).isDirectory()) {
    var items = [];
    folderTree(fullPath, (itemPath, type) => {
      items.push({
        path: itemPath,
        type: type
      });
    }, () => {
      items.reverse();
      for(let item of items) {
        if (item.type.isdir) fs.rmdirSync(item.path);
        else fs.unlinkSync(item.path);
      }
      fs.rmdirSync(fullPath);
    });
  } else {
    fs.unlinkSync(fullPath);
  }
}

//Open all files and folder by path
function folderTree(treePath, callback, onend) {
  var items = fs.readdirSync(treePath);
  for(itemName of items) {
    let itemPath = path.join(treePath, itemName);
    let isdir = fs.lstatSync( itemPath ).isDirectory();

    var type = {
      isdir: isdir,
      isfile: !isdir
    };
    callback(itemPath, type);
    if (isdir) folderTree(itemPath, callback);
  }
  if (onend) onend();
}

getInput((mode, name, password) => {
  if (mode === '-e') {
    encryptFolder(name, password);
  } else if (mode === '-d') {
    decryptFolder(name, password);
  } else if (mode === '-s') {
    startSession(name, password);
  } else if (mode === '-v') {
    verifyPassowrd(name, password);
  }
});

function encryptFolder(name, password, callback) {
  tar(name, error => {
    if (error) {
      console.log('Error: Invalid filename');
      unlink(name);
      return;
    }
    encrypt(name, password, () => {
      unlink(name, () => {
        if (callback) callback();
      });
      console.log('Encrypted');
    });
  });
}

function decryptFolder(name, password, callback) {
  decrypt(name, password, error => {
    if (error) {
      console.log('Error: Invalid password');
      unlink(name);
      return;
    }
    untar(name, () => {
      unlink(name, () => {
        if (callback) callback();
      });
      console.log('Decrypted');
    });
  });
}

function startSession(name, password) {
  decryptFolder(name, password, () => {
    console.log('Session started...');
    onKey((char, code) => {
      switch (code) {
        case consts.EXIT:
        case consts.ESC:
          remove(name);
          process.exit();
          break;
        case consts.ENTER:
          encryptFolder(name, password, () => {
            remove(name);
            process.exit();
          });
          process.stdin.pause();
          break;
      }
    });
  });
}

function verifyPassowrd(name, password) {
  decrypt(name, password, error => {
    if (error) {
      console.log('Invalid password');
      unlink(name);
    } else {
      console.log('Correct');
      unlink(name);
    }
  });
}
