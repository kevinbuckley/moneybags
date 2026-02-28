# SECURITY.md — MoneyBags Security Guidelines

## Threat Model

MoneyBags is a fully client-side application with no user accounts, no real money, and no sensitive personal data in v1. The attack surface is minimal. The primary risks are:

1. **Ad network injection** — AdSense scripts executing malicious code
2. **XSS via user inputs** — instrument search, rule builder inputs
3. **Supply chain attacks** — compromised npm dependencies
4. **localStorage tampering** — manipulated leaderboard data

## Input Sanitization

- All user text inputs (instrument search, dollar amounts) are validated before use
- Dollar amounts: validate as positive numbers, cap at $1,000,000,000
- Ticker inputs: sanitize to alphanumeric + dash only, max 10 chars
- Rule inputs: validate all numeric conditions as finite numbers within realistic bounds
- No user input is ever rendered as raw HTML (no `dangerouslySetInnerHTML` with user data)

## Content Security Policy

Configure Next.js headers to set a strict CSP:
- Restrict `script-src` to self + Google AdSense domains
- Restrict `connect-src` to self (no external API calls in v1)
- Restrict `frame-src` to none

## Dependencies

- Keep dependencies minimal — no unnecessary packages
- Run `pnpm audit` as part of CI
- Pin major versions in `package.json`
- Review any package that executes code at install time

## localStorage

- Leaderboard data is untrusted on read — always parse with try/catch and validate schema before use
- Never store anything sensitive in localStorage (not applicable in v1, but enforce as a rule)
- Leaderboard entries are display-only — no localStorage value should ever affect simulation logic

## AdSense Security

- Load AdSense via `next/script` with `strategy="afterInteractive"` — never blocking
- AdSense runs in its own iframe sandbox — cannot access main page DOM
- Monitor for any AdSense policy violations in production

## No Server, No Auth = Minimal Risk

In v1, there is no backend, no database, no authentication, and no PII collected. This means:
- No SQL injection surface
- No auth token vulnerabilities
- No CSRF risk
- No server-side vulnerabilities

This simplicity is intentional and should be preserved as long as possible.
