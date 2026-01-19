import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sanitizeHtml } from '@/lib/sanitize';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Menu,
  Play,
  FileText,
  HelpCircle,
  ClipboardList,
  BookOpen
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  sequence_order: number;
  lesson_type: string | null;
  content: string | null;
  video_url: string | null;
  template_url: string | null;
  is_published: boolean | null;
}

interface Module {
  id: string;
  title: string;
  sequence_order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  modules: Module[];
}

interface UserProgress {
  lesson_id: string;
  status: string | null;
}

const CourseViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch course with modules and lessons
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['course-viewer', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, slug, description,
          modules (
            id, title, sequence_order,
            lessons (
              id, title, sequence_order, lesson_type,
              content, video_url, template_url, is_published
            )
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Course not found');
      
      // Sort modules and lessons by sequence_order
      const sortedModules = data.modules
        .sort((a, b) => a.sequence_order - b.sequence_order)
        .map(module => ({
          ...module,
          lessons: module.lessons
            .filter(l => l.is_published)
            .sort((a, b) => a.sequence_order - b.sequence_order)
        }));
      
      return { ...data, modules: sortedModules } as Course;
    },
    enabled: !!slug
  });

  // Verify enrollment
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment-check', course?.id, user?.id],
    queryFn: async () => {
      if (!course?.id || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!course?.id && !!user?.id
  });

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ['user-progress', course?.id, user?.id],
    queryFn: async () => {
      if (!course?.id || !user?.id) return [];
      
      // Get all lesson IDs for this course
      const lessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);
      
      if (error) throw error;
      return (data || []) as UserProgress[];
    },
    enabled: !!course?.id && !!user?.id
  });

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          started_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress', course?.id, user?.id] });
      toast({
        title: 'Lesson completed!',
        description: 'Your progress has been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Flatten lessons for navigation
  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap(m => m.lessons);
  }, [course]);

  // Calculate progress
  const completedLessons = useMemo(() => {
    return new Set(
      progressData?.filter(p => p.status === 'completed').map(p => p.lesson_id) || []
    );
  }, [progressData]);

  const progressPercent = useMemo(() => {
    if (allLessons.length === 0) return 0;
    return Math.round((completedLessons.size / allLessons.length) * 100);
  }, [allLessons, completedLessons]);

  // Current lesson
  const currentLesson = useMemo(() => {
    if (!currentLessonId) return null;
    return allLessons.find(l => l.id === currentLessonId) || null;
  }, [currentLessonId, allLessons]);

  const currentLessonIndex = useMemo(() => {
    if (!currentLessonId) return -1;
    return allLessons.findIndex(l => l.id === currentLessonId);
  }, [currentLessonId, allLessons]);

  // Initialize current lesson and open modules
  useEffect(() => {
    if (course && allLessons.length > 0 && !currentLessonId) {
      // Find first incomplete lesson or start at beginning
      const firstIncomplete = allLessons.find(l => !completedLessons.has(l.id));
      const startLesson = firstIncomplete || allLessons[0];
      setCurrentLessonId(startLesson.id);
      
      // Open all modules by default
      setOpenModules(new Set(course.modules.map(m => m.id)));
    }
  }, [course, allLessons, completedLessons, currentLessonId]);

  // Redirect if not enrolled
  useEffect(() => {
    if (!enrollmentLoading && !courseLoading && course && !enrollment) {
      toast({
        title: 'Access Denied',
        description: 'You need to enroll in this course to access it.',
        variant: 'destructive',
      });
      navigate('/courses');
    }
  }, [enrollment, enrollmentLoading, courseLoading, course, navigate, toast]);

  // Navigation handlers
  const goToLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setSidebarOpen(false);
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonId(allLessons[currentLessonIndex - 1].id);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentLessonIndex + 1].id);
    }
  };

  const handleMarkComplete = () => {
    if (currentLessonId) {
      markCompleteMutation.mutate(currentLessonId);
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const getLessonIcon = (type: string | null) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="h-4 w-4" />;
      case 'quiz':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  };

  // Loading state
  if (courseLoading || enrollmentLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[300px_1fr] gap-8">
            <Skeleton className="h-[400px] hidden lg:block" />
            <Skeleton className="h-[600px]" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This course doesn't exist or is not published.
          </p>
          <Button onClick={() => navigate('/my-courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg mb-3 line-clamp-2">{course.title}</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedLessons.size} of {allLessons.length} lessons completed
          </p>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {course.modules.map((module) => (
            <Collapsible
              key={module.id}
              open={openModules.has(module.id)}
              onOpenChange={() => toggleModule(module.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-muted rounded-lg transition-colors">
                <span className="font-medium text-sm">{module.title}</span>
                <ChevronDown 
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    openModules.has(module.id) ? 'rotate-180' : ''
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-2 space-y-1 pb-2">
                  {module.lessons.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isCurrent = lesson.id === currentLessonId;
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => goToLesson(lesson.id)}
                        className={`flex items-center gap-3 w-full p-2 rounded-lg text-left text-sm transition-colors ${
                          isCurrent
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/50 flex-shrink-0" />
                        )}
                        <span className="line-clamp-2">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-courses')}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">My Courses</span>
              </Button>
              
              {/* Mobile menu trigger */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <h1 className="font-semibold truncate hidden sm:block">{course.title}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{progressPercent}%</span>
                <Progress value={progressPercent} className="w-24 h-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 border rounded-lg bg-card overflow-hidden max-h-[calc(100vh-6rem)]">
              <SidebarContent />
            </div>
          </aside>

          {/* Lesson content */}
          <main className="min-w-0">
            {currentLesson ? (
              <div className="space-y-6">
                {/* Lesson header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getLessonIcon(currentLesson.lesson_type)}
                      <Badge variant="secondary" className="capitalize">
                        {currentLesson.lesson_type || 'material'}
                      </Badge>
                      {completedLessons.has(currentLesson.id) && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                  </div>
                </div>

                {/* Video player */}
                {currentLesson.video_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={getVideoEmbedUrl(currentLesson.video_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Lesson content */}
                {currentLesson.content && (
                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentLesson.content) }}
                  />
                )}

                {/* Template download */}
                {currentLesson.template_url && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Resource Download</p>
                          <p className="text-sm text-muted-foreground">
                            Download the template for this lesson
                          </p>
                        </div>
                      </div>
                      <Button asChild>
                        <a 
                          href={currentLesson.template_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={goToPreviousLesson}
                    disabled={currentLessonIndex <= 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2 justify-center">
                    {!completedLessons.has(currentLesson.id) && (
                      <Button
                        onClick={handleMarkComplete}
                        disabled={markCompleteMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {markCompleteMutation.isPending ? 'Saving...' : 'Mark Complete'}
                      </Button>
                    )}
                  </div>

                  <Button
                    variant={completedLessons.has(currentLesson.id) ? 'default' : 'outline'}
                    onClick={goToNextLesson}
                    disabled={currentLessonIndex >= allLessons.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No lessons available</h2>
                <p className="text-muted-foreground">
                  This course doesn't have any published lessons yet.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
