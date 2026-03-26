import { AdminProvider } from '@/context/AdminContext';
import { QueryProvider } from '@/lib/query-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <QueryProvider>{children}</QueryProvider>
    </AdminProvider>
  );
}
