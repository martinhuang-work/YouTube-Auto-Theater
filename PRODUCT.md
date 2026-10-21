# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Manifest V3 Chrome extension using plain HTML, CSS and JavaScript, as proposed and approved. No runtime dependencies, external services or build step for installation.

## Users and purpose

Desktop YouTube viewers who want videos to open in theater mode without repeatedly clicking the size button, with an optional quieter layout for live streams and replays. Independent persistent switches control automatic theater mode and live-chat closing.

## Capabilities and constraints

Enable once per watch video; respect manual layout changes afterward. Optionally close chat once per watch video through native controls and respect manual reopening. Chat closing defaults to off, including upgrades. Each off switch stops its own automation and preserves the current view. Handle YouTube's client-side navigation and delayed controls. Do not act on Shorts, embedded players, fullscreen or mini player. Store only two local boolean preferences; do not read chat messages or add permissions. Public repository under martinhuang-work; maintain owner control over writes and merges.

## Brand commitments

YouTube Auto Theater Mode. Approved compact charcoal popup, red toggle, original widescreen icon, clear Enabled/Paused state, keyboard accessibility. Independent project, no implied YouTube endorsement.

## Evidence

The initial four-file prototype was supplied by the owner. Expanded files and reliability fixes were explicitly approved. The owner reported submission for store review. On October 21, 2026, the owner requested optional chat hiding and supplied a replay for verification. Store status has not been independently verified.
