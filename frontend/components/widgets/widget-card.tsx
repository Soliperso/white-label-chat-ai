'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Widget } from '@/types';
import { cn } from '@/lib/utils';

interface WidgetCardProps {
  widget: Widget;
}

function getStatusBadgeVariant(status: Widget['status']) {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'draft':
      return 'outline';
  }
}

function getStatusBadgeClassName(status: Widget['status']) {
  switch (status) {
    case 'active':
      return 'bg-white text-green-800 border-green-300 hover:bg-white';
    case 'inactive':
      return '';
    case 'draft':
      return 'bg-white text-yellow-800 border-yellow-300 hover:bg-white';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function WidgetCard({ widget }: WidgetCardProps) {
  return (
    <Link href={`/widgets/${widget.id}`}>
      <Card className="cursor-pointer transition hover:shadow-lg" data-testid="widget-item">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg truncate" data-testid="widget-name">{widget.name}</h3>
            <Badge
              variant={getStatusBadgeVariant(widget.status)}
              className={cn(getStatusBadgeClassName(widget.status))}
            >
              {widget.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Theme Colors</p>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: widget.theme.primaryColor }}
                  title={`Primary: ${widget.theme.primaryColor}`}
                />
                <div
                  className="h-8 w-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: widget.theme.secondaryColor }}
                  title={`Secondary: ${widget.theme.secondaryColor}`}
                />
                <span className="text-xs text-muted-foreground ml-2">
                  {widget.theme.mode}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Created {formatDate(widget.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
