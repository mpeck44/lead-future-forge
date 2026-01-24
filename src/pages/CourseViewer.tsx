import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
  Menu,
  FileText,
  Video,
  Pencil,
  MessageSquare,
  HelpCircle,
  ClipboardCheck,
  BookOpen,
  Clock
} from 'lucide-react';

// Import lesson type components
import ContentLesson from '@/components/course/ContentLesson';
import VideoLesson from '@/components/course/VideoLesson';
import ActivityLesson from '@/components/course/ActivityLesson';
import ReflectionLesson from '@/components/course/ReflectionLesson';
import QuestionLesson from '@/components/course/QuestionLesson';
import PortfolioTracker from '@/components/course/PortfolioTracker';

interface Lesson {
  id: string;
  title: string;
  sequence_order: number;
  lesson_type: string | null;
  content: string | null;
  video_url: string | null;
  template_url: string | null;
  is_published: boolean | null;
  estimated_minutes: number | null;
  // Enhanced fields
  learning_objective: string | null;
  key_takeaways: string[] | null;
  video_transcript: string | null;
  resource_type: string | null;
  resource_name: string | null;
  download_button_text: string | null;
  completion_type: string | null;
  character_limit: number | null;
}

interface Module {
  id: string;
  title: string;
  sequence_order: number;
  estimated_minutes: number | null;
  description: string | null;
  deliverable_name: string | null;
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

  // Fetch course with modules and lessons (including enhanced fields)
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['course-viewer', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, slug, description,
          modules (
            id, title, sequence_order, estimated_minutes, description, deliverable_name,
            lessons (
              id, title, sequence_order, lesson_type, estimated_minutes,
              content, video_url, template_url, is_published,
              learning_objective, key_takeaways, video_transcript,
              resource_type, resource_name, download_button_text,
              completion_type, character_limit
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

  // Fetch reflection responses for the current lesson
  const { data: reflectionData, refetch: refetchReflection } = useQuery({
    queryKey: ['reflection-response', currentLessonId, user?.id],
    queryFn: async () => {
      if (!currentLessonId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('reflection_responses')
        .select('response, skipped, updated_at')
        .eq('user_id', user.id)
        .eq('lesson_id', currentLessonId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentLessonId && !!user?.id
  });

  // Fetch question responses for the current lesson
  const { data: questionData, refetch: refetchQuestion } = useQuery({
    queryKey: ['question-response', currentLessonId, user?.id],
    queryFn: async () => {
      if (!currentLessonId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('question_responses')
        .select('response, skipped, updated_at')
        .eq('user_id', user.id)
        .eq('lesson_id', currentLessonId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentLessonId && !!user?.id
  });

  // Fetch portfolio items for the course
  const { data: portfolioItems } = useQuery({
    queryKey: ['portfolio-items', course?.id, user?.id],
    queryFn: async () => {
      if (!course?.id || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('id, title, completed_at')
        .eq('user_id', user.id)
        .eq('course_id', course.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!course?.id && !!user?.id
  });

  // Get deliverables from modules
  const deliverables = useMemo(() => {
    if (!course) return [];
    return course.modules
      .filter(m => m.deliverable_name)
      .map(m => ({
        moduleId: m.id,
        name: m.deliverable_name!,
        moduleTitle: m.title
      }));
  }, [course]);

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

  // Save reflection response mutation
  const saveReflectionMutation = useMutation({
    mutationFn: async ({ lessonId, response, skipped = false }: { lessonId: string; response: string; skipped?: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('reflection_responses')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          response: response,
          skipped: skipped,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });
      
      if (error) throw error;

      // Auto-create portfolio item when saving (not skipping)
      if (!skipped && response.trim()) {
        const lesson = allLessons.find(l => l.id === lessonId);
        await supabase
          .from('portfolio_items')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: course?.id,
            title: lesson?.title || 'Reflection',
            description: response.trim().substring(0, 500),
            status: 'draft',
          }, {
            onConflict: 'user_id,lesson_id'
          });
      }
    },
    onSuccess: (_, variables) => {
      refetchReflection();
      queryClient.invalidateQueries({ queryKey: ['portfolio-items', course?.id, user?.id] });
      // Auto-mark as complete when saving (not skipping)
      if (!variables.skipped && currentLessonId && !completedLessons.has(currentLessonId)) {
        markCompleteMutation.mutate(currentLessonId);
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save your response. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Save question response mutation
  const saveQuestionMutation = useMutation({
    mutationFn: async ({ lessonId, response, skipped = false }: { lessonId: string; response: string; skipped?: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('question_responses')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          response: response,
          skipped: skipped,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });
      
      if (error) throw error;

      // Auto-create portfolio item when saving (not skipping)
      if (!skipped && response.trim()) {
        const lesson = allLessons.find(l => l.id === lessonId);
        await supabase
          .from('portfolio_items')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: course?.id,
            title: lesson?.title || 'Question Response',
            description: response.trim().substring(0, 500),
            status: 'draft',
          }, {
            onConflict: 'user_id,lesson_id'
          });
      }
    },
    onSuccess: (_, variables) => {
      refetchQuestion();
      queryClient.invalidateQueries({ queryKey: ['portfolio-items', course?.id, user?.id] });
      // Auto-mark as complete when saving (not skipping)
      if (!variables.skipped && currentLessonId && !completedLessons.has(currentLessonId)) {
        markCompleteMutation.mutate(currentLessonId);
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save your answer. Please try again.',
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

  // Create portfolio item for activities
  const handleActivityPortfolioCreate = async (lessonId: string, title: string, description: string) => {
    if (!user?.id || !course?.id) return;
    
    await supabase
      .from('portfolio_items')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: course.id,
        title: title,
        description: description,
        status: 'draft',
      }, {
        onConflict: 'user_id,lesson_id'
      });
    
    queryClient.invalidateQueries({ queryKey: ['portfolio-items', course.id, user.id] });
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

  // Get lesson type icon based on type
  const getLessonIcon = (type: string | null) => {
    switch (type) {
      case 'content':
      case 'material':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'activity':
        return <Pencil className="h-4 w-4 text-orange-500" />;
      case 'reflection':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'question':
        return <HelpCircle className="h-4 w-4 text-indigo-500" />;
      case 'quiz':
        return <ClipboardCheck className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get lesson type label for display
  const getLessonTypeLabel = (type: string | null): string => {
    switch (type) {
      case 'content':
      case 'material':
        return 'Content';
      case 'video':
        return 'Video';
      case 'activity':
        return 'Activity';
      case 'reflection':
        return 'Reflection';
      case 'question':
        return 'Question';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Lesson';
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

  // Render the appropriate lesson component based on type
  const renderLessonContent = () => {
    if (!currentLesson) return null;

    const lessonType = currentLesson.lesson_type || 'content';

    switch (lessonType) {
      case 'video':
        return (
          <VideoLesson
            lesson={currentLesson}
            getVideoEmbedUrl={getVideoEmbedUrl}
          />
        );
      
      case 'activity':
        return (
          <ActivityLesson
            lesson={currentLesson}
            courseId={course?.id}
            onComplete={handleMarkComplete}
            onPortfolioCreate={handleActivityPortfolioCreate}
            isCompleted={completedLessons.has(currentLesson.id)}
            isPending={markCompleteMutation.isPending}
          />
        );
      
      case 'reflection':
        return (
          <ReflectionLesson
            lesson={currentLesson}
            savedResponse={reflectionData?.response || null}
            skipped={reflectionData?.skipped || false}
            lastSavedAt={reflectionData?.updated_at ? new Date(reflectionData.updated_at) : null}
            onSaveResponse={(response) => saveReflectionMutation.mutate({ lessonId: currentLesson.id, response })}
            onSkip={() => {
              saveReflectionMutation.mutate({ lessonId: currentLesson.id, response: '', skipped: true });
              goToNextLesson();
            }}
            onSaveAndContinue={() => {
              goToNextLesson();
            }}
            isSaving={saveReflectionMutation.isPending}
            isCompleted={completedLessons.has(currentLesson.id)}
          />
        );
      
      case 'content':
      case 'material':
        return (
          <ContentLesson
            lesson={currentLesson}
            getVideoEmbedUrl={getVideoEmbedUrl}
          />
        );
      
      case 'question':
        return (
          <QuestionLesson
            lesson={currentLesson}
            savedResponse={questionData?.response || null}
            skipped={questionData?.skipped || false}
            lastSavedAt={questionData?.updated_at ? new Date(questionData.updated_at) : null}
            onSaveResponse={(response) => saveQuestionMutation.mutate({ lessonId: currentLesson.id, response })}
            onSkip={() => {
              saveQuestionMutation.mutate({ lessonId: currentLesson.id, response: '', skipped: true });
              goToNextLesson();
            }}
            onSaveAndContinue={() => {
              goToNextLesson();
            }}
            isSaving={saveQuestionMutation.isPending}
            isCompleted={completedLessons.has(currentLesson.id)}
          />
        );
      
      case 'quiz':
        // Quiz placeholder - can be expanded later
        return (
          <ContentLesson
            lesson={currentLesson}
            getVideoEmbedUrl={getVideoEmbedUrl}
          />
        );
      
      default:
        return (
          <ContentLesson
            lesson={currentLesson}
            getVideoEmbedUrl={getVideoEmbedUrl}
          />
        );
    }
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
  const SidebarContent = () => {
    return (
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
            {course.modules.map((module, index) => {
              // Calculate total time for the module
              const moduleTime = module.lessons.reduce(
                (sum, lesson) => sum + (lesson.estimated_minutes || 0),
                0
              );
              
              return (
                <Collapsible
                  key={module.id}
                  open={openModules.has(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 py-4 text-left hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-xs font-medium flex items-center justify-center text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block">{module.title}</span>
                        {moduleTime > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <span>{moduleTime} min total</span>
                            {moduleTime <= 30 && (
                              <span className="ml-1">· One sitting</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${
                        openModules.has(module.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-11 space-y-1 pb-2">
                      {module.lessons.map((lesson) => {
                        const isCompleted = completedLessons.has(lesson.id);
                        const isCurrent = lesson.id === currentLessonId;
                        
                        // Get activity type label
                        const getActivityLabel = (type: string | null) => {
                          switch (type) {
                            case 'video': return 'watch';
                            case 'activity': return 'you create';
                            case 'reflection': return 'reflect';
                            case 'question': return 'respond';
                            case 'quiz': return 'assess';
                            case 'content':
                            case 'material':
                            default: return 'read';
                          }
                        };
                        
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
                              getLessonIcon(lesson.lesson_type)
                            )}
                            <span className="flex-1 line-clamp-2">
                              {lesson.title}
                              <span className="text-muted-foreground ml-1 text-xs">
                                {lesson.estimated_minutes && `(${lesson.estimated_minutes} min)`}
                                {' - '}
                                <span className="italic">{getActivityLabel(lesson.lesson_type)}</span>
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>

        {/* Portfolio Tracker */}
        {deliverables.length > 0 && (
          <PortfolioTracker
            deliverables={deliverables}
            completedItems={portfolioItems || []}
            courseName={course.title.split(' ')[0]}
          />
        )}
      </div>
    );
  };

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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getLessonIcon(currentLesson.lesson_type)}
                      <Badge variant="secondary" className="capitalize">
                        {getLessonTypeLabel(currentLesson.lesson_type)}
                      </Badge>
                      {currentLesson.estimated_minutes && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {currentLesson.estimated_minutes} min
                        </span>
                      )}
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

                {/* Lesson content - rendered based on type */}
                {renderLessonContent()}

                {/* Actions - shown for non-reflection lessons (reflection has its own completion logic) */}
                {currentLesson.lesson_type !== 'reflection' && (
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
                      {!completedLessons.has(currentLesson.id) && currentLesson.lesson_type !== 'activity' && (
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
                )}

                {/* Navigation for reflection lessons */}
                {currentLesson.lesson_type === 'reflection' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={goToPreviousLesson}
                      disabled={currentLessonIndex <= 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <Button
                      variant={completedLessons.has(currentLesson.id) ? 'default' : 'outline'}
                      onClick={goToNextLesson}
                      disabled={currentLessonIndex >= allLessons.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
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
