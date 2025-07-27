import { RECORDS_TO_DISPLAY } from "@/app/utils/constants";
import { formatPrice, formatQuanitity } from "@/app/utils/formatters";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

const PriceQuantityTitle = () => (
  <div className="flex justify-between text-sm font-semibold text-gray-500 my-2">
    <span>Price</span>
    <span>Quantity</span>
  </div>
);

const OrderBookViewer = ({ data, venue, isConnected }) => {
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

  return (
    <div className="space-y-4">
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
              bidsData.map(([price, quantity], index) => (
                <div
                  key={`bid-${index}`}
                  className="flex justify-between items-center p-2 rounded text-xs transition-all duration-200 bg-green-50 hover:bg-green-100"
                >
                  <span className="text-green-600 font-mono font-semibold">
                    ${formatPrice(price)}
                  </span>
                  <span className="font-mono text-gray-700">
                    {formatQuanitity(quantity)}
                  </span>
                </div>
              ))
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
                .map(([price, quantity], index) => (
                  <div
                    key={`ask-${index}`}
                    className="flex justify-between items-center p-2 rounded text-xs transition-all duration-200 bg-red-50 hover:bg-red-100"
                  >
                    <span className="text-red-600 font-mono font-semibold">
                      ${formatPrice(price)}
                    </span>
                    <span className="font-mono text-gray-700">
                      {formatQuanitity(quantity)}
                    </span>
                  </div>
                ))
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
