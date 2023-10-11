const Papa = require('papaparse');
const dotenv = require('dotenv');
const fs = require('fs');
const dataCsv = fs.readFileSync('./data.csv').toString();
const parseResult = Papa.parse(dataCsv, { delimiter: ',', header: true });
const keyMapping = require('./keyMapping');
const CryptoJS = require('crypto-js');

dotenv.config();

const adminData = parseResult.data
  .map((row) => {
    const mappedRow = {};
    keyMapping.forEach(([he, en], index) => {
      mappedRow[en] = row[en];
    });

    if (!mappedRow['name']) {
      return null;
    }

    return mappedRow;
  })
  .filter(Boolean);

const userData = adminData.map((item) => ({
  firstName: item.name.split(' ')[0],
  lastName: item.name.split(' ').slice(1).join(' '),
  mobile: item.phone,
  division: item.division,
  title: item.title,
  mainPhone: '',
}));

console.log(adminData.length);
console.log(userData.length);

fs.writeFileSync(
  './admin-data.js',
  `window.adminEncryptedData = '${CryptoJS.AES.encrypt(
    JSON.stringify(adminData, 2),
    process.env.PASSWORD_ADMIN
  ).toString()}'`
);

fs.writeFileSync(
  './user-data.js',
  `window.userEncryptedData = '${CryptoJS.AES.encrypt(
    JSON.stringify(userData, 2),
    process.env.PASSWORD_USER
  ).toString()}'`
);
