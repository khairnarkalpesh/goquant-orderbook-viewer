export const RECORDS_TO_DISPLAY = 15;

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
  MARKET: "market"
}

export const ORDER_SIDE = {
  BUY: "buy",
  SELL: "sell"
}

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
