"use client";
import { useEffect, useRef, useState } from "react";
import {
  generateMockOrderbookData,
  getSubscriptionMessage,
  getWebSocketUrl,
  parseOrderBookData,
  throttle,
} from "../utils/helpers";
import { VENUE } from "../utils/constants";

// Rate limiting configuration
const RATE_LIMIT_MS = {
  OKX: 500, // Update every 500ms for OKX
  Bybit: 500, // Update every 500ms for Bybit
  Deribit: 1000, // Update every 1000ms for Deribit
};

export function useOrderbookData(venue, symbol) {
  const [orderbookData, setOrderbookData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);

  useEffect(() => {
    // Reset state and cleanup old connections
    setError(null);
    setIsConnected(false);
    setOrderbookData(null);

    // Clear any existing timeouts
    clearExistingTimeouts();

    const updateOrderbook = throttle(setOrderbookData, RATE_LIMIT_MS[venue]);

    function clearExistingTimeouts() {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    }

    const connectWebSocket = () => {
      const wsUrl = getWebSocketUrl(venue);
      if (!wsUrl) {
        setError(`Unsupported venue: ${venue}`);
        setIsConnected(false);

        // Use mock data as fallback
        setOrderbookData(generateMockOrderbookData(venue));

        return;
      }

      try {
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen = () => {
          setIsConnected(true);
          setError(null);

          // Send subscription message
          const subscriptionMsg = getSubscriptionMessage(venue, symbol);
          if (subscriptionMsg) {
            wsRef.current.send(JSON.stringify(subscriptionMsg));
          }

          // Set up ping for Bybit (required to keep connection alive)
          if (venue === VENUE.BYBIT) {
            pingIntervalRef.current = setInterval(() => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ op: "ping" }));
              }
            }, 20000); // Ping every 20 seconds
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Handle pong responses
            if (data?.op === "pong" || data.pong) {
              return;
            }

            // Handle subscription confirmations
            if (data.success || data.result) {
              return;
            }

            // Parse orderbook data
            const parsedData = parseOrderBookData(data, venue);
            if (parsedData) {
              updateOrderbook(parsedData);
            }
          } catch (error) {
            console.error(`Error parsing ${venue} WebSocket message:`, error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error(`${venue} WebSocket error:`, error);
          setError(`WebSocket failed to connect ${venue}`);
          setIsConnected(false);
          setOrderbookData(generateMockOrderbookData(venue));
        };

        wsRef.current.onclose = (event) => {
          setIsConnected(false);

          // Use mock data as fallback
          setOrderbookData(generateMockOrderbookData(venue));
        };
      } catch (error) {
        console.error(`Failed to connect to ${venue}:`, error);
        setError(`Failed to connect to ${venue}:`, error.message);
        setIsConnected(false);
        setOrderbookData(generateMockOrderbookData(venue));
      }
    };

    // Delay the connection by 500ms
    const connectionTimeout = setTimeout(connectWebSocket, 500);

    // On unmount or change, closes connection and clears intervals
    return () => {
      clearTimeout(connectionTimeout);
      clearExistingTimeouts();
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [venue, symbol]);

  return { orderbookData, isConnected, error };
}
