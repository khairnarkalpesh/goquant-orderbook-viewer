/**
 * ConnectionStatus Component
 *
 * Displays a visual indicator (icon + text) showing the current connection status
 *
 *
 * Props:
 * - isConnected (boolean): indicates if WebSocket is connected
 * - venue (string): name of the data source or exchange (e.g., "OKX")
 * - error (string): error message
 *
 * Usage:
 * <ConnectionStatus isConnected={true} venue="OKX" error="" />
 */

import { Database, Globe, Wifi, WifiOff } from "lucide-react";
import React from "react";

const ConnectionStatus = ({ isConnected = false, venue = "", error = "" }) => {
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
