import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { QUERY_KEYS } from '@/lib/queryKeys';
import type { SaleLineItem } from '@/backend';

export function useRecordSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { lineItems: SaleLineItem[]; notes: string | null }) => {
      if (!actor) throw new Error('Actor not initialized');
      const saleId = await actor.recordSale(data.lineItems, data.notes);
      if (saleId === BigInt(0)) {
        throw new Error('Sale failed - insufficient inventory or invalid product');
      }
      return saleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
    },
  });
}
