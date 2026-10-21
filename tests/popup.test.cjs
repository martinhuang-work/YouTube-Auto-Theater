'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../extension/popup.js'), 'utf8');
function harness({ value = true, hideChat = false, readError = false, writeError = false, deferRead = false, deferWrite = false } = {}) {
  let preferences = { autoTheaterEnabled: value, hideLiveChat: hideChat }, readCallback, writeCallback;
  const writes = [];
  const elements = {};
  for (const id of ['toggleState', 'hideChat', 'chatStateText', 'stateText', 'behavior', 'saveStatus', 'retry', 'feedback']) {
    elements[id] = { dataset: {}, events: {}, disabled: true, checked: false, hidden: true, addEventListener(name, fn) { this.events[name] = fn; } };
  }
  const body = { dataset: {} }, runtime = {};
  let listener, ready;
  const chrome = { runtime, storage: {
    local: {
      get(defaults, callback) {
        const snapshot = { ...preferences };
        readCallback = () => { runtime.lastError = readError ? {} : undefined; callback(snapshot); runtime.lastError = undefined; };
        if (!deferRead) readCallback();
      },
      set(data, callback) {
        writes.push({ ...data });
        writeCallback = () => {
          runtime.lastError = writeError ? {} : undefined;
          if (!writeError) preferences = { ...preferences, ...data };
          callback(); runtime.lastError = undefined;
        };
        if (!deferWrite) writeCallback();
      }
    }, onChanged: { addListener(fn) { listener = fn; } }
  } };
  vm.runInNewContext(source, { chrome, document: {
    body, getElementById: id => elements[id], querySelector: () => elements.feedback,
    addEventListener(name, fn) { ready = fn; }
  } });
  ready();
  return { elements, body, writes, get value() { return preferences.autoTheaterEnabled; }, get hideChat() { return preferences.hideLiveChat; },
    toggle(value) { elements.toggleState.checked = value; elements.toggleState.events.change(); },
    toggleChat(value) { elements.hideChat.checked = value; elements.hideChat.events.change(); },
    finishRead() { readCallback(); }, finishWrite() { writeCallback(); },
    repair() { readError = false; writeError = false; },
    retry() { elements.retry.events.click(); },
    external(value, area = 'local', key = 'autoTheaterEnabled') { listener({ [key]: { newValue: value } }, area); }
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

test('upgrading keeps chat visible until the viewer opts in', () => {
  const h = harness(); assert.equal(h.elements.hideChat.checked, false);
  h.toggleChat(true); assert.equal(h.hideChat, true); assert.equal(h.value, true);
  assert.deepEqual(h.writes, [{ hideLiveChat: true }]);
});
test('chat hiding remains independent when automatic theater is paused', () => {
  const h = harness({ value: false, hideChat: true });
  assert.equal(h.elements.hideChat.checked, true);
  h.toggleChat(false); assert.equal(h.hideChat, false); assert.equal(h.value, false);
});
test('a failed chat save rolls back and retries only the chat preference', () => {
  const h = harness({ writeError: true }); h.toggleChat(true);
  assert.equal(h.elements.hideChat.checked, false); assert.equal(h.elements.toggleState.checked, true);
  h.repair(); h.retry(); assert.equal(h.hideChat, true);
  assert.deepEqual(h.writes, [{ hideLiveChat: true }, { hideLiveChat: true }]);
});
test('both controls are disabled while loading or saving', () => {
  const h = harness({ deferRead: true, deferWrite: true });
  assert(h.elements.hideChat.disabled); assert(h.elements.toggleState.disabled);
  h.finishRead(); h.toggleChat(true);
  assert(h.elements.hideChat.disabled); assert(h.elements.toggleState.disabled);
  h.finishWrite(); assert(!h.elements.hideChat.disabled); assert(!h.elements.toggleState.disabled);
});
test('external chat changes synchronize and deletion restores the off default', () => {
  const h = harness(); h.external(true, 'local', 'hideLiveChat'); assert(h.elements.hideChat.checked);
  h.external(undefined, 'local', 'hideLiveChat'); assert(!h.elements.hideChat.checked);
});
test('a late read preserves newer chat state but still loads the other preference', () => {
  const h = harness({ value: false, deferRead: true }); h.external(true, 'local', 'hideLiveChat'); h.finishRead();
  assert(h.elements.hideChat.checked); assert(!h.elements.toggleState.checked);
});
