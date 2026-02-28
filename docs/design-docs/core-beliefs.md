# Core Beliefs — MoneyBags Engineering Principles

These beliefs inform every technical decision. When in doubt, refer back to these.

## 1. The engine is sacred

`src/engine/` is pure TypeScript with zero UI dependencies. It is the truth. Components are just ways of seeing the truth. If financial logic is creeping into a component, move it to the engine.

## 2. Static data is a feature

Shipping historical price data as static JSON is not a limitation — it's a reliability guarantee. No API rate limits, no network failures, no data drift. The simulator always works, offline if needed.

## 3. Phone first, always

Every UI decision is made at 375px first. Desktop layouts come after. Any component that "only makes sense on desktop" is a product failure, not a design constraint.

## 4. Snarky ≠ Unhelpful

The narrator roasts the market and finance culture, not the user. It never mocks a user for losing or being wrong. It mocks the absurdity of finance itself. Commentary should make users feel like they're in on the joke.

## 5. Complexity is opt-in

The default flow (pick a scenario, hit play) requires zero financial knowledge. Advanced features (dispersion trades, multi-condition rules, iron condors) are discoverable but never required. Beginners and experts share the same codebase.

## 6. No real money, no real fear

The app must be unambiguous that no real money is involved. This affects copy, UI labels, and onboarding. Users should feel free to make wild bets because that's the whole point.

## 7. Types are documentation

TypeScript types in `src/types/` are the canonical definition of domain concepts. If something is unclear, the type should make it clear. Vague types are a documentation debt.

## 8. Agent struggles = harness gaps

When an agent (Claude Code) struggles to implement something, the first question is: "What is missing from the docs or types that would have made this obvious?" Fix the harness, not just the code.
