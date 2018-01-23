const { getInput } = require('./process');
const { unlink, encrypt, decrypt, tar, untar } = require('./bash');

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
      console.log('Error: Invalid filename.');
      unlink(name);
      return;
    }
    encrypt(name, password, () => {
      unlink(name);
      console.log('Encrypted');
    });
  });
}

function decryptFolder(name, password) {
  decrypt(name, password, error => {
    if (error) {
      console.log('Error: Invalid password.');
      unlink(name);
      return;
    }
    untar(name, () => {
      unlink(name);
      console.log('Decrypted');
    });
  });
}
