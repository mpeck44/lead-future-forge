import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Layers, FileText, Users, GraduationCap, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  loading?: boolean;
}

function StatsCard({ title, value, subtitle, icon: Icon, loading }: StatsCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20 bg-slate-700" />
        ) : (
          <>
            <div className="text-2xl font-bold text-white">{value}</div>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  // Fetch courses stats
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, is_published');
      if (error) throw error;
      return data;
    },
  });

  // Fetch modules count
  const { data: modulesCount, isLoading: modulesLoading } = useQuery({
    queryKey: ['admin-modules-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch lessons count
  const { data: lessonsCount, isLoading: lessonsLoading } = useQuery({
    queryKey: ['admin-lessons-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch enrollments count
  const { data: enrollmentsCount, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['admin-enrollments-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch recent courses
  const { data: recentCourses, isLoading: recentLoading } = useQuery({
    queryKey: ['admin-recent-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, is_published, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const totalCourses = coursesData?.length || 0;
  const publishedCourses = coursesData?.filter(c => c.is_published).length || 0;
  const draftCourses = totalCourses - publishedCourses;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 font-body mt-1">Overview of your learning platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Courses"
            value={totalCourses}
            subtitle={`${publishedCourses} published, ${draftCourses} draft`}
            icon={BookOpen}
            loading={coursesLoading}
          />
          <StatsCard
            title="Total Modules"
            value={modulesCount || 0}
            icon={Layers}
            loading={modulesLoading}
          />
          <StatsCard
            title="Total Lessons"
            value={lessonsCount || 0}
            icon={FileText}
            loading={lessonsLoading}
          />
          <StatsCard
            title="Enrollments"
            value={enrollmentsCount || 0}
            icon={GraduationCap}
            loading={enrollmentsLoading}
          />
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full bg-slate-700" />
                ))}
              </div>
            ) : recentCourses && recentCourses.length > 0 ? (
              <div className="space-y-3">
                {recentCourses.map(course => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-white">{course.title}</p>
                      <p className="text-sm text-slate-500">
                        Updated {format(new Date(course.updated_at || ''), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        course.is_published
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No courses yet. Create your first course!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
