'use client';

import { Widget } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Copy, CornerDownRight, CornerDownLeft, Square, Clock, Hand, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/date-utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface WidgetsTableProps {
  widgets: Widget[];
  isLoading?: boolean;
  error?: Error | null;
}

function TableRowSkeleton() {
  return (
    <TableRow className="h-14">
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 animate-pulse" />
          <Skeleton className="h-4 w-20 animate-pulse" />
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-6 w-24 animate-pulse" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="space-y-1">
          <Skeleton className="h-5 w-16 animate-pulse" />
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-16 animate-pulse" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-20 animate-pulse" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 animate-pulse" />
          <Skeleton className="h-8 w-24 animate-pulse" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function WidgetsTable({ widgets, isLoading, error }: WidgetsTableProps) {
  const router = useRouter();
  const [copiedWidgetId, setCopiedWidgetId] = useState<string | null>(null);

  const handleViewChats = (widgetId: string) => {
    router.push(`/widgets/${widgetId}/chats`);
  };

  const handleCopyCode = async (widgetId: string) => {
    const embedCode = `<!-- ChatForge Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_WIDGET_URL || 'http://localhost:3000'}/widget.js';
    script.setAttribute('data-widget-id', '${widgetId}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedWidgetId(widgetId);
      setTimeout(() => setCopiedWidgetId(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">Failed to load widgets</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="border border-[#E0E0E0] rounded-lg bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-[#FAFAFA] border-b border-[#E0E0E0]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-[#212121] text-sm">Widget</TableHead>
              <TableHead className="font-semibold text-[#212121] text-sm hidden md:table-cell">Position</TableHead>
              <TableHead className="font-semibold text-[#212121] text-sm hidden lg:table-cell">Behavior</TableHead>
              <TableHead className="font-semibold text-[#212121] text-sm hidden md:table-cell">Messages This Month</TableHead>
              <TableHead className="font-semibold text-[#212121] text-sm hidden md:table-cell">Created</TableHead>
              <TableHead className="font-semibold text-[#212121] text-sm">Last Updated</TableHead>
              <TableHead className="font-semibold text-[#212121] text-sm text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))
            ) : widgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  No widgets found
                </TableCell>
              </TableRow>
            ) : (
            widgets.map((widget) => (
              <TableRow
                key={widget.id}
                className="group h-16 hover:bg-[#E3F2FD] transition-colors border-b border-[#E0E0E0] last:border-0"
              >
                <TableCell className="py-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Theme color palette */}
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-[#E0E0E0]"
                          style={{ backgroundColor: widget.theme.primaryColor }}
                          title={`Primary: ${widget.theme.primaryColor}`}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-[#E0E0E0]"
                          style={{ backgroundColor: widget.theme.secondaryColor }}
                          title={`Secondary: ${widget.theme.secondaryColor}`}
                        />
                      </div>

                      {widget.category && (
                        <Badge className="bg-[#2196F3] hover:bg-[#1976D2] text-white rounded px-2 py-0.5 text-xs">
                          {widget.category}
                        </Badge>
                      )}
                      <span className="font-medium text-[#212121] text-sm">{widget.name}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        widget.status === 'active'
                          ? 'bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/10 w-fit'
                          : widget.status === 'draft'
                          ? 'bg-[#FF9800]/10 text-[#FF9800] hover:bg-[#FF9800]/10 w-fit'
                          : 'bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/10 w-fit'
                      }
                    >
                      {widget.status.charAt(0).toUpperCase() + widget.status.slice(1)}
                    </Badge>
                  </div>
                </TableCell>

                {/* Position column */}
                <TableCell className="text-sm hidden md:table-cell">
                  <Badge variant="outline" className="text-xs border-[#E0E0E0]">
                    {widget.config.position === 'bottom-right' && (
                      <>
                        <CornerDownRight className="h-3 w-3 mr-1" />
                        Bottom Right
                      </>
                    )}
                    {widget.config.position === 'bottom-left' && (
                      <>
                        <CornerDownLeft className="h-3 w-3 mr-1" />
                        Bottom Left
                      </>
                    )}
                    {widget.config.position === 'inline' && (
                      <>
                        <Square className="h-3 w-3 mr-1" />
                        Inline
                      </>
                    )}
                  </Badge>
                </TableCell>

                {/* Behavior column */}
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-col gap-1">
                    {widget.config.autoOpenDelay ? (
                      <Badge variant="secondary" className="text-xs w-fit bg-[#2196F3]/10 text-[#2196F3]">
                        <Clock className="h-3 w-3 mr-1" />
                        Auto {widget.config.autoOpenDelay / 1000}s
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs w-fit border-[#E0E0E0]">
                        <Hand className="h-3 w-3 mr-1" />
                        Manual
                      </Badge>
                    )}
                    {!widget.config.showBranding && (
                      <Badge className="text-xs w-fit bg-purple-100 text-purple-800 hover:bg-purple-100">
                        <Sparkles className="h-3 w-3 mr-1" />
                        White-label
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Messages This Month */}
                <TableCell className="text-[#212121] font-medium text-sm hidden md:table-cell">
                  {widget.messagesThisMonth !== undefined ? widget.messagesThisMonth.toLocaleString() : '0'}
                </TableCell>

                {/* Created date */}
                <TableCell className="text-[#757575] text-sm hidden md:table-cell">
                  {formatDistanceToNow(new Date(widget.createdAt))}
                </TableCell>

                {/* Last Updated */}
                <TableCell className="text-[#757575] text-sm">
                  {formatDistanceToNow(new Date(widget.updatedAt))}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm text-[#757575] border-[#E0E0E0] hover:bg-[#E3F2FD] hover:text-[#2196F3] hover:border-[#2196F3] w-full sm:w-auto"
                      aria-label={`View chats for ${widget.name}`}
                      onClick={() => handleViewChats(widget.id)}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      View Chats
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm text-[#757575] border-[#E0E0E0] hover:bg-[#E3F2FD] hover:text-[#2196F3] hover:border-[#2196F3] w-full sm:w-auto"
                      aria-label={`Copy embed code for ${widget.name}`}
                      onClick={() => handleCopyCode(widget.id)}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      {copiedWidgetId === widget.id ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
