export const MAX_ORDER_LEVELS = 15;

export const VENUE = {
  OKX: "OKX",
  BYBIT: "Bybit",
  DERIBIT: "Deribit",
};

export const VENUES = ["OKX", "Bybit", "Deribit"];

export const SYMBOLS = [
  "BTC-USD",
  "ETH-USD",
  "SOL-USD",
  "DOGE-USD",
  "ADA-USD",
  "DOT-USD",
];

export const ORDER_TYPE = {
  LIMIT: "limit",
  MARKET: "market",
};

export const ORDER_SIDE = {
  BUY: "buy",
  SELL: "sell",
};

export const ORDER_TYPE_OPTIONS = [
  { label: "Market", value: "market" },
  { label: "Limit", value: "limit" },
];

export const TIMING_OPTIONS = [
  { value: "0", label: "Immediate" },
  { value: "5000", label: "5s delay" },
  { value: "10000", label: "10s delay" },
  { value: "30000", label: "30s delay" },
];

export const EXECUTION_TYPE = {
  IMMEDIATE: "immediate",
  PENDING: "pending",
};

export const ORDER_BOOK_TYPE = {
  BID: "bid",
  ASK: "ask",
};

export const IMBALANCE_TYPE = {
  BALANCED: "Balanced",
  BUY_PRESSURE: "Buy Pressure",
  SELL_PRESSURE: "Sell Pressure",
};

export const IMBALANCE_STRENGTH = {
  NEUTRAL: "Neutral",
  MODERATE: "Moderate",
  STRONG: "Strong",
};

// Rate limiting configuration
export const RATE_LIMIT_MS = {
  OKX: 500, // Update every 500ms for OKX
  Bybit: 500, // Update every 500ms for Bybit
  Deribit: 1000, // Update every 1000ms for Deribit
};
