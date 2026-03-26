import AdminPortalLayout from '@/src/components/admin/AdminPortalLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortalLayout>{children}</AdminPortalLayout>;
}