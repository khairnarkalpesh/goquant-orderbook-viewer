import { MAX_ORDER_LEVELS, ORDER_BOOK_TYPE } from "./constants";

/**
 * Calculates order fill metrics such as:
 * - How much of the order is filled
 * - The average price at which it's filled
 * - The percentage of the order that is filled
 *
 * @param {Array<[number, number]>} orders - List of [price, quantity] tuples from the order book.
 * @param {number} quantity - The desired quantity to fill.
 * @returns {{
 *   filledQuantity: number,
 *   fillPercentage: number,
 *   avgPrice: number
 * }}
 */
export function calculateOrderFillMetrics(orders, quantity) {
  let remainingQuantity = quantity;
  let totalCost = 0;

  for (const [price, quantity] of orders) {
    if (remainingQuantity <= 0) break;
    const fillAmount = Math.min(remainingQuantity, quantity);
    totalCost += fillAmount * price;
    remainingQuantity -= fillAmount;
  }

  const filledQuantity = quantity - remainingQuantity;
  const fillPercentage =
    filledQuantity > 0 ? (filledQuantity / quantity) * 100 : 0;
  const avgPrice = calculateAverage(totalCost, filledQuantity);

  return { filledQuantity, fillPercentage, avgPrice };
}

/**
 * Calculates the average given the total and the count of items.
 * @param {number} total - The sum of all values
 * @param {number} count - The number of values
 * @returns {number} The average value
 */
function calculateAverage(total, count) {
  if (typeof total !== "number" || typeof count !== "number" || count === 0)
    return 0;
  return total / count;
}

/**
 * Calculates the slippage percentage between expected and actual price.
 *
 * @param {number} expected - The expected price (e.g., best bid/ask (lastPrice)).
 * @param {number} actual - The actual price of the order (avgPrice).
 * @returns {number} - Slippage in percentage (positive or negative).
 */
export function calculateSlippage(expected, actual) {
  if (!expected || !actual) return 0;
  return Math.abs((actual - expected) / expected) * 100;
}

/**
 * Generates cumulative volume chart points from order data.
 *
 * @param {Array} orders - Array of [price, volume] pairs (bids or asks).
 * @param {string} type - "bid" or "ask".
 * @returns {Array} - Formatted chart points with cumulative volume.
 */
export const calculateChartPoints = (orders, type) => {
  const chartPoints = [];
  let cumulativeVolume = 0;

  for (let i = 0; i < Math.min(orders.length, MAX_ORDER_LEVELS); i++) {
    const [price, volume] = orders[i];
    if (price > 0 && volume > 0) {
      cumulativeVolume += volume;
      chartPoints.push({
        price,
        bidVolume: type === ORDER_BOOK_TYPE.BID ? cumulativeVolume : 0,
        askVolume: type === ORDER_BOOK_TYPE.ASK ? cumulativeVolume : 0,
        type,
      });
    }
  }

  return chartPoints;
};
