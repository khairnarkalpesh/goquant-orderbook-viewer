"use client";

import { useState } from "react";

export function useOrderSimulation() {
  const [simulatedOrder, setSimulatedOrder] = useState(null);
  const [isSimulating, setIsSimulating] = useState(null);

  const simulateOrder = (order) => {

    setIsSimulating(true);

    // Add timing simulation
    if (order.timing > 0) {
      setTimeout(() => {
        setSimulatedOrder(order);
        setIsSimulating(false);
      }, order.timing);
    } else {
      setSimulatedOrder(order);
      setIsSimulating(false);
    }
  };

  const clearSimulation = () => {
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
