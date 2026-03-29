import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const adminCards = [
  {
    title: "User Management",
    description: "Add, edit, and manage user accounts and roles",
    icon: Users,
    href: "/admin/users",
    color: "text-primary",
  },
  {
    title: "Courses",
    description: "Manage courses, subjects, and curriculum",
    icon: BookOpen,
    href: "/admin/courses",
    color: "text-accent-foreground",
  },
  {
    title: "Students",
    description: "View student progress and enrollment",
    icon: GraduationCap,
    href: "/admin/users",
    color: "text-success",
  },
  {
    title: "Security",
    description: "Review access logs and security settings",
    icon: Shield,
    href: "/admin/users",
    color: "text-destructive",
  },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard 🛡️</h2>
          <p className="text-muted-foreground">Manage your EduTrack Pro platform</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminCards.map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={card.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <h3 className="font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
