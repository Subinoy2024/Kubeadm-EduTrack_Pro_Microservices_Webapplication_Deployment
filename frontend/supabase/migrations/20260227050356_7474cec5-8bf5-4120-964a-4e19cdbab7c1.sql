
-- Update recordings policies to allow teachers too
DROP POLICY "Admins can insert recordings" ON public.recordings;
DROP POLICY "Admins can update recordings" ON public.recordings;
DROP POLICY "Admins can delete recordings" ON public.recordings;

CREATE POLICY "Admins and teachers can insert recordings" ON public.recordings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins and teachers can update recordings" ON public.recordings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins and teachers can delete recordings" ON public.recordings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- Update meetings policies to allow teachers too
DROP POLICY "Admins can insert meetings" ON public.meetings;
DROP POLICY "Admins can update meetings" ON public.meetings;
DROP POLICY "Admins can delete meetings" ON public.meetings;

CREATE POLICY "Admins and teachers can insert meetings" ON public.meetings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins and teachers can update meetings" ON public.meetings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admins and teachers can delete meetings" ON public.meetings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));
