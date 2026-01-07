'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Link as LinkIcon,
  FileText,
  MessageSquare,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { useTrainingSources, useDeleteTrainingSource } from '@/hooks/use-training';
import type { TrainingSource } from '@/types';

interface TrainingSourcesTableProps {
  widgetId: string;
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-16" />
      </TableCell>
    </TableRow>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No training sources yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Add URLs, upload documents, or create Q&A pairs to train your AI assistant
      </p>
    </div>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'url':
      return <LinkIcon className="h-3.5 w-3.5" />;
    case 'file':
      return <FileText className="h-3.5 w-3.5" />;
    case 'qna':
      return <MessageSquare className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'url':
      return 'URL';
    case 'file':
      return 'File';
    case 'qna':
      return 'Q&A';
    default:
      return type;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-white text-green-800 border-green-300 hover:bg-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case 'processing':
      return (
        <Badge className="bg-white text-blue-800 border-blue-300 hover:bg-white">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-white text-red-800 border-red-300 hover:bg-white">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-white text-gray-600">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getSourceName(source: TrainingSource): string {
  if (source.type === 'url' && source.url) {
    try {
      const url = new URL(source.url);
      return url.hostname;
    } catch {
      return source.url;
    }
  }
  if (source.type === 'file' && source.fileName) {
    return source.fileName;
  }
  if (source.type === 'qna' && source.question) {
    return source.question.length > 50
      ? source.question.substring(0, 50) + '...'
      : source.question;
  }
  return 'Unnamed source';
}

export function TrainingSourcesTable({ widgetId }: TrainingSourcesTableProps) {
  const { data: sources, isLoading } = useTrainingSources(widgetId);
  const deleteMutation = useDeleteTrainingSource();

  const handleDelete = async (sourceId: string) => {
    if (confirm('Are you sure you want to delete this training source?')) {
      try {
        await deleteMutation.mutateAsync({ sourceId, widgetId });
        toast.success('Training source deleted successfully');
      } catch (error) {
        toast.error('Failed to delete training source');
        console.error('Error deleting source:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name/URL</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Items</TableHead>
              <TableHead className="hidden lg:table-cell">Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name/URL</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Items</TableHead>
            <TableHead className="hidden lg:table-cell">Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.id}>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  <span className="flex items-center gap-1">
                    {getTypeIcon(source.type)}
                    {getTypeLabel(source.type)}
                  </span>
                </Badge>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="font-medium truncate">{getSourceName(source)}</p>
                  {source.type === 'url' && source.crawlDepth && (
                    <p className="text-xs text-muted-foreground">
                      Depth: {source.crawlDepth} level{source.crawlDepth > 1 ? 's' : ''}
                    </p>
                  )}
                  {source.type === 'file' && source.fileSize && (
                    <p className="text-xs text-muted-foreground">
                      {(source.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  {source.errorMessage && (
                    <p className="text-xs text-red-600 mt-1">{source.errorMessage}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {getStatusBadge(source.status)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-sm">
                  {source.totalChunks !== undefined ? source.totalChunks : '-'}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(source.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
