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

module.exports = {
  unlink: unlink,
  encrypt: encrypt,
  decrypt: decrypt,
  tar: tar,
  untar: untar
};
