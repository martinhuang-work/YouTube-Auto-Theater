(() => {
  'use strict';

  // Use YouTube's native close control so it reclaims the chat column's width.
  // A separate preference leaves theater/manual layout choices alone.
  const RETRY_MS = 250;
  const WAIT_MS = 20_000;
  const CLICK_SETTLE_MS = 1_000;
  const MAX_CLICKS = 3;
  let enabled = false, videoId = null, completed = false, navigating = false;
  let observer = null, timer = null, deadline = 0, lastClick = -Infinity, clicks = 0;
  let storageRevision = 0;

  function currentVideo() {
    const url = new URL(location.href);
    return url.pathname === '/watch' ? url.searchParams.get('v') : null;
  }

  function stop() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    observer?.disconnect();
    observer = null;
  }

  function schedule() {
    if (timer === null) timer = setTimeout(attempt, RETRY_MS);
  }

  function usable(button) {
    return button && !button.disabled && button.getAttribute('aria-disabled') !== 'true' &&
      button.getClientRects().length > 0;
  }

  function closeControl(chat) {
    // Older layout: a visible outer toggle. Never click a hidden "Show chat".
    const outer = chat.querySelector('#show-hide-button button');
    if (usable(outer)) return outer;
    // Current layout: the close control is in the same-origin chat header.
    // Read only that control, never messages or participant information.
    try {
      const frame = chat.querySelector('iframe#chatframe');
      const close = frame?.contentDocument?.querySelector('yt-live-chat-header-renderer #close-button button');
      return usable(close) ? close : null;
    } catch {
      // An inaccessible or not-yet-loaded frame is not ours to reach into.
      return null;
    }
  }

  function attempt() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (!enabled || navigating || completed || currentVideo() !== videoId || Date.now() >= deadline) {
      stop();
      return;
    }
    const watch = document.querySelector('ytd-watch-flexy');
    const renderedVideo = watch?.getAttribute('video-id');
    const player = watch?.querySelector('#movie_player');
    const chat = watch?.querySelector('ytd-live-chat-frame#chat');
    if (!watch || watch.hidden || (renderedVideo && renderedVideo !== videoId) || !player ||
        document.fullscreenElement || player.classList.contains('ytp-fullscreen') ||
        player.classList.contains('ytp-player-minimized') || watch.hasAttribute('miniplayer') || !chat) {
      schedule();
      return;
    }
    if (chat.hasAttribute('collapsed')) {
      completed = true;
      stop();
      return;
    }
    if (chat.hidden || chat.getClientRects().length === 0 || Date.now() - lastClick < CLICK_SETTLE_MS) {
      schedule();
      return;
    }
    if (clicks >= MAX_CLICKS) {
      stop();
      return;
    }
    const button = closeControl(chat);
    if (button) {
      lastClick = Date.now();
      clicks += 1;
      button.click();
      if (chat.hasAttribute('collapsed')) {
        completed = true;
        stop();
        return;
      }
    }
    // Covers iframe initialization, which the outer observer cannot see.
    schedule();
  }

  function begin({ reset = false } = {}) {
    const nextVideo = currentVideo();
    if (nextVideo !== videoId || reset) {
      completed = false;
      videoId = nextVideo;
    }
    stop();
    if (!enabled || !videoId || completed || navigating) return;
    deadline = Date.now() + WAIT_MS;
    lastClick = -Infinity;
    clicks = 0;
    observer = new MutationObserver(attempt);
    observer.observe(document, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['collapsed', 'video-id', 'hidden', 'disabled', 'aria-disabled']
    });
    attempt();
  }

  function setEnabled(value) {
    const next = value === true;
    const changed = enabled !== next;
    enabled = next;
    if (!enabled) stop();
    else if (changed) begin({ reset: true });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.hideLiveChat) return;
    storageRevision += 1;
    setEnabled(changes.hideLiveChat.newValue);
  });
  const initialRevision = storageRevision;
  chrome.storage.local.get({ hideLiveChat: false }, result => {
    if (chrome.runtime.lastError || initialRevision !== storageRevision) return;
    setEnabled(result.hideLiveChat);
  });

  window.addEventListener('yt-navigate-start', () => { navigating = true; stop(); });
  window.addEventListener('yt-navigate-finish', () => { navigating = false; begin(); });
  window.addEventListener('popstate', () => { navigating = false; begin(); });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !completed) begin();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !completed) begin();
  });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', event => {
    if (event.persisted) { navigating = false; begin(); }
  });
})();
