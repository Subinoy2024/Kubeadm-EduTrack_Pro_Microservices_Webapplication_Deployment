import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, Calendar, Users, ExternalLink, CalendarOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Meetings() {
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const liveMeeting = meetings.find((m) => m.status === "live");

  return (
    <DashboardLayout role="student" title="Live Meetings">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Live Sessions 📹</h2>
            <p className="text-muted-foreground">Join live classes and meetings with your teachers</p>
          </div>
        </div>

        {liveMeeting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-4 gradient-primary text-primary-foreground flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-primary-foreground animate-pulse" />
              <span className="font-semibold">Live Now: {liveMeeting.title}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(liveMeeting.meet_link, "_blank")}
            >
              Join Now
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-muted-foreground">No meetings scheduled</h3>
            <p className="text-sm text-muted-foreground/70">Meetings will appear here once scheduled by your admin.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {meetings.map((meeting, i) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                          meeting.status === "live" ? "bg-success/10" : "bg-primary/10"
                        }`}>
                          <Video className={`h-6 w-6 ${
                            meeting.status === "live" ? "text-success" : "text-primary"
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{meeting.title}</h3>
                            {meeting.status === "live" && (
                              <Badge className="bg-success text-success-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-success-foreground mr-1 animate-pulse" />
                                LIVE
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>{meeting.teacher}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {meeting.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {meeting.time} · {meeting.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {meeting.students_count} students
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={meeting.status === "live" ? "hero" : "outline"}
                        onClick={() => window.open(meeting.meet_link, "_blank")}
                      >
                        {meeting.status === "live" ? "Join Now" : "Join Meeting"}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
