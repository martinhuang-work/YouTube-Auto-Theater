(() => {
  'use strict';

  // YouTube is a single-page app. Keep one bounded attempt per video, not a
  // permanent observer that fights a viewer's subsequent layout choices.
  const RETRY_MS = 250;
  const WAIT_MS = 20_000;
  const CLICK_SETTLE_MS = 1_000;
  const MAX_CLICKS = 3;
  let enabled = false;
  let videoId = null;
  let completed = false;
  let navigating = false;
  let observer = null;
  let timer = null;
  let deadline = 0;
  let lastClick = -Infinity;
  let clicks = 0;
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

  function finish() {
    completed = true;
    stop();
  }

  function schedule() {
    if (timer === null) timer = setTimeout(attempt, RETRY_MS);
  }

  function attempt() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (!enabled || navigating || completed || currentVideo() !== videoId) {
      stop();
      return;
    }
    if (Date.now() >= deadline) {
      stop();
      return;
    }

    const watch = document.querySelector('ytd-watch-flexy');
    const renderedVideo = watch?.getAttribute('video-id');
    const player = watch?.querySelector('#movie_player');
    // A previous video's DOM can still be present during navigation.
    if (!watch || watch.hidden || (renderedVideo && renderedVideo !== videoId) || !player) {
      schedule();
      return;
    }
    // Never toggle size from fullscreen or the mini player. Resume on exit.
    if (document.fullscreenElement || player.classList.contains('ytp-fullscreen') ||
        player.classList.contains('ytp-player-minimized') || watch.hasAttribute('miniplayer')) {
      schedule();
      return;
    }
    if (watch.hasAttribute('theater')) {
      finish();
      return;
    }
    if (Date.now() - lastClick < CLICK_SETTLE_MS) {
      schedule();
      return;
    }
    if (clicks >= MAX_CLICKS) {
      stop();
      return;
    }

    const button = player.querySelector('.ytp-size-button');
    if (button && !button.disabled && button.getAttribute('aria-disabled') !== 'true' &&
        button.getClientRects().length > 0) {
      // Record BEFORE click: DOM events may run synchronously from click().
      lastClick = Date.now();
      clicks += 1;
      button.click();
      if (watch.hasAttribute('theater')) {
        finish();
        return;
      }
    }
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
    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['theater', 'video-id', 'hidden']
    });
    attempt();
  }

  function setEnabled(value) {
    const nextEnabled = value !== false;
    const changed = enabled !== nextEnabled;
    enabled = nextEnabled;
    if (!enabled) stop();
    else if (changed) begin({ reset: true });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.autoTheaterEnabled) return;
    storageRevision += 1;
    setEnabled(changes.autoTheaterEnabled.newValue);
  });

  const initialRevision = storageRevision;
  chrome.storage.local.get({ autoTheaterEnabled: true }, result => {
    // Reading runtime.lastError also prevents an unhandled extension API error.
    if (chrome.runtime.lastError || initialRevision !== storageRevision) return;
    setEnabled(result.autoTheaterEnabled);
  });

  window.addEventListener('yt-navigate-start', () => {
    navigating = true;
    stop();
  });
  window.addEventListener('yt-navigate-finish', () => {
    navigating = false;
    begin();
  });
  window.addEventListener('popstate', () => {
    navigating = false;
    begin();
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !completed) begin();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !completed) begin();
  });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      navigating = false;
      begin();
    }
  });
})();
