// Tests for src/engine/dividends.ts — applyDripDividends

import { describe, it, expect } from "vitest";
import { applyDripDividends } from "../dividends";
import type { Portfolio, Position } from "@/types/portfolio";
import type { PriceDataMap } from "@/types/instrument";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePos(
  ticker: string,
  qty: number,
  price: number,
  type: Position["type"] = "stock"
): Position {
  return {
    id: ticker,
    ticker,
    name: ticker,
    type,
    quantity: qty,
    entryPrice: price,
    entryDate: "2020-01-01",
    currentPrice: price,
    currentValue: qty * price,
  };
}

function makePortfolio(cash: number, positions: Position[] = []): Portfolio {
  const posTotal = positions.reduce((s, p) => s + p.currentValue, 0);
  return { positions, cashBalance: cash, totalValue: cash + posTotal, startingValue: cash + posTotal };
}

function oneDay(ticker: string, close: number): PriceDataMap {
  return new Map([[ticker, [{ date: "2020-01-02", open: close, high: close, low: close, close, volume: 1_000_000 }]]]);
}

const SPY_ANNUAL = 0.018;  // 1.8%
const TLT_ANNUAL = 0.040;  // 4.0%
const TRADING_DAYS = 252;

// ── Zero-yield and skipped tickers ────────────────────────────────────────────

describe("applyDripDividends — no-op cases", () => {
  it("returns same reference when portfolio has no yield-paying positions", () => {
    const portfolio = makePortfolio(0, [makePos("BTC", 1, 50_000, "crypto")]);
    const result = applyDripDividends(portfolio, oneDay("BTC", 50_000), 0);
    expect(result).toBe(portfolio); // exact same reference — no allocation
  });

  it("skips BTC (zero yield)", () => {
    const pos = makePos("BTC", 2, 50_000, "crypto");
    const portfolio = makePortfolio(0, [pos]);
    const result = applyDripDividends(portfolio, oneDay("BTC", 50_000), 0);
    expect(result.positions[0].quantity).toBe(2);
  });

  it("skips TSLA (zero yield)", () => {
    const pos = makePos("TSLA", 10, 250);
    const portfolio = makePortfolio(0, [pos]);
    const result = applyDripDividends(portfolio, oneDay("TSLA", 250), 0);
    expect(result.positions[0].quantity).toBe(10);
  });

  it("skips TQQQ (zero yield leveraged)", () => {
    const pos = makePos("TQQQ", 5, 40, "leveraged" as Position["type"]);
    const portfolio = makePortfolio(0, [pos]);
    const result = applyDripDividends(portfolio, oneDay("TQQQ", 40), 0);
    expect(result.positions[0].quantity).toBe(5);
  });

  it("skips option positions regardless of underlying yield", () => {
    // An SPY short option: type='option', ticker is a synthetic id — no yield applied
    const pos: Position = {
      id: "SPY-550p-2020-02-01-2020-01-01",
      ticker: "SPY-550p-2020-02-01-2020-01-01",
      name: "SPY 550p short",
      type: "option",
      quantity: 1,
      entryPrice: 300,
      entryDate: "2020-01-01",
      currentPrice: 300,
      currentValue: -300,
    };
    const portfolio = makePortfolio(300, [pos]);
    const result = applyDripDividends(portfolio, new Map(), 0);
    expect(result).toBe(portfolio);
  });

  it("does nothing when portfolio has no positions", () => {
    const portfolio = makePortfolio(10_000, []);
    const result = applyDripDividends(portfolio, new Map(), 0);
    expect(result).toBe(portfolio);
  });
});

// ── SPY (1.8% annual) ─────────────────────────────────────────────────────────

describe("applyDripDividends — SPY (1.8% annual yield)", () => {
  it("adds fractional shares equal to qty × (1.8% / 252)", () => {
    const qty = 100;
    const price = 500;
    const portfolio = makePortfolio(0, [makePos("SPY", qty, price, "etf")]);
    const result = applyDripDividends(portfolio, oneDay("SPY", price), 0);

    const expected = qty * (SPY_ANNUAL / TRADING_DAYS);
    expect(result.positions[0].quantity).toBeCloseTo(qty + expected, 8);
  });

  it("currentValue = newQuantity × price", () => {
    const qty = 100;
    const price = 500;
    const portfolio = makePortfolio(0, [makePos("SPY", qty, price, "etf")]);
    const result = applyDripDividends(portfolio, oneDay("SPY", price), 0);

    const expectedQty = qty + qty * (SPY_ANNUAL / TRADING_DAYS);
    expect(result.positions[0].currentValue).toBeCloseTo(expectedQty * price, 4);
  });

  it("cash balance is unchanged (dividends reinvested as shares, not cash)", () => {
    const portfolio = makePortfolio(5_000, [makePos("SPY", 10, 500, "etf")]);
    const result = applyDripDividends(portfolio, oneDay("SPY", 500), 0);
    expect(result.cashBalance).toBe(5_000);
  });

  it("totalValue increases by the value of new fractional shares", () => {
    const qty = 100;
    const price = 500;
    const portfolio = makePortfolio(0, [makePos("SPY", qty, price, "etf")]);
    const result = applyDripDividends(portfolio, oneDay("SPY", price), 0);

    const extraValue = qty * (SPY_ANNUAL / TRADING_DAYS) * price;
    expect(result.totalValue).toBeCloseTo(portfolio.totalValue + extraValue, 4);
  });
});

// ── TLT (4.0% annual) ─────────────────────────────────────────────────────────

describe("applyDripDividends — TLT (4.0% annual yield)", () => {
  it("adds more fractional shares than SPY (higher yield)", () => {
    const price = 87;
    const spyPortfolio  = makePortfolio(0, [makePos("SPY", 100, price, "etf")]);
    const tltPortfolio  = makePortfolio(0, [makePos("TLT", 100, price, "etf")]);

    const spyResult = applyDripDividends(spyPortfolio, oneDay("SPY", price), 0);
    const tltResult = applyDripDividends(tltPortfolio, oneDay("TLT", price), 0);

    const spyExtra = spyResult.positions[0].quantity - 100;
    const tltExtra = tltResult.positions[0].quantity - 100;
    expect(tltExtra).toBeGreaterThan(spyExtra);
  });

  it("daily quantity growth = qty × 4% / 252", () => {
    const qty = 50;
    const price = 87;
    const portfolio = makePortfolio(0, [makePos("TLT", qty, price, "etf")]);
    const result = applyDripDividends(portfolio, oneDay("TLT", price), 0);

    expect(result.positions[0].quantity).toBeCloseTo(qty + qty * (TLT_ANNUAL / TRADING_DAYS), 8);
  });
});

// ── Mixed portfolio ───────────────────────────────────────────────────────────

describe("applyDripDividends — mixed portfolio", () => {
  it("only grows yield-paying positions, leaves zero-yield unchanged", () => {
    const positions = [
      makePos("SPY", 100, 500, "etf"),
      makePos("BTC", 1, 50_000, "crypto"),
      makePos("NVDA", 10, 600),
    ];
    // Build priceData
    const pd: PriceDataMap = new Map();
    pd.set("SPY",  [{ date: "2020-01-02", open: 500,    high: 500,    low: 500,    close: 500,    volume: 1_000_000 }]);
    pd.set("BTC",  [{ date: "2020-01-02", open: 50_000, high: 50_000, low: 50_000, close: 50_000, volume: 5_000 }]);
    pd.set("NVDA", [{ date: "2020-01-02", open: 600,    high: 600,    low: 600,    close: 600,    volume: 2_000_000 }]);

    const portfolio = makePortfolio(0, positions);
    const result = applyDripDividends(portfolio, pd, 0);

    const spyPos  = result.positions.find((p) => p.ticker === "SPY")!;
    const btcPos  = result.positions.find((p) => p.ticker === "BTC")!;
    const nvdaPos = result.positions.find((p) => p.ticker === "NVDA")!;

    expect(spyPos.quantity).toBeGreaterThan(100);       // grew
    expect(btcPos.quantity).toBe(1);                   // zero yield, unchanged
    expect(nvdaPos.quantity).toBeGreaterThan(10);      // NVDA has 0.1% yield → small growth
  });

  it("totalValue = cash + sum of all position values after DRIP", () => {
    const pd: PriceDataMap = new Map([
      ["SPY", [{ date: "2020-01-02", open: 500, high: 500, low: 500, close: 500, volume: 1_000_000 }]],
      ["TLT", [{ date: "2020-01-02", open: 87,  high: 87,  low: 87,  close: 87,  volume: 1_000_000 }]],
    ]);
    const portfolio = makePortfolio(1_000, [
      makePos("SPY", 10, 500, "etf"),
      makePos("TLT", 20, 87,  "etf"),
    ]);
    const result = applyDripDividends(portfolio, pd, 0);
    const posTotal = result.positions.reduce((s, p) => s + p.currentValue, 0);
    expect(result.totalValue).toBeCloseTo(result.cashBalance + posTotal, 6);
  });
});

// ── Compounding accuracy ──────────────────────────────────────────────────────

describe("applyDripDividends — compound growth", () => {
  it("applying 252 times approximates the annual yield growth for SPY", () => {
    const price = 500;
    const initQty = 100;
    let portfolio = makePortfolio(0, [makePos("SPY", initQty, price, "etf")]);
    const pd = oneDay("SPY", price);

    for (let i = 0; i < TRADING_DAYS; i++) {
      portfolio = applyDripDividends(portfolio, pd, 0);
    }

    // Compound formula: qty * (1 + dailyYield)^252 ≈ qty * (1 + annualYield)
    const expectedQty = initQty * Math.pow(1 + SPY_ANNUAL / TRADING_DAYS, TRADING_DAYS);
    expect(portfolio.positions[0].quantity).toBeCloseTo(expectedQty, 4);
    // ≈ 101.8 shares after one year
    expect(portfolio.positions[0].quantity).toBeCloseTo(101.8, 1);
  });

  it("applying once gives a smaller gain than applying 252 times", () => {
    const price = 500;
    const initQty = 100;
    const portfolio = makePortfolio(0, [makePos("SPY", initQty, price, "etf")]);
    const pd = oneDay("SPY", price);

    const after1 = applyDripDividends(portfolio, pd, 0);

    let after252 = portfolio;
    for (let i = 0; i < TRADING_DAYS; i++) after252 = applyDripDividends(after252, pd, 0);

    expect(after252.positions[0].quantity).toBeGreaterThan(after1.positions[0].quantity);
  });
});
