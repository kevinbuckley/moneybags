#!/usr/bin/env node
/**
 * scripts/source-data.mjs
 * Fetches historical OHLCV data from Yahoo Finance for all instruments × scenarios.
 * Output: public/data/{scenario}/{TICKER}.json
 *
 * Usage: node scripts/source-data.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'data');

// ── Scenarios ─────────────────────────────────────────────────────────────────
const SCENARIOS = {
  'black-monday':       { startDate: '1987-10-01', endDate: '1987-10-31' },
  'dotcom-bubble':      { startDate: '2000-01-03', endDate: '2002-10-09' },
  '2008-crisis':        { startDate: '2008-01-02', endDate: '2009-03-31' },
  'covid-crash':        { startDate: '2020-01-02', endDate: '2020-12-31' },
  '2021-bull-run':      { startDate: '2020-04-01', endDate: '2021-11-30' },
  '2022-crypto-winter': { startDate: '2022-01-03', endDate: '2022-12-31' },
};

// ── Instruments (ticker = internal id, yahoo = Yahoo Finance symbol) ──────────
const INSTRUMENTS = [
  // ETFs
  { ticker: 'SPY',  yahoo: 'SPY',      name: 'SPDR S&P 500 ETF',                type: 'etf',       scenarios: ['2008-crisis','dotcom-bubble','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'QQQ',  yahoo: 'QQQ',      name: 'Invesco QQQ Trust',               type: 'etf',       scenarios: ['2008-crisis','dotcom-bubble','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'VTI',  yahoo: 'VTI',      name: 'Vanguard Total Stock Market ETF', type: 'etf',       scenarios: ['2008-crisis','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'IWM',  yahoo: 'IWM',      name: 'iShares Russell 2000 ETF',        type: 'etf',       scenarios: ['2008-crisis','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'GLD',  yahoo: 'GLD',      name: 'SPDR Gold Shares',                type: 'etf',       scenarios: ['2008-crisis','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'TLT',  yahoo: 'TLT',      name: 'iShares 20+ Year Treasury Bond',  type: 'etf',       scenarios: ['2008-crisis','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'TQQQ', yahoo: 'TQQQ',     name: 'ProShares UltraPro QQQ',          type: 'leveraged', scenarios: ['covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'SQQQ', yahoo: 'SQQQ',     name: 'ProShares UltraPro Short QQQ',    type: 'leveraged', scenarios: ['covid-crash','2021-bull-run','2022-crypto-winter'] },
  // Stocks
  { ticker: 'AAPL', yahoo: 'AAPL',     name: 'Apple Inc.',                      type: 'stock',     scenarios: ['2008-crisis','dotcom-bubble','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'MSFT', yahoo: 'MSFT',     name: 'Microsoft Corporation',           type: 'stock',     scenarios: ['2008-crisis','dotcom-bubble','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'AMZN', yahoo: 'AMZN',     name: 'Amazon.com Inc.',                 type: 'stock',     scenarios: ['2008-crisis','dotcom-bubble','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'TSLA', yahoo: 'TSLA',     name: 'Tesla Inc.',                      type: 'stock',     scenarios: ['covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'NVDA', yahoo: 'NVDA',     name: 'NVIDIA Corporation',              type: 'stock',     scenarios: ['covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'GME',  yahoo: 'GME',      name: 'GameStop Corp.',                  type: 'stock',     scenarios: ['2021-bull-run'] },
  { ticker: 'NFLX', yahoo: 'NFLX',     name: 'Netflix Inc.',                    type: 'stock',     scenarios: ['2008-crisis','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'JPM',  yahoo: 'JPM',      name: 'JPMorgan Chase & Co.',            type: 'stock',     scenarios: ['2008-crisis','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'GS',   yahoo: 'GS',       name: 'Goldman Sachs Group Inc.',        type: 'stock',     scenarios: ['2008-crisis','covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'IBM',  yahoo: 'IBM',      name: 'International Business Machines', type: 'stock',     scenarios: ['black-monday'] },
  // Crypto
  { ticker: 'BTC',  yahoo: 'BTC-USD',  name: 'Bitcoin',                         type: 'crypto',    scenarios: ['covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'ETH',  yahoo: 'ETH-USD',  name: 'Ethereum',                        type: 'crypto',    scenarios: ['covid-crash','2021-bull-run','2022-crypto-winter'] },
  { ticker: 'DOGE', yahoo: 'DOGE-USD', name: 'Dogecoin',                        type: 'crypto',    scenarios: ['2021-bull-run','2022-crypto-winter'] },
  { ticker: 'SOL',  yahoo: 'SOL-USD',  name: 'Solana',                          type: 'crypto',    scenarios: ['2021-bull-run','2022-crypto-winter'] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function r4(n) { return Math.round(n * 10000) / 10000; }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function toDateString(d) {
  // Yahoo returns Date objects; force UTC date string to avoid TZ shift
  const iso = d instanceof Date ? d.toISOString() : String(d);
  return iso.split('T')[0];
}

async function fetchAndWrite(inst, scenarioSlug) {
  const scenario = SCENARIOS[scenarioSlug];
  const outDir = join(OUT_DIR, scenarioSlug);
  const outFile = join(outDir, `${inst.ticker}.json`);
  const label = `${inst.ticker.padEnd(8)} / ${scenarioSlug}`;

  process.stdout.write(`  ${label} ... `);

  let rows;
  try {
    rows = await yahooFinance.historical(
      inst.yahoo,
      { period1: scenario.startDate, period2: scenario.endDate, interval: '1d' },
      { validateResult: false }
    );
  } catch (err) {
    console.log(`ERROR: ${err.message.split('\n')[0]}`);
    return;
  }

  if (!rows || rows.length === 0) {
    console.log('SKIP (no data returned)');
    return;
  }

  const series = rows
    .filter(row => row.close != null && isFinite(row.close))
    .map(row => ({
      date:   toDateString(row.date),
      open:   r4(row.open   ?? row.close),
      high:   r4(row.high   ?? row.close),
      low:    r4(row.low    ?? row.close),
      close:  r4(row.adjClose ?? row.close),
      volume: Math.round(row.volume ?? 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (series.length === 0) {
    console.log('SKIP (all rows invalid)');
    return;
  }

  mkdirSync(outDir, { recursive: true });

  const payload = {
    ticker:    inst.ticker,
    name:      inst.name,
    type:      inst.type,
    scenario:  scenarioSlug,
    startDate: series[0].date,
    endDate:   series[series.length - 1].date,
    currency:  'USD',
    series,
  };

  writeFileSync(outFile, JSON.stringify(payload, null, 2));
  console.log(`OK (${series.length} trading days)`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('MoneyBags — Historical Data Sourcer');
  console.log('=====================================');
  console.log(`Output: ${OUT_DIR}\n`);

  let ok = 0, skipped = 0, errors = 0;

  for (const inst of INSTRUMENTS) {
    for (const scenarioSlug of inst.scenarios) {
      const before = { ok, skipped, errors };
      await fetchAndWrite(inst, scenarioSlug);
      await delay(350); // respect Yahoo Finance rate limits
    }
  }

  console.log('\n=====================================');
  console.log('Done!');
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
