import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCards } from "@/components/student/StatsCards";
import { ActivityTimeline } from "@/components/student/ActivityTimeline";
import { UpcomingAssignments } from "@/components/student/UpcomingAssignments";
import { ProgressChart } from "@/components/student/ProgressChart";
import { QuickActions } from "@/components/student/QuickActions";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Student";

  return (
    <DashboardLayout role="student" title="Dashboard">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Welcome Message */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold">Welcome back, {firstName}! 👋</h2>
          <p className="text-muted-foreground">Here's what's happening with your learning today.</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Progress & Assignments */}
          <div className="lg:col-span-2 space-y-6">
            <ProgressChart />
            <UpcomingAssignments />
          </div>

          {/* Right Column - Activity & Actions */}
          <div className="space-y-6">
            <QuickActions />
            <ActivityTimeline />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
