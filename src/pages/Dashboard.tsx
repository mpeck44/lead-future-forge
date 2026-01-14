import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Folder, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
  full_name: string | null;
  email: string | null;
  role: string | null;
  district_name: string | null;
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

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                  Enrolled Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">0</div>
                <p className="font-body text-xs text-muted-foreground">
                  Start your first course today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                  Completed Lessons
                </CardTitle>
                <Trophy className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">0</div>
                <p className="font-body text-xs text-muted-foreground">
                  Track your progress here
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                  Portfolio Items
                </CardTitle>
                <Folder className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">0</div>
                <p className="font-body text-xs text-muted-foreground">
                  Deliverables you've created
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-display text-xl">Continue Where You Left Off</CardTitle>
              <CardDescription className="font-body">
                Pick up right where you stopped
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Ready to start learning?</h3>
                <p className="font-body text-muted-foreground mb-4">
                  Browse our courses and enroll in your first one to begin your AI leadership journey.
                </p>
                <Button asChild>
                  <Link to="/#courses" className="font-body">
                    Browse Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Courses Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-display text-xl">My Courses</CardTitle>
              <CardDescription className="font-body">
                Courses you're enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="font-body text-muted-foreground mb-4">
                  You haven't enrolled in any courses yet.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/#courses" className="font-body">
                    Explore Courses
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">My Portfolio</CardTitle>
              <CardDescription className="font-body">
                Your completed deliverables and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Build Your Portfolio</h3>
                <p className="font-body text-muted-foreground mb-4">
                  Complete course lessons to add deliverables to your portfolio.
                </p>
                <Button variant="outline" disabled className="font-body">
                  View Portfolio (Coming Soon)
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
