/**
 * MarketDepthChart component
 *
 * Renders a visual representation of the market depth using a step chart for bids and asks.
 * - Props:
 *   @param {Object} data - Orderbook data for market depth.
 *   @param {Object} simulatedOrder - Order object (limit or market) to visualize on the chart.
 * 
 * @example
 * <MarketDepthChart
 *   data={orderbookData}
 *   simulatedOrder={simulatedOrder}
 * />

 */

"use client";
import { ORDER_BOOK_TYPE } from "@/app/utils/constants";
import { formatPrice, formatQuantity } from "@/app/utils/formatters";
import { calculateChartPoints } from "@/app/utils/mathUtils";
import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MarketDepthChart = ({ data, simulatedOrder }) => {
  const chartData = useMemo(() => {
    if (!data) return [];

    const { bids, asks } = data;

    // Calculate bids and asks chartpoints
    const bidsChartPoints = calculateChartPoints(bids, ORDER_BOOK_TYPE.BID);
    const asksChartPoints = calculateChartPoints(asks, ORDER_BOOK_TYPE.ASK);
    const chartPoints = [...bidsChartPoints, ...asksChartPoints];

    // Sort chartpoints in ascending order of price
    return chartPoints.sort((a, b) => a.price - b.price);
  }, [data]);

  if (!data || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-80 bg-gray-50 rounded">
        <div className="text-gray-500 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm">Market depth data not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        Showing cumulative volume across {chartData.length} price levels
      </div>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="price"
              type="number"
              scale="linear"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              fontSize={12}
            />
            <YAxis
              tickFormatter={(value) => formatPrice(value)}
              fontSize={12}
            />
            <Tooltip
              formatter={(value, name) => [
                formatQuantity(value),
                name === "bidVolume"
                  ? "Cumulative Bid Volume"
                  : "Cumulative Ask Volume",
              ]}
              labelFormatter={(value) => `Price: $${formatPrice(value)}`}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
            <Area
              type="stepAfter"
              dataKey="bidVolume"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Area
              type="stepBefore"
              dataKey="askVolume"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            {simulatedOrder &&
              simulatedOrder.type === "limit" &&
              simulatedOrder.price > 0 && (
                <>
                  <ReferenceLine
                    x={simulatedOrder.price}
                    stroke="#f59e0b"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    label={{
                      value: `${simulatedOrder.side.toUpperCase()} ORDER`,
                      position: "topRight",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        fill: "#f59e0b",
                      },
                    }}
                  />
                  <ReferenceLine
                    x={simulatedOrder.price}
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeOpacity={0.3}
                  />
                </>
              )}

            {/* Add market order visualization */}
            {simulatedOrder && simulatedOrder.type === "market" && (
              <ReferenceLine
                x={data.lastPrice}
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="4 4"
                label={{
                  value: `MARKET ${simulatedOrder.side.toUpperCase()}`,
                  position: "topLeft",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    fill: "#ef4444",
                  },
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketDepthChart;
