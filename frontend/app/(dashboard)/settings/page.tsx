import { Suspense } from 'react';
import { SettingsPageClient } from './settings-page-client';

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    }>
      <SettingsPageClient />
    </Suspense>
  );
}
