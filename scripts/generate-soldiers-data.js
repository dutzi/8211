var fs = require('fs');

let data = fs.readFileSync('./secrets/data.csv', 'utf8');
data = data.split('\r\n');
console.log(JSON.stringify(data, true, 4));
