"use client";
import { useEffect, useRef, useState } from "react";
import {
  generateMockOrderbookData,
  getSubscriptionMessage,
  getWebSocketUrl,
  parseOrderBookData,
} from "../utils/helpers";
import { VENUE } from "../utils/constants";
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
        setOrderbookData(generateMockOrderbookData(venue));
        return;
      }

      console.log(`Connecting to ${venue} WebSocket`);
      try {
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen = () => {
          console.log(`Connected to ${venue} WebSocket`);
          setIsConnected(true);
          setError(null);

          // Send subscription message
          const subscriptionMsg = getSubscriptionMessage(venue, symbol);
          if (subscriptionMsg) {
            console.log(`Sending subscription to ${venue}:`, subscriptionMsg);
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
            console.log(`${venue} message`, data);

            // Handle pong responses
            if (data?.op === "pong" || data.pong) {
              console.log(`${venue} pong recevied`);
              return;
            }

            // Handle subscription confirmations
            if (data.success || data.result) {
              console.log(`✅ ${venue} subscription confirmed`);
              return;
            }

            // Parse orderbook data
            const parsedData = parseOrderBookData(data, venue);
            if (parsedData) {
              console.log(`${venue} orderbook updated:`, {
                bids: parsedData.bids.length,
                asks: parsedData.asks.length,
                lastPrice: parsedData.lastPrice,
              });
              console.log(parsedData);
              setOrderbookData(parsedData);
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
          console.log(`${venue} Websocket closed:`, event.code, event.reason);
          setIsConnected(false);

          // Use mock data as fallback
          console.log(`Using mock data for ${venue}`);
          setOrderbookData(generateMockOrderbookData(venue));

          // Set up mock data updates
          const mockInterval = setInterval(() => {
            setOrderbookData(generateMockOrderbookData(venue));
          }, 1000);

          // Clean up mock interval when component unmounts
          return () => clearInterval(mockInterval);
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
