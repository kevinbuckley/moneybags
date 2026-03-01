# Mr. Moneybags — Use Cases

## UC-01: Start a Simulation (Happy Path)
**Trigger:** User lands on homepage
**Steps:**
1. Click "Start Simulating →" or a scenario card
2. Step 1 — Enter starting capital (preset or type custom amount)
3. Step 2 — Select a scenario (era of market history)
4. Step 3 — Build portfolio: search instruments, add allocations, set percentages to 100%
5. Step 4 — Optionally add automation rules
6. Step 5 — Review config, click "Launch Simulation"
7. Watch simulation play back; trade manually, adjust speed, pause/step
8. Arrive at results page; view grade, analytics, best/worst days

---

## UC-02: Play Today's Daily Challenge
**Trigger:** User sees featured "Today's Challenge" card on homepage
**Steps:**
1. Click "Play Today's Challenge →"
2. Lands on setup with the day's scenario pre-selected
3. Complete setup steps 1, 3, 4, 5 (scenario locked in)
4. Run simulation and compete for leaderboard position

---

## UC-03: Accept a Friend's Challenge
**Trigger:** User receives a challenge URL (`/setup?s=<slug>&a=SPY:60,GLD:40`)
**Steps:**
1. Open challenge URL
2. Setup wizard auto-fills scenario + allocations from URL params
3. User may adjust rules (step 4) but scenario/portfolio is pre-loaded
4. Run simulation; results compared against friend's run

---

## UC-04: Manual Trade During Simulation
**Trigger:** User taps "Trade" button on the simulate page
**Steps:**
1. Pause or let simulation run
2. Open Trade panel
3. Select action: Buy / Sell % / Sell All / Move All to Cash
4. For Buy: pick ticker, enter dollar amount (or tap 25/50/100% of cash)
5. For Sell %: pick ticker, enter percentage (or tap preset)
6. Tap "Confirm Trade" — sound plays, position updates immediately

---

## UC-05: Sell a Cash-Secured Put
**Trigger:** User taps "📉 Sell Put" button during simulation
**Steps:**
1. Open Sell Put panel
2. Pick underlying ticker (from held positions)
3. Choose strike: ATM / −5% OTM / −10% OTM
4. Choose expiry: ~2 weeks / ~1 month / ~2 months
5. Choose contracts: 1 / 2 / 5
6. Review live Black-Scholes premium, max profit, break-even, collateral required
7. If sufficient cash collateral: tap "Sell Put — Collect $X"
8. Premium credited to cash immediately; liability position created

**Put lifecycle:**
- Each tick: put revalued via Black-Scholes (negative = liability)
- OTM at expiry → position removed, full premium profit kept in cash
- ITM at expiry → cash debited by intrinsic value, narrator fires event

---

## UC-06: Close a Short Put Early
**Trigger:** User sees open put in Portfolio panel and taps "Close"
**Steps:**
1. Portfolio panel shows "Short Puts" section with DTE, P&L
2. Tap "Close" → submits `close_option` trade
3. Current Black-Scholes value deducted from cash (buy-to-close cost)
4. Position removed from portfolio

---

## UC-07: Set Automation Rules
**Trigger:** User on setup step 4, taps "+ Add Rule"
**Rule templates available:**
- 🛡️ **Daily Loss Limit** — move all to cash if portfolio drops X% in a day
- 💰 **Take Profit** — sell ticker if it gains X% in a day
- ✂️ **Cut Losses** — sell ticker if it drops X% in a day
- ⚖️ **Trim Position** — sell X% of ticker if it exceeds Y% of portfolio
- 📉 **Buy the Dip** — buy $X of ticker if market drops Y%
- 🔧 **Custom Rule** — build condition (subject, operator, value) + action + cooldown

**Steps:**
1. Tap rule template or "Custom"
2. Fill in parameters (all numeric inputs)
3. Tap "Add Rule" — appears in rule list
4. Rules can be toggled on/off, removed

---

## UC-08: Replay the Same Setup
**Trigger:** On results page, tap "Replay Same Setup"
**Steps:**
1. Price data reloaded
2. `initSimulation()` called with same config
3. Initial allocation trades resubmitted
4. Navigate to simulate page — reruns from day 1

---

## UC-09: Download GIF Replay
**Trigger:** On results page, tap "Download GIF Replay"
**Steps:**
1. Button enters "Generating..." state with spinner
2. `generateReplayGif()` samples up to 48 frames from history
3. Each frame: dark-themed 480×270 portfolio chart drawn to canvas
4. Frames encoded to animated GIF via gifenc (browser-side)
5. GIF downloaded as `moneybags-<scenario>-replay.gif`

---

## UC-10: Share Challenge Link
**Trigger:** On results page, tap "Challenge a Friend"
**Steps:**
1. Constructs URL: `/setup?s=<slug>&a=<ticker>:<pct>,...`
2. Copies to clipboard
3. Shows "Link copied! ✓" confirmation
4. Friend opens link → setup pre-filled with same scenario + allocations

---

## UC-11: Scrub Simulation History
**Trigger:** On results page, drag the range slider
**Steps:**
1. Slider spans simulation start to end
2. Dragging back shows partial results (portfolio value at that day)
3. Analytics and best/worst day cards update to reflect partial history
4. Release slider — data stays at that point until next interaction

---

## UC-12: View Leaderboard
**Trigger:** Results page "View Leaderboard" or footer link
**Steps:**
1. All past simulation runs shown ranked by return %
2. Filter by scenario via tabs
3. Trophy emoji for top 3 positions
4. "Clear" button removes all entries
5. CTA to run a new simulation

---

## UC-13: View Streak
**Trigger:** Completing multiple simulations with positive returns
**Steps:**
1. Each run with a positive return adds to win streak
2. Streak badge appears on landing page and results page
3. Losing run resets streak

---

## Known Issues / Bugs

### iOS Number Input Editing
- **Affected inputs:** Allocation % fields (Step 3), starting capital
- **Symptom:** Typing a custom value on iPhone causes cursor to jump or value to reset
- **Root cause:** Fully-controlled `type="number"` input with `value={n.toFixed(1)}` re-formats on every keystroke; iOS Safari resets caret position
- **Fix:** Use `type="text" inputMode="decimal"` with local state + `onBlur` commit (same pattern as capital field)

### Ad Slot Rendering (Production)
- **Symptom:** AdSense `<ins>` element renders empty
- **Root cause:** No `minHeight` set; AdSense `format=auto` can't determine slot dimensions in flex container
- **Fix applied:** `minHeight: 280` added to `<ins>` style
