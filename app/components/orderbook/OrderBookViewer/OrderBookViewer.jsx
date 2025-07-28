import {
  ORDER_SIDE,
  ORDER_TYPE,
  RECORDS_TO_DISPLAY,
} from "@/app/utils/constants";
import { formatPrice, formatQuantity } from "@/app/utils/formatters";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

const PriceQuantityTitle = () => (
  <div className="flex justify-between text-sm font-semibold text-gray-500 my-2">
    <span>Price</span>
    <span>Quantity</span>
  </div>
);

const OrderBookViewer = ({ data, venue, isConnected, simulatedOrder }) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 sm:h-96 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm">
          Loading {venue} orderbook data...
        </p>
        <p className="text-xs text-gray-400">
          Attempting WebSocket connection...
        </p>
      </div>
    );
  }

  const { bids = [], asks = [], lastPrice = 0 } = data;

  // Filter top 15 bids and asks records
  const bidsData = bids
    .filter(([price, quantity]) => price > 0 && quantity > 0)
    .slice(0, RECORDS_TO_DISPLAY);
  const asksData = asks
    .filter(([price, quantity]) => price > 0 && quantity > 0)
    .slice(0, RECORDS_TO_DISPLAY);

  const bestBid = bidsData[0]?.[0] || 0;
  const bestAsk = asksData[0]?.[0] || 0;
  const spread = bestAsk - bestBid;

  const isSimulatedOrderVisible = (price, side) => {
    console.log({ simulatedOrder, price });
    if (
      !simulatedOrder ||
      simulatedOrder.venue !== venue ||
      simulatedOrder.type === ORDER_TYPE.MARKET
    ) {
      return false;
    }

    return (
      simulatedOrder.side === side &&
      Math.abs(simulatedOrder.price - price) < 0.01
    );
  };

  return (
    <div className="space-y-4">
      {/* Live / Fallback Data Indicator */}
      <div className="flex items-center gap-1 mb-4">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-blue-500" : "bg-orange-500"
          }`}
        />
        <span
          className={`text-xs ${
            isConnected ? "text-blue-400" : "text-orange-400"
          }`}
        >
          {isConnected ? "Live Data" : "Fallback Data"}
        </span>
      </div>

      {/* Simulated Order Position Indicator */}
      {simulatedOrder && simulatedOrder.venue === venue && (
        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-3 text-gray-800">
            Simulated Order Details
          </h4>
          <div className="flex justify-between gap-2 text-xs text-gray-700">
            <div>
              Type:{" "}
              <span
                className={`font-bold ${
                  simulatedOrder.type === ORDER_TYPE.LIMIT
                    ? "text-purple-800 bg-purple-200 px-2 py-1 rounded"
                    : "text-blue-800 bg-blue-200 px-2 py-1 rounded"
                }`}
              >
                {simulatedOrder.type.toUpperCase()}
              </span>
            </div>
            <div>
              Side:{" "}
              <span
                className={`font-bold ${
                  simulatedOrder.side === ORDER_SIDE.BUY
                    ? "text-green-800 bg-green-200 px-2 py-1 rounded"
                    : "text-red-800 bg-red-200 px-2 py-1 rounded"
                }`}
              >
                {simulatedOrder.side.toUpperCase()}
              </span>
            </div>
            <div>
              Quantity:{" "}
              <span className="font-bold">
                {formatQuantity(simulatedOrder.quantity)}
              </span>
            </div>
            {simulatedOrder.type === "limit" && (
              <div>
                Price:{" "}
                <span className="font-bold">
                  ${formatPrice(simulatedOrder.price)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estimated fill percentage
  - Market impact calculation
  - Slippage estimation
  - Time to fill (if applicable) */}

      {/* Orderbook Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bids (Buy Orders List) */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-semibold text-green-600">
              Bids (Buy) - {bidsData.length} levels
            </h3>
          </div>
          <PriceQuantityTitle />
          <div className="space-y-1">
            {bidsData.length > 0 ? (
              bidsData.map(([price, quantity], index) => {
                const isSimulatedOrder = isSimulatedOrderVisible(
                  price,
                  ORDER_SIDE.BUY
                );
                const simulatedQuantity = isSimulatedOrder
                  ? simulatedOrder.quantity
                  : 0;
                return (
                  <div
                    key={`bid-${index}`}
                    className={`flex justify-between items-center p-2 rounded text-xs transition-all duration-200 ${
                      isSimulatedOrder
                        ? "bg-yellow-100 border-2 border-yellow-400 shadow-md transform scale-105 relative"
                        : "bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    <span className="text-green-600 font-mono font-semibold">
                      ${formatPrice(price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-700">
                        {formatQuantity(quantity)}
                      </span>
                      {isSimulatedOrder && (
                        <span className="bg-yellow-500 text-yellow-900 px-1 py-0.5 rounded text-xs font-bold">
                          +{formatQuantity(simulatedQuantity)} SIM
                        </span>
                      )}
                    </div>
                    {isSimulatedOrder && (
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-0 h-0 border-l-4 border-l-yellow-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-center py-4 text-sm">
                No bid data available
              </div>
            )}
          </div>
        </div>

        {/* Asks (Sell Orders List) */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-semibold text-red-600">
              Asks (Sell) - {asksData.length} levels
            </h3>
          </div>
          <PriceQuantityTitle />
          <div className="space-y-1">
            {asksData.length > 0 ? (
              asksData
                .slice()
                .reverse()
                .map(([price, quantity], index) => {
                  const isSimulatedOrder = isSimulatedOrderVisible(
                    price,
                    ORDER_SIDE.SELL
                  );
                  const simulatedQuantity = isSimulatedOrder
                    ? simulatedOrder.quantity
                    : 0;

                  return (
                    <div
                      key={`ask-${index}`}
                      className={`flex justify-between items-center p-2 rounded text-xs transition-all duration-200 ${
                        isSimulatedOrder
                          ? "bg-yellow-50 border-2 border-yellow-400 shadow-md transform scale-105 relative"
                          : "bg-red-50 hover:bg-red-100"
                      }`}
                    >
                      <span className="text-red-600 font-mono font-semibold">
                        ${formatPrice(price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-700">
                          {formatQuantity(quantity)}
                        </span>
                        {isSimulatedOrder && (
                          <span className="bg-yellow-500 text-yellow-900 px-1 py-0.5 rounded text-xs font-bold">
                            +{formatQuantity(simulatedQuantity)} SIM
                          </span>
                        )}
                      </div>
                      {isSimulatedOrder && (
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-0 h-0 border-l-4 border-l-yellow-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <div className="text-gray-500 text-center py-4 text-sm">
                No ask data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Best Bid, Spread and Best Ask */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 rounded py-2 px-3">
          <div className="text-sm text-gray-600">Best Bid</div>
          <div className="font-semibold font-mono text-green-600">
            ${formatPrice(bestBid)}
          </div>
        </div>
        <div className="bg-gray-50 rounded py-2 px-3">
          <div className="text-sm text-gray-600">Spread</div>
          <div className="font-semibold font-mono text-gray-600">
            ${formatPrice(spread)}
          </div>
        </div>
        <div className="bg-red-50 rounded py-2 px-3">
          <div className="text-sm text-gray-600">Best Ask</div>
          <div className="font-semibold font-mono text-red-600">
            ${formatPrice(bestAsk)}
          </div>
        </div>
      </div>

      {/* Data Stats */}
      <div className="text-sm text-gray-500 text-center bg-gray-50 py-2 rounded">
        📊 {bidsData.length} Bids | {asksData.length} Asks | Last: $
        {formatPrice(lastPrice)} | Updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default OrderBookViewer;
