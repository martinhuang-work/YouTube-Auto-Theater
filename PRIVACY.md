# Privacy policy

**YouTube Auto Theater Mode · Effective October 15, 2026**

YouTube Auto Theater Mode automatically activates theater mode on supported desktop YouTube watch pages. It is maintained by [martinhuang-work](https://github.com/martinhuang-work).

## What is stored

The extension saves one preference, `autoTheaterEnabled` (true or false), in Chrome's local extension storage. This determines whether automatic theater activation is enabled. It is not synchronized by the extension and is not sent to the developer or any server.

## What the extension accesses

The content script runs only on `https://www.youtube.com/*` and `https://youtube.com/*`. It inspects the current page URL/video identifier and player elements locally to recognize a watch page, avoid an obsolete player during navigation and operate the theater button. These page details are not logged, retained as history or transmitted.

## Collection, sharing and external services

The extension does not collect or transmit personal information, viewing history, account details, video content, analytics, identifiers or crash reports. It does not sell or share user data. It makes no network requests, runs no remote code, and contains no advertising or analytics services. No developer-operated server is involved.

YouTube, Chrome and GitHub have their own privacy practices. Their ordinary operation is separate from this extension. If you choose to file a public GitHub issue, the information you submit is handled by GitHub and may be publicly visible; please omit sensitive details.

## Your controls

Use the popup switch to pause automatic theater mode. Pausing preserves the current player layout and the saved preference. Removing the extension removes its local extension storage through Chrome's normal uninstall process.

## Changes and contact

Future changes to these practices will be reflected here with an updated effective date. For questions, open an issue in the [project repository](https://github.com/martinhuang-work/YouTube-Auto-Theater/issues). Do not include private information in public issues.
