'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../extension');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert(manifest.description.length <= 132);
assert.deepEqual(manifest.permissions, ['storage']);
assert.deepEqual(manifest.content_scripts[0].matches, ['https://www.youtube.com/*', 'https://youtube.com/*']);
assert.equal(manifest.content_scripts[0].run_at, 'document_start');
assert(!manifest.background && !manifest.host_permissions && !manifest.externally_connectable);
const files = fs.readdirSync(root, { recursive: true }).filter(file => fs.statSync(path.join(root, file)).isFile());
for (const file of files) {
  if (file.endsWith('.js')) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    new vm.Script(source, { filename: file });
    assert(!/\beval\s*\(|\bfetch\s*\(|XMLHttpRequest|https?:\/\//.test(source), `Unexpected network/eval code: ${file}`);
  }
}
const html = fs.readFileSync(path.join(root, manifest.action.default_popup), 'utf8');
assert(!/<script[^>]*>\s*[^<\s]/i.test(html), 'Inline script found');
assert(!/\son\w+=/i.test(html), 'Inline event handler found');
for (const [, resource] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  assert(fs.existsSync(path.join(root, resource)), `Missing popup resource: ${resource}`);
}
for (const [size, file] of Object.entries(manifest.icons)) {
  const png = fs.readFileSync(path.join(root, file));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), Number(size));
  assert.equal(png.readUInt32BE(20), Number(size));
}
console.log(`Validated manifest, local resources, JavaScript syntax and ${Object.keys(manifest.icons).length} PNG sizes.`);
