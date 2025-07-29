/**
 * OrderbookImbalanceIndicator Component
 *
 * This component visually represents the orderbook imbalance using the top 10 bids and asks.
 *
 * @param {Object} data - Order book data including bids, asks, and last traded price.
 *
 * @example
 * <OrderbookImbalanceIndicator
 *   data={orderbookData}
 * />
 */

import { IMBALANCE_STRENGTH, IMBALANCE_TYPE } from "@/app/utils/constants";
import { formatPrice } from "@/app/utils/formatters";
import { calculatePercentage } from "@/app/utils/mathUtils";
import { Progress } from "@/components/ui/progress";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";

const OrderbookImbalanceIndicator = ({ data }) => {
  const imbalanceData = useMemo(() => {
    if (!data || !data.bids || !data.asks) return null;

    // Calculate total volume for top 10 levels
    const topBids = data.bids.slice(0, 10);
    const topAsks = data.asks.slice(0, 10);

    const bidVolume = topBids.reduce((sum, [, quantity]) => sum + quantity, 0);
    const askVolume = topAsks.reduce((sum, [, quantity]) => sum + quantity, 0);
    const totalVolume = bidVolume + askVolume;

    if (totalVolume === 0) return null;

    const bidPercentage = calculatePercentage(bidVolume, totalVolume);
    const askPercentage = calculatePercentage(askVolume, totalVolume);

    // Calculate imbalance ratio
    const imbalanceRatio =
      askVolume > 0 ? bidVolume / askVolume : bidVolume > 0 ? 999 : 1;

    let imbalanceType = IMBALANCE_TYPE.BALANCED;
    let imbalanceStrength = IMBALANCE_STRENGTH.NEUTRAL;

    if (imbalanceRatio > 1.5) {
      imbalanceType = IMBALANCE_TYPE.BUY_PRESSURE;
      imbalanceStrength =
        imbalanceRatio > 2
          ? IMBALANCE_STRENGTH.STRONG
          : IMBALANCE_STRENGTH.MODERATE;
    } else if (imbalanceRatio < 0.67) {
      imbalanceType = IMBALANCE_TYPE.SELL_PRESSURE;
      imbalanceStrength =
        imbalanceRatio > 0.5
          ? IMBALANCE_STRENGTH.STRONG
          : IMBALANCE_STRENGTH.MODERATE;
    }

    return {
      bidVolume,
      askVolume,
      bidPercentage,
      askPercentage,
      imbalanceRatio,
      imbalanceType,
      imbalanceStrength,
    };
  }, [data]);

  if (!imbalanceData) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Minus className="w-8 h-8 mx-auto mb-2" />
        <p>No orderbook data available for imbalance analysis</p>
      </div>
    );
  }

  const getImbalanceIcon = () => {
    if (imbalanceData.imbalanceType === IMBALANCE_TYPE.BUY_PRESSURE) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (imbalanceData.imbalanceType === IMBALANCE_TYPE.SELL_PRESSURE) {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getImbalanceColor = () => {
    if (imbalanceData.imbalanceType === IMBALANCE_TYPE.BUY_PRESSURE) {
      return imbalanceData.imbalanceStrength === IMBALANCE_STRENGTH.STRONG
        ? "text-green-700"
        : "text-green-600";
    } else if (imbalanceData.imbalanceType === IMBALANCE_TYPE.SELL_PRESSURE) {
      return imbalanceData.imbalanceStrength === IMBALANCE_STRENGTH.STRONG
        ? "text-red-700"
        : "text-red-600";
    }
    return "text-gray-600";
  };

  return (
    <div className="space-y-4">
      {/* Imbalance Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getImbalanceIcon()}
          <span className={`font-semibold ${getImbalanceColor()}`}>
            {imbalanceData.imbalanceType}
          </span>
          <span className="text-sm text-gray-600">
            ({imbalanceData.imbalanceStrength})
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Ratio: {formatPrice(imbalanceData.imbalanceRatio)}:1
        </div>
      </div>

      {/* Volume Distribution */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-green-600">Bid Volume</span>
          <span className="text-red-600">Ask Volume</span>
        </div>
        <div className="relative">
          <Progress value={imbalanceData.bidPercentage} className="h-6" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {imbalanceData.bidPercentage.toFixed(1)}% |{" "}
            {imbalanceData.askPercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-green-50 p-3 rounded">
          <div className="text-green-700 font-medium">Total Bid Volume</div>
          <div className="text-green-800 font-semibold">
            {imbalanceData.bidVolume.toFixed(4)}
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <div className="text-red-700 font-medium">Total Ask Volume</div>
          <div className="text-red-800 font-semibold">
            {imbalanceData.askVolume.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-gray-50 p-3 rounded text-xs text-gray-700">
        <div className="font-medium mb-1">Interpretation:</div>
        {imbalanceData.imbalanceType === "Buy Pressure" && (
          <p>More buying interest than selling. Price may trend upward.</p>
        )}
        {imbalanceData.imbalanceType === "Sell Pressure" && (
          <p>More selling pressure than buying. Price may trend downward.</p>
        )}
        {imbalanceData.imbalanceType === "Balanced" && (
          <p>Relatively balanced order flow. Price likely to remain stable.</p>
        )}
      </div>
    </div>
  );
};

export default OrderbookImbalanceIndicator;
