# Privacy policy

**YouTube Auto Theater Mode · Effective October 21, 2026**

YouTube Auto Theater Mode automatically activates theater mode on supported desktop YouTube watch pages and can optionally close live chat or chat replay. It is maintained by [martinhuang-work](https://github.com/martinhuang-work).

## What is stored

The extension saves two true/false preferences in Chrome's local extension storage: `autoTheaterEnabled` (default true) and `hideLiveChat` (default false). These control automatic theater activation and optional chat closing. Existing theater preferences survive an upgrade, and chat closing requires opting in. Neither preference is synchronized by the extension or sent to the developer or any server.

## What the extension accesses

The content scripts run only on `https://www.youtube.com/*` and `https://youtube.com/*`. They inspect the current page URL/video identifier and player elements locally to recognize a watch page, avoid an obsolete player during navigation and operate the theater button. If chat hiding is enabled, the extension also checks whether chat is collapsed and locates YouTube's native chat-close control, including in the same-origin chat frame header. It does not read chat messages, usernames or participant details. These page details are processed in memory, not logged, retained as history or transmitted.

## Collection, sharing and external services

The extension does not collect or transmit personal information, viewing history, account details, video content, analytics, identifiers or crash reports. It does not sell or share user data. It makes no network requests, runs no remote code, and contains no advertising or analytics services. No developer-operated server is involved.

YouTube, Chrome and GitHub have their own privacy practices. Their ordinary operation is separate from this extension. If you choose to file a public GitHub issue, the information you submit is handled by GitHub and may be publicly visible; please omit sensitive details.

## Your controls

Use the popup switches to pause automatic theater mode or automatic chat closing independently. Turning either off preserves the current view. You can reopen chat using YouTube's own controls. Removing the extension removes its local extension storage through Chrome's normal uninstall process.

## Changes and contact

Future changes to these practices will be reflected here with an updated effective date. For questions, open an issue in the [project repository](https://github.com/martinhuang-work/YouTube-Auto-Theater/issues). Do not include private information in public issues.
