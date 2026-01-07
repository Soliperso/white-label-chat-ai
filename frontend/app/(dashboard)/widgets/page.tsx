'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWidgets } from '@/hooks/use-widgets';
import { WidgetsTable } from '@/components/widgets/widgets-table';
import { WidgetEmptyState } from '@/components/widgets/widget-empty-state';
import { Pagination } from '@/components/ui/pagination';

export default function WidgetsPage() {
  const { data: widgets = [], isLoading, error } = useWidgets();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter widgets based on search and status
  const filteredWidgets = widgets.filter((widget) => {
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || widget.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered widgets
  const totalPages = Math.ceil(filteredWidgets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWidgets = filteredWidgets.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Grid3x3 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Widgets</h1>
        </div>
        <p className="text-muted-foreground">
          Create and manage AI-powered chat widgets for your websites
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <Button asChild className="bg-primary hover:bg-primary-dark text-white sm:w-auto shadow-sm">
          <Link href="/widgets/new">Create Widget</Link>
        </Button>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-white border-gray-300"
            aria-label="Search widgets"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter widgets by status">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {!isLoading && !error && widgets.length === 0 ? (
        <WidgetEmptyState />
      ) : !isLoading && !error && filteredWidgets.length === 0 ? (
        <div className="border rounded-lg bg-white shadow-sm p-12 text-center">
          <p className="text-gray-500 font-medium">No widgets match your filters</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <WidgetsTable widgets={paginatedWidgets} isLoading={isLoading} error={error} />

          {/* Pagination */}
          {!isLoading && !error && filteredWidgets.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredWidgets.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
