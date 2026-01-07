'use client';

import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WidgetEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <LayoutGrid className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No widgets yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Create your first widget to get started with ChatForge
      </p>
      <Button asChild>
        <Link href="/widgets/new">Create Widget</Link>
      </Button>
    </div>
  );
}
