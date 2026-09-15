export const BRANCHES = [
  { id: 'jakarta-selatan', name: 'Jakarta Selatan' },
  { id: 'depok', name: 'Depok' },
  { id: 'tokyo', name: 'Tokyo' },
] as const;
export const emptyBranchStocks = () => BRANCHES.map(({ id }) => ({ branch: id, is_available: true, stock: 0 }));
