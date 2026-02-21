'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { zhTW, t } from '@/messages/kol/zh-TW';

interface DashboardPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export function DashboardPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
}: DashboardPaginationProps) {
  const pathname = usePathname();
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const prevHref = page > 1 ? `${pathname}?page=${page - 1}` : pathname;
  const nextHref = page < totalPages ? `${pathname}?page=${page + 1}` : pathname;

  return (
    <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-white/10">
      <p className="text-sm font-mono text-white/50">
        {t('paginationCount', { start: String(start), end: String(end), total: String(totalItems) })}
      </p>
      <div className="flex items-center gap-2 ml-auto">
        <Link
          href={prevHref}
          className={`flex items-center gap-1 rounded border border-white/20 px-3 py-1.5 text-sm font-mono text-white/80 hover:bg-white/10 transition-colors ${
            page <= 1 ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          {zhTW.prev}
        </Link>
        <span className="font-mono text-sm text-white/70">
          {page} / {totalPages}
        </span>
        <Link
          href={nextHref}
          className={`flex items-center gap-1 rounded border border-white/20 px-3 py-1.5 text-sm font-mono text-white/80 hover:bg-white/10 transition-colors ${
            page >= totalPages ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          {zhTW.next}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
