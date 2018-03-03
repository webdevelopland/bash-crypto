const { getInput, onKey, consts } = require('./process');
const { unlink, encrypt, decrypt, tar, untar } = require('./bash');
const { remove } = require('./remove');

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
