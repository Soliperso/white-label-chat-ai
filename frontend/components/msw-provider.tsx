'use client';

import { useEffect, useState } from 'react';
import { initMSW } from '@/lib/msw-init';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    // Only run on client side in development
    if (process.env.NODE_ENV !== 'development') {
      setMswReady(true);
      return;
    }

    async function init() {
      try {
        await initMSW();
        setMswReady(true);
        console.log('[MSW] Provider: MSW is now ready');
      } catch (error) {
        console.error('[MSW] Initialization failed:', error);
        // Set ready anyway to not block the app
        setMswReady(true);
      }
    }

    init();
  }, []);

  // Wait for MSW to be ready in development before rendering
  if (!mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Initializing mock service...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
