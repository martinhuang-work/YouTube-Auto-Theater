---
name: YouTube Auto Theater Mode
description: A compact charcoal popup for one persistent theater-mode preference.
colors:
  background: "#17191d"
  surface: "#22252b"
  line: "#3b4049"
  text: "#f5f5f4"
  muted: "#b2b7c0"
  accent: "#f04452"
  focus: "#ffb1b8"
  switch-paused: "#555c68"
  thumb: "#fff"
typography:
  title:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-.025em"
  label:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  supporting:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: '"Segoe UI", system-ui, sans-serif'
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  screen: "7px"
  button: "6px"
  switch: "30px"
  thumb: "50%"
spacing:
  text-gap: "3px"
  control-inset: "4px"
  compact: "8px"
  inline: "10px"
  related: "12px"
  section: "16px"
  open: "18px"
  gutter: "24px"
components:
  switch-paused:
    backgroundColor: "{colors.switch-paused}"
    rounded: "{rounded.switch}"
    padding: "{spacing.control-inset}"
    width: "54px"
    height: "30px"
  switch-enabled:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.switch}"
    padding: "{spacing.control-inset}"
    width: "54px"
    height: "30px"
  switch-thumb:
    backgroundColor: "{colors.thumb}"
    rounded: "{rounded.thumb}"
    width: "22px"
    height: "22px"
  button-retry:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.supporting}"
    rounded: "{rounded.button}"
    padding: "5px 10px"
  screen-paused:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.screen}"
    width: "110px"
    height: "60px"
  screen-enabled:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.screen}"
    width: "220px"
    height: "60px"
---

# Design System: YouTube Auto Theater Mode

## Overview

**Creative North Star: "Compact Charcoal Utility"**

A compact charcoal utility makes one saved preference immediately readable. The original screen mark supplies the identity, and the red accent connects the enabled switch to the widening screen illustration. Clear state language carries the meaning alongside color.

The visual system uses native text and controls, restrained tonal layering, and a small amount of purposeful movement. Its established scope is the desktop extension popup; composition and task details remain in `docs/popup-brief.md`.

**Key Characteristics:**

- Charcoal surfaces with one red action accent.
- Compact system typography with clear labels and quiet supporting copy.
- Original geometric screen imagery tied to the saved preference.
- Visible keyboard focus, truthful feedback, and reduced-motion support.

## Colors

The palette combines cool charcoal neutrals, soft white text, and a clear red accent. The frontmatter is the normative color record.

### Primary

- **Theater Red — accent:** enabled switch track, enabled screen border and center line, and original identity mark.
- **Soft Rose — focus:** keyboard focus outlines and storage-error feedback.

### Neutral

- **Deep Charcoal — background:** the popup canvas.
- **Raised Charcoal — surface:** the screen illustration and retry button.
- **Slate Line — line:** the resting screen outline and screen base.
- **Soft White — text:** identity, setting label, and retry label.
- **Cool Gray — muted:** state explanation, behavioral copy, feedback, and privacy footer.
- **Paused Slate — switch-paused:** the inactive switch track.
- **Thumb White — thumb:** the movable switch thumb and white details in the original mark.

**The State Pairing Rule.** Show preference state with text and control position as well as color.

## Typography

Segoe UI with system-ui and sans-serif fallbacks supplies every text role. This is a native-feeling utility type system, with no separate display face.

- **Title:** compact identity heading; the tight tracking and heavier weight distinguish it from control text.
- **Label:** the readable, semibold name of the preference.
- **Body:** the behavioral explanation below the switch.
- **Supporting:** identity subtitle, state sentence, feedback, and retry button.
- **Caption:** the quiet privacy footer.

The body element has an inherited base size (14px); the visible text roles above use the explicit sizes in the frontmatter.

**The Local Type Rule.** Use the existing system font stack; the popup does not load a remote font.

## Layout

The shipped popup has a fixed width (336px), with a single column and equal top and side gutters. The identity row uses the related spacing token; the setting row distributes the copy and switch across the available width with the section gap.

The screen illustration occupies a reserved band (122px high). The switch's visible track sits inside a larger interactive label (54px wide by 44px high). The behavioral copy reserves a minimum height (40px), and the feedback row reserves its own minimum height (45px) while allowing wrapping. The footer is separated by a thin top divider.

This implementation has no width breakpoints. Fixed popup dimensions are surface-specific evidence, not a responsive layout rule for future pages.

**The Stable Feedback Rule.** Reserve room for the supporting sentence and storage feedback so ordinary state changes do not move the control.

## Elevation & Depth

Depth comes from a lighter charcoal screen surface against the dark canvas and from thin outlines. The switch thumb is the only element with a shadow (`0 2px 4px #0003`). It separates the moving control from its track; there is no panel or card shadow vocabulary.

**The Restrained Depth Rule.** Use tonal surfaces and thin borders for separation; reserve the small shadow for the switch thumb.

## Shapes

The original icon uses a rounded red square enclosing a geometric widescreen mark. The illustration repeats that screen silhouette with gently rounded corners and a thin border. The retry button has a smaller corner radius, while the switch combines a pill track and circular thumb. Use the role-specific radii in the frontmatter; these are distinct component shapes rather than one universal radius.

## Components

### Preference switch

A native checkbox with switch semantics provides the interaction. The visible track is slate when paused and red when enabled. Its white thumb moves horizontally (24px) with the checked state. The external setting label is clickable, and the behavioral paragraph describes the control.

Hover brightens the track (`brightness(1.12)`). Keyboard focus adds a soft-rose outline (2px, offset 4px). During loading and saving, the input is disabled and the track uses reduced opacity (0.5). Forced-color mode uses system colors for the track border, checked track, and thumb.

The track color transition lasts (160ms). Thumb movement and screen width share a brief easing (`240ms cubic-bezier(.16,1,.3,1)`); the screen border color also transitions over (240ms). All transitions are removed under `prefers-reduced-motion: reduce`.

### Screen illustration

The screen changes between the two frontmatter widths while preserving height and alignment. Enabled state adds the red outline and center line. The paused center line is a quiet neutral (`#6b717e`), and a small base anchors the illustration. It is hidden from assistive technology because the control and text carry its meaning.

**The Preference Illustration Rule.** The widening screen represents the saved preference, never the current tab's actual player state.

### Feedback and retry

The feedback region is a polite, atomic live status. It reports loading, saving, confirmation, and failure. A failed save restores the saved preference; the requested value remains available to retry. A failed load leaves the switch disabled and exposes retry.

The retry button uses the raised charcoal surface, a thin neutral border (`#626978`), and a minimum height (32px). Hover changes its surface (`#343943`); keyboard focus uses the shared rose outline (2px, offset 3px). This secondary button appears only for a storage error.

### Identity and privacy

The original screen mark is displayed at (36px square), with an empty image alternative beside the textual product name. The quiet footer combines a small outlined privacy symbol with the local-storage statement. The popup makes no claim about the open tab or affiliation with YouTube.

## Do's and Don'ts

### Do:

- Do preserve the compact charcoal surface, red active switch, and original screen icon.
- Do pair Enabled or Paused language with the switch position and an explanation of its effect.
- Do retain the switch's full hit area, visible focus treatment, and native keyboard behavior.
- Do provide loading, saving, failure, and retry feedback without claiming a write succeeded before storage confirms it.
- Do keep movement brief and disable transitions when reduced motion is requested.

### Don't:

- Don't rely on red alone to communicate whether automatic switching is enabled.
- Don't present the screen illustration as live status for the open YouTube tab.
- Don't replace the original screen mark with an official YouTube logo or imply endorsement.
- Don't introduce remote fonts or decorative assets into this locally rendered popup.

