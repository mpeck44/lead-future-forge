import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import ModuleCard from "@/components/admin/ModuleCard";
import ModuleFormDialog from "@/components/admin/ModuleFormDialog";
import LessonFormDialog from "@/components/admin/LessonFormDialog";
import LessonPreviewDialog from "@/components/admin/LessonPreviewDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

interface Lesson {
  id: string;
  title: string;
  lesson_type: string | null;
  content: string | null;
  estimated_minutes: number | null;
  video_url: string | null;
  template_url: string | null;
  is_published: boolean | null;
  sequence_order: number;
  module_id: string;
  learning_objective?: string | null;
  key_takeaways?: string[] | null;
  resource_type?: string | null;
  resource_name?: string | null;
  download_button_text?: string | null;
  completion_type?: string | null;
  is_quick_start?: boolean | null;
  is_first_deliverable?: boolean | null;
  auto_advance?: boolean | null;
  require_completion?: boolean | null;
  video_transcript?: string | null;
  character_limit?: number | null;
}

interface Module {
  id: string;
  title: string;
  estimated_minutes: number | null;
  sequence_order: number;
  lessons: Lesson[];
  description?: string | null;
  deliverable_name?: string | null;
  path_type?: string | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

const AdminCourseContent = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dialog states
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonPreviewDialogOpen, setLessonPreviewDialogOpen] = useState(false);
  const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState(false);
  const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState(false);

  // Editing states
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [previewingLesson, setPreviewingLesson] = useState<Lesson | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["admin-course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, slug")
        .eq("id", courseId)
        .maybeSingle();
      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!courseId,
  });

  // Fetch modules with lessons
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["admin-course-modules", courseId],
    queryFn: async () => {
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("sequence_order", { ascending: true });

      if (modulesError) throw modulesError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .in("module_id", modulesData.map((m) => m.id))
        .order("sequence_order", { ascending: true });

      if (lessonsError) throw lessonsError;

      return modulesData.map((mod) => ({
        ...mod,
        lessons: lessonsData.filter((l) => l.module_id === mod.id),
      })) as Module[];
    },
    enabled: !!courseId,
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: async (data: { title: string; estimated_minutes?: number }) => {
      const nextOrder = modules.length > 0 
        ? Math.max(...modules.map((m) => m.sequence_order)) + 1 
        : 1;

      const { data: newModule, error } = await supabase
        .from("modules")
        .insert({
          course_id: courseId,
          title: data.title,
          estimated_minutes: data.estimated_minutes ?? null,
          sequence_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return newModule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast.success("Module created successfully");
    },
    onError: (error) => {
      console.error("Error creating module:", error);
      toast.error("Failed to create module");
    },
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; estimated_minutes?: number }) => {
      const { error } = await supabase
        .from("modules")
        .update({
          title: data.title,
          estimated_minutes: data.estimated_minutes ?? null,
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast.success("Module updated successfully");
    },
    onError: (error) => {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      // First delete all lessons in the module
      const { error: lessonsError } = await supabase
        .from("lessons")
        .delete()
        .eq("module_id", moduleId);

      if (lessonsError) throw lessonsError;

      // Then delete the module
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast.success("Module deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting module:", error);
      toast.error("Failed to delete module");
    },
  });

  // Reorder module mutation
  const reorderModuleMutation = useMutation({
    mutationFn: async ({ module1, module2 }: { module1: Module; module2: Module }) => {
      await Promise.all([
        supabase
          .from("modules")
          .update({ sequence_order: module2.sequence_order })
          .eq("id", module1.id),
        supabase
          .from("modules")
          .update({ sequence_order: module1.sequence_order })
          .eq("id", module2.id),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
    },
    onError: (error) => {
      console.error("Error reordering modules:", error);
      toast.error("Failed to reorder modules");
    },
  });

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: async (data: {
      module_id: string;
      title: string;
      lesson_type: string;
      content?: string;
      estimated_minutes?: number;
      video_url?: string;
      template_url?: string;
      is_published: boolean;
      learning_objective?: string;
      key_takeaways?: string[];
      resource_type?: string;
      resource_name?: string;
      download_button_text?: string;
      completion_type?: string;
      is_quick_start?: boolean;
      is_first_deliverable?: boolean;
      auto_advance?: boolean;
      require_completion?: boolean;
      video_transcript?: string;
      character_limit?: number;
    }) => {
      const moduleLessons = modules.find((m) => m.id === data.module_id)?.lessons ?? [];
      const nextOrder = moduleLessons.length > 0
        ? Math.max(...moduleLessons.map((l) => l.sequence_order)) + 1
        : 1;

      const { data: newLesson, error } = await supabase
        .from("lessons")
        .insert({
          module_id: data.module_id,
          title: data.title,
          lesson_type: data.lesson_type,
          content: data.content || null,
          estimated_minutes: data.estimated_minutes ?? null,
          video_url: data.video_url || null,
          template_url: data.template_url || null,
          is_published: data.is_published,
          sequence_order: nextOrder,
          learning_objective: data.learning_objective || null,
          key_takeaways: data.key_takeaways || null,
          resource_type: data.resource_type || null,
          resource_name: data.resource_name || null,
          download_button_text: data.download_button_text || null,
          completion_type: data.completion_type || null,
          is_quick_start: data.is_quick_start ?? false,
          is_first_deliverable: data.is_first_deliverable ?? false,
          auto_advance: data.auto_advance ?? false,
          require_completion: data.require_completion ?? false,
          video_transcript: data.video_transcript || null,
          character_limit: data.character_limit ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return newLesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast.success("Lesson created successfully");
    },
    onError: (error) => {
      console.error("Error creating lesson:", error);
      toast.error("Failed to create lesson");
    },
  });

  // Update lesson mutation
  const updateLessonMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      lesson_type: string;
      content?: string;
      estimated_minutes?: number;
      video_url?: string;
      template_url?: string;
      is_published: boolean;
      learning_objective?: string;
      key_takeaways?: string[];
      resource_type?: string;
      resource_name?: string;
      download_button_text?: string;
      completion_type?: string;
      is_quick_start?: boolean;
      is_first_deliverable?: boolean;
      auto_advance?: boolean;
      require_completion?: boolean;
      video_transcript?: string;
      character_limit?: number;
    }) => {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: data.title,
          lesson_type: data.lesson_type,
          content: data.content || null,
          estimated_minutes: data.estimated_minutes ?? null,
          video_url: data.video_url || null,
          template_url: data.template_url || null,
          is_published: data.is_published,
          learning_objective: data.learning_objective || null,
          key_takeaways: data.key_takeaways || null,
          resource_type: data.resource_type || null,
          resource_name: data.resource_name || null,
          download_button_text: data.download_button_text || null,
          completion_type: data.completion_type || null,
          is_quick_start: data.is_quick_start ?? false,
          is_first_deliverable: data.is_first_deliverable ?? false,
          auto_advance: data.auto_advance ?? false,
          require_completion: data.require_completion ?? false,
          video_transcript: data.video_transcript || null,
          character_limit: data.character_limit ?? null,
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast.success("Lesson updated successfully");
    },
    onError: (error) => {
      console.error("Error updating lesson:", error);
      toast.error("Failed to update lesson");
    },
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
      toast.success("Lesson deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting lesson:", error);
      toast.error("Failed to delete lesson");
    },
  });

  // Reorder lesson mutation
  const reorderLessonMutation = useMutation({
    mutationFn: async ({ lesson1, lesson2 }: { lesson1: Lesson; lesson2: Lesson }) => {
      await Promise.all([
        supabase
          .from("lessons")
          .update({ sequence_order: lesson2.sequence_order })
          .eq("id", lesson1.id),
        supabase
          .from("lessons")
          .update({ sequence_order: lesson1.sequence_order })
          .eq("id", lesson2.id),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-modules", courseId] });
    },
    onError: (error) => {
      console.error("Error reordering lessons:", error);
      toast.error("Failed to reorder lessons");
    },
  });

  // Handlers
  const handleModuleSubmit = (data: { title: string; estimated_minutes?: number; saveAndAddAnother?: boolean }) => {
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, ...data });
      setModuleDialogOpen(false);
      setEditingModule(null);
    } else {
      createModuleMutation.mutate(data);
      if (!data.saveAndAddAnother) {
        setModuleDialogOpen(false);
      }
    }
  };

  const handleLessonSubmit = (data: {
    title: string;
    lesson_type: string;
    content?: string;
    estimated_minutes?: number;
    video_url?: string;
    template_url?: string;
    is_published: boolean;
    learning_objective?: string;
    key_takeaways?: string[];
    resource_type?: string;
    resource_name?: string;
    download_button_text?: string;
    completion_type?: string;
    is_quick_start?: boolean;
    is_first_deliverable?: boolean;
    auto_advance?: boolean;
    require_completion?: boolean;
    video_transcript?: string;
    character_limit?: number;
  }) => {
    if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson.id, ...data });
    } else if (activeModuleId) {
      createLessonMutation.mutate({ module_id: activeModuleId, ...data });
    }
    setLessonDialogOpen(false);
    setEditingLesson(null);
    setActiveModuleId(null);
  };

  const handleModuleMoveUp = (module: Module) => {
    const sortedModules = [...modules].sort((a, b) => a.sequence_order - b.sequence_order);
    const currentIndex = sortedModules.findIndex((m) => m.id === module.id);
    if (currentIndex > 0) {
      reorderModuleMutation.mutate({
        module1: module,
        module2: sortedModules[currentIndex - 1],
      });
    }
  };

  const handleModuleMoveDown = (module: Module) => {
    const sortedModules = [...modules].sort((a, b) => a.sequence_order - b.sequence_order);
    const currentIndex = sortedModules.findIndex((m) => m.id === module.id);
    if (currentIndex < sortedModules.length - 1) {
      reorderModuleMutation.mutate({
        module1: module,
        module2: sortedModules[currentIndex + 1],
      });
    }
  };

  const handleLessonMoveUp = (lesson: Lesson) => {
    const module = modules.find((m) => m.id === lesson.module_id);
    if (!module) return;
    
    const sortedLessons = [...module.lessons].sort((a, b) => a.sequence_order - b.sequence_order);
    const currentIndex = sortedLessons.findIndex((l) => l.id === lesson.id);
    if (currentIndex > 0) {
      reorderLessonMutation.mutate({
        lesson1: lesson,
        lesson2: sortedLessons[currentIndex - 1],
      });
    }
  };

  const handleLessonMoveDown = (lesson: Lesson) => {
    const module = modules.find((m) => m.id === lesson.module_id);
    if (!module) return;
    
    const sortedLessons = [...module.lessons].sort((a, b) => a.sequence_order - b.sequence_order);
    const currentIndex = sortedLessons.findIndex((l) => l.id === lesson.id);
    if (currentIndex < sortedLessons.length - 1) {
      reorderLessonMutation.mutate({
        lesson1: lesson,
        lesson2: sortedLessons[currentIndex + 1],
      });
    }
  };

  const sortedModules = [...modules].sort((a, b) => a.sequence_order - b.sequence_order);
  const isLoading = courseLoading || modulesLoading;

  if (!courseId) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Invalid course ID</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/courses")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-bold">
                {course?.title ?? "Loading..."}
              </h1>
              <p className="text-muted-foreground">
                Manage modules and lessons
              </p>
            </div>
          </div>
          <Button onClick={() => setModuleDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sortedModules.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium mb-2">No modules yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your course by adding the first module.
            </p>
            <Button onClick={() => setModuleDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Module
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedModules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                isFirst={index === 0}
                isLast={index === sortedModules.length - 1}
                onEdit={(m) => {
                  setEditingModule(m);
                  setModuleDialogOpen(true);
                }}
                onDelete={(m) => {
                  setDeletingModule(m);
                  setDeleteModuleDialogOpen(true);
                }}
                onMoveUp={handleModuleMoveUp}
                onMoveDown={handleModuleMoveDown}
                onAddLesson={(moduleId) => {
                  setActiveModuleId(moduleId);
                  setEditingLesson(null);
                  setLessonDialogOpen(true);
                }}
                onEditLesson={(lesson) => {
                  setEditingLesson(lesson);
                  setActiveModuleId(lesson.module_id);
                  setLessonDialogOpen(true);
                }}
                onDeleteLesson={(lesson) => {
                  setDeletingLesson(lesson);
                  setDeleteLessonDialogOpen(true);
                }}
                onMoveLessonUp={handleLessonMoveUp}
                onMoveLessonDown={handleLessonMoveDown}
                onPreviewLesson={(lesson) => {
                  setPreviewingLesson(lesson);
                  setLessonPreviewDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Module Form Dialog */}
      <ModuleFormDialog
        open={moduleDialogOpen}
        onOpenChange={(open) => {
          setModuleDialogOpen(open);
          if (!open) setEditingModule(null);
        }}
        onSubmit={handleModuleSubmit}
        module={editingModule}
        isLoading={createModuleMutation.isPending || updateModuleMutation.isPending}
      />

      {/* Lesson Form Dialog */}
      <LessonFormDialog
        open={lessonDialogOpen}
        onOpenChange={(open) => {
          setLessonDialogOpen(open);
          if (!open) {
            setEditingLesson(null);
            setActiveModuleId(null);
          }
        }}
        onSubmit={handleLessonSubmit}
        lesson={editingLesson}
        isLoading={createLessonMutation.isPending || updateLessonMutation.isPending}
      />

      {/* Lesson Preview Dialog */}
      <LessonPreviewDialog
        open={lessonPreviewDialogOpen}
        onOpenChange={(open) => {
          setLessonPreviewDialogOpen(open);
          if (!open) setPreviewingLesson(null);
        }}
        lesson={previewingLesson}
      />

      {/* Delete Module Confirmation */}
      <DeleteConfirmDialog
        open={deleteModuleDialogOpen}
        onOpenChange={setDeleteModuleDialogOpen}
        onConfirm={() => {
          if (deletingModule) {
            deleteModuleMutation.mutate(deletingModule.id);
            setDeleteModuleDialogOpen(false);
            setDeletingModule(null);
          }
        }}
        title="Delete Module"
        description={`Are you sure you want to delete "${deletingModule?.title}"? This will also delete ${deletingModule?.lessons.length ?? 0} lesson(s). This action cannot be undone.`}
        isLoading={deleteModuleMutation.isPending}
      />

      {/* Delete Lesson Confirmation */}
      <DeleteConfirmDialog
        open={deleteLessonDialogOpen}
        onOpenChange={setDeleteLessonDialogOpen}
        onConfirm={() => {
          if (deletingLesson) {
            deleteLessonMutation.mutate(deletingLesson.id);
            setDeleteLessonDialogOpen(false);
            setDeletingLesson(null);
          }
        }}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${deletingLesson?.title}"? This action cannot be undone.`}
        isLoading={deleteLessonMutation.isPending}
      />
    </AdminLayout>
  );
};

export default AdminCourseContent;
