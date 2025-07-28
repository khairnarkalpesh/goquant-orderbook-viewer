// Format a number to 2 decimal places for price display
export const formatPrice = (price) => {
  if (!price) return null;
  return price.toFixed(2);
};

// Format a number to 4 decimal places for quantity display
export const formatQuantity = (quantity) => {
  if (!quantity) return null;
  return quantity.toFixed(4);
};

// Format a number as a percentage with 2 decimal places
export const formatPercentage = (value) => {
  if (!value) return null;
  return `${value.toFixed(2)}%`;
};