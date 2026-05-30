# Handoff: Rate My Tea — Tasting & Ranking Flow

## Overview
A mobile flow that helps a tea drinker taste a **fixed variety pack of 12 samples**, capture quick impressions while sipping, and confidently decide which teas to buy in bulk. The core loop is **pick → brew → rate → submit**, with a leaderboard that ranks all tasted teas by a "would you buy again?" percentage and lets the user re-edit any score.

This handoff covers the **core flow** (the four-screen happy path the user sketched). The source file also contains four broader concept directions (Tea Lab, Tier Tea, Sip & Swipe, Tea Journal) and an interactive Home demo — useful as reference, but the build target is the core flow below.

## About the Design Files
The files in this bundle are **design references created in HTML** — lo-fi wireframes showing intended layout, content, and behavior. They are **not production code to copy directly**. The task is to **recreate this flow in the target codebase's existing environment** (React, React Native, SwiftUI, Flutter, etc.) using its established components, navigation, and styling patterns. If no environment exists yet, pick the most appropriate framework for a small mobile prototype and implement there.

## Fidelity
**Low-fidelity (lofi).** These are intentionally rough, grayscale, hand-drawn-style wireframes. Use them as a guide for **structure, content, and flow** — do **not** reproduce the sketchy hand-drawn aesthetic. Apply the target codebase's existing design system (or a clean, neutral default) for actual styling. The point is the interaction model and information hierarchy, not pixels.

## Screens / Views

Reference screenshots are in the `screens/` folder:
- `screens/01-home.png` — Home (tea picker)
- `screens/02-rate.png` — Rate (score a tea)
- `screens/03-home-rated.png` — Home with progress + rated teas faded
- `screens/04-leaderboard.png` — Tea board (leaderboard)

The flow is four screens. Navigation between them is vertical: tapping a tea or a CTA **slides the next screen up**; dismissing **slides back down**.

### 1. Home (tea picker)
- **Purpose:** The user browses the fixed pack and picks whichever tea sounds good right now (free choice, any order).
- **Layout:** Vertical stack. Header title "Rate my tea" + one-line subtitle ("pick whatever sounds good"). Below it, a **3-column grid of 12 tea cards** (4 rows). Grid uses equal gaps (~9–12px).
- **Components:**
  - **Tea card** (×12): square (1:1 aspect), rounded corners. Contains a small round color/flavour swatch (placeholder) centered above a short tea name (e.g. "Melb Breakfast", "Jasmine", "Earl Grey"). Entire card is tappable → opens Rate for that tea.
  - The 12 names used in the mock: Melbourne Breakfast, Jasmine, Earl Grey, Peppermint, Sencha, Oolong, Chai, Rooibos, Hibiscus, Chamomile, Lemon Ginger, Darjeeling.
- **Interaction:** Tap a card → slide up to **Rate** for that tea.

### 2. Rate (score a tea)
- **Purpose:** Capture impressions while or just after drinking. Designed to be glanceable and thumb-friendly (used mid-sip).
- **Layout:** Vertical stack: tea name (title) → "Score the basics" section → buy-again slider → optional note field → Submit button pinned to bottom.
- **Components:**
  - **Title:** the tea's name (e.g. "Melbourne Breakfast").
  - **Axis ratings** — a set of labeled rows, each a discrete **5-dot rating** (tap a dot to set the level; fills dots up to and including the tapped one). Axis labels in the core-flow mock: **Aroma, Body, Sweetness, Finish** (4 axes). *Note: the broader "Tea Lab" concept and the interactive Home demo use 5 axes (Aroma, Body, Sweetness, Bitterness, Finish). Pick one set and keep it consistent — recommend confirming with the designer; 5 axes is the richer default.*
  - **"Would you buy again?" slider:** horizontal slider, 0–100%, with a live percentage label (mock shows 72%). This is the primary purchase signal and drives leaderboard ranking.
  - **Tasting note:** single optional free-text field, labeled "tasting note (optional)".
  - **Submit button:** full-width, pinned to bottom, label "SUBMIT".
- **Interaction:**
  - Tapping dots sets each axis score; dragging/tapping the slider sets the percentage.
  - **Submit** → saves the rating, marks the tea as tasted, slides down/forward to **Home** (now showing updated progress).
  - Dismiss (slide down) returns to Home without saving.

### 3. Home (post-rating state)
- **Purpose:** Same Home grid, now reflecting progress. Shows what's left to taste and routes to the leaderboard.
- **Layout:** Header "Rate my tea" → **progress meter** ("tasted" + bar + "N/12") → the same 12-card grid → "view leaderboard" button pinned to bottom.
- **Components:**
  - **Progress meter:** label "tasted", a horizontal progress bar, and a count "2/12" (value = number of rated teas / 12).
  - **Tea grid (12 cards):** identical to screen 1, except **rated teas are faded (reduced opacity ~0.5) and marked with an ✕** to show they're done. In the mock, Melbourne Breakfast and Sencha are rated.
  - **"view leaderboard →" button:** full-width, bottom.
- **Interaction:** Tap a not-yet-rated card → Rate. Tap "view leaderboard" → slide up to **Tea board**.

### 4. Tea board (leaderboard)
- **Purpose:** See all tasted teas ranked by buy-again %, and edit any rating before committing to a bulk purchase.
- **Layout:** Presented as a **modal/sheet** (has a close ✕ in the top-right). Header "Tea board" + subtitle "ranked by would-buy-again". Below: a vertical list of **ranked rows**.
- **Components:**
  - **Close ✕:** top-right, dismisses back to Home.
  - **Leaderboard row** (one per rated tea): rank number (1, 2, …), small swatch, tea name, and the buy-again **percentage** right-aligned. Rows are ordered descending by percentage. Mock shows: 1 — Melbourne Breakfast 72%, 2 — Sencha 62%.
  - **Placeholder row:** a dashed, dimmed "next tea…" row hinting where future rated teas will land.
  - **Caption:** "tap a row to edit its rating".
- **Interaction:** Tap any row → reopen **Rate** for that tea, pre-filled with its existing scores, so the user can adjust. Saving re-sorts the board.

## Interactions & Behavior
- **Navigation model:** vertical slide transitions. Tap-to-open slides the new screen up; back/dismiss slides down. Leaderboard is a modal sheet with an explicit ✕.
- **Dot rating:** tapping the Nth dot in a row fills dots 1..N; tapping a lower dot reduces the score.
- **Slider:** click/drag along the track sets 0–100%; percentage label updates live.
- **Submit:** persists the rating, flips that tea's card to the faded/✕ "rated" state, increments the progress count, and inserts/updates the tea on the leaderboard.
- **Edit from leaderboard:** opens Rate pre-populated; on save, re-rank.
- **No hard gating:** the user can taste in any order and re-edit any score at any time — nothing is locked.
- **Empty/edge states:** before any rating, progress shows 0/12 and the leaderboard is empty (show the dashed placeholder/encouragement). All ratings except the dot axes and slider are optional; the note can be skipped.

## State Management
Minimal local state is sufficient for a prototype (no backend required):
- `teas`: fixed array of 12 objects — `{ id, name }` (add `swatch`/`flavourFamily` if desired).
- Per-tea rating record: `{ teaId, axes: { aroma, body, sweetness, finish /* , bitterness? */ }, buyAgainPct, note }`.
- `ratings`: map of `teaId → rating` (presence = "tasted").
- Derived: `tastedCount = ratings.size`; `leaderboard = ratings sorted by buyAgainPct desc`.
- Transitions: submit adds/updates a rating; editing from leaderboard mutates an existing one.
- Persist to local storage (or device storage) so a refresh keeps progress — nice for a prototype but optional.

## Design Tokens
This is lofi, so **adopt the target codebase's tokens**. The mock itself uses an intentionally rough grayscale sketch style that should **not** be reproduced. If building standalone with no system, sensible neutral defaults:
- **Layout:** mobile-first single column; ~16px screen padding; 12px grid gaps.
- **Tea card:** 1:1 aspect, ~12px radius.
- **Rating dots:** ~14px diameter, 5 per axis.
- **Touch targets:** ≥44px.
- **Slider:** standard platform slider; show numeric % beside it.
- **Type scale:** screen title ~20–24px; body ~15–16px; labels ~12–13px.
- The single meaningful "value" token is the **buy-again %** — make it visually prominent (it's the decision driver).

## Assets
None required. Tea swatches are placeholders (solid/round color chips) — the codebase can substitute real product imagery or generated flavour colors. No icons beyond a close ✕ and simple arrows, available in any icon set.

## Files
- `Tea Wireframes.html` — the full source prototype. The relevant section is the **"Rate my tea — the loop"** storyboard (anchor `#flow`), which lays out all four screens (Home → Rate → Home → Tea board) with annotated flow arrows. The interactive **Home** section (anchor `#home`) demonstrates a working tap-to-rate sheet (picker → dot axes → draggable buy-again slider → save marks tasted) and is a good behavioral reference. The four concept lanes (`#c1`–`#c4`) show alternative directions and are optional context.

Open the file in a browser and scroll to the "Flow" section (or click ⟳ Flow in the top nav) to see the target flow.
