# Product Spec: Rules Builder

**Component:** `src/components/rules/RuleBuilder.tsx`
**Phase:** 3
**Design refs:** [docs/design-docs/rules-engine.md](../design-docs/rules-engine.md)

---

## Purpose

Allow users to build conditional trading rules on a phone without needing to understand code or complex finance. The UI must be simple enough to use with thumbs on a 375px screen.

---

## UI Structure

### Rule List
- List of existing rules (each as a card)
- Each card: rule summary text + enable/disable toggle + delete button
- "+ Add Rule" button at bottom
- Max 10 rules (button disabled + tooltip at limit)

### Rule Summary (read-only card)
Auto-generated plain English summary:
- "IF TSLA drops 10% AND SPY drops 5% → Buy $500 of TSLA"
- "IF portfolio drops 20% → Move 50% to cash"
- "IF AAPL exceeds 30% of portfolio → Rebalance"

### Rule Editor (bottom sheet)

Opens when user taps "+ Add Rule" or taps an existing rule to edit.

#### Condition Row(s)
Each condition is one row with 3–4 elements:

```
[Subject ▼]  [Ticker ▼]  [Operator ▼]  [Value ____]
```

Ticker picker only shown for position-specific subjects.

Add condition button (up to 3 conditions per rule). Between conditions: "AND" label chip.

#### Action Row
```
[Action ▼]  [Ticker ▼]  [Amount/Pct ____]
```

Ticker picker only shown for buy/sell actions.

#### Save / Cancel buttons at bottom of sheet

---

## Dropdown Options

### Subject Dropdown
| Label | Value |
|---|---|
| A position drops/rises | `position_change_pct` |
| My portfolio drops/rises | `portfolio_change_pct` |
| My portfolio value | `portfolio_value` |
| A position's % of portfolio | `position_weight_pct` |
| My cash balance | `cash_balance` |
| The market (S&P 500) | `market_change_pct` |
| Days into simulation | `days_elapsed` |

### Operator Dropdown
| Label | Value |
|---|---|
| drops below | `lt` |
| rises above | `gt` |
| drops to | `lte` |
| rises to | `gte` |

### Action Dropdown
| Label | Value |
|---|---|
| Buy $X of... | `buy` |
| Sell X% of... | `sell_pct` |
| Sell all of... | `sell_all` |
| Rebalance to targets | `rebalance` |
| Move X% to cash | `move_to_cash` |

---

## Validation

- All conditions must be fully filled before saving
- Value inputs: positive numbers only, realistic bounds enforced
  - % values: 0–100
  - Dollar values: $1–$1,000,000
  - Days elapsed: 1–3650
- Buy action: validates that instrument is in portfolio (or warn: "This will add a new position")
- Sell actions: validates that instrument is in portfolio
- Show inline error messages on invalid inputs

---

## Mobile UX Details

- Bottom sheet uses full screen height on small phones (< 680px)
- Keyboard pushes sheet up (not over input)
- All dropdowns use native `<select>` on mobile for best UX
- Number inputs: `inputMode="numeric"` for numeric keypad on mobile
- Ticker picker is a searchable dropdown (filters instruments in portfolio)
