import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const courses = [
  { id: "1", title: "Mathematics", teacher: "Ms. Anderson", progress: 72, students: 32, lessons: 24, color: "bg-primary/10 text-primary" },
  { id: "2", title: "Physics", teacher: "Mr. Sharma", progress: 58, students: 28, lessons: 20, color: "bg-accent/30 text-accent-foreground" },
  { id: "3", title: "Chemistry", teacher: "Dr. Patel", progress: 85, students: 25, lessons: 18, color: "bg-secondary text-secondary-foreground" },
  { id: "4", title: "English Literature", teacher: "Ms. Roberts", progress: 40, students: 30, lessons: 22, color: "bg-muted text-muted-foreground" },
];

export default function Courses() {
  return (
    <DashboardLayout role="student" title="My Courses">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Courses 📚</h2>
          <p className="text-muted-foreground">Track your enrolled courses and progress</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${course.color}`}>
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.teacher}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{course.progress}%</Badge>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.students} students</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.lessons} lessons</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
