import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import Portfolio from "./pages/Portfolio";
import Courses from "./pages/Courses";
import PublicCourse from "./pages/PublicCourse";
import Profile from "./pages/Profile";
import CourseViewer from "./pages/CourseViewer";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseContent from "./pages/admin/AdminCourseContent";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWaitlist from "./pages/admin/AdminWaitlist";
import AdminAudits from "./pages/admin/AdminAudits";
import AdminResources from "./pages/admin/AdminResources";
import AdminResourceEdit from "./pages/admin/AdminResourceEdit";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<PublicCourse />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:slug" element={<ResourceDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:slug"
              element={
                <ProtectedRoute>
                  <CourseViewer />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <AdminProtectedRoute>
                  <AdminCourses />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/waitlist"
              element={
                <AdminProtectedRoute>
                  <AdminWaitlist />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/audits"
              element={
                <AdminProtectedRoute>
                  <AdminAudits />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <AdminProtectedRoute>
                  <AdminResources />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/resources/:id"
              element={
                <AdminProtectedRoute>
                  <AdminResourceEdit />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/:courseId/content"
              element={
                <AdminProtectedRoute>
                  <AdminCourseContent />
                </AdminProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
