/**
 * OrderImpactMetrics Component
 *
 * Calculates and displays metrics like average price, filled quantity, and slippage
 * for a simulated order based on the current order book data.
 *
 * @param {Object} props
 * @param {Object} props.simulatedOrder - The simulated order (includes type, side, quantity, venue).
 * @param {string} props.venue - The trading venue associated with the order (e.g., "okx").
 * @param {Object} props.orderbookData - Order book data including bids, asks, and last traded price.
 *
 * @example
 * <OrderImpactMetrics
 *   simulatedOrder={simulatedOrder}
 *   venue="okx"
 *   orderbookData={orderbookData}
 * />
 */

import { EXECUTION_TYPE, ORDER_SIDE, ORDER_TYPE } from "@/app/utils/constants";
import { formatPrice } from "@/app/utils/formatters";
import {
  calculateOrderFillMetrics,
  calculateSlippage,
} from "@/app/utils/mathUtils";
import { AlertTriangle } from "lucide-react";
import React from "react";

const OrderImpactMetrics = ({ simulatedOrder, venue, orderbookData }) => {
//   simulatedOrder = {
//     type: "market",
//     side: "buy",
//     quantity: 100,
//     venue: "okx",
//   };

//   orderbookData = {
//     lastPrice: 10.0,
//     bids: [
//       [9.9, 50],
//       [9.8, 50],
//       [9.7, 50],
//     ],
//     asks: [
//       [10.1, 20],
//       [10.3, 30],
//       [10.5, 100],
//     ],
//   };
//   venue = "okx"
  if (!simulatedOrder || simulatedOrder.venue !== venue || !orderbookData)
    return null;

  const { bids, asks, lastPrice } = orderbookData;
  const orders = simulatedOrder.side === ORDER_SIDE.BUY ? asks : bids;
  let metrics = null;

  const { filledQuantity, fillPercentage, avgPrice } =
    calculateOrderFillMetrics(orders, simulatedOrder.quantity);

  let convertedFillPercentage;
  let convertedSlippage;
  let marketImpact;
  let slippage;
  let timeToFill;

  if (filledQuantity > 0) {
    slippage = calculateSlippage(lastPrice, avgPrice);
    timeToFill =
      simulatedOrder.quantity > 1
        ? Math.min(simulatedOrder.quantity * 2, 30)
        : 1;

    convertedFillPercentage = Math.round(fillPercentage * 100) / 100;
    convertedSlippage = Math.round(slippage * 1000) / 1000;
    marketImpact = slippage > 0.5 ? "High" : slippage > 0.2 ? "Medium" : "Low";
  }

  // Calculate metrics for both market and limit orders
  if (simulatedOrder.type === ORDER_TYPE.MARKET) {
    metrics = {
      fillPercentage: convertedFillPercentage,
      avgPrice,
      slippage: convertedSlippage,
      marketImpact,
      timeToFill,
      orderType: ORDER_TYPE.MARKET,
    };
  } else if (simulatedOrder.type === ORDER_TYPE.LIMIT) {
    const orderPrice = simulatedOrder.price;
    // Check if limit order would execute immediately
    const bestOppositePrice =
      simulatedOrder.side === ORDER_SIDE.BUY ? asks[0]?.[0] : bids[0]?.[0];
    const wouldExecuteImmediately =
      simulatedOrder.side === ORDER_SIDE.BUY
        ? orderPrice >= bestOppositePrice
        : orderPrice <= bestOppositePrice;

    if (wouldExecuteImmediately) {
      metrics = {
        fillPercentage: Math.round(fillPercentage * 100) / 100,
        avgPrice,
        slippage: convertedSlippage,
        marketImpact,
        timeToFill: 1, // Immediate execution
        orderType: "limit",
        executionType: EXECUTION_TYPE.IMMEDIATE,
      };
    } else {
      // Order would sit in the book
      const priceDistance =
        simulatedOrder.side === ORDER_SIDE.BUY
          ? ((bestOppositePrice - orderPrice) / bestOppositePrice) * 100
          : ((orderPrice - bestOppositePrice) / bestOppositePrice) * 100;

      // Estimate time to fill based on price distance from market
      let estimatedTimeToFill = 60; // Default 1 minute
      if (priceDistance < 0.1) estimatedTimeToFill = 10;
      else if (priceDistance < 0.5) estimatedTimeToFill = 30;
      else if (priceDistance < 1) estimatedTimeToFill = 120;
      else estimatedTimeToFill = 300; // 5 minutes for far from market

      metrics = {
        fillPercentage: 0, // Won't fill immediately
        avgPrice: orderPrice,
        slippage: 0, // No slippage for limit orders that don't execute immediately
        marketImpact: "Low", // Limit orders don't cause immediate market impact
        timeToFill: estimatedTimeToFill,
        orderType: ORDER_TYPE.LIMIT,
        executionType: EXECUTION_TYPE.PENDING,
        priceDistance: Math.abs(priceDistance),
      };
    }
  }

  if (!metrics) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
      <h4 className="font-semibold text-sm mb-3 text-blue-800 flex items-center gap-2">
        Order Impact Analysis
        <span className="text-xs bg-blue-200 px-2 py-1 rounded">
          {metrics.orderType.toUpperCase()}
          {metrics.executionType && ` - ${metrics.executionType.toUpperCase()}`}
        </span>
      </h4>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white p-2 rounded">
          <span className="text-gray-600 block">Fill Percentage:</span>
          <span
            className={`font-semibold text-lg ${
              metrics.fillPercentage === 100
                ? "text-green-600"
                : metrics.fillPercentage > 50
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {metrics.fillPercentage}%
          </span>
        </div>

        <div className="bg-white p-2 rounded">
          <span className="text-gray-600 block">Avg Price:</span>
          <span className="font-semibold text-lg">
            ${formatPrice(metrics.avgPrice)}
          </span>
        </div>

        <div className="bg-white p-2 rounded">
          <span className="text-gray-600 block">Slippage:</span>
          <span
            className={`font-semibold text-lg ${
              metrics.slippage > 0.5
                ? "text-red-600"
                : metrics.slippage > 0.2
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {metrics.slippage}%
          </span>
        </div>

        <div className="bg-white p-2 rounded">
          <span className="text-gray-600 block">Time to Fill:</span>
          <span className="font-semibold text-lg">
            {metrics.timeToFill < 60
              ? `${metrics.timeToFill}s`
              : `${Math.round(metrics.timeToFill / 60)}m`}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-xs">Market Impact:</span>
          <span
            className={`font-semibold px-2 py-1 rounded text-xs ${
              metrics.marketImpact === "High"
                ? "bg-red-100 text-red-700"
                : metrics.marketImpact === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {metrics.marketImpact}
          </span>
        </div>

        {metrics.priceDistance !== undefined && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-600 text-xs">Distance from Market:</span>
            <span className="font-semibold text-xs">
              {formatPrice(metrics.priceDistance)}%
            </span>
          </div>
        )}
      </div>

      {/* Execution Warning for Limit Orders */}
      {metrics.orderType === ORDER_TYPE.LIMIT &&
        metrics.executionType === EXECUTION_TYPE.IMMEDIATE && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-600" />
              <span className="text-yellow-800 text-xs font-medium">
                This limit order will execute immediately as a market order!
              </span>
            </div>
          </div>
        )}
    </div>
  );
};

export default OrderImpactMetrics;
