import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

const submissions = [
  {
    id: 1,
    student: "Emma Wilson",
    initials: "EW",
    assignment: "Quadratic Equations",
    class: "Grade 10A",
    submittedAt: "10 min ago",
    status: "pending",
  },
  {
    id: 2,
    student: "James Chen",
    initials: "JC",
    assignment: "Linear Algebra Problem Set",
    class: "Grade 9B",
    submittedAt: "25 min ago",
    status: "pending",
  },
  {
    id: 3,
    student: "Sofia Rodriguez",
    initials: "SR",
    assignment: "Geometry Proofs",
    class: "Grade 10B",
    submittedAt: "1 hour ago",
    status: "pending",
  },
  {
    id: 4,
    student: "Liam Johnson",
    initials: "LJ",
    assignment: "Statistics Project",
    class: "Grade 9A",
    submittedAt: "2 hours ago",
    status: "graded",
    grade: "A-",
  },
  {
    id: 5,
    student: "Olivia Brown",
    initials: "OB",
    assignment: "Trigonometry Quiz",
    class: "Grade 10A",
    submittedAt: "3 hours ago",
    status: "graded",
    grade: "B+",
  },
];

export function RecentSubmissions() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {submission.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{submission.student}</p>
                {submission.status === "graded" ? (
                  <Badge className="bg-success/10 text-success border-0">
                    {submission.grade}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Review
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {submission.assignment}
              </p>
              <p className="text-xs text-muted-foreground">
                {submission.class} • {submission.submittedAt}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full mt-4">
        View All Submissions
      </Button>
    </motion.div>
  );
}
