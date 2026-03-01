// Layer 3: engine — dividend reinvestment (DRIP)
// NO React, NO Zustand imports allowed

import type { Portfolio } from "@/types/portfolio";
import type { PriceDataMap } from "@/types/instrument";

/**
 * Approximate trailing-12-month annual dividend yields per ticker.
 * Crypto, leveraged products, and non-dividend stocks are 0.
 * Yields are intentionally conservative averages — educational, not investment advice.
 */
const ANNUAL_DIVIDEND_YIELDS: Record<string, number> = {
  // ETFs
  SPY:  0.018,  // ~1.8% — S&P 500
  QQQ:  0.005,  // ~0.5% — NASDAQ-100
  VTI:  0.017,  // ~1.7% — total market
  IWM:  0.014,  // ~1.4% — small-cap
  GLD:  0,      // gold bullion, no income
  TLT:  0.040,  // ~4.0% — 20+ yr treasury coupon
  TQQQ: 0,      // leveraged, decay not income
  SQQQ: 0,
  // Stocks
  AAPL: 0.005,  // ~0.5%
  MSFT: 0.007,  // ~0.7%
  AMZN: 0,      // no dividend
  TSLA: 0,
  NVDA: 0.001,  // ~0.1%
  META: 0.004,  // ~0.4% (started ~2024)
  GME:  0,
  NFLX: 0,
  JPM:  0.025,  // ~2.5%
  GS:   0.024,  // ~2.4%
  IBM:  0.045,  // ~4.5%
  // Crypto — no dividends
  BTC:  0,
  ETH:  0,
  DOGE: 0,
  SOL:  0,
};

const TRADING_DAYS_PER_YEAR = 252;

/**
 * Apply one day of dividend reinvestment to all equity/ETF/bond positions.
 *
 * For each position with a known annual yield > 0, additional fractional shares
 * are added equal to (quantity × annualYield / 252). The share price is unchanged;
 * only quantity (and therefore currentValue) increases.
 *
 * Options, leveraged products, and zero-yield tickers are skipped.
 *
 * @param portfolio Current portfolio state (after recomputeValues for the day)
 * @param priceData Full price data map (used to read current close price)
 * @param dateIndex Current simulation date index
 */
export function applyDripDividends(
  portfolio: Portfolio,
  priceData: PriceDataMap,
  dateIndex: number
): Portfolio {
  let anyChanged = false;

  const positions = portfolio.positions.map((pos) => {
    // Skip options and any position whose ticker is a synthetic option id
    if (pos.type === "option") return pos;

    const annualYield = ANNUAL_DIVIDEND_YIELDS[pos.ticker];
    if (!annualYield) return pos; // zero or unknown — skip

    const dailyYield = annualYield / TRADING_DAYS_PER_YEAR;
    const extraShares = pos.quantity * dailyYield;
    const newQuantity = pos.quantity + extraShares;

    // Use already-recomputed currentPrice (set by recomputeValues step)
    const currentPrice = pos.currentPrice > 0
      ? pos.currentPrice
      : (priceData.get(pos.ticker)?.[dateIndex]?.close ?? 0);

    const newValue = newQuantity * currentPrice;
    anyChanged = true;

    return {
      ...pos,
      quantity: newQuantity,
      currentValue: newValue,
    };
  });

  if (!anyChanged) return portfolio;

  const totalPositionValue = positions.reduce((s, p) => s + p.currentValue, 0);
  return {
    ...portfolio,
    positions,
    totalValue: portfolio.cashBalance + totalPositionValue,
  };
}
