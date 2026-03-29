import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherStats } from "@/components/teacher/TeacherStats";
import { ClassOverview } from "@/components/teacher/ClassOverview";
import { RecentSubmissions } from "@/components/teacher/RecentSubmissions";
import { EngagementChart } from "@/components/teacher/EngagementChart";

export default function TeacherDashboard() {
  return (
    <DashboardLayout role="teacher" title="Teacher Dashboard">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Welcome Message */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold">Good morning, Ms. Anderson! 📚</h2>
          <p className="text-muted-foreground">Here's an overview of your classes today.</p>
        </div>

        {/* Stats Cards */}
        <TeacherStats />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <EngagementChart />
            <ClassOverview />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <RecentSubmissions />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
