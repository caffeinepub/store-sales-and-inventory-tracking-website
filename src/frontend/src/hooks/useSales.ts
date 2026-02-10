import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { QUERY_KEYS } from '@/lib/queryKeys';
import type { SaleLineItem, BuyerInfo, Sale } from '@/backend';

export function useRecordSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      lineItems: SaleLineItem[]; 
      notes: string | null;
      buyerInfo: BuyerInfo;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      const saleId = await actor.recordSale(data.lineItems, data.notes, data.buyerInfo);
      if (saleId === BigInt(0)) {
        throw new Error('Sale failed - insufficient inventory or invalid product');
      }
      return saleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sales });
    },
  });
}

export function useAllSales() {
  const { actor, isFetching } = useActor();

  return useQuery<Sale[]>({
    queryKey: QUERY_KEYS.sales,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSales();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSale(saleId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Sale | null>({
    queryKey: QUERY_KEYS.sale(saleId?.toString()),
    queryFn: async () => {
      if (!actor || !saleId) return null;
      return actor.getSale(saleId);
    },
    enabled: !!actor && !isFetching && !!saleId,
  });
}
