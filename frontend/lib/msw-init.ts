// MSW initialization promise that can be awaited
let mswReadyPromise: Promise<void> | null = null;

export async function initMSW(): Promise<void> {
  if (mswReadyPromise) {
    return mswReadyPromise;
  }

  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return Promise.resolve();
  }

  mswReadyPromise = (async () => {
    const { worker } = await import('@/mocks/browser');

    await worker.start({
      onUnhandledRequest: 'warn',
      quiet: false,
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });

    console.log('[MSW] Service worker started');
    console.log('[MSW] Registered handlers:', worker.listHandlers().length);
  })();

  return mswReadyPromise;
}

export function isMSWEnabled(): boolean {
  return typeof window !== 'undefined' && process.env.NODE_ENV === 'development';
}
