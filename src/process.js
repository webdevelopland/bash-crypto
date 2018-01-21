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

module.exports = {
  getInput: getInput,
  kill: kill
};
