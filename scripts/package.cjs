'use strict';
// Reproducible ZIP with standard "stored" entries. Only extension/ is shipped.
// Uses Node's built-ins; no package installation or third-party ZIP tool needed.
require('./check.cjs');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../extension');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const output = path.resolve(__dirname, '../dist');
fs.mkdirSync(output, { recursive: true });
const table = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
const entries = fs.readdirSync(root, { recursive: true })
  .filter(file => fs.statSync(path.join(root, file)).isFile()).sort();
const chunks = [], directory = [];
let offset = 0;
for (const relative of entries) {
  const name = Buffer.from(relative.replaceAll('\\', '/'));
  const data = fs.readFileSync(path.join(root, relative));
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x800, 6); header.writeUInt16LE(33, 12);
  header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
  chunks.push(header, name, data);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8);
  central.writeUInt16LE(33, 14); central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
  directory.push(central, name);
  offset += header.length + name.length + data.length;
}
const central = Buffer.concat(directory);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8);
end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(central.length, 12);
end.writeUInt32LE(offset, 16);
const zip = Buffer.concat([...chunks, central, end]);
const name = `YouTube-Auto-Theater-${manifest.version}.zip`;
fs.writeFileSync(path.join(output, name), zip);
fs.writeFileSync(path.join(output, `${name}.sha256`), `${crypto.createHash('sha256').update(zip).digest('hex')}  ${name}\n`);
console.log(`Created dist/${name}: ${entries.length} files, ${zip.length} bytes.`);
