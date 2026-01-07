// This script must run BEFORE React hydrates
// It will delay hydration until MSW is ready in development

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[MSW-Init] Preparing to start service worker...');

  // This will be set by MSW when it's ready
  window.__MSW_READY__ = false;

  // Mark as ready immediately in production
} else if (typeof window !== 'undefined') {
  window.__MSW_READY__ = true;
}
