'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache persists for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Don't refetch on window focus (user navigates away and back)
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect
            refetchOnReconnect: false,
            // Retry failed requests once
            retry: 1,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
