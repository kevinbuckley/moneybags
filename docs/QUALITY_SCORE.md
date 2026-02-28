# QUALITY_SCORE.md — MoneyBags Quality Standards

## Code Quality

### TypeScript
- Strict mode enforced (`"strict": true` in tsconfig)
- No `any` types — use `unknown` and narrow, or define proper types
- No `// @ts-ignore` — fix the type instead
- All exported functions have explicit return types

### Linting
- ESLint with Next.js recommended config
- Custom rule: enforce layer dependency model (no upward imports)
- No unused variables, no unused imports
- Consistent import ordering

### Financial Math Accuracy
- All monetary values stored as integers (cents) or use a decimal library — never raw floats for money
- Black-Scholes implementation must match reference outputs within 0.01%
- Monte Carlo output must preserve input volatility within 5% over 1000 runs
- Sharpe ratio, drawdown, beta calculations must have unit tests with known inputs/outputs

---

## UX Quality

### Mobile
- All interactive elements ≥ 44×44px tap target
- No horizontal scroll on any screen at 375px width
- Bottom sheets dismiss correctly on back gesture (Android)
- Charts are touch-responsive (tap tooltip, pinch zoom)
- Safe area insets respected on iOS

### Performance
- Lighthouse mobile score ≥ 80
- Time to interactive < 3s on 4G mobile
- Chart renders ≤ 16ms per tick during simulation
- JSON price data files ≤ 200KB per file (compressed)
- No layout shift (CLS < 0.1) from ad slots

### Accessibility
- All interactive elements keyboard accessible
- Color is never the only indicator of gain/loss (also use +/- prefix and arrows)
- All chart data available in accessible table format (screen reader)
- Focus states visible and styled

---

## Financial Accuracy Standards

| Instrument | Accuracy Requirement |
|---|---|
| Stocks/ETFs | Daily close price within 0.1% of source data |
| Crypto | Daily close price within 0.5% of source data |
| Options (Black-Scholes) | Fair value within 1% of market reference |
| Portfolio returns | Cumulative return within 0.5% of reference calculation |
| Sharpe ratio | Within 0.05 of reference implementation |

---

## Narrator Quality

- Every narrator message reviewed for tone (snarky but not mean)
- No messages reference specific user personal information
- Messages are contextually appropriate (crash messages during crash scenarios)
- No repeated messages within a single simulation session
- Minimum 50 chyron messages, 30 popup triggers defined before launch

---

## Definition of Done

A feature is done when:
1. Implements the spec in the corresponding product-spec doc
2. TypeScript compiles with no errors
3. ESLint passes with no warnings
4. Mobile layout correct at 375px
5. Financial calculations accurate per above standards
6. Relevant design doc updated if behavior changed
