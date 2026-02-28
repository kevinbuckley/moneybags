# Product Spec: Setup Wizard

**Route:** `/setup`
**Phase:** 3
**Design refs:** [docs/DESIGN.md](../DESIGN.md), [docs/FRONTEND.md](../FRONTEND.md)
**Engine refs:** [docs/design-docs/data-layer.md](../design-docs/data-layer.md)

---

## Purpose

Guide users from a blank state to a fully configured simulation in under 60 seconds. Five steps, each a separate screen/state. Mobile-optimized throughout.

---

## Step 1: Starting Capital

**Copy:** "How much fake money are you betting with?"

- Large centered number input, pre-filled with `$10,000`
- `+` / `-` buttons for quick adjustments ($1k increments)
- Keyboard input allowed (numbers only)
- Min: $1,000 | Max: $1,000,000,000
- Formatted with commas as user types
- Subtext: "Don't worry, it's not real. We checked."
- CTA: "Next →"

---

## Step 2: Choose a Scenario

**Copy:** "Pick your disaster. Or triumph. We don't judge."

### Preset Scenarios
Display as swipeable horizontal cards (mobile) or grid (desktop). Each card shows:
- Scenario name (bold)
- Date range
- One-line snarky description
- A color-coded indicator (red = crash, green = bull run, yellow = volatile)

| Scenario | Card Color | Snarky Description |
|---|---|---|
| 2008 Financial Crisis | Red | "Banks go boom. Everyone suffers." |
| Dot-com Bubble | Red | "Tech goes to the moon, then the floor." |
| Black Monday (1987) | Red | "One very bad Monday." |
| COVID Crash + Recovery | Yellow | "The world ends. Then doesn't." |
| 2020–2021 Bull Run | Green | "Number only go up. For a while." |
| 2022 Crypto Winter | Red | "LUNA goes to actual zero." |

### Custom Date Range
- "Custom range" option at end of scenario list
- Date picker (start + end)
- Validates against available data range
- Warning if selected instruments have partial coverage

---

## Step 3: Build Portfolio

**Copy:** "What are you throwing your fake money at?"

### Instrument Search
- Search input at top (autofocus)
- Real-time search of `instruments.json` by ticker or name
- Results show: ticker, name, type badge, "Not available in this scenario" if missing data
- Tap to add to portfolio

### Portfolio Builder
- Added instruments appear as cards below search
- Each card shows: ticker, name, allocation slider (0–100%), dollar amount
- Allocations auto-normalize (total always = 100%)
- Cash remainder shown at bottom ("$X remaining in cash")
- Minimum position: $100
- Max instruments: 15

### Instrument Type Tabs
Filter search by: All | Stocks | ETFs | Crypto | Bonds | Options | Leveraged | Short | Dispersion

### Options / Complex Instruments
When user adds an options or dispersion instrument, a secondary configuration sheet slides up:
- **Options:** Pick strategy, strike, expiry (relative: 1mo, 3mo, 6mo, 1yr), long/short
- **Leveraged:** Pick multiplier (2x, 3x), long/short
- **Dispersion:** Pick index, select components, pick long/short dispersion

---

## Step 4: Set Rules (Optional)

**Copy:** "Set your robot overlord's orders. Or skip and fly blind."

- "Skip for now" option prominent
- Rule builder component (see [rules-builder.md](./rules-builder.md))
- Up to 10 rules
- Rules shown as readable summaries: "IF TSLA drops 10% AND SPY drops 5% → Buy $500 TSLA"

---

## Step 5: Review & Launch

**Copy:** "Ready to lose your fake fortune?"

Summary card showing:
- Starting capital
- Scenario name + date range
- Portfolio breakdown (pie chart + list)
- Rules list (if any)
- "Edit" links for each section

CTA: Big "Launch Simulation →" button (accent purple, full width)

Subtext: "This is fake money. We cannot stress this enough."

---

## State Management

All setup state lives in `portfolioStore` and `rulesStore`. On "Launch Simulation":
1. Validate portfolio (min $100 positions, at least 1 instrument)
2. Load required price data files
3. Initialize `SimulationState` in `simulationStore`
4. Navigate to `/simulate`
