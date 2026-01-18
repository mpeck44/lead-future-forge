import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserDetailDrawer } from '@/components/admin/UserDetailDrawer';
import { format } from 'date-fns';

interface UserWithDetails {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  district_name: string | null;
  status: string | null;
  created_at: string | null;
  app_role: string | null;
  enrollment_count: number;
}

const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch users with roles and enrollment counts
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      // First get all profiles
      let profilesQuery = supabase
        .from('profiles')
        .select('id, full_name, email, role, district_name, status, created_at');

      if (statusFilter !== 'all') {
        profilesQuery = profilesQuery.eq('status', statusFilter);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      // Get enrollment counts
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('user_id');
      if (enrollmentsError) throw enrollmentsError;

      // Map roles and enrollment counts to users
      const rolesMap = new Map(userRoles?.map(r => [r.user_id, r.role]) || []);
      const enrollmentCounts = new Map<string, number>();
      enrollments?.forEach(e => {
        enrollmentCounts.set(e.user_id, (enrollmentCounts.get(e.user_id) || 0) + 1);
      });

      const usersWithDetails: UserWithDetails[] = (profiles || []).map(p => ({
        ...p,
        app_role: rolesMap.get(p.id) || 'student',
        enrollment_count: enrollmentCounts.get(p.id) || 0,
      }));

      // Filter by search query
      let filtered = usersWithDetails;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(u =>
          u.full_name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.district_name?.toLowerCase().includes(query)
        );
      }

      // Filter by app role
      if (roleFilter !== 'all') {
        filtered = filtered.filter(u => u.app_role === roleFilter);
      }

      return filtered;
    },
  });

  // Pagination
  const totalPages = Math.ceil((users?.length || 0) / ITEMS_PER_PAGE);
  const paginatedUsers = users?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const formatRole = (role: string | null) => {
    if (!role) return 'N/A';
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Users</h1>
            <p className="text-slate-400 font-body mt-1">
              Manage platform users, roles, and enrollments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">
              {users?.length || 0} users
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or district..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Email</TableHead>
                <TableHead className="text-slate-300">K-12 Role</TableHead>
                <TableHead className="text-slate-300">App Role</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Enrollments</TableHead>
                <TableHead className="text-slate-300">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-700">
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedUsers?.length === 0 ? (
                <TableRow className="border-slate-700">
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    No users found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers?.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-700 hover:bg-slate-750 cursor-pointer"
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <TableCell className="font-medium text-white">
                      {user.full_name || 'No name'}
                    </TableCell>
                    <TableCell className="text-slate-300">{user.email}</TableCell>
                    <TableCell className="text-slate-300">{formatRole(user.role)}</TableCell>
                    <TableCell>{getRoleBadge(user.app_role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-slate-300">{user.enrollment_count}</TableCell>
                    <TableCell className="text-slate-400">
                      {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, users?.length || 0)} of{' '}
                {users?.length || 0} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        onUpdate={() => refetch()}
      />
    </AdminLayout>
  );
}
