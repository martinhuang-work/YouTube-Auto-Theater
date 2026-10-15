# Validation and release checklist

## Automated regression coverage

Run `npm run check` and `npm test`. The suite covers default activation, disabled state, delayed rendering, an already-wide player, manual override, SPA navigation with obsolete DOM, non-watch routes, fullscreen exit, mini player, hidden controls, bounded retries, timeout cleanup, cancellation, storage-area filtering, stale reads, storage errors, page cleanup, re-enabling, popup persistence and failed-save rollback/retry.

The tests exercise the real shipped scripts in deterministic DOM/storage fixtures. They do not contact YouTube or inspect a real installed browser extension.

## Current validation record

- 21 automated regression tests passed locally on October 15, 2026.
- Manifest, local resources, JavaScript syntax and all four PNG sizes passed validation.
- Upload ZIP generated successfully with ten extension-only files and a SHA-256 checksum.
- Popup rendered at its 336px width in the browser; enabled, paused, keyboard-focus and storage-error states were inspected. Keyboard toggle, failed-save rollback, retry and focus restoration passed using a development-only storage adapter. The independent design review returned `ship` for the popup scope.
- **Actual unpacked-extension testing on live YouTube in Chrome remains a release check.** No store approval is claimed.

## Manual Chrome release checklist

- [ ] Load `extension/` unpacked in Chrome. Confirm no manifest or extension console errors.
- [ ] Refresh a normal YouTube watch page. Start with theater mode off; verify it becomes wide.
- [ ] Load a video already in theater mode; verify it stays wide.
- [ ] Navigate from Home/search to a video, and from one video to another, without a page reload.
- [ ] Use browser Back/Forward between videos.
- [ ] Test a slow network or delayed player controls.
- [ ] After automatic activation, manually leave theater mode. It should stay in your chosen layout for that video.
- [ ] Disable the extension setting. Verify the current layout does not change. Open another video in a default view and confirm the extension does not change it. YouTube itself may remember a previous layout.
- [ ] Re-enable while a watch tab is open; confirm an eligible player enters theater mode.
- [ ] Open multiple YouTube tabs and verify the single saved preference applies consistently.
- [ ] Close/reopen the popup and restart Chrome; confirm the preference persists.
- [ ] Enter fullscreen; ensure the extension does not exit it. Check behavior after leaving fullscreen.
- [ ] Check Shorts, mini player and an embedded video; confirm no unintended control clicks.
- [ ] Tab to the popup switch and press Space. Check the focus ring, readout and saved feedback.
- [ ] Test reduced motion, browser zoom and a screen reader if available.
- [ ] Review the final upload ZIP and store assets against the current store requirements.

## Known limits

YouTube's internal selectors/events can change or vary by experiment. The implementation uses `ytd-watch-flexy[theater]` as the theater-state signal and `.ytp-size-button` inside `#movie_player` as the control. It does not inspect YouTube's private JavaScript objects. If a player takes more than 20 seconds to become ready, focus the tab again or switch the preference off/on to retry. Browser site-access restrictions and other layout extensions can prevent or interfere with activation.
