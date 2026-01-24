import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Folder, ArrowRight, Sparkles, PlayCircle, Rocket, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
  full_name: string | null;
  email: string | null;
  role: string | null;
  district_name: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  created_at: string;
  courses: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    estimated_hours: number | null;
  };
}

interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
}

interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  totalLessons: number;
  completedLessons: number;
  remainingMinutes: number;
}

interface PortfolioStats {
  total: number;
  usedInDistrict: number;
  currentDraft: { title: string } | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, role, district_name')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // Fetch enrollments with course details
  const { data: enrollments = [] } = useQuery({
    queryKey: ['dashboard-enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          created_at,
          courses (
            id,
            title,
            description,
            slug,
            estimated_hours
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return (data || []) as Enrollment[];
    },
    enabled: !!user,
  });

  // Fetch progress for all enrolled courses
  const { data: progressData = [] } = useQuery({
    queryKey: ['dashboard-progress', user?.id, enrollments],
    queryFn: async () => {
      if (!user || enrollments.length === 0) return [];
      
      const courseIds = enrollments.map(e => e.course_id);
      
      // Get all modules for enrolled courses
      const { data: modules } = await supabase
        .from('modules')
        .select('id, course_id')
        .in('course_id', courseIds);
      
      if (!modules || modules.length === 0) return [];
      
      const moduleIds = modules.map(m => m.id);
      
      // Get all lessons for these modules
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, module_id')
        .in('module_id', moduleIds)
        .eq('is_published', true);
      
      if (!lessons) return [];
      
      // Get user's completed lessons
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');
      
      const completedLessonIds = new Set((userProgress || []).map(p => p.lesson_id));
      
      // Calculate progress per course
      const progressMap: CourseProgress[] = courseIds.map(courseId => {
        const courseModuleIds = modules
          .filter(m => m.course_id === courseId)
          .map(m => m.id);
        
        const courseLessons = lessons.filter(l => courseModuleIds.includes(l.module_id));
        const completedCount = courseLessons.filter(l => completedLessonIds.has(l.id)).length;
        
        return {
          courseId,
          totalLessons: courseLessons.length,
          completedLessons: completedCount,
        };
      });
      
      return progressMap;
    },
    enabled: !!user && enrollments.length > 0,
  });

  // Fetch current module progress for the most recent course
  const { data: currentModuleProgress } = useQuery({
    queryKey: ['dashboard-current-module', user?.id, enrollments],
    queryFn: async () => {
      if (!user || enrollments.length === 0) return null;
      
      const mostRecentCourseId = enrollments.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]?.course_id;
      
      if (!mostRecentCourseId) return null;
      
      // Get modules for this course
      const { data: modules } = await supabase
        .from('modules')
        .select('id, title, sequence_order')
        .eq('course_id', mostRecentCourseId)
        .order('sequence_order');
      
      if (!modules || modules.length === 0) return null;
      
      // Get lessons with estimated_minutes
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, module_id, estimated_minutes')
        .in('module_id', modules.map(m => m.id))
        .eq('is_published', true);
      
      if (!lessons) return null;
      
      // Get user progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id);
      
      const completedLessonIds = new Set(
        (userProgress || []).filter(p => p.status === 'completed').map(p => p.lesson_id)
      );
      
      // Find the first incomplete module
      for (const module of modules) {
        const moduleLessons = lessons.filter(l => l.module_id === module.id);
        const completedCount = moduleLessons.filter(l => completedLessonIds.has(l.id)).length;
        
        if (completedCount < moduleLessons.length) {
          const remainingLessons = moduleLessons.filter(l => !completedLessonIds.has(l.id));
          const remainingMinutes = remainingLessons.reduce((sum, l) => sum + (l.estimated_minutes || 5), 0);
          
          return {
            moduleId: module.id,
            moduleTitle: module.title,
            totalLessons: moduleLessons.length,
            completedLessons: completedCount,
            remainingMinutes,
          } as ModuleProgress;
        }
      }
      
      return null;
    },
    enabled: !!user && enrollments.length > 0,
  });

  // Fetch portfolio stats including used_in_district
  const { data: portfolioStats } = useQuery({
    queryKey: ['dashboard-portfolio-stats', user?.id],
    queryFn: async (): Promise<PortfolioStats> => {
      if (!user) return { total: 0, usedInDistrict: 0, currentDraft: null };
      
      const { data: items, error } = await supabase
        .from('portfolio_items')
        .select('id, title, status, used_in_district')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const allItems = items || [];
      const draft = allItems.find(i => i.status === 'draft');
      
      return {
        total: allItems.length,
        usedInDistrict: allItems.filter(i => i.used_in_district).length,
        currentDraft: draft ? { title: draft.title } : null,
      };
    },
    enabled: !!user,
  });

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  
  // Calculate totals
  const totalEnrolled = enrollments.length;
  const totalLessons = progressData.reduce((sum, p) => sum + p.totalLessons, 0);
  const completedLessons = progressData.reduce((sum, p) => sum + p.completedLessons, 0);
  
  // Find most recent course to continue
  const mostRecentEnrollment = enrollments.length > 0 
    ? enrollments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;
  
  const mostRecentProgress = mostRecentEnrollment 
    ? progressData.find(p => p.courseId === mostRecentEnrollment.course_id)
    : null;
  
  const mostRecentCourseProgress = mostRecentProgress && mostRecentProgress.totalLessons > 0
    ? Math.round((mostRecentProgress.completedLessons / mostRecentProgress.totalLessons) * 100)
    : 0;

  const hasEnrollments = totalEnrolled > 0;
  const portfolioTotal = portfolioStats?.total || 0;
  const usedCount = portfolioStats?.usedInDistrict || 0;
  const currentDraft = portfolioStats?.currentDraft;

  // Build dynamic welcome message
  const buildWelcomeMessage = () => {
    if (!hasEnrollments) {
      return "Let's get you started with your first course.";
    }
    
    const parts: string[] = [];
    
    if (portfolioTotal > 0) {
      parts.push(`You've built ${portfolioTotal} deliverable${portfolioTotal === 1 ? '' : 's'}.`);
    }
    
    if (currentModuleProgress) {
      const remaining = currentModuleProgress.totalLessons - currentModuleProgress.completedLessons;
      parts.push(`${remaining} lesson${remaining === 1 ? '' : 's'} left in this module.`);
      
      if (currentModuleProgress.remainingMinutes <= 30) {
        parts.push(`Most leaders finish Module 1 in one sitting (${currentModuleProgress.remainingMinutes} min).`);
      }
    }
    
    return parts.join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section - Practitioner Voice */}
          <div className="mb-8">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Welcome back, {firstName}.
            </h1>
            <p className="font-body text-muted-foreground mb-4">
              {buildWelcomeMessage()}
            </p>
            {hasEnrollments && currentModuleProgress && currentModuleProgress.remainingMinutes <= 25 && (
              <p className="font-body text-primary font-medium">
                Got 20 minutes now? Let's knock it out.
              </p>
            )}
          </div>

          {/* Ready to Start Learning CTA - For new users */}
          {!hasEnrollments && (
            <Card className="mb-8 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 border-primary/30">
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Ready to build something you can use tomorrow?
                    </h2>
                    <p className="font-body text-muted-foreground max-w-2xl">
                      Our courses aren't about theory. You'll walk away with real documents, frameworks, and tools you can use in your district next week.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button size="lg" asChild className="font-body">
                      <Link to="/courses">
                        Explore Courses
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards - Implementation-Focused */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Your Progress Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Your Progress
                </CardTitle>
                <Folder className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm">Built:</span>
                    <span className="font-display font-bold">{portfolioTotal} deliverable{portfolioTotal !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm">Used in your district:</span>
                    <span className="font-display font-bold">{usedCount} deliverable{usedCount !== 1 ? 's' : ''}</span>
                  </div>
                  {portfolioTotal > 0 && usedCount === 0 && (
                    <div className="flex items-center gap-2 text-amber-600 mt-3 pt-3 border-t">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-body text-sm font-medium">Time to test something!</span>
                    </div>
                  )}
                  {currentDraft && (
                    <div className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                      Currently working on: <span className="font-medium">{currentDraft.title}</span> (draft)
                    </div>
                  )}
                  <Button variant="link" asChild className="font-body p-0 h-auto mt-2">
                    <Link to="/portfolio">
                      View Portfolio <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Continue Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Continue
                </CardTitle>
                <PlayCircle className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                {hasEnrollments && currentModuleProgress ? (
                  <div className="space-y-2">
                    <p className="font-display font-bold text-lg">
                      {currentModuleProgress.moduleTitle}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      {currentModuleProgress.remainingMinutes} min remaining
                    </p>
                    {currentModuleProgress.remainingMinutes <= 30 && (
                      <p className="font-body text-xs text-muted-foreground">
                        Can be completed in one sitting.
                      </p>
                    )}
                    <p className="font-body text-sm text-muted-foreground">
                      {currentModuleProgress.totalLessons - currentModuleProgress.completedLessons} lessons remaining
                    </p>
                    <Button asChild className="font-body mt-2 w-full">
                      <Link to={mostRecentEnrollment ? `/course/${mostRecentEnrollment.courses.slug}` : '/courses'}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : hasEnrollments ? (
                  <div className="space-y-2">
                    <p className="font-body text-muted-foreground">
                      You've completed all available lessons!
                    </p>
                    <Button variant="outline" asChild className="font-body mt-2 w-full">
                      <Link to="/courses">
                        Explore More Courses <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-body text-muted-foreground">
                      Enroll in a course to start building.
                    </p>
                    <Button asChild className="font-body mt-2 w-full">
                      <Link to="/courses">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  What's Next?
                </CardTitle>
                <Rocket className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                {hasEnrollments ? (
                  <ul className="space-y-3">
                    {currentModuleProgress && (
                      <li className="flex items-start gap-2">
                        <Square className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="font-body text-sm">
                          Finish {currentModuleProgress.moduleTitle} ({currentModuleProgress.remainingMinutes} min)
                        </span>
                      </li>
                    )}
                    {portfolioTotal > 0 && usedCount === 0 && (
                      <li className="flex items-start gap-2">
                        <Square className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="font-body text-sm">
                          Share a deliverable with your team
                        </span>
                      </li>
                    )}
                    {portfolioTotal > 0 && usedCount > 0 && (
                      <li className="flex items-start gap-2">
                        <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="font-body text-sm text-muted-foreground">
                          You've tested {usedCount} deliverable{usedCount !== 1 ? 's' : ''} in your district!
                        </span>
                      </li>
                    )}
                    <li className="mt-4">
                      <Button variant="outline" asChild className="font-body w-full">
                        <Link to={mostRecentEnrollment ? `/course/${mostRecentEnrollment.courses.slug}` : '/courses'}>
                          View Full Course <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Square className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="font-body text-sm">
                        Pick your first course
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Square className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="font-body text-sm">
                        Complete your first lesson
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Square className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="font-body text-sm">
                        Build your first deliverable
                      </span>
                    </li>
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Courses Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-display text-xl font-bold">My Courses</CardTitle>
              <CardDescription className="font-body font-medium">
                Courses you're enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasEnrollments ? (
                <div className="space-y-4">
                  {enrollments.slice(0, 3).map((enrollment) => {
                    const courseProgress = progressData.find(p => p.courseId === enrollment.course_id);
                    const progressPercent = courseProgress && courseProgress.totalLessons > 0
                      ? Math.round((courseProgress.completedLessons / courseProgress.totalLessons) * 100)
                      : 0;
                    
                    return (
                      <div 
                        key={enrollment.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50"
                      >
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-foreground">
                            {enrollment.courses.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-2">
                            <Progress value={progressPercent} className="h-1.5 flex-1 max-w-32" />
                            <span className="font-body text-xs text-muted-foreground">
                              {progressPercent}%
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="font-body">
                          <Link to={`/course/${enrollment.courses.slug}`}>
                            {progressPercent === 0 ? 'Start' : progressPercent === 100 ? 'Review' : 'Continue'}
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                  {enrollments.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" asChild className="font-body">
                        <Link to="/my-courses">
                          View all {enrollments.length} courses
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-body text-muted-foreground mb-4 max-w-md mx-auto">
                    Pick a course and start building tools you can use in your district.
                  </p>
                  <Button variant="outline" asChild className="font-body">
                    <Link to="/courses">
                      Explore Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl font-bold">My Portfolio</CardTitle>
              <CardDescription className="font-body font-medium">
                Work products you can use tomorrow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {portfolioTotal > 0 ? `${portfolioTotal} deliverable${portfolioTotal !== 1 ? 's' : ''} built` : 'Build Your Portfolio'}
                </h3>
                <p className="font-body text-muted-foreground mb-4 max-w-md mx-auto">
                  {portfolioTotal > 0 
                    ? `You've built ${portfolioTotal} deliverable${portfolioTotal !== 1 ? 's' : ''}. ${usedCount > 0 ? `${usedCount} already tested in your district!` : 'Ready to test one in your district?'}`
                    : 'As you work through courses, you\'ll build real documents and frameworks you can use in your school or district.'
                  }
                </p>
                <Button variant="outline" asChild className="font-body">
                  <Link to="/portfolio">
                    View Portfolio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
