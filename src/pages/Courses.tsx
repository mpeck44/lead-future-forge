import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  Search,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  price: number | null;
  estimated_hours: number | null;
  path_type: string | null;
  tags: string[] | null;
}

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, description, slug, price, estimated_hours, path_type, tags')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      } else {
        setCourses(coursesData || []);
      }

      // Fetch user's enrollments if logged in
      if (user) {
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (enrollmentsData) {
          setEnrolledCourseIds(new Set(enrollmentsData.map(e => e.course_id)));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setEnrollingId(courseId);
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: 'active',
          amount_paid: 0 // Free enrollment for now
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You are already enrolled in this course');
        } else {
          throw error;
        }
      } else {
        setEnrolledCourseIds(prev => new Set([...prev, courseId]));
        toast.success('Successfully enrolled!');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to enroll. Please try again.');
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.path_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return 'Free';
    return `$${(price / 100).toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Course Catalog
              </h1>
              <p className="font-body text-lg text-muted-foreground mb-8">
                Tools and frameworks you can use tomorrow. Built by practitioners, for practitioners.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-body"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                      <div className="h-10 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredCourses.length === 0 && (
              <Card className="text-center py-12 max-w-lg mx-auto">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h2 className="font-display text-2xl font-semibold mb-3">
                    {searchQuery ? 'No courses found' : 'Coming Soon'}
                  </h2>
                  <p className="font-body text-muted-foreground mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search terms.'
                      : 'We\'re working on exciting new courses. Check back soon!'}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Course Cards */}
            {!loading && filteredCourses.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="font-body text-muted-foreground">
                    {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => {
                    const isEnrolled = enrolledCourseIds.has(course.id);
                    const isEnrolling = enrollingId === course.id;

                    return (
                      <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            {course.path_type && (
                              <Badge variant="secondary" className="font-body text-xs">
                                {course.path_type}
                              </Badge>
                            )}
                            <span className="font-display font-bold text-primary">
                              {formatPrice(course.price)}
                            </span>
                          </div>
                          <CardTitle className="font-display text-xl leading-tight">
                            {course.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          {/* Structured course info in practitioner voice */}
                          <div className="space-y-2 mb-4 text-sm">
                            {course.description && (
                              <p className="font-body text-muted-foreground line-clamp-2">
                                {course.description}
                              </p>
                            )}
                            <div className="space-y-1 pt-2 border-t border-border/50">
                              <p className="font-body text-foreground">
                                <span className="font-medium">What you'll build:</span> Documents and tools you can use next week
                              </p>
                              {course.estimated_hours && (
                                <p className="font-body text-muted-foreground">
                                  <span className="font-medium text-foreground">Time investment:</span> {course.estimated_hours} hours of focused work
                                </p>
                              )}
                              <p className="font-body text-muted-foreground">
                                <span className="font-medium text-foreground">Who this is for:</span> Leaders who need practical tools, not theory
                              </p>
                            </div>
                            <p className="font-body text-xs text-primary italic pt-2">
                              This isn't comprehensive. It's practical.
                            </p>
                          </div>
                          
                          {/* Course Meta */}
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-6">
                            {course.estimated_hours && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="font-body">{course.estimated_hours} hours</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span className="font-body">Self-paced</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              <span className="font-body">Certificate</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-auto">
                            {isEnrolled ? (
                              <Button asChild className="w-full font-body">
                                <Link to={`/course/${course.slug}`}>
                                  Continue Learning
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  asChild 
                                  className="flex-1 font-body"
                                >
                                  <Link to={`/course/${course.slug}`}>
                                    Learn More
                                  </Link>
                                </Button>
                                <Button 
                                  onClick={() => handleEnroll(course.id)}
                                  disabled={isEnrolling}
                                  className="flex-1 font-body"
                                >
                                  {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        {!loading && courses.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-primary text-primary-foreground p-8 lg:p-12">
                <div className="max-w-2xl mx-auto text-center">
                  <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">
                    Ready to build something you can use tomorrow?
                  </h2>
                  <p className="font-body text-primary-foreground/80 mb-6">
                    Stop reading about AI. Start building tools you can actually use in your district.
                  </p>
                  {!user && (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      asChild
                      className="font-body"
                    >
                      <Link to="/auth">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
