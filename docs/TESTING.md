# Validation and release checklist

## Automated regression coverage

Run `npm run check` and `npm test`. The suite covers default activation, disabled state, immediate reaction to delayed rendering, startup before the document root exists, controls becoming enabled, mutation bursts, an already-wide player, manual override, SPA navigation with obsolete DOM, non-watch routes, fullscreen exit, mini player, hidden controls, bounded retries, timeout cleanup, cancellation, storage-area filtering, stale reads, storage errors, page cleanup, re-enabling, popup persistence and failed-save rollback/retry.

The tests exercise the real shipped scripts in deterministic DOM/storage fixtures. They do not contact YouTube or inspect a real installed browser extension.

## Current validation record

- 48 automated regression tests passed locally for version 1.2.0 on October 21, 2026. Chat cases cover default-off upgrades, both native control layouts, delayed frame loading, manual reopening, independent settings, navigation, fullscreen, inaccessible frames, bounded retries, stale storage reads, cancellation and popup rollback/retry.
- Manifest, local resources, JavaScript syntax and all four PNG sizes passed validation.
- Upload ZIP contains eleven extension-only files and a SHA-256 checksum.
- Popup rendered at its 336px width in the browser; enabled, paused, keyboard-focus and storage-error states were inspected. Keyboard toggle, failed-save rollback, retry and focus restoration passed using a development-only storage adapter. The independent design review returned `ship` for the popup scope.
- The owner reported that version 1.1.0 works in local Chrome, with a noticeable delay before the layout changes. Version 1.1.1 starts earlier and removes the extra timer wait after observed DOM changes. Its timing improvements are covered by fixtures but have not been measured on live YouTube.
- On October 21, the supplied replay `https://www.youtube.com/watch?v=E9QxBi0vnp4` was inspected in the browser. The current layout's close button is `yt-live-chat-header-renderer #close-button button` inside `iframe#chatframe`; the older outer Show/Hide button was hidden. Activating the native close button collapsed `ytd-live-chat-frame#chat` and expanded the theater player from approximately 921px to 1265px in that viewport. This verifies the native control and layout effect, not execution of an installed extension.
- The updated popup was inspected at 336px width in enabled, paused, keyboard-focus and save-error states using the development storage adapter. Space toggling, rollback and retry passed. The fresh design review returned `ship` for the popup scope.
- **The complete live YouTube checklist, including loading version 1.2.0 as an actual Chrome extension, remains a release check.** No store approval is claimed.

## Manual Chrome release checklist

- [ ] Load `extension/` unpacked in Chrome. Confirm no manifest or extension console errors.
- [ ] Refresh a normal YouTube watch page. Start with theater mode off; verify it becomes wide.
- [ ] Load a video already in theater mode; verify it stays wide.
- [ ] Navigate from Home/search to a video, and from one video to another, without a page reload.
- [ ] Use browser Back/Forward between videos.
- [ ] Test a slow network or delayed player controls.
- [ ] Compare first-load and video-to-video layout timing after reloading the current version. Record separately any initial narrow-to-wide transition and any later wide-to-narrow reset by YouTube.
- [ ] After automatic activation, manually leave theater mode. It should stay in your chosen layout for that video.
- [ ] Disable the extension setting. Verify the current layout does not change. Open another video in a default view and confirm the extension does not change it. YouTube itself may remember a previous layout.
- [ ] Re-enable while a watch tab is open; confirm an eligible player enters theater mode.
- [ ] Open multiple YouTube tabs and verify both saved preferences apply consistently.
- [ ] Close/reopen the popup and restart Chrome; confirm the preference persists.
- [ ] Enter fullscreen; ensure the extension does not exit it. Check behavior after leaving fullscreen.
- [ ] Check Shorts, mini player and an embedded video; confirm no unintended control clicks.
- [ ] Tab to the popup switch and press Space. Check the focus ring, readout and saved feedback.
- [ ] Test reduced motion, browser zoom and a screen reader if available.
- [ ] Review the final upload ZIP and store assets against the current store requirements.

## Chat-option release checks

- [ ] Upgrade from 1.1.1: theater preference stays unchanged, Hide live chat is off.
- [ ] With chat expanded on the supplied replay, enable Hide live chat: chat closes and theater uses the available width.
- [ ] Repeat with an active live stream and an ordinary video with no chat.
- [ ] Navigate to a second replay without reloading; its chat should close once when ready.
- [ ] Reopen chat manually; it should remain open on that video.
- [ ] Turn Hide live chat off; current chat state stays as it is and later chat is left alone.
- [ ] Pause automatic theater mode and enable Hide live chat; chat still closes independently.
- [ ] Reload a watch page with both settings on; delayed player/chat controls should still work.
- [ ] Confirm no extension errors, messages read, or unintended fullscreen/mini-player changes.

## Known limits

YouTube's internal selectors/events can change or vary by experiment. The implementation uses `ytd-watch-flexy[theater]` as the theater-state signal and `.ytp-size-button` inside `#movie_player` as the control. It does not inspect YouTube's private JavaScript objects. If a player takes more than 20 seconds to become ready, focus the tab again or switch the preference off/on to retry. Browser site-access restrictions and other layout extensions can prevent or interfere with activation.
