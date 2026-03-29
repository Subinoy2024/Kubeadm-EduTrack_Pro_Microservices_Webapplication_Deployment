import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AIChat from "./pages/AIChat";
import Recordings from "./pages/Recordings";
import Meetings from "./pages/Meetings";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminRecordings from "./pages/AdminRecordings";
import AdminMeetings from "./pages/AdminMeetings";
import AdminDocs from "./pages/AdminDocs";
import Class9Page from "./pages/Class9Page";
import Class10Page from "./pages/Class10Page";
import SubjectPage from "./pages/SubjectPage";
import FeaturesPage from "./pages/FeaturesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/class-9" element={<Class9Page />} />
            <Route path="/class-10" element={<Class10Page />} />
            <Route path="/subjects/:subject" element={<SubjectPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute requiredRole="student"><Courses /></ProtectedRoute>} />
            <Route path="/student/assignments" element={<ProtectedRoute requiredRole="student"><Assignments /></ProtectedRoute>} />
            <Route path="/student/chat" element={<ProtectedRoute requiredRole="student"><AIChat /></ProtectedRoute>} />
            <Route path="/student/recordings" element={<ProtectedRoute requiredRole="student"><Recordings /></ProtectedRoute>} />
            <Route path="/student/schedule" element={<ProtectedRoute requiredRole="student"><Meetings /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/recordings" element={<ProtectedRoute requiredRole="teacher"><AdminRecordings /></ProtectedRoute>} />
            <Route path="/teacher/meetings" element={<ProtectedRoute requiredRole="teacher"><AdminMeetings /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/recordings" element={<ProtectedRoute requiredRole="admin"><AdminRecordings /></ProtectedRoute>} />
            <Route path="/admin/meetings" element={<ProtectedRoute requiredRole="admin"><AdminMeetings /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><Courses /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/docs" element={<ProtectedRoute requiredRole="admin"><AdminDocs /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
