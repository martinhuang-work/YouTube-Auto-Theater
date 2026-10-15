# Chrome Web Store listing copy

## Name

YouTube Auto Theater Mode

## Summary (manifest description)

Open YouTube videos in theater mode automatically. One switch, saved locally, with no tracking.

## Detailed description

Give your videos a wider view without repeatedly clicking YouTube's theater button.

YouTube Auto Theater Mode opens standard desktop YouTube videos in theater mode automatically. Use the compact toolbar popup to enable or pause automatic switching whenever you like.

Features:
- Automatically activates theater mode when you open a supported YouTube video.
- Handles navigation between videos and waits for delayed player controls.
- Saves one on/off preference on your device.
- Respects manual layout changes after activation for the current video.
- Includes keyboard-accessible controls and clear saved-state feedback.

Turning the switch off stops automatic switching; it leaves the current video layout as it is. Turning it on applies theater mode to eligible open YouTube watch tabs.

Privacy:
- No analytics, advertising, accounts or tracking.
- No network requests or remote code from the extension.
- Only the enabled/paused preference is saved locally.

Designed for standard watch pages on the desktop YouTube website. It does not modify Shorts, embedded players, fullscreen or mini player. Player behavior can change when YouTube updates its website. Refresh existing YouTube tabs after installing the extension.

This is an independent extension and is not affiliated with or endorsed by YouTube or Google.

## Dashboard suggestions

- Language: English
- Category: choose the current category most appropriate for video viewing tools (for example, Entertainment, if offered).
- Homepage: https://github.com/martinhuang-work/YouTube-Auto-Theater
- Support: https://github.com/martinhuang-work/YouTube-Auto-Theater/issues
- Privacy policy: https://github.com/martinhuang-work/YouTube-Auto-Theater/blob/main/PRIVACY.md

## Single purpose

Automatically activate theater mode on supported desktop YouTube watch pages, with a locally saved on/off preference.

## Storage permission justification

Stores the user's single autoTheaterEnabled boolean preference locally so the popup and YouTube content scripts can consistently enable or pause automatic theater activation. No viewing history or other personal data is stored.

## YouTube site-access justification

The content script runs on youtube.com and www.youtube.com to identify standard watch pages and operate YouTube's existing theater-size button. Site-wide injection on these two hosts supports YouTube's navigation from non-watch pages to watch pages without a full page reload. It does not act on unrelated websites, Shorts or embedded players. Page URL/video identifiers and player state are processed only in memory and never transmitted.

## Remote code

Select: **No, I am not using remote code.** All executable code is bundled inside the extension.

## Data practices

The extension collects or transmits no user data. The only retained item is a local boolean preference. Select no collected data categories for this behavior, and review the dashboard's required certifications personally before submitting. The privacy policy explains the local page inspection and preference storage.

## Reviewer instructions

No account, payment or credentials are required by the extension. Install it, refresh/open a standard desktop YouTube `/watch?v=…` page, and verify theater mode activates. Toggle off: a newly opened watch video should not be automatically switched by the extension (YouTube may remember its own layout). Toggle on: an eligible open watch page should enter theater mode. After successful activation, manually exit theater mode and confirm the extension does not immediately force it back for that same video. Test navigation to another video. Fullscreen, Shorts and embedded videos should not be changed by the extension.

## Asset files

| Dashboard field | File |
| --- | --- |
| Store icon, 128 × 128 | `icon128.png` |
| Screenshot, 1280 × 800 | `screenshot-enabled-1280x800.png` |
| Additional screenshot, 1280 × 800 | `screenshot-paused-1280x800.png` |
| Required small promotion tile, 440 × 280 | `promo-small-440x280.png` |
| Optional marquee, 1400 × 560 | `promo-marquee-1400x560.png` |

The screenshots present the actual rendered popup with an explanatory backdrop; they do not claim to depict a live YouTube page. See `ASSETS.md` for provenance.
