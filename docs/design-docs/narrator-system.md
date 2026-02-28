# Narrator System Design

**Module:** `src/lib/narrator.ts`, `src/components/narrator/`
**Dependencies:** `src/types/`, `src/lib/math.ts`

---

## Overview

The narrator is a snarky commentary system that reacts to simulation events. It outputs two channel types:
1. **Chyron** — a persistent scrolling ticker at the bottom of the screen
2. **Popup** — a transient notification that appears and fades after 4 seconds

The narrator is pure logic: `src/lib/narrator.ts` generates messages as strings. Components in `src/components/narrator/` display them.

---

## NarratorEvent Type

```typescript
interface NarratorEvent {
  id: string
  channel: 'chyron' | 'popup'
  message: string
  trigger: NarratorTrigger
  severity: 'info' | 'warning' | 'critical'  // affects popup styling
  timestamp: string
}

type NarratorTrigger =
  | 'position_up_10'
  | 'position_down_10'
  | 'position_up_25'
  | 'position_down_25'
  | 'portfolio_new_high'
  | 'portfolio_new_low'
  | 'rule_fired'
  | 'manual_trade'
  | 'option_expired_worthless'
  | 'option_exercised'
  | 'margin_call'
  | 'scenario_event'        // major historical event (Lehman, etc.)
  | 'simulation_start'
  | 'simulation_complete'
  | 'ambient'               // background chyron rotation
```

---

## Message Generation

`generateNarratorEvent(trigger, context)` returns a `NarratorEvent` with a randomly selected message from the trigger's message pool.

```typescript
function generateNarratorEvent(
  trigger: NarratorTrigger,
  context: NarratorContext
): NarratorEvent

interface NarratorContext {
  ticker?: string
  changePct?: number
  portfolioValue?: number
  portfolioChangePct?: number
  ruleName?: string
  scenario?: string
}
```

---

## Message Pools (Samples)

### `position_down_10`
- "Down 10%. Bold strategy. Let's see if it pays off."
- "Your {ticker} position is having a moment. A bad one."
- "Ouch. {ticker} just reminded you why diversification exists."
- "That {ticker} position is aging like milk."

### `position_up_25`
- "Look at {ticker} go. Try not to get too attached."
- "Up 25%. The market is rewarding your chaos."
- "{ticker} is up 25%. Please don't tell anyone you knew this would happen."

### `portfolio_new_low`
- "New portfolio low. Somewhere, a finance bro is laughing."
- "You've discovered the floor. Hopefully."
- "This is fine. Everything is fine."

### `margin_call`
- "Margin call. The broker would like their money back immediately."
- "Leverage: the gift that keeps on taking."
- "Your margin position has been forcibly liquidated. Classic."

### `option_expired_worthless`
- "{ticker} options expired worthless. The premium is now a life lesson."
- "Those options are now worth exactly as much as your college advice."
- "To the moon they said. They were wrong."

### `scenario_event` (2008 crisis)
- "Lehman Brothers just filed for bankruptcy. Hope your portfolio is feeling okay."
- "The housing market has done something extremely normal and not at all terrifying."
- "Bear Stearns has entered the chat. Just kidding, they're gone now."

### `ambient` (chyron rotation)
- "BREAKING: Local investor down bad, blames market"
- "Analysts say 'buy low sell high', investors do the opposite"
- "Portfolio diversification: for people who want to lose money slowly"
- "Today's market: nobody knows anything, as usual"
- "Sources confirm: past performance does not indicate future results (but we check anyway)"
- "Reminder: Warren Buffett was not born knowing this stuff either"
- "Breaking: SPY continues to do what SPY does"

---

## Chyron Component

`src/components/narrator/Chyron.tsx`

- Fixed position: `bottom-[60px]` (above playback controls bar)
- Full width, `h-8`
- Scrolling marquee animation using CSS
- Message queue: rotates through ambient messages + event-triggered messages
- Event messages jump to front of queue
- Styling: `bg-surface/80 backdrop-blur border-t border-[#1e1e2e] text-secondary text-xs font-mono`

---

## Popup Component

`src/components/narrator/PopupNotification.tsx`

- Slides up from bottom, above chyron
- Auto-dismisses after 4 seconds
- Stack of up to 3 popups (oldest fades first if overflow)
- `severity` affects left border color: info=accent, warning=yellow, critical=loss
- Swipe-to-dismiss on mobile
- Tap to dismiss on desktop
