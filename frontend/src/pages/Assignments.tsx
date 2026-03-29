import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar, Clock } from "lucide-react";

const assignments = [
  { id: "1", title: "Quadratic Equations Problem Set", subject: "Mathematics", due: "2026-03-01", status: "pending" as const, priority: "high" as const },
  { id: "2", title: "Newton's Laws Lab Report", subject: "Physics", due: "2026-03-03", status: "submitted" as const, priority: "medium" as const },
  { id: "3", title: "Chemical Bonding Worksheet", subject: "Chemistry", due: "2026-03-05", status: "pending" as const, priority: "low" as const },
  { id: "4", title: "Essay: Shakespeare's Themes", subject: "English", due: "2026-02-28", status: "graded" as const, priority: "high" as const },
  { id: "5", title: "Trigonometry Practice", subject: "Mathematics", due: "2026-03-07", status: "pending" as const, priority: "medium" as const },
];

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/30",
  submitted: "bg-primary/10 text-primary border-primary/30",
  graded: "bg-success/10 text-success border-success/30",
};

export default function Assignments() {
  return (
    <DashboardLayout role="student" title="Assignments">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Assignments 📝</h2>
          <p className="text-muted-foreground">View and manage your assignments</p>
        </div>

        <div className="space-y-4">
          {assignments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{a.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{a.subject}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due: {a.due}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[a.status]}>{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
