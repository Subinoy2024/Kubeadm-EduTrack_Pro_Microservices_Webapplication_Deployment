import { motion } from "framer-motion";
import { BookOpen, ClipboardList, Clock, Trophy } from "lucide-react";

const stats = [
  {
    title: "Courses Enrolled",
    value: "0",
    change: "Enroll in courses to start",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Pending Assignments",
    value: "0",
    change: "No assignments yet",
    icon: ClipboardList,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Study Hours",
    value: "0h",
    change: "Start learning today",
    icon: Clock,
    color: "bg-success/10 text-success",
  },
  {
    title: "Average Score",
    value: "—",
    change: "Complete assignments to track",
    icon: Trophy,
    color: "bg-accent/10 text-accent",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="stat-card"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.title}</div>
          <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
        </motion.div>
      ))}
    </div>
  );
}
