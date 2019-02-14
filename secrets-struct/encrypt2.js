var AES = require('crypto-js/aes');
var data = require('./data.js');
password = 'password';

var encrypted = AES.encrypt(JSON.stringify(data), password);
console.log(encrypted.toString());
