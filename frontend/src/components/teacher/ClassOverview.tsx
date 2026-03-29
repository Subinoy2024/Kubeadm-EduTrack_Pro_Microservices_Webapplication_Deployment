import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const classes = [
  {
    id: 1,
    name: "Grade 9A - Mathematics",
    students: 32,
    nextClass: "Today, 10:00 AM",
    status: "upcoming",
    progress: 75,
  },
  {
    id: 2,
    name: "Grade 10B - Mathematics",
    students: 28,
    nextClass: "Today, 2:00 PM",
    status: "upcoming",
    progress: 82,
  },
  {
    id: 3,
    name: "Grade 9C - Mathematics",
    students: 30,
    nextClass: "Tomorrow, 9:00 AM",
    status: "scheduled",
    progress: 68,
  },
  {
    id: 4,
    name: "Grade 10A - Mathematics",
    students: 34,
    nextClass: "Tomorrow, 11:00 AM",
    status: "scheduled",
    progress: 71,
  },
];

export function ClassOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Classes</h3>
        <Link to="/teacher/classes">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{classItem.name}</h4>
                <Badge
                  variant="outline"
                  className={
                    classItem.status === "upcoming"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {classItem.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {classItem.students} students
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {classItem.nextClass}
                </span>
              </div>
              <div className="mt-2">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${classItem.progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {classItem.progress}% syllabus completed
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
