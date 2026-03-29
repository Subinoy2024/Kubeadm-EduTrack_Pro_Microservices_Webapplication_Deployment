import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ClipboardList, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export function UpcomingAssignments() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upcoming Assignments</h3>
        <Link to="/student/assignments">
          <Button variant="ghost" size="sm">
            View All
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">No upcoming assignments</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Assignments from your courses will appear here</p>
      </div>
    </motion.div>
  );
}
