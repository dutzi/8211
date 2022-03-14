const Papa = require('papaparse');
const dotenv = require('dotenv');
const fs = require('fs');
const dataCsv = fs.readFileSync('./data.csv').toString();
const parseResult = Papa.parse(dataCsv, { delimiter: ',', header: true });
const keyMapping = require('./keyMapping');
const CryptoJS = require('crypto-js');

dotenv.config();

const data = parseResult.data.map((row) => {
  const mappedRow = {};
  keyMapping.forEach(([he, en], index) => {
    if (index === 0) {
      mappedRow[en] = row[Object.keys(row)[0]];
    }
    mappedRow[en] = row[he];
  });
  return mappedRow;
});

fs.writeFileSync(
  './data.js',
  `window.encryptedData = '${CryptoJS.AES.encrypt(
    JSON.stringify(data, 2),
    process.env.PASSWORD
  ).toString()}'`
);
