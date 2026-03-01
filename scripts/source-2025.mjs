#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'data', '2025-tariff-shock');

const START = '2025-01-02';
const END = '2025-12-31';

const INSTRUMENTS = [
  { ticker: 'SPY',  yahoo: 'SPY' },
  { ticker: 'QQQ',  yahoo: 'QQQ' },
  { ticker: 'AAPL', yahoo: 'AAPL' },
  { ticker: 'NVDA', yahoo: 'NVDA' },
  { ticker: 'MSFT', yahoo: 'MSFT' },
  { ticker: 'AMZN', yahoo: 'AMZN' },
  { ticker: 'META', yahoo: 'META' },
  { ticker: 'TSLA', yahoo: 'TSLA' },
  { ticker: 'GLD',  yahoo: 'GLD' },
  { ticker: 'TLT',  yahoo: 'TLT' },
  { ticker: 'BTC',  yahoo: 'BTC-USD' },
  { ticker: 'ETH',  yahoo: 'ETH-USD' },
];

function r4(n) { return Math.round(n * 10000) / 10000; }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function toDateString(d) {
  const iso = d instanceof Date ? d.toISOString() : String(d);
  return iso.split('T')[0];
}

mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  console.log('Fetching 2025-tariff-shock data...\n');
  for (const inst of INSTRUMENTS) {
    process.stdout.write(`  ${inst.ticker.padEnd(6)} ... `);
    try {
      const rows = await yahooFinance.historical(
        inst.yahoo,
        { period1: START, period2: END, interval: '1d' },
        { validateResult: false }
      );
      if (!rows || rows.length === 0) { console.log('SKIP (no data)'); continue; }
      const series = rows
        .filter(r => r.close != null && isFinite(r.close))
        .map(r => ({
          date:   toDateString(r.date),
          open:   r4(r.open ?? r.close),
          high:   r4(r.high ?? r.close),
          low:    r4(r.low ?? r.close),
          close:  r4(r.adjClose ?? r.close),
          volume: Math.round(r.volume ?? 0),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      const payload = { ticker: inst.ticker, scenario: '2025-tariff-shock', startDate: series[0].date, endDate: series[series.length-1].date, currency: 'USD', series };
      writeFileSync(join(OUT_DIR, `${inst.ticker}.json`), JSON.stringify(payload, null, 2));
      console.log(`OK (${series.length} days)`);
    } catch(err) {
      console.log(`ERROR: ${err.message.split('\n')[0]}`);
    }
    await delay(400);
  }
  console.log('\nDone!');
}
main().catch(e => { console.error(e); process.exit(1); });
