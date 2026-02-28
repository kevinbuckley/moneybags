# Options Pricing Design

**Module:** `src/lib/blackScholes.ts`, `src/engine/options.ts`

---

## Decision: Black-Scholes for European Options

**Resolved:** We use the Black-Scholes model for options pricing. This is the industry standard, implementable in pure TypeScript, and accurate enough for a simulator context.

**Scope:** European-style options only in v1 (exercisable at expiry only). American-style options require a binomial tree model and add significant complexity — deferred to v2.

---

## Black-Scholes Implementation

### Inputs
```typescript
interface BlackScholesInputs {
  S: number      // current underlying price
  K: number      // strike price
  T: number      // time to expiration in years (e.g., 0.25 = 3 months)
  r: number      // risk-free rate (annualized, e.g., 0.05 = 5%)
  sigma: number  // implied volatility (annualized, e.g., 0.30 = 30%)
  type: 'call' | 'put'
}

interface BlackScholesResult {
  price: number   // fair value of the option (per share)
  delta: number   // price sensitivity to underlying
  gamma: number   // delta sensitivity to underlying
  theta: number   // time decay per day
  vega: number    // sensitivity to volatility
  rho: number     // sensitivity to interest rate
}
```

### Formula
```
d1 = (ln(S/K) + (r + sigma²/2) * T) / (sigma * sqrt(T))
d2 = d1 - sigma * sqrt(T)

Call price = S * N(d1) - K * e^(-rT) * N(d2)
Put price  = K * e^(-rT) * N(-d2) - S * N(-d1)

Where N() is the standard normal CDF
```

### Normal CDF Approximation
Use the Abramowitz and Stegun approximation (error < 7.5×10⁻⁸) — accurate enough, no external dependency needed.

---

## Volatility Inputs

Since we're using historical data, implied volatility (IV) is approximated:
- Use the **historical volatility** of the underlying over the past 30 trading days as a proxy for IV
- `sigma = stddev(dailyReturns) * sqrt(252)` (annualized)
- This is a simplification but appropriate for a simulator

---

## Risk-Free Rate

- Use the 3-month US Treasury yield for the relevant historical period
- Hardcoded per scenario as a constant (e.g., 2008 crisis ≈ 2.0%, COVID crash ≈ 0.5%)
- Stored in scenario metadata

---

## Options Lifecycle in Simulation

1. **Position creation (setup):** User specifies ticker, strike, expiry, type (call/put), number of contracts. Engine computes initial fair value using Black-Scholes at the simulation start date.

2. **Each tick:** Engine recomputes option fair value using current underlying price + updated `T` (time remaining). Position value updates accordingly.

3. **Expiry tick:** On the tick that matches the option's expiry date:
   - **In the money:** Exercise automatically. Call: buy shares at strike. Put: sell shares at strike. Net P&L = intrinsic value - premium paid.
   - **Out of the money:** Expire worthless. Full premium lost. Narrator fires `option_expired_worthless` event.

4. **Early close:** User can manually close (sell) an option position at any time. Engine computes current fair value and records the trade.

---

## Option Contracts

- 1 contract = 100 shares
- Dollar cost = `price * 100 * numContracts`
- Cash is debited on purchase, credited on sale/exercise

---

## Supported Strategies (User-Selectable)

The setup wizard allows users to pick an options strategy. Engine builds the positions automatically:

| Strategy | Construction |
|---|---|
| Long Call | Buy 1 call |
| Long Put | Buy 1 put |
| Covered Call | Long stock + sell 1 call |
| Bull Call Spread | Buy 1 call (lower strike) + sell 1 call (higher strike) |
| Bear Put Spread | Buy 1 put (higher strike) + sell 1 put (lower strike) |
| Straddle | Buy 1 call + buy 1 put (same strike, same expiry) |
| Iron Condor | Sell 1 put spread + sell 1 call spread (4 legs) |
