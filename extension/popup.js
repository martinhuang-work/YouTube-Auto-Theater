'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const controls = {
    autoTheaterEnabled: document.getElementById('toggleState'),
    hideLiveChat: document.getElementById('hideChat')
  };
  const defaults = { autoTheaterEnabled: true, hideLiveChat: false };
  const stateText = document.getElementById('stateText');
  const chatStateText = document.getElementById('chatStateText');
  const behavior = document.getElementById('behavior');
  const status = document.getElementById('saveStatus');
  const feedback = document.querySelector('.feedback');
  const retry = document.getElementById('retry');
  const saved = { ...defaults };
  const revisions = { autoTheaterEnabled: 0, hideLiveChat: 0 };
  let pending = null;

  function normalize(key, value) {
    return key === 'autoTheaterEnabled' ? value !== false : value === true;
  }

  function disable(value) {
    for (const control of Object.values(controls)) control.disabled = value;
  }

  function render(values = saved) {
    for (const [key, control] of Object.entries(controls)) control.checked = values[key];
    document.body.dataset.enabled = String(values.autoTheaterEnabled);
    stateText.textContent = values.autoTheaterEnabled ? 'Enabled · ready for your next video' : 'Paused · you choose the view';
    behavior.textContent = values.autoTheaterEnabled
      ? 'Automatically widen videos when they open.'
      : 'Automatic switching is off. Your current view stays as it is.';
    chatStateText.textContent = values.hideLiveChat ? 'On · hidden when videos open' : 'Off · YouTube controls chat';
  }

  function message(text, error = false) {
    status.textContent = text;
    feedback.dataset.error = String(error);
    retry.hidden = !error;
  }

  function load() {
    disable(true);
    message('Loading your settings…');
    const requestRevisions = { ...revisions };
    chrome.storage.local.get(defaults, result => {
      if (chrome.runtime.lastError) {
        message('Couldn’t load your settings.', true);
        return;
      }
      for (const key of Object.keys(controls)) {
        if (requestRevisions[key] === revisions[key]) saved[key] = normalize(key, result[key]);
      }
      render();
      disable(false);
      message('Changes save automatically.');
    });
  }

  function save(key, value) {
    const control = controls[key];
    const restoreFocus = document.activeElement === control;
    pending = { key, value };
    disable(true);
    render({ ...saved, [key]: value });
    message('Saving…');
    // Write only the changed preference; never overwrite the other switch.
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        render();
        disable(false);
        if (restoreFocus && document.activeElement === document.body) control.focus();
        message('Couldn’t save. Your setting is unchanged.', true);
        return;
      }
      saved[key] = value;
      pending = null;
      disable(false);
      if (restoreFocus && document.activeElement === document.body) control.focus();
      render();
      message('Saved on this device.');
    });
  }

  for (const [key, control] of Object.entries(controls)) {
    control.addEventListener('change', () => save(key, control.checked));
  }
  retry.addEventListener('click', () => pending === null ? load() : save(pending.key, pending.value));
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    for (const key of Object.keys(controls)) {
      if (!changes[key]) continue;
      revisions[key] += 1;
      saved[key] = normalize(key, changes[key].newValue);
    }
    render(pending === null ? saved : { ...saved, [pending.key]: pending.value });
  });
  load();
});
