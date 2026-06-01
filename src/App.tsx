import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const Home = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LevelPage = lazy(() => import("./pages/LevelPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const UpgradePage = lazy(() => import("./pages/UpgradePage"));
const MakePaymentPage = lazy(() => import("./pages/PaymentPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ManageCourses = lazy(() => import("./pages/admin/ManageCourses"));
const ManageModules = lazy(() => import("./pages/admin/ManageModules"));
const ManageLessons = lazy(() => import("./pages/admin/ManageLessons"));
const ManageQuizzes = lazy(() => import("./pages/admin/ManageQuizzes"));

const queryClient = new QueryClient();

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-8 w-8 rounded-lg gradient-primary mx-auto mb-3 animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CourseProvider>
          <ProgressProvider>
            <BrowserRouter>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected dashboard routes */}
                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/upgrade" element={<UpgradePage />} />
                    <Route path="/level/:levelId" element={<LevelPage />} />
                    <Route path="/course/:courseId" element={<CoursePage />} />
                    <Route path="/lesson/:lessonId" element={<LessonPage />} />
                    <Route path="/payment/:levelId" element={<MakePaymentPage />}/>

                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>}>
                      <Route index element={<ManageCourses />} />
                      <Route path="modules" element={<ManageModules />} />
                      <Route path="lessons" element={<ManageLessons />} />
                      <Route path="quizzes" element={<ManageQuizzes />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ProgressProvider>
        </CourseProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
