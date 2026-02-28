# RELIABILITY.md — MoneyBags Reliability Standards

## Deployment

- Deployed to Vercel (static + edge)
- All pages statically generated where possible
- No server-side compute in v1 — pure client-side simulation
- Zero-downtime deploys via Vercel preview + production workflow

## Data Reliability

- Historical price JSON files are immutable once sourced — never modified in production
- Missing price data for a requested ticker must fail gracefully (remove from portfolio, show warning)
- Corrupted JSON must be caught at load time with a try/catch, not crash the app
- Projection (Monte Carlo) runs entirely in-browser — no external dependency

## State Reliability

- Simulation state is ephemeral — if user refreshes mid-simulation, they restart from setup
- Leaderboard is persisted to `localStorage` — must handle corrupted/missing data gracefully on load
- No simulation state is ever written to any server in v1

## Error Boundaries

- React error boundary wraps the simulation screen — engine crash shows error card, not blank screen
- React error boundary wraps each results section independently — partial failure doesn't kill the whole results page
- Ad slot failure (AdSense script error) must not affect app rendering

## Simulation Engine Reliability

- Engine is pure functions — same input always produces same output (deterministic for historical, seeded-random for projection)
- Rules engine: maximum 10 rules, maximum 5 conditions per rule — prevent runaway evaluation loops
- Simulation tick must complete in < 16ms to maintain 60fps during movie mode playback
- If a tick takes > 16ms, slow down playback speed automatically rather than skip ticks

## Browser Compatibility

Target:
- iOS Safari 16+
- Chrome Android 110+
- Desktop Chrome, Firefox, Safari (latest 2 versions)

Not supported:
- IE11
- Old Android WebView
- Any browser without ES2020 support
