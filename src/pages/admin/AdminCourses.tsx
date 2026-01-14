import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminCourses() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Courses</h1>
          <p className="text-slate-400 font-body mt-1">Manage your course catalog</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <p className="text-slate-400">Course management coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
