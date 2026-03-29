import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Video } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminRecordings() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    teacher: "",
    duration: "",
    youtube_id: "",
  });

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

  const addMutation = useMutation({
    mutationFn: async () => {
      // Extract YouTube ID from URL or raw ID
      let ytId = form.youtube_id;
      const match = ytId.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) ytId = match[1];

      const { error } = await supabase.from("recordings").insert({
        title: form.title,
        subject: form.subject,
        teacher: form.teacher,
        duration: form.duration,
        youtube_id: ytId,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordings"] });
      setOpen(false);
      setForm({ title: "", subject: "", teacher: "", duration: "", youtube_id: "" });
      toast.success("Recording added successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recordings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordings"] });
      toast.success("Recording deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <DashboardLayout role={(role as "student" | "teacher" | "admin") ?? "admin"} title="Manage Recordings">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Manage Recordings 🎬</h2>
            <p className="text-muted-foreground">Add and manage YouTube class recordings</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recording
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Recording</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Introduction to Algebra" />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
                </div>
                <div>
                  <Label>Teacher</Label>
                  <Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} placeholder="e.g. Ms. Anderson" />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 45 min" />
                </div>
                <div>
                  <Label>YouTube URL or Video ID</Label>
                  <Input value={form.youtube_id} onChange={(e) => setForm({ ...form, youtube_id: e.target.value })} placeholder="e.g. https://youtube.com/watch?v=abc123" />
                </div>
                <Button
                  className="w-full"
                  onClick={() => addMutation.mutate()}
                  disabled={!form.title || !form.subject || !form.teacher || !form.duration || !form.youtube_id || addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Add Recording"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : recordings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recordings yet. Add your first one!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {recordings.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://img.youtube.com/vi/${rec.youtube_id}/default.jpg`}
                      alt={rec.title}
                      className="w-20 h-14 rounded object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{rec.subject}</Badge>
                        <span>{rec.teacher}</span>
                        <span>· {rec.duration}</span>
                        <span>· {rec.date}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(rec.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
