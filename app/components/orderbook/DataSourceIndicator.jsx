/**
 * DataSourceIndicator Component
 *
 * Visually indicates whether the data source is live (connected) or fallback (disconnected).
 *
 * @param {boolean} isConnected - Indicates if the live data source WebSocket is connected.
 *
 * @example
 * <DataSourceIndicator isConnected={true} />
 */

import React from "react";

const DataSourceIndicator = ({ isConnected }) => {
  return (
    <div className="flex items-center gap-1 mb-4">
      <div className="relative">
        <div
          className={`absolute inline-flex h-2 w-2 rounded-full opacity-75 ${
            isConnected ? "bg-blue-400 animate-ping" : "bg-orange-400"
          }`}
        />
        <div
          className={`relative w-2 h-2 rounded-full ${
            isConnected ? "bg-blue-500" : "bg-orange-500"
          }`}
        />
      </div>

      <span
        className={`text-xs ${
          isConnected ? "text-blue-400" : "text-orange-400"
        }`}
      >
        {isConnected ? "Live Data" : "Fallback Data"}
      </span>
    </div>
  );
};

export default DataSourceIndicator;
