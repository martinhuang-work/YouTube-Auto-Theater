'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../extension/popup.js'), 'utf8');
function harness({ value = true, readError = false, writeError = false } = {}) {
  const elements = {};
  for (const id of ['toggleState', 'stateText', 'behavior', 'saveStatus', 'retry', 'feedback']) {
    elements[id] = { dataset: {}, events: {}, disabled: true, checked: false, hidden: true, addEventListener(name, fn) { this.events[name] = fn; } };
  }
  const body = { dataset: {} }, runtime = {};
  let listener, ready;
  const chrome = { runtime, storage: {
    local: {
      get(defaults, callback) { runtime.lastError = readError ? {} : undefined; callback({ autoTheaterEnabled: value }); runtime.lastError = undefined; },
      set(data, callback) {
        runtime.lastError = writeError ? {} : undefined;
        if (!writeError) value = data.autoTheaterEnabled;
        callback(); runtime.lastError = undefined;
      }
    }, onChanged: { addListener(fn) { listener = fn; } }
  } };
  vm.runInNewContext(source, { chrome, document: {
    body, getElementById: id => elements[id], querySelector: () => elements.feedback,
    addEventListener(name, fn) { ready = fn; }
  } });
  ready();
  return { elements, body, get value() { return value; },
    toggle(value) { elements.toggleState.checked = value; elements.toggleState.events.change(); },
    repair() { readError = false; writeError = false; },
    retry() { elements.retry.events.click(); },
    external(value, area = 'local') { listener({ autoTheaterEnabled: { newValue: value } }, area); }
  };
}
test('loads saved state and gives the switch a working on/off flow', () => {
  const h = harness(); assert.equal(h.elements.toggleState.checked, true);
  h.toggle(false); assert.equal(h.value, false); assert.equal(h.body.dataset.enabled, 'false');
  assert.match(h.elements.behavior.textContent, /current view stays/);
  h.toggle(true); assert.equal(h.value, true); assert.equal(h.elements.toggleState.disabled, false);
});
test('failed save rolls back visible state and can be retried', () => {
  const h = harness({ writeError: true }); h.toggle(false);
  assert.equal(h.elements.toggleState.checked, true); assert.equal(h.elements.retry.hidden, false);
  assert.equal(h.value, true); h.repair(); h.retry(); assert.equal(h.value, false);
  assert.equal(h.elements.retry.hidden, true);
});
test('failed read disables the switch until a successful retry', () => {
  const h = harness({ readError: true }); assert.equal(h.elements.toggleState.disabled, true);
  assert.equal(h.elements.retry.hidden, false); h.repair(); h.retry();
  assert.equal(h.elements.toggleState.disabled, false);
});
test('local external updates synchronize the popup but sync-area updates do not', () => {
  const h = harness(); h.external(false, 'sync'); assert.equal(h.elements.toggleState.checked, true);
  h.external(false); assert.equal(h.elements.toggleState.checked, false);
});
