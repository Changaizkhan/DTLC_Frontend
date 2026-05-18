import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient.js';

export function AppQueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
