import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CourseFormDialog, CourseFormValues } from '@/components/admin/CourseFormDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, MoreHorizontal, Pencil, Copy, Trash2, ExternalLink, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuditCategory = 'fluency' | 'strategy' | 'action' | 'governance' | 'capacity';

interface CourseWithCounts {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  path_type: string | null;
  estimated_hours: number | null;
  is_published: boolean | null;
  featured: boolean | null;
  created_at: string | null;
  audit_category: AuditCategory | null;
  role_fit: string[] | null;
  requires_foundations: boolean;
  module_count: number;
  enrollment_count: number;
}

const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  fluency: 'Fluency',
  strategy: 'Strategy',
  action: 'Action',
  governance: 'Governance',
  capacity: 'Capacity',
};

export default function AdminCourses() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithCounts | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseWithCounts | null>(null);

  // Fetch courses with module and enrollment counts
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      // First get all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Get module counts
      const { data: moduleCounts, error: moduleError } = await supabase
        .from('modules')
        .select('course_id');

      if (moduleError) throw moduleError;

      // Get enrollment counts
      const { data: enrollmentCounts, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('course_id');

      if (enrollmentError) throw enrollmentError;

      // Map counts to courses
      const coursesWithCounts: CourseWithCounts[] = coursesData.map((course) => ({
        ...course,
        module_count: moduleCounts?.filter((m) => m.course_id === course.id).length || 0,
        enrollment_count: enrollmentCounts?.filter((e) => e.course_id === course.id).length || 0,
      }));

      return coursesWithCounts;
    },
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: values.title,
          slug: values.slug,
          description: values.description || null,
          price: values.price ? Math.round(values.price * 100) : null,
          path_type: values.path_type || null,
          estimated_hours: values.estimated_hours || null,
          is_published: values.is_published,
          featured: values.featured,
          audit_category: values.audit_category,
          role_fit: values.role_fit || [],
          requires_foundations: values.requires_foundations,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setIsFormOpen(false);
      toast.success('Course created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create course: ${error.message}`);
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: CourseFormValues }) => {
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: values.title,
          slug: values.slug,
          description: values.description || null,
          price: values.price ? Math.round(values.price * 100) : null,
          path_type: values.path_type || null,
          estimated_hours: values.estimated_hours || null,
          is_published: values.is_published,
          featured: values.featured,
          audit_category: values.audit_category,
          role_fit: values.role_fit || [],
          requires_foundations: values.requires_foundations,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setEditingCourse(null);
      toast.success('Course updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update course: ${error.message}`);
    },
  });

  // Duplicate course mutation
  const duplicateCourseMutation = useMutation({
    mutationFn: async (course: CourseWithCounts) => {
      // Create new course
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: `${course.title} - Copy`,
          slug: `${course.slug}-copy-${Date.now()}`,
          description: course.description,
          price: course.price,
          path_type: course.path_type,
          estimated_hours: course.estimated_hours,
          is_published: false, // Always start as draft
          featured: false,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Copy modules
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', course.id)
        .order('sequence_order');

      if (modulesError) throw modulesError;

      for (const module of modules || []) {
        const { data: newModule, error: newModuleError } = await supabase
          .from('modules')
          .insert({
            course_id: newCourse.id,
            title: module.title,
            sequence_order: module.sequence_order,
            estimated_minutes: module.estimated_minutes,
          })
          .select()
          .single();

        if (newModuleError) throw newModuleError;

        // Copy lessons for this module
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', module.id)
          .order('sequence_order');

        if (lessonsError) throw lessonsError;

        for (const lesson of lessons || []) {
          const { error: newLessonError } = await supabase
            .from('lessons')
            .insert({
              module_id: newModule.id,
              title: lesson.title,
              content: lesson.content,
              video_url: lesson.video_url,
              template_url: lesson.template_url,
              sequence_order: lesson.sequence_order,
              estimated_minutes: lesson.estimated_minutes,
            });

          if (newLessonError) throw newLessonError;
        }
      }

      return newCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Course duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate course: ${error.message}`);
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setDeletingCourse(null);
      toast.success('Course deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete course: ${error.message}`);
    },
  });

  // Filter courses
  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && course.is_published) ||
      (statusFilter === 'draft' && !course.is_published);
    const matchesCategory =
      tagFilter === 'all' ||
      (tagFilter === 'none' ? course.audit_category === null : course.audit_category === tagFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Collect categories present for the filter dropdown
  const presentCategories = Array.from(
    new Set((courses || []).map((c) => c.audit_category).filter((v): v is AuditCategory => !!v))
  ).sort();

  const formatPrice = (priceInCents: number | null) => {
    if (priceInCents === null || priceInCents === 0) return 'Free';
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const handleCreateSubmit = async (values: CourseFormValues) => {
    await createCourseMutation.mutateAsync(values);
  };

  const handleEditSubmit = async (values: CourseFormValues) => {
    if (editingCourse) {
      await updateCourseMutation.mutateAsync({ id: editingCourse.id, values });
    }
  };

  const openEditDialog = (course: CourseWithCounts) => {
    setEditingCourse(course);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Courses</h1>
            <p className="text-slate-400 font-body mt-1">Manage your course catalog</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          {presentCategories.length > 0 && (
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Audit category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="none">None (foundational)</SelectItem>
                {presentCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {AUDIT_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Courses Table */}
        <div className="rounded-lg border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
          ) : filteredCourses?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'No courses match your filters'
                : 'No courses yet. Create your first course!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Modules</TableHead>
                  <TableHead className="text-center">Enrollments</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses?.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">/courses/{course.slug}</div>
                        {(course.audit_category || (course.role_fit && course.role_fit.length > 0) || course.requires_foundations) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {course.audit_category && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {AUDIT_CATEGORY_LABELS[course.audit_category]}
                              </Badge>
                            )}
                            {course.requires_foundations && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Requires Foundations
                              </Badge>
                            )}
                            {(course.role_fit || []).slice(0, 2).map((r) => (
                              <Badge key={r} variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                {r.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(course.price)}</TableCell>
                    <TableCell>
                      {course.path_type ? (
                        <Badge variant="outline" className="capitalize">
                          {course.path_type.replace(/_/g, ' ')}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {course.is_published ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{course.module_count}</TableCell>
                    <TableCell className="text-center">{course.enrollment_count}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(course)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/courses/${course.id}/content`)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Manage Content
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicateCourseMutation.mutate(course)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`/courses/${course.slug}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingCourse(course)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Create Course Dialog */}
      <CourseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateSubmit}
        isLoading={createCourseMutation.isPending}
      />

      {/* Edit Course Dialog */}
      <CourseFormDialog
        open={!!editingCourse}
        onOpenChange={(open) => !open && setEditingCourse(null)}
        onSubmit={handleEditSubmit}
        defaultValues={
          editingCourse
            ? {
                title: editingCourse.title,
                slug: editingCourse.slug,
                description: editingCourse.description || '',
                price: editingCourse.price ? editingCourse.price / 100 : 0,
                path_type: editingCourse.path_type || '',
                estimated_hours: editingCourse.estimated_hours || 0,
                is_published: editingCourse.is_published || false,
                featured: editingCourse.featured || false,
                tags: (editingCourse as any).tags || [],
              }
            : undefined
        }
        isEditing
        isLoading={updateCourseMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        onConfirm={() => deletingCourse && deleteCourseMutation.mutate(deletingCourse.id)}
        title="Delete Course"
        description={`This will permanently delete "${deletingCourse?.title}" along with ${deletingCourse?.module_count} modules and all associated lessons. This action cannot be undone.`}
        isLoading={deleteCourseMutation.isPending}
      />
    </AdminLayout>
  );
}
