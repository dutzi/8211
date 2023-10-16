/* eslint-disable */

import Papa from 'papaparse';
import dotenv from 'dotenv';
import fs from 'fs';
import CryptoJS from 'crypto-js';

const dataCsv = fs.readFileSync('./src/data/data.csv').toString();
const parseResult = Papa.parse(dataCsv, { delimiter: ',', header: true });

dotenv.config();

// The last entry is empty (prettier adds a newline to the CSV when saving the
// file), so we remove it.
//
const userData = parseResult.data.filter((entry) => Object.keys(entry).length > 1);

console.log(`Found ${userData.length} soldiers`);

fs.writeFileSync(
  './src/data/user.ts',
  `const userData = '${CryptoJS.AES.encrypt(JSON.stringify(userData, 2), process.env.PASSWORD_USER).toString()}';
export default userData;`
);
