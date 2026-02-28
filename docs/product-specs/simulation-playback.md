# Product Spec: Simulation Playback

**Route:** `/simulate`
**Phase:** 3
**Design refs:** [docs/DESIGN.md](../DESIGN.md), [docs/design-docs/simulation-engine.md](../design-docs/simulation-engine.md)

---

## Layout (Mobile)

```
┌─────────────────────────┐
│  Portfolio value (large) │  ← sticky top header
│  +$X (+Y%) today        │
├─────────────────────────┤
│                         │
│   Portfolio chart       │  ← main content, scrollable
│   (animated line)       │
│                         │
├─────────────────────────┤
│  Position cards         │  ← scrollable list below chart
│  AAPL  $2,341  +3.2%    │
│  BTC   $1,890  -1.1%    │
│  ...                    │
├─────────────────────────┤
│  [Chyron scrolling...]  │  ← fixed, above controls
├─────────────────────────┤
│  ⏮ ⏸▶ ⏭  1x 5x 10x    │  ← fixed playback controls bar
└─────────────────────────┘
```

---

## Playback Controls

### Mode Toggle
- Toggle between **Movie** (auto-play) and **Step** (manual advance)
- Remembered per session

### Movie Mode Controls
- **Play / Pause** button (center)
- **Speed:** 1x / 5x / 10x selector (tap to cycle)
- **Rewind to start** button (left)
- **Jump to end** button (right) — skips to results

### Step Mode Controls
- **← Back** and **Forward →** buttons
- **Jump to start** / **Jump to end**
- Each press advances by the selected granularity

### Time Granularity
- Toggle: **Daily** | **Weekly** | **Monthly**
- Default: Daily for historical, Monthly for projected
- Affects how many price points are shown per step

---

## Portfolio Chart

- **X-axis:** dates (sparse labels, auto-calculated based on width)
- **Y-axis:** portfolio value in dollars
- **Line:** animated left-to-right as simulation advances
- **Fill:** green below line when above start value, red when below
- **Tooltip:** tap/hover shows date + portfolio value + day return
- **Event markers:** vertical dashed lines with label on major historical events
- **Projected region:** shaded differently (crosshatch or opacity change) + "Projected" label

---

## Position Cards

Below the chart, scrollable list of current positions:
- Instrument ticker (monospace, bold)
- Current value ($)
- % change from entry (color-coded)
- Small sparkline of this position's price over the simulation
- Tap to expand: full position detail, buy/sell controls

---

## Manual Trade Actions

Available at any time by:
1. Tapping a position card → expand → trade controls
2. Tapping "+" button → opens instrument search to add new position

### Trade Controls (Bottom Sheet)
- **Buy:** Dollar amount input → "Buy" button
- **Sell:** Slider (0–100% of position) → "Sell" button
- **Rebalance:** One tap → returns all positions to original target %

Trade confirmation shows: "Buying $500 of AAPL at $X.XX — confirm?"
Executes on next tick open price.

---

## Narrator Integration

- Chyron: always visible, rotating ambient + event messages
- Popups: appear above chyron, auto-dismiss 4s, swipe to dismiss

---

## Historical Event Markers

For preset scenarios, key events are annotated on the chart:

| Scenario | Events |
|---|---|
| 2008 Crisis | Bear Stearns collapse, Lehman bankruptcy, TARP passage, market bottom |
| Dot-com | NASDAQ peak, dot-com bust begins, 9/11 effect |
| Black Monday | Oct 19 1987 |
| COVID | First lockdowns, Fed intervention, vaccine announcement |
| Bull Run | GameStop squeeze, ATH dates |
| Crypto Winter | LUNA collapse, FTX collapse |

Event markers: thin vertical line on chart + label chip. Tap to see description.

---

## Results Transition

When simulation reaches end date (or user taps "Jump to End"):
- Final tick computed
- 1-second pause with "Simulation complete" overlay
- Narrator popup: scenario-appropriate completion message
- "View Results →" button appears
- Auto-navigates to `/results` after 3 seconds (or on button tap)
