import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  estimated_hours: number | null;
  path_type: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  purchase_date: string;
  course: Course;
}

interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

const MyCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollmentsAndProgress = async () => {
      if (!user) return;

      // Fetch enrollments with course details
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          status,
          purchase_date,
          course:courses (
            id,
            title,
            description,
            slug,
            estimated_hours,
            path_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
        setLoading(false);
        return;
      }

      // Transform the data to match our interface
      const transformedEnrollments: Enrollment[] = (enrollmentData || []).map((e: any) => ({
        id: e.id,
        course_id: e.course_id,
        status: e.status,
        purchase_date: e.purchase_date,
        course: e.course
      }));

      setEnrollments(transformedEnrollments);

      // Fetch progress for each course
      if (transformedEnrollments.length > 0) {
        const courseIds = transformedEnrollments.map(e => e.course_id);
        
        // Get all lessons for enrolled courses
        const { data: modulesData } = await supabase
          .from('modules')
          .select('id, course_id')
          .in('course_id', courseIds);

        if (modulesData && modulesData.length > 0) {
          const moduleIds = modulesData.map(m => m.id);
          
          // Get lessons count per module
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('id, module_id')
            .in('module_id', moduleIds);

          // Get user's completed lessons
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id, status')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          // Build progress map
          const newProgressMap: Record<string, CourseProgress> = {};
          
          for (const courseId of courseIds) {
            const courseModuleIds = modulesData
              .filter(m => m.course_id === courseId)
              .map(m => m.id);
            
            const courseLessons = lessonsData?.filter(l => 
              courseModuleIds.includes(l.module_id)
            ) || [];
            
            const courseLessonIds = courseLessons.map(l => l.id);
            const completedLessons = progressData?.filter(p => 
              courseLessonIds.includes(p.lesson_id)
            ).length || 0;
            
            const totalLessons = courseLessons.length;
            const progressPercent = totalLessons > 0 
              ? Math.round((completedLessons / totalLessons) * 100) 
              : 0;

            newProgressMap[courseId] = {
              courseId,
              totalLessons,
              completedLessons,
              progressPercent
            };
          }
          
          setProgressMap(newProgressMap);
        }
      }

      setLoading(false);
    };

    fetchEnrollmentsAndProgress();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
              My Courses
            </h1>
            <p className="font-body text-muted-foreground">
              Track your progress and continue learning
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-4"></div>
                    <div className="h-2 bg-muted rounded w-full mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && enrollments.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="font-display text-2xl font-semibold mb-3">
                  No courses yet
                </h2>
                <p className="font-body text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven't enrolled in any courses. Browse our catalog to find the perfect course for your leadership journey.
                </p>
                <Button asChild size="lg">
                  <Link to="/#courses" className="font-body">
                    Browse Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Course Cards */}
          {!loading && enrollments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => {
                const progress = progressMap[enrollment.course_id];
                const isComplete = progress?.progressPercent === 100;
                
                return (
                  <Card key={enrollment.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-display text-lg leading-tight">
                          {enrollment.course.title}
                        </CardTitle>
                        {isComplete && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      {enrollment.course.path_type && (
                        <span className="inline-block text-xs font-body font-medium text-primary bg-primary/10 px-2 py-1 rounded-full w-fit">
                          {enrollment.course.path_type}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {enrollment.course.description && (
                        <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">
                          {enrollment.course.description}
                        </p>
                      )}
                      
                      {/* Course Meta */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                        {enrollment.course.estimated_hours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-body">{enrollment.course.estimated_hours}h</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span className="font-body">
                            {progress?.totalLessons || 0} lessons
                          </span>
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-body text-sm font-medium">
                            Progress
                          </span>
                          <span className="font-body text-sm text-muted-foreground">
                            {progress?.completedLessons || 0}/{progress?.totalLessons || 0} lessons
                          </span>
                        </div>
                        <Progress 
                          value={progress?.progressPercent || 0} 
                          className="h-2 mb-4"
                        />
                        
                        <div className="flex items-center justify-between">
                          <span className="font-body text-xs text-muted-foreground">
                            Enrolled {formatDate(enrollment.purchase_date)}
                          </span>
                          <Button size="sm" asChild>
                            <Link to={`/course/${enrollment.course.slug}`} className="font-body">
                              {progress?.progressPercent === 0 ? (
                                <>
                                  Start
                                  <PlayCircle className="ml-1 h-3 w-3" />
                                </>
                              ) : isComplete ? (
                                'Review'
                              ) : (
                                'Continue'
                              )}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;
