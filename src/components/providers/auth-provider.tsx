'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Refresh session every 5 minutes to ensure it's up-to-date
      refetchInterval={5 * 60}
      // Refetch when window regains focus (catches logout in other tabs)
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
