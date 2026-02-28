# DESIGN.md — MoneyBags Design System

## Philosophy

Dark, professional, mobile-first. Feels like a real finance app (eTrade, Robinhood) but with personality injected through typography weight, color on numbers, and the narrator voice. Never garish. Never sterile.

---

## Color Tokens

All colors are defined as Tailwind CSS custom properties. Never use hardcoded hex in components — always use these class names.

### Backgrounds
| Token | Tailwind Class | Value | Usage |
|---|---|---|---|
| bg-base | `bg-base` | `#0a0a0f` | Page background |
| bg-surface | `bg-surface` | `#13131a` | Cards, panels |
| bg-elevated | `bg-elevated` | `#1a1a24` | Modals, sheets |
| bg-border | `bg-border` | `#1e1e2e` | Dividers, borders |

### Text
| Token | Tailwind Class | Usage |
|---|---|---|
| text-primary | `text-primary` | `#f0f0f5` | Main content |
| text-secondary | `text-secondary` | `#8888aa` | Supporting text, labels |
| text-muted | `text-muted` | `#55556a` | Disabled, placeholder |

### Semantic (Financial)
| Token | Tailwind Class | Value | Usage |
|---|---|---|---|
| text-gain | `text-gain` | `#00d084` | Positive returns, up arrows |
| text-loss | `text-loss` | `#ff4757` | Negative returns, down arrows |
| text-neutral | `text-neutral` | `#8888aa` | Flat/unchanged values |

### Brand
| Token | Tailwind Class | Value | Usage |
|---|---|---|---|
| accent | `text-accent` / `bg-accent` | `#7c6aff` | CTAs, active states, links |
| accent-muted | `bg-accent/20` | `#7c6aff33` | Accent backgrounds |

---

## Typography

### Font Stack
- **Display/headings:** Inter (variable), weight 700–900
- **Body:** Inter, weight 400–500
- **Numbers/financial data:** JetBrains Mono (monospace) — all dollar amounts, percentages, tickers

### Scale (mobile-first)
| Element | Mobile | Desktop |
|---|---|---|
| Page title | `text-2xl font-bold` | `text-4xl font-bold` |
| Section heading | `text-lg font-semibold` | `text-xl font-semibold` |
| Card title | `text-base font-semibold` | `text-base font-semibold` |
| Body | `text-sm` | `text-sm` |
| Label/caption | `text-xs text-secondary` | `text-xs text-secondary` |
| Financial figure (large) | `text-3xl font-bold font-mono` | `text-5xl font-bold font-mono` |
| Financial figure (small) | `text-sm font-mono` | `text-sm font-mono` |
| Ticker symbol | `text-xs font-mono font-bold tracking-wider` | same |

---

## Spacing & Layout

- **Base unit:** 4px (Tailwind default)
- **Page padding (mobile):** `px-4` (16px)
- **Card padding:** `p-4` (16px)
- **Section gap:** `gap-4` or `gap-6`
- **Safe area:** Always account for iOS safe areas with `pb-safe` / `pt-safe`

### Mobile Layout Patterns
- **Full-bleed cards:** `mx-0` cards that stretch edge-to-edge on mobile
- **Bottom sheet:** Used for instrument detail, rule builder, confirmations
- **Sticky bottom bar:** Playback controls live here during simulation
- **Chyron:** Fixed at bottom, above the sticky bar

---

## Component Primitives

### Card
```
bg-surface rounded-xl border border-[#1e1e2e] p-4
```

### Button — Primary
```
bg-accent text-white font-semibold rounded-xl px-6 py-3 active:opacity-80
```

### Button — Secondary
```
bg-elevated text-primary font-medium rounded-xl px-6 py-3 border border-[#1e1e2e] active:opacity-80
```

### Input
```
bg-elevated border border-[#1e1e2e] rounded-lg px-3 py-2 text-primary text-sm focus:border-accent focus:outline-none
```

### Badge — Gain
```
bg-gain/10 text-gain text-xs font-mono font-semibold px-2 py-0.5 rounded-full
```

### Badge — Loss
```
bg-loss/10 text-loss text-xs font-mono font-semibold px-2 py-0.5 rounded-full
```

---

## Charts (Recharts)

### Default Chart Config
- Background: transparent
- Grid lines: `#1e1e2e` (subtle)
- Axis labels: `text-secondary` (`#8888aa`)
- Tooltip: `bg-elevated`, `border-[#1e1e2e]`
- Portfolio line: `#7c6aff` (accent purple)
- Gain area fill: `rgba(0, 208, 132, 0.1)`
- Loss area fill: `rgba(255, 71, 87, 0.1)`
- Crosshair: `#1e1e2e`

### Mobile Chart Behavior
- Touch-friendly tooltips (finger tap shows tooltip)
- Pinch-to-zoom on timeline charts
- Simplified axis labels on narrow screens
- Minimum touch target: 44px

---

## Icons

Use `lucide-react`. Preferred icons:
- Trending up/down: `TrendingUp`, `TrendingDown`
- Play/pause/step: `Play`, `Pause`, `SkipForward`
- Portfolio: `Briefcase`
- Dollar: `DollarSign`
- Alert: `AlertCircle`, `Zap`
- Share: `Share2`
- Settings/rules: `Sliders`

---

## Animation

- **Simulation playback:** Chart line animates forward in real-time using Recharts animation props
- **Number changes:** Animate with a count-up effect using a lightweight hook
- **Popups:** Slide up from bottom, fade out after 4s
- **Chyron:** CSS `marquee`-style infinite scroll
- **Page transitions:** None in v1 (keep it snappy)

---

## Ad Placement Visual Rules

- Ad containers always have a minimum height set — never collapse to 0 (causes layout shift)
- Ads are visually separated with a 1px border and `text-muted "Advertisement"` label above
- Never inside charts or over financial data
- On mobile, ads are always full-width within page padding

---

## Responsive Breakpoints

Following Tailwind defaults, but design targets:
| Breakpoint | Width | Notes |
|---|---|---|
| Base (mobile) | 375px+ | Primary design target |
| sm | 640px+ | Tablet portrait |
| md | 768px+ | Tablet landscape |
| lg | 1024px+ | Desktop |

Most layouts are single-column on mobile, two-column on `md+`.
