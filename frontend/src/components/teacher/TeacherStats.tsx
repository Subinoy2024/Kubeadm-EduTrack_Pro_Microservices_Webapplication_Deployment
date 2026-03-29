import { motion } from "framer-motion";
import { Users, ClipboardList, CheckCircle, AlertCircle } from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: "124",
    change: "4 classes",
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Active Assignments",
    value: "8",
    change: "3 due this week",
    icon: ClipboardList,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Graded Today",
    value: "15",
    change: "+8 from yesterday",
    icon: CheckCircle,
    color: "bg-success/10 text-success",
  },
  {
    title: "Pending Review",
    value: "23",
    change: "Need attention",
    icon: AlertCircle,
    color: "bg-destructive/10 text-destructive",
  },
];

export function TeacherStats() {
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
