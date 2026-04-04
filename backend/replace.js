const fs = require('fs');
const path = require('path');
const d = './models';
fs.readdirSync(d).forEach(f => {
  let p = path.join(d, f);
  let c = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, c.replace(/require\('mongoose'\)/g, 'require("../mock-db")'));
});
console.log('models replaced');
