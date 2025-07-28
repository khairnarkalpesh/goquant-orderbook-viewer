"use client";

import {
  ORDER_SIDE,
  ORDER_TYPE,
  ORDER_TYPE_OPTIONS,
  SYMBOLS,
  TIMING_OPTIONS,
  VENUES,
} from "@/app/utils/constants";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/app/utils/formatters";

const OrderSimulationForm = ({
  selectedVenue,
  selectedSymbol,
  onVenueChange,
  onSymbolChange,
  onSimulateOrder,
  onClearSimulation,
  orderbookData,
}) => {
  const [orderType, setOrderType] = useState(ORDER_TYPE.LIMIT);
  const [orderSide, setOrderSide] = useState(ORDER_SIDE.BUY);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [timing, setTiming] = useState("0");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const simulatedOrder = {
        venue: selectedVenue,
        symbol: selectedSymbol,
        type: orderType,
        side: orderSide,
        price: orderType === ORDER_TYPE.LIMIT ? Number.parseFloat(price) : 0,
        quantity: Number.parseFloat(quantity),
        timing: Number.parseInt(timing),
        timestamp: Date.now(),
      };

      onSimulateOrder(simulatedOrder);
      console.log(
        `Order simulated successfully: ${JSON.stringify(simulatedOrder)}`
      );
    } catch (error) {
      console.error("Error simulating order:", error);
      setErrors({ general: "Failed to simulate order. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate venue selection
    if (!selectedVenue) {
      newErrors.venue = "Please select a venue";
    }

    // Validate symbol selection
    if (!selectedSymbol) {
      newErrors.symbol = "Please select a symbol";
    }

    // Validate quantity
    if (!quantity || quantity.trim() === "") {
      newErrors.quantity = "Quantity is required";
    } else {
      const quantityNum = Number.parseFloat(quantity);
      if (isNaN(quantityNum) || quantityNum < 0) {
        newErrors.quantity = "Quantity must be a positive number";
      } else if (quantityNum > 1000) {
        newErrors.quantity = "Quantity too large (max 1000)";
      } else if (quantityNum < 0.001) {
        newErrors.quantity = "Quantity too small (min 0.001)";
      }
    }

    // Validate price for limit orders
    if (orderType === ORDER_TYPE.LIMIT) {
      if (!price || price.trim() === "") {
        newErrors.price = "Price is required for limit orders";
      } else {
        const priceNum = Number.parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
          newErrors.price = "Price must be a positive number";
        } else if (orderbookData) {
          const bestBid = orderbookData.bids[0]?.[0] || 0;
          const bestAsk = orderbookData.asks[0]?.[0] || 0;

          // Market-aware validation
          if (orderSide === ORDER_SIDE.BUY && priceNum > bestAsk * 1.2) {
            newErrors.price = "Buy price too far above market (>20%)";
          }
          if (orderSide === ORDER_SIDE.SELL && priceNum < bestBid * 0.8) {
            newErrors.price = "Sell price too far below market (>20%)";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClear = () => {
    setPrice("");
    setQuantity("");
    setOrderType(ORDER_TYPE.LIMIT);
    setOrderSide(ORDER_SIDE.BUY);
    setTiming("0");
    setErrors({});
    onClearSimulation();
  };

  const getSuggestedPrice = () => {
    if (!orderbookData) return "";

    const bestAsk = orderbookData.asks[0]?.[0] || 0;
    const bestBid = orderbookData.bids[0]?.[0] || 0;
    const suggestedPrice =
      orderSide === ORDER_SIDE.BUY
        ? formatPrice(bestBid)
        : formatPrice(bestAsk);
    return suggestedPrice && suggestedPrice.toString();
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">
          Order Simulator Form
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-0">
        {/* Venue Selection */}
        <div>
          <Label htmlFor="venue" className="text-sm font-medium">
            Venue *
          </Label>
          <Select value={selectedVenue} onValueChange={onVenueChange}>
            <SelectTrigger
              className={`w-full mt-1 ${errors.venue ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select venue" />
            </SelectTrigger>
            <SelectContent>
              {VENUES.map((venue) => (
                <SelectItem key={venue} value={venue}>
                  {venue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.venue && (
            <p className="text-red-500 text-xs mt-1">{errors.venue}</p>
          )}
        </div>

        {/* Symbol Selection */}
        <div>
          <Label htmlFor="symbol" className="text-sm font-medium">
            Symbol *
          </Label>
          <Select value={selectedSymbol} onValueChange={onSymbolChange}>
            <SelectTrigger
              className={`w-full mt-1 ${errors.venue ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select symbol" />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.symbol && (
            <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>
          )}
        </div>

        {/* Order Type */}
        <div>
          <Label className="text-sm font-medium">Order Type *</Label>
          <Tabs
            value={orderType}
            onValueChange={setOrderType}
            className="w-full mt-1"
          >
            <TabsList className="grid w-full grid-cols-2">
              {ORDER_TYPE_OPTIONS.map(({ label, value }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-xs sm:text-sm"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Order Side - (Buy/Sell) */}
        <div>
          <Label className="text-sm font-medium">Side *</Label>
          <div className="mt-1 gap-2 grid w-full grid-cols-2">
            <Button
              type="button"
              variant={orderSide === "buy" ? "default" : "outline"}
              className={
                orderSide === "buy"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "text-green-600 border-green-600"
              }
              onClick={() => setOrderSide("buy")}
            >
              Buy
            </Button>
            <Button
              type="button"
              variant={orderSide === "sell" ? "default" : "outline"}
              className={
                orderSide === "sell"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "text-red-600 border-red-600"
              }
              onClick={() => setOrderSide("sell")}
            >
              Sell
            </Button>
          </div>
        </div>

        {/* Price Input */}
        {orderType === "limit" && (
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="price" className="text-sm font-medium">
                Price ($) *
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPrice(getSuggestedPrice())}
                disabled={!orderbookData}
                className="text-xs"
              >
                Use Best Price
              </Button>
            </div>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={errors.price ? "border-red-500" : ""}
              placeholder="Enter limit price"
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <Label htmlFor="quantity" className="text-sm font-medium">
            Quantity *
          </Label>
          <Input
            id="quantity"
            type="number"
            step="0.001"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={errors.quantity ? "border-red-500" : ""}
            placeholder="Enter quantity"
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>

        {/* Timing Simulation Controls */}
        <div>
          <Label htmlFor="timing" className="text-sm font-medium">
            Timing Simulation
          </Label>
          <Select value={timing} onValueChange={setTiming}>
            <SelectTrigger className={`w-full mt-1`}>
              <SelectValue placeholder="Select timing" />
            </SelectTrigger>
            <SelectContent>
              {TIMING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Simulating..." : "Simulate Order"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isSubmitting}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default OrderSimulationForm;
