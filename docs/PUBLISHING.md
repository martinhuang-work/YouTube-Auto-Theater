# Chrome Web Store publishing guide

Prepared for version **1.2.0**, October 21, 2026. This update has not been uploaded or submitted by the coding agent.

## Updating the existing item to 1.2.0

1. Reload the local unpacked extension and refresh YouTube. Test Hide live chat on a replay with chat expanded, on another watch video after navigation, and with theater mode paused. Verify manual reopening and off behavior using [TESTING.md](TESTING.md).
2. Open the existing YouTube Auto Theater Mode item in the Developer Dashboard. In Package, upload `dist/YouTube-Auto-Theater-1.2.0.zip` as a new package. Keep the existing store item and extension ID.
3. Update the description and permission explanations using [store/LISTING.md](../store/LISTING.md). Replace the two screenshots with the refreshed 1.2.0 screenshots; icon and promo tiles can stay as they are.
4. Keep the existing public privacy-policy URL; its contents now describe two local preferences and chat-control access. No new permissions, remote code, message collection or data transmission were added.
5. Save the draft, resolve any dashboard requirements, then submit the update for review. Google controls review and release timing.

Suggested update note: **Added an optional Hide live chat switch for live streams and chat replay. The setting is off by default, works independently of theater mode, and respects manually reopening chat. No new permissions.**

The remaining sections also cover first-time publisher setup.

## 1. Complete publisher account setup

Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). The publisher must register, pay Google's one-time registration fee if not already registered, complete required identity/contact checks, and enable Google Account two-step verification. Account details, legal certifications and any payment are owner steps.

Use a developer contact address you want associated with the listing. No private account email has been placed in the public project.

Declare your trader status based on your circumstances: publishing for purposes related to a business, trade or profession is trader activity; publishing outside those purposes is non-trader activity. A free extension can still serve professional purposes. The publisher must make this declaration. See [Google's trader guidance](https://developer.chrome.com/docs/webstore/program-policies/trader-disclosure).

## 2. Run the live-browser release checks

Follow [TESTING.md](TESTING.md). Automated fixtures cannot establish compatibility with every current YouTube experiment. Test the actual unpacked extension on live YouTube in Chrome, including first load, video-to-video navigation, off/on, manual override and fullscreen.

## 3. Build the upload ZIP

From the repository root with Node.js 20 or newer:

```sh
npm run check
npm test
npm run package
```

Upload `dist/YouTube-Auto-Theater-1.2.0.zip`. It includes only the eleven files in `extension/`. `manifest.json` is at the ZIP root. Do not upload the source repository ZIP, screenshots, test harness or development files as the extension package.

For a later release, increase the manifest version, synchronize `package.json`, rerun validation and create a fresh ZIP. Never reuse an already-uploaded version number.

## 4. Fill out the draft listing

Create a new item and upload the ZIP. Use [store/LISTING.md](../store/LISTING.md) for the name, description, single purpose, permission justifications and reviewer instructions. Upload the supplied store icon, screenshot(s) and small promotional tile. The marquee is optional.

Set the homepage/support/privacy URLs from the listing file. Confirm they are publicly accessible before submitting. Supply your publisher contact details and select the appropriate distribution regions and pricing options in the current dashboard.

## 5. Complete privacy disclosures

The shipped extension saves two local on/off preferences and transmits no user data. It uses no remote code. The content scripts locally inspect page URL/video identifiers, player elements and chat-close controls to adjust the viewing layout. They do not read chat messages or participant details. Ensure the dashboard answers match both the source code and [PRIVACY.md](../PRIVACY.md).

The owner must read and accept the dashboard's certifications. Do not select data categories or make claims inconsistent with the published build. If future features introduce telemetry or new permissions, update the policy and disclosures before submitting that version.

## 6. Submit for review

Review the final listing, package, privacy answers and distribution settings, then submit using the dashboard. Google controls approval and review timing. Keep the repository and listing aligned with the approved version.

After approval, add the real Chrome Web Store install URL to the README and GitHub repository homepage. Do not advertise store availability until the listing is live.

## Official references

- [Register a developer account](https://developer.chrome.com/docs/webstore/register/)
- [Upload an extension](https://developer.chrome.com/docs/webstore/publish/)
- [Listing requirements](https://developer.chrome.com/docs/webstore/program-policies/listing-requirements)
- [Images and dimensions](https://developer.chrome.com/docs/webstore/images)
- [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Two-step verification prerequisite](https://developer.chrome.com/docs/webstore/using-api)

Requirements and dashboard wording may change; the current dashboard is authoritative when submitting.
