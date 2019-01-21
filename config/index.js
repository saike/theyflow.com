import fs from 'fs';
import path from 'path';

let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'local.json')));

export default config;