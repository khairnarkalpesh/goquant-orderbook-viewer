"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import OrderBookViewer from "./components/OrderBook/OrderBookViewer/OrderBookViewer";
import ConnectionStatus from "./components/orderbook/ConnectionStatus";
import { useOrderbookData } from "./hooks/useOrderbookData";
const VENUS = ["OKX", "Bybit", "Deribit"];
export default function Home() {
  const [selectedVenue, setSelectedVenue] = useState("OKX");
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USD");
  const { orderbookData, isConnected, error } = useOrderbookData(
    selectedVenue,
    selectedSymbol
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Order Book
          </h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            <Card className={"shadow-sm"}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl">
                    Orderbook - {"BTC-USD"}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Last: 45580.26)
                    </span>
                  </CardTitle>

                  <ConnectionStatus
                    isConnected={isConnected}
                    venue={selectedVenue}
                    error={error}
                  />
                </div>
                <Tabs
                  value={selectedVenue}
                  onValueChange={setSelectedVenue}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    {VENUS.map((venue) => (
                      <TabsTrigger
                        key={venue}
                        value={venue}
                        className="text-xs sm:text-sm"
                      >
                        {venue}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <OrderBookViewer
                  data={orderbookData}
                  venue={selectedVenue}
                  isConnected={isConnected}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
