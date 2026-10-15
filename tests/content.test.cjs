'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../extension/content.js'), 'utf8');

function harness(options = {}) {
  let now = 0, nextTimer = 0, clicks = 0, state = options.enabled ?? true;
  const timers = new Map(), listeners = {}, mutations = [];
  const attrs = new Map([['video-id', 'first']]);
  const classes = new Set();
  const runtime = {};
  let rendered = options.rendered !== false, control = options.control !== false;
  const location = { href: options.url || 'https://www.youtube.com/watch?v=first' };
  const button = { disabled: false, getAttribute: () => null, getClientRects: () => options.hiddenButton ? [] : [{}], click() {
    clicks++;
    if (!options.inert) {
      if (attrs.has('theater')) attrs.delete('theater'); else attrs.set('theater', '');
    }
  } };
  const player = { classList: { contains: key => classes.has(key) }, querySelector: () => control ? button : null };
  const watch = { hidden: false, hasAttribute: key => attrs.has(key), getAttribute: key => attrs.get(key) ?? null, querySelector: () => player };
  const document = {
    documentElement: options.earlyDocument ? null : {}, fullscreenElement: null, hidden: false,
    querySelector: () => rendered ? watch : null,
    addEventListener: (name, fn) => { listeners[name] = fn; }
  };
  const window = { addEventListener: (name, fn) => { listeners[name] = fn; } };
  let storageListener, readCallback;
  const chrome = { runtime, storage: {
    local: { get(defaults, callback) { readCallback = callback; if (!options.deferRead) callback({ autoTheaterEnabled: state }); } },
    onChanged: { addListener(fn) { storageListener = fn; } }
  } };
  vm.runInNewContext(source, {
    chrome, window, document, location, URL,
    Date: { now: () => now },
    setTimeout(fn, ms) { const id = ++nextTimer; timers.set(id, { fn, time: now + ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
    MutationObserver: class {
      constructor(fn) { this.fn = fn; mutations.push(this); }
      observe(target) {
        if (!target || typeof target !== 'object') throw new TypeError('Expected a Node');
        this.active = true;
      }
      disconnect() { this.active = false; }
    }
  });
  return {
    attrs, classes, document, watch, button, runtime, timers,
    get clicks() { return clicks; },
    get observing() { return mutations.some(m => m.active); },
    event(name, event = {}) { listeners[name](event); },
    change(value, area = 'local') { state = value; storageListener({ autoTheaterEnabled: { newValue: value } }, area); },
    read(value) { readCallback({ autoTheaterEnabled: value }); },
    navigate(id) { listeners['yt-navigate-start'](); location.href = `https://www.youtube.com/watch?v=${id}`; listeners['yt-navigate-finish'](); },
    render(value = true) { rendered = value; },
    controls(value = true) { control = value; },
    mutate() { for (const m of mutations) if (m.active) m.fn(); },
    tick(ms) {
      const target = now + ms;
      for (let guard = 0; guard < 1000; guard++) {
        const next = [...timers.entries()].filter(([, t]) => t.time <= target).sort((a, b) => a[1].time - b[1].time)[0];
        if (!next) break;
        now = next[1].time; timers.delete(next[0]); next[1].fn();
      }
      now = target;
    }
  };
}

test('default preference enters theater once and releases resources', () => {
  const h = harness(); assert.equal(h.clicks, 1); assert(h.attrs.has('theater'));
  assert.equal(h.observing, false); assert.equal(h.timers.size, 0);
});
test('disabled preference leaves the player alone, enabling acts immediately', () => {
  const h = harness({ enabled: false }); assert.equal(h.clicks, 0);
  h.change(true); assert.equal(h.clicks, 1);
  h.change(false); assert(h.attrs.has('theater'));
});
test('delayed controls activate on DOM delivery without waiting for the retry timer', () => {
  const h = harness({ rendered: false, control: false }); h.tick(1200);
  h.render(); h.mutate(); assert.equal(h.clicks, 0);
  h.controls(); h.mutate(); assert.equal(h.clicks, 1);
  assert.equal(h.observing, false); assert.equal(h.timers.size, 0);
});
test('can start before the document root exists and detect the first player', () => {
  const h = harness({ earlyDocument: true, rendered: false });
  assert.equal(h.clicks, 0); assert.equal(h.observing, true);
  h.document.documentElement = {}; h.render(); h.mutate();
  assert.equal(h.clicks, 1); assert.equal(h.observing, false);
});
test('a disabled control activates as soon as it becomes enabled', () => {
  const h = harness({ enabled: false }); h.button.disabled = true;
  h.change(true); assert.equal(h.clicks, 0);
  h.button.disabled = false; h.mutate(); assert.equal(h.clicks, 1);
});
test('frequent DOM changes do not bypass click settling or duplicate activation', () => {
  const h = harness({ inert: true }); assert.equal(h.clicks, 1);
  for (let i = 0; i < 50; i++) { h.mutate(); h.tick(10); }
  assert.equal(h.clicks, 1);
  h.attrs.set('theater', ''); h.mutate();
  assert.equal(h.observing, false); assert.equal(h.timers.size, 0);
  h.mutate(); h.tick(2000); assert.equal(h.clicks, 1);
});
test('does not toggle a video that is already in theater mode', () => {
  const h = harness({ enabled: false }); h.attrs.set('theater', ''); h.change(true);
  assert.equal(h.clicks, 0);
});
test('respects manual exit and repeated navigation events for the same video', () => {
  const h = harness(); h.attrs.delete('theater');
  h.event('yt-navigate-finish'); h.event('visibilitychange'); h.tick(1000);
  assert.equal(h.clicks, 1); assert(!h.attrs.has('theater'));
});
test('new SPA video waits for matching DOM and activates', () => {
  const h = harness(); h.attrs.delete('theater'); h.navigate('second'); h.tick(500);
  assert.equal(h.clicks, 1);
  h.attrs.set('video-id', 'second'); h.mutate();
  assert.equal(h.clicks, 2);
});
test('shorts and non-watch routes are ignored', () => {
  for (const url of ['https://www.youtube.com/', 'https://www.youtube.com/shorts/first', 'https://www.youtube.com/embed/first', 'https://www.youtube.com/watch']) {
    const h = harness({ url }); h.tick(1000); assert.equal(h.clicks, 0); assert.equal(h.observing, false);
  }
});
test('fullscreen is preserved, then exit can resume a timed-out attempt', () => {
  const h = harness({ enabled: false }); h.document.fullscreenElement = {};
  h.change(true); h.tick(21000); assert.equal(h.clicks, 0); assert.equal(h.observing, false);
  h.document.fullscreenElement = null; h.event('fullscreenchange'); assert.equal(h.clicks, 1);
});
test('mini player and invisible controls are not clicked', () => {
  const h = harness({ enabled: false }); h.classes.add('ytp-player-minimized');
  h.change(true); h.tick(1000); assert.equal(h.clicks, 0);
  h.classes.clear(); h.tick(250); assert.equal(h.clicks, 1);
  const hidden = harness({ hiddenButton: true }); hidden.tick(21000); assert.equal(hidden.clicks, 0);
});
test('inert controls have a bounded click count and release resources', () => {
  const h = harness({ inert: true }); h.tick(21000);
  assert.equal(h.clicks, 3); assert.equal(h.observing, false); assert.equal(h.timers.size, 0);
});
test('missing player times out instead of observing forever', () => {
  const h = harness({ rendered: false }); h.tick(21000);
  assert.equal(h.clicks, 0); assert.equal(h.observing, false); assert.equal(h.timers.size, 0);
});
test('turning off cancels delayed activation', () => {
  const h = harness({ rendered: false }); h.change(false); h.render(); h.tick(1000);
  assert.equal(h.clicks, 0); assert.equal(h.observing, false);
});
test('ignores changes in other storage areas', () => {
  const h = harness({ enabled: false }); h.change(true, 'sync'); assert.equal(h.clicks, 0);
});
test('late initial storage read cannot overwrite a newer off setting', () => {
  const h = harness({ deferRead: true }); h.change(false); h.read(true); assert.equal(h.clicks, 0);
});
test('storage read failure fails closed', () => {
  const h = harness({ deferRead: true }); h.runtime.lastError = { message: 'Unavailable' };
  h.read(true); assert.equal(h.clicks, 0);
});
test('pagehide disconnects observer and cancels pending work', () => {
  const h = harness({ rendered: false }); h.event('pagehide');
  assert.equal(h.observing, false); assert.equal(h.timers.size, 0);
});
test('re-enabling explicitly applies theater again on the current video', () => {
  const h = harness(); h.attrs.delete('theater'); h.change(false); h.change(true);
  assert.equal(h.clicks, 2);
});
