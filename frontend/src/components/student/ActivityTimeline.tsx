import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export function ActivityTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">No activity yet</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Your learning activity will be tracked here</p>
      </div>
    </motion.div>
  );
}
