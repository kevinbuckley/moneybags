# Options Pricing Reference

For implementation details, see: [docs/design-docs/options-pricing.md](../design-docs/options-pricing.md)

## Black-Scholes Formula (Quick Reference)

```
d1 = [ln(S/K) + (r + σ²/2) × T] / [σ × √T]
d2 = d1 - σ × √T

Call = S × N(d1) - K × e^(-rT) × N(d2)
Put  = K × e^(-rT) × N(-d2) - S × N(-d1)
```

Where:
- S = current stock price
- K = strike price
- T = time to expiry in years
- r = risk-free rate (annualized)
- σ = volatility (annualized)
- N() = cumulative standard normal distribution function

## Greeks

```
Delta (call) = N(d1)
Delta (put)  = N(d1) - 1
Gamma        = N'(d1) / (S × σ × √T)
Theta (call) = -[S × N'(d1) × σ / (2√T)] - r × K × e^(-rT) × N(d2)
Vega         = S × N'(d1) × √T
```

## Abramowitz & Stegun Normal CDF Approximation

```typescript
function normalCDF(x: number): number {
  const a1 =  0.254829592
  const a2 = -0.284496736
  const a3 =  1.421413741
  const a4 = -1.453152027
  const a5 =  1.061405429
  const p  =  0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return 0.5 * (1.0 + sign * y)
}
```
Error < 7.5×10⁻⁸ — sufficient for simulator use.

## Historical Volatility Calculation

```typescript
// annualized historical volatility from daily close prices
function historicalVolatility(closes: number[], window: number = 30): number {
  const returns = closes.slice(1).map((c, i) => Math.log(c / closes[i]))
  const recent = returns.slice(-window)
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length
  const variance = recent.reduce((a, b) => a + (b - mean) ** 2, 0) / (recent.length - 1)
  return Math.sqrt(variance * 252)  // annualize
}
```

## Risk-Free Rates by Scenario

| Scenario | Approx Rate |
|---|---|
| 2008 Crisis | 2.0% (0.02) |
| Dot-com Bubble | 5.5% (0.055) |
| Black Monday | 6.0% (0.06) |
| COVID Crash | 0.5% (0.005) |
| 2021 Bull Run | 0.25% (0.0025) |
| 2022 Crypto Winter | 3.0% (0.03) |
