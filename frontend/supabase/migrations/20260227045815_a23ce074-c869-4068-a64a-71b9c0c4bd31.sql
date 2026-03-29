
-- Recordings table
CREATE TABLE public.recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  teacher text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  duration text NOT NULL,
  youtube_id text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view recordings
CREATE POLICY "Anyone can view recordings" ON public.recordings
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert recordings" ON public.recordings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update recordings" ON public.recordings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete recordings" ON public.recordings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Meetings table
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  teacher text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  duration text NOT NULL,
  meet_link text NOT NULL,
  students_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view meetings
CREATE POLICY "Anyone can view meetings" ON public.meetings
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert meetings" ON public.meetings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update meetings" ON public.meetings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete meetings" ON public.meetings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
