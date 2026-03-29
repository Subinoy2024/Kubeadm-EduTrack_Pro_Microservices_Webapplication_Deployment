import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Video, BookOpen, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    icon: MessageSquare,
    label: "Ask AI Tutor",
    href: "/student/chat",
    color: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    icon: Video,
    label: "Watch Recording",
    href: "/student/recordings",
    color: "bg-chart-5 text-primary-foreground hover:opacity-90",
  },
  {
    icon: BookOpen,
    label: "Study Materials",
    href: "/student/courses",
    color: "bg-chart-2 text-primary-foreground hover:opacity-90",
  },
  {
    icon: ClipboardList,
    label: "My Assignments",
    href: "/student/assignments",
    color: "bg-accent text-accent-foreground hover:bg-accent/90",
  },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link key={index} to={action.href}>
            <Button
              className={`w-full h-auto flex-col gap-2 py-4 ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
