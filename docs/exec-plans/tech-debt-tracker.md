# Tech Debt Tracker

Known shortcuts and deferred decisions. Review before starting each phase.

| ID | Description | Impact | Phase Introduced | Target Phase |
|---|---|---|---|---|
| TD-001 | American-style options not supported (only European/Black-Scholes) | Medium — limits realism of options strategies | 1 | v2 |
| TD-002 | localStorage leaderboard (personal only, no crowd-sourcing) | Low — good enough for v1 | 1 | v2 |
| TD-003 | Implied volatility approximated from historical vol (not real IV) | Medium — options pricing less realistic | 1 | v2 |
| TD-004 | Custom date range uses nearest scenario files, not truly arbitrary data | Medium — gaps possible | 1 | v2 |
| TD-005 | No unit tests in Phase 1 scaffold | High — add before Phase 2 engine work | 1 | 2 |
| TD-006 | AdSense placeholder slot IDs — real IDs needed before launch | High — no revenue without real IDs | 1 | 4 |
| TD-007 | Monte Carlo projection uses simplified correlation preservation | Low — good enough for "projected" label | 2 | v2 |
| TD-008 | No accessibility audit done | Medium — do before launch | 1 | 4 |
| TD-009 | OG images are placeholder — need real design | Low — affects social sharing | 1 | 4 |
| TD-010 | Dispersion trade leverageFactor (1.5) is hardcoded — needs calibration | Medium — affects trade realism | 2 | 3 |
