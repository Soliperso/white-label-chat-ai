'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    // In production, skip MSW entirely
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      setMswReady(true);
      return;
    }

    // Set up a safety timeout first
    const safetyTimeout = setTimeout(() => {
      console.warn('[MSW] Safety timeout reached - continuing without MSW');
      setMswReady(true);
    }, 2000);

    // Dynamically import and start MSW
    async function initMocks() {
      try {
        const { worker } = await import('@/mocks/browser');

        await Promise.race([
          worker.start({
            onUnhandledRequest: 'bypass',
            quiet: false,
          }),
          new Promise((resolve) => setTimeout(resolve, 1500))
        ]);

        clearTimeout(safetyTimeout);
        setMswReady(true);
        console.log('[MSW] Mock service worker started successfully');
      } catch (error) {
        console.error('[MSW] Failed to start:', error);
        clearTimeout(safetyTimeout);
        setMswReady(true); // Continue anyway
      }
    }

    initMocks();

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, []);

  if (!mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
