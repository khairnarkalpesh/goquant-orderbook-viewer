import { VENUE } from "./constants";

/**
 * Returns the WebSocket URL for a given exchange venue.
 *
 * @param {string} venue - The exchange identifier (e.g., "OKX", "Bybit", "Deribit").
 * @returns {string|null} - The WebSocket URL to connect for public data streams.
 */
export const getWebSocketUrl = (venue) => {
  switch (venue) {
    case VENUE.OKX:
      return "wss://ws.okx.com:8443/ws/v5/public";
    case VENUE.BYBIT:
      return "wss://stream.bybit.com/v5/public/linear"; // Linear contracts
    case VENUE.DERIBIT:
      return "wss://www.deribit.com/ws/api/v2";
    default:
      return null;
  }
};

/**
 * Formats the trading symbol to match the format required by the specific venue.
 *
 * @param {string} symbol - Symbol in "BASE-QUOTE" format (e.g., BTC-USDT).
 * @param {string} venue - The exchange identifier (e.g., "OKX", "Bybit", "Deribit").
 * @returns {string} - The formatted symbol for the selected exchange.
 */
export const formatSymbol = (symbol, venue) => {
  const [base, quote] = symbol.split("-");
  switch (venue) {
    case VENUE.OKX:
      return `${base}-${quote}T`; // BTC-USDT
    case VENUE.BYBIT:
      return `${base}${quote}T`; // BTCUSDT
    case VENUE.DERIBIT:
      return `${base}-PERPETUAL`; // BTC-PERPETUAL
    default:
      return symbol;
  }
};

/**
 * Generates a subscription message based on the venue and symbol.
 * Each venue has a different WebSocket message format for subscribing to the orderbook.
 *
 * @param {string} venue - The exchange identifier (e.g., "OKX", "Bybit", "Deribit").
 * @param {string} symbol - The trading symbol (e.g., BTC-USDT).
 * @returns {object|null} - Subscription message object formatted per venue requirements.
 */
export const getSubscriptionMessage = (venue, symbol) => {
  const formattedSymbol = formatSymbol(symbol, venue);

  switch (venue) {
    case VENUE.OKX:
      return {
        op: "subscribe",
        args: [
          {
            channel: "books",
            instId: formattedSymbol,
          },
        ],
      };
    case VENUE.BYBIT:
      return {
        op: "subscribe",
        args: [`orderbook.50.${formattedSymbol}`], // Level 50 data
      };
    case VENUE.DERIBIT:
      return {
        jsonrpc: "2.0",
        id: 1,
        method: "public/subscribe",
        params: {
          channels: [`book.${formattedSymbol}.none.20.100ms`],
        },
      };
    default:
      return null;
  }
};

/**
 * Parses and normalizes order book data received from different venues.
 *
 * @param {object} data - The raw WebSocket message received from the venue.
 * @param {string} venue - The exchange identifier (e.g., "OKX", "Bybit", "Deribit").
 * @returns {object|null} - A standardized object containing bids, asks, lastPrice, and timestamp, or null if unsupported/invalid.
 */
export const parseOrderBookData = (data, venue) => {
  try {
    console.log(`Parsing ${venue} data:`, data);
    switch (venue) {
      case VENUE.OKX:
        if (data.data && data.data[0]) {
          const book = data.data[0];
          return {
            bids: book.bids.map(([price, size]) => [
              Number.parseFloat(price),
              Number.parseFloat(size),
            ]),
            asks: book.asks.map(([price, size]) => [
              Number.parseFloat(price),
              Number.parseFloat(size),
            ]),
            lastPrice: Number.parseFloat(book.bids[0]?.[0] || 0),
            timestamp: Number.parseInt(book.ts),
          };
        }
        break;
      case VENUE.BYBIT:
        if (data.data) {
          const book = data.data;
          return {
            bids: book.b?.map(([price, size]) => [
              Number.parseFloat(price),
              Number.parseFloat(size),
            ]),
            asks: book.a?.map(([price, size]) => [
              Number.parseFloat(price),
              Number.parseFloat(size),
            ]),
            lastPrice: Number.parseFloat(book.b?.[0]?.[0] || 0),
            timestamp: Number.parseInt(data.ts || Date.now()),
          };
        }
        break;
      case VENUE.DERIBIT:
        if (data.params && data.params.data) {
          const book = data.params.data;
          return {
            bids:
              book.bids?.map(([price, size]) => [
                Number.parseFloat(price),
                Number.parseFloat(size),
              ]) || [],
            asks:
              book.asks?.map(([price, size]) => [
                Number.parseFloat(price),
                Number.parseFloat(size),
              ]) || [],
            lastPrice: Number.parseFloat(book.bids?.[0]?.[0] || 0),
            timestamp: book.timestamp || Date.now(),
          };
        }
        break;
    }
  } catch (error) {
    console.error(`Error parsing ${venue} orderbook data:`, error);
  }
  return null;
};
