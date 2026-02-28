# Rules Engine Design

**Module:** `src/engine/rules.ts`
**Dependencies:** `src/types/`, `src/lib/math.ts`

---

## Overview

The rules engine evaluates user-defined conditional rules on each simulation tick. Rules are defined upfront in the setup wizard and fire automatically during simulation. Rules are evaluated in order; multiple rules can fire on the same tick.

---

## Rule Structure

```typescript
interface Rule {
  id: string
  label: string                    // user-visible name
  enabled: boolean
  conditions: RuleCondition[]      // all must be true (AND logic)
  action: RuleAction
  firedCount: number               // how many times this rule has fired
  lastFiredDate?: string
  cooldownTicks?: number           // optional: min ticks between fires (default: 5)
}

interface RuleCondition {
  subject: RuleSubject             // what we're measuring
  operator: RuleOperator           // comparison
  value: number                    // threshold
  ticker?: string                  // for position-specific conditions
}

interface RuleAction {
  type: RuleActionType
  ticker?: string                  // for buy/sell actions
  amount?: number                  // dollar amount
  pct?: number                     // percentage (0-100)
}
```

---

## Condition Types

### RuleSubject
```typescript
type RuleSubject =
  | 'position_change_pct'    // a specific position's % change (requires ticker)
  | 'portfolio_change_pct'   // total portfolio % change vs start
  | 'portfolio_value'        // total portfolio value in dollars
  | 'position_weight_pct'    // a position's % of total portfolio (requires ticker)
  | 'cash_balance'           // cash in dollars
  | 'market_change_pct'      // SPY % change this tick
  | 'days_elapsed'           // number of ticks since start
```

### RuleOperator
```typescript
type RuleOperator = 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
// greater than, less than, greater-or-equal, less-or-equal, equal
```

### RuleActionType
```typescript
type RuleActionType =
  | 'buy'          // buy $amount of ticker
  | 'sell_pct'     // sell pct% of ticker holding
  | 'sell_all'     // sell entire position in ticker
  | 'rebalance'    // rebalance to original target allocations
  | 'move_to_cash' // liquidate pct% of portfolio to cash
```

---

## Evaluation Algorithm

On each tick, `evaluateRules(state, priceData, rules)` runs:

1. For each enabled rule (in order):
   a. Check cooldown — skip if rule fired within `cooldownTicks` ticks ago
   b. Evaluate all conditions — all must be `true` (AND logic)
   c. If all conditions pass, append the action to `triggeredActions[]`
   d. Update rule's `firedCount` and `lastFiredDate`
2. Return `triggeredActions[]` — applied by simulator after rule evaluation

---

## Example Rules

### Stop-loss
```
IF position_change_pct(TSLA) < -10 → sell_all(TSLA)
```

### Rebalance trigger
```
IF position_weight_pct(AAPL) > 30 → rebalance
```

### Multi-condition dip buy
```
IF position_change_pct(TSLA) < -10 AND market_change_pct(SPY) < -5 → buy $500 TSLA
```

### Cash preservation
```
IF portfolio_change_pct < -20 → move_to_cash 50%
```

---

## Constraints

- Maximum **10 rules** per simulation
- Maximum **3 conditions** per rule (phone UX constraint)
- Minimum **cooldown of 5 ticks** between fires of the same rule (default)
- Rules cannot reference instruments not in the portfolio
- Rule actions cannot exceed available cash or position size

---

## Rule Builder UI Contract

The rule builder in `components/rules/RuleBuilder.tsx` maps to this data model. Each condition is built with 3 dropdowns:

```
[Subject dropdown] [Operator dropdown] [Value input]
```

For position-specific subjects, a ticker picker appears between subject and operator:
```
[Subject dropdown] [Ticker picker] [Operator dropdown] [Value input]
```

Actions have their own row:
```
[Action dropdown] [Ticker picker (if needed)] [Amount/Pct input (if needed)]
```
