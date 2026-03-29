import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CalendarOff } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminMeetings() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    teacher: "",
    date: "",
    time: "",
    duration: "",
    meet_link: "",
    students_count: "0",
    status: "upcoming",
  });

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

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("meetings").insert({
        title: form.title,
        teacher: form.teacher,
        date: form.date,
        time: form.time,
        duration: form.duration,
        meet_link: form.meet_link,
        students_count: parseInt(form.students_count) || 0,
        status: form.status,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setOpen(false);
      setForm({ title: "", teacher: "", date: "", time: "", duration: "", meet_link: "", students_count: "0", status: "upcoming" });
      toast.success("Meeting added successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <DashboardLayout role={(role as "student" | "teacher" | "admin") ?? "admin"} title="Manage Meetings">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Manage Meetings 📹</h2>
            <p className="text-muted-foreground">Schedule and manage live meeting sessions</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Physics Live Session" />
                </div>
                <div>
                  <Label>Teacher</Label>
                  <Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} placeholder="e.g. Mr. Sharma" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 10:00 AM" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Duration</Label>
                    <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 60 min" />
                  </div>
                  <div>
                    <Label>Expected Students</Label>
                    <Input type="number" value={form.students_count} onChange={(e) => setForm({ ...form, students_count: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Meeting Link</Label>
                  <Input value={form.meet_link} onChange={(e) => setForm({ ...form, meet_link: e.target.value })} placeholder="e.g. https://meet.google.com/abc-def-ghi" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => addMutation.mutate()}
                  disabled={!form.title || !form.teacher || !form.date || !form.time || !form.duration || !form.meet_link || addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Schedule Meeting"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No meetings yet. Schedule your first one!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {meetings.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{m.title}</h4>
                      <Badge variant={m.status === "live" ? "default" : "secondary"} className="text-xs">
                        {m.status === "live" ? "LIVE" : "Upcoming"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {m.teacher} · {m.date} · {m.time} · {m.duration} · {m.students_count} students
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(m.id)}
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
