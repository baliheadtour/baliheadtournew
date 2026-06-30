export const parsePrice = (rawPrice) => {
  const p = Number(String(rawPrice || 0).replace(/[^0-9.]/g, ''));
  if (!p) return 0;
  
  // Smart converter: if it's over 5000, it's very likely an old IDR value 
  // (e.g. 600,000 IDR instead of $40). 
  // Convert it to USD by dividing by 15000.
  if (p > 5000) {
    return Math.floor(p / 15000);
  }
  
  return p;
};

export const formatUSD = (num) => {
  return `USD ${Number(num).toLocaleString('en-US')}`;
};
