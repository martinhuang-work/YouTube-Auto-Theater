'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../extension/chat.js'), 'utf8');

function harness(options = {}) {
  let now = 0, nextTimer = 0, clicks = 0, outerClicks = 0;
  const timers = new Map(), listeners = {}, observers = [];
  const attrs = new Map([['video-id', 'first']]), chatAttrs = new Set();
  if (options.collapsed) chatAttrs.add('collapsed');
  const classes = new Set(), runtime = {};
  let rendered = options.rendered !== false, chatPresent = options.chat !== false;
  let frameReady = options.frameReady !== false;
  const location = { href: options.url || 'https://www.youtube.com/watch?v=first' };
  const close = {
    disabled: false, getAttribute: () => null, getClientRects: () => [{}],
    click() { clicks++; if (!options.inert) chatAttrs.add('collapsed'); }
  };
  const outer = { ...close, getClientRects: () => options.legacy ? [{}] : [], click() { outerClicks++; close.click(); } };
  const frame = { get contentDocument() {
    if (options.crossOrigin) throw new Error('SecurityError');
    return frameReady ? { querySelector(selector) {
      assert.equal(selector, 'yt-live-chat-header-renderer #close-button button');
      return close;
    } } : null;
  } };
  const chat = {
    hidden: false, hasAttribute: name => chatAttrs.has(name), getClientRects: () => [{}],
    querySelector: selector => selector === '#show-hide-button button' ? outer : frame
  };
  const player = { classList: { contains: name => classes.has(name) } };
  const watch = { hidden: false, hasAttribute: name => attrs.has(name), getAttribute: name => attrs.get(name) ?? null,
    querySelector: selector => selector === '#movie_player' ? player : chatPresent ? chat : null };
  const document = { fullscreenElement: null, hidden: false, querySelector: () => rendered ? watch : null,
    addEventListener(name, fn) { listeners[name] = fn; } };
  let readCallback, storageListener;
  const chrome = { runtime, storage: {
    local: { get(defaults, callback) {
      assert.equal(defaults.hideLiveChat, false);
      readCallback = callback; if (!options.deferRead) callback({ hideLiveChat: options.enabled === true });
    } },
    onChanged: { addListener(fn) { storageListener = fn; } }
  } };
  vm.runInNewContext(source, {
    document, chrome, location, URL, window: { addEventListener(name, fn) { listeners[name] = fn; } },
    Date: { now: () => now }, setTimeout(fn, ms) { const id = ++nextTimer; timers.set(id, { fn, time: now + ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
    MutationObserver: class {
      constructor(fn) { this.fn = fn; observers.push(this); }
      observe(target) { assert.equal(target, document); this.active = true; }
      disconnect() { this.active = false; }
    }
  });
  return {
    attrs, chatAttrs, chat, close, document, classes, runtime, timers,
    get clicks() { return clicks; }, get outerClicks() { return outerClicks; },
    get observing() { return observers.some(o => o.active); },
    change(value, area = 'local', key = 'hideLiveChat') { storageListener({ [key]: { newValue: value } }, area); },
    read(value) { readCallback({ hideLiveChat: value }); },
    mutate() { for (const observer of observers) if (observer.active) observer.fn(); },
    event(name, value = {}) { listeners[name](value); },
    renderChat() { chatPresent = true; }, readyFrame() { frameReady = true; },
    navigate(id) { listeners['yt-navigate-start'](); location.href = 'https://www.youtube.com/watch?v=' + id; listeners['yt-navigate-finish'](); },
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

test('chat remains untouched by default, including upgrades with no saved setting', () => {
  const h = harness(); assert.equal(h.clicks, 0); assert(!h.observing); assert.equal(h.timers.size, 0);
});
test('current chat header closes once without clicking the hidden outer Show button', () => {
  const h = harness({ enabled: true }); assert.equal(h.clicks, 1); assert.equal(h.outerClicks, 0);
  assert(h.chatAttrs.has('collapsed')); assert(!h.observing); assert.equal(h.timers.size, 0);
});
test('legacy outer Hide chat control is supported', () => {
  const h = harness({ enabled: true, legacy: true }); assert.equal(h.clicks, 1); assert.equal(h.outerClicks, 1);
});
test('already collapsed chat is never opened', () => {
  const h = harness({ enabled: true, collapsed: true }); assert.equal(h.clicks, 0); assert(!h.observing);
});
test('manual reopening remains respected for the current video', () => {
  const h = harness({ enabled: true }); h.chatAttrs.delete('collapsed'); h.mutate(); h.event('yt-navigate-finish');
  h.event('visibilitychange'); h.tick(2000); assert.equal(h.clicks, 1); assert(!h.chatAttrs.has('collapsed'));
});
test('enabling acts now; disabling does not reopen chat', () => {
  const h = harness(); h.change(true); assert.equal(h.clicks, 1);
  h.change(false); assert(h.chatAttrs.has('collapsed')); assert(!h.observing);
});
test('turning chat hiding off and on reapplies it without changing theater', () => {
  const h = harness({ enabled: true }); h.chatAttrs.delete('collapsed'); h.change(false); h.change(true);
  assert.equal(h.clicks, 2); assert(!h.attrs.has('theater'));
});
test('delayed chat and iframe controls are found after theater could already be complete', () => {
  const h = harness({ enabled: true, chat: false, frameReady: false }); h.tick(500);
  h.renderChat(); h.mutate(); assert.equal(h.clicks, 0);
  h.readyFrame(); h.tick(250); assert.equal(h.clicks, 1);
});
test('navigation waits for the new watch DOM before closing its chat', () => {
  const h = harness({ enabled: true }); h.chatAttrs.delete('collapsed'); h.navigate('second'); h.tick(500);
  assert.equal(h.clicks, 1); h.attrs.set('video-id', 'second'); h.mutate(); assert.equal(h.clicks, 2);
});
test('normal videos without chat time out and release all resources', () => {
  const h = harness({ enabled: true, chat: false }); h.tick(21000);
  assert.equal(h.clicks, 0); assert(!h.observing); assert.equal(h.timers.size, 0);
});
test('Shorts, embedded players and non-watch pages are ignored', () => {
  for (const route of ['/', '/shorts/first', '/embed/first', '/watch']) {
    const h = harness({ enabled: true, url: 'https://www.youtube.com' + route });
    assert.equal(h.clicks, 0); assert(!h.observing);
  }
});
test('fullscreen and mini player are preserved', () => {
  const h = harness(); h.document.fullscreenElement = {}; h.change(true); h.tick(21000); assert.equal(h.clicks, 0);
  h.document.fullscreenElement = null; h.classes.add('ytp-player-minimized'); h.event('fullscreenchange');
  h.tick(500); assert.equal(h.clicks, 0); h.classes.clear(); h.tick(250); assert.equal(h.clicks, 1);
});
test('hidden chat and disabled close controls are not clicked', () => {
  const h = harness(); h.chat.hidden = true; h.change(true); h.tick(500); assert.equal(h.clicks, 0);
  h.chat.hidden = false; h.close.disabled = true; h.mutate(); assert.equal(h.clicks, 0);
  h.close.disabled = false; h.tick(250); assert.equal(h.clicks, 1);
});
test('inaccessible iframe fails closed with bounded waiting', () => {
  const h = harness({ enabled: true, crossOrigin: true }); h.tick(21000);
  assert.equal(h.clicks, 0); assert(!h.observing); assert.equal(h.timers.size, 0);
});
test('inert controls cannot trigger unbounded clicks during mutation bursts', () => {
  const h = harness({ enabled: true, inert: true });
  for (let i = 0; i < 50; i++) { h.mutate(); h.tick(10); }
  assert.equal(h.clicks, 1); h.tick(21000); assert.equal(h.clicks, 3); assert(!h.observing);
});
test('disabling and pagehide cancel pending chat work', () => {
  const h = harness({ enabled: true, chat: false }); h.change(false); h.renderChat(); h.tick(1000);
  assert.equal(h.clicks, 0); assert(!h.observing);
  const page = harness({ enabled: true, chat: false }); page.event('pagehide');
  assert(!page.observing); assert.equal(page.timers.size, 0);
});
test('theater preference and sync storage updates cannot enable chat hiding', () => {
  const h = harness(); h.change(true, 'sync'); h.change(true, 'local', 'autoTheaterEnabled'); assert.equal(h.clicks, 0);
});
test('stale reads and storage errors cannot unexpectedly close chat', () => {
  const h = harness({ deferRead: true }); h.change(false); h.read(true); assert.equal(h.clicks, 0);
  const broken = harness({ deferRead: true }); broken.runtime.lastError = {}; broken.read(true); assert.equal(broken.clicks, 0);
});
