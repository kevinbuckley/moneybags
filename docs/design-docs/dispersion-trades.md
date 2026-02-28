# Dispersion Trades Design

**Module:** `src/lib/correlation.ts`, `src/engine/simulator.ts`

---

## Decision: How Dispersion Trades Are Modeled

**Resolved:** A dispersion trade is modeled as a correlation play between an index and its components. The user bets on whether the index's implied correlation is higher or lower than the realized correlation of its components during the simulation period.

---

## What Is a Dispersion Trade?

A dispersion trade exploits the difference between:
- **Implied correlation** (what the options market prices into the index)
- **Realized correlation** (how stocks in the index actually moved together)

If stocks move more independently than the market expected → you profit.
If stocks move more together than expected → you lose.

**Classic structure:**
- Short index volatility (sell index options)
- Long single-stock volatility (buy options on index components)

---

## Simplified Model for MoneyBags

Since we can't easily source implied correlation from historical option data, we use a simplified model:

### Setup
User configures:
- **Index:** e.g., SPY (S&P 500)
- **Components:** 5–10 constituent stocks (e.g., AAPL, MSFT, AMZN, GOOGL, META)
- **Measurement window:** simulation period
- **Position:** "long dispersion" (bet stocks move independently) or "short dispersion" (bet stocks move together)
- **Notional size:** dollar amount of the trade

### Benchmark Correlation
We compute the **historical average pairwise correlation** of the selected components over the 2 years prior to the scenario start date. This serves as the "market's expectation" (proxy for implied correlation).

```typescript
function computeBenchmarkCorrelation(
  components: string[],
  lookbackReturns: ReturnSeries[]   // 2yr lookback OHLCV
): number  // average pairwise Pearson correlation, 0-1
```

### Realized Correlation (per tick)
On each tick, compute rolling realized correlation of components over the simulation so far:

```typescript
function computeRealizedCorrelation(
  components: string[],
  returns: ReturnSeries[]    // simulation period to date
): number
```

### P&L Calculation
```
correlationSpread = realizedCorrelation - benchmarkCorrelation

// Long dispersion: profit when realized < benchmark (stocks diverging)
// Short dispersion: profit when realized > benchmark (stocks converging)

pnl = notional * correlationSpread * leverageFactor * positionSign
// positionSign: +1 for long dispersion, -1 for short dispersion
// leverageFactor: 1.5 (calibrated to make trades feel meaningful at $10k scale)
```

### Portfolio Integration
The dispersion trade appears as a single line item in the portfolio:
```
DISP-SPY-BASKET | +$230 | Correlation: 0.42 vs 0.61 benchmark
```

---

## UI in Setup Wizard

1. User selects "Dispersion Trade" as instrument type
2. Picks an index (SPY, QQQ)
3. System suggests 5 default components (top holdings by weight)
4. User can swap components from the supported stock list
5. User selects Long or Short dispersion
6. User sets notional amount
7. System shows "benchmark correlation" so user understands their bet

---

## Narrator Treatment

Dispersion trades get special narrator love:
- On setup: "Ah, a dispersion trade. You absolute maniac."
- If profitable: "Your correlation bet paid off. Explaining this at dinner parties will be insufferable."
- If losing: "Turns out stocks did what stocks do. Together. Against you."
