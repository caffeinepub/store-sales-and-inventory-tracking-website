import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { QUERY_KEYS } from '@/lib/queryKeys';
import type { DashboardSummary } from '@/backend';

export function useDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery<DashboardSummary>({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}
