'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1) return null;
  const start = totalItems && pageSize ? (page - 1) * pageSize + 1 : 0;
  const end = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : 0;

  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 mt-4">
      {totalItems != null && pageSize != null && (
        <p className="text-sm font-mono text-white/50">
          {start}-{end} / {totalItems}건
        </p>
      )}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded border border-white/20 px-3 py-1.5 text-sm font-mono text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>
        <span className="font-mono text-sm text-white/70">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 rounded border border-white/20 px-3 py-1.5 text-sm font-mono text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          다음
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
