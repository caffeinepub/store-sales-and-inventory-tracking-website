export const QUERY_KEYS = {
  products: ['products'],
  product: (id?: string) => ['product', id] as const,
  sales: ['sales'],
  sale: (id?: string) => ['sale', id] as const,
  dashboard: ['dashboard'],
} as const;
