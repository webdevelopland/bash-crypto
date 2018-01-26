## bash-crypto

Encrypt
```javascript
// folder -> folder.data
node crypto.js -e folder
// Password: *****
```

Decrypt
```javascript
// folder.data -> folder
node crypto.js -d folder
// Password: *****
```

Open encrypted file
```javascript
node crypto.js -s folder
// Password: *****
```

Password by command
```javascript
node crypto.js -e folder password
node crypto.js -d folder password
node crypto.js -s folder password
```
