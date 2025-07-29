/**
 * ConnectionStatus Component
 *
 * Displays a visual indicator (icon and text) showing the current WebSocket connection status.
 *
 * @param {boolean} isConnected - Whether the WebSocket is currently connected.
 * @param {string} venue - Name of the data source or exchange (e.g., "OKX").
 * @param {string} error - Optional error message, if any.
 *
 * @example
 * <ConnectionStatus isConnected={true} venue="OKX" error="" />
 */

import { Database, Globe, Wifi, WifiOff } from "lucide-react";
import React from "react";

const ConnectionStatus = ({ isConnected, venue = "", error = "" }) => {
  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="w-3 h-3 text-green-500" />,
        text: `Websocket connected to ${venue} `,
        color: "text-green-600",
      };
    } else if (error?.includes("REST API")) {
      return {
        icon: <Globe className="w-3 h-3 text-blue-500" />,
        text: error,
        color: "text-blue-600",
      };
    } else if (error?.includes("simulated")) {
      return {
        icon: <Database className="w-3 h-3 text-orange-500" />,
        text: error,
        color: "text-orange-600",
      };
    } else {
      return {
        icon: <WifiOff className="w-3 h-3 text-red-500" />,
        text: error || `Connecting to ${venue}`,
        color: "text-red-600",
      };
    }
  };

  const status = getStatusInfo();

  // Render icon and text with appropriate styles
  return (
    <div className="flex items-center gap-2 text-xs">
      {status.icon}
      <span className={status.color}>{status.text}</span>
    </div>
  );
};

export default ConnectionStatus;
