import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Building, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const scorePassword = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-3
};


const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signUp, signIn, signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);

  const friendlyError = (message: string): string => {
    const msg = message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('user already')) {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (msg.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
    }
    if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('networkerror')) {
      return 'Something went wrong. Please try again.';
    }
    return message;
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [districtName, setDistrictName] = useState('');
  
  // Magic link state
  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  // Signup success state
  const [signupSuccessEmail, setSignupSuccessEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleResendConfirmation = async () => {
    if (!signupSuccessEmail) return;
    setResendLoading(true);
    setResendMessage(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: signupSuccessEmail,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setResendMessage(friendlyError(error.message));
    } else {
      setResendMessage('Confirmation email sent. Check your inbox.');
    }
    setResendLoading(false);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setLoginError(err.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    try {
      const { error } = await signIn(loginEmail, loginPassword);

      if (error) {
        setLoginError(friendlyError(error.message));
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
      }
    } catch (err) {
      setLoginError('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setIsLoading(true);

    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setSignupError(err.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match. Please try again.');
      setIsLoading(false);
      return;
    }

    if (!fullName.trim()) {
      setSignupError('Please enter your full name.');
      setIsLoading(false);
      return;
    }

    if (!role) {
      setSignupError('Please select your role.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(signupEmail, signupPassword, {
        full_name: fullName,
        role,
        district_name: districtName,
      });

      if (error) {
        setSignupError(friendlyError(error.message));
      } else {
        toast({
          title: 'Account Created!',
          description: 'Welcome to The Leadership Forge!',
        });
      }
    } catch (err) {
      setSignupError('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLinkError(null);
    setIsLoading(true);

    try {
      emailSchema.parse(magicLinkEmail);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setMagicLinkError(err.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    try {
      const { error } = await signInWithMagicLink(magicLinkEmail);

      if (error) {
        setMagicLinkError(friendlyError(error.message));
      } else {
        toast({
          title: 'Check your email!',
          description: 'We sent you a magic link to sign in.',
        });
        setMagicLinkEmail('');
      }
    } catch (err) {
      setMagicLinkError('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  if (showMagicLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <button 
              onClick={() => setShowMagicLink(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to login
            </button>
            <CardTitle className="font-display text-2xl">Magic Link</CardTitle>
            <CardDescription className="font-body">
              Enter your email and we'll send you a link to sign in instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email" className="font-body">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="you@example.com"
                    value={magicLinkEmail}
                    onChange={(e) => { setMagicLinkEmail(e.target.value); setMagicLinkError(null); }}
                    className="pl-10 font-body"
                    required
                  />
                </div>
              </div>
              {magicLinkError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive font-body">
                  {magicLinkError}
                </div>
              )}
              <Button type="submit" className="w-full font-body" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Sign In — EdLeaderForge</title>
        <meta name="description" content="Sign in or create your EdLeaderForge account to access AI leadership courses built for K-12 administrators." />
        <meta property="og:title" content="Sign In — EdLeaderForge" />
        <meta property="og:description" content="Access AI leadership courses built for K-12 administrators." />
        <link rel="canonical" href="https://edleaderforge.com/auth" />
      </Helmet>
      <div className="w-full max-w-md">
        {/* Logo and back link */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">LF</span>
            </div>
            <span className="font-display font-semibold text-lg text-foreground">
              The Leadership Forge
            </span>
          </a>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl">Welcome</CardTitle>
            <CardDescription className="font-body">
              Sign in to access your courses and continue learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
              className="w-full"
              onValueChange={() => { setLoginError(null); setSignupError(null); }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-body">Log In</TabsTrigger>
                <TabsTrigger value="signup" className="font-body">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-body">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setLoginError(null); }}
                        className="pl-10 font-body"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-body">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setLoginError(null); }}
                        className="pl-10 font-body"
                        required
                      />
                    </div>
                  </div>
                  {loginError && (
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive font-body">
                      {loginError}
                    </div>
                  )}
                  <Button type="submit" className="w-full font-body" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Log In'}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowMagicLink(true)}
                    className="text-sm text-primary hover:underline font-body"
                  >
                    Sign in with Magic Link instead
                  </button>
                </div>
              </TabsContent>
              
              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="font-body">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); setSignupError(null); }}
                        className="pl-10 font-body"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-body">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => { setSignupEmail(e.target.value); setSignupError(null); }}
                        className="pl-10 font-body"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-role" className="font-body">Role</Label>
                    <Select value={role} onValueChange={(v) => { setRole(v); setSignupError(null); }}>
                      <SelectTrigger className="font-body">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superintendent" className="font-body">Superintendent</SelectItem>
                        <SelectItem value="principal" className="font-body">Principal</SelectItem>
                        <SelectItem value="assistant_principal" className="font-body">Assistant Principal</SelectItem>
                        <SelectItem value="curriculum_director" className="font-body">Curriculum Director</SelectItem>
                        <SelectItem value="technology_director" className="font-body">Technology Director</SelectItem>
                        <SelectItem value="teacher_leader" className="font-body">Teacher Leader</SelectItem>
                        <SelectItem value="other" className="font-body">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-district" className="font-body">District Name (Optional)</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-district"
                        type="text"
                        placeholder="Your School District"
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                        className="pl-10 font-body"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-body">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => { setSignupPassword(e.target.value); setSignupError(null); }}
                        className="pl-10 font-body"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="font-body">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => { setSignupConfirmPassword(e.target.value); setSignupError(null); }}
                        className="pl-10 font-body"
                        required
                      />
                    </div>
                  </div>
                  
                  {signupError && (
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive font-body">
                      {signupError}
                    </div>
                  )}
                  <Button type="submit" className="w-full font-body" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
