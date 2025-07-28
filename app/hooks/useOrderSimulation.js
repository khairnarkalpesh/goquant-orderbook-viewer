"use client";

import { useState } from "react";

export function useOrderSimulation() {
  const [simulatedOrder, setSimulatedOrder] = useState(null);
  const [isSimulating, setIsSimulating] = useState(null);

  const simulateOrder = (order) => {
    console.log("useOrderSimulation: Received order:", order);

    setIsSimulating(true);

    // Add timing simulation
    if (order.timing > 0) {
      console.log(`Simulating order with ${order.timing}ms delay`);
      setTimeout(() => {
        setSimulatedOrder(order);
        setIsSimulating(false);
        console.log("Order simulation completed:", order);
      }, order.timing);
    } else {
      console.log("Simulating order immediately");
      setSimulatedOrder(order);
      setIsSimulating(false);
    }
  };

  const clearSimulation = () => {
    console.log("Clearing simulation");
    setSimulatedOrder(null);
    setIsSimulating(false);
  };

  return {
    simulatedOrder,
    isSimulating,
    simulateOrder,
    clearSimulation,
  };
}
