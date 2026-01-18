import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  Calendar, 
  BookOpen,
  Shield,
  UserX,
  UserPlus,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { RoleChangeDialog } from './RoleChangeDialog';
import { EnrollUserDialog } from './EnrollUserDialog';
import { UnenrollDialog } from './UnenrollDialog';
import { StatusChangeDialog } from './StatusChangeDialog';

interface UserDetailDrawerProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

interface Enrollment {
  id: string;
  course_id: string;
  status: string | null;
  purchase_date: string | null;
  amount_paid: number | null;
  course: {
    title: string;
    slug: string;
  } | null;
}

export function UserDetailDrawer({ userId, open, onOpenChange, onUpdate }: UserDetailDrawerProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [unenrollData, setUnenrollData] = useState<{ enrollmentId: string; courseName: string } | null>(null);

  // Fetch user details
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch user role
  const { data: userRole, refetch: refetchRole } = useQuery({
    queryKey: ['admin-user-role', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data?.role || 'student';
    },
    enabled: !!userId,
  });

  // Fetch enrollments with course details
  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useQuery({
    queryKey: ['admin-user-enrollments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          status,
          purchase_date,
          amount_paid,
          course:courses(title, slug)
        `)
        .eq('user_id', userId);
      if (error) throw error;
      return data as unknown as Enrollment[];
    },
    enabled: !!userId,
  });

  // Fetch progress data
  const { data: progressData } = useQuery({
    queryKey: ['admin-user-progress', userId],
    queryFn: async () => {
      if (!userId) return { completed: 0, total: 0, timeSpent: 0 };
      
      // Get completed lessons
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_id, status, time_spent_seconds')
        .eq('user_id', userId);
      if (progressError) throw progressError;

      const completed = progress?.filter(p => p.status === 'completed').length || 0;
      const timeSpent = progress?.reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0) || 0;

      return { completed, total: progress?.length || 0, timeSpent };
    },
    enabled: !!userId,
  });

  const handleRefresh = () => {
    refetchUser();
    refetchRole();
    refetchEnrollments();
    onUpdate();
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Admin</Badge>;
      case 'instructor':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Instructor</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Student</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
    }
  };

  const formatK12Role = (role: string | null) => {
    if (!role) return 'Not specified';
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg bg-slate-900 border-slate-700 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white font-display">User Details</SheetTitle>
            <SheetDescription className="text-slate-400">
              View and manage user information
            </SheetDescription>
          </SheetHeader>

          {userLoading ? (
            <div className="space-y-4 mt-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : user ? (
            <div className="space-y-6 mt-6">
              {/* User Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {user.full_name || 'No name'}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(userRole)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="h-4 w-4 text-slate-500" />
                    {user.email}
                  </div>
                  {user.district_name && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      {user.district_name}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-300">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    {formatK12Role(user.role)}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    Joined {user.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'N/A'}
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 justify-start"
                    onClick={() => setRoleDialogOpen(true)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Change Role
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 justify-start"
                    onClick={() => setStatusDialogOpen(true)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Change Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 justify-start col-span-2"
                    onClick={() => setEnrollDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Enroll in Course
                  </Button>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Progress Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Learning Progress
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                      <BookOpen className="h-4 w-4" />
                      Lessons Completed
                    </div>
                    <p className="text-2xl font-bold text-white">{progressData?.completed || 0}</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                      <Clock className="h-4 w-4" />
                      Time Spent
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatTimeSpent(progressData?.timeSpent || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Enrollments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Enrollments ({enrollments?.length || 0})
                  </h4>
                </div>
                {enrollmentsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : enrollments?.length === 0 ? (
                  <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm">No course enrollments yet.</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-primary mt-1"
                      onClick={() => setEnrollDialogOpen(true)}
                    >
                      Enroll in a course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrollments?.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="bg-slate-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-white text-sm">
                            {enrollment.course?.title || 'Unknown Course'}
                          </p>
                          <p className="text-xs text-slate-400">
                            Enrolled {enrollment.purchase_date
                              ? format(new Date(enrollment.purchase_date), 'MMM d, yyyy')
                              : 'N/A'}
                            {enrollment.amount_paid != null && enrollment.amount_paid > 0 && (
                              <> · ${(enrollment.amount_paid / 100).toFixed(2)}</>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              enrollment.status === 'active'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : enrollment.status === 'refunded'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                            }
                          >
                            {enrollment.status || 'active'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-400"
                            onClick={() => setUnenrollData({
                              enrollmentId: enrollment.id,
                              courseName: enrollment.course?.title || 'this course'
                            })}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              User not found
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      {user && (
        <>
          <RoleChangeDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            userId={user.id}
            userName={user.full_name || user.email || 'User'}
            currentRole={userRole || 'student'}
            onSuccess={handleRefresh}
          />
          <StatusChangeDialog
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
            userId={user.id}
            userName={user.full_name || user.email || 'User'}
            currentStatus={user.status || 'active'}
            onSuccess={handleRefresh}
          />
          <EnrollUserDialog
            open={enrollDialogOpen}
            onOpenChange={setEnrollDialogOpen}
            userId={user.id}
            userName={user.full_name || user.email || 'User'}
            existingEnrollments={enrollments?.map(e => e.course_id) || []}
            onSuccess={handleRefresh}
          />
        </>
      )}
      {unenrollData && (
        <UnenrollDialog
          open={!!unenrollData}
          onOpenChange={(open) => !open && setUnenrollData(null)}
          enrollmentId={unenrollData.enrollmentId}
          courseName={unenrollData.courseName}
          onSuccess={handleRefresh}
        />
      )}
    </>
  );
}
