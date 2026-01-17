import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Folder, ArrowRight, Sparkles, Target, TrendingUp, PlayCircle } from 'lucide-react';
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

  // Fetch portfolio items count
  const { data: portfolioCount = 0 } = useQuery({
    queryKey: ['dashboard-portfolio-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('portfolio_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  
  // Calculate totals
  const totalEnrolled = enrollments.length;
  const totalLessons = progressData.reduce((sum, p) => sum + p.totalLessons, 0);
  const completedLessons = progressData.reduce((sum, p) => sum + p.completedLessons, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Welcome back, {firstName}!
            </h1>
            <p className="font-body text-muted-foreground">
              Continue your learning journey and build your AI leadership skills.
            </p>
          </div>

          {/* Ready to Start Learning CTA - Prominent placement for new users */}
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
                      Ready to become an AI-forward leader?
                    </h2>
                    <p className="font-body text-muted-foreground max-w-2xl">
                      Your learning journey starts with a single step. Explore courses designed to help you lead AI transformation in your organization.
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

          {/* Stats Cards with Visual Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Enrolled Courses Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Enrolled Courses
                </CardTitle>
                <BookOpen className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {hasEnrollments ? (
                  <>
                    <div className="font-display text-3xl font-bold text-foreground">{totalEnrolled}</div>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      {totalEnrolled === 1 ? 'Active course' : 'Active courses'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary/60" />
                      <span className="font-display text-lg font-semibold text-foreground">Get Started</span>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      Choose your first course to begin
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Learning Progress Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Learning Progress
                </CardTitle>
                <Trophy className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                {hasEnrollments && totalLessons > 0 ? (
                  <>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="font-display text-3xl font-bold text-foreground">{overallProgress}%</span>
                      <span className="font-body text-sm text-muted-foreground mb-1">complete</span>
                    </div>
                    <Progress value={overallProgress} className="h-2 mb-2" />
                    <p className="font-body text-sm text-muted-foreground">
                      {completedLessons} of {totalLessons} lessons completed
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-accent/60" />
                      <span className="font-display text-lg font-semibold text-foreground">Track Progress</span>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      Complete lessons to see your progress
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Items Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Portfolio Items
                </CardTitle>
                <Folder className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                {portfolioCount > 0 ? (
                  <>
                    <div className="font-display text-3xl font-bold text-foreground">{portfolioCount}</div>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      {portfolioCount === 1 ? 'Deliverable created' : 'Deliverables created'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-green-600/60" />
                      <span className="font-display text-lg font-semibold text-foreground">Build Skills</span>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      Create deliverables as you learn
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Continue Where You Left Off - Highlighted Section */}
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Continue Where You Left Off
              </CardTitle>
              <CardDescription className="font-body font-medium">
                {hasEnrollments ? 'Pick up right where you stopped' : 'Start your learning journey today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mostRecentEnrollment ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-background/60 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      {mostRecentEnrollment.courses.title}
                    </h3>
                    {mostRecentEnrollment.courses.description && (
                      <p className="font-body text-sm text-muted-foreground line-clamp-1 mb-3">
                        {mostRecentEnrollment.courses.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-xs">
                        <Progress value={mostRecentCourseProgress} className="h-2" />
                      </div>
                      <span className="font-body text-sm font-medium text-foreground">
                        {mostRecentCourseProgress}% complete
                      </span>
                    </div>
                  </div>
                  <Button asChild className="font-body">
                    <Link to={`/course/${mostRecentEnrollment.courses.slug}`}>
                      {mostRecentCourseProgress === 0 ? 'Start' : mostRecentCourseProgress === 100 ? 'Review' : 'Continue'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    Your journey awaits
                  </h3>
                  <p className="font-body text-muted-foreground mb-4 max-w-md mx-auto">
                    Choose from expert-designed courses that fit your schedule and goals. Start building your AI leadership skills today.
                  </p>
                  <Button asChild className="font-body">
                    <Link to="/courses">
                      Browse Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
                    Your learning journey starts with a single step. Explore courses designed to help you lead AI transformation.
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
                Your completed deliverables and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Build Your Portfolio</h3>
                <p className="font-body text-muted-foreground mb-4 max-w-md mx-auto">
                  As you progress through courses, you'll build real-world deliverables that showcase your AI leadership skills.
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
