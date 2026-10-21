# Chrome Web Store listing copy

## Name

YouTube Auto Theater Mode

## Summary (manifest description)

Open YouTube videos in theater mode and optionally hide live chat or chat replay. Preferences stay on your device.

## Detailed description

Give your videos a wider view without repeatedly clicking YouTube's theater button.

YouTube Auto Theater Mode opens standard desktop YouTube videos in theater mode automatically. Use the compact toolbar popup to enable or pause automatic switching, or optionally close live chat and chat replay to give the player more room.

Features:
- Automatically activates theater mode when you open a supported YouTube video.
- Handles navigation between videos and waits for delayed player controls.
- Adds an independent Hide live chat switch for live streams and chat replay. This option is off by default.
- Saves both on/off preferences on your device.
- Respects manual layout changes after activation for the current video.
- Includes keyboard-accessible controls and clear saved-state feedback.

Turning the switch off stops automatic switching; it leaves the current video layout as it is. Turning it on applies theater mode to eligible open YouTube watch tabs.

Turn Hide live chat on to close an eligible current chat and automatically close it on the next video. You can reopen chat manually using YouTube's own controls. Turning this preference off stops automatic closing; it does not force chat open. The two switches work independently.

Privacy:
- No analytics, advertising, accounts or tracking.
- No network requests or remote code from the extension.
- Only the two layout preferences are saved locally.
- The extension operates the native chat-close control without reading messages or participant information.

Designed for standard watch pages on the desktop YouTube website. It does not modify Shorts, embedded players, fullscreen or mini player. Player behavior can change when YouTube updates its website. Refresh existing YouTube tabs after installing the extension.

This is an independent extension and is not affiliated with or endorsed by YouTube or Google.

## Dashboard suggestions

- Language: English
- Category: choose the current category most appropriate for video viewing tools (for example, Entertainment, if offered).
- Homepage: https://github.com/martinhuang-work/YouTube-Auto-Theater
- Support: https://github.com/martinhuang-work/YouTube-Auto-Theater/issues
- Privacy policy: https://github.com/martinhuang-work/YouTube-Auto-Theater/blob/main/PRIVACY.md

## Single purpose

Customize the desktop YouTube viewing layout with automatic theater mode and optional live-chat or chat-replay closing, controlled by two locally saved preferences.

## Storage permission justification

Stores two boolean preferences locally: autoTheaterEnabled for automatic theater activation and hideLiveChat for optional live-chat/replay closing. This keeps the popup and YouTube content scripts consistent across tabs. No viewing history, chat messages or personal information is stored.

## YouTube site-access justification

The content scripts run on youtube.com and www.youtube.com to identify standard watch pages and operate YouTube's existing theater-size and chat-close controls. The chat-close control may be inside YouTube's same-origin chat header frame; messages and participant information are not read. Site-wide injection supports navigation from non-watch pages to watch pages without a full reload. It does not act on unrelated websites, Shorts or embedded players. Page URL/video identifiers and control state are processed only in memory and never transmitted.

## Remote code

Select: **No, I am not using remote code.** All executable code is bundled inside the extension.

## Data practices

The extension transmits no user data. Only two local boolean preferences are retained. It does not record browsing history, capture page or chat content, or log user activity. The privacy policy discloses transient local URL/player/control inspection as well as preference storage. Review the dashboard's current data-category wording and required certifications personally before submitting.

## Reviewer instructions

No account, payment or credentials are required by the extension. Install it, refresh/open a standard desktop YouTube `/watch?v=…` page, and verify theater mode activates. Toggle off: a newly opened watch video should not be automatically switched by the extension (YouTube may remember its own layout). Toggle on: an eligible open watch page should enter theater mode. After successful activation, manually exit theater mode and confirm the extension does not immediately force it back for that same video. Test navigation to another video. Fullscreen, Shorts and embedded videos should not be changed by the extension.

For version 1.2.0, open a live stream or replay with chat expanded and turn Hide live chat on. Verify chat collapses using YouTube's native control and the video can use the available width. Reopen chat manually: it should remain open for that video. Navigate to another eligible video: chat should close again. Turn Hide live chat off: chat should be left alone. This works with automatic theater paused too. Chat hiding is off by default and requires no new permissions.

## Asset files

| Dashboard field | File |
| --- | --- |
| Store icon, 128 × 128 | `icon128.png` |
| Screenshot, 1280 × 800 | `screenshot-enabled-1280x800.png` |
| Additional screenshot, 1280 × 800 | `screenshot-paused-1280x800.png` |
| Required small promotion tile, 440 × 280 | `promo-small-440x280.png` |
| Optional marquee, 1400 × 560 | `promo-marquee-1400x560.png` |

The screenshots present the actual rendered popup with an explanatory backdrop; they do not claim to depict a live YouTube page. See `ASSETS.md` for provenance.
