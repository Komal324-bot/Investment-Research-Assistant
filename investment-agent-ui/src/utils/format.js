export const formatPrice = (price) =>
  price == null || Number.isNaN(Number(price)) ? "N/A" : `$${Number(price).toFixed(2)}`;

export const formatMarketCap = (marketCap) => {
  if (!marketCap) return null;
  const value = Number(marketCap);
  if (Number.isNaN(value)) return null;
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
};

export const recommendationTone = (value) => {
  switch ((value || "").toUpperCase()) {
    case "BUY":
      return "success";
    case "SELL":
      return "error";
    default:
      return "warning";
  }
};

export const parseHistoryAnalysis = (historyItem) => {
  if (!historyItem?.aiResponse) return null;
  try {
    return JSON.parse(historyItem.aiResponse);
  } catch {
    return null;
  }
};
