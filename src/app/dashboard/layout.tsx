'use client';

import { CodeseoulLayout } from '@/components/layout/CodeseoulLayout';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="kol">
      <CodeseoulLayout>
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <DashboardSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </CodeseoulLayout>
    </AuthGuard>
  );
}
