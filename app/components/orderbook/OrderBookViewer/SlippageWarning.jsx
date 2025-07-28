import { ORDER_SIDE, ORDER_TYPE } from "@/app/utils/constants";
import {
  calculateOrderFillMetrics,
  calculateSlippage,
} from "@/app/utils/mathUtils";
import { AlertTriangle } from "lucide-react";
import React from "react";

const SlippageWarning = ({ simulatedOrder, orderbookData, venue }) => {
  // Uncomment this test data to check Slippage Warning
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
  //   venue = "okx";

  if (!simulatedOrder || simulatedOrder.venue !== venue || !orderbookData)
    return null;

  const { bids, asks, lastPrice } = orderbookData;
  let slippage = 0;
  let warning = "";

  if (simulatedOrder.type === ORDER_TYPE.MARKET) {
    const orders = simulatedOrder.side === ORDER_SIDE.BUY ? asks : bids;
    const { filledQuantity, avgPrice } = calculateOrderFillMetrics(
      orders,
      simulatedOrder.quantity
    );

    if (filledQuantity > 0) {
      slippage = calculateSlippage(lastPrice, avgPrice);

      if (slippage > 0.5) {
        warning =
          "HIGH SLIPPAGE WARNING: This order may cause significant market impact!";
      } else if (slippage > 0.2) {
        warning =
          "MODERATE SLIPPAGE: Consider splitting this order into smaller sizes.";
      }
    }
  }

  if (!warning) return null;

  return (
    <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <span className="text-red-800 font-semibold text-sm">{warning}</span>
      </div>
      <div className="text-red-700 text-xs mt-1">
        Estimated slippage: {slippage.toFixed(3)}%
      </div>
    </div>
  );
};

export default SlippageWarning;
