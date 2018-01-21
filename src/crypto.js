const { getInput, kill } = require('./process');
const { unlink, encrypt, decrypt, tar, untar }  = require('./bash');

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
