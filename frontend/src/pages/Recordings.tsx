import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Calendar, Search, VideoOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export default function Recordings() {
  const [search, setSearch] = useState("");

  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ["recordings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recordings")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = recordings.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.teacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="student" title="Recorded Classes">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Class Recordings 🎬</h2>
            <p className="text-muted-foreground">Watch recorded lectures from your courses</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading recordings...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <VideoOff className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-muted-foreground">No recordings yet</h3>
            <p className="text-sm text-muted-foreground/70">Recorded classes will appear here once added by your admin.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={`https://img.youtube.com/vi/${rec.youtube_id}/mqdefault.jpg`}
                      alt={rec.title}
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={`https://www.youtube.com/watch?v=${rec.youtube_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Button size="lg" className="rounded-full h-14 w-14">
                        <Play className="h-6 w-6" />
                      </Button>
                    </a>
                    <Badge className="absolute top-3 right-3 bg-background/80 text-foreground backdrop-blur">
                      <Clock className="h-3 w-3 mr-1" />
                      {rec.duration}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{rec.subject}</Badge>
                    </div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{rec.teacher}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rec.date}
                      </span>
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
