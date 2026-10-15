'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('toggleState');
  const stateText = document.getElementById('stateText');
  const behavior = document.getElementById('behavior');
  const status = document.getElementById('saveStatus');
  const feedback = document.querySelector('.feedback');
  const retry = document.getElementById('retry');
  let saved = true;
  let pending = null;
  let revision = 0;

  function render(enabled) {
    checkbox.checked = enabled;
    document.body.dataset.enabled = String(enabled);
    stateText.textContent = enabled ? 'Enabled · ready for your next video' : 'Paused · you choose the view';
    behavior.textContent = enabled
      ? 'Automatically widen videos when they open.'
      : 'Automatic switching is off. Your current view stays as it is.';
  }

  function message(text, error = false) {
    status.textContent = text;
    feedback.dataset.error = String(error);
    retry.hidden = !error;
  }

  function load() {
    checkbox.disabled = true;
    message('Loading your setting…');
    const requestRevision = revision;
    chrome.storage.local.get({ autoTheaterEnabled: true }, result => {
      if (chrome.runtime.lastError) {
        message('Couldn’t load your setting.', true);
        return;
      }
      if (requestRevision === revision) saved = result.autoTheaterEnabled !== false;
      render(saved);
      checkbox.disabled = false;
      message('Changes save automatically.');
    });
  }

  function save(value) {
    const restoreFocus = document.activeElement === checkbox;
    pending = value;
    checkbox.disabled = true;
    render(value);
    message('Saving…');
    chrome.storage.local.set({ autoTheaterEnabled: value }, () => {
      if (chrome.runtime.lastError) {
        render(saved);
        checkbox.disabled = false;
        if (restoreFocus && document.activeElement === document.body) checkbox.focus();
        message('Couldn’t save. Your setting is unchanged.', true);
        return;
      }
      saved = value;
      pending = null;
      checkbox.disabled = false;
      if (restoreFocus && document.activeElement === document.body) checkbox.focus();
      render(saved);
      message('Saved on this device.');
    });
  }

  checkbox.addEventListener('change', () => save(checkbox.checked));
  retry.addEventListener('click', () => pending === null ? load() : save(pending));
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.autoTheaterEnabled) return;
    revision += 1;
    saved = changes.autoTheaterEnabled.newValue !== false;
    if (pending === null) render(saved);
  });
  load();
});
