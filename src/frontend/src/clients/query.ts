import {QueryClient} from "@tanstack/react-query";
import {persistQueryClient} from "@tanstack/react-query-persist-client";
import {createSyncStoragePersister} from "@tanstack/query-sync-storage-persister";

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 1, // 1 hours
      refetchInterval: 1000 * 60 * 60 * 1, // 1 hours
    },
  },
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});
