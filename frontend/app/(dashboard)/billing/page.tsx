import { Suspense } from 'react';
import { BillingPageClient } from './billing-page-client';

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    }>
      <BillingPageClient />
    </Suspense>
  );
}
