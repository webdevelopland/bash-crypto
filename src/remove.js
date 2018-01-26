const path = require('path');
const fs = require('fs');

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

module.exports = {
  remove: remove
};