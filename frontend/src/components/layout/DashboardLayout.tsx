import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "student" | "teacher" | "admin";
  title?: string;
}

export function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar role={role} />
      <div className="pl-64 transition-all duration-300">
        <DashboardHeader title={title} />
        <main className="p-6 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}
