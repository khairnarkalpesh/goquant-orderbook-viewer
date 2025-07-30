# Real-Time Orderbook Viewer with Rate Limiting

A professional Next.js application built with JavaScript that displays real-time orderbooks from multiple cryptocurrency exchanges with advanced order simulation capabilities, rate limiting, and performance monitoring.

## 🚀 Features

### Core Functionality
- **Multi-Venue Support**: Display orderbooks from OKX, Bybit, and Deribit exchanges
- **Real-Time Updates**: WebSocket connections with intelligent rate limiting
- **Order Simulation**: Simulate market and limit orders with comprehensive impact analysis
- **Visual Order Placement**: See exactly where orders would sit in the orderbook
- **Market Impact Analysis**: Calculate slippage, fill percentage, and market impact
- **Performance Monitoring**: Real-time tracking of updates, render times, and memory usage

### Advanced Features
- **Rate Limiting System**: Configurable throttling to optimize performance
- **Market Depth Visualization**: Interactive depth chart using Recharts
- **Order Placement Visualization**: Advanced analysis of order positioning and execution
- **Orderbook Imbalance Analysis**: Real-time analysis of buy/sell pressure
- **Responsive Design**: Optimized for desktop and mobile trading
- **Professional UI**: Clean, trader-focused interface with animations

## 📚 Libraries and Dependencies

### Core Framework
- **Next.js 15.4.4**: React framework with App Router for optimal performance
- **React 19.1.0**: Core React library for component-based UI
- **React DOM 19.1.0**: React DOM rendering

### UI and Styling
- **Tailwind CSS 3.3.5**: Utility-first CSS framework for styling
- **class-variance-authority 0.7.1**: Utility for creating variant-based component APIs
- **clsx 2.1.1**: Utility for constructing className strings conditionally
- **tailwind-merge 3.3.1**: Utility to merge Tailwind CSS classes

### Data Visualization
- **Recharts 3.1.0**: Composable charting library for React
  - Used for market depth visualization
  - Provides AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
  - Supports real-time data updates and interactive features

### Icons
- **Lucide React 0.525.0**: Beautiful & consistent icon toolkit
  - Provides trading-specific icons (TrendingUp, TrendingDown, etc.)
  - Performance optimized SVG icons
  - Consistent design language

## 🏗️ Architecture and Assumptions

### Exchange API Assumptions

#### OKX Exchange
- **WebSocket URL**: `wss://ws.okx.com:8443/ws/v5/public`
- **Symbol Format**: `BTC-USDT` (base-quote with hyphen, 'T' suffix for spot)
- **Subscription Channel**: `books` channel for orderbook data
- **Data Structure**: Assumes `data[0].bids` and `data[0].asks` arrays with `[price, size]` format
- **Rate Limit**: 500ms throttling

#### Bybit Exchange  
- **WebSocket URL**: `wss://stream.bybit.com/v5/public/linear`
- **Symbol Format**: `BTCUSDT` (concatenated base+quote)
- **Subscription Channel**: `orderbook.50.{symbol}` for level 50 orderbook
- **Data Structure**: Assumes `data.b` (bids) and `data.a` (asks) arrays
- **Ping/Pong**: Requires ping every 20 seconds to maintain connection
- **Rate Limit**: 500ms throttling

#### Deribit Exchange
- **WebSocket URL**: `wss://www.deribit.com/ws/api/v2`
- **Symbol Format**: `BTC-PERPETUAL` (perpetual futures contracts)
- **Subscription Method**: JSON-RPC 2.0 protocol with `public/subscribe`
- **Data Structure**: Assumes `params.data.bids` and `params.data.asks`
- **Rate Limit**: 1000ms throttling

### Data Processing Assumptions

#### Price and Quantity Formatting
- **Price Precision**: Assumes 2 decimal places for display (`formatPrice`)
- **Quantity Precision**: Assumes 4 decimal places for display (`formatQuantity`)
- **Numeric Conversion**: All price/quantity data converted to `Number.parseFloat()`
- **Data Validation**: Filters out invalid entries (price <= 0 or quantity <= 0)

#### Orderbook Structure
- **Bid Sorting**: Descending order (highest price first)
- **Ask Sorting**: Ascending order (lowest price first)
- **Display Levels**: Shows up to 15 levels per side as required
- **Last Price**: Derived from best bid price when not provided

### Order Simulation Assumptions

#### Market Orders
- **Execution Logic**: Consumes orderbook levels sequentially
- **Slippage Calculation**: Based on weighted average execution price vs last trade
- **Fill Logic**: Partial fills possible if insufficient liquidity
- **Time to Fill**: Estimated based on order size (2 seconds per unit, max 30s)

#### Limit Orders
- **Queue Position**: Assumes FIFO (First In, First Out) at same price level
- **Immediate Execution**: Limit orders crossing the spread execute as market orders
- **Price Distance**: Calculates distance from best opposite price
- **Time Estimation**: Based on price distance from market (10s to 5min range)

### Performance and Rate Limiting Assumptions

#### Rate Limiting Strategy
- **Throttling Method**: Latest data wins - queues most recent update
- **Memory Management**: Clears pending updates to prevent memory leaks
- **Performance Targets**: 
  - ≤3 updates/second considered optimal
  - ≤15ms average render time considered good
  - ≤5ms considered excellent

#### Browser Compatibility
- **WebSocket Support**: Assumes modern browser with WebSocket API
- **Performance API**: Uses `performance.now()` and `performance.memory` when available
- **ES6+ Features**: Assumes support for arrow functions, destructuring, async/await
- **CSS Grid/Flexbox**: Modern CSS layout support assumed

### Fallback Mechanisms

#### Mock Data Generation
- **Connection Failures**: Automatically falls back to simulated data
- **Price Simulation**: Different base prices per venue (OKX: 45000, Bybit: 45100, Deribit: 44900)
- **Realistic Spreads**: Generates 20 levels with realistic price increments
- **Update Frequency**: Respects rate limiting even for mock data

#### Error Handling
- **WebSocket Errors**: Graceful degradation to mock data
- **Parsing Errors**: Logs errors but continues operation
- **Network Issues**: Automatic reconnection attempts (not implemented in current version)

## 🎯 Trading Symbols

The application supports the following cryptocurrency trading pairs:
- **BTC-USD**: Bitcoin to US Dollar
- **ETH-USD**: Ethereum to US Dollar  
- **SOL-USD**: Solana to US Dollar
- **DOGE-USD**: Dogecoin to US Dollar
- **ADA-USD**: Cardano to US Dollar
- **DOT-USD**: Polkadot to US Dollar

## ⚙️ Configuration Options

### Order Simulation Timing Options
- **Immediate**: 0ms delay
- **5s delay**: 5000ms delay
- **10s delay**: 10000ms delay
- **30s delay**: 30000ms delay

### Validation Limits
- **Quantity Range**: 0.001 to 1000 units
- **Price Validation**: Market-aware validation (±20% from best price)
- **Rate Limit Range**: 100ms to 5000ms (configurable)

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**: Required for Next.js 15
- **npm or yarn**: Package manager
- **Modern Browser**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+

### Installation

1. **Clone the repository:**
```
git clone https://github.com/khairnarkalpesh/goquant-orderbook-viewer.git
cd goquant-orderbook-viewer
```

2. **Install dependencies:**
```
npm install
```

3. **Start the development server:**
```
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
goquant-orderbook-viewer/
├── app/
│   ├── components/                              # Basic UI components
│   │   ├── orderbook/                           # Orderbook-related visual components
│   │   │   ├── SlippageWarning.jsx              # Warning message for slippage
│   │   │   ├── OrderSimulationForm.jsx          # Form to simulate an order
│   │   │   ├── OrderImpactMetrics.jsx           # Displays impact metrics of an order
│   │   │   ├── OrderBookViewer.jsx              # Main orderbook display component
│   │   │   ├── OrderbookImbalanceIndicator.jsx  # Shows imbalance between buy/sell orders
│   │   │   ├── MarketDepthChart.jsx             # Depth chart visualization
│   │   │   ├── DataSourceIndicator.jsx          # Displays data source(live data or fallback) indicator
│   │   │   ├── ConnectionStatus.jsx             # Progress bar component
│   ├── hooks/
│   │   ├── useOrderbookData.js                  # WebSocket data management with throttling the ui updates
│   │   └── useOrderSimulation.js                # Order simulation logic
│   ├── utils/
│   │   └── constants.js                         # Constants used across the app
│   │   └── formatters.js                        # Number formatting utilities
│   │   └── helpers.js                           # General utility functions
│   │   └── mathUtils.js                         # Math-related helpers (e.g., calculateSlippage, calculateAverage)
│   ├── globals.css                              # Global styles and animations
│   ├── layout.jsx                               # Root layout component
│   └── page.jsx                                 # Main application page
├── components/
│   ├── ui/                                      # Basic UI components
│   │   ├── card.jsx                             # Card container components
│   │   ├── button.jsx                           # Button component with variants
│   │   ├── input.jsx                            # Form input component
│   │   ├── label.jsx                            # Form label component
│   │   ├── select.jsx                           # Dropdown select component
│   │   ├── tabs.jsx                             # Tab navigation component
│   │   ├── radio-group.jsx                      # Radio button group
│   │   ├── progress.jsx                         # Progress bar component
│   │   ├── select.jsx                           # Select component
├── package.json                                 # Dependencies and scripts
├── next.config.mjs                              # Next.js configuration
└── README.md                                    # This file
```

## 🔧 Development Best Practices

### Code Organization
- **Modular Components**: Each component has a single responsibility
- **Custom Hooks**: Business logic separated into reusable hooks
- **Utility Functions**: Common operations abstracted into utilities

### Performance Optimizations
- **Rate Limiting**: Prevents excessive re-renders and API calls
- **Memoization**: React.useMemo for expensive calculations
- **Server Components**: Leverages Next.js Server Components where applicable

### Error Handling
- **Graceful Degradation**: Falls back to mock data on connection failures
- **Form Validation**: Comprehensive client-side validation with user feedback
- **Error Boundaries**: Prevents crashes from component errors
- **Logging**: Console logging for debugging and monitoring

### Accessibility
- **Semantic HTML**: Proper use of semantic elements
- **ARIA Labels**: Screen reader support for interactive elements
- **Color Contrast**: Sufficient contrast ratios for readability

## 🌐 Browser Support

### Minimum Requirements
- **Chrome**: 88+ (WebSocket, ES6+, CSS Grid)
- **Firefox**: 85+ (WebSocket, ES6+, CSS Grid)
- **Safari**: 14+ (WebSocket, ES6+, CSS Grid)
- **Edge**: 88+ (WebSocket, ES6+, CSS Grid)

### Required Browser APIs
- **WebSocket API**: For real-time data connections

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Exchange APIs**: OKX, Bybit, and Deribit for providing public market data
- **UI Components**: Inspired by modern trading platforms and financial applications
- **Charts Library**: Recharts team for excellent React charting components
- **Icons**: Lucide React for beautiful and consistent iconography
- **Framework**: Next.js team for the excellent React framework
- **Community**: Open source contributors and the trading technology community
